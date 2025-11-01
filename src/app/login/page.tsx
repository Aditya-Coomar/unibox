"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, useSession } from "@/lib/auth-client";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
  }>({});

  // Get callback URL from search params
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push(callbackUrl);
    }
  }, [session, isPending, router, callbackUrl]);

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Don't show form if already logged in (prevents flash)
  if (session?.user) {
    return null;
  }

  // Form validation
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (isSignUp) {
      if (!name) {
        newErrors.name = "Name is required";
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp.email({
          email,
          password,
          name,
        });

        if (result.error) {
          toast.error(result.error.message || "Sign up failed");
          return;
        }

        toast.success("Account created successfully! You can now sign in.");
        setIsSignUp(false);
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setErrors({});
      } else {
        const result = await signIn.email({
          email,
          password,
        });

        if (result.error) {
          toast.error(result.error.message || "Sign in failed");
          return;
        }

        toast.success("Signed in successfully!");
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });

      if (result.error) {
        toast.error(result.error.message || "Google sign in failed");
      }
    } catch (error) {
      console.error("Google auth error:", error);
      toast.error("Google sign in failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <MessageSquare className="h-6 w-6" />
              <span className="text-xl font-bold">UniBox</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {isSignUp ? "Create account" : "Welcome back"}
              </h1>
              <p className="text-neutral-400">
                {isSignUp
                  ? "Sign up to get started with UniBox"
                  : "Sign in to your account to continue"}
              </p>
            </div>

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              variant="outline"
              className="w-full border-neutral-800 hover:bg-neutral-800 mb-6"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-900 text-neutral-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`bg-black border-neutral-800 focus:border-white pl-10 ${
                        errors.name ? "border-red-500 focus:border-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-400">{errors.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-black border-neutral-800 focus:border-white pl-10 ${
                      errors.email ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-black border-neutral-800 focus:border-white pl-10 pr-10 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
                {isSignUp && (
                  <p className="text-xs text-neutral-400">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`bg-black border-neutral-800 focus:border-white pl-10 pr-10 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3 text-neutral-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2 rounded border-neutral-800 bg-black"
                    />
                    <span className="text-neutral-400">Remember me</span>
                  </label>
                  <Link
                    href="#"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-neutral-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={toggleMode}
                disabled={isLoading || isGoogleLoading}
                className="ml-1 text-white hover:underline disabled:opacity-50"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-neutral-400 mt-8">
            By continuing, you agree to our{" "}
            <Link href="#" className="text-white hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-white hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
