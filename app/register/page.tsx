import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const isAuthed = await isAuthenticatedNextjs();
  if (isAuthed) redirect("/dashboard");
  return <AuthForm mode="register" />;
}
