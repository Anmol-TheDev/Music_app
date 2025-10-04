import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  GithubAuthProvider 
} from "firebase/auth";
import { app } from "./firebase";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { AiFillGoogleCircle, AiFillGithub } from "react-icons/ai";
import { useStore } from "../zustand/store";

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
  const auth = getAuth(app);
  const email = useRef();
  const password = useRef();
  const confPassword = useRef();
  const { setIsUser, setDialogOpen } = useStore();
  const navigate = useNavigate();

  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          setDialogOpen(false);
          setIsUser(true);
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [auth, navigate, setDialogOpen, setIsUser]);

  useEffect(() => {
    if (passwordValue) setPasswordValidation(validatePassword(passwordValue));
    else setPasswordValidation(null);
  }, [passwordValue]);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordValue(value);
    password.current.value = value;
    if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPasswordValue(value);
    confPassword.current.value = value;
    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors = {};

    if (!email.current.value.trim()) newErrors.email = "Email is required";
    const validation = validatePassword(passwordValue);
    if (!validation.isValid) newErrors.password = "Password does not meet all requirements";
    if (passwordValue !== confirmPasswordValue) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email.current.value.trim(), passwordValue);
      setDialogOpen(false);
      setIsUser(true);
      navigate("/");
    } catch (error) {
      setErrors({ submit: error.message || "Failed to create account" });
    }

    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setDialogOpen(false);
      setIsUser(true);
      navigate("/");
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        alert("Popup blocked! Redirecting instead...");
        await signInWithRedirect(auth, provider);
      } else {
        alert(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsSubmitting(true);
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setDialogOpen(false);
      setIsUser(true);
      navigate("/");
    } catch (error) {
      if (error.code === "auth/popup-blocked") {
        alert("Popup blocked! Redirecting instead...");
        await signInWithRedirect(auth, provider);
      } else {
        alert(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <h1 className="font-semibold text-xl mt-3">Create a New Account</h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
        <div className="w-full">
          <Label>Email</Label>
          <Input type="email" ref={email} className={errors.email ? "border-red-500" : ""} />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="w-full">
          <Label>Password</Label>
          <Input
            type="password"
            value={passwordValue}
            onChange={handlePasswordChange}
            className={errors.password ? "border-red-500" : ""}
            placeholder="Enter a strong password"
          />
          {passwordValue && passwordValidation && (
            <div className="mt-2 text-xs space-y-1">
              <div className={passwordValidation.requirements.minLength ? "text-green-600" : "text-red-500"}>
                {passwordValidation.requirements.minLength ? "✓" : "✗"} Minimum 7 characters
              </div>
              <div className={passwordValidation.requirements.hasLetter ? "text-green-600" : "text-red-500"}>
                {passwordValidation.requirements.hasLetter ? "✓" : "✗"} At least one letter
              </div>
              <div className={passwordValidation.requirements.hasNumbers ? "text-green-600" : "text-red-500"}>
                {passwordValidation.requirements.hasNumbers ? "✓" : "✗"} At least one number
              </div>
              <div className={passwordValidation.requirements.hasSpecialChar ? "text-green-600" : "text-red-500"}>
                {passwordValidation.requirements.hasSpecialChar ? "✓" : "✗"} At least one special character (!@#$%^&*)
              </div>
            </div>
          )}
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div className="w-full">
          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={confirmPasswordValue}
            onChange={handleConfirmPasswordChange}
            className={errors.confirmPassword ? "border-red-500" : ""}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        {errors.submit && (
          <div className="w-full">
            <p className="text-red-500 text-sm text-center">{errors.submit}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !email.current?.value || (passwordValue && (!passwordValidation || !passwordValidation.isValid))}
          className="w-full"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="flex gap-4 mt-4">
        <button onClick={handleGoogleLogin} title="Sign up with Google" disabled={isSubmitting}>
          <AiFillGoogleCircle size={36} />
        </button>
        <button onClick={handleGithubLogin} title="Sign up with GitHub" disabled={isSubmitting}>
          <AiFillGithub size={36} />
        </button>
      </div>
    </div>
  );
}

export default SignUp;
