import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { IdCard, Lock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, inputClass } from "./Field";
import { MobileShell, TopBar } from "./MobileShell";
import { supabase } from "@/integrations/supabase/client";
import { cnicToEmail } from "@/lib/auth";
import { authSchema, digitsOnly, fieldErrors, registerSchema, CNIC_LENGTH, type Errors } from "@/lib/validation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors<"cnic" | "password" | "confirm">>({});
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = isLogin
      ? authSchema.safeParse({ cnic, password })
      : registerSchema.safeParse({ cnic, password, confirm });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    const email = cnicToEmail(cnic);
    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { cnic } } });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already")) setErrors({ cnic: "An account with this CNIC already exists. Please log in." });
      else if (msg.includes("invalid login")) setErrors({ form: "Invalid CNIC or password." });
      else if (msg.includes("pwned") || msg.includes("weak")) setErrors({ password: "This password is too common. Please choose a stronger one." });
      else setErrors({ form: error.message });
      return;
    }
    if (!data.session) {
      setErrors({ form: "Account created, but sign-in is not ready yet. Please try logging in." });
      return;
    }
    toast.success(isLogin ? "Welcome back" : "Registration successful");
    navigate({ to: "/dashboard", search: { app: undefined }, replace: true });
  };

  return (
    <MobileShell>
      <TopBar title={isLogin ? "Login" : "Register"} subtitle="Sindh Domicile & PRC Portal" onBack={() => navigate({ to: "/" })} />
      <main className="flex flex-1 flex-col px-4 py-6">
        <div className="animate-rise mb-6 space-y-2">
          <div className="bg-brand-gradient grid size-12 place-items-center rounded-xl text-primary-foreground shadow-brand">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="text-2xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h2>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Log in with your CNIC and password." : "Register with your CNIC to start your application."}
          </p>
          <p className="text-xs text-muted-foreground">CNIC accounts do not receive email confirmations or password-reset messages. Keep your password safe.</p>
        </div>

        <form onSubmit={submit} className="glass-card animate-rise space-y-4 p-4" noValidate>
          <Field
            id="cnic"
            label="CNIC Number"
            icon={IdCard}
            error={errors.cnic}
            hint={`${cnic.length} / ${CNIC_LENGTH} digits entered`}
          >
            <Input
              id="cnic"
              inputMode="numeric"
              autoComplete="username"
              placeholder="4130412345671"
              value={cnic}
              maxLength={CNIC_LENGTH}
              onChange={(e) => setCnic(digitsOnly(e.target.value, CNIC_LENGTH))}
              className={inputClass(errors.cnic) + " font-mono"}
            />
          </Field>
          <Field id="password" label="Password" icon={Lock} error={errors.password}>
            <Input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass(errors.password)}
            />
          </Field>
          {!isLogin && (
            <Field id="confirm" label="Confirm Password" icon={Lock} error={errors.confirm}>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass(errors.confirm)}
              />
            </Field>
          )}
          {errors.form && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {errors.form}
            </p>
          )}
          <Button type="submit" variant="brand" size="touch" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {isLogin ? "Login" : "Register Now"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "New applicant? " : "Already registered? "}
          <Link to={isLogin ? "/register" : "/login"} className="font-semibold text-primary">
            {isLogin ? "Register Now" : "Login"}
          </Link>
        </p>
      </main>
    </MobileShell>
  );
}
