async function post(path, body) {
  let response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('网络连接失败，请检查后端服务是否已启动')
  }

  if (!response.ok) {
    let message = `请求失败（${response.status}）`
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch {
      // 忽略非 JSON 错误响应
    }
    throw new Error(message)
  }

  try {
    return await response.json()
  } catch {
    throw new Error('服务返回内容格式异常，请稍后再试')
  }
}

export function explainQuestion({ question, subject }) {
  return post('/api/explain', { question, subject })
}

export function gradeAnswer({ question, studentAnswer, subject }) {
  return post('/api/grade', { question, studentAnswer, subject })
}

export function similarQuestions({ question, knowledge, subject }) {
  return post('/api/similar', { question, knowledge, subject })
}

export async function checkHealth() {
  const response = await fetch('/api/health')
  if (!response.ok) throw new Error('服务不可用')
  return response.json()
}
