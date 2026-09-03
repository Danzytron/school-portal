"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { capitalize } from "@/lib/utils";

export function Breadcrumb() {
  const pathname = usePathname();
  
  if (!pathname || pathname === "/") return null;

  const paths = pathname.split("/").filter(p => p);
  
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 bg-white px-3.5 py-2 border border-slate-200/90 rounded-md shadow-2xs mb-5">
      <Link href="/" className="hover:text-[#1D4ED8] flex items-center gap-1.5 transition-colors font-medium">
        <Home size={13} className="text-slate-400" />
        <span>CEC Portal</span>
      </Link>
      
      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;
        const formatted = capitalize(path.replace(/-/g, " "));
        
        return (
          <div key={path} className="flex items-center">
            <ChevronRight size={12} className="mx-1.5 text-slate-300" />
            {isLast ? (
              <span className="text-slate-900 font-semibold">{formatted}</span>
            ) : (
              <Link href={href} className="hover:text-[#1D4ED8] transition-colors">
                {formatted}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
