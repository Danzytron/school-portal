import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In | CEC School Portal - Cebu Eastern College",
  description:
    "Sign in to the Cebu Eastern College School Portal (CEC Portal). Access student enrollment, academic grades, class schedules, and faculty services on cebucecportal.",
  alternates: {
    canonical: "https://cebucecportal.site/login",
  },
  openGraph: {
    title: "Sign In | CEC School Portal - Cebu Eastern College",
    description:
      "Sign in to the official Cebu Eastern College School Portal (CEC Portal) for students, faculty, and administrators.",
    url: "https://cebucecportal.site/login",
  },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
