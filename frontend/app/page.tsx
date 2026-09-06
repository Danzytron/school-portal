import type { Metadata } from "next";
import LoginPageClient from "./login/LoginPageClient";

export const metadata: Metadata = {
  title: "Cebu Eastern College | School Portal",
  description:
    "Cebu Eastern College offers an online School Portal for students, faculty, and academic services. Access enrollment information, academic grades, class schedules, and other official school portal services.",
  alternates: {
    canonical: "https://cebucecportal.site",
  },
  openGraph: {
    title: "Cebu Eastern College | School Portal",
    description:
      "Cebu Eastern College offers an online School Portal for students, faculty, and academic services. Access enrollment information, academic grades, class schedules, and other official school portal services.",
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
          Cebu Eastern College offers an online School Portal for students, faculty, and academic services. Access enrollment information, academic grades, class schedules, and other official school portal services at https://cebucecportal.site.
        </p>
      </noscript>
    </>
  );
}
