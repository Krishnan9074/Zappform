import { Metadata } from "next";
import RegisterForm from "@/app/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register - ZappForm",
  description: "Create a new ZappForm account",
};

export default function RegisterPage() {
  return <RegisterForm />;
} 