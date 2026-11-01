import { useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '../store.js'

const LABELS = ['访问', '注册', '使用 AI 答疑', '触达额度上限', '浏览会员页', '付费']

const RETAIN_DATA = {
  '7': [
    { day: 'D1', rate: 57.2 },
    { day: 'D3', rate: 42.6 },
    { day: 'D7', rate: 34.8 },
  ],
  '30': [
    { day: 'D1', rate: 54.6 },
    { day: 'D3', rate: 39.1 },
    { day: 'D7', rate: 31.2 },
  ],
}

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: '1px solid #e9edf6',
  boxShadow: '0 8px 20px rgba(31,45,90,.12)',
  fontSize: 11,
  padding: '6px 10px',
}

function mulberry32(seed) {
  let value = seed
  return function random() {
    value += 0x6d2b79f5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function formatDay(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function buildSeries(days, seed) {
  const random = mulberry32(seed)
  const today = new Date()
  const list = []
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - index)
    const step = days - index
    const base = days === 7 ? 1120 : 940
    const wave = Math.sin(step / 3.1) * (days === 7 ? 70 : 110)
    const growth = step * (days === 7 ? 9 : 4)
    const dau = Math.round(base + wave + growth + random() * 120)
    const ai = Math.round(dau * (0.82 + random() * 0.32))
    list.push({ label: formatDay(date), dau, ai })
  }
  return list
}

function buildFunnel(range, seed) {
  const random = mulberry32(seed)
  const base = range === '7' ? 12600 : 48600
  const rates =
    range === '7'
      ? [1, 0.63, 0.72, 0.47, 0.55, 0.14]
      : [1, 0.61, 0.7, 0.45, 0.52, 0.13]

  let current = base
  let previous = base
  return LABELS.map((label, index) => {
    if (index === 0) {
      current = base
    } else {
      previous = current
      const jitter = 1 + (random() - 0.5) * 0.05
      current = Math.round(current * rates[index] * jitter)
    }
    return {
      label,
      count: current,
      rate: index === 0 ? 100 : Math.round((current / previous) * 1000) / 10,
    }
  })
}

export default function Dashboard() {
  const { navigate, goTab, tab } = useApp()
  const [range, setRange] = useState('7')

  const view = useMemo(() => {
    const days = range === '7' ? 7 : 30
    const data = buildSeries(days, range === '7' ? 20260701 : 20260801)
    const random = mulberry32(range === '7' ? 731 : 7301)
    const funnel = buildFunnel(range, range === '7' ? 991 : 992)

    const dauTotal = data.reduce((sum, item) => sum + item.dau, 0)
    const avgDau = Math.round(dauTotal / data.length)
    const aiTotal = data.reduce((sum, item) => sum + item.ai, 0)
    const retention = (RETAIN_DATA[range][2].rate + (random() - 0.5) * 0.8).toFixed(1)
    const conversion = ((funnel[5].count / funnel[1].count) * 100).toFixed(1)
    const peak = data.reduce((best, item) => (item.dau > best.dau ? item : best), data[0])

    const hitLimit = funnel[3].count
    const browseMember = funnel[4].count
    const viewRate = Math.round((browseMember / Math.max(1, hitLimit)) * 100)
    const payOfLimit = Math.round((funnel[5].count / Math.max(1, hitLimit)) * 100)

    const metrics = [
      {
        label: 'DAU',
        value: avgDau.toLocaleString('zh-CN'),
        sub: '日均活跃用户',
        trend: `+${(3.6 + random() * 5).toFixed(1)}%`,
        up: true,
      },
      {
        label: '7 日留存',
        value: `${retention}%`,
        sub: '近 7 日注册用户',
        trend: `-${(0.4 + random() * 1.4).toFixed(1)}%`,
        up: false,
      },
      {
        label: 'AI 答疑使用',
        value: aiTotal.toLocaleString('zh-CN'),
        sub: `${days} 天累计次数`,
        trend: `+${(6 + random() * 9).toFixed(1)}%`,
        up: true,
      },
      {
        label: '免费 → 付费',
        value: `${conversion}%`,
        sub: '注册用户转化率',
        trend: `+${(0.2 + random() * 0.6).toFixed(1)}pp`,
        up: true,
      },
    ]

    const insights = [
      `触达额度上限的用户中仅 ${viewRate}% 进入会员页，建议把额度用尽引导前置到讲解结束页，并增加 7 天会员试用降低决策门槛。`,
      `DAU 峰值出现在 ${peak.label}（${peak.dau.toLocaleString('zh-CN')}），周末学习意愿更强，建议把家长周报推送与周末练习活动放在周六上午。`,
      `额度触达后付费率为 ${payOfLimit}%，免费 → 付费整体转化 ${conversion}%。建议对比「继续提问」与「解锁完整讲解」两版引导文案，优先优化第二屏。`,
    ]

    return {
      data,
      funnel,
      metrics,
      insights,
      retentionData: RETAIN_DATA[range],
      days,
      maxCount: funnel[0].count,
    }
  }, [range])

  return (
    <div className="page-inner dash-page">
      <section className="dash-head">
        <div>
          <span className="tag tag-subject">运营后台</span>
          <h2>学习行为与增长</h2>
          <p>关注留存、AI 使用与会员转化的核心数据</p>
        </div>
        <span className="demo-badge">模拟数据</span>
      </section>

      <div className="demo-notice">⚠️ 以下均为演示用模拟数据，用于展示数据看板设计思路</div>

      <div className="range-switch" role="tablist" aria-label="时间范围">
        <button
          type="button"
          className={range === '7' ? 'active' : ''}
          onClick={() => setRange('7')}
        >
          近 7 天
        </button>
        <button
          type="button"
          className={range === '30' ? 'active' : ''}
          onClick={() => setRange('30')}
        >
          近 30 天
        </button>
      </div>

      <section className="dash-metrics">
        {view.metrics.map((metric) => (
          <div className="dash-metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.sub}</small>
            <em className={metric.up ? 'up' : 'down'}>
              环比 {metric.trend}
            </em>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <h3>DAU 与 AI 答疑趋势</h3>
          <div className="chart-legend">
            <span><i className="dot line" />DAU</span>
            <span><i className="dot bar" />AI 答疑</span>
          </div>
        </div>
        <div className="card chart-card">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={210}>
              <ComposedChart
                data={view.data}
                margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="aiBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffb15c" />
                    <stop offset="100%" stopColor="#ff9f43" stopOpacity={0.72} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f8" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval={range === '7' ? 0 : 4}
                  tick={{ fontSize: 9.5, fill: '#8b93a8' }}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9.5, fill: '#8b93a8' }}
                  width={40}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9.5, fill: '#8b93a8' }}
                  width={34}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(79,107,237,.05)' }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, name) =>
                    name === 'DAU' ? [value, 'DAU'] : [`${value} 次`, 'AI 答疑']
                  }
                />
                <Bar
                  yAxisId="right"
                  dataKey="ai"
                  name="AI 答疑"
                  fill="url(#aiBar)"
                  radius={[6, 6, 3, 3]}
                  barSize={range === '7' ? 16 : 7}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="dau"
                  name="DAU"
                  stroke="#4F6BED"
                  strokeWidth={2.6}
                  dot={false}
                  activeDot={{ r: 4, fill: '#4F6BED', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>7 日留存曲线</h3>
          <span className="muted">D1 / D3 / D7</span>
        </div>
        <div className="card chart-card">
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={132}>
              <LineChart
                data={view.retentionData}
                margin={{ top: 8, right: 12, left: -26, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f8" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#8b93a8' }}
                />
                <YAxis
                  domain={[20, 70]}
                  tickFormatter={(value) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9.5, fill: '#8b93a8' }}
                  width={38}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => [`${value}%`, '留存率']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#22B07D"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ffffff', stroke: '#22B07D', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#22B07D', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>免费 → 付费转化漏斗</h3>
          <span className="muted">逐级转化率</span>
        </div>
        <div className="card funnel-card">
          {view.funnel.map((step, index) => {
            const width = Math.max(
              8,
              Math.round((step.count / Math.max(1, view.maxCount)) * 100),
            )
            return (
              <div className="funnel-step" key={step.label}>
                <div className="funnel-meta">
                  <span>
                    {String(index + 1).padStart(2, '0')} {step.label}
                  </span>
                  <strong>{step.count.toLocaleString('zh-CN')}</strong>
                </div>
                <div className="funnel-track">
                  <div
                    className={`funnel-bar funnel-bar-${index}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <p className="funnel-rate">
                  {index === 0 ? '进入流程的起点' : `上一环节转化 ${step.rate}%`}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>洞察与行动建议</h3>
          <span className="muted">PM 视角</span>
        </div>
        <div className="card insight-card">
          {view.insights.map((text, index) => (
            <div className="insight-item" key={text}>
              <span className="insight-index">{index + 1}</span>
              <p>{text}</p>
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
