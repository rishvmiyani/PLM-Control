"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const signupSchema = z
  .object({
    loginId: z
      .string()
      .min(6, "Login ID must be 6–12 characters")
      .max(12, "Login ID must be 6–12 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
      .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
      .regex(/[0-9]/, "Must contain at least 1 number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least 1 special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: data.loginId,
          email: data.email,
          password: data.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        if (json.field === "loginId") {
          setError("loginId", { message: json.error });
        } else if (json.field === "email") {
          setError("email", { message: json.error });
        } else {
          toast.error(json.error ?? "Signup failed");
        }
        return;
      }

      // Auto-login after successful signup
      const loginRes = await signIn("credentials", {
        loginId: data.loginId,
        password: data.password,
        redirect: false,
      });

      if (loginRes?.error) {
        toast.error("Account created, but login failed. Please sign in manually.");
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
        toast.success("Account created successfully!");
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/70 via-white/50 to-purple-50/70 flex items-center justify-center p-4 relative overflow-hidden font-['DM_Sans']">
      {/* Background orbs */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#8b3b9e]/10 via-[#be71d1]/5 to-[#e6c6ed]/10" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#8b3b9e]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#be71d1]/20 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative backdrop-blur-xl bg-white/60 border-0 shadow-2xl shadow-purple-500/15 before:absolute before:inset-0 before:backdrop-blur-sm before:bg-gradient-to-r before:from-purple-500/10 before:to-pink-500/5 before:rounded-3xl before:shadow-inner">
        <CardHeader className="text-center space-y-4 pb-8 pt-12">
          {/* Logo */}
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#8b3b9e] to-[#be71d1] rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <span className="text-2xl font-black text-white tracking-tight">PLM</span>
          </div>

          {/* Subtitle */}
          <div className="text-xs font-black uppercase tracking-widest text-purple-600/90 mb-3">
            Product Lifecycle
          </div>

          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-zinc-900/95 via-zinc-900 to-zinc-900/80 bg-clip-text text-transparent">
            Create account
          </CardTitle>
          <CardDescription className="text-zinc-500 font-medium text-sm">
            Join our engineering platform. New users get ENGINEERING role.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Login ID */}
            <div className="space-y-2">
              <Label
                htmlFor="loginId"
                className="text-sm font-semibold tracking-wide text-zinc-800 uppercase"
              >
                Login ID
              </Label>
              <Input
                id="loginId"
                placeholder="e.g. eng01"
                className="h-12 backdrop-blur-sm bg-white/80 border-purple-200/50 hover:border-purple-400/70 focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-0 text-zinc-900 placeholder-zinc-400 shadow-sm transition-all duration-200"
                {...register("loginId")}
              />
              {errors.loginId && (
                <p className="text-xs text-red-500 font-medium px-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {errors.loginId.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold tracking-wide text-zinc-800 uppercase"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="h-12 backdrop-blur-sm bg-white/80 border-purple-200/50 hover:border-purple-400/70 focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-0 text-zinc-900 placeholder-zinc-400 shadow-sm transition-all duration-200"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium px-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold tracking-wide text-zinc-800 uppercase"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 backdrop-blur-sm bg-white/80 border-purple-200/50 hover:border-purple-400/70 focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-0 text-zinc-900 placeholder-zinc-400 shadow-sm transition-all duration-200"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium px-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold tracking-wide text-zinc-800 uppercase"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 backdrop-blur-sm bg-white/80 border-purple-200/50 hover:border-purple-400/70 focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-0 text-zinc-900 placeholder-zinc-400 shadow-sm transition-all duration-200"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 font-medium px-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold text-sm tracking-wide shadow-lg hover:shadow-purple-500/30 active:scale-99 transition-all duration-150"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="text-center text-sm text-zinc-600 flex items-center justify-center gap-1">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
