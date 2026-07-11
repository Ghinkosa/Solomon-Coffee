"use client";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/useLocale";
import { motion } from "motion/react";
import { emptyCart } from "@/images";
import Image from "next/image";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

export default function EmptyCart() {
  const toLocalizedPath = useLocalizedPath();
  const dictionary = useDictionary();
  const empty = (dictionary.cart as { empty?: Record<string, string> })?.empty;

  return (
    <div className="py-10 md:py-20 bg-linear-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full space-y-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut",
          }}
          className="relative w-48 h-48 mx-auto"
        >
          <Image
            src={emptyCart}
            alt={empty?.imageAlt ?? t(dictionary, "cart.empty.imageAlt", "Empty shopping cart")}
            fill
            className="object-contain drop-shadow-lg"
          />
          <motion.div
            animate={{
              x: [0, -10, 10, 0],
              y: [0, -5, 5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "linear",
            }}
            className="absolute -top-4 -right-4 bg-blue-500 rounded-full p-2"
          >
            <ShoppingCart size={24} className="text-white" />
          </motion.div>
        </motion.div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">
            {empty?.title ?? t(dictionary, "cart.empty.title", "Your cart is feeling lonely")}
          </h2>
          <p className="text-gray-600">
            {empty?.description ??
              t(
                dictionary,
                "cart.empty.description",
                "It looks like you haven't added anything to your cart yet.",
              )}
          </p>
        </div>

        <div>
          <Link
            href={toLocalizedPath("/shop")}
            className="block bg-dark-color/5 border border-dark-color/20 text-center py-2.5 rounded-full text-sm font-semibold tracking-wide hover:border-dark-color hover:bg-dark-color hover:text-white hoverEffect"
          >
            {empty?.cta ?? t(dictionary, "cart.empty.cta", "Discover Products")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
