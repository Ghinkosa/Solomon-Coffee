"use client";

import Logo from "./common/Logo";
import { motion } from "motion/react";
import { useParams } from "next/navigation";

const Loading = ({ dictionary }: { dictionary?: any }) => {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-shop_light_bg">
      <motion.div
        className="flex flex-col items-center gap-5 px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center gap-4"
        >
          <Logo lang={lang} logoText={dictionary?.logo} showText={false} />
          <div className="space-y-1">
            <p className="font-serif text-2xl font-bold tracking-tight text-shop_dark_green sm:text-3xl">
              {dictionary?.logo?.first || "Sheba"}{" "}
              <span className="text-shop_orange">
                {dictionary?.logo?.second || "Cup Coffee"}
              </span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;
