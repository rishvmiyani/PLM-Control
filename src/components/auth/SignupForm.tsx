"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import Link from "next/link"

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
      .regex(/[^a-zA-Z0-9]/, "Must contain at least 1 special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loginId: data.loginId,
        email: data.email,
        password: data.password,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setIsLoading(false)
      if (json.field === "loginId") {
        setError("loginId", { message: json.error })
      } else if (json.field === "email") {
        setError("email", { message: json.error })
      } else {
        toast.error(json.error ?? "Signup failed")
      }
      return
    }

    // Auto-login after successful signup
    await signIn("credentials", {
      loginId: data.loginId,
      password: data.password,
      redirect: false,
    })

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 font-['DM_Sans']">
      <div className="absolute inset-0 bg-gradient-to-r from-[#8b3b9e]/5 via-[#be71d1]/3 to-[#e6c6ed]/5 animate-pulse" />
      
      <Card className="w-full max-w-[420px] relative backdrop-blur-xl bg-white/60 border-0 shadow-2xl shadow-[#8b3b9e]/10 before:absolute before:inset-0 before:backdrop-blur-[2px] before:bg-gradient-to-r before:from-[#8b3b9e]/10 before:to-[#be71d1]/5 before:rounded-2xl before:shadow-inner">
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-[#8b3b9e] to-[#be71d1] bg-clip-text text-transparent tracking-tight">
            PLM<span className="text-[#8b3b9e] font-normal">•</span>Intelligence
          </div>
          <CardTitle className="text-2xl font-semibold text-zinc-900/90">Create Account</CardTitle>
          <CardDescription className="text-zinc-500 font-medium">New users join as Engineering role</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label 
                htmlFor="loginId" 
                className="text-sm font-semibold text-zinc-800 tracking-wide"
              >
                Login ID
              </Label>
              <Input 
                id="loginId" 
                placeholder="6–12 characters" 
                className="h-12 backdrop-blur-sm bg-white/70 border-[#e6c6ed]/50 hover:border-[#be71d1]/70 focus:border-[#8b3b9e]/80 focus:ring-2 focus:ring-[#be71d1]/30 text-zinc-900 placeholder-zinc-400"
                {...register("loginId")}
              />
              {errors.loginId && (
                <p className="text-xs text-red-500 font-medium px-2">{errors.loginId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-semibold text-zinc-800 tracking-wide"
              >
                Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@company.com"
                className="h-12 backdrop-blur-sm bg-white/70 border-[#e6c6ed]/50 hover:border-[#be71d1]/70 focus:border-[#8b3b9e]/80 focus:ring-2 focus:ring-[#be71d1]/30 text-zinc-900 placeholder-zinc-400"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium px-2">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-semibold text-zinc-800 tracking-wide"
              >
                Password
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                className="h-12 backdrop-blur-sm bg-white/70 border-[#e6c6ed]/50 hover:border-[#be71d1]/70 focus:border-[#8b3b9e]/80 focus:ring-2 focus:ring-[#be71d1]/30 text-zinc-900 placeholder-zinc-400"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-500 font-medium px-2">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="confirmPassword" 
                className="text-sm font-semibold text-zinc-800 tracking-wide"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="h-12 backdrop-blur-sm bg-white/70 border-[#e6c6ed]/50 hover:border-[#be71d1]/70 focus:border-[#8b3b9e]/80 focus:ring-2 focus:ring-[#be71d1]/30 text-zinc-900 placeholder-zinc-400"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 font-medium px-2">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-[#8b3b9e] to-[#be71d1] hover:from-[#8b3b9e]/90 hover:to-[#be71d1]/90 shadow-lg shadow-[#8b3b9e]/20 hover:shadow-xl hover:shadow-[#be71d1]/30 font-semibold text-white text-lg backdrop-blur-sm border-0 transform hover:-translate-y-0.5 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "SIGN UP"}
            </Button>

            <p className="text-center text-sm text-zinc-600 font-medium leading-relaxed">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-[#8b3b9e] hover:text-[#be71d1] font-semibold hover:underline transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
