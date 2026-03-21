"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  loginId: z.string().min(1, "Login ID is required"),
  password: z.string().min(1, "Password is required"),
})
type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormValues) {
    setAuthError("")
    const result = await signIn("credentials", {
      loginId: data.loginId,
      password: data.password,
      redirect: false,
    })
    if (result?.error) {
      setAuthError("Invalid Login ID or password")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
<<<<<<< HEAD
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
=======
    <div
      style={{
        width: "100%",
        maxWidth: 460,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 8px 40px rgba(139,59,158,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
        padding: "40px 40px 36px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 20px rgba(139,59,158,0.35)",
          }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
              PLM
            </span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#8b3b9e",
            textTransform: "uppercase",
          }}>
            Product Lifecycle
          </span>
        </div>
      </div>

      {/* Heading */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "1.65rem",
          fontWeight: 700,
          color: "#2d1a38",
          letterSpacing: "-0.4px",
          marginBottom: 6,
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#7c5f8a", margin: 0 }}>
          Sign in to your account to continue
        </p>
      </div>

      {/* Auth error */}
      {authError && (
        <div style={{
          background: "rgba(230,59,111,0.08)",
          border: "1px solid rgba(230,59,111,0.2)",
          borderRadius: 12, padding: "10px 14px",
          color: "#e63b6f", fontSize: "0.85rem",
          fontWeight: 500, marginBottom: 16,
        }}>
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Login ID */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#3b1a47",
            marginBottom: 8,
          }}>
            Login ID
          </label>
          <input
            type="text"
            placeholder="Enter your login ID"
            style={{
              width: "100%",
              height: 50,
              padding: "0 16px",
              background: "rgba(255,255,255,0.65)",
              border: errors.loginId
                ? "1px solid rgba(230,59,111,0.5)"
                : "1px solid rgba(190,113,209,0.25)",
              borderRadius: 12,
              fontSize: "0.93rem",
              color: "#2d1a38",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              boxSizing: "border-box",
              transition: "border 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid rgba(139,59,158,0.5)"
              e.target.style.boxShadow = "0 0 0 3px rgba(139,59,158,0.10)"
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(190,113,209,0.25)"
              e.target.style.boxShadow = "none"
            }}
            {...register("loginId")}
          />
          {errors.loginId && (
            <p style={{ color: "#e63b6f", fontSize: "0.78rem", marginTop: 5, fontWeight: 500 }}>
              {errors.loginId.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#3b1a47",
            marginBottom: 8,
          }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              style={{
                width: "100%",
                height: 50,
                padding: "0 46px 0 16px",
                background: "rgba(255,255,255,0.65)",
                border: errors.password
                  ? "1px solid rgba(230,59,111,0.5)"
                  : "1px solid rgba(190,113,209,0.25)",
                borderRadius: 12,
                fontSize: "0.93rem",
                color: "#2d1a38",
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box",
                transition: "border 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(139,59,158,0.5)"
                e.target.style.boxShadow = "0 0 0 3px rgba(139,59,158,0.10)"
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(190,113,209,0.25)"
                e.target.style.boxShadow = "none"
              }}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none",
                cursor: "pointer", color: "#9b6aab",
                display: "flex", alignItems: "center",
                padding: 0,
              }}
            >
              {showPassword
                ? <EyeOff style={{ width: 18, height: 18 }} />
                : <Eye style={{ width: 18, height: 18 }} />
              }
            </button>
          </div>
          {/* Forgot password — right aligned under password */}
          <div style={{ textAlign: "right", marginTop: 8 }}>
            <Link
              href="/forgot-password"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#8b3b9e",
                textDecoration: "none",
              }}
            >
              Forgot Password?
            </Link>
          </div>
          {errors.password && (
            <p style={{ color: "#e63b6f", fontSize: "0.78rem", marginTop: 4, fontWeight: 500 }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            height: 52,
            background: isSubmitting
              ? "rgba(139,59,158,0.5)"
              : "linear-gradient(135deg,#8b3b9e 0%,#a855c0 50%,#be71d1 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: "0.97rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 6px 20px rgba(139,59,158,0.32)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"
              ;(e.target as HTMLButtonElement).style.boxShadow = "0 10px 28px rgba(139,59,158,0.40)"
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = "translateY(0)"
            ;(e.target as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(139,59,158,0.32)"
          }}
        >
          {isSubmitting ? "Signing in…" : "Sign In"}
        </button>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          color: "#b89ec4", fontSize: "0.82rem",
        }}>
          <div style={{ flex: 1, height: 1, background: "rgba(190,113,209,0.2)" }} />
          or
          <div style={{ flex: 1, height: 1, background: "rgba(190,113,209,0.2)" }} />
        </div>

        {/* Sign up link */}
        <p style={{
          textAlign: "center",
          fontSize: "0.88rem",
          color: "#7c5f8a",
          margin: 0,
        }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "#8b3b9e",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Sign Up
          </Link>
        </p>

      </form>
>>>>>>> beed07c (add new files and updates)
    </div>
  )
}

export default LoginForm
