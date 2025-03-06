import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { navItems } from "@/utils/constant";

export const useActiveLink = () => {
  const [activeItem, setActiveItem] = useState<string>("PLAYGROUND");
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const currentItem = navItems.find((item) => item.href === url);
      if (currentItem) {
        setActiveItem(currentItem.name);
      }
    };

    handleRouteChange(pathname); 
  }, [pathname]); 

  return { activeItem };
};
