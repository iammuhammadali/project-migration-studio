import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/portal/AuthForm";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/login")({
  head: () => portalHead("Login — Sindh Domicile & PRC Portal", "Log in with your 13-digit CNIC and password."),
  component: () => <AuthForm mode="login" />,
});
