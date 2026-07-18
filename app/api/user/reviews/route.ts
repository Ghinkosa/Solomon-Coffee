import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getSanityAuthErrorMessage,
  readClient,
  writeClient,
} from "@/sanity/lib/client";

function purchasedProductQuery() {
  // Orders store clerkUserId (not a user reference). Count paid, non-cancelled
  // orders that include the product as a verified-purchase signal.
  return `count(*[
    _type == "order"
    && clerkUserId == $clerkUserId
    && paymentStatus == "paid"
    && status != "cancelled"
    && $productId in products[].product._ref
  ]) > 0`;
}

// GET - Get reviews for a specific product (+ current user's pending review)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const { userId } = await auth();

    const reviews = await writeClient.fetch(
      `*[_type == "review" && product._ref == $productId && status == "approved"] | order(createdAt desc) {
        _id,
        rating,
        title,
        content,
        helpful,
        isVerifiedPurchase,
        createdAt,
        user-> {
          _id,
          firstName,
          lastName,
          profileImage {
            asset-> {
              url
            }
          }
        }
      }`,
      { productId },
    );

    let myReview: {
      _id: string;
      rating: number;
      title: string;
      content: string;
      status: string;
      createdAt: string;
    } | null = null;

    if (userId) {
      myReview = await writeClient.fetch(
        `*[_type == "review" && product._ref == $productId && user->clerkUserId == $clerkUserId][0]{
          _id,
          rating,
          title,
          content,
          status,
          createdAt
        }`,
        { productId, clerkUserId: userId },
      );
    }

    return NextResponse.json(
      !reviews || reviews.length === 0
        ? {
            reviews: [],
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: {
              fiveStars: 0,
              fourStars: 0,
              threeStars: 0,
              twoStars: 0,
              oneStar: 0,
            },
            myReview,
          }
        : (() => {
            const totalReviews = reviews.length;
            const totalRating = reviews.reduce(
              (sum: number, review: { rating: number }) => sum + review.rating,
              0,
            );
            const averageRating = totalRating / totalReviews;
            return {
              reviews,
              averageRating: parseFloat(averageRating.toFixed(1)),
              totalReviews,
              ratingDistribution: {
                fiveStars: reviews.filter((r: { rating: number }) => r.rating === 5)
                  .length,
                fourStars: reviews.filter((r: { rating: number }) => r.rating === 4)
                  .length,
                threeStars: reviews.filter((r: { rating: number }) => r.rating === 3)
                  .length,
                twoStars: reviews.filter((r: { rating: number }) => r.rating === 2)
                  .length,
                oneStar: reviews.filter((r: { rating: number }) => r.rating === 1)
                  .length,
              },
              myReview,
            };
          })(),
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

// POST - Submit a new review
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!process.env.SANITY_API_TOKEN?.trim()) {
      return NextResponse.json(
        {
          error:
            "Review storage is not configured. Missing SANITY_API_TOKEN on the server.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { productId, rating, title, content } = body;

    if (!productId || rating == null || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const ratingNumber = Number(rating);
    if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      return NextResponse.json(
        { error: "Rating must be a whole number between 1 and 5" },
        { status: 400 },
      );
    }

    const trimmedTitle = String(title).trim();
    const trimmedContent = String(content).trim();

    if (trimmedTitle.length < 5 || trimmedTitle.length > 100) {
      return NextResponse.json(
        { error: "Title must be between 5 and 100 characters" },
        { status: 400 },
      );
    }

    if (trimmedContent.length < 20 || trimmedContent.length > 1000) {
      return NextResponse.json(
        { error: "Content must be between 20 and 1000 characters" },
        { status: 400 },
      );
    }

    const sanityUser = await writeClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{
        _id,
        firstName,
        lastName
      }`,
      { clerkUserId: userId },
    );

    if (!sanityUser) {
      return NextResponse.json(
        {
          error:
            "Your store profile was not found. Open your account dashboard once, then try again.",
        },
        { status: 404 },
      );
    }

    const existingReview = await writeClient.fetch(
      `*[_type == "review" && user._ref == $userId && product._ref == $productId][0]{
        _id,
        status
      }`,
      { userId: sanityUser._id, productId },
    );

    if (existingReview) {
      return NextResponse.json(
        {
          error:
            existingReview.status === "pending"
              ? "You already submitted a review for this product. It is waiting for admin approval."
              : "You have already reviewed this product",
          reviewId: existingReview._id,
          status: existingReview.status,
        },
        { status: 400 },
      );
    }

    const hasPurchased = await writeClient.fetch(purchasedProductQuery(), {
      clerkUserId: userId,
      productId,
    });

    const review = await writeClient.create({
      _type: "review",
      product: {
        _type: "reference",
        _ref: productId,
      },
      user: {
        _type: "reference",
        _ref: sanityUser._id,
      },
      rating: ratingNumber,
      title: trimmedTitle,
      content: trimmedContent,
      isVerifiedPurchase: Boolean(hasPurchased),
      status: "pending",
      helpful: 0,
      helpfulBy: [],
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message:
        "Thank you for your review! It will appear on the product page after admin approval.",
      reviewId: review._id,
      status: "pending",
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    const sanityAuthError = getSanityAuthErrorMessage(error);
    return NextResponse.json(
      {
        error:
          sanityAuthError ||
          (error instanceof Error ? error.message : "Failed to submit review"),
      },
      { status: sanityAuthError ? 503 : 500 },
    );
  }
}

// PATCH - Mark review as helpful
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 },
      );
    }

    const sanityUser = await writeClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{
        _id
      }`,
      { clerkUserId: userId },
    );

    if (!sanityUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const review = await writeClient.fetch(
      `*[_type == "review" && _id == $reviewId][0]{
        _id,
        helpful,
        "helpfulByIds": helpfulBy[]._ref
      }`,
      { reviewId },
    );

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const alreadyMarked = review.helpfulByIds?.includes(sanityUser._id);

    if (alreadyMarked) {
      await writeClient
        .patch(reviewId)
        .set({
          helpful: Math.max(0, (review.helpful || 0) - 1),
        })
        .unset([`helpfulBy[_ref == "${sanityUser._id}"]`])
        .commit();

      return NextResponse.json({
        success: true,
        message: "Review unmarked as helpful",
      });
    }

    await writeClient
      .patch(reviewId)
      .set({
        helpful: (review.helpful || 0) + 1,
      })
      .setIfMissing({ helpfulBy: [] })
      .append("helpfulBy", [
        {
          _type: "reference",
          _ref: sanityUser._id,
          _key: sanityUser._id,
        },
      ])
      .commit();

    return NextResponse.json({
      success: true,
      message: "Review marked as helpful",
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 },
    );
  }
}
