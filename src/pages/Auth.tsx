import { useAuth } from "@/hooks/use-auth";
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  GraduationCap,
  User,
  UserPlus,
  LogIn,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

const API_URL = "http://localhost:5001/api";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  // Form state
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      signIn(data.user, data.token);
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      signIn(data.user, data.token);
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen clay-gradient-hero flex flex-col">
      {/* Navbar */}
      <nav className="clay-nav">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="clay-btn-primary w-10 h-10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">UniQuest</span>
          </div>
        </div>
      </nav>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="clay p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {isLogin ? "Welcome Back" : "Join UniQuest"}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {isLogin
                  ? "Sign in to access your campus notice board"
                  : "Create an account to start posting"}
              </p>
            </div>

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="you@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="clay-input pl-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="clay-input pl-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="clay-inset p-3 text-sm text-destructive font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="clay-btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <LogIn className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g. Alex Johnson"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="clay-input pl-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="you@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="clay-input pl-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="clay-input pl-11"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="clay-inset p-3 text-sm text-destructive font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="clay-btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <UserPlus className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#f0e8f8] px-3 text-muted-foreground font-medium">
                  Or
                </span>
              </div>
            </div>

            {/* Toggle Login/Register */}
            <button
              type="button"
              className="clay-btn w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              disabled={isLoading}
            >
              {isLogin ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create a New Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Already have an account? Sign In
                </>
              )}
            </button>
          </div>

          {/* Back to home */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            <button
              className="font-semibold hover:text-primary transition-colors"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
