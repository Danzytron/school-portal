import type { Metadata } from "next";
import LoginPageClient from "./login/LoginPageClient";

export const metadata: Metadata = {
  title: "Cebu Eastern College | CEC School Portal",
  description:
    "Cebu Eastern College School Portal (CEC Portal). Access student enrollment, academic grades, class schedules, and online academic services through cebucecportal.",
  alternates: {
    canonical: "https://cebucecportal.site/",
  },
  openGraph: {
    title: "Cebu Eastern College | CEC School Portal",
    description:
      "Cebu Eastern College School Portal (CEC Portal). Access student enrollment, academic grades, class schedules, and online academic services through cebucecportal.",
    url: "https://cebucecportal.site/",
  },
};

export default function Home() {
  return (
    <>
      <LoginPageClient />
      {/* Crawlable Semantic SEO fallback content */}
      <noscript>
        <section style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
          <h1>Cebu Eastern College School Portal</h1>
          <p>
            Cebu Eastern College, also known as <strong>CEC</strong>, provides students, faculty, and administrators with official access to the <strong>CEC School Portal</strong> through <strong>cebucecportal</strong> (https://cebucecportal.site).
          </p>
          <p>
            Manage academic information, online enrollment, grade evaluations, class schedules, and university announcements in one centralized portal.
          </p>
        </section>
      </noscript>
    </>
  );
}
