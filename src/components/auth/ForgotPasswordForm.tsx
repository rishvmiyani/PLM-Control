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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "linear-gradient(135deg, #f9f0fc 0%, #f3e8fb 30%, #ede0f8 60%, #e6c6ed 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fluid glass orbs in background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
      }}>
        <div style={{
          position: "absolute", top: "-80px", left: "-80px",
          width: "380px", height: "380px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(190,113,209,0.22) 0%, rgba(139,59,158,0.08) 60%, transparent 100%)",
          filter: "blur(40px)",
          animation: "orb1 8s ease-in-out infinite alternate",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", right: "-60px",
          width: "320px", height: "320px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,198,237,0.35) 0%, rgba(190,113,209,0.12) 60%, transparent 100%)",
          filter: "blur(36px)",
          animation: "orb2 10s ease-in-out infinite alternate",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "60%",
          width: "220px", height: "220px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,59,158,0.10) 0%, transparent 70%)",
          filter: "blur(28px)",
          animation: "orb3 12s ease-in-out infinite alternate",
        }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        @keyframes orb1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes orb2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-30px, -20px) scale(1.06); }
        }
        @keyframes orb3 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, -30px) scale(1.1); }
        }

        .fluid-card {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(28px) saturate(1.6);
          -webkit-backdrop-filter: blur(28px) saturate(1.6);
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 24px;
          box-shadow:
            0 8px 32px rgba(139, 59, 158, 0.10),
            0 2px 8px rgba(190, 113, 209, 0.08),
            inset 0 1px 0 rgba(255,255,255,0.80);
        }

        .fluid-input {
          height: 52px;
          padding: 0 1rem;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(230,198,237,0.55);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: #27272a;
          box-shadow: inset 0 1px 3px rgba(139,59,158,0.06), 0 2px 8px rgba(190,113,209,0.07);
          transition: all 0.25s ease;
          outline: none;
          width: 100%;
        }
        .fluid-input::placeholder { color: #a78bb2; }
        .fluid-input:hover {
          border-color: rgba(190,113,209,0.5);
          box-shadow: inset 0 1px 3px rgba(139,59,158,0.08), 0 4px 12px rgba(190,113,209,0.13);
        }
        .fluid-input:focus {
          border-color: rgba(139,59,158,0.55);
          box-shadow: 0 0 0 3px rgba(190,113,209,0.20), inset 0 1px 3px rgba(139,59,158,0.08);
        }

        .fluid-btn {
          width: 100%;
          height: 52px;
          background: linear-gradient(135deg, #8b3b9e 0%, #a855c0 50%, #be71d1 100%);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.97rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 12px;
          cursor: pointer;
          box-shadow:
            0 6px 20px rgba(139,59,158,0.30),
            0 1px 4px rgba(139,59,158,0.20),
            inset 0 1px 0 rgba(255,255,255,0.20);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .fluid-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          border-radius: 12px;
          pointer-events: none;
        }
        .fluid-btn:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.01);
          box-shadow:
            0 10px 28px rgba(139,59,158,0.38),
            0 2px 6px rgba(139,59,158,0.22),
            inset 0 1px 0 rgba(255,255,255,0.22);
        }
        .fluid-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }
        .fluid-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .success-glass {
          background: rgba(230,198,237,0.30);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.70);
        }

        .back-link {
          display: block;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: #7c4f90;
          text-decoration: none;
          transition: all 0.22s ease;
        }
        .back-link:hover {
          color: #8b3b9e;
          transform: scale(1.04);
        }

        .brand-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.65rem;
          font-weight: 700;
          background: linear-gradient(90deg, #8b3b9e 0%, #be71d1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.3px;
        }
        .brand-dot {
          -webkit-text-fill-color: #8b3b9e;
          font-weight: 900;
        }

        .error-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          font-size: 0.8rem;
          color: #e05c6b;
          font-weight: 500;
        }
        .error-dot {
          width: 14px; height: 14px;
          background: rgba(224,92,107,0.15);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .error-dot-inner {
          width: 6px; height: 6px;
          background: #e05c6b;
          border-radius: 50%;
        }
      `}</style>

      <Card
        className="fluid-card w-full"
        style={{ maxWidth: "420px", border: "none", background: "transparent", boxShadow: "none", position: "relative", zIndex: 1 }}
      >
        <CardHeader className="text-center space-y-2 pt-8 pb-2">
          <div className="brand-text">
            PLM<span className="brand-dot">•</span>Intelligence
          </div>
          <CardTitle
            style={{
              fontSize: "1.35rem",
              fontWeight: 600,
              color: "#2d1a38",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.2px",
            }}
          >
            Reset Password
          </CardTitle>
          <CardDescription
            style={{
              fontSize: "0.85rem",
              color: "#7c5f8a",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Enter your registered email address
          </CardDescription>
        </CardHeader>

        <CardContent style={{ padding: "1.5rem 2rem 2rem" }}>
          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="success-glass">
                <p style={{
                  color: "#3d1f4e",
                  fontWeight: 500,
                  fontSize: "0.97rem",
                  lineHeight: 1.6,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  If this email is registered, a reset link has been sent.
                </p>
              </div>
              <Link href="/login" className="back-link">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#4a2d5a",
                    letterSpacing: "0.03em",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Email Address
                </Label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="fluid-input"
                  {...register("email")}
                />
                {errors.email && (
                  <div className="error-msg">
                    <div className="error-dot">
                      <div className="error-dot-inner" />
                    </div>
                    {errors.email.message}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="fluid-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending…" : "Send Reset Link"}
              </button>

              <Link href="/login" className="back-link">
                ← Back to Login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}