import { useEffect, useRef } from 'react'
import { useApp } from './store.js'
import Home from './pages/Home.jsx'
import Explain from './pages/Explain.jsx'
import Mistakes from './pages/Mistakes.jsx'
import Plan from './pages/Plan.jsx'
import Practice from './pages/Practice.jsx'
import Mine from './pages/Mine.jsx'
import Parent from './pages/Parent.jsx'
import Member from './pages/Member.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Prd from './pages/Prd.jsx'

const TITLES = {
  home: '学习',
  explain: '引导讲解',
  mistakes: '错题本',
  plan: '学习计划',
  practice: '同类题练习',
  member: '会员',
  mine: '我的',
  weekly: '家长周报',
  dashboard: '运营数据看板',
  prd: '产品需求文档',
}

const STUDENT_TABS = [
  { id: 'home', label: '学习', icon: '🏠' },
  { id: 'mistakes', label: '错题本', icon: '📕' },
  { id: 'plan', label: '计划', icon: '🗓️' },
  { id: 'member', label: '会员', icon: '👑' },
  { id: 'mine', label: '我的', icon: '👤' },
]

const PARENT_TABS = [
  { id: 'weekly', label: '周报', icon: '📊' },
  { id: 'member', label: '会员', icon: '👑' },
  { id: 'mine', label: '我的', icon: '👤' },
]

function renderPage(view) {
  switch (view) {
    case 'home':
      return <Home />
    case 'explain':
      return <Explain />
    case 'mistakes':
      return <Mistakes />
    case 'plan':
      return <Plan />
    case 'practice':
      return <Practice />
    case 'member':
      return <Member />
    case 'mine':
      return <Mine />
    case 'weekly':
      return <Parent />
    case 'dashboard':
      return <Dashboard />
    case 'prd':
      return <Prd />
    default:
      return <Home />
  }
}

export default function App() {
  const { role, tab, view, setRole, goTab } = useApp()
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [view])

  const tabs = role === 'parent' ? PARENT_TABS : STUDENT_TABS
  const subViews = ['explain', 'practice', 'dashboard', 'prd']
  const activeTab = subViews.includes(view) ? tab : view

  return (
    <div className="app-shell">
      <div className="phone">
        <header className="topbar">
          <div className="role-switch" role="tablist" aria-label="角色切换">
            <button
              type="button"
              className={role === 'student' ? 'active' : ''}
              onClick={() => setRole('student')}
            >
              学生
            </button>
            <button
              type="button"
              className={role === 'parent' ? 'active' : ''}
              onClick={() => setRole('parent')}
            >
              家长
            </button>
          </div>
          <h1 className="topbar-title">{TITLES[view] || 'AI 学习助手'}</h1>
          <div className="mini-capsule" aria-hidden="true">
            <span className="capsule-dots">···</span>
            <span className="capsule-line" />
            <span className="capsule-eye">◎</span>
          </div>
        </header>

        <main className="page-scroll" ref={scrollRef}>
          <div className="page" key={view}>
            {renderPage(view)}
          </div>
        </main>

        <nav className="tabbar" aria-label="底部导航">
          {tabs.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`tab-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => goTab(item.id)}
            >
              <span className="tab-icon">{item.icon}</span>
              <span className="tab-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
