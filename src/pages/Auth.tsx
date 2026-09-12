import { Loader2, Mail, Lock, User, ArrowRight, GraduationCap } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate(redirect);
    }
  }, [navigate, redirect]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (isRegister && name.trim() === "") {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegister
        ? "http://localhost:5001/api/auth/register"
        : "http://localhost:5001/api/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      if (isRegister) {
        setIsRegister(false);
        setPassword("");
        setError("");
        alert("Registration successful. Please login.");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate(redirect);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen clay-gradient-hero flex flex-col">
      <nav className="clay-nav">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="clay-btn-primary w-10 h-10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              UniQuest
            </span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="clay p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h1>

              <p className="text-muted-foreground mt-2 text-sm">
                {isRegister
                  ? "Create your UniQuest account"
                  : "Login to continue to UniQuest"}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name
                    </label>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                      <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter your name"
                        className="clay-input !pl-12"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@college.edu"
                      className="clay-input !pl-12"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="clay-input !pl-12"
                      disabled={isLoading}
                      required
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
                      Please wait...
                    </>
                  ) : (
                    <>
                      {isRegister ? "Create Account" : "Login"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>

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

            <button
              type="button"
              className="clay-btn w-full py-3.5 text-sm font-semibold"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
                setPassword("");
              }}
              disabled={isLoading}
            >
              {isRegister
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </button>
          </div>

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