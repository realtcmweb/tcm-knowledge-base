import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ''

if (!AUTH_SECRET) {
  console.error('[NextAuth] Missing AUTH_SECRET/NEXTAUTH_SECRET env variable!')
}

const AUTH_API_URL = process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL?.replace(':8000', ':8001') || 'https://coinss.noip.me:8001'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  providers: [
    // Google OAuth - use official provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Email/Password Credentials - 串 auth_api
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(`${AUTH_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })
        if (!res.ok) return null
        const data = await res.json()
        if (!data.token) return null
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id
      }
      if (account?.provider === 'google') {
        try {
          await fetch(`${AUTH_API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.image,
              }
            }),
          })
        } catch (e) { /* ignore */ }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.userId as string,
        },
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})