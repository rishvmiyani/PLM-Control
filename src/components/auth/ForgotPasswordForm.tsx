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
    <Card className="w-full max-w-[400px]">
      <CardHeader className="text-center space-y-1">
        <div className="text-2xl font-bold text-zinc-900 tracking-tight">
          PLM<span className="text-primary">•</span>Intelligence
        </div>
        <CardTitle className="text-xl">Reset Password</CardTitle>
        <CardDescription>Enter your registered email</CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="space-y-4">
            <p className="text-sm text-center text-zinc-600 bg-zinc-100 rounded-md p-3">
              If this email is registered, a reset link has been sent.
            </p>
            <Link href="/login" className="block text-center text-sm text-zinc-500 hover:text-zinc-900">
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Send Reset Link
            </Button>
            <Link href="/login" className="block text-center text-sm text-zinc-500 hover:text-zinc-900">
              ← Back to Login
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
