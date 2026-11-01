import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.js'
import { Toast, useToast } from '../components/ui.jsx'

const PLANS = [
  {
    id: 'month',
    name: '月卡',
    price: 29,
    period: '/ 月',
    average: '约 ¥29 / 月',
    desc: '先体验一个月，随时恢复免费版',
  },
  {
    id: 'quarter',
    name: '季卡',
    price: 68,
    period: '/ 季',
    average: '约 ¥22.7 / 月',
    desc: '覆盖一个完整学期阶段，推荐',
    badge: '推荐',
  },
  {
    id: 'year',
    name: '年卡',
    price: 198,
    period: '/ 年',
    average: '约 ¥16.5 / 月',
    desc: '长期使用最划算，省 ¥150',
    badge: '最划算',
  },
]

const PERKS = [
  { name: 'AI 答疑', free: `每日 3 次`, member: '无限次' },
  { name: '分步讲解', free: '✓', member: '✓' },
  { name: 'AI 智能批改', free: '每日 3 道', member: '无限' },
  { name: '错题本', free: '最多 20 题', member: '无限 + 智能归类' },
  { name: '学习报告', free: '基础周报', member: '完整周报 + AI 提分方案' },
  { name: '同类题练习', free: '每日 1 组', member: '无限' },
  { name: '家长端多孩子', free: '✗', member: '✓' },
]

function PerkValue({ value }) {
  if (value === '✓') return <span className="perk-check">✓</span>
  if (value === '✗') return <span className="perk-cross">✗</span>
  return <span>{value}</span>
}

export default function Member() {
  const {
    isMember,
    memberReason,
    setMember,
    setMemberReason,
    aiRemaining,
    freeLimit,
    role,
    goTab,
  } = useApp()
  const { toast, showToast } = useToast()
  const [selected, setSelected] = useState('quarter')
  const [payOpen, setPayOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const successTimer = useRef(null)

  useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current)
    },
    [],
  )

  const plan = PLANS.find((item) => item.id === selected) || PLANS[1]
  const backTab = role === 'parent' ? 'weekly' : 'home'

  const handleBannerBack = () => {
    setMemberReason(null)
    goTab(backTab)
  }

  const handleOpen = () => {
    if (isMember) {
      showToast('会员权益已生效，可直接去提问')
      return
    }
    setPayOpen(true)
  }

  const handleConfirm = () => {
    setPayOpen(false)
    setMember(true)
    setSuccess(true)
    if (successTimer.current) clearTimeout(successTimer.current)
    successTimer.current = setTimeout(() => setSuccess(false), 1800)
    showToast('会员开通成功（演示，无真实扣费）')
  }

  const handleRestore = () => {
    setMember(false)
    showToast('已恢复为免费版（演示）')
  }

  return (
    <div className="page-inner">
      {memberReason === 'limit' ? (
        <section className="limit-banner">
          <div className="limit-banner-copy">
            <strong>今日 3 次免费 AI 答疑已用完</strong>
            <p>开通会员继续提问，解锁无限次引导讲解与完整周报。</p>
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={handleBannerBack}>
            返回
          </button>
        </section>
      ) : null}

      <section className={`member-hero ${isMember ? 'active' : ''}`}>
        <div className="member-hero-top">
          <span className="crown">{isMember ? '👑' : '✨'}</span>
          <span className="tag tag-on-dark">{isMember ? '会员中' : '免费版'}</span>
        </div>
        <h2>{isMember ? '欢迎回来，会员同学' : 'AI 学习助手会员'}</h2>
        <p>
          {isMember
            ? '无限次 AI 引导讲解、完整学习周报与智能错题复习已全部解锁。'
            : '每天 3 次免费答疑不够用？开通会员，让 AI 陪你把每一道题真正弄懂。'}
        </p>

        <div className="member-quota">
          <div>
            <strong>{isMember ? '∞' : aiRemaining}</strong>
            <span>今日剩余 AI 答疑</span>
          </div>
          <div>
            <strong>{isMember ? '已解锁' : `${freeLimit} 次 / 日`}</strong>
            <span>{isMember ? '会员权益生效中' : '免费版每日额度'}</span>
          </div>
        </div>

        {isMember ? (
          <div className="member-hero-actions">
            <button type="button" className="btn btn-block btn-ghost" onClick={handleOpen}>
              会员已开通（演示）
            </button>
            <button type="button" className="btn btn-block member-restore" onClick={handleRestore}>
              恢复为免费版（演示）
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-block btn-orange" onClick={handleOpen}>
            立即开通（演示）
          </button>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h3>{isMember ? '会员权益生效中' : '免费版 vs 会员'}</h3>
          <span className="muted">学生与家长通用</span>
        </div>
        <div className="card perk-table">
          <div className="perk-row perk-head">
            <span className="perk-name">权益</span>
            <span className="perk-cell">免费版</span>
            <span className="perk-cell perk-member">会员</span>
          </div>
          {PERKS.map((perk) => (
            <div className="perk-row" key={perk.name}>
              <span className="perk-name">{perk.name}</span>
              <span className="perk-cell">
                <PerkValue value={perk.free} />
              </span>
              <span className="perk-cell perk-member">
                <PerkValue value={perk.member} />
              </span>
            </div>
          ))}
        </div>
      </section>

      {!isMember ? (
        <section className="section">
          <div className="section-head">
            <h3>选择套餐</h3>
            <span className="muted">演示价格，不产生扣费</span>
          </div>
          <div className="plan-options">
            {PLANS.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`plan-card ${selected === item.id ? 'selected' : ''}`}
                onClick={() => setSelected(item.id)}
              >
                {item.badge ? <span className="plan-badge">{item.badge}</span> : null}
                <span className="plan-name">{item.name}</span>
                <span className="plan-price">
                  <strong>¥{item.price}</strong>
                  <em>{item.period}</em>
                </span>
                <span className="plan-average">{item.average}</span>
                <span className="plan-desc">{item.desc}</span>
                <span className="plan-radio" aria-hidden="true">
                  {selected === item.id ? '●' : '○'}
                </span>
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary btn-block plan-submit" onClick={handleOpen}>
            立即开通 {plan.name}（演示）
          </button>
          <p className="pay-hint">演示环境，不会产生任何真实扣费；开通后可随时恢复免费版。</p>
        </section>
      ) : (
        <section className="section">
          <div className="card member-manage">
            <div>
              <strong>会员状态：已开通</strong>
              <p>当前套餐演示为季卡。真实产品中会展示到期时间、续费管理与订单记录。</p>
            </div>
            <button type="button" className="btn btn-sm btn-danger-soft" onClick={handleRestore}>
              恢复免费版
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        className="btn btn-soft btn-block"
        onClick={() => goTab(backTab)}
      >
        {role === 'parent' ? '返回家长周报' : '先去提问'}
      </button>

      <p className="version-text">演示页面 · 不涉及真实支付与开票</p>

      {payOpen ? (
        <div className="pay-mask" role="dialog" aria-modal="true" aria-label="模拟支付确认">
          <div className="pay-sheet">
            <div className="pay-sheet-head">
              <span>确认开通</span>
              <button type="button" className="pay-close" onClick={() => setPayOpen(false)}>
                ✕
              </button>
            </div>
            <div className="pay-plan">
              <div>
                <strong>AI 学习助手会员 · {plan.name}</strong>
                <p>{plan.desc}</p>
              </div>
              <span className="pay-price">¥{plan.price}</span>
            </div>
            <div className="pay-line">
              <span>AI 答疑</span>
              <span>无限次</span>
            </div>
            <div className="pay-line">
              <span>学习报告</span>
              <span>完整周报 + AI 提分方案</span>
            </div>
            <div className="pay-line">
              <span>错题本</span>
              <span>无限 + 智能归类</span>
            </div>
            <div className="pay-notice">演示环境，不会产生任何扣费</div>
            <div className="pay-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setPayOpen(false)}>
                再想想
              </button>
              <button type="button" className="btn btn-orange" onClick={handleConfirm}>
                确认开通（演示）
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {success ? (
        <div className="success-mask" role="status" aria-live="polite">
          <div className="success-pop">
            <div className="success-check">✓</div>
            <strong>开通成功</strong>
            <p>会员权益已生效，继续去提问吧</p>
          </div>
        </div>
      ) : null}

      <Toast toast={toast} />
    </div>
  )
}
