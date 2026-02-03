import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173/it',
  pages: [
    { name: 'Home', path: '/' },
    {
      name: 'OrgProfileEventsTab',
      path: '/users/b1e2f3ab-55ef-4cff-b8b2-c8dfe8c12493#publishedEvents',
    },
    // { name: 'Explore', path: '/explore' },
    // { name: 'Login', path: '/login' },
    // { name: 'Register', path: '/register' },
    // { name: 'Create Event', path: '/create-event' },
  ],
  minScore: parseInt(process.env.MIN_A11Y_SCORE || '80'),
  outputDir: join(__dirname, '..', 'a11y-reports'),
}

async function runLighthouseOnPage(url, port) {
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
  }
}

function generateSummaryReport(results) {
  const totalPages = results.length
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / totalPages

  let report = `
╔════════════════════════════════════════════════════════════════╗
║              REPORT ACCESSIBILITÀ COMPLESSIVO                  ║
╚════════════════════════════════════════════════════════════════╝

📊 Statistiche generali:
   • Pagine testate: ${totalPages}
   • Score medio: ${avgScore.toFixed(1)}/100
   • Data: ${new Date().toLocaleString('it-IT')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 Dettaglio per pagina:

`

  results.forEach((result, index) => {
    const icon = result.score >= config.minScore ? '✅' : '❌'
    report += `${index + 1}. ${icon} ${result.name}\n`
    report += `   URL: ${result.url}\n`
    report += `   Score: ${result.score}/100\n`

    const violations = result.violations
    const critical = violations.filter((v) => v.score === 0).length
    const warnings = violations.filter((v) => v.score > 0 && v.score < 1).length

    report += `   Problemi: ${critical} critici, ${warnings} avvisi\n`

    if (critical > 0) {
      report += `\n   🔴 Top 3 problemi critici:\n`
      violations
        .filter((v) => v.score === 0)
        .slice(0, 3)
        .forEach((v, i) => {
          report += `      ${i + 1}. ${v.title}\n`
          if (v.itemCount) {
            report += `         (${v.itemCount} elementi)\n`
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
    report += `🔍 Top 5 problemi più frequenti:\n\n`
    topIssues.forEach((issue, i) => {
      report += `   ${i + 1}. ${issue.title}\n`
      report += `      Presente in ${issue.count} pagine (${issue.itemCount} elementi totali)\n\n`
    })
  }

  const passedPages = results.filter((r) => r.score >= config.minScore).length
  const failedPages = totalPages - passedPages

  report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

  if (failedPages === 0) {
    report += `✅ SUCCESSO! Tutte le pagine superano lo score minimo di ${config.minScore}\n`
  } else {
    report += `❌ FALLITO! ${failedPages}/${totalPages} pagine sotto lo score minimo di ${config.minScore}\n`
  }

  return { report, passed: failedPages === 0, avgScore }
}

async function main() {
  console.log('🚀 Avvio analisi accessibilità multi-pagina\n')

  let chrome
  const results = []

  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu'],
    })
    console.log('🌐 Chrome avviato\n')

    console.log(`📄 Test di ${config.pages.length} pagine...\n`)

    const { mkdirSync } = await import('fs')
    mkdirSync(config.outputDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]

    for (const page of config.pages) {
      const url = `${config.baseUrl}${page.path}`
      process.stdout.write(`   • ${page.name}... `)

      try {
        const { lhr, reportHtml } = await runLighthouseOnPage(url, chrome.port)

        const score = Math.round(lhr.categories.accessibility.score * 100)
        const audits = Object.values(lhr.audits)
        const violations = audits.filter((a) => a.score !== null && a.score < 1)

        const pageName = page.name.toLowerCase().replace(/\s+/g, '-')
        const htmlPath = join(config.outputDir, `${timestamp}_${pageName}.html`)
        writeFileSync(htmlPath, reportHtml)

        results.push({
          name: page.name,
          url,
          score,
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
        console.log(`❌ Errore: ${error.message}`)
        results.push({
          name: page.name,
          url,
          score: 0,
          violations: [],
          error: error.message,
        })
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const { report, passed } = generateSummaryReport(results)

    console.log(report)

    const summaryPath = join(config.outputDir, `${timestamp}_summary.txt`)
    writeFileSync(summaryPath, report)

    console.log(`\n📊 Report salvati in a11y-reports/:`)
    console.log(`   • Summary: ${timestamp}_summary.txt`)
    results.forEach((r) => {
      if (r.htmlReport) {
        const filename = r.htmlReport.split('/').pop()
        console.log(`   • ${r.name}: ${filename}`)
      }
    })
    console.log()
    process.exit(passed ? 0 : 1)
  } catch (error) {
    console.error('\n❌ Errore fatale:', error.message)
    process.exit(1)
  } finally {
    if (chrome) await chrome.kill()
  }
}

main()
