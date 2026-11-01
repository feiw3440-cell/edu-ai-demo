import { useApp } from '../store.js'
import { Toast, useToast } from '../components/ui.jsx'

const BENEFITS = [
  { icon: '♾️', title: 'AI 答疑无限次', desc: '不受每日 3 次免费额度限制' },
  { icon: '🧩', title: '同类题不限量', desc: '每个知识点自动生成变式练习' },
  { icon: '📕', title: '错题智能复习', desc: '按知识点归集，生成每日复习计划' },
  { icon: '📊', title: '专属学习报告', desc: '周维度总结学习表现与薄弱点' },
]

export default function Member() {
  const { isMember, setMember, role, goTab } = useApp()
  const { toast, showToast } = useToast()

  const handleOpen = () => {
    if (isMember) {
      showToast('会员权益已生效，可直接去提问')
      return
    }
    setMember(true)
    showToast('会员开通成功（演示）')
  }

  return (
    <div className="page-inner">
      <section className={`member-hero ${isMember ? 'active' : ''}`}>
        <div className="member-hero-top">
          <span className="crown">{isMember ? '👑' : '✨'}</span>
          <span className="tag tag-on-dark">{isMember ? '已开通' : '限时演示'}</span>
        </div>
        <h2>{isMember ? '欢迎回来，会员同学' : 'AI 学习助手会员'}</h2>
        <p>
          {isMember
            ? '你已解锁全部学习权益，AI 老师随时在线。'
            : '每天 3 次免费答疑不够用？开通会员，让 AI 陪你把这道题彻底弄懂。'}
        </p>
        <div className="member-price">
          <strong>¥19</strong>
          <span>/ 月（演示价格）</span>
        </div>
        <button
          type="button"
          className={`btn btn-block ${isMember ? 'btn-ghost' : 'btn-orange'}`}
          onClick={handleOpen}
        >
          {isMember ? '会员已开通（演示）' : '开通会员（演示）'}
        </button>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>会员权益</h3>
          <span className="muted">学生与家长通用</span>
        </div>
        <div className="card benefit-list">
          {BENEFITS.map((item) => (
            <div className="benefit-row" key={item.title}>
              <span className="benefit-icon">{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="btn btn-soft btn-block"
        onClick={() => goTab(role === 'parent' ? 'weekly' : 'home')}
      >
        {role === 'parent' ? '返回家长周报' : '先去提问'}
      </button>

      <p className="version-text">本页面为演示占位，不会产生真实支付</p>

      <Toast toast={toast} />
    </div>
  )
}
