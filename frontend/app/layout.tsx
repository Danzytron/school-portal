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
  metadataBase: new URL("https://cebucecportal.site"),
  title: {
    default: "CEC School Portal | Student, Faculty & Admin Portal",
    template: "%s | CEC School Portal",
  },
  description:
    "Access the CEC School Portal for students, faculty, and administrators. Manage academic information, schedules, announcements, and other school-related services in one place.",
  applicationName: "CEC School Portal",
  authors: [{ name: "Cebu Eastern College" }],
  keywords: [
    "CEC School Portal",
    "Cebu Eastern College",
    "Student Portal",
    "Faculty Portal",
    "Admin Portal",
    "Academic Portal",
    "University Information System",
  ],
  alternates: {
    canonical: "https://cebucecportal.site",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cebucecportal.site",
    siteName: "CEC School Portal",
    title: "CEC School Portal | Student, Faculty & Admin Portal",
    description:
      "Access the CEC School Portal for students, faculty, and administrators. Manage academic information, schedules, announcements, and other school-related services in one place.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CEC School Portal | Student, Faculty & Admin Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CEC School Portal | Student, Faculty & Admin Portal",
    description:
      "Access the CEC School Portal for students, faculty, and administrators. Manage academic information, schedules, announcements, and other school-related services in one place.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/cec-logo.jpg" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/cec-logo.jpg",
    apple: "/cec-logo.jpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
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
