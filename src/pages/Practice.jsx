import { useEffect, useState } from 'react'
import { useApp } from '../store.js'
import { gradeAnswer, similarQuestions } from '../api.js'
import { ProgressRing, Toast, useToast } from '../components/ui.jsx'

function scoreColor(score) {
  if (score >= 80) return '#22b07d'
  if (score >= 60) return '#FF9F43'
  return '#ef5b6b'
}

function buildAdvice(total, wrongCount) {
  if (total >= 90) {
    return {
      title: '掌握得很扎实',
      text: `本次平均 ${total} 分，说明这个知识点已经比较熟练。建议把易错细节整理成一句话笔记，隔天再快速回顾一次。`,
    }
  }
  if (total >= 75) {
    return {
      title: '整体不错，再抠细节',
      text: `本次平均 ${total} 分，思路基本正确${
        wrongCount ? `，还有 ${wrongCount} 道题需要订正` : ''
      }。建议对照订正，重点检查关键步骤和书写规范。`,
    }
  }
  if (total >= 60) {
    return {
      title: '基础还需巩固',
      text: `本次平均 ${total} 分，建议先回到错题讲解，把每一步的依据说清楚，再做一遍同类题，避免只记答案。`,
    }
  }
  return {
    title: '先慢下来，重新梳理',
    text: `本次平均 ${total} 分，别着急。建议先看原题的分步讲解，把知识点和解题步骤各写一遍，然后再挑战新题。`,
  }
}

export default function Practice() {
  const {
    params,
    plan,
    addMistake,
    addRecord,
    completeTask,
    goTab,
    tab,
  } = useApp()
  const { toast, showToast } = useToast()
  const { question = '', knowledge = '', subject = '', taskId } = params || {}

  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [answers, setAnswers] = useState([])
  const [results, setResults] = useState([])
  const [grading, setGrading] = useState(false)
  const [gradingIndex, setGradingIndex] = useState(-1)
  const [summary, setSummary] = useState(null)
  const [addedMap, setAddedMap] = useState({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setItems(null)
    setAnswers([])
    setResults([])
    setSummary(null)
    setAddedMap({})

    similarQuestions({ question, knowledge, subject })
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data.questions) ? data.questions : []
        setItems(list)
        setAnswers(new Array(list.length).fill(''))
        setResults(new Array(list.length).fill(null))
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message || '同类题加载失败，请稍后再试')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [question, knowledge, subject, reloadKey])

  const updateAnswer = (index, value) => {
    setAnswers((current) => {
      const next = [...current]
      next[index] = value
      return next
    })
  }

  const handleGrade = async () => {
    if (grading || !items?.length) return
    if (answers.some((answer) => !String(answer || '').trim())) {
      showToast('还有题目没有作答，先补全再提交吧')
      return
    }

    setGrading(true)
    const collected = [...results]

    try {
      for (let index = 0; index < items.length; index += 1) {
        setGradingIndex(index)
        const graded = await gradeAnswer({
          question: items[index].q,
          studentAnswer: answers[index],
          subject,
        })
        collected[index] = graded
        setResults([...collected])
      }

      const total = Math.round(
        collected.reduce((sum, item) => sum + (item?.score || 0), 0) / items.length,
      )
      const wrongCount = collected.filter((item) => !item?.correct).length

      items.forEach((item, index) => {
        addRecord({
          question: item.q,
          knowledge: knowledge || '同类题练习',
          score: collected[index]?.score ?? 0,
          correct: Boolean(collected[index]?.correct),
        })
      })

      const matchedTask =
        taskId ||
        plan.find(
          (task) =>
            task.type === 'practice' &&
            !task.done &&
            (task.knowledge === knowledge || task.id === taskId),
        )?.id

      if (matchedTask) completeTask(matchedTask)

      setSummary({ total, wrongCount, advice: buildAdvice(total, wrongCount) })
      showToast('批改完成，已记录本次练习')
    } catch (err) {
      showToast(err.message || '批改失败，请稍后再试')
    } finally {
      setGrading(false)
      setGradingIndex(-1)
    }
  }

  const handleAddMistake = (index) => {
    const item = items?.[index]
    const result = results?.[index]
    if (!item || !result) return

    const ok = addMistake({
      question: item.q,
      subject,
      knowledge: knowledge || '同类题练习',
      steps: [
        {
          title: '参考解答',
          content: result.correction,
          hint: '对照参考答案，找出自己卡住的那一步，再独立做一遍。',
        },
      ],
      answer: item.answer,
      studentAnswer: answers[index],
      mastered: false,
    })
    setAddedMap((current) => ({ ...current, [index]: true }))
    showToast(ok ? '错题已加入错题本' : '这道题已经在错题本里啦')
  }

  const handleRetry = () => {
    setReloadKey((current) => current + 1)
  }

  const allGraded =
    items?.length > 0 && results.length === items.length && results.every(Boolean)

  return (
    <div className="page-inner">
      <section className="card practice-origin">
        <div className="tag-row">
          <span className="tag tag-subject">{subject || '综合'}</span>
          {knowledge ? <span className="tag">{knowledge}</span> : null}
        </div>
        <p className="muted">根据这道题生成同类题</p>
        <p className="origin-question">{question}</p>
      </section>

      {loading ? (
        <div className="practice-list">
          {[0, 1, 2].map((item) => (
            <div className="card skeleton-practice" key={item}>
              <div className="skeleton-line w-40" />
              <div className="skeleton-line w-90" />
              <div className="skeleton-line w-70" />
              <div className="skeleton-input" />
            </div>
          ))}
          <p className="muted center-text">AI 正在生成 3 道同类题…</p>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="card placeholder-card">
          <div className="placeholder-emoji">📡</div>
          <h3>同类题加载失败</h3>
          <p>{error}</p>
          <div className="inline-actions">
            <button type="button" className="btn btn-primary" onClick={handleRetry}>
              重新加载
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => goTab(tab)}>
              返回
            </button>
          </div>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="practice-list">
            {items?.map((item, index) => {
              const result = results[index]
              const isGrading = grading && gradingIndex === index
              return (
                <section className="card practice-card" key={`${item.q}-${index}`}>
                  <div className="practice-head">
                    <span className="practice-index">第 {index + 1} 题</span>
                    {result ? (
                      <span className={`result-pill ${result.correct ? 'ok' : 'bad'}`}>
                        {result.correct ? '回答正确' : '需要订正'}
                      </span>
                    ) : isGrading ? (
                      <span className="result-pill pending">AI 批改中…</span>
                    ) : null}
                  </div>
                  <p className="practice-question">{item.q}</p>

                  <textarea
                    className="practice-input"
                    value={answers[index] || ''}
                    placeholder="写下你的答案或关键步骤"
                    disabled={Boolean(result) || grading}
                    onChange={(event) => updateAnswer(index, event.target.value)}
                  />

                  {result ? (
                    <div className="grade-result">
                      <div className="grade-top">
                        <ProgressRing
                          value={result.score}
                          size={62}
                          stroke={7}
                          color={scoreColor(result.score)}
                          label={result.score}
                        />
                        <div className="grade-copy">
                          <h4>{result.correct ? '做得不错' : '再检查一下'}</h4>
                          <p>{result.comment}</p>
                        </div>
                      </div>
                      <div className="correction-box">
                        <span>订正</span>
                        <p>{result.correction}</p>
                      </div>
                      {!result.correct ? (
                        <button
                          type="button"
                          className={`btn btn-sm ${addedMap[index] ? 'btn-soft' : 'btn-ghost'}`}
                          onClick={() => handleAddMistake(index)}
                        >
                          {addedMap[index] ? '✓ 已加入错题本' : '加入错题本'}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>

          {!allGraded ? (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleGrade}
              disabled={grading}
            >
              {grading ? `AI 正在批改第 ${gradingIndex + 1} 题…` : '提交批改'}
            </button>
          ) : null}

          {summary ? (
            <section className="summary-card">
              <div className="summary-top">
                <ProgressRing
                  value={summary.total}
                  size={92}
                  stroke={9}
                  color="#FFD37A"
                  trackColor="rgba(255,255,255,.22)"
                  label={summary.total}
                  sub="本次总分"
                  className="ring-hero"
                />
                <div>
                  <p className="summary-eyebrow">练习完成</p>
                  <h3>AI 学习建议</h3>
                  <strong>{summary.advice.title}</strong>
                </div>
              </div>
              <p className="summary-text">{summary.advice.text}</p>
              <div className="summary-actions">
                <button type="button" className="btn btn-ghost" onClick={handleRetry}>
                  再练一组
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => goTab(tab)}
                >
                  完成并返回
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <Toast toast={toast} />
    </div>
  )
}
