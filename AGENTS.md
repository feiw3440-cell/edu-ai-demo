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
