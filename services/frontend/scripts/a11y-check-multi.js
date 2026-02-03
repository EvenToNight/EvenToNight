import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import puppeteer from 'puppeteer-core'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const formatScore = (score) => (score % 1 === 0 ? score.toString() : score.toFixed(1))

const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173/it',
  pages: [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
    { name: 'Create Event', path: '/create-event' },
    { name: 'Event Details', path: '/events/547a3b27-344a-4318-b17e-edf7cd14aee3' },
    {
      name: 'Organization Profile [Published Events Tab]',
      path: '/users/7dee946f-3ab9-41b5-92e9-ea6264d9dd35#publishedEvents',
    },
  ],
  minScore: parseInt(process.env.MIN_A11Y_SCORE || '80'),
  outputDir: join(__dirname, '..', 'a11y-reports'),
  themeMode: process.env.THEME_MODE || 'both', // 'light', 'dark', 'both'
}

async function setTheme(browser, url, targetTheme) {
  const page = await browser.newPage()
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 })
    await page.waitForSelector('body', { timeout: 10000 })

    const currentTheme = await page.evaluate(() => {
      const body = document.querySelector('body')
      return body.classList.contains('body--dark') ? 'dark' : 'light'
    })

    if (currentTheme !== targetTheme) {
      await page.waitForSelector('.theme-toggle', { timeout: 10000 })
      await page.click('.theme-toggle')
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    await page.close()
  } catch (error) {
    await page.close()
    throw error
  }
}

async function runLighthouseOnPage(url, port, themeName) {
  const options = {
    logLevel: 'error',
    output: ['json', 'html'],
    onlyCategories: ['accessibility'],
    port: port,
  }

  const runnerResult = await lighthouse(url, options)
  return {
    lhr: runnerResult.lhr,
    reportHtml: runnerResult.report[1],
    theme: themeName,
  }
}

function generateSummaryReport(results, themeMode) {
  const totalPages = results.length
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / totalPages

  const themeEmoji = themeMode === 'light' ? '☀️' : themeMode === 'dark' ? '🌙' : '☀️🌙'
  const themeName =
    themeMode === 'light' ? 'Light Mode' : themeMode === 'dark' ? 'Dark Mode' : 'Light & Dark Mode'

  let report = `
╔════════════════════════════════════════════════════════════════╗
║            ACCESSIBILITY REPORT SUMMARY                        ║
╚════════════════════════════════════════════════════════════════╝

📊 General Statistics:
   • Theme tested: ${themeEmoji} ${themeName}
   • Pages tested: ${totalPages}
   • Average score: ${formatScore(avgScore)}/100
   • Date: ${new Date().toLocaleString('en-US')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 Page Details:

`

  results.forEach((result, index) => {
    const icon = result.score >= config.minScore ? '✅' : '❌'
    const themeIcon = result.theme === 'light' ? '☀️' : '🌙'
    report += `${index + 1}. ${icon} ${result.name} ${themeIcon}\n`
    report += `   URL: ${result.url}\n`
    report += `   Score: ${result.score}/100\n`

    const violations = result.violations
    const critical = violations.filter((v) => v.score === 0).length
    const warnings = violations.filter((v) => v.score > 0 && v.score < 1).length

    report += `   Issues: ${critical} critical, ${warnings} warnings\n`

    if (critical > 0) {
      report += `\n   🔴 Top 3 critical issues:\n`
      violations
        .filter((v) => v.score === 0)
        .slice(0, 3)
        .forEach((v, i) => {
          report += `      ${i + 1}. ${v.title}\n`
          if (v.itemCount) {
            report += `         (${v.itemCount} elements)\n`
          }
        })
    }

    report += '\n'
  })

  report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  const allViolations = results.flatMap((r) => r.violations)
  const violationCounts = {}

  allViolations.forEach((v) => {
    const key = v.id
    if (!violationCounts[key]) {
      violationCounts[key] = { title: v.title, count: 0, itemCount: 0 }
    }
    violationCounts[key].count++
    violationCounts[key].itemCount += v.itemCount || 1
  })

  const topIssues = Object.values(violationCounts)
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 5)

  if (topIssues.length > 0) {
    report += `🔍 Top 5 most frequent issues:\n\n`
    topIssues.forEach((issue, i) => {
      report += `   ${i + 1}. ${issue.title}\n`
      report += `      Found in ${issue.count} pages (${issue.itemCount} total elements)\n\n`
    })
  }

  const passedPages = results.filter((r) => r.score >= config.minScore).length
  const failedPages = totalPages - passedPages

  report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  if (failedPages === 0) {
    report += `✅ SUCCESS! All pages pass the minimum score of ${config.minScore} (Average score: ${formatScore(avgScore)}/100)\n`
  } else {
    report += `❌ FAILED! ${failedPages}/${totalPages} pages below minimum score of ${config.minScore} (Average score: ${formatScore(avgScore)}/100)\n`
  }

  return { report, passed: failedPages === 0, avgScore }
}

function generateMarkdownReport(results, themeMode) {
  const totalPages = results.length
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / totalPages

  const themeName =
    themeMode === 'light' ? 'Light Mode' : themeMode === 'dark' ? 'Dark Mode' : 'Light & Dark Mode'

  const passedPages = results.filter((r) => r.score >= config.minScore).length
  const failedPages = totalPages - passedPages
  const statusBadge = failedPages === 0 ? '✅ PASSED' : '❌ FAILED'

  let md = `# Accessibility Report Summary

> **Status:** ${statusBadge}
> **Date:** ${new Date().toLocaleString('en-US')}

## 📊 General Statistics

| Metric | Value |
|--------|-------|
| Theme tested | ${themeName} |
| Pages tested | ${totalPages} |
| Average score | ${formatScore(avgScore)}/100 |
| Minimum required | ${config.minScore}/100 |

---

## 📄 Page Details

| # | Status | Page | Theme | Score | Critical | Warnings |
|---|--------|------|-------|-------|----------|----------|
`

  results.forEach((result, index) => {
    const icon = result.score >= config.minScore ? '✅' : '❌'
    const violations = result.violations
    const critical = violations.filter((v) => v.score === 0).length
    const warnings = violations.filter((v) => v.score > 0 && v.score < 1).length

    md += `| ${index + 1} | ${icon} | ${result.name} | ${result.theme} | ${result.score}/100 | ${critical} | ${warnings} |\n`
  })

  const pagesWithCritical = results.filter(
    (r) => r.violations.filter((v) => v.score === 0).length > 0
  )
  if (pagesWithCritical.length > 0) {
    md += `\n### 🔴 Critical Issues by Page\n\n`
    pagesWithCritical.forEach((result) => {
      const themeIcon = result.theme === 'light' ? '☀️' : '🌙'
      const criticalViolations = result.violations.filter((v) => v.score === 0)
      md += `<details>\n<summary><strong>${result.name}</strong> ${themeIcon} (${criticalViolations.length} critical)</summary>\n\n`
      criticalViolations.forEach((v) => {
        md += `- **${v.title}**${v.itemCount ? ` (${v.itemCount} elements)` : ''}\n`
      })
      md += `\n</details>\n\n`
    })
  }

  const allViolations = results.flatMap((r) => r.violations)
  const violationCounts = {}

  allViolations.forEach((v) => {
    const key = v.id
    if (!violationCounts[key]) {
      violationCounts[key] = { title: v.title, count: 0, itemCount: 0 }
    }
    violationCounts[key].count++
    violationCounts[key].itemCount += v.itemCount || 1
  })

  const topIssues = Object.values(violationCounts)
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 5)

  if (topIssues.length > 0) {
    md += `---\n\n## 🔍 Top 5 Most Frequent Issues\n\n`
    md += `| # | Issue | Pages | Elements |\n`
    md += `|---|-------|-------|----------|\n`
    topIssues.forEach((issue, i) => {
      md += `| ${i + 1} | ${issue.title} | ${issue.count} | ${issue.itemCount} |\n`
    })
  }

  md += `\n---\n\n`

  if (failedPages === 0) {
    md += `## ✅ Result: SUCCESS\n\nAll pages pass the minimum score of **${config.minScore}** (Average: **${formatScore(avgScore)}/100**)\n`
  } else {
    md += `## ❌ Result: FAILED\n\n**${failedPages}/${totalPages}** pages below minimum score of **${config.minScore}** (Average: **${formatScore(avgScore)}/100**)\n`
  }

  return md
}

async function checkBaseUrl() {
  try {
    const response = await fetch(config.baseUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    })
    if (response.ok) {
      console.log(`\n\x1b[33m  WARNING: BASE_URL (${config.baseUrl}) is reachable.`)
      console.log(
        `   Page links with IDs (e.g., /events/:id) should be verified as IDs may vary.\x1b[0m\n`
      )
      return true
    }
    return false
  } catch {
    return false
  }
}

async function main() {
  const themeEmoji =
    config.themeMode === 'light' ? '☀️' : config.themeMode === 'dark' ? '🌙' : '☀️🌙'
  console.log(
    `🚀 Starting multi-page accessibility analysis (${themeEmoji} ${config.themeMode} mode)\n`
  )

  if (!(await checkBaseUrl())) {
    console.log('URL is not reachable. Exiting.')
    return
  }

  let chrome
  let browser
  const results = []

  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu'],
    })
    console.log('🌐 Chrome started\n')

    browser = await puppeteer.connect({
      browserURL: `http://localhost:${chrome.port}`,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    })

    const themesToTest = config.themeMode === 'both' ? ['light', 'dark'] : [config.themeMode]
    const totalTests = config.pages.length * themesToTest.length

    console.log(
      `📄 Testing ${config.pages.length} pages in ${themesToTest.length} theme(s) (${totalTests} total tests)...\n`
    )

    const { mkdirSync } = await import('fs')
    mkdirSync(config.outputDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]

    for (const theme of themesToTest) {
      if (themesToTest.length > 1) {
        const themeIcon = theme === 'light' ? '☀️' : '🌙'
        console.log(`\n${themeIcon} Testing in ${theme} mode:\n`)
      }

      // Set theme once on home page
      const homeUrl = `${config.baseUrl}/`
      await setTheme(browser, homeUrl, theme)
      console.log(`   Theme set to ${theme} mode\n`)

      for (const page of config.pages) {
        const url = `${config.baseUrl}${page.path}`
        process.stdout.write(`   • ${page.name}... `)

        try {
          const { lhr, reportHtml } = await runLighthouseOnPage(url, chrome.port, theme)

          const score = Math.round(lhr.categories.accessibility.score * 100)
          const audits = Object.values(lhr.audits)
          const violations = audits.filter((a) => a.score !== null && a.score < 1)

          const pageName = page.name.toLowerCase().replace(/\s+/g, '-')
          const themeSuffix = themesToTest.length > 1 ? `_${theme}` : ''
          const htmlPath = join(config.outputDir, `${timestamp}_${pageName}${themeSuffix}.html`)
          writeFileSync(htmlPath, reportHtml)

          results.push({
            name: page.name,
            url,
            score,
            theme,
            htmlReport: htmlPath,
            violations: violations.map((v) => ({
              id: v.id,
              title: v.title,
              score: v.score,
              itemCount: v.details?.items?.length || 0,
            })),
          })

          const icon = score >= config.minScore ? '✅' : '❌'
          console.log(`${icon} ${score}/100`)
        } catch (error) {
          console.log(`❌ Error: ${error.message}`)
          results.push({
            name: page.name,
            url,
            score: 0,
            theme,
            violations: [],
            error: error.message,
          })
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const { report, passed } = generateSummaryReport(results, config.themeMode)
    const markdownReport = generateMarkdownReport(results, config.themeMode)

    console.log(report)

    const summaryPath = join(config.outputDir, `${timestamp}_summary.txt`)
    const markdownPath = join(config.outputDir, `${timestamp}_summary.md`)
    writeFileSync(summaryPath, report)
    writeFileSync(markdownPath, markdownReport)

    console.log(`\n📊 Reports saved in a11y-reports/:`)
    console.log(`   • Summary: ${timestamp}_summary.txt`)
    console.log(`   • Summary (MD): ${timestamp}_summary.md`)
    results.forEach((r) => {
      if (r.htmlReport) {
        const filename = r.htmlReport.split('/').pop()
        console.log(`   • ${r.name}: ${filename}`)
      }
    })
    console.log()
    process.exit(passed ? 0 : 1)
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  } finally {
    if (browser) await browser.disconnect()
    if (chrome) await chrome.kill()
  }
}

main()
