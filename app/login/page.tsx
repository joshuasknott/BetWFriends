import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  const isAuthed = await isAuthenticatedNextjs();
  if (isAuthed) redirect("/dashboard");
  return <AuthForm mode="login" />;
}
