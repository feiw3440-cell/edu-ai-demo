# AI 学习助手（教育行业 PM 作品集 Demo）
移动端 H5 原型（微信小程序风格）：学生端闭环（拍题→AI 分步讲解→错题本→学习计划→同类题练习→AI 批改）、家长周报、会员引导、运营数据看板、PRD（见 PRD.md，应用内「我的 → 产品需求文档」可读）。

## 运行
    npm install
    npm run build
    npm start            # http://localhost:3001（同时托管前端与 /api）
开发：`npm run server` + `npm run dev`。测试：`node scripts/e2e.mjs http://localhost:3001`（Playwright）。

## 真实 vs 模拟
- 真实：自定义题目的讲解/同类题/批改调用免密钥的 text.pollinations.ai（后端调用，前端无密钥），失败自动回退预置回答。
- 预置：9 道示例题（数学/语文/英语）的讲解、答案、同类题。
- 模拟：拍题识别、家长周报与运营看板数据、会员支付（无真实扣费）。
