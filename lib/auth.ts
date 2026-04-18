import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn:  '/login',
    signOut: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',           type: 'email'    },
        password: { label: 'Mot de passe',    type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            member: { select: { id: true, firstName: true, lastName: true, photo: true, status: true } },
            coach:  { select: { id: true, firstName: true, lastName: true, photo: true } },
          },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null

        const profile = user.member ?? user.coach
        const firstName = profile?.firstName ?? ''
        const lastName  = profile?.lastName  ?? ''

        return {
          id:        user.id,
          email:     user.email,
          role:      user.role,
          name:      `${firstName} ${lastName}`.trim() || user.email,
          image:     profile?.photo ?? null,
          profileId: profile?.id ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id
        token.role      = (user as any).role
        token.profileId = (user as any).profileId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id        = token.id as string
        session.user.role      = token.role as string
        session.user.profileId = token.profileId as string
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
