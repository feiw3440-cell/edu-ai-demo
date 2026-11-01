import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.js'
import { explainQuestion } from '../api.js'
import { sampleQuestions } from '../data/mock.js'
import { ProgressRing, Toast, useToast } from '../components/ui.jsx'

const SUBJECTS = ['数学', '语文', '英语']

function greeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export default function Home() {
  const {
    plan,
    records,
    mistakes,
    isMember,
    aiRemaining,
    freeLimit,
    consumeAI,
    navigate,
    goTab,
  } = useApp()
  const { toast, showToast } = useToast()
  const [subject, setSubject] = useState('数学')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const photoTimer = useRef(null)

  useEffect(
    () => () => {
      if (photoTimer.current) clearTimeout(photoTimer.current)
    },
    [],
  )

  const doneCount = plan.filter((task) => task.done).length
  const progress = plan.length ? Math.round((doneCount / plan.length) * 100) : 0
  const recent = records.slice(0, 3)

  const handleSubject = (item) => {
    setSubject(item)
  }

  const handlePhoto = () => {
    if (photoLoading || loading) return
    setPhotoLoading(true)
    photoTimer.current = setTimeout(() => {
      const pool = sampleQuestions.filter((item) => item.subject === subject)
      const source = pool.length ? pool : sampleQuestions
      const picked = source[Math.floor(Math.random() * source.length)]
      setQuestion(picked.question)
      setPhotoLoading(false)
      showToast('模拟识别成功，已填入题目')
    }, 1200)
  }

  const handleSubmit = async () => {
    const text = question.trim()
    if (!text) {
      showToast('请先输入或选择一道题目')
      return
    }
    if (!isMember && aiRemaining <= 0) {
      showToast('今日免费答疑次数已用完')
      navigate('member', {}, { tab: 'member' })
      return
    }

    setLoading(true)
    try {
      const result = await explainQuestion({ question: text, subject })
      const allowed = consumeAI()
      setLoading(false)
      if (!allowed) {
        showToast('今日免费答疑次数已用完')
        navigate('member', {}, { tab: 'member' })
        return
      }
      navigate('explain', { question: text, subject, result }, { tab: 'home' })
    } catch (error) {
      setLoading(false)
      showToast(error.message || '讲解生成失败，请稍后再试')
    }
  }

  const fillSample = (sample) => {
    setQuestion(sample.question)
    setSubject(sample.subject)
  }

  return (
    <div className="page-inner">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="hero-greet">{greeting()}，小雨同学</p>
          <h2>今天也要一起进步</h2>
          <p className="hero-sub">完成今日计划，AI 老师陪你一步步拆解难题</p>
          <div className="hero-badges">
            <span className="badge">
              {isMember ? '会员无限次' : `今日剩余 ${aiRemaining}/${freeLimit} 次`}
            </span>
            <span className="badge">错题本 {mistakes.length} 道</span>
          </div>
        </div>
        <ProgressRing
          className="ring-hero"
          value={progress}
          size={88}
          stroke={9}
          color="#FFD37A"
          trackColor="rgba(255,255,255,.22)"
          label={`${progress}%`}
          sub="今日进度"
        />
      </section>

      <section className="section">
        <div className="section-head">
          <h3>AI 引导式答疑</h3>
          <span className="muted">先思考，再看答案</span>
        </div>
        <div className="card ask-card">
          <div className="subject-row">
            {SUBJECTS.map((item) => (
              <button
                type="button"
                key={item}
                className={`subject-chip ${subject === item ? 'active' : ''}`}
                onClick={() => handleSubject(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <textarea
            className="ask-input"
            value={question}
            maxLength={500}
            placeholder="把题目粘贴到这里，或点击「拍题」试试"
            onChange={(event) => setQuestion(event.target.value)}
          />

          <div className="ask-tools">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handlePhoto}
              disabled={photoLoading || loading}
            >
              📷 拍题
            </button>
            <span className="char-count">{question.length}/500</span>
          </div>

          {photoLoading ? (
            <div className="scan-box">
              <div className="scan-line" />
              <span>模拟拍照识别中…</span>
            </div>
          ) : null}

          <button
            type="button"
            className="btn btn-primary btn-block ask-submit"
            onClick={handleSubmit}
            disabled={loading || photoLoading}
          >
            {loading ? 'AI 正在思考…' : '提交，开始引导讲解'}
          </button>

          {loading ? (
            <div className="skeleton-card">
              <div className="skeleton-line w-60" />
              <div className="skeleton-line w-90" />
              <div className="skeleton-line w-75" />
            </div>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>试试这些题</h3>
          <span className="muted">9 道示例</span>
        </div>
        <div className="chip-wrap">
          {sampleQuestions.map((sample, index) => (
            <button
              type="button"
              key={`${sample.subject}-${index}`}
              className="sample-chip"
              onClick={() => fillSample(sample)}
            >
              <span className="chip-sub">{sample.subject}</span>
              {sample.question.length > 24
                ? `${sample.question.slice(0, 24)}…`
                : sample.question}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>最近记录</h3>
          <button type="button" className="link-btn" onClick={() => goTab('plan')}>
            查看计划
          </button>
        </div>
        <div className="card record-list">
          {recent.length === 0 ? (
            <p className="muted center-text">还没有练习记录，去完成一次同类题练习吧</p>
          ) : (
            recent.map((record) => (
              <div className="record-item" key={record.id}>
                <div className={`record-score ${record.score >= 80 ? '' : 'bad'}`}>
                  {record.score}
                </div>
                <div className="record-main">
                  <p className="record-q">{record.question}</p>
                  <p className="record-meta">
                    {record.knowledge} · {formatDate(record.at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Toast toast={toast} />
    </div>
  )
}
