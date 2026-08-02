import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logIn } from "../../lib/auth";
import { getUserProfile } from "../../lib/firestore";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const cred = await logIn(email, password);
      const profile = await getUserProfile(cred.user.uid);
      navigate(profile?.onboardingComplete ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="error">{error}</p>}
      <button type="submit">Log in</button>
    </form>
  );
}