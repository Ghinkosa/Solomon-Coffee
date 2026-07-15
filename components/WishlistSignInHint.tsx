"use client";

import { SignedOut } from "@clerk/nextjs";
import useCartStore from "@/store";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

/**
 * Soft CTA for guests: list is device-local until they create an account.
 */
export default function WishlistSignInHint() {
  const { openAuthSidebar } = useCartStore();
  const dictionary = useDictionary();

  return (
    <SignedOut>
      <p className="max-w-sm text-sm text-muted-foreground sm:text-end">
        {t(
          dictionary,
          "wishlist.guestHint",
          "Saved on this device only.",
        )}{" "}
        <button
          type="button"
          onClick={() => openAuthSidebar("signIn")}
          className="font-medium text-shop_dark_green underline-offset-2 hover:underline"
        >
          {t(dictionary, "wishlist.guestSignIn", "Sign in")}
        </button>{" "}
        {t(
          dictionary,
          "wishlist.guestHintSuffix",
          "to keep favorites across devices.",
        )}
      </p>
    </SignedOut>
  );
}
