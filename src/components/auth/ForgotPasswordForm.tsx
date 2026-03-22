"use client"

import { useState } from "react"
import { useForm }  from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z }        from "zod"
import Link         from "next/link"

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})
type ForgotFormValues = z.infer<typeof forgotSchema>

const font = "'DM Sans', sans-serif"

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
    <>
      <style>{styles}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: font, position: "relative",
        background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 40%, #faf5ff 100%)",
        overflow: "hidden",
      }}>

        {/* Background orbs */}
        <div style={{
          position: "fixed", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(190,113,209,0.22) 0%, transparent 70%)",
          top: -120, left: -120, filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "fixed", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,59,158,0.16) 0%, transparent 70%)",
          bottom: -80, right: -80, filter: "blur(60px)", pointerEvents: "none",
        }} />

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: 420, position: "relative", zIndex: 10,
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          background: "rgba(255,255,255,0.70)",
          border: "1.5px solid rgba(190,113,209,0.25)",
          borderRadius: 24,
          boxShadow: "0 8px 40px rgba(139,59,158,0.13)",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{ textAlign: "center", padding: "36px 32px 20px" }}>

            {/* Logo */}
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
              background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(139,59,158,0.35)",
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: 0 }}>
                PLM
              </span>
            </div>

            <p style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.14em",
              color: "#8b3b9e", margin: "0 0 12px", textTransform: "uppercase",
            }}>
              Product Lifecycle
            </p>

            <h1 style={{
              fontSize: "1.5rem", fontWeight: 800,
              color: "#2d1a38", margin: "0 0 6px", letterSpacing: "-0.3px",
            }}>
              Reset password
            </h1>
            <p style={{ fontSize: 13, color: "#9b6aab", margin: 0 }}>
              We&apos;ll send you a link to reset your password
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "12px 32px 36px" }}>

            {submitted ? (
              /* ── Success state ── */
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
                  background: "rgba(34,197,94,0.10)",
                  border: "2px solid rgba(34,197,94,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                }}>
                  ✓
                </div>
                <div style={{
                  background: "rgba(139,59,158,0.06)",
                  border: "1px solid rgba(139,59,158,0.15)",
                  borderRadius: 14, padding: "16px 20px", marginBottom: 20,
                }}>
                  <p style={{ fontSize: 13, color: "#2d1a38", margin: 0, lineHeight: 1.6 }}>
                    If this email is registered, a reset link has been sent. Check your inbox.
                  </p>
                </div>
                <Link href="/login" style={{
                  fontSize: 13, fontWeight: 700, color: "#8b3b9e", textDecoration: "none",
                }}>
                  ← Back to Login
                </Link>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit(onSubmit)}>

                {/* Email */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 700,
                    color: "#4a2d5a", marginBottom: 7,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                  }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="fp-input"
                    style={{
                      width: "100%", height: 50, padding: "0 16px",
                      background: "rgba(245,240,252,0.7)",
                      border: errors.email
                        ? "1.5px solid rgba(230,59,111,0.55)"
                        : "1.5px solid rgba(190,113,209,0.25)",
                      borderRadius: 12, fontSize: 14,
                      color: "#2d1a38", outline: "none",
                      fontFamily: font, boxSizing: "border-box",
                      transition: "border 0.2s, box-shadow 0.2s",
                    }}
                    {...register("email")}
                  />
                  {errors.email && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginTop: 6,
                    }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: "rgba(230,59,111,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "#e63b6f",
                        }} />
                      </div>
                      <p style={{ fontSize: 11, color: "#e63b6f", margin: 0, fontWeight: 600 }}>
                        {errors.email.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: "100%", height: 50, borderRadius: 12,
                    background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
                    border: "none", color: "#fff",
                    fontSize: 14, fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontFamily: font, opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: "0 4px 18px rgba(139,59,158,0.35)",
                    marginBottom: 18,
                    transition: "opacity 0.2s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {isSubmitting ? "Sending…" : "Send Reset Link"}
                </button>

                {/* Back link */}
                <div style={{ textAlign: "center" }}>
                  <Link href="/login" style={{
                    fontSize: 13, fontWeight: 700,
                    color: "#8b3b9e", textDecoration: "none",
                  }}>
                    ← Back to Login
                  </Link>
                </div>

              </form>
            )}
          </div>

        </div>

        {/* Bottom tab nav (matches your screenshot) */}
        <div style={{
          position: "fixed", bottom: 28,
          display: "flex", gap: 0,
          background: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(190,113,209,0.2)",
          borderRadius: 999, padding: 4,
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(139,59,158,0.10)",
        }}>
          {[
            { label: "login",            href: "/login"           },
            { label: "signup",           href: "/signup"          },
            { label: "forgot-password",  href: "/forgot-password" },
          ].map((tab) => {
            const active = tab.href === "/forgot-password"
            return (
              <Link key={tab.href} href={tab.href} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "7px 18px", borderRadius: 999,
                  fontSize: 12, fontWeight: 700,
                  background: active
                    ? "linear-gradient(135deg,#8b3b9e,#be71d1)"
                    : "transparent",
                  color: active ? "#fff" : "#9b6aab",
                  transition: "all 0.2s",
                }}>
                  {tab.label}
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </>
  )
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');

  .fp-input:focus {
    border: 1.5px solid rgba(139,59,158,0.55) !important;
    box-shadow: 0 0 0 3px rgba(139,59,158,0.09);
  }
`

export default ForgotPasswordForm
