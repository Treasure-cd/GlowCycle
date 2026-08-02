import { useSearchParams } from "react-router-dom";
import SignupForm from "../components/layout/SignupForm";
import LoginForm from "../components/layout/LoginForm";

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";

  return (
    <div className="auth-page">
      {mode === "signup" ? <SignupForm /> : <LoginForm />}

      <button onClick={() => setSearchParams({ mode: mode === "signup" ? "login" : "signup" })}>
        {mode === "signup" ? "Already have an account? Log in" : "New here? Sign up"}
      </button>
    </div>
  );
}