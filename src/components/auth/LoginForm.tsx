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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center p-4 font-['DM_Sans']">
      <div className="absolute inset-0 bg-gradient-to-r from-[#8b3b9e]/10 via-[#be71d1]/5 to-[#e6c6ed]/10 animate-pulse" />
      
      <Card className="w-full max-w-[420px] relative bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl shadow-purple-200/50 overflow-hidden animate-float">
        <div className="absolute inset-0 bg-gradient-to-r from-[#8b3b9e]/5 to-[#be71d1]/5" />
        
        <CardHeader className="text-center space-y-3 pb-8 relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-r from-[#8b3b9e] to-[#be71d1] bg-clip-text text-transparent tracking-tight">
            PLM<span className="text-[#8b3b9e] font-black">•</span>Intelligence
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-900/90">Welcome Back</CardTitle>
          <CardDescription className="text-zinc-600 font-medium">Enter your credentials to continue</CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 pt-0 relative z-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 group">
              <Label 
                htmlFor="loginId" 
                className="text-sm font-semibold text-zinc-700 group-focus-within:text-[#8b3b9e] transition-colors duration-300"
              >
                Login ID
              </Label>
              <Input
                id="loginId"
                placeholder="e.g. eng001"
                className="h-12 bg-white/70 backdrop-blur-sm border border-white/50 hover:border-[#be71d1]/50 focus:border-[#8b3b9e]/70 focus:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-100"
                {...register("loginId")}
              />
              {errors.loginId && (
                <p className="text-sm text-red-400 font-medium">{errors.loginId.message}</p>
              )}
            </div>

            <div className="space-y-2 group">
              <Label 
                htmlFor="password" 
                className="text-sm font-semibold text-zinc-700 group-focus-within:text-[#8b3b9e] transition-colors duration-300"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 bg-white/70 backdrop-blur-sm border border-white/50 hover:border-[#be71d1]/50 focus:border-[#8b3b9e]/70 focus:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-100"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            {authError && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl p-3 text-center">
                <p className="text-sm text-red-600 font-semibold">{authError}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-[#8b3b9e] to-[#be71d1] text-white font-bold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-[#8b3b9e]/90 hover:to-[#be71d1]/90 transform hover:-translate-y-0.5 transition-all duration-300 border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "SIGN IN"
              )}
            </Button>

            <div className="pt-4 border-t border-white/20 flex justify-between text-sm">
              <Link 
                href="/forgot-password" 
                className="text-zinc-600 hover:text-[#8b3b9e] font-medium hover:underline transition-colors duration-200"
              >
                Forgot Password?
              </Link>
              <Link 
                href="/signup" 
                className="text-[#8b3b9e] hover:text-[#be71d1] font-semibold hover:underline transition-colors duration-200"
              >
                Create Account
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300..700;1,300..700&display=swap');
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
