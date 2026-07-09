"use client";

import { AlignLeft } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

interface MobileMenuProps {
  lang: string;
  dictionary: any;
}

import { AnimatePresence } from "motion/react";

const MobileMenu = ({ lang, dictionary }: MobileMenuProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <>
        <button
          onClick={toggleSidebar}
          aria-label="Open menu"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-shop_dark_green transition-colors hover:text-shop_light_green lg:hidden"
        >
          <AlignLeft className="h-5 w-5" />
        </button>
      <div className="md:hidden">
        <AnimatePresence>
          {isSidebarOpen && (
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              lang={lang}
              logoText={dictionary.logo}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default MobileMenu;
