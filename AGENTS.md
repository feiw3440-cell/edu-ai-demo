# 项目：AI 学习助手（教育行业产品经理求职作品集 demo）
React 19 + Vite + recharts（已安装）+ express 后端。所有界面文字使用简体中文。移动端 H5 原型，仿微信小程序风格：
- 页面容器最大宽度 430px 居中；桌面浏览器下显示为居中的手机外框（圆角、阴影、灰色背景）。
- 顶部导航栏（居中标题，右上角微信小程序胶囊样式的「···|◎」装饰），底部 tab 栏固定。
- 主色 #4F6BED（靛蓝）+ 渐变，辅色橙 #FF9F43，背景 #F5F7FB，卡片白色圆角 16px 轻阴影。字体系统中文字体。
- 不使用 TypeScript、不使用 UI 库、不使用 react-router（用 useState 做简单路由即可，以便静态部署）。
- 只用 CSS 文件（src/styles.css）写样式。不要写任何密钥。

## 角色
顶部导航栏左侧有「学生 / 家长」角色切换（分段控件）。
- 学生端 tab：首页(学习) / 错题本 / 计划 / 会员 / 我的
- 家长端 tab：周报 / 会员 / 我的
- 「我的」页中含入口：「运营数据看板（演示后台）」「产品需求文档 PRD」。

## 后端（server/index.js，端口 3001，ESM）
- POST /api/explain {question, subject} -> {steps:[{title, content, hint}], knowledge, answer, source:'ai'|'sample'}
  引导式讲解：返回 3-5 步，每步含 title、content、hint（引导学生自己思考的反问），最终 answer 单独给出（前端默认折叠，点击「查看答案」才展示）。
- POST /api/grade {question, studentAnswer, subject} -> {score(0-100), correct(bool), comment, correction}
- POST /api/similar {question, knowledge, subject} -> {questions:[{q, answer}]} 3 道同类题
- GET /api/health
- 真实 AI：调用 https://text.pollinations.ai/openai（无需密钥，OpenAI 兼容 chat/completions，body {model:'openai', messages, response_format 可不用}），
  让模型只返回 JSON；服务端解析 JSON（要容错：去掉```json 围栏，提取第一个 {...}）。超时 25 秒，失败或解析失败则回退到 server/samples.js 中的高质量预置回答（source:'sample'）。
  预置样例覆盖 K12 数学(一元一次方程、勾股定理、二次函数)、语文(病句修改、古诗默写/赏析)、英语(时态填空、完形/语法) 至少 8 道，含完整分步讲解、知识点、答案、同类题；对未命中的题目，按科目返回通用的引导式模板。
- 生产模式下同时托管 dist 静态文件（express.static + SPA fallback）。
- 前端通过相对路径 /api/... 调用（vite dev 配置 proxy 到 3001）。
- 前端需显示 AI 回答的来源标签（「AI 实时生成」/「示例回答」），并有 loading 状态（骨架/打字动画）。

## 前端结构与数据约定
文件：src/main.jsx, src/App.jsx（外壳：手机外框、顶部栏、角色切换、底部 tab、简单路由）, src/styles.css, src/store.js（全局状态 + localStorage 持久化，用 React Context 或简单 hook）, src/api.js（fetch 封装，/api/explain|grade|similar，失败时抛错并在 UI 友好提示）, src/data/mock.js（所有模拟数据）, src/pages/*.jsx。
store 状态：
- role: 'student'|'parent'；tab 当前页；
- isMember(bool，默认 false)；aiUsedToday(number，按日期重置，免费用户每日上限 FREE_LIMIT=3，每次调用 /api/explain 成功展示讲解后 +1；用完后再次提问不请求后端，直接跳转「会员引导页」)；
- mistakes: [{id, question, subject, knowledge, steps, answer, studentAnswer, addedAt, mastered(bool)}]；
- plan: 今日任务 [{id, title, type:'review'|'practice'|'read', knowledge, minutes, done}]，根据错题的知识点自动生成（每个有错题的知识点生成「复习 xx」和「同类题练习 3 道」任务，另有 1 个固定「每日一读」）；无错题时展示默认的示例计划；
- records：练习批改记录 [{id, question, knowledge, score, correct, at}]。
每个页面右下或页头有「重置演示数据」入口（在「我的」页）。
设计要求：现代、精致、有层次感；组件有轻微动画（页面切换淡入、按钮按压反馈、步骤逐步展开）；空状态有插画式 emoji + 引导文案；所有可点按钮都要有实际行为（演示原型不允许有死按钮）。

## 学生端流程（核心闭环）
1. 首页「学习」：问候 + 今日学习进度环 + 剩余 AI 答疑次数徽标（「今日剩余 2/3 次」，会员显示「会员无限次」）；科目选择（数学/语文/英语）；题目输入框 + 「拍题」按钮（模拟：点击弹出「模拟拍照识别」动画 1.2 秒，然后自动填入一道示例题）+「提交」；下方「试试这些题」示例题 chip（来自 samples 的 9 道题，点击填入）；最近记录。
2. 讲解页（可作为首页下的子视图/全屏页）：显示题目、来源标签（AI 实时生成/示例回答）、知识点标签；分步讲解以卡片逐步展开：先显示第 1 步标题，点击「下一步」展开，每步展示 content，并在下方用淡色气泡展示 hint（「想一想：…」）；最后有「查看答案」（默认折叠）；底部按钮：「加入错题本」（成功后 toast，按钮变已加入，按 knowledge 归类）、「做同类题练习」（跳转练习页）、「再问一题」。
3. 错题本页：顶部统计（错题总数、知识点数、已掌握数）；按知识点分组的可折叠列表（组头显示知识点名+数量+掌握率进度条）；每题可展开看讲解步骤与答案，有「标记已掌握」「重做」「删除」；空状态有引导；预置 3 道示例错题（不同知识点）让页面首次打开不空。
4. 计划页：日期、今日任务清单（可勾选完成，进度环），任务来源标注（「来自错题：xx」）；点击练习类任务进入练习页。
5. 练习页（同类题练习 + AI 批改）：调用 /api/similar 获取 3 道同类题（加载骨架屏），每题一个答题输入框，「提交批改」调用 /api/grade 逐题批改，展示得分环、对错、点评、订正；全部完成后显示总分+「AI 学习建议」小结，错题可一键加入错题本，完成后自动勾选对应计划任务并写入 records。
