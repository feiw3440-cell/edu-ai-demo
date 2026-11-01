const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60000).toISOString()

export const sampleQuestions = [
  {
    subject: '数学',
    question: '解方程：2x + 5 = 17',
    knowledge: '一元一次方程',
    answer: 'x = 6',
  },
  {
    subject: '数学',
    question: '一个直角三角形的两条直角边分别是 3 和 4，求斜边长。',
    knowledge: '勾股定理',
    answer: '斜边长为 5',
  },
  {
    subject: '数学',
    question: '已知二次函数 y = x² - 4x + 3，求它的顶点坐标和对称轴。',
    knowledge: '二次函数',
    answer: '顶点坐标为 (2, -1)，对称轴为直线 x = 2',
  },
  {
    subject: '语文',
    question: '修改病句：通过这次活动，使我明白了团结的重要性。',
    knowledge: '病句修改',
    answer: '删去“通过”或“使”，示例：通过这次活动，我明白了团结的重要性。',
  },
  {
    subject: '语文',
    question: '赏析“海内存知己，天涯若比邻”。',
    knowledge: '古诗赏析',
    answer: '用夸张和对比表达对友谊超越空间的信念，情感豁达乐观。',
  },
  {
    subject: '语文',
    question: '古诗默写：会当凌绝顶，__________。',
    knowledge: '古诗默写',
    answer: '一览众山小',
  },
  {
    subject: '英语',
    question: '用所给词的适当形式填空：He ______ (go) to school by bike every day.',
    knowledge: '一般现在时',
    answer: 'goes',
  },
  {
    subject: '英语',
    question: '用所给词的适当形式填空：She ______ (live) in Beijing since 2010.',
    knowledge: '现在完成时',
    answer: 'has lived',
  },
  {
    subject: '英语',
    question: '用所给词的适当形式填空：The book ______ (write) by Lu Xun.',
    knowledge: '被动语态',
    answer: 'was written',
  },
]

export const initialMistakes = [
  {
    id: 'mistake-equation',
    question: '解方程：2x + 5 = 17',
    subject: '数学',
    knowledge: '一元一次方程、等式的基本性质',
    steps: [
      {
        title: '看清目标：让 x 单独出现',
        content:
          '这是一个一元一次方程。目标是让未知数 x 单独留在等号一边，其他数字移到另一边。现在 x 还被“×2”和“+5”包着，需要一层层解开。',
        hint: '要让 x 单独留下，应该先处理“+5”还是“×2”？为什么？',
      },
      {
        title: '先去掉常数项：两边同时减 5',
        content:
          '根据等式的基本性质，两边同时减去同一个数，等式仍然成立。所以 2x + 5 - 5 = 17 - 5，得到 2x = 12。',
        hint: '如果只在左边减 5，等式还成立吗？两边必须做怎样的运算？',
      },
      {
        title: '系数化为 1：两边同时除以 2',
        content: '2x 表示 2 乘 x。两边同时除以 2：2x ÷ 2 = 12 ÷ 2，所以 x = 6。',
        hint: '“2x”中的 2 和 x 是什么关系？想求 x，应该做哪种逆运算？',
      },
      {
        title: '代回检验',
        content:
          '把 x = 6 代回原方程：左边 = 2 × 6 + 5 = 17，右边 = 17，左边等于右边，答案正确。',
        hint: '你能自己把答案代回原式，算一算左右两边是否相等吗？',
      },
    ],
    answer: 'x = 6',
    studentAnswer: 'x = 5',
    addedAt: minutesAgo(60 * 20),
    mastered: false,
  },
  {
    id: 'mistake-pythagorean',
    question: '一个直角三角形的两条直角边分别是 3 和 4，求斜边长。',
    subject: '数学',
    knowledge: '勾股定理：a² + b² = c²',
    steps: [
      {
        title: '识别题型与已知条件',
        content:
          '题目给出直角三角形，并告诉两条直角边的长度，要求斜边。斜边是直角所对的边，也是三条边中最长的一条。',
        hint: '直角三角形中，哪条边是斜边？它和直角的位置有什么关系？',
      },
      {
        title: '回忆勾股定理',
        content: '勾股定理：直角三角形两条直角边的平方和等于斜边的平方，即 a² + b² = c²。',
        hint: '如果两条直角边是 a、b，斜边是 c，你能写出它们之间的关系式吗？',
      },
      {
        title: '代入数据并计算',
        content:
          '把 a = 3、b = 4 代入：c² = 3² + 4² = 9 + 16 = 25，所以 c = √25 = 5。',
        hint: '算出 c² = 25 后，c 一定等于 5 吗？边长能取负数吗？',
      },
    ],
    answer: '斜边长 c = 5',
    studentAnswer: 'c = 7',
    addedAt: minutesAgo(60 * 8),
    mastered: false,
  },
  {
    id: 'mistake-tense',
    question: '用所给词的适当形式填空：He ______ (go) to school by bike every day.',
    subject: '英语',
    knowledge: '一般现在时、第三人称单数',
    steps: [
      {
        title: '寻找时间标志词',
        content:
          '句末的 every day 表示“每天”，说明这是一个经常性、习惯性的动作，提示使用一般现在时。',
        hint: '看到 every day、usually、often 这类词，你会想到哪种时态？',
      },
      {
        title: '确定主语人称与数',
        content:
          '主语 He 是第三人称单数。一般现在时中，第三人称单数作主语时，实义动词要发生变化。',
        hint: '主语是 I、you、we、they 时动词用原形，那 he / she / it 呢？',
      },
      {
        title: '变化动词形式',
        content: 'go 以字母 o 结尾，第三人称单数加 -es，变为 goes。',
        hint: 'go 为什么加 -es 而不是只加 -s？还有哪些动词有类似变化？',
      },
    ],
    answer: 'goes',
    studentAnswer: 'go',
    addedAt: minutesAgo(60 * 3),
    mastered: true,
  },
]

export const defaultPlan = [
  {
    id: 'default-review',
    title: '复习 一元一次方程',
    type: 'review',
    knowledge: '一元一次方程',
    subject: '数学',
    question: '解方程：2x + 5 = 17',
    minutes: 10,
    done: false,
    source: '示例计划',
  },
  {
    id: 'default-practice',
    title: '同类题练习 3 道',
    type: 'practice',
    knowledge: '一元一次方程',
    subject: '数学',
    question: '解方程：2x + 5 = 17',
    minutes: 15,
    done: false,
    source: '示例计划',
  },
  {
    id: 'default-read',
    title: '每日一读',
    type: 'read',
    knowledge: '语文积累',
    subject: '语文',
    minutes: 10,
    done: false,
    source: '每日固定任务',
  },
]

export const sampleRecords = [
  {
    id: 'record-1',
    question: '解方程：3x - 4 = 11',
    knowledge: '一元一次方程',
    score: 100,
    correct: true,
    at: minutesAgo(58),
  },
  {
    id: 'record-2',
    question: '用所给词的适当形式填空：She ______ (watch) TV every evening.',
    knowledge: '一般现在时',
    score: 85,
    correct: true,
    at: minutesAgo(60 * 5),
  },
]

export function shortKnowledge(knowledge) {
  const first = String(knowledge || '未分类')
    .split(/[、，,；;：:（(]/)[0]
    .trim()
  if (!first) return '未分类'
  return first.length > 12 ? `${first.slice(0, 12)}…` : first
}

export function buildPlan(mistakes = [], previousPlan = []) {
  const previous = Array.isArray(previousPlan) ? previousPlan : []
  const doneMap = new Map(previous.map((task) => [task.id, Boolean(task.done)]))
  const groups = new Map()

  for (const mistake of mistakes) {
    const knowledge = mistake.knowledge || '综合复习'
    if (!groups.has(knowledge)) groups.set(knowledge, mistake)
  }

  if (groups.size === 0) {
    return defaultPlan.map((task) => ({
      ...task,
      done: doneMap.get(task.id) || false,
    }))
  }

  const tasks = []
  for (const [knowledge, mistake] of groups) {
    const short = shortKnowledge(knowledge)
    tasks.push({
      id: `review:${knowledge}`,
      title: `复习 ${short}`,
      type: 'review',
      knowledge,
      subject: mistake.subject || '综合',
      question: mistake.question || '',
      minutes: 10,
      done: doneMap.get(`review:${knowledge}`) || false,
      source: `来自错题：${short}`,
    })
    tasks.push({
      id: `practice:${knowledge}`,
      title: `同类题练习 3 道 · ${short}`,
      type: 'practice',
      knowledge,
      subject: mistake.subject || '综合',
      question: mistake.question || '',
      minutes: 15,
      done: doneMap.get(`practice:${knowledge}`) || false,
      source: `来自错题：${short}`,
    })
  }

  tasks.push({
    id: 'daily-read',
    title: '每日一读',
    type: 'read',
    knowledge: '语文积累',
    subject: '语文',
    minutes: 10,
    done: doneMap.get('daily-read') || false,
    source: '每日固定任务',
  })

  return tasks
}
