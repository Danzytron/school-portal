import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In | cebucecportal - Cebu Eastern College School Portal",
  description:
    "Sign in to cebucecportal, the Cebu Eastern College School Portal. Access student enrollment, academic grades, class schedules, and faculty services.",
  alternates: {
    canonical: "https://cebucecportal.site/login",
  },
  openGraph: {
    title: "Sign In | cebucecportal - Cebu Eastern College School Portal",
    description:
      "Sign in to the official cebucecportal for Cebu Eastern College students, faculty, and administrators.",
    url: "https://cebucecportal.site/login",
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
