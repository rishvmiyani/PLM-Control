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

const loginSchema = z.object({
  loginId: z.string().min(1, "Login ID is required"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setAuthError(null)

    const result = await signIn("credentials", {
      loginId: data.loginId,
      password: data.password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setAuthError("Invalid Login Id or Password")
      toast.error("Invalid Login Id or Password")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader className="text-center space-y-1">
        <div className="text-2xl font-bold text-zinc-900 tracking-tight">
          PLM<span className="text-primary">•</span>Intelligence
        </div>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="loginId">Login ID</Label>
            <Input
              id="loginId"
              placeholder="e.g. eng001"
              {...register("loginId")}
            />
            {errors.loginId && (
              <p className="text-sm text-red-500">{errors.loginId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {authError && (
            <p className="text-sm text-red-500 text-center font-medium">
              {authError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "SIGN IN"}
          </Button>

          <div className="flex justify-between text-sm text-zinc-500 pt-1">
            <Link href="/forgot-password" className="hover:text-zinc-900">
              Forget Password?
            </Link>
            <Link href="/signup" className="hover:text-zinc-900 font-medium">
              Sign Up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
