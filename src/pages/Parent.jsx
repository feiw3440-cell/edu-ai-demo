import { useApp } from '../store.js'

export default function Parent() {
  const { role } = useApp()
  const isParent = role === 'parent'

  return (
    <div className="page-inner">
      <section className="card placeholder-hero">
        <div className="placeholder-emoji">📊</div>
        <span className="tag">家长端 · 占位页面</span>
        <h2>{isParent ? '孩子的一周学习周报' : '家长周报'}</h2>
        <p>
          周报将汇总孩子本周的学习时长、AI 答疑次数、错题掌握情况与练习表现，帮助家长快速了解学习状态。
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>即将上线</h3>
          <span className="muted">下一步实现</span>
        </div>
        <div className="card feature-list">
          <div className="feature-row">
            <span>📈</span>
            <div>
              <strong>学习趋势</strong>
              <p>按天查看学习时长、答疑与练习完成情况</p>
            </div>
          </div>
          <div className="feature-row">
            <span>🧠</span>
            <div>
              <strong>知识点掌握度</strong>
              <p>按知识点统计错题数量与掌握率变化</p>
            </div>
          </div>
          <div className="feature-row">
            <span>💬</span>
            <div>
              <strong>AI 学习建议</strong>
              <p>生成面向家长的一周总结与陪伴建议</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
