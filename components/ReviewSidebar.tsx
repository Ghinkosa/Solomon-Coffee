"use client";

import React, { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarIcon, Loader2, Star, CheckCircle2 } from "lucide-react";
import { submitReviewAPI } from "@/lib/reviewAPI";
import { toast } from "sonner";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

interface ReviewSidebarProps {
  productId: string;
  productName: string;
  isVerifiedPurchase?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

const ReviewSidebar = React.memo(
  ({
    productId,
    productName,
    isVerifiedPurchase,
    isOpen,
    onClose,
    onReviewSubmitted,
  }: ReviewSidebarProps) => {
    const dictionary = useDictionary();
    const s = (path: string, fallback: string) =>
      t(dictionary, `product.reviews.sidebar.${path}`, fallback);

    const guidelines = (() => {
      const segments = "product.reviews.sidebar.guidelines".split(".");
      let node: unknown = dictionary;
      for (const seg of segments) {
        if (!node || typeof node !== "object") return [];
        node = (node as Record<string, unknown>)[seg];
      }
      return Array.isArray(node)
        ? node.filter((item): item is string => typeof item === "string")
        : [
            "Be honest and constructive in your feedback",
            "Focus on your experience with the product",
            "Your review will be published after admin approval",
            "Avoid offensive language or personal attacks",
          ];
    })();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = useCallback(() => {
      setRating(0);
      setHoverRating(0);
      setTitle("");
      setContent("");
    }, []);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
          toast.error(s("toasts.selectRating", "Please select a rating"));
          return;
        }

        if (title.trim().length < 5) {
          toast.error(
            s("toasts.titleMin", "Title must be at least 5 characters")
          );
          return;
        }

        if (content.trim().length < 20) {
          toast.error(
            s("toasts.reviewMin", "Review must be at least 20 characters")
          );
          return;
        }

        setIsSubmitting(true);

        try {
          const result = await submitReviewAPI({
            productId,
            rating,
            title: title.trim(),
            content: content.trim(),
          });

          if (result.success) {
            toast.success(result.message);
            resetForm();
            onClose();
            if (onReviewSubmitted) {
              onReviewSubmitted();
            }
          } else {
            toast.error(result.message);
          }
        } catch (error) {
          toast.error(
            s("toasts.submitFailed", "Failed to submit review. Please try again.")
          );
          console.error("Error submitting review:", error);
        } finally {
          setIsSubmitting(false);
        }
      },
      [rating, title, content, productId, onClose, onReviewSubmitted, resetForm, dictionary]
    );

    const handleRatingClick = useCallback((value: number) => {
      setRating(value);
    }, []);

    const handleRatingHover = useCallback((value: number) => {
      setHoverRating(value);
    }, []);

    const handleRatingLeave = useCallback(() => {
      setHoverRating(0);
    }, []);

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!open && !isSubmitting) {
          onClose();
          setTimeout(resetForm, 300);
        }
      },
      [isSubmitting, onClose, resetForm]
    );

    const titleLength = title.length;
    const contentLength = content.length;
    const isTitleValid = titleLength >= 5;
    const isContentValid = contentLength >= 20;

    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-shop_dark_green">
              <Star className="w-5 h-5" />
              {s("title", "Write a Review")}
            </SheetTitle>
            <SheetDescription className="text-left">
              {s("description", "Share your experience with {product}").replace(
                "{product}",
                productName
              )}
            </SheetDescription>
            {isVerifiedPurchase && (
              <div className="bg-shop_light_green/10 border border-shop_light_green/25 rounded-md p-3 mt-2">
                <p className="text-sm text-shop_dark_green font-medium inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-shop_light_green shrink-0" />
                  {s(
                    "verifiedNotice",
                    "This will be marked as a verified purchase"
                  )}
                </p>
              </div>
            )}
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col h-[calc(100vh-180px)] mt-6"
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-4">
              <div className="space-y-3">
                <Label
                  htmlFor="rating"
                  className="text-base font-semibold text-shop_dark_green"
                >
                  {s("yourRating", "Your Rating")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRatingClick(value)}
                        onMouseEnter={() => handleRatingHover(value)}
                        onMouseLeave={handleRatingLeave}
                        className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-shop_light_green focus:ring-offset-2 rounded"
                        aria-label={s("rateStarsAria", "Rate {count} stars").replace(
                          "{count}",
                          String(value)
                        )}
                        disabled={isSubmitting}
                      >
                        <StarIcon
                          size={40}
                          className={`${
                            value <= (hoverRating || rating)
                              ? "text-shop_light_green fill-shop_light_green"
                              : "text-gray-300"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-shop_light_green transition-all duration-300"
                          style={{ width: `${(rating / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-shop_dark_green min-w-[80px]">
                        {rating}{" "}
                        {rating === 1
                          ? s("star", "star")
                          : s("stars", "stars")}
                      </span>
                    </div>
                  )}
                  {rating === 0 && (
                    <p className="text-sm text-gray-500">
                      {s("clickToRate", "Click to rate this product")}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-base font-semibold text-shop_dark_green"
                >
                  {s("reviewTitle", "Review Title")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder={s(
                    "titlePlaceholder",
                    "Sum up your experience in a few words"
                  )}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                  disabled={isSubmitting}
                  className={`border-gray-300 focus:border-shop_light_green ${
                    titleLength > 0 && !isTitleValid ? "border-red-300" : ""
                  }`}
                />
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs ${
                      titleLength > 0 && !isTitleValid
                        ? "text-red-500"
                        : titleLength >= 5
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {titleLength < 5
                      ? s("titleCharsNeeded", "{count} more characters needed").replace(
                          "{count}",
                          String(5 - titleLength)
                        )
                      : (
                        <span className="inline-flex items-center gap-1 text-shop_light_green">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {s("titleGood", "Title looks good")}
                        </span>
                      )}
                  </p>
                  <p className="text-xs text-gray-500">{titleLength}/100</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="content"
                  className="text-base font-semibold text-shop_dark_green"
                >
                  {s("yourReview", "Your Review")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder={s(
                    "contentPlaceholder",
                    "Tell us more about your experience with this product..."
                  )}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={1000}
                  rows={8}
                  required
                  disabled={isSubmitting}
                  className={`border-gray-300 focus:border-shop_light_green resize-none ${
                    contentLength > 0 && !isContentValid ? "border-red-300" : ""
                  }`}
                />
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs ${
                      contentLength > 0 && !isContentValid
                        ? "text-red-500"
                        : contentLength >= 20
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {contentLength < 20
                      ? s(
                          "contentCharsNeeded",
                          "{count} more characters needed"
                        ).replace("{count}", String(20 - contentLength))
                      : (
                        <span className="inline-flex items-center gap-1 text-shop_light_green">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {s("contentGood", "Review is detailed enough")}
                        </span>
                      )}
                  </p>
                  <p className="text-xs text-gray-500">{contentLength}/1000</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
                <h4 className="text-sm font-semibold text-blue-900">
                  {s("guidelinesTitle", "Review Guidelines")}
                </h4>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  {guidelines.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <SheetFooter className="mt-6 pt-6 border-t flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {s("cancel", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    rating === 0 ||
                    !isTitleValid ||
                    !isContentValid
                  }
                  className="w-full sm:flex-1 bg-shop_dark_green hover:bg-shop_light_green text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {s("submitting", "Submitting...")}
                    </>
                  ) : (
                    s("submitReview", "Submit Review")
                  )}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    );
  }
);

ReviewSidebar.displayName = "ReviewSidebar";

export default ReviewSidebar;
