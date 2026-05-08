'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  size?: number
  className?: string
  audio?: boolean
  audioSrc?: string
}

export function DynamicLogo({
  size = 240,
  className = '',
  audio = true,
  audioSrc = '/hymne-major.mp3',
}: Props) {
  const particlesRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [soundOn, setSoundOn] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const container = particlesRef.current
    if (!container) return
    container.innerHTML = ''
    const count = 25
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      p.className = 'mlogo-particle'
      const startX = Math.random() * 100
      const startY = 60 + Math.random() * 40
      const dxMid = (Math.random() - 0.5) * 80
      const dyMid = -150 - Math.random() * 200
      const dxEnd = dxMid + (Math.random() - 0.5) * 100
      const dyEnd = -400 - Math.random() * 250
      const duration = 7 + Math.random() * 5
      const delay = Math.random() * 8
      const psize = 2 + Math.random() * 4

      p.style.left = startX + '%'
      p.style.top = startY + '%'
      p.style.width = psize + 'px'
      p.style.height = psize + 'px'
      p.style.setProperty('--dx-mid', dxMid + 'px')
      p.style.setProperty('--dy-mid', dyMid + 'px')
      p.style.setProperty('--dx-end', dxEnd + 'px')
      p.style.setProperty('--dy-end', dyEnd + 'px')
      p.style.animationDuration = duration + 's'
      p.style.animationDelay = delay + 's'
      container.appendChild(p)
    }
  }, [])

  const toggleSound = async () => {
    const a = audioRef.current
    if (!a) return
    try {
      if (soundOn) {
        a.pause()
        setSoundOn(false)
      } else {
        a.loop = true
        a.volume = 0.6
        await a.play()
        setSoundOn(true)
        setError(false)
      }
    } catch {
      setError(true)
    }
  }

  return (
    <div
      className={`mlogo-wrapper ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="mlogo-scene">
        <div className="mlogo-particles" ref={particlesRef} />
        <div className="mlogo-glow-outer" />
        <div className="mlogo-glow" />
        <div className="mlogo-ring-2" />
        <div className="mlogo-ring" />
        <div className="mlogo-flag-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mlogo-img" src="/logo_major.png" alt="MAJOR" />
        </div>
      </div>

      {audio && (
        <>
          <audio ref={audioRef} src={audioSrc} preload="auto" />
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? 'Couper le chant' : 'Activer le chant'}
            className={`mlogo-sound-btn ${soundOn ? 'on' : ''} ${error ? 'err' : ''}`}
          >
            {error ? '⚠️ Erreur' : soundOn ? '🔇 Couper' : '🔊 Activer le chant'}
          </button>
        </>
      )}

      <style jsx>{`
        .mlogo-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1800px;
          perspective-origin: 50% 50%;
        }
        .mlogo-scene {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: mlogo-sceneFloat 6s ease-in-out infinite;
          pointer-events: none;
        }
        .mlogo-flag-wrap {
          position: absolute;
          inset: 0;
          z-index: 3;
          transform-style: preserve-3d;
          transform-origin: 18% 50%;
          animation: mlogo-flagWave 5s ease-in-out infinite;
          will-change: transform;
        }
        .mlogo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5))
                  drop-shadow(0 0 22px rgba(70, 200, 180, 0.45))
                  drop-shadow(0 0 40px rgba(70, 200, 180, 0.2));
        }
        .mlogo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 104%;
          aspect-ratio: 1 / 1;
          transform: translate(-50%, -50%) translateZ(-60px);
          background: radial-gradient(circle,
            rgba(70, 200, 180, 0.55) 0%,
            rgba(70, 200, 180, 0.2) 35%,
            transparent 75%);
          border-radius: 50%;
          animation: mlogo-pulse 4s ease-in-out infinite;
          z-index: 1;
          filter: blur(8px);
        }
        .mlogo-glow-outer {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 140%;
          aspect-ratio: 1 / 1;
          transform: translate(-50%, -50%) translateZ(-100px);
          background: radial-gradient(circle,
            rgba(140, 220, 200, 0.25) 0%,
            transparent 70%);
          border-radius: 50%;
          animation: mlogo-pulseOuter 5s ease-in-out infinite;
          z-index: 0;
          filter: blur(20px);
        }
        .mlogo-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 108%;
          aspect-ratio: 1 / 1;
          transform: translate(-50%, -50%) translateZ(20px);
          border: 2px solid transparent;
          border-top-color: rgba(70, 200, 180, 0.85);
          border-right-color: rgba(70, 200, 180, 0.45);
          border-radius: 50%;
          animation: mlogo-spin 10s linear infinite;
          z-index: 2;
          box-shadow: 0 0 20px rgba(70, 200, 180, 0.4),
                      inset 0 0 20px rgba(70, 200, 180, 0.2);
        }
        .mlogo-ring-2 {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 116%;
          aspect-ratio: 1 / 1;
          transform: translate(-50%, -50%) translateZ(10px);
          border: 1px dashed rgba(140, 220, 200, 0.5);
          border-radius: 50%;
          animation: mlogo-spinReverse 18s linear infinite;
          z-index: 2;
        }
        .mlogo-particles {
          position: absolute;
          width: 130%;
          height: 130%;
          top: -15%;
          left: -15%;
          pointer-events: none;
          z-index: 0;
          transform: translateZ(-30px);
        }
        :global(.mlogo-particle) {
          position: absolute;
          background: #5ed4be;
          border-radius: 50%;
          box-shadow: 0 0 8px #5ed4be, 0 0 16px #46c8b4;
          animation: mlogo-floatParticle linear infinite;
          opacity: 0;
        }
        .mlogo-sound-btn {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 20, 15, 0.9);
          color: #5ed4be;
          border: 2px solid #5ed4be;
          padding: 8px 18px;
          border-radius: 24px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          z-index: 10;
          box-shadow: 0 0 15px rgba(94, 212, 190, 0.4);
          transition: transform 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .mlogo-sound-btn:hover {
          background: rgba(94, 212, 190, 0.25);
          transform: translateX(-50%) scale(1.05);
        }
        .mlogo-sound-btn.on {
          background: rgba(94, 212, 190, 0.18);
        }
        .mlogo-sound-btn.err {
          color: #ff6b6b;
          border-color: #ff6b6b;
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.5);
        }

        @keyframes mlogo-sceneFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes mlogo-flagWave {
          0%, 100% { transform: rotateY(-15deg) skewY(-1.5deg); }
          50%      { transform: rotateY(15deg) skewY(1.5deg); }
        }
        @keyframes mlogo-pulse {
          0%, 100% {
            opacity: 0.45;
            transform: translate(-50%, -50%) translateZ(-60px) scale(0.95);
          }
          50% {
            opacity: 0.85;
            transform: translate(-50%, -50%) translateZ(-60px) scale(1.10);
          }
        }
        @keyframes mlogo-pulseOuter {
          0%, 100% {
            opacity: 0.4;
            transform: translate(-50%, -50%) translateZ(-100px) scale(0.9);
          }
          50% {
            opacity: 0.7;
            transform: translate(-50%, -50%) translateZ(-100px) scale(1.05);
          }
        }
        @keyframes mlogo-spin {
          from { transform: translate(-50%, -50%) translateZ(20px) rotate(0deg); }
          to   { transform: translate(-50%, -50%) translateZ(20px) rotate(360deg); }
        }
        @keyframes mlogo-spinReverse {
          from { transform: translate(-50%, -50%) translateZ(10px) rotate(360deg); }
          to   { transform: translate(-50%, -50%) translateZ(10px) rotate(0deg); }
        }
        @keyframes mlogo-floatParticle {
          0%   { transform: translate(0, 0) scale(0); opacity: 0; }
          10%  { opacity: 1; transform: translate(var(--dx-mid), var(--dy-mid)) scale(1); }
          90%  { opacity: 0.8; }
          100% { transform: translate(var(--dx-end), var(--dy-end)) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
