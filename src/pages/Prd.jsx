import { useApp } from '../store.js'

const SECTIONS = [
  '产品定位与目标用户',
  '核心使用场景与用户旅程',
  '功能结构与信息架构',
  'AI 引导式讲解的交互策略',
  '免费额度与会员转化设计',
  '关键指标与后续迭代方向',
]

export default function Prd() {
  const { navigate, goTab, tab } = useApp()

  return (
    <div className="page-inner">
      <section className="card placeholder-hero">
        <div className="placeholder-emoji">📄</div>
        <span className="tag">作品集文档 · 占位页面</span>
        <h2>产品需求文档 PRD</h2>
        <p>完整 PRD 将在下一步补充，包含产品背景、用户画像、核心流程与版本规划。</p>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>文档目录</h3>
          <span className="muted">即将补全</span>
        </div>
        <div className="card doc-list">
          {SECTIONS.map((section, index) => (
            <div className="doc-row" key={section}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{section}</p>
              <em>待完善</em>
            </div>
          ))}
        </div>
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
