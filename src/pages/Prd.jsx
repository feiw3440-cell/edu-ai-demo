import prdSource from '../../PRD.md?raw'
import { useApp } from '../store.js'

const FLOW_STEPS = [
  { icon: '📷', title: '拍题 / 输入', desc: '文字或拍照识别题目' },
  { icon: '🧭', title: 'AI 分步讲解', desc: '每步先引导思考，再看答案' },
  { icon: '📕', title: '加入错题本', desc: '按知识点自动归类' },
  { icon: '🗓️', title: '生成计划', desc: '复习 + 同类题任务' },
  { icon: '✍️', title: '同类题练习', desc: '即时生成 3 道变式题' },
  { icon: '✅', title: 'AI 批改', desc: '得分、点评与订正' },
  { icon: '📈', title: '学习报告', desc: '沉淀记录与薄弱点' },
  { icon: '👨‍👩‍👧', title: '家长查看', desc: '周报与陪伴建议' },
]

const MEMBER_STEPS = [
  { icon: '🏠', title: '访问首页' },
  { icon: '👤', title: '注册登录' },
  { icon: '🤖', title: '使用 AI 答疑' },
  { icon: '⛔', title: '触达额度上限' },
  { icon: '👑', title: '浏览会员权益' },
  { icon: '💳', title: '演示开通会员' },
]

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function renderInline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`strong-${index}`}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={`code-${index}`}>{part.slice(1, -1)}</code>
    }
    return part
  })
}

function isTableStart(lines, index) {
  const current = lines[index] || ''
  const next = lines[index + 1] || ''
  return (
    current.includes('|') &&
    next.includes('-') &&
    /^\s*\|?[\s:|-]+\|?\s*$/.test(next)
  )
}

function parseMarkdown(source) {
  const lines = String(source).replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim()
      index += 1
      const buffer = []
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        buffer.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push({ type: 'code', lang, content: buffer.join('\n') })
      continue
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        text: heading[2],
      })
      index += 1
      continue
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      index += 1
      continue
    }

    if (isTableStart(lines, index)) {
      const header = splitRow(lines[index])
      index += 2
      const rows = []
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitRow(lines[index]))
        index += 1
      }
      blocks.push({ type: 'table', header, rows })
      continue
    }

    const ordered = /^\s*\d+\.\s+/.test(line)
    if (/^\s*[-*]\s+/.test(line) || ordered) {
      const items = []
      while (
        index < lines.length &&
        (/^\s*[-*]\s+/.test(lines[index]) || /^\s*\d+\.\s+/.test(lines[index]))
      ) {
        items.push(lines[index].replace(/^\s*([-*]|\d+\.)\s+/, ''))
        index += 1
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    if (/^>\s?/.test(line)) {
      const buffer = []
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        buffer.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push({ type: 'quote', text: buffer.join(' ') })
      continue
    }

    const paragraph = [trimmed]
    index += 1
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index]
      if (
        /^(#{1,6}\s|```|>|\s*[-*]\s|\s*\d+\.\s)/.test(next) ||
        isTableStart(lines, index)
      ) {
        break
      }
      paragraph.push(next.trim())
      index += 1
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
  }

  return blocks
}

function MermaidCard({ content }) {
  return (
    <div className="mermaid-card">
      <div className="mermaid-head">
        <span className="mermaid-dot" />
        Mermaid 流程图源码
      </div>
      <pre className="mermaid-source">{content}</pre>
    </div>
  )
}

function StudyFlow() {
  return (
    <div className="prd-flow">
      <div className="prd-flow-title">
        <span className="flow-badge">学生端闭环</span>
        <span>产品核心流程图</span>
      </div>
      <div className="flow-list">
        {FLOW_STEPS.map((step, index) => (
          <div className="flow-step" key={step.title}>
            <div className="flow-node">
              <span className="flow-icon">{step.icon}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.desc}</p>
              </div>
              <span className="flow-index">{String(index + 1).padStart(2, '0')}</span>
            </div>
            {index < FLOW_STEPS.length - 1 ? <span className="flow-arrow">↓</span> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function MemberFlow() {
  return (
    <div className="prd-flow member-flow">
      <div className="prd-flow-title">
        <span className="flow-badge orange">会员转化</span>
        <span>从免费试用到付费</span>
      </div>
      <div className="flow-row">
        {MEMBER_STEPS.map((step, index) => (
          <div className="flow-chip-wrap" key={step.title}>
            <div className="flow-chip">
              <span>{step.icon}</span>
              {step.title}
            </div>
            {index < MEMBER_STEPS.length - 1 ? (
              <span className="flow-chip-arrow">→</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function MarkdownTable({ header, rows }) {
  return (
    <div className="md-table-wrap">
      <table>
        <thead>
          <tr>
            {header.map((cell, index) => (
              <th key={`th-${index}`}>{renderInline(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`tr-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td key={`td-${rowIndex}-${cellIndex}`}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderBlock(block, index) {
  if (block.type === 'heading') {
    const Tag = `h${Math.min(block.level, 4)}`
    return (
      <Tag key={`heading-${index}`} className={`md-heading md-h${block.level}`}>
        {renderInline(block.text)}
      </Tag>
    )
  }

  if (block.type === 'paragraph') {
    return (
      <p key={`paragraph-${index}`} className="md-paragraph">
        {renderInline(block.text)}
      </p>
    )
  }

  if (block.type === 'list') {
    const Tag = block.ordered ? 'ol' : 'ul'
    return (
      <Tag key={`list-${index}`} className="md-list">
        {block.items.map((item, itemIndex) => (
          <li key={`item-${index}-${itemIndex}`}>{renderInline(item)}</li>
        ))}
      </Tag>
    )
  }

  if (block.type === 'table') {
    return <MarkdownTable key={`table-${index}`} {...block} />
  }

  if (block.type === 'quote') {
    return (
      <blockquote key={`quote-${index}`} className="md-quote">
        {renderInline(block.text)}
      </blockquote>
    )
  }

  if (block.type === 'hr') {
    return <hr key={`hr-${index}`} className="md-hr" />
  }

  if (block.type === 'code') {
    if (block.lang === 'mermaid') {
      const isStudy = block.content.includes('家长查看') || block.content.includes('错题本')
      return (
        <div key={`code-${index}`} className="mermaid-block">
          <MermaidCard content={block.content} />
          {isStudy ? <StudyFlow /> : <MemberFlow />}
        </div>
      )
    }
    return (
      <pre key={`code-${index}`} className="md-code">
        <code>{block.content}</code>
      </pre>
    )
  }

  return null
}

export default function Prd() {
  const { navigate, goTab, tab } = useApp()
  const blocks = parseMarkdown(prdSource)

  return (
    <div className="page-inner prd-page">
      <div className="prd-topline">
        <span className="tag tag-subject">作品集文档</span>
        <span className="muted">内容来自仓库根目录 PRD.md</span>
      </div>

      <article className="prd-markdown">{blocks.map(renderBlock)}</article>

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
