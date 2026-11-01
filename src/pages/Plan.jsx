import { useApp } from '../store.js'
import { ProgressRing, Toast, useToast } from '../components/ui.jsx'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function Plan() {
  const { plan, toggleTask, navigate, goTab } = useApp()
  const { toast, showToast } = useToast()
  const now = new Date()
  const dateText = `${now.getMonth() + 1}月${now.getDate()}日 ${WEEKDAYS[now.getDay()]}`
  const doneCount = plan.filter((task) => task.done).length
  const progress = plan.length ? Math.round((doneCount / plan.length) * 100) : 0
  const allDone = plan.length > 0 && doneCount === plan.length

  const handleRowClick = (task) => {
    if (task.type === 'practice') {
      navigate(
        'practice',
        {
          question: task.question || task.knowledge,
          subject: task.subject,
          knowledge: task.knowledge,
          taskId: task.id,
        },
        { tab: 'plan' },
      )
      return
    }
    if (task.type === 'review') {
      goTab('mistakes')
      return
    }
    toggleTask(task.id)
    if (!task.done) showToast('每日一读已打卡')
  }

  return (
    <div className="page-inner">
      <section className="card plan-hero">
        <div>
          <p className="muted">{dateText}</p>
          <h2>今日学习计划</h2>
          <p className="plan-sub">
            已完成 {doneCount} / {plan.length} 项
          </p>
        </div>
        <ProgressRing
          value={progress}
          size={84}
          stroke={9}
          label={`${progress}%`}
          sub="完成度"
        />
      </section>

      {allDone ? (
        <div className="all-done">
          <span>🎉</span>
          今日任务全部完成，给自己一个大大的赞！
        </div>
      ) : null}

      <section className="section">
        <div className="section-head">
          <h3>任务清单</h3>
          <span className="muted">按错题知识点自动生成</span>
        </div>
        <div className="card task-list">
          {plan.map((task) => (
            <div
              className={`task-row ${task.done ? 'done' : ''}`}
              key={task.id}
              onClick={() => handleRowClick(task)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleRowClick(task)
                }
              }}
            >
              <button
                type="button"
                className={`task-check ${task.done ? 'checked' : ''}`}
                aria-label={task.done ? '标记为未完成' : '标记为已完成'}
                onClick={(event) => {
                  event.stopPropagation()
                  toggleTask(task.id)
                }}
              >
                {task.done ? '✓' : ''}
              </button>
              <div className="task-main">
                <div className="task-title-row">
                  <h4>{task.title}</h4>
                  <span className={`task-type ${task.type}`}>
                    {task.type === 'review' ? '复习' : task.type === 'practice' ? '练习' : '阅读'}
                  </span>
                </div>
                <p className="task-meta">
                  <span>{task.minutes} 分钟</span>
                  <span>{task.source}</span>
                </p>
              </div>
              <span className="task-go">
                {task.type === 'practice' ? '去练习 ›' : task.type === 'review' ? '看错题 ›' : '打卡'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <Toast toast={toast} />
    </div>
  )
}
