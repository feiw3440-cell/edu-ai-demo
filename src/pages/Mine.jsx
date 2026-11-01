import { useApp } from '../store.js'
import { Toast, useToast } from '../components/ui.jsx'

export default function Mine() {
  const {
    role,
    isMember,
    aiRemaining,
    freeLimit,
    mistakes,
    records,
    navigate,
    resetDemo,
  } = useApp()
  const { toast, showToast } = useToast()

  const handleReset = () => {
    const confirmed = window.confirm('确定要重置演示数据吗？错题、计划、记录和会员状态都会恢复初始值。')
    if (!confirmed) return
    resetDemo()
    showToast('演示数据已重置')
  }

  const entries = [
    {
      icon: '📈',
      title: '运营数据看板（演示后台）',
      desc: '查看学习行为、活跃与转化数据',
      onClick: () => navigate('dashboard', {}, { tab: 'mine' }),
    },
    {
      icon: '📄',
      title: '产品需求文档 PRD',
      desc: '查看产品定位、核心流程与功能规划',
      onClick: () => navigate('prd', {}, { tab: 'mine' }),
    },
  ]

  return (
    <div className="page-inner">
      <section className="profile-card">
        <div className="avatar">{role === 'parent' ? '👩' : '🧑‍🎓'}</div>
        <div className="profile-main">
          <h2>{role === 'parent' ? '林女士' : '林小雨'}</h2>
          <p>{role === 'parent' ? '家长账号 · 关注孩子的学习成长' : '初三 · 人教版 · 连续学习 12 天'}</p>
        </div>
        <span className="level-badge">{role === 'parent' ? '家长' : 'Lv.6'}</span>
      </section>

      <section className={`member-card ${isMember ? 'active' : ''}`}>
        <div>
          <p className="member-eyebrow">{isMember ? '会员已开通' : '当前为免费版'}</p>
          <h3>{isMember ? 'AI 答疑无限次' : `今日剩余 ${aiRemaining}/${freeLimit} 次答疑`}</h3>
          <p className="member-desc">
            {isMember
              ? '全科引导讲解、同类题练习与错题复习不限次数'
              : '开通会员，解锁无限次 AI 引导讲解与专属学习报告'}
          </p>
        </div>
        <button
          type="button"
          className={`btn btn-sm ${isMember ? 'btn-ghost' : 'btn-orange'}`}
          onClick={() => navigate('member', {}, { tab: 'member' })}
        >
          {isMember ? '查看权益' : '开通会员'}
        </button>
      </section>

      <section className="mini-stats">
        <div>
          <strong>{mistakes.length}</strong>
          <span>错题</span>
        </div>
        <div>
          <strong>{records.length}</strong>
          <span>练习记录</span>
        </div>
        <div>
          <strong>{isMember ? '∞' : aiRemaining}</strong>
          <span>今日答疑</span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>功能入口</h3>
          <span className="muted">演示与文档</span>
        </div>
        <div className="card entry-list">
          {entries.map((entry) => (
            <button
              type="button"
              className="entry-row"
              key={entry.title}
              onClick={entry.onClick}
            >
              <span className="entry-icon">{entry.icon}</span>
              <span className="entry-main">
                <strong>{entry.title}</strong>
                <span>{entry.desc}</span>
              </span>
              <span className="entry-arrow">›</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="card reset-card">
          <div>
            <strong>重置演示数据</strong>
            <p>清空本地错题、计划与练习记录，恢复初始示例。</p>
          </div>
          <button type="button" className="btn btn-sm btn-danger-soft" onClick={handleReset}>
            重置
          </button>
        </div>
      </section>

      <p className="version-text">AI 学习助手 · 产品经理作品集 Demo v1.0</p>

      <Toast toast={toast} />
    </div>
  )
}
