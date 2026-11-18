import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/portal/AuthForm";
import { portalHead } from "@/lib/page-metadata";

export const Route = createFileRoute("/register")({
  head: () => portalHead("Register — Sindh Domicile & PRC Portal", "Create a CNIC and password account to apply for a Sindh Domicile and PRC certificate."),
  component: () => <AuthForm mode="register" />,
});
