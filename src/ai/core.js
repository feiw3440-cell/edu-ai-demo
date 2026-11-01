import {
  findSample,
  genericExplain,
  genericSimilarQuestions,
  samples,
} from './samples.js'

export const AI_URL = 'https://text.pollinations.ai/openai'
export const AI_TIMEOUT = 20000

export const trimText = (value, max = 4000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

export function extractJson(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // 继续尝试从文本中提取第一个完整的 JSON 对象
  }

  const start = cleaned.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < cleaned.length; i += 1) {
    const char = cleaned[i]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
    } else if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0) {
        try {
          return JSON.parse(cleaned.slice(start, i + 1))
        } catch {
          return null
        }
      }
    }
  }

  return null
}

// 免费无密钥接口有速率限制：串行排队 + 间隔 + 一次重试
let aiQueue = Promise.resolve()

export function callAI(systemPrompt, userPrompt) {
  const run = async () => {
    try {
      return await callAIOnce(systemPrompt, userPrompt)
    } catch (e) {
      if (/402|429|503/.test(e.message)) {
        await new Promise((r) => setTimeout(r, 4000))
        return await callAIOnce(systemPrompt, userPrompt)
      }
      throw e
    } finally {
      await new Promise((r) => setTimeout(r, 1200))
    }
  }
  const result = aiQueue.then(run, run)
  aiQueue = result.catch(() => {})
  return result
}

async function callAIOnce(systemPrompt, userPrompt) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT)

  try {
    const response = await fetch(AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`AI 服务返回 ${response.status}`)
    }

    const rawText = await response.text()
    let content = rawText

    try {
      const payload = JSON.parse(rawText)
      const messageContent = payload?.choices?.[0]?.message?.content
      if (typeof messageContent === 'string') {
        content = messageContent
      } else if (messageContent && typeof messageContent === 'object') {
        content = JSON.stringify(messageContent)
      }
    } catch {
      // 服务端直接返回文本时，继续使用原始文本
    }

    const data = extractJson(content)
    if (!data) {
      throw new Error('AI 返回内容无法解析为 JSON')
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

function isValidExplain(data) {
  if (!data || !Array.isArray(data.steps)) return false
  if (data.steps.length < 3 || data.steps.length > 5) return false
  const stepsValid = data.steps.every(
    (step) =>
      step &&
      typeof step.title === 'string' &&
      step.title.trim() &&
      typeof step.content === 'string' &&
      step.content.trim() &&
      typeof step.hint === 'string' &&
      step.hint.trim(),
  )
  return (
    stepsValid &&
    typeof data.knowledge === 'string' &&
    data.knowledge.trim() &&
    typeof data.answer === 'string' &&
    data.answer.trim()
  )
}

function explainFromSample(sample, question) {
  return {
    steps: sample.steps.map((step) => ({
      title: step.title,
      content: step.content,
      hint: step.hint,
    })),
    knowledge: sample.knowledge,
    answer: sample.answer,
    source: 'sample',
    question,
  }
}

function fallbackExplain({ question, subject }) {
  const sample = findSample({ question, subject })
  if (sample) return explainFromSample(sample, question)
  const generic = genericExplain(subject, question)
  return {
    steps: generic.steps,
    knowledge: generic.knowledge,
    answer: generic.answer,
    source: 'sample',
    question,
  }
}

export async function explainQuestion(input = {}) {
  const question = trimText(input.question)
  const subject = trimText(input.subject, 40)

  if (!question) {
    throw new Error('请提供题目内容 question')
  }

  const sample = findSample({ question, subject })
  if (sample) return explainFromSample(sample, question)

  try {
    const data = await callAI(
      '你是一位耐心、专业的 K12 辅导老师，擅长用启发式提问引导学生独立思考。你只输出 JSON，不输出 Markdown 代码围栏或多余解释。',
      `学生的问题：${question}
科目：${subject || '未指定'}

请以引导式讲解回答，严格输出如下 JSON：
{"steps":[{"title":"步骤标题","content":"讲解内容","hint":"引导学生思考的反问"}],"knowledge":"知识点","answer":"最终答案"}

要求：
1. steps 为 3-5 步，逻辑递进，从审题到得出结论；
2. 每步的 hint 必须是一句启发学生自己思考的反问，不能直接给答案；
3. steps 中不要直接写出最终答案，最终答案只放在 answer；
4. knowledge 是知识点名称，4-12 个字的短语（例如“一元一次方程”“勾股定理”“现在完成时”），不要写成句子；
5. 全部使用简体中文。`,
    )

    if (!isValidExplain(data)) {
      throw new Error('AI 返回的讲解结构不完整')
    }

    return {
      steps: data.steps.map((step) => ({
        title: step.title.trim(),
        content: step.content.trim(),
        hint: step.hint.trim(),
      })),
      knowledge: data.knowledge.trim(),
      answer: data.answer.trim(),
      source: 'ai',
      question,
    }
  } catch (error) {
    console.warn('[explain] AI 调用失败，回退预置回答：', error.message)
    return fallbackExplain({ question, subject })
  }
}

function normalizeAnswer(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。；：、！？"'“”‘’（）()[\]{}<>,.;:!?=＝]/g, '')
}

function extractNumbers(value) {
  return (String(value).match(/-?\d+(?:\.\d+)?/g) || []).sort().join(',')
}

function gradeWithSample(sample, studentAnswer) {
  const target = normalizeAnswer(sample.answer)
  const answer = normalizeAnswer(studentAnswer)

  if (!answer) {
    return {
      score: 0,
      correct: false,
      comment: '还没有填写答案。先说说你的思路，再尝试写出关键步骤或最终结果。',
      correction: `参考答案：${sample.answer}`,
    }
  }

  if (answer === target || (extractNumbers(answer) && extractNumbers(answer) === extractNumbers(target))) {
    return {
      score: 100,
      correct: true,
      comment: '答案正确，关键结果与标准答案一致。再回顾一下推理过程，确保每一步都有依据。',
      correction: `参考答案：${sample.answer}`,
    }
  }

  if (target.includes(answer) && answer.length >= Math.max(2, target.length * 0.4)) {
    return {
      score: 90,
      correct: true,
      comment: '主要结果正确，但表述还不够完整。建议把关键步骤和单位补充清楚。',
      correction: `参考答案：${sample.answer}`,
    }
  }

  const targetChars = new Set(target)
  const overlap = [...new Set(answer)].filter((char) => targetChars.has(char)).length
  const ratio = targetChars.size ? overlap / targetChars.size : 0
  const score = Math.round(Math.min(80, Math.max(20, ratio * 100)))
  const correct = score >= 80

  return {
    score,
    correct,
    comment: correct
      ? '思路基本正确，部分表述与参考答案有差异，建议对照讲解再检查关键步骤。'
      : '答案与参考答案差距较大。建议先回到题目条件，按引导步骤重新梳理思路，再作答。',
    correction: `参考答案：${sample.answer}`,
  }
}

function isValidGrade(data) {
  return (
    data &&
    Number.isFinite(Number(data.score)) &&
    Number(data.score) >= 0 &&
    Number(data.score) <= 100 &&
    typeof data.correct === 'boolean' &&
    typeof data.comment === 'string' &&
    data.comment.trim() &&
    typeof data.correction === 'string' &&
    data.correction.trim()
  )
}

export async function gradeAnswer(input = {}) {
  const question = trimText(input.question)
  const studentAnswer = trimText(input.studentAnswer)
  const subject = trimText(input.subject, 40)

  if (!question) {
    throw new Error('请提供题目内容 question')
  }
  if (!studentAnswer) {
    throw new Error('请提供学生答案 studentAnswer')
  }

  const referenceAnswer = trimText(input.referenceAnswer, 500)
  const sample = referenceAnswer ? { answer: referenceAnswer } : findSample({ question, subject })

  try {
    const data = await callAI(
      '你是一位严谨而鼓励学生的 K12 老师。你只输出 JSON，不输出 Markdown 代码围栏或多余解释。',
      `题目：${question}
学生答案：${studentAnswer}
科目：${subject || '未指定'}
${sample ? `参考答案：${sample.answer}` : ''}

请批改学生答案，严格输出如下 JSON：
{"score":0,"correct":false,"comment":"针对性点评","correction":"正确解法或答案"}

要求：
1. score 是 0-100 的整数，按要点和正确程度给分；
2. correct 为布尔值，score >= 80 时一般设为 true；
3. comment 用 2-3 句简体中文，先肯定再指出问题，语气鼓励；
4. correction 给出正确解法或参考答案，不要只写“错误”；
5. 全部使用简体中文。`,
    )

    if (!isValidGrade(data)) {
      throw new Error('AI 返回的批改结构不完整')
    }

    // 有参考答案且与学生答案完全一致时，以确定性判分为准（避免小模型误判）
    if (sample) {
      const local = gradeWithSample(sample, studentAnswer)
      if (local.score === 100 && Number(data.score) < 90) return local
    }

    return {
      score: Math.round(Number(data.score)),
      correct: Boolean(data.correct),
      comment: data.comment.trim(),
      correction: data.correction.trim(),
    }
  } catch (error) {
    console.warn('[grade] AI 调用失败，回退本地批改：', error.message)
    if (sample) return gradeWithSample(sample, studentAnswer)
    return {
      score: 60,
      correct: false,
      comment: '已收到你的答案。这道题暂未收录标准答案，建议对照讲解检查关键步骤，再完善表述。',
      correction: '请参考讲解中的思路，核对每一步的变形、依据和计算。',
    }
  }
}

function similarFromSample(sample) {
  return {
    questions: sample.similar.map((item) => ({ q: item.q, answer: item.answer })),
  }
}

function isValidSimilar(data) {
  return (
    data &&
    Array.isArray(data.questions) &&
    data.questions.length === 3 &&
    data.questions.every(
      (item) =>
        item &&
        typeof item.q === 'string' &&
        item.q.trim() &&
        typeof item.answer === 'string' &&
        item.answer.trim(),
    )
  )
}

export async function similarQuestions(input = {}) {
  const question = trimText(input.question)
  const knowledge = trimText(input.knowledge, 500)
  const subject = trimText(input.subject, 40)

  if (!question) {
    throw new Error('请提供题目内容 question')
  }

  const sample = findSample({ question, subject, knowledge })

  try {
    const data = await callAI(
      '你是一位 K12 教研老师，擅长围绕同一知识点设计变式题。你只输出 JSON，不输出 Markdown 代码围栏或多余解释。',
      `原题：${question}
知识点：${knowledge || '根据原题判断'}
科目：${subject || '未指定'}

请设计 3 道与原题同知识点、难度相近的同类题，严格输出如下 JSON：
{"questions":[{"q":"题目","answer":"答案"}]}

要求：
1. questions 必须恰好 3 道；
2. 每题都要给出明确可核对的中文答案，计算题给出结果；
3. 不要照抄原题，要适当变换数据或情境；
4. 全部使用简体中文。`,
    )

    if (!isValidSimilar(data)) {
      throw new Error('AI 返回的同类题结构不完整')
    }

    return {
      questions: data.questions.map((item) => ({
        q: item.q.trim(),
        answer: item.answer.trim(),
      })),
    }
  } catch (error) {
    console.warn('[similar] AI 调用失败，回退预置同类题：', error.message)
    if (sample) return similarFromSample(sample)
    return { questions: genericSimilarQuestions(subject) }
  }
}

export const sampleCount = samples.length
