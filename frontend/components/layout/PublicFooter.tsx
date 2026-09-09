"use client";

interface PublicFooterProps {
  theme?: "auto" | "light" | "dark";
  className?: string;
}

export function PublicFooter({ theme = "auto", className = "" }: PublicFooterProps) {
  const colorStyles =
    theme === "light"
      ? "text-slate-500 bg-white border-slate-200"
      : theme === "dark"
      ? "text-slate-300 bg-black/50 backdrop-blur-xs border-white/10"
      : "text-slate-500 lg:text-slate-300 bg-white lg:bg-black/50 backdrop-blur-xs border-slate-200 lg:border-white/10";

  return (
    <footer
      className={`relative z-10 w-full px-4 sm:px-8 lg:px-12 py-3 text-center text-xs font-sans border-t ${colorStyles} ${className}`}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
        <div>
          © 2026 <strong>Cebu Eastern College (CEC)</strong> — CEC School Portal.
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-400 font-sans">
          cebucecportal.site
        </div>
      </div>
    </footer>
  );
}
