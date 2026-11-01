import { useState } from 'react'
import { useApp } from '../store.js'
import { SourceTag, Toast, useToast } from '../components/ui.jsx'

export default function Explain() {
  const { params, mistakes, addMistake, navigate, goTab, tab } = useApp()
  const { toast, showToast } = useToast()
  const { question = '', subject = '', result } = params || {}
  const steps = result?.steps || []
  const [visible, setVisible] = useState(1)
  const [showAnswer, setShowAnswer] = useState(false)
  const [added, setAdded] = useState(() =>
    mistakes.some((item) => item.question === question),
  )

  if (!result) {
    return (
      <div className="page-inner">
        <div className="card placeholder-card">
          <div className="placeholder-emoji">🧭</div>
          <h3>讲解内容已失效</h3>
          <p>请回到首页重新提问，AI 会为你生成新的引导讲解。</p>
          <button type="button" className="btn btn-primary" onClick={() => goTab('home')}>
            回到首页
          </button>
        </div>
      </div>
    )
  }

  const allShown = visible >= steps.length

  const handleAdd = () => {
    if (added) {
      showToast('这道题已经在错题本里啦')
      return
    }
    const ok = addMistake({
      question,
      subject,
      knowledge: result.knowledge,
      steps,
      answer: result.answer,
      studentAnswer: '',
      mastered: false,
    })
    setAdded(true)
    showToast(ok ? '已加入错题本' : '这道题已经在错题本里啦')
  }

  const handlePractice = () => {
    navigate(
      'practice',
      { question, subject, knowledge: result.knowledge },
      { tab },
    )
  }

  return (
    <div className="page-inner">
      <section className="card question-card">
        <div className="tag-row">
          <span className="tag tag-subject">{subject || '综合'}</span>
          <SourceTag source={result.source} />
        </div>
        <p className="question-text">{question}</p>
        <div className="knowledge-line">
          <span className="knowledge-label">知识点</span>
          <span>{result.knowledge}</span>
        </div>
      </section>

      <div className="explain-tip">
        <span>💡</span>
        <p>跟着步骤慢慢想，先不要急着看答案，独立思考效果更好。</p>
      </div>

      <section className="step-list">
        {steps.slice(0, visible).map((step, index) => (
          <article
            className="step-card"
            key={`${step.title}-${index}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="step-index">{index + 1}</div>
            <div className="step-body">
              <h4>{step.title}</h4>
              <p className="step-content">{step.content}</p>
              <div className="hint-bubble">
                <span>想一想</span>
                {step.hint}
              </div>
            </div>
          </article>
        ))}
      </section>

      {!allShown ? (
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => setVisible((current) => Math.min(current + 1, steps.length))}
        >
          下一步 · 展开第 {visible + 1} 步
        </button>
      ) : (
        <div className="answer-box">
          <button
            type="button"
            className="btn btn-answer btn-block"
            onClick={() => setShowAnswer((current) => !current)}
          >
            {showAnswer ? '收起答案' : '查看答案'}
          </button>
          {showAnswer ? (
            <div className="answer-content">
              <span className="answer-label">参考答案</span>
              <p>{result.answer}</p>
            </div>
          ) : (
            <p className="answer-placeholder">先自己试着写出答案，再点击上方按钮核对</p>
          )}
        </div>
      )}

      <div className="action-row">
        <button
          type="button"
          className={`btn ${added ? 'btn-soft' : 'btn-ghost'}`}
          onClick={handleAdd}
        >
          {added ? '✓ 已加入错题本' : '加入错题本'}
        </button>
        <button type="button" className="btn btn-orange" onClick={handlePractice}>
          做同类题练习
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => goTab('home')}>
          再问一题
        </button>
      </div>

      <Toast toast={toast} />
    </div>
  )
}
