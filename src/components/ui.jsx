import { useCallback, useEffect, useRef, useState } from 'react'

export function ProgressRing({
  value = 0,
  size = 92,
  stroke = 9,
  color = '#4F6BED',
  trackColor = '#e9edf8',
  label,
  sub,
  className = '',
}) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className={`ring ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          className="ring-fg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-center">
        <strong>{label ?? `${Math.round(percent)}%`}</strong>
        {sub ? <span>{sub}</span> : null}
      </div>
    </div>
  )
}

export function SourceTag({ source }) {
  const isAI = source === 'ai'
  return (
    <span className={`source-tag ${isAI ? 'ai' : 'sample'}`}>
      {isAI ? 'AI 实时生成' : '示例回答'}
    </span>
  )
}

export function EmptyState({ emoji, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-emoji">{emoji}</div>
      <h3>{title}</h3>
      {desc ? <p>{desc}</p> : null}
      {action}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState({ message: '', visible: false })
  const timerRef = useRef(null)

  const showToast = useCallback((message) => {
    setToast({ message, visible: true })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }))
    }, 2200)
  }, [])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  return { toast, showToast }
}

export function Toast({ toast }) {
  return (
    <div className={`toast ${toast.visible ? 'show' : ''}`} role="status">
      {toast.message}
    </div>
  )
}
