import { useEffect, useState } from 'react'

const FEATURE_MESSAGES = [
  'Always-on Windows service that automatically enables Audit policies when a USB is inserted',
  'Offline analysis of event logs',
  'Real-time detection + live notifications (email / webhook / API)',
  'Online and Offline detector that produces explainable alerts',
  'Realtime monitoring with Live dashboard',
  'Offline report generation for security auditors',
] as const

const ROTATE_MS = 4500

/**
 * Full-page login background image with rotating feature copy along the bottom.
 */
export function LoginHeroPanel() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let fadeTimeout: number | undefined
    const id = window.setInterval(() => {
      setVisible(false)
      fadeTimeout = window.setTimeout(() => {
        setIndex((i) => (i + 1) % FEATURE_MESSAGES.length)
        setVisible(true)
      }, 280)
    }, ROTATE_MS)
    return () => {
      window.clearInterval(id)
      if (fadeTimeout !== undefined) window.clearTimeout(fadeTimeout)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src="/login-hero.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/15" />
      <div className="absolute inset-x-0 bottom-0 p-6 pb-8 md:max-w-[58%] md:p-10" aria-label="Product highlights">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">
          USB Infilterator Detector
        </p>
        <p
          key={index}
          className={`min-h-[4.5rem] max-w-2xl text-base font-medium leading-relaxed text-white transition-opacity duration-300 md:text-xl ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          aria-live="polite"
        >
          {FEATURE_MESSAGES[index]}
        </p>
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          {FEATURE_MESSAGES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? 'bg-sky-400' : 'bg-white/35'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
