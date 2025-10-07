import React, { useRef, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "./firebase";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { PasswordToggle } from "../components/ui/password-toggle";
import { useStore } from "../zustand/store";
import { useNavigate } from "react-router-dom";
import { AiFillGoogleCircle, AiFillGithub } from "react-icons/ai";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

function Login() {
  const email = useRef<HTMLInputElement | null>(null);
  const password = useRef<HTMLInputElement | null>(null);
  const { setIsUser, setDialogOpen } = useStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isAnyLoading = loadingEmail || loadingGoogle || loadingGithub;

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          toast.success("Successfully logged in!");
          setDialogOpen(false);
          setIsUser(true);
        }
      })
      .catch((error: unknown) => {
        console.error("Redirect result error:", error);
        if (error.code !== "auth/popup-closed-by-user") {
          const errorMsg =
            error.message
              ?.replace("Firebase: ", "")
              .replace(/\(auth\/[^)]+\)/, "")
              .trim() || "Login failed";
          setErrors({ submit: errorMsg });
          toast.error(errorMsg);
        }
      });
  }, [navigate, setDialogOpen, setIsUser]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    setErrors({});
    const newErrors: Record<string, string> = {};
    try {
      await signInWithEmailAndPassword(auth, email.current!.value, password.current!.value);
      toast.success("Successfully logged in!");
      setDialogOpen(false);
      setIsUser(true);
    } catch (error: unknown) {
      console.error("Login error:", error);
      let errorMessage = "Unable to log in. Please try again.";
      let toastMessage = errorMessage;
      let isFieldError = false;
      if (error.code === "auth/configuration-not-found") {
        errorMessage =
          "🔧 Authentication service unavailable. Our team has been notified. Please try again later.";
        toastMessage = "Service temporarily unavailable";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address (e.g., name@example.com)";
        toastMessage = "Invalid email format";
        newErrors.email = errorMessage;
        isFieldError = true;
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "We couldn't find an account with this email. Would you like to create one?";
        toastMessage = "Account not found - Sign up instead?";
        newErrors.email = errorMessage;
        isFieldError = true;
      } else if (error.code === "auth/wrong-password") {
        errorMessage =
          "The password you entered is incorrect. Please try again or reset your password.";
        toastMessage = "Incorrect password";
        newErrors.password = errorMessage;
        isFieldError = true;
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "🔒 Too many unsuccessful login attempts. For security, please wait a few minutes before trying again, or reset your password.";
        toastMessage = "Account temporarily locked";
      } else if (error.code === "auth/user-disabled") {
        errorMessage =
          "🚫 This account has been disabled. Please contact support at support@example.com for assistance.";
        toastMessage = "Account disabled";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage =
          "📡 Network connection issue. Please check your internet connection and try again.";
        toastMessage = "Connection error";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage =
          "The email or password you entered is incorrect. Please check and try again.";
        toastMessage = "Invalid credentials";
      } else if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage =
          "An account already exists with this email using a different sign-in method. Try signing in with Google or GitHub.";
        toastMessage = "Use different sign-in method";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage =
          "Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.";
        toastMessage = "Pop-up blocked";
      } else if (error.code === "auth/operation-not-supported-in-this-environment") {
        errorMessage =
          "This sign-in method is not supported in your current browser. Please try a different browser.";
        toastMessage = "Browser not supported";
      } else if (error.code === "auth/timeout") {
        errorMessage = "⏱️ The request timed out. Please check your connection and try again.";
        toastMessage = "Request timeout";
      } else if (error.code === "auth/missing-email") {
        errorMessage = "Please enter your email address to continue.";
        toastMessage = "Email required";
        newErrors.email = errorMessage;
        isFieldError = true;
      } else if (error.code === "auth/internal-error") {
        errorMessage =
          "An unexpected error occurred. Please try again or contact support if the issue persists.";
        toastMessage = "Unexpected error";
      } else if (error.message) {
        const cleanMessage = error.message
          .replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim();
        errorMessage =
          cleanMessage || "Unable to log in. Please verify your credentials and try again.";
        toastMessage = "Login failed";
      }
      if (isFieldError) {
        setErrors({ ...newErrors });
      } else {
        setErrors({ submit: errorMessage });
      }
      toast.error(toastMessage);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setErrors({});
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in with Google!");
      setDialogOpen(false);
      setIsUser(true);
    } catch (error: unknown) {
      console.error("Google login error:", error);
      let errorMessage = "Unable to sign in with Google. Please try again.";
      let toastMessage = "Google sign-in failed";
      if (error.code === "auth/popup-blocked") {
        errorMessage =
          "🚫 Pop-up blocked! Please allow pop-ups for this site or we'll redirect you to Google sign-in.";
        toastMessage = "Pop-up blocked - Redirecting...";
        setErrors({ submit: errorMessage });
        toast.info(toastMessage);
        try {
          await signInWithRedirect(auth, provider);
        } catch {
          errorMessage =
            "Unable to redirect to Google sign-in. Please check your browser settings.";
          setErrors({ submit: errorMessage });
          toast.error("Redirect failed");
        }
      } else if (
        error.code === "auth/cancelled-popup-request" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        toast.info("Sign-in cancelled");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage =
          "An account with this email already exists. Try signing in with your email/password or a different provider.";
        toastMessage = "Account exists with different method";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code === "auth/configuration-not-found") {
        errorMessage =
          "🔧 Google sign-in is not configured. Please contact support or try another sign-in method.";
        toastMessage = "Google sign-in unavailable";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "📡 Network connection issue. Please check your internet and try again.";
        toastMessage = "Connection error";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code === "auth/unauthorized-domain") {
        errorMessage =
          "This domain is not authorized for Google sign-in. Please contact the site administrator.";
        toastMessage = "Domain not authorized";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage =
          "Google sign-in is currently disabled. Please try email/password login or contact support.";
        toastMessage = "Google sign-in disabled";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code !== "auth/popup-closed-by-user") {
        const cleanMsg = error.message
          ?.replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim();
        errorMessage =
          cleanMsg || "Unable to complete Google sign-in. Please try again or use email/password.";
        toastMessage = "Google sign-in failed";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoadingGithub(true);
    setErrors({});
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Successfully logged in with GitHub!");
      setDialogOpen(false);
      setIsUser(true);
    } catch (error: unknown) {
      console.error("GitHub login error:", error);
      let errorMessage = "Unable to sign in with GitHub. Please try again.";
      let toastMessage = "GitHub sign-in failed";
      if (error.code === "auth/popup-blocked") {
        errorMessage =
          "🚫 Pop-up blocked! Please allow pop-ups for this site or we'll redirect you to GitHub sign-in.";
        toastMessage = "Pop-up blocked - Redirecting...";
        setErrors({ submit: errorMessage });
        toast.info(toastMessage);
        try {
          await signInWithRedirect(auth, provider);
        } catch {
          errorMessage =
            "Unable to redirect to GitHub sign-in. Please check your browser settings.";
          setErrors({ submit: errorMessage });
          toast.error("Redirect failed");
        }
      } else if (
        error.code === "auth/cancelled-popup-request" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        toast.info("Sign-in cancelled");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage =
          "An account with this email already exists. Try signing in with your email/password or Google.";
        toastMessage = "Account exists with different method";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code === "auth/configuration-not-found") {
        errorMessage =
          "🔧 GitHub sign-in is not configured. Please contact support or try another sign-in method.";
        toastMessage = "GitHub sign-in unavailable";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "📡 Network connection issue. Please check your internet and try again.";
        toastMessage = "Connection error";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code === "auth/unauthorized-domain") {
        errorMessage =
          "This domain is not authorized for GitHub sign-in. Please contact the site administrator.";
        toastMessage = "Domain not authorized";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage =
          "GitHub sign-in is currently disabled. Please try email/password login or contact support.";
        toastMessage = "GitHub sign-in disabled";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      } else if (error.code !== "auth/popup-closed-by-user") {
        const cleanMsg = error.message
          ?.replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim();
        errorMessage =
          cleanMsg || "Unable to complete GitHub sign-in. Please try again or use email/password.";
        toastMessage = "GitHub sign-in failed";
        setErrors({ submit: errorMessage });
        toast.error(toastMessage);
      }
    } finally {
      setLoadingGithub(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <h1 className="font-semibold text-xl mt-3">Login to Continue</h1>
      {errors.submit && (
        <Alert variant="destructive" className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleEmailLogin} className="flex flex-col items-center gap-4 w-full">
        <div className="w-full">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            ref={email}
            required
            placeholder="your@email.com"
            disabled={isAnyLoading}
            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
            onChange={() =>
              errors.email && setErrors((prev: Record<string, string>) => ({ ...prev, email: "" }))
            }
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>
        <div className="w-full">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              ref={password}
              required
              placeholder="Enter your password"
              disabled={isAnyLoading}
              className={`pr-10 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              onChange={() =>
                errors.password &&
                setErrors((prev: Record<string, string>) => ({ ...prev, password: "" }))
              }
            />
            <PasswordToggle
              showPassword={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              disabled={isAnyLoading}
            />
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.password}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isAnyLoading} className="w-full mt-2">
          {loadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loadingEmail ? "Logging in..." : "Login"}
        </Button>
      </form>
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isAnyLoading}
          className="w-full"
        >
          {loadingGoogle ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <AiFillGoogleCircle size={20} />
          )}
          <span className="ml-2">{loadingGoogle ? "Signing in..." : "Google"}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleGithubLogin}
          disabled={isAnyLoading}
          className="w-full"
        >
          {loadingGithub ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <AiFillGithub size={20} />
          )}
          <span className="ml-2">{loadingGithub ? "Signing in..." : "GitHub"}</span>
        </Button>
      </div>
    </div>
  );
}

export default Login;
