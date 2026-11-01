import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '../store.js'
import { Toast, useToast } from '../components/ui.jsx'
import { shortKnowledge } from '../data/mock.js'

const STUDY_DATA = [
  { day: '周一', minutes: 42 },
  { day: '周二', minutes: 55 },
  { day: '周三', minutes: 30 },
  { day: '周四', minutes: 68 },
  { day: '周五', minutes: 48 },
  { day: '周六', minutes: 88 },
  { day: '周日', minutes: 72 },
]

const ACCURACY_DATA = [
  { week: '第 1 周', rate: 68 },
  { week: '第 2 周', rate: 74 },
  { week: '第 3 周', rate: 71 },
  { week: '本周', rate: 79 },
]

const OVERVIEW = [
  { label: '学习时长', value: '6.7', unit: '小时', trend: '+18%', up: true },
  { label: '完成题目', value: '54', unit: '道', trend: '+12 道', up: true },
  { label: '平均正确率', value: '79', unit: '%', trend: '+6%', up: true },
  { label: '连续学习', value: '12', unit: '天', trend: '+2 天', up: true },
]

const BASE_WEAK = [
  { name: '一元一次方程', errorRate: 42, practice: 8 },
  { name: '一般现在时', errorRate: 35, practice: 6 },
  { name: '古诗赏析', errorRate: 28, practice: 4 },
]

const SUBJECT_MASTERY = [
  { name: '数学', value: 76, color: '#4F6BED' },
  { name: '语文', value: 68, color: '#FF9F43' },
  { name: '英语', value: 82, color: '#22B07D' },
]

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: '1px solid #e9edf6',
  boxShadow: '0 8px 20px rgba(31,45,90,.12)',
  fontSize: 11,
  padding: '6px 10px',
}

const TIPS = [
  '每天固定 20 分钟「无手机」学习时段，比临时突击更有效。',
  '孩子讲题时先听完，再用「你觉得关键是哪一步」代替直接纠错。',
  '周末一起回看周报，只肯定进步，不拿孩子和同学比较。',
]

function buildWeakPoints(mistakes) {
  const groups = new Map()
  for (const mistake of mistakes) {
    const name = shortKnowledge(mistake.knowledge)
    if (!groups.has(name)) {
      groups.set(name, { name, total: 0, unmastered: 0 })
    }
    const group = groups.get(name)
    group.total += 1
    if (!mistake.mastered) group.unmastered += 1
  }

  const fromMistakes = [...groups.values()]
    .filter((group) => group.unmastered > 0)
    .map((group) => ({
      name: group.name,
      errorRate: Math.max(
        18,
        Math.round((group.unmastered / Math.max(1, group.total)) * 100),
      ),
      practice: Math.max(3, group.unmastered * 3),
      fromMistakes: true,
      count: group.total,
    }))
    .sort((a, b) => b.errorRate - a.errorRate)

  const names = new Set(fromMistakes.map((item) => item.name))
  const base = BASE_WEAK.filter((item) => !names.has(item.name))

  return [...fromMistakes, ...base].slice(0, 3)
}

export default function Parent() {
  const { mistakes, isMember, goTab } = useApp()
  const { toast, showToast } = useToast()
  const weakPoints = useMemo(() => buildWeakPoints(mistakes), [mistakes])

  const handleShare = () => {
    showToast('已生成分享卡片（演示）')
  }

  return (
    <div className="page-inner">
      <section className="report-child">
        <div className="report-avatar">🧒</div>
        <div className="report-child-main">
          <span className="tag tag-subject">初一 · 小雨</span>
          <h2>本周学习周报</h2>
          <p>已坚持学习 12 天 · 本周共完成 54 道题</p>
        </div>
        <span className="report-demo">演示数据</span>
      </section>

      <section className="report-metrics">
        {OVERVIEW.map((item) => (
          <div className="report-metric" key={item.label}>
            <span>{item.label}</span>
            <strong>
              {item.value}
              <em>{item.unit}</em>
            </strong>
            <small className={item.up ? 'trend-up' : 'trend-down'}>
              较上周 {item.trend}
            </small>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <h3>每日学习时长</h3>
          <span className="muted">分钟 · 演示数据</span>
        </div>
        <div className="card chart-card">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={168}>
              <BarChart data={STUDY_DATA} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="studyBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c93f5" />
                    <stop offset="100%" stopColor="#4f6bed" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f8" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#8b93a8' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#8b93a8' }}
                  width={34}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(79,107,237,.06)' }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => [`${value} 分钟`, '学习时长']}
                />
                <Bar dataKey="minutes" fill="url(#studyBar)" radius={[7, 7, 4, 4]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>正确率趋势</h3>
          <span className="muted">近 4 周 · 演示数据</span>
        </div>
        <div className="card chart-card">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={158}>
              <LineChart data={ACCURACY_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f8" />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#8b93a8' }}
                />
                <YAxis
                  domain={[50, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#8b93a8' }}
                  width={38}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => [`${value}%`, '平均正确率']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#FF9F43"
                  strokeWidth={3}
                  dot={{ r: 3.5, fill: '#ffffff', stroke: '#FF9F43', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#FF9F43', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>薄弱知识点 Top3</h3>
          <span className="muted">按错误率排序</span>
        </div>
        <div className="card weak-card">
          {weakPoints.map((item) => (
            <div className="weak-row" key={item.name}>
              <div className="weak-head">
                <span className="weak-name">
                  {item.name}
                  {item.fromMistakes ? <em className="weak-source">来自错题本</em> : null}
                </span>
                <strong>{item.errorRate}%</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill warn"
                  style={{ width: `${Math.min(100, item.errorRate)}%` }}
                />
              </div>
              <p className="weak-tip">
                错误率 {item.errorRate}% · 建议本周练习 {item.practice} 次
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>学科掌握度</h3>
          <span className="muted">演示数据</span>
        </div>
        <div className="card subject-mastery">
          {SUBJECT_MASTERY.map((item) => (
            <div className="mastery-row" key={item.name}>
              <span className="mastery-name">{item.name}</span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${item.value}%`, background: item.color }}
                />
              </div>
              <strong>{item.value}%</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="advice-card">
          <div className="advice-top">
            <span className="advice-emoji">🌱</span>
            <div>
              <p className="advice-eyebrow">AI 鼓励与建议</p>
              <h3>小雨这周的坚持，值得被看见</h3>
            </div>
          </div>
          <p className="advice-text">
            这周小雨在数学上的投入明显增加，遇到难题愿意先自己思考再看讲解。正确率稳步上升，说明她正在从「记住答案」转向「理解方法」。建议家长多关注过程，而不是只问结果。
          </p>
          <ul className="advice-list">
            {TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        {isMember ? (
          <div className="upgrade-strip member">
            <div>
              <strong>完整周报已解锁</strong>
              <p>AI 个性化提分方案已同步到孩子的学习计划。</p>
            </div>
            <span className="upgrade-check">✓</span>
          </div>
        ) : (
          <div className="upgrade-strip">
            <div>
              <strong>解锁完整周报：AI 个性化提分方案</strong>
              <p>包含知识点归因、每周提分任务与家长陪伴建议。</p>
            </div>
            <button type="button" className="btn btn-sm btn-orange" onClick={() => goTab('member')}>
              了解会员
            </button>
          </div>
        )}
      </section>

      <button type="button" className="btn btn-primary btn-block share-btn" onClick={handleShare}>
        分享周报给家长群
      </button>
      <p className="version-text">图表与指标均为演示数据，仅用于展示产品思路</p>

      <Toast toast={toast} />
    </div>
  )
}
