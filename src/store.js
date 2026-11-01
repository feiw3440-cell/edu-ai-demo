import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  buildPlan,
  initialMistakes,
  sampleRecords,
} from './data/mock.js'

export const FREE_LIMIT = 3

const STORAGE_KEY = 'edu-ai-demo-state-v1'

const pad = (value) => String(value).padStart(2, '0')

function todayStr() {
  const date = new Date()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function createInitialState() {
  return {
    role: 'student',
    tab: 'home',
    view: 'home',
    params: {},
    isMember: false,
    memberReason: null,
    aiUsedToday: 0,
    aiDate: todayStr(),
    mistakes: initialMistakes,
    plan: buildPlan(initialMistakes),
    records: sampleRecords,
  }
}

function normalizeState(saved) {
  const base = createInitialState()
  if (!saved || typeof saved !== 'object') return base

  const merged = {
    ...base,
    ...saved,
    params: {},
  }

  if (merged.role !== 'student' && merged.role !== 'parent') merged.role = 'student'
  if (merged.role === 'parent' && !['weekly', 'member', 'mine'].includes(merged.tab)) {
    merged.tab = 'weekly'
  }
  if (merged.role === 'student' && !['home', 'mistakes', 'plan', 'member', 'mine'].includes(merged.tab)) {
    merged.tab = 'home'
  }
  if (!Array.isArray(merged.mistakes)) merged.mistakes = base.mistakes
  if (!Array.isArray(merged.plan) || merged.plan.length === 0) {
    merged.plan = buildPlan(merged.mistakes)
  }
  if (!Array.isArray(merged.records)) merged.records = base.records
  if (typeof merged.isMember !== 'boolean') merged.isMember = false
  if (merged.memberReason !== 'limit') merged.memberReason = null
  if (merged.isMember) merged.memberReason = null
  if (typeof merged.aiUsedToday !== 'number') merged.aiUsedToday = 0
  if (merged.aiDate !== todayStr()) {
    merged.aiDate = todayStr()
    merged.aiUsedToday = 0
  }

  merged.view = merged.tab
  return merged
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    return normalizeState(JSON.parse(raw))
  } catch {
    return createInitialState()
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)
  const stateRef = useRef(state)

  const commit = useCallback((updater) => {
    const current = stateRef.current
    const next = typeof updater === 'function' ? updater(current) : updater
    if (next === current) return current
    stateRef.current = next
    setState(next)
    return next
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage 不可用时仅保留内存状态
    }
  }, [state])

  const setRole = useCallback(
    (role) => {
      commit((current) => {
        if (current.role === role) return current
        const tab = role === 'parent' ? 'weekly' : 'home'
        return { ...current, role, tab, view: tab, params: {}, memberReason: null }
      })
    },
    [commit],
  )

  const goTab = useCallback(
    (tab) => {
      commit((current) => ({
        ...current,
        tab,
        view: tab,
        params: {},
        memberReason: tab === 'member' ? current.memberReason : null,
      }))
    },
    [commit],
  )

  const navigate = useCallback(
    (view, params = {}, options = {}) => {
      commit((current) => ({
        ...current,
        view,
        params,
        tab: options.tab || current.tab,
      }))
    },
    [commit],
  )

  const setMember = useCallback(
    (value = true) => {
      commit((current) => ({
        ...current,
        isMember: Boolean(value),
        memberReason: value ? null : current.memberReason,
      }))
    },
    [commit],
  )

  const setMemberReason = useCallback(
    (reason = null) => {
      commit((current) => ({
        ...current,
        memberReason: reason === 'limit' ? 'limit' : null,
      }))
    },
    [commit],
  )

  const goMember = useCallback(
    (reason = null) => {
      commit((current) => ({
        ...current,
        memberReason: reason === 'limit' ? 'limit' : null,
        view: 'member',
        tab: 'member',
        params: {},
      }))
    },
    [commit],
  )

  const consumeAI = useCallback(() => {
    const current = stateRef.current
    if (current.isMember) return true

    const today = todayStr()
    const used = current.aiDate === today ? current.aiUsedToday : 0
    if (used >= FREE_LIMIT) {
      commit({ ...current, aiDate: today, aiUsedToday: used })
      return false
    }

    commit({ ...current, aiDate: today, aiUsedToday: used + 1 })
    return true
  }, [commit])

  const addMistake = useCallback(
    (payload) => {
      const current = stateRef.current
      const question = String(payload?.question || '').trim()
      if (!question) return false
      if (current.mistakes.some((item) => item.question === question)) return false

      const entry = {
        id: payload.id || `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        question,
        subject: payload.subject || '综合',
        knowledge: payload.knowledge || '未分类',
        steps: Array.isArray(payload.steps) ? payload.steps : [],
        answer: payload.answer || '',
        studentAnswer: payload.studentAnswer || '',
        addedAt: payload.addedAt || new Date().toISOString(),
        mastered: Boolean(payload.mastered),
      }

      commit((prev) => {
        const mistakes = [entry, ...prev.mistakes]
        return { ...prev, mistakes, plan: buildPlan(mistakes, prev.plan) }
      })
      return true
    },
    [commit],
  )

  const toggleMastered = useCallback(
    (id) => {
      commit((current) => ({
        ...current,
        mistakes: current.mistakes.map((item) =>
          item.id === id ? { ...item, mastered: !item.mastered } : item,
        ),
      }))
    },
    [commit],
  )

  const removeMistake = useCallback(
    (id) => {
      commit((current) => {
        const mistakes = current.mistakes.filter((item) => item.id !== id)
        return { ...current, mistakes, plan: buildPlan(mistakes, current.plan) }
      })
    },
    [commit],
  )

  const toggleTask = useCallback(
    (id) => {
      commit((current) => ({
        ...current,
        plan: current.plan.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task,
        ),
      }))
    },
    [commit],
  )

  const completeTask = useCallback(
    (id) => {
      if (!id) return
      commit((current) => ({
        ...current,
        plan: current.plan.map((task) =>
          task.id === id ? { ...task, done: true } : task,
        ),
      }))
    },
    [commit],
  )

  const addRecord = useCallback(
    (record) => {
      commit((current) => ({
        ...current,
        records: [
          {
            id: `record-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            at: new Date().toISOString(),
            ...record,
          },
          ...current.records,
        ].slice(0, 60),
      }))
    },
    [commit],
  )

  const resetDemo = useCallback(() => {
    commit((current) => ({
      ...createInitialState(),
      role: current.role,
      tab: current.tab,
      view: current.view,
      params: {},
    }))
  }, [commit])

  const aiRemaining = state.isMember
    ? Infinity
    : Math.max(
        0,
        FREE_LIMIT - (state.aiDate === todayStr() ? state.aiUsedToday : 0),
      )

  const value = useMemo(
    () => ({
      ...state,
      aiRemaining,
      isMember: state.isMember,
      freeLimit: FREE_LIMIT,
      setRole,
      goTab,
      navigate,
      setMember,
      setMemberReason,
      goMember,
      consumeAI,
      addMistake,
      toggleMastered,
      removeMistake,
      toggleTask,
      completeTask,
      addRecord,
      resetDemo,
    }),
    [
      state,
      aiRemaining,
      setRole,
      goTab,
      navigate,
      setMember,
      setMemberReason,
      goMember,
      consumeAI,
      addMistake,
      toggleMastered,
      removeMistake,
      toggleTask,
      completeTask,
      addRecord,
      resetDemo,
    ],
  )

  return createElement(AppContext.Provider, { value }, children)
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp 必须在 AppProvider 内使用')
  return context
}
