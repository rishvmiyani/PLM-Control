"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import Link from "next/link"

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})
type ForgotFormValues = z.infer<typeof forgotSchema>

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ForgotFormValues>({ resolver: zodResolver(forgotSchema) })

  function onSubmit(_data: ForgotFormValues) {
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6c6ed]/20 via-white/50 to-[#be71d1]/10 backdrop-blur-xl flex items-center justify-center p-4 font-['DM_Sans']">
      <div className="absolute inset-0 bg-gradient-to-r from-[#8b3b9e]/10 to-[#be71d1]/10 animate-pulse" />
      
      <Card className="w-full max-w-[420px] bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-[#8b3b9e]/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#8b3b9e]/5 before:to-[#be71d1]/5 before:rounded-2xl before:shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#8b3b9e]/5 to-[#be71d1]/5" />
        
        <CardHeader className="text-center space-y-2 relative z-10 pt-8">
          <div className="text-3xl font-bold bg-gradient-to-r from-[#8b3b9e] to-[#be71d1] bg-clip-text text-transparent tracking-tight drop-shadow-lg">
            PLM<span className="text-[#8b3b9e] font-black drop-shadow-sm">•</span>Intelligence
          </div>
          <CardTitle className="text-2xl font-semibold text-zinc-800 drop-shadow-sm">Reset Password</CardTitle>
          <CardDescription className="text-zinc-600 text-sm">Enter your registered email address</CardDescription>
        </CardHeader>
        
        <CardContent className="p-8 relative z-10">
          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="bg-gradient-to-r from-[#e6c6ed]/30 to-[#be71d1]/20 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-xl">
                <p className="text-zinc-700 font-medium text-lg">
                  If this email is registered, a reset link has been sent.
                </p>
              </div>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-[#8b3b9e] transition-all duration-300 hover:scale-105 group"
              >
                ← Back to Login
                <span className="w-4 h-4 border border-zinc-400 rounded-full group-hover:border-[#8b3b9e] group-hover:rotate-45 transition-all duration-300" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-zinc-700 tracking-wide"
                >
                  Email Address
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@company.com"
                  className="h-14 px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-[#8b3b9e]/20 hover:border-[#8b3b9e]/30 focus-visible:ring-2 focus-visible:ring-[#be71d1]/50 focus-visible:border-[#8b3b9e]/50 transition-all duration-300 text-zinc-800 placeholder-zinc-500 rounded-xl"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-400 font-medium flex items-center gap-2">
                    <span className="w-4 h-4 bg-red-400/20 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                    </span>
                    {errors.email.message}
                  </p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-[#8b3b9e] to-[#be71d1] text-white font-semibold text-lg shadow-xl shadow-[#8b3b9e]/25 hover:shadow-[#8b3b9e]/40 hover:scale-[1.02] hover:from-[#7a3090] hover:to-[#a55fb9] focus-visible:ring-4 focus-visible:ring-[#be71d1]/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20" 
                disabled={isSubmitting}
              >
                Send Reset Link
              </Button>
              
              <Link 
                href="/login" 
                className="block text-center text-sm font-medium text-zinc-600 hover:text-[#8b3b9e] transition-all duration-300 hover:scale-105 group"
              >
                ← Back to Login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
