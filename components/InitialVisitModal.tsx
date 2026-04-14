"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code, Coffee, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

const InitialVisitModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSidePopup, setShowSidePopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show modal on every reload after a small delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Show side popup when main modal is closed
    setShowSidePopup(true);
  };

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            >
              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-br from-shop_light_bg via-shop_light_pink to-shop_light_green/30" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-shop_light_green/20 rounded-full blur-3xl" />
              <div className="absolute top-20 -left-10 w-32 h-32 bg-shop_orange/10 rounded-full blur-2xl" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-dark-color hover:text-shop_dark_green transition-colors z-10 backdrop-blur-sm shadow-sm"
              >
                <X size={20} />
              </button>

              {/* Content */}
              <div className="relative pt-8 px-8 pb-8 flex flex-col items-center text-center">
                {/* Icon / Logo Area */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 transform rotate-3 border border-shop_light_green/10"
                >
                  <div className="w-16 h-16 bg-linear-to-br from-shop_dark_green to-shop_light_green rounded-xl flex items-center justify-center text-white">
                    <Code size={32} />
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold text-dark-color mb-3"
                >
                  Start Your Project Today!
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-light-color mb-8 text-base leading-relaxed"
                >
                  Launch your business or hobby project with our premium source
                  code. Get lifetime updates and full access to the codebase.
                </motion.p>

                {/* Features List */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full grid grid-cols-2 gap-3 mb-8"
                >
                  {[
                    "Premium Design",
                    "Full Source Code",
                    "Lifetime Updates",
                    "Easy Customization",
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-shop_light_bg/50 p-2.5 rounded-lg"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-shop_dark_green" />
                      <span className="text-sm font-medium text-dark-color/80">
                        {item}
                      </span>
                    </div>
                  ))}
                </motion.div>

                {/* Action Button */}
                <Link
                  href="https://buymeacoffee.com/reactbd/extras"
                  className="w-full"
                >
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full py-4 px-6 bg-linear-to-r from-shop_dark_green to-shop_light_green hover:from-shop_btn_dark_green hover:to-shop_dark_green text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <Coffee className="w-5 h-5" />
                    <span>Get Source Code</span>
                    <ExternalLink className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4"
                >
                  <button
                    onClick={handleClose}
                    className="text-sm text-light-color hover:text-shop_dark_green underline decoration-dashed underline-offset-4"
                  >
                    No thanks, maybe later
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Side Popup */}
      <AnimatePresence>
        {showSidePopup && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-20 right-4 z-50 max-w-sm w-auto"
          >
            <div className="relative bg-white p-4 rounded-xl shadow-2xl border border-shop_light_green/20 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              {/* Close Button for popup */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSidePopup(false);
                }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-dark-color bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>

              <Link
                href="https://shopcart.reactbd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 pr-6" // Added padding-right for close button space
              >
                <div className="w-12 h-12 bg-linear-to-br from-shop_dark_green to-shop_light_green rounded-lg flex items-center justify-center text-white shadow-lg shrink-0">
                  <Code size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-dark-color text-sm">
                    View ShopCart v1
                  </h3>
                  <p className="text-xs text-light-color mt-0.5">
                    Check out the previous version
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-shop_dark_green -ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InitialVisitModal;
