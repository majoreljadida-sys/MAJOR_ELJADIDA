'use client'
import Image from 'next/image'
import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/context'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
  textSize?: 'sm' | 'md' | 'lg' | 'xl'
}

// SVG inline du logo (affiché si logo_major.png absent)
function LogoSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2D8C6E" />
          <stop offset="100%" stopColor="#1A5C47" />
        </radialGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2D8C6E" />
          <stop offset="100%" stopColor="#3ABFBF" />
        </linearGradient>
      </defs>
      {/* Cercle principal */}
      <circle cx="60" cy="60" r="57" fill="url(#bgGrad)" stroke="#3ABFBF" strokeWidth="2" />
      <circle cx="60" cy="60" r="49" fill="none" stroke="#4CAF82" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
      {/* Silhouette coureur */}
      <ellipse cx="60" cy="26" rx="8" ry="8" fill="#FFFFFF" opacity="0.95" />
      <path d="M60 34 L54 55 L45 70 M60 34 L66 55 L75 70 M43 47 L78 43" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.95" />
      {/* Cheval gauche */}
      <path d="M20 50 Q15 40 22 33 Q28 30 32 38 Q34 44 30 50 Q26 53 20 50Z" fill="#4CAF82" opacity="0.7" />
      <path d="M22 50 Q18 58 20 65 L24 64 Q22 58 26 52Z" fill="#4CAF82" opacity="0.7" />
      {/* Cheval droit */}
      <path d="M100 50 Q105 40 98 33 Q92 30 88 38 Q86 44 90 50 Q94 53 100 50Z" fill="#4CAF82" opacity="0.7" />
      <path d="M98 50 Q102 58 100 65 L96 64 Q98 58 94 52Z" fill="#4CAF82" opacity="0.7" />
      {/* Ligne décorative */}
      <line x1="20" y1="78" x2="100" y2="78" stroke="url(#lineGrad)" strokeWidth="1.5" />
      {/* Texte MAJOR */}
      <text x="60" y="97" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontFamily="Impact, 'Arial Narrow', sans-serif" letterSpacing="6" fontWeight="700">MAJOR</text>
    </svg>
  )
}

export function Logo({ size = 48, className = '', showText = false, textSize = 'md' }: LogoProps) {
  const [imgError, setImgError] = useState(false)
  const { lang } = useLanguage()
  const isAr = lang === 'ar'

  const textSizeMap = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className="relative flex-shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: '18%',
          background: 'linear-gradient(145deg, #1e3a2f 0%, #0d1f17 60%, #0a1510 100%)',
          boxShadow: `
            0 ${size * 0.08}px ${size * 0.18}px rgba(0,0,0,0.7),
            0 ${size * 0.03}px ${size * 0.06}px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(45,140,110,0.3),
            inset 0 -1px 0 rgba(0,0,0,0.4),
            0 0 ${size * 0.25}px rgba(45,140,110,0.25)
          `,
          transform: 'perspective(400px) rotateX(4deg)',
          padding: '6%',
        }}
      >
        {/* Reflet haut */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '40%', borderRadius: '18% 18% 50% 50% / 18% 18% 30% 30%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {!imgError ? (
          <Image
            src="/logo_major.png"
            alt="Club MAJOR"
            width={size}
            height={size}
            className="object-contain w-full h-full relative z-10"
            onError={() => setImgError(true)}
            priority
          />
        ) : (
          <LogoSVG size={size} />
        )}
      </div>
      {showText && (
        isAr ? (
          <div className="flex flex-col leading-none" dir="rtl">
            <span className={`font-cairo ${textSizeMap[textSize]} text-white font-bold leading-tight`}>
              ماجور
            </span>
            <span className="text-[15px] font-cairo text-major-accent leading-tight opacity-90 whitespace-nowrap font-semibold">
              بالفرح والسرور
            </span>
          </div>
        ) : (
          <div className="flex flex-col leading-none">
            <span className={`font-bebas ${textSizeMap[textSize]} text-white tracking-widest leading-none`}>
              MAJOR
            </span>
            <span className="text-[9px] font-inter text-major-accent uppercase tracking-widest opacity-80">
              El Jadida
            </span>
          </div>
        )
      )}
    </div>
  )
}

export default Logo
