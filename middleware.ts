import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  const isLoggedIn = !!session
  const role = (session?.user?.role as string | undefined)?.toLowerCase()

  if (pathname.startsWith('/member')) {
    if (!isLoggedIn)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
  }

  if (pathname.startsWith('/coach')) {
    if (!isLoggedIn)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
    if (role !== 'admin' && role !== 'coach')
      return NextResponse.redirect(new URL('/member/dashboard', req.url))
  }

  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
    if (role !== 'admin')
      return NextResponse.redirect(new URL('/member/dashboard', req.url))
  }

  if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
    // Lien d'invitation depuis un email : on laisse passer, la page va déconnecter
    // la session existante avant d'afficher le formulaire (évite qu'un destinataire
    // tombe sur le dashboard de l'admin si celui-ci est connecté sur le même navigateur).
    if (req.nextUrl.searchParams.get('invite') === '1') return NextResponse.next()
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    if (role === 'coach') return NextResponse.redirect(new URL('/coach/trainings', req.url))
    return NextResponse.redirect(new URL('/member/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/member/:path*',
    '/coach/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}