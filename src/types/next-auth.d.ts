import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id:      string
    loginId: string
    role:    string
  }
  interface Session {
    user: {
      id:      string
      loginId: string
      role:    string
      email:   string
      name?:   string
      image?:  string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:      string
    loginId: string
    role:    string
  }
}
