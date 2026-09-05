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
    default: "cebucecportal | Cebu Eastern College School Portal",
    template: "%s | cebucecportal - Cebu Eastern College",
  },
  description:
    "Official cebucecportal for Cebu Eastern College (CEC). Access the online school portal for student enrollment, academic grades, class schedules, faculty announcements, and university services.",
  applicationName: "cebucecportal",
  authors: [{ name: "Cebu Eastern College", url: "https://cebucecportal.site" }],
  creator: "Cebu Eastern College",
  publisher: "Cebu Eastern College",
  keywords: [
    "cebucecportal",
    "Cebu CEC Portal",
    "Cebu Eastern College Portal",
    "Cebu Eastern College School Portal",
    "CEC Student Portal",
    "cebucecportal.site",
    "CEC School Portal",
    "Cebu Eastern College",
    "CEC Portal",
    "CEC Portal Login",
    "Cebu CEC School Portal System",
    "CEC Student Information System",
  ],
  alternates: {
    canonical: "https://cebucecportal.site",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cebucecportal.site",
    siteName: "cebucecportal - Cebu Eastern College",
    title: "cebucecportal | Cebu Eastern College School Portal",
    description:
      "Access the official cebucecportal for Cebu Eastern College students, faculty, and administrators. Manage academic information, schedules, announcements, and school services in one place.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "cebucecportal - Cebu Eastern College School Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "cebucecportal | Cebu Eastern College School Portal",
    description:
      "Official cebucecportal for Cebu Eastern College students, faculty, and administrators.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/cec-logo.png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/cec-logo.png",
    apple: "/cec-logo.png",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Cebu Eastern College",
    "alternateName": [
      "cebucecportal",
      "Cebu CEC Portal",
      "Cebu Eastern College Portal",
      "Cebu Eastern College School Portal",
      "CEC Student Portal",
      "CEC Portal"
    ],
    "url": "https://cebucecportal.site",
    "logo": "https://cebucecportal.site/cec-logo.png",
    "description": "Official Cebu Eastern College School Portal (cebucecportal) providing online academic services, enrollment, grades, and schedules for students and faculty.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Cebu City",
      "addressRegion": "Cebu",
      "addressCountry": "PH"
    }
  };

  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "cebucecportal",
    "alternateName": [
      "Cebu Eastern College School Portal",
      "Cebu CEC Portal",
      "CEC Portal"
    ],
    "url": "https://cebucecportal.site",
  };

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="font-sans bg-[#F8FAFC] text-slate-800 antialiased min-h-screen">
        <AuthProvider>
          {children}
          <div id="toast-container" className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>
        </AuthProvider>
      </body>
    </html>
  );
}
