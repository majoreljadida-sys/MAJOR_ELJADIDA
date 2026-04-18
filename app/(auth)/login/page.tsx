'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/member/dashboard'
  const errorParam   = searchParams.get('error')

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(errorParam === 'CredentialsSignin' ? 'Email ou mot de passe incorrect.' : '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email:    form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest mb-2">CONNEXION</h1>
        <p className="text-gray-400 font-inter text-sm">Accédez à votre espace membre Club MAJOR</p>
      </div>

      <div className="card-dark">
        {error && (
          <div className="flex items-center gap-2.5 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 mb-5 text-red-400 text-sm font-inter">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Adresse email</label>
            <input type="email" className="input-dark" placeholder="votre@email.com" autoComplete="email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="form-label !mb-0">Mot de passe</label>
              <Link href="/forgot-password" className="text-xs text-major-accent hover:text-major-primary transition-colors font-inter">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input-dark pr-10" placeholder="••••••••"
                autoComplete="current-password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading
              ? <span className="font-inter text-sm">Connexion...</span>
              : <><LogIn size={16} /><span className="font-inter text-sm font-semibold">Se connecter</span></>
            }
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm font-inter mt-6">
          Pas encore membre ?{' '}
          <Link href="/register" className="text-major-accent hover:text-major-primary transition-colors font-medium">
            Adhérer au club
          </Link>
        </p>
      </div>

      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-major-surface/50 border border-gray-800 rounded-xl text-xs font-inter text-gray-500 space-y-1">
        <p className="font-semibold text-gray-400 mb-2">Comptes de démonstration :</p>
        <p>Admin : <span className="text-gray-300">admin@clubmajor.ma</span> / <span className="text-gray-300">Admin@Major2025</span></p>
        <p>Coach : <span className="text-gray-300">youssef.coach@clubmajor.ma</span> / <span className="text-gray-300">Coach@2025</span></p>
        <p>Membre : <span className="text-gray-300">mohammed.alami@email.com</span> / <span className="text-gray-300">Member@2025</span></p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-gray-400 font-inter text-sm text-center py-8">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  )
}
