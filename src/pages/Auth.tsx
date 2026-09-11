import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mail, ArrowRight, GraduationCap, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

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
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch {
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Failed to sign in as guest: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
            <span className="text-xl font-bold tracking-tight">
              CampusConnect
            </span>
          </div>
        </div>
      </nav>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="clay p-8">
            {step === "signIn" ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    Welcome Back
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Enter your email to sign in or create an account
                  </p>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          name="email"
                          type="email"
                          placeholder="you@college.edu"
                          className="clay-input pl-11"
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
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Continue with Email
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

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

                {/* Guest Login */}
                <button
                  type="button"
                  className="clay-btn w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <UserX className="w-4 h-4" />
                  Continue as Guest
                </button>
              </>
            ) : (
              <>
                {/* OTP Verification */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    Check Your Email
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    We sent a verification code to
                  </p>
                  <p className="font-semibold text-sm mt-1">{step.email}</p>
                </div>

                <form onSubmit={handleOtpSubmit}>
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center mb-6">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          otp.length === 6 &&
                          !isLoading
                        ) {
                          const form = (e.target as HTMLElement).closest(
                            "form",
                          );
                          if (form) form.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && (
                    <div className="clay-inset p-3 text-sm text-destructive font-medium mb-4 text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="clay-btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify Code
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="clay-btn w-full py-3 text-sm font-semibold"
                      onClick={() => {
                        setStep("signIn");
                        setOtp("");
                        setError(null);
                      }}
                      disabled={isLoading}
                    >
                      Use Different Email
                    </button>
                  </div>
                </form>
              </>
            )}
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
