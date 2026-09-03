import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in | Statlab",
  description: "Sign in to sync your statistics course progress.",
};

export default function AuthPage() {
  return <AuthForm />;
}
