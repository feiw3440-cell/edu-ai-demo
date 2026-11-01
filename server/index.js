import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  explainQuestion,
  gradeAnswer,
  sampleCount,
  similarQuestions,
  trimText,
} from '../src/ai/core.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(express.json({ limit: '1mb' }))

app.post('/api/explain', async (req, res) => {
  const question = trimText(req.body?.question)
  const subject = trimText(req.body?.subject, 40)

  if (!question) {
    return res.status(400).json({ error: '请提供题目内容 question' })
  }

  return res.json(await explainQuestion({ question, subject }))
})

app.post('/api/grade', async (req, res) => {
  const question = trimText(req.body?.question)
  const studentAnswer = trimText(req.body?.studentAnswer)
  const subject = trimText(req.body?.subject, 40)

  if (!question) {
    return res.status(400).json({ error: '请提供题目内容 question' })
  }
  if (!studentAnswer) {
    return res.status(400).json({ error: '请提供学生答案 studentAnswer' })
  }

  const referenceAnswer = trimText(req.body?.referenceAnswer, 500)
  return res.json(
    await gradeAnswer({ question, studentAnswer, subject, referenceAnswer }),
  )
})

app.post('/api/similar', async (req, res) => {
  const question = trimText(req.body?.question)
  const knowledge = trimText(req.body?.knowledge, 500)
  const subject = trimText(req.body?.subject, 40)

  if (!question) {
    return res.status(400).json({ error: '请提供题目内容 question' })
  }

  return res.json(await similarQuestions({ question, knowledge, subject }))
})

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'edu-ai-demo',
    samples: sampleCount,
    time: new Date().toISOString(),
  })
})

app.use('/api', (req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

const distDir = path.resolve(__dirname, '../dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distDir, 'index.html'))
    }
    return next()
  })
}

app.use((error, req, res, next) => {
  console.error('[server] 未处理的错误：', error)
  if (res.headersSent) return next(error)
  return res.status(500).json({ error: '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`AI 学习助手后端已启动：http://localhost:${PORT}`)
})

export default app
