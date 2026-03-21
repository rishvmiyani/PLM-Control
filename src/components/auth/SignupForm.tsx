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
    <Card className="w-full max-w-[400px]">
      <CardHeader className="text-center space-y-1">
        <div className="text-2xl font-bold text-zinc-900 tracking-tight">
          PLM<span className="text-primary">•</span>Intelligence
        </div>
        <CardTitle className="text-xl">Create Account</CardTitle>
        <CardDescription>New users join as Engineering role</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="loginId">Login ID</Label>
            <Input id="loginId" placeholder="6–12 characters" {...register("loginId")} />
            {errors.loginId && (
              <p className="text-sm text-red-500">{errors.loginId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Re-Enter Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "SIGN UP"}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:text-zinc-900">
              Sign In
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
