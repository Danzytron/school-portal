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
    default: "Cebu Eastern College | School Portal",
    template: "%s | Cebu Eastern College",
  },
  description:
    "Cebu Eastern College offers an online School Portal for students, faculty, and academic services. Access enrollment information, academic grades, class schedules, and other official school portal services.",
  applicationName: "Cebu Eastern College",
  authors: [{ name: "Cebu Eastern College", url: "https://cebucecportal.site" }],
  creator: "Cebu Eastern College",
  publisher: "Cebu Eastern College",
  keywords: [
    "Cebu Eastern College",
    "Cebu Eastern College School Portal",
    "Cebu Eastern College Portal",
    "CEC School Portal",
    "CEC Student Portal",
    "cebucecportal",
    "Cebu CEC Portal",
    "cebucecportal.site",
    "CEC Portal",
    "CEC Portal Login",
    "Cebu Eastern College Cebu City",
    "Cebu CEC School Portal System",
  ],
  alternates: {
    canonical: "https://cebucecportal.site",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cebucecportal.site",
    siteName: "Cebu Eastern College",
    title: "Cebu Eastern College | School Portal",
    description:
      "Cebu Eastern College offers an online School Portal for students, faculty, and academic services. Access enrollment information, academic grades, class schedules, and other official school portal services.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cebu Eastern College | School Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cebu Eastern College | School Portal",
    description:
      "Cebu Eastern College offers an online School Portal for students, faculty, and academic services.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
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
      "CEC",
      "Cebu Eastern College School Portal",
      "cebucecportal",
      "Cebu CEC Portal"
    ],
    "url": "https://cebucecportal.site",
    "logo": "https://cebucecportal.site/cec-logo.png",
    "description": "Cebu Eastern College offers an online School Portal for students, faculty, and academic services.",
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
    "name": "Cebu Eastern College",
    "alternateName": [
      "Cebu Eastern College School Portal",
      "CEC School Portal",
      "cebucecportal",
      "Cebu CEC Portal"
    ],
    "url": "https://cebucecportal.site",
    "description": "Cebu Eastern College offers an online School Portal for students, faculty, and academic services."
  };

  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Cebu Eastern College | School Portal",
    "description": "Cebu Eastern College offers an online School Portal for students, faculty, and academic services. Access enrollment information, academic grades, class schedules, and other official school portal services.",
    "url": "https://cebucecportal.site",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Cebu Eastern College",
      "url": "https://cebucecportal.site"
    },
    "about": {
      "@type": "EducationalOrganization",
      "name": "Cebu Eastern College"
    },
    "inLanguage": "en"
  };

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1D4ED8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebPage) }}
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
