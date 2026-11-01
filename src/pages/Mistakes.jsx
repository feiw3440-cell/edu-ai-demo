import { useMemo, useState } from 'react'
import { useApp } from '../store.js'
import { EmptyState, Toast, useToast } from '../components/ui.jsx'
import { shortKnowledge } from '../data/mock.js'

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export default function Mistakes() {
  const { mistakes, removeMistake, toggleMastered, navigate, goTab } = useApp()
  const { toast, showToast } = useToast()
  const [expandedGroups, setExpandedGroups] = useState(() =>
    mistakes.length ? [mistakes[0].knowledge] : [],
  )
  const [expandedItems, setExpandedItems] = useState([])

  const groups = useMemo(() => {
    const map = new Map()
    for (const mistake of mistakes) {
      const key = mistake.knowledge || '未分类'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(mistake)
    }
    return [...map.entries()].map(([knowledge, items]) => ({
      knowledge,
      items,
      mastered: items.filter((item) => item.mastered).length,
    }))
  }, [mistakes])

  const masteredCount = mistakes.filter((item) => item.mastered).length

  const toggleGroup = (knowledge) => {
    setExpandedGroups((current) =>
      current.includes(knowledge)
        ? current.filter((item) => item !== knowledge)
        : [...current, knowledge],
    )
  }

  const toggleItem = (id) => {
    setExpandedItems((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const handleRemove = (id) => {
    removeMistake(id)
    setExpandedItems((current) => current.filter((item) => item !== id))
    showToast('已从错题本删除')
  }

  const handleRedo = (mistake) => {
    navigate(
      'practice',
      {
        question: mistake.question,
        subject: mistake.subject,
        knowledge: mistake.knowledge,
      },
      { tab: 'mistakes' },
    )
  }

  return (
    <div className="page-inner">
      <section className="stat-grid">
        <div className="stat-card">
          <strong>{mistakes.length}</strong>
          <span>错题总数</span>
        </div>
        <div className="stat-card">
          <strong>{groups.length}</strong>
          <span>知识点数</span>
        </div>
        <div className="stat-card">
          <strong>{masteredCount}</strong>
          <span>已掌握</span>
        </div>
      </section>

      {mistakes.length === 0 ? (
        <EmptyState
          emoji="📚"
          title="错题本还是空的"
          desc="把不会的题加入错题本，AI 会按知识点帮你整理复习计划。"
          action={
            <button type="button" className="btn btn-primary" onClick={() => goTab('home')}>
              去首页问一道题
            </button>
          }
        />
      ) : (
        <div className="group-list">
          {groups.map((group) => {
            const open = expandedGroups.includes(group.knowledge)
            const rate = Math.round((group.mastered / group.items.length) * 100)
            return (
              <section className="card group-card" key={group.knowledge}>
                <button
                  type="button"
                  className="group-head"
                  onClick={() => toggleGroup(group.knowledge)}
                >
                  <div className="group-head-main">
                    <div className="group-title-row">
                      <h3>{shortKnowledge(group.knowledge)}</h3>
                      <span className="count-pill">{group.items.length} 道</span>
                      <span className={`chevron ${open ? 'open' : ''}`}>⌄</span>
                    </div>
                    <div className="progress-row">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${rate}%` }} />
                      </div>
                      <span className="muted">掌握 {rate}%</span>
                    </div>
                  </div>
                </button>

                {open ? (
                  <div className="group-body">
                    {group.items.map((mistake) => {
                      const itemOpen = expandedItems.includes(mistake.id)
                      return (
                        <article className="mistake-item" key={mistake.id}>
                          <button
                            type="button"
                            className="mistake-summary"
                            onClick={() => toggleItem(mistake.id)}
                          >
                            <div className="mistake-summary-main">
                              <p className="mistake-q">{mistake.question}</p>
                              <div className="mistake-meta">
                                <span className={`mini-tag ${mistake.mastered ? 'done' : ''}`}>
                                  {mistake.mastered ? '已掌握' : '待复习'}
                                </span>
                                <span>{mistake.subject}</span>
                                <span>{formatDate(mistake.addedAt)}</span>
                              </div>
                            </div>
                            <span className={`chevron ${itemOpen ? 'open' : ''}`}>⌄</span>
                          </button>

                          {itemOpen ? (
                            <div className="mistake-detail">
                              {mistake.studentAnswer ? (
                                <div className="my-answer">
                                  <span>我的答案</span>
                                  <p>{mistake.studentAnswer}</p>
                                </div>
                              ) : null}
                              <div className="detail-steps">
                                {(mistake.steps || []).map((step, index) => (
                                  <div className="detail-step" key={`${mistake.id}-${index}`}>
                                    <span className="detail-index">{index + 1}</span>
                                    <div>
                                      <h5>{step.title}</h5>
                                      <p>{step.content}</p>
                                      {step.hint ? (
                                        <div className="hint-bubble small">
                                          <span>想一想</span>
                                          {step.hint}
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="detail-answer">
                                <span>参考答案</span>
                                <p>{mistake.answer}</p>
                              </div>
                              <div className="mistake-actions">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => toggleMastered(mistake.id)}
                                >
                                  {mistake.mastered ? '取消已掌握' : '标记已掌握'}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-soft"
                                  onClick={() => handleRedo(mistake)}
                                >
                                  重做
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger-soft"
                                  onClick={() => handleRemove(mistake.id)}
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      )}

      <Toast toast={toast} />
    </div>
  )
}
