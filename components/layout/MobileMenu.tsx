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
      <button onClick={toggleSidebar}>
        <AlignLeft className="w-6 h-6 hover:text-hoverColor hoverEffect md:hidden" />
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
