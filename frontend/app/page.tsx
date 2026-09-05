import type { Metadata } from "next";
import LoginPageClient from "./login/LoginPageClient";

export const metadata: Metadata = {
  title: "cebucecportal | Cebu Eastern College School Portal",
  description:
    "cebucecportal is the official Cebu Eastern College School Portal. Access student enrollment, academic grades, class schedules, faculty services, and announcements at cebucecportal.site.",
  alternates: {
    canonical: "https://cebucecportal.site",
  },
  openGraph: {
    title: "cebucecportal | Cebu Eastern College School Portal",
    description:
      "cebucecportal is the official Cebu Eastern College School Portal for students, faculty, and administrators.",
    url: "https://cebucecportal.site",
  },
};

export default function Home() {
  return (
    <>
      <LoginPageClient />
      {/* Crawlable SEO content — visible in footer area, naturally integrated */}
      <noscript>
        <p>
          cebucecportal is the official Cebu Eastern College School Portal.
          Access student enrollment, academic grades, class schedules, and
          faculty services at cebucecportal.site.
        </p>
      </noscript>
    </>
  );
}
