"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useActiveLink } from "../hooks/useActiveLink";
import { navItems } from "@/utils/constant";
import { useRouter, usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import AcademiaModal from './AcademiaModal';

const Navbar: React.FC = () => {
  const { isConnected } = useAccount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAcademiaModalOpen, setAcademiaModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { activeItem } = useActiveLink();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useAppKit();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Trigger login automatically if not logged in
  useEffect(() => {
    if (!isConnected) {
      open();
    }
  }, [isConnected, open]);

  // Redirect if already logged in
  useEffect(() => {
    if (isConnected && (pathname === "/" || pathname === "/playground")) {
      router.push("/playground/record");
    }
  }, [isConnected, pathname, router]);

  // Set active tab based on modal open state
  useEffect(() => {
    if (isAcademiaModalOpen) {
      setActiveTab('Academia');
    } else if (activeItem) {
      setActiveTab(activeItem);
    }
  }, [isAcademiaModalOpen, activeItem]);

  return (
    <header className="w-full">
      <nav className="bg-black text-white px-4 py-4 sm:px-8 sm:py-4 flex justify-between items-center border-b-1 border-b-white/50 relative">
        <div className="text-lg">causality.network</div>

        {/* Hamburger Button */}
        <button
          className="block sm:hidden text-white focus:outline-none relative z-30"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>

        {/* Navigation Items */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-75 z-20 transition-transform transform ${
            isMenuOpen ? "translate-x-0 pt-20" : "translate-x-full"
          } sm:relative sm:translate-x-0 sm:bg-transparent sm:flex sm:items-center sm:space-x-8 text-sm p-4 sm:p-0 space-y-4 sm:space-y-0`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-8">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`hover:text-primary py-2 transition-colors ${
                  activeTab === item.name ? "text-primary" : ""
                }`}
                onClick={() => {
                  closeMenu();
                  setActiveTab(item.name);
                }}
              >
                {item.name}
              </Link>
            ))}     
            <div 
              className={`nav-item cursor-pointer hover:text-primary py-2 transition-colors ${
                activeTab === 'Academia' ? "text-primary" : ""
              }`}
              onClick={() => {
                setAcademiaModalOpen(true);
                setActiveTab('Academia');
              }}
            >
              ACADEMIA
            </div>
            <w3m-button />
          </div>
        </div>
      </nav>
      {/* Render Academia Modal */}
      {isAcademiaModalOpen && (
        <AcademiaModal onClose={() => setAcademiaModalOpen(false)} />
      )}
    </header>
  );
};

export default Navbar;