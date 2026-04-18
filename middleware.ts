import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isLoggedIn = !!token
  const role = token?.role as string | undefined

  // ── Espace membre (/member/*)
  if (pathname.startsWith('/member')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
    }
  }

  // ── Espace coach (/coach/*)
  if (pathname.startsWith('/coach')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
    }
    if (role !== 'ADMIN' && role !== 'COACH') {
      return NextResponse.redirect(new URL('/member/dashboard', req.url))
    }
  }

  // ── Espace admin (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/member/dashboard', req.url))
    }
  }

  // ── Redirection si déjà connecté sur pages auth
  if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    if (role === 'COACH') return NextResponse.redirect(new URL('/coach/dashboard', req.url))
    return NextResponse.redirect(new URL('/member/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/member/:path*',
    '/coach/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}
