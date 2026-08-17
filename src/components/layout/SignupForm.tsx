import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { signUp } from "../../services/auth";
import { getUserProfile } from "../../services/firestore";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setIsSubmitting(true);
    setIsSubmitting(true);
    try {
      const cred = await signUp(email, password);
      const profile = await getUserProfile(cred.user.uid);
      navigate(profile?.onboardingComplete ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError((err as Error).message);
      setIsSubmitting(false);
    }
  }

  return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-0"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 pr-12 text-base text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
          >
            {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
          </button>
        </div>

        <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 pr-12 text-base text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-0"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((v) => !v)}
          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
        >
          {showConfirmPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-primary py-3.5 font-medium text-background transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
  );
}