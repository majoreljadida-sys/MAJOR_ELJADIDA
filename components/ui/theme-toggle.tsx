'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [light, setLight] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') {
      setLight(true)
      document.documentElement.classList.add('light')
    }
  }, [])

  function toggle() {
    const next = !light
    setLight(next)
    if (next) {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    }
  }

  return (
    <button
      onClick={toggle}
      title={light ? 'Passer en mode sombre' : 'Passer en mode clair'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-inter font-medium transition-all ${
        light
          ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          : 'border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-gray-500'
      } ${className}`}
    >
      {light
        ? <><Moon size={13} /> Sombre</>
        : <><Sun  size={13} /> Clair</>
      }
    </button>
  )
}
