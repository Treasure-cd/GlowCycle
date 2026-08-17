import { useSearchParams } from "react-router-dom";
import SignupForm from "../components/layout/SignupForm";
import LoginForm from "../components/layout/LoginForm";
import AuthLayout from "../components/layout/AuthLayout";

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";

  return (
    <AuthLayout
      title={mode === "signup" ? "Create your account" : "Welcome back"}
      subtitle={mode === "signup" ? "Let's take the next step in your skin health." : "Ready to continue knowing your skin?"}
    >
      {mode === "signup" ? <SignupForm /> : <LoginForm />}

      <button
        onClick={() => setSearchParams({ mode: mode === "signup" ? "login" : "signup" })}
        className="mt-6 w-full text-center text-sm text-foreground hover:underline cursor-pointer"
      >
        {mode === "signup" ? "Already have an account? Log in" : "New here? Sign up"}
      </button>
    </AuthLayout>
  );
}