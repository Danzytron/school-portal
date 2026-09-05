import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cebu Eastern College | University Information System",
  description: "Official Cebu Eastern College Student, Faculty & Administrative Portal",
  icons: {
    icon: [
      { url: "/cec-logo.jpg" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/cec-logo.jpg",
    apple: "/cec-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans bg-[#F8FAFC] text-slate-800 antialiased min-h-screen">
        <AuthProvider>
          {children}
          <div id="toast-container" className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>
        </AuthProvider>
      </body>
    </html>
  );
}
