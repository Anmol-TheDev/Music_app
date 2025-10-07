import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
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
import { AiFillGoogleCircle, AiFillGithub } from "react-icons/ai";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useStore } from "../zustand/store";
import { toast } from "sonner";

const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 7,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const score = Object.values(requirements).filter(Boolean).length;
  const isValid = Object.values(requirements).every(Boolean);
  return { requirements, score, isValid };
};

function SignUp() {
  const email = useRef();
  const password = useRef();
  const confPassword = useRef();
  const { setIsUser, setDialogOpen } = useStore();
  const navigate = useNavigate();

  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Combined loading state for disabling all inputs
  const isAnyLoading = loadingEmail || loadingGoogle || loadingGithub;

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          setDialogOpen(false);
          setIsUser(true);
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [navigate, setDialogOpen, setIsUser]);

  useEffect(() => {
    if (passwordValue) setPasswordValidation(validatePassword(passwordValue));
    else setPasswordValidation(null);
  }, [passwordValue]);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordValue(value);
    password.current.value = value;
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPasswordValue(value);
    confPassword.current.value = value;
    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingEmail(true);
    setErrors({});
    const newErrors = {};
    if (!email.current.value.trim()) newErrors.email = "Email is required";
    const validation = validatePassword(passwordValue);
    if (!validation.isValid) newErrors.password = "Password does not meet all requirements";
    if (passwordValue !== confirmPasswordValue)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoadingEmail(false);
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.current.value.trim(), passwordValue);
      toast.success("Account created successfully! Welcome!");
      setDialogOpen(false);
      setIsUser(true);
    } catch (error) {
      console.error("Sign up error:", error);
      let errorMessage = "Failed to create account";
      let isFieldError = false;

      // Provide user-friendly error messages
      if (error.code === "auth/configuration-not-found") {
        errorMessage = "Authentication service is not properly configured. Please contact support.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Try logging in instead.";
        newErrors.email = errorMessage;
        isFieldError = true;
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
        newErrors.email = errorMessage;
        isFieldError = true;
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
        newErrors.password = errorMessage;
        isFieldError = true;
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password sign-up is not enabled. Please contact support.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message
          .replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim();
      }

      // Only show in Alert banner if it's not a field-specific error
      if (isFieldError) {
        setErrors({ ...newErrors });
      } else {
        setErrors({ submit: errorMessage });
      }
      toast.error(errorMessage);
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
      toast.success("Successfully signed in with Google!");
      setDialogOpen(false);
      setIsUser(true);
    } catch (error) {
      console.error("Google login error:", error);
      if (error.code === "auth/popup-blocked") {
        toast.info("Popup blocked! Redirecting to Google sign-in...");
        try {
          await signInWithRedirect(auth, provider);
        } catch {
          toast.error("Failed to redirect to Google sign-in");
        }
      } else if (
        error.code === "auth/cancelled-popup-request" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        toast.info("Sign-in cancelled");
      } else if (error.code === "auth/configuration-not-found") {
        setErrors({ submit: "Google sign-in is not properly configured. Please contact support." });
        toast.error("Google sign-in configuration error");
      } else if (error.code === "auth/network-request-failed") {
        setErrors({ submit: "Network error. Please check your internet connection." });
        toast.error("Network error");
      } else if (error.code !== "auth/popup-closed-by-user") {
        const errorMsg =
          error.message
            ?.replace("Firebase: ", "")
            .replace(/\(auth\/[^)]+\)/, "")
            .trim() || "Failed to sign in with Google";
        setErrors({ submit: errorMsg });
        toast.error(errorMsg);
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
      toast.success("Successfully signed in with GitHub!");
      setDialogOpen(false);
      setIsUser(true);
    } catch (error) {
      console.error("GitHub login error:", error);
      if (error.code === "auth/popup-blocked") {
        toast.info("Popup blocked! Redirecting to GitHub sign-in...");
        try {
          await signInWithRedirect(auth, provider);
        } catch {
          toast.error("Failed to redirect to GitHub sign-in");
        }
      } else if (
        error.code === "auth/cancelled-popup-request" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        toast.info("Sign-in cancelled");
      } else if (error.code === "auth/configuration-not-found") {
        setErrors({ submit: "GitHub sign-in is not properly configured. Please contact support." });
        toast.error("GitHub sign-in configuration error");
      } else if (error.code === "auth/network-request-failed") {
        setErrors({ submit: "Network error. Please check your internet connection." });
        toast.error("Network error");
      } else if (error.code !== "auth/popup-closed-by-user") {
        const errorMsg =
          error.message
            ?.replace("Firebase: ", "")
            .replace(/\(auth\/[^)]+\)/, "")
            .trim() || "Failed to sign in with GitHub";
        setErrors({ submit: errorMsg });
        toast.error(errorMsg);
      }
    } finally {
      setLoadingGithub(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <h1 className="font-semibold text-xl mt-3">Create a New Account</h1>

      {errors.submit && (
        <Alert variant="destructive" className="w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
        <div className="w-full">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            ref={email}
            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
            placeholder="your@email.com"
            disabled={isAnyLoading}
            onChange={() => errors.email && setErrors((prev) => ({ ...prev, email: "" }))}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>

        <div className="w-full">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={passwordValue}
              onChange={handlePasswordChange}
              placeholder="Enter a strong password"
              disabled={isAnyLoading}
              className={`${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""} pr-10`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary rounded"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
            </button>
          </div>

          {/* Password requirements */}
          {passwordValue && passwordValidation && (
            <div className="mt-2 text-xs space-y-1 bg-muted/50 p-2 rounded-md">
              <p className="font-medium text-muted-foreground mb-1">Password requirements:</p>
              <div
                className={`flex items-center gap-1.5 ${passwordValidation.requirements.minLength ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.requirements.minLength ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-current" />
                )}
                Minimum 7 characters
              </div>
              <div
                className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasLetter ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.requirements.hasLetter ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-current" />
                )}
                At least one letter
              </div>
              <div
                className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasNumbers ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.requirements.hasNumbers ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-current" />
                )}
                At least one number
              </div>
              <div
                className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasSpecialChar ? "text-green-600" : "text-muted-foreground"}`}
              >
                {passwordValidation.requirements.hasSpecialChar ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <div className="h-3 w-3 rounded-full border border-current" />
                )}
                Special character (!@#$%^&*)
              </div>
            </div>
          )}

          {/* Error message */}
          {errors.password && (
            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.password}
            </p>
          )}
        </div>

        <div className="w-full">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPasswordValue}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm your password"
              disabled={isAnyLoading}
              className={
                errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"
              }
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary rounded"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showConfirmPassword ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            isAnyLoading || (passwordValue && (!passwordValidation || !passwordValidation.isValid))
          }
          className="w-full mt-2"
        >
          {loadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loadingEmail ? "Creating Account..." : "Create Account"}
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
          <span className="ml-2">{loadingGoogle ? "Signing up..." : "Google"}</span>
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
          <span className="ml-2">{loadingGithub ? "Signing up..." : "GitHub"}</span>
        </Button>
      </div>
    </div>
  );
}

export default SignUp;
