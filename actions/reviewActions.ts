"use server";

import { readClient, writeClient } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import { invalidateProductReviews } from "@/lib/cache";

// Types for review actions
interface SubmitReviewData {
  productId: string;
  rating: number;
  title: string;
  content: string;
}

interface ReviewResponse {
  success: boolean;
  message: string;
  reviewId?: string;
  error?: string;
}

interface ProductReviewsData {
  reviews: Array<{
    _id: string;
    rating: number;
    title: string;
    content: string;
    helpful: number;
    isVerifiedPurchase: boolean;
    createdAt: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      profileImage?: {
        asset: {
          url: string;
        };
      };
    };
  }>;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
}

const purchasedProductQuery = `count(*[
  _type == "order"
  && clerkUserId == $clerkUserId
  && paymentStatus == "paid"
  && status != "cancelled"
  && $productId in products[].product._ref
]) > 0`;

// Submit a new review
export async function submitReview(
  data: SubmitReviewData,
): Promise<ReviewResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to submit a review",
      };
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
      return {
        success: false,
        message: "User not found",
      };
    }

    const existingReview = await writeClient.fetch(
      `*[_type == "review" && user._ref == $userId && product._ref == $productId][0]`,
      { userId: sanityUser._id, productId: data.productId },
    );

    if (existingReview) {
      return {
        success: false,
        message: "You have already reviewed this product",
      };
    }

    const hasPurchased = await writeClient.fetch(purchasedProductQuery, {
      clerkUserId: userId,
      productId: data.productId,
    });

    const review = await writeClient.create({
      _type: "review",
      product: {
        _type: "reference",
        _ref: data.productId,
      },
      user: {
        _type: "reference",
        _ref: sanityUser._id,
      },
      rating: data.rating,
      title: data.title,
      content: data.content,
      isVerifiedPurchase: Boolean(hasPurchased),
      status: "pending",
      helpful: 0,
      helpfulBy: [],
      createdAt: new Date().toISOString(),
    });

    await invalidateProductReviews(data.productId);

    return {
      success: true,
      message:
        "Thank you for your review! It will be published after admin approval.",
      reviewId: review._id,
    };
  } catch (error) {
    console.error("Error submitting review:", error);
    return {
      success: false,
      message: "Failed to submit review. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get reviews for a product
export async function getProductReviews(
  productId: string,
): Promise<ProductReviewsData | null> {
  try {
    const reviews = await readClient.fetch(
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

    if (!reviews || reviews.length === 0) {
      return {
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
      };
    }

    const totalReviews = reviews.length;
    const totalRating = reviews.reduce(
      (sum: number, review: { rating: number }) => sum + review.rating,
      0,
    );
    const averageRating = totalRating / totalReviews;

    const ratingDistribution = {
      fiveStars: reviews.filter((r: { rating: number }) => r.rating === 5)
        .length,
      fourStars: reviews.filter((r: { rating: number }) => r.rating === 4)
        .length,
      threeStars: reviews.filter((r: { rating: number }) => r.rating === 3)
        .length,
      twoStars: reviews.filter((r: { rating: number }) => r.rating === 2)
        .length,
      oneStar: reviews.filter((r: { rating: number }) => r.rating === 1).length,
    };

    await writeClient
      .patch(productId)
      .set({
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
        ratingDistribution,
      })
      .commit();

    return {
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
      ratingDistribution,
    };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return null;
  }
}

// Mark a review as helpful
export async function markReviewHelpful(
  reviewId: string,
): Promise<ReviewResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to mark reviews as helpful",
      };
    }

    const sanityUser = await writeClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{
        _id
      }`,
      { clerkUserId: userId },
    );

    if (!sanityUser) {
      return {
        success: false,
        message: "User not found",
      };
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
      return {
        success: false,
        message: "Review not found",
      };
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

      return {
        success: true,
        message: "Review unmarked as helpful",
      };
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

    return {
      success: true,
      message: "Review marked as helpful",
    };
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return {
      success: false,
      message: "Failed to mark review as helpful",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Check if user can review a product
export async function canUserReviewProduct(productId: string): Promise<{
  canReview: boolean;
  hasAlreadyReviewed: boolean;
  hasPurchased: boolean;
  reviewStatus: "pending" | "approved" | "rejected" | null;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        canReview: false,
        hasAlreadyReviewed: false,
        hasPurchased: false,
        reviewStatus: null,
      };
    }

    const sanityUser = await readClient.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{
        _id
      }`,
      { clerkUserId: userId },
    );

    if (!sanityUser) {
      return {
        canReview: false,
        hasAlreadyReviewed: false,
        hasPurchased: false,
        reviewStatus: null,
      };
    }

    const existingReview = await readClient.fetch(
      `*[_type == "review" && user._ref == $userId && product._ref == $productId][0]{ status }`,
      { userId: sanityUser._id, productId },
    );

    const hasPurchased = await readClient.fetch(purchasedProductQuery, {
      clerkUserId: userId,
      productId,
    });

    const reviewStatus =
      existingReview?.status === "pending" ||
      existingReview?.status === "approved" ||
      existingReview?.status === "rejected"
        ? existingReview.status
        : null;

    return {
      canReview: !existingReview,
      hasAlreadyReviewed: Boolean(existingReview),
      hasPurchased: Boolean(hasPurchased),
      reviewStatus,
    };
  } catch (error) {
    console.error("Error checking if user can review product:", error);
    return {
      canReview: false,
      hasAlreadyReviewed: false,
      hasPurchased: false,
      reviewStatus: null,
    };
  }
}

// Admin: Approve a review
export async function approveReview(
  reviewId: string,
  adminEmail: string,
): Promise<ReviewResponse> {
  try {
    await writeClient
      .patch(reviewId)
      .set({
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: adminEmail,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    const review = await writeClient.fetch(
      `*[_type == "review" && _id == $reviewId][0]{
        product-> {
          _id
        }
      }`,
      { reviewId },
    );

    if (review?.product?._id) {
      await getProductReviews(review.product._id);
    }

    return {
      success: true,
      message: "Review approved successfully",
    };
  } catch (error) {
    console.error("Error approving review:", error);
    return {
      success: false,
      message: "Failed to approve review",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Admin: Reject a review
export async function rejectReview(
  reviewId: string,
  adminNotes?: string,
): Promise<ReviewResponse> {
  try {
    await writeClient
      .patch(reviewId)
      .set({
        status: "rejected",
        updatedAt: new Date().toISOString(),
        ...(adminNotes && { adminNotes }),
      })
      .commit();

    return {
      success: true,
      message: "Review rejected successfully",
    };
  } catch (error) {
    console.error("Error rejecting review:", error);
    return {
      success: false,
      message: "Failed to reject review",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get pending reviews for admin
export async function getPendingReviews() {
  try {
    const reviews = await writeClient.fetch(
      `*[_type == "review" && status == "pending"] | order(createdAt desc) {
        _id,
        rating,
        title,
        content,
        isVerifiedPurchase,
        createdAt,
        user-> {
          _id,
          firstName,
          lastName,
          email,
          profileImage {
            asset-> {
              url
            }
          }
        },
        product-> {
          _id,
          name,
          slug
        }
      }`,
    );

    return reviews;
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    return [];
  }
}
