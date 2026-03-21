"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Layers } from "lucide-react"

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})
type ForgotFormValues = z.infer<typeof forgotSchema>

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({ resolver: zodResolver(forgotSchema) })

  function onSubmit(_data: ForgotFormValues) {
    setSubmitted(true)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans', sans-serif", position: "relative" }}
    >
      {/* Orbs */}
      <div className="auth-orb-1" />
      <div className="auth-orb-2" />

      {/* Card */}
      <div
        className="glass-card w-full relative z-10"
        style={{ maxWidth: 420 }}
      >
        {/* Header */}
        <div className="text-center px-8 pt-8 pb-4">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#8b3b9e,#be71d1)" }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-lg font-bold"
              style={{
                background: "linear-gradient(90deg,#8b3b9e,#be71d1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PLM Intelligence
            </span>
          </div>

          <h1
            className="text-xl font-bold"
            style={{ color: "var(--deep)", letterSpacing: "-0.2px" }}
          >
            Reset Password
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-sub)" }}
          >
            Enter your registered email address
          </p>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 pt-2">
          {submitted ? (
            <div className="space-y-5 text-center">
              <div
                className="rounded-xl p-5"
                style={{
                  background: "rgba(139,59,158,0.07)",
                  border: "1px solid rgba(139,59,158,0.15)",
                }}
              >
                <p
                  className="text-sm font-medium leading-relaxed"
                  style={{ color: "var(--deep)" }}
                >
                  If this email is registered, a reset link has been sent.
                </p>
              </div>
              <Link
                href="/login"
                className="text-sm font-semibold block transition-colors"
                style={{ color: "var(--accent)" }}
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wide block"
                  style={{ color: "var(--deep)" }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="input-glass w-full px-4"
                  style={{ height: 48 }}
                  {...register("email")}
                />
                {errors.email && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(230,59,111,0.15)" }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#e63b6f" }}
                      />
                    </div>
                    <p className="text-xs font-medium" style={{ color: "#e63b6f" }}>
                      {errors.email.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary w-full font-semibold"
                style={{ height: 48, fontSize: "0.95rem" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending…" : "Send Reset Link"}
              </button>

              {/* Back link */}
              <Link
                href="/login"
                className="text-sm font-semibold block text-center transition-colors"
                style={{ color: "var(--accent)" }}
              >
                ← Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
