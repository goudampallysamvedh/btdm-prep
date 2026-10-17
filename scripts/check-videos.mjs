// Checks every video link in src/data/videos.ts using YouTube/Vimeo oEmbed.
// Usage: npm run check:videos   (needs internet; Node 18+)
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/data/videos.ts', import.meta.url), 'utf8')
const urls = [...src.matchAll(/url: '([^']+)'/g)].map((m) => m[1])

let bad = 0
for (const url of urls) {
  const api = url.includes('vimeo.com')
    ? `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
    : `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  try {
    const res = await fetch(api)
    const ok = res.ok
    let title = ''
    if (ok) title = (await res.json()).title ?? ''
    console.log(`${ok ? 'OK  ' : 'DEAD'} ${res.status} ${url} ${title}`)
    if (!ok) bad++
  } catch (e) {
    console.log(`ERR  ${url} ${e.message}`)
    bad++
  }
}
console.log(`\n${urls.length - bad}/${urls.length} links working`)
process.exit(bad ? 1 : 0)
