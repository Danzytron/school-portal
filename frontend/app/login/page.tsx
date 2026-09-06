import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In | Cebu Eastern College School Portal",
  description:
    "Sign in to the Cebu Eastern College School Portal. Access student enrollment, academic grades, class schedules, and faculty services.",
  alternates: {
    canonical: "https://cebucecportal.site/login",
  },
  openGraph: {
    title: "Sign In | Cebu Eastern College School Portal",
    description:
      "Sign in to the official Cebu Eastern College School Portal for students, faculty, and administrators.",
    url: "https://cebucecportal.site/login",
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
