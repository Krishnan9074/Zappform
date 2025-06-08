import { Metadata } from "next";
import LoginForm from "@/app/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In - ZappForm",
  description: "Sign in to your ZappForm account",
};

export default function SignInPage() {
  return <LoginForm />;
} 