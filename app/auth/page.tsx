import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to sync your statistics course progress.",
};

export default async function AuthPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const params=await searchParams;
  return <AuthForm callbackError={Boolean(params.error)} />;
}
