import { chromium } from 'playwright'
const url = process.argv[2] || 'http://localhost:3001'
const shots = 'screenshots'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
const errs = []
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
p.on('console', m => m.type() === 'error' && errs.push('CONSOLE ' + m.text()))
let ok = 0, fail = 0
const step = async (name, fn) => { try { await fn(); ok++; console.log('PASS', name) } catch (e) { fail++; console.log('FAIL', name, '-', e.message.split('\n')[0]) } }
const shot = async (o) => { await p.waitForTimeout(1100); await p.screenshot(o) }
const tab = (t) => p.locator('nav button, .tabbar button, .tab-bar button').filter({ hasText: t }).first()
const see = async (t, timeout = 5000) => p.getByText(t).first().waitFor({ timeout })
await p.goto(url); await p.waitForTimeout(500)

await step('home loads', async () => { await see('AI 引导式答疑') })
await step('student tabs load', async () => {
  for (const t of ['错题本', '计划', '会员', '我的']) { await tab(t).click(); await p.waitForTimeout(300); const h = await p.locator('body').innerText(); if (h.length < 50) throw new Error('empty ' + t) }
  await tab('学习').click()
})
await step('sample question -> explain (guided steps)', async () => {
  await p.getByText('解方程：2x + 5 = 17').first().click()
  await p.getByRole('button', { name: /提交/ }).click()
  await see('下一步', 30000)
  while (await p.getByRole('button', { name: /下一步/ }).count()) await p.getByRole('button', { name: /下一步/ }).first().click()
  await p.getByRole('button', { name: '查看答案' }).click()
  await see('参考答案')
  await p.waitForTimeout(900)
  await p.evaluate(() => document.querySelectorAll('*').forEach(e => { if (e.scrollTop) e.scrollTop = 0 })); window_scroll: await p.evaluate(() => window.scrollTo(0, 0))
  await p.waitForTimeout(300)
  await shot({ path: `${shots}/02-explain.png` })
})
await step('add to mistakes', async () => {
  await p.getByRole('button', { name: '加入错题本' }).click()
  await see('已加入错题本')
})
await step('mistakes grouped by knowledge', async () => {
  await tab('错题本').click(); await see('一元一次方程'); await shot({ path: `${shots}/03-mistakes.png` })
})
await step('plan generated + practice', async () => {
  await tab('计划').click(); await p.waitForTimeout(400); await see('同类题'); await shot({ path: `${shots}/04-plan.png`})
})
await step('practice: similar questions + AI grading', async () => {
  await tab('学习').click()
  await p.getByText('解方程：2x + 5 = 17').first().click()
  await p.getByRole('button', { name: /提交/ }).click()
  await see('下一步', 30000)
  await p.getByRole('button', { name: '做同类题练习' }).click()
  await p.locator('textarea, input[type=text], input:not([type])').first().waitFor({ timeout: 40000 })
  const inputs = p.locator('.page textarea, .page input[type=text], .page input:not([type]), textarea')
  const n = await inputs.count(); console.log('  practice inputs', n)
  for (let i = 0; i < n; i++) await inputs.nth(i).fill(i === 0 ? 'x=5' : 'x=1')
  const sub = p.getByRole('button', { name: /批改/ }).first()
  await sub.click()
  await p.getByText(/得分|分/).first().waitFor({ timeout: 90000 })
  await p.waitForTimeout(1500)
  const txt = await p.locator('body').innerText(); console.log('  graded text has 100:', /100/.test(txt))
  await shot({ path: `${shots}/05-grading.png` })
})
await step('role switch -> parent weekly report', async () => {
  await p.getByRole('button', { name: '家长' }).first().click(); await see('薄弱知识点'); await p.waitForTimeout(1200)
  await shot({ path: `${shots}/06-parent.png` })
  await p.getByText('AI 鼓励').first().scrollIntoViewIfNeeded()
})
await step('parent member tab', async () => { await tab('会员').click(); await see('权益'); await shot({ path: `${shots}/07-member.png` }) })
await step('back to student', async () => { await p.getByRole('button', { name: '学生' }).first().click(); await see('AI 引导式答疑') })
await step('free quota hits 3 -> member guide', async () => {
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500)
  for (let i = 0; i < 3; i++) {
    await tab('学习').click()
    await p.locator('textarea').first().fill('直角三角形两直角边为3和4求斜边')
    await p.getByRole('button', { name: /提交/ }).click()
    await see('下一步', 60000)
  }
  await tab('学习').click()
  await see('今日剩余 0/3')
  await p.locator('textarea').first().fill('第四次提问：解方程 x+1=2')
  await p.getByRole('button', { name: /提交/ }).click()
  await see('已用完', 8000)
  await shot({ path: `${shots}/08-member-limit.png` })
})
await step('mock pay -> member active', async () => {
  await p.getByRole('button', { name: /立即开通/ }).first().click()
  await p.getByRole('button', { name: /确认|支付/ }).last().click()
  await see('已开通', 8000)
})
await step('dashboard page', async () => {
  await tab('我的').click(); await p.getByText('运营数据看板').first().click(); await see('模拟数据'); await see('漏斗'); await p.waitForTimeout(1000)
  await shot({ path: `${shots}/09-dashboard.png`, fullPage: false })
  await p.getByRole('button', { name: /30/ }).first().click(); await p.waitForTimeout(500)
})
await step('PRD page', async () => {
  await tab('我的').click(); await p.getByText(/产品需求文档/).first().click(); await see('用户画像'); await p.waitForTimeout(500)
  await shot({ path: `${shots}/10-prd.png` })
})
await step('reset demo data', async () => { await tab('我的').click(); await p.getByText('重置演示数据').first().click(); await p.waitForTimeout(500) })
console.log(`\n${ok} passed, ${fail} failed`); if (errs.length) console.log([...new Set(errs)].join('\n'))
await b.close(); process.exit(fail ? 1 : 0)
