import { chromium } from 'playwright'
const url = process.argv[2] || 'http://localhost:3001'
const out = process.argv[3] || 'screenshots/probe.png'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
p.on('pageerror', e => console.log('PAGEERROR', e.message))
p.on('console', m => m.type()==='error' && console.log('CONSOLE', m.text()))
await p.goto(url); await p.waitForTimeout(800)
await p.screenshot({ path: out })
await b.close()
