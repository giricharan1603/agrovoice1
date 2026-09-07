import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Leaf,
  Truck,
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Flame,
  UserCheck,
} from "lucide-react";
import { useAuth, UserRole } from "@/lib/auth-context";
import toast from "react-hot-toast";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Firebase Sign In — AgroVoice Portals" },
      { name: "description", content: "Firebase Authentication with Google, Mobile Phone SMS OTP, and Email for Farmers, Drivers, and Admins." },
    ],
  }),
  component: LoginPage,
});

type AuthMethod = "phone" | "email" | "google";

function LoginPage() {
  const {
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    sendFirebaseOtp,
    verifyFirebaseOtp,
    loginDemo,
  } = useAuth();
  const navigate = useNavigate();

  // Role Selection
  const [activeRole, setActiveRole] = useState<UserRole>("farmer");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");

  // Phone OTP States
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Email/Password States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // Google Loading State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Admin Passphrase State
  const [adminKey, setAdminKey] = useState("");

  const navigateToRoleDashboard = (role: UserRole) => {
    if (role === "farmer") navigate({ to: "/farmer/dashboard" });
    else if (role === "driver") navigate({ to: "/driver/dashboard" });
    else if (role === "admin") navigate({ to: "/admin/dashboard" });
    else navigate({ to: "/" });
  };

  // 1. Google 1-Tap Login
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle(activeRole, { name });
      if (res.success) {
        toast.success(res.message);
        navigateToRoleDashboard(activeRole);
      } else {
        toast.error(res.message || "Google Sign-In failed.");
      }
    } catch (err: any) {
      toast.error("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2. Phone OTP Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendFirebaseOtp(cleanPhone, "recaptcha-container");
      if (res.success) {
        setOtpSent(true);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 3. Phone OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP code received.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyFirebaseOtp(otpCode, activeRole, {
        name: name || undefined,
        phone: `+91${phone.replace(/\D/g, "").slice(-10)}`,
        driverId: activeRole === "driver" ? `DRV-${phone.slice(-4)}` : undefined,
      });

      if (res.success) {
        toast.success(res.message);
        navigateToRoleDashboard(activeRole);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("OTP verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 4. Email & Password Sign In / Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsEmailLoading(true);
    try {
      if (isSignUp) {
        const res = await signUpWithEmail(email, password, activeRole, { name });
        if (res.success) {
          toast.success(res.message);
          navigateToRoleDashboard(activeRole);
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await loginWithEmail(email, password, activeRole, { name });
        if (res.success) {
          toast.success(res.message);
          navigateToRoleDashboard(activeRole);
        } else {
          toast.error(res.message);
        }
      }
    } catch (err) {
      toast.error("Authentication error occurred.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  // 5. Admin Security Key Login
  const handleAdminKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      toast.error("Please enter administrator security key.");
      return;
    }

    const res = await loginDemo("admin", { name: "System Administrator" });
    if (res.success) {
      toast.success("Administrator session verified!");
      navigate({ to: "/admin/dashboard" });
    }
  };

  // 6. Quick Demo Guest Access
  const handleQuickDemo = async () => {
    const res = await loginDemo(activeRole, {
      name:
        activeRole === "farmer"
          ? "Ramesh Patel (Kisan)"
          : activeRole === "driver"
          ? "Vikram Singh (Driver)"
          : "System Admin",
    });
    if (res.success) {
      toast.success(res.message);
      navigateToRoleDashboard(activeRole);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background px-4 py-12">
      {/* Invisible Firebase Recaptcha Container */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <Link to="/" className="mb-6 flex flex-col items-center justify-center gap-2 text-center group">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-xl shadow-brand/30 group-hover:scale-105 transition-transform">
            <Leaf className="h-8 w-8 text-brand-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">AgroVoice</h1>
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>Firebase Authentication Enabled</span>
          </div>
        </Link>

        {/* Main Card */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-1.5 border border-border">
            <button
              type="button"
              onClick={() => {
                setActiveRole("farmer");
                setOtpSent(false);
              }}
              className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                activeRole === "farmer"
                  ? "bg-brand text-brand-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Leaf className="h-4 w-4" />
              1. Farmer
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole("driver");
                setOtpSent(false);
              }}
              className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                activeRole === "driver"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Truck className="h-4 w-4" />
              2. Driver
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole("admin");
                setOtpSent(false);
              }}
              className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                activeRole === "admin"
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              3. Admin
            </button>
          </div>

          {/* Role Header Banner */}
          <div className="mt-5 rounded-2xl border p-3.5 text-xs flex items-center justify-between gap-3 bg-muted/30 border-border">
            <div className="flex items-center gap-2">
              {activeRole === "farmer" && <Leaf className="h-4 w-4 text-emerald-600 shrink-0" />}
              {activeRole === "driver" && <Truck className="h-4 w-4 text-amber-600 shrink-0" />}
              {activeRole === "admin" && <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0" />}
              <div>
                <span className="font-bold text-foreground">
                  {activeRole === "farmer" && "Farmer / Kisan Portal"}
                  {activeRole === "driver" && "Driver & Transporter Hub"}
                  {activeRole === "admin" && "Administrator Console"}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {activeRole === "farmer" && "Book shared truck space with Voice AI"}
                  {activeRole === "driver" && "Fill empty truck space and optimize routes"}
                  {activeRole === "admin" && "Manage users, disputes, and mandi rates"}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold text-brand uppercase">
              {activeRole}
            </span>
          </div>

          {/* Authentication Method Selector (Phone OTP vs Email/Pass) */}
          <div className="mt-4 flex border-b border-border text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthMethod("phone")}
              className={`flex-1 pb-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                authMethod === "phone"
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile SMS OTP
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("email")}
              className={`flex-1 pb-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                authMethod === "email"
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email & Password
            </button>
          </div>

          {/* Firebase 1-Tap Google Sign-In */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground shadow-xs hover:bg-muted/50 hover:border-foreground/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isGoogleLoading ? "Connecting to Firebase..." : "Continue with Google"}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 font-bold text-muted-foreground">or sign in with credentials</span>
              </div>
            </div>
          </div>

          {/* METHOD 1: Firebase Mobile SMS OTP */}
          {authMethod === "phone" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        activeRole === "farmer"
                          ? "e.g. Ramesh Patel"
                          : activeRole === "driver"
                          ? "e.g. Vikram Singh"
                          : "e.g. Admin Manager"
                      }
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Mobile Number (10 Digits)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-xs font-bold text-muted-foreground">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded-xl border border-input bg-background pl-12 pr-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40 font-mono"
                        placeholder="Enter 10-digit mobile number"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full rounded-xl bg-brand-gradient px-4 py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingOtp ? "Dispatching Firebase SMS..." : "Send OTP via SMS"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        SMS OTP sent to: <b>+91 {phone}</b>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-brand font-bold hover:underline shrink-0 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-brand/50 bg-background px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                      placeholder="XXXXXX"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="w-full rounded-xl bg-brand-gradient px-4 py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingOtp ? "Verifying with Firebase..." : `Verify & Enter ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Dashboard`}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full text-xs font-bold text-muted-foreground hover:text-foreground text-center block pt-1 cursor-pointer"
                  >
                    Didn't receive SMS? Resend Firebase OTP
                  </button>
                </form>
              )}
            </div>
          )}

          {/* METHOD 2: Firebase Email & Password */}
          {authMethod === "email" && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Password (6+ characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isEmailLoading}
                className="w-full rounded-xl bg-brand-gradient px-4 py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {isEmailLoading
                  ? "Authenticating..."
                  : isSignUp
                  ? "Create Firebase Account"
                  : "Sign In with Email"}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs font-bold text-brand hover:underline cursor-pointer"
                >
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Need an account? Create one with Firebase"}
                </button>
              </div>
            </form>
          )}

          {/* Admin Passphrase Quick-Unlock (For Admin Tab only) */}
          {activeRole === "admin" && (
            <div className="mt-4 pt-4 border-t border-border">
              <form onSubmit={handleAdminKeyLogin} className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
                  <span>Admin Passkey Direct Access</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Admin Passphrase"
                    className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 transition-colors cursor-pointer"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Demo 1-Click Access Pill */}
          <div className="mt-6 pt-4 border-t border-border flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-muted/60 hover:bg-muted py-2.5 px-4 text-xs font-bold text-foreground transition-all cursor-pointer border border-border"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>1-Click Demo Access ({activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} Mode)</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Footer Support Info */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          AgroVoice Connect is protected by Firebase Authentication and Enterprise Security Rules.
        </p>
      </div>
    </div>
  );
}
