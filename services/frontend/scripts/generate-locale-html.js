import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createJiti } from 'jiti'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const jiti = createJiti(__filename)

const locales = ['en', 'it', 'de', 'es', 'fr']
const translations = {}

for (const locale of locales) {
  const modulePath = join(__dirname, `../src/i18n/locales/${locale}.ts`)
  const localeData = jiti(modulePath).default
  translations[locale] = {
    description: localeData.meta.description,
    keywords: localeData.meta.keywords,
  }
}

const hrefLangTags = [
  '    <link rel="alternate" hreflang="x-default" href="/" />',
  ...locales.map((loc) => `    <link rel="alternate" hreflang="${loc}" href="/${loc}/" />`),
].join('\n')

const distPath = join(__dirname, '../dist')
const baseHtml = readFileSync(join(distPath, 'index.html'), 'utf-8')

locales.push('') // Include root for Italian
for (const locale of locales) {
  const localeCode = locale || 'it'
  const { description, keywords } = translations[localeCode]
  let localeHtml = baseHtml
    .replace(/lang="[^"]*"/, `lang="${localeCode}"`)
    .replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${description}">`
    )
    .replace(
      /<meta name="keywords" content="[^"]*">/,
      `<meta name="keywords" content="${keywords}">`
    )
    .replace(/(<meta name="viewport"[^>]*>)/, `$1\n${hrefLangTags}`)

  const localeDir = join(distPath, locale)
  if (!existsSync(localeDir)) {
    mkdirSync(localeDir, { recursive: true })
  }

  writeFileSync(join(localeDir, 'index.html'), localeHtml)
  console.log(`✓ Generated ${locale}/index.html`)
}
console.log('All locale HTML files generated successfully.')
