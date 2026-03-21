import { SignupForm } from "@/components/auth/SignupForm"

export default function SignupPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <SignupForm />
    </main>
  )
}
