import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <LoginForm />
    </main>
  )
}
