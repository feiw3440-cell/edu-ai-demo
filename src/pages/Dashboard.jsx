import { useApp } from '../store.js'

const METRICS = [
  { label: '今日活跃用户', value: '1,286', trend: '+12.4%' },
  { label: 'AI 答疑次数', value: '3,402', trend: '+8.1%' },
  { label: '7 日留存', value: '46.8%', trend: '+2.3%' },
]

export default function Dashboard() {
  const { navigate, goTab, tab } = useApp()

  return (
    <div className="page-inner">
      <section className="card placeholder-hero">
        <div className="placeholder-emoji">📈</div>
        <span className="tag">演示后台 · 占位页面</span>
        <h2>运营数据看板</h2>
        <p>下一步将接入学习行为漏斗、知识点掌握分布与会员转化数据。</p>
      </section>

      <section className="metric-grid">
        {METRICS.map((item) => (
          <div className="metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <em>{item.trend}</em>
          </div>
        ))}
      </section>

      <section className="card chart-placeholder">
        <div className="chart-bars" aria-hidden="true">
          <i style={{ height: '38%' }} />
          <i style={{ height: '62%' }} />
          <i style={{ height: '48%' }} />
          <i style={{ height: '78%' }} />
          <i style={{ height: '56%' }} />
          <i style={{ height: '88%' }} />
          <i style={{ height: '70%' }} />
        </div>
        <p>周活跃趋势（示意）</p>
      </section>

      <button
        type="button"
        className="btn btn-soft btn-block"
        onClick={() => (tab === 'mine' ? goTab('mine') : navigate('mine', {}, { tab }))}
      >
        返回我的
      </button>
    </div>
  )
}
