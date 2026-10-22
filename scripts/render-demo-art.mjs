import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'apps', 'web', 'public', 'memes')
mkdirSync(outDir, { recursive: true })

const scenes = [
  { id: 'demo-last-minute-edit', bg: '#F6D2C4', ink: '#6E241C', prop: 'desk', face: 'stressed', note: 'تعديل؟' },
  { id: 'demo-meeting-email', bg: '#E7DCC8', ink: '#3E3428', prop: 'meeting', face: 'bored', note: 'إيميل' },
  { id: 'demo-salary-wait', bg: '#F3E2B8', ink: '#6A4A12', prop: 'calendar', face: 'waiting', note: 'مرتب' },
  { id: 'demo-exam-panic', bg: '#D9E2F2', ink: '#243556', prop: 'moon', face: 'panic', note: 'بكرة' },
  { id: 'demo-closed-book', bg: '#E4D7C4', ink: '#4A3424', prop: 'book', face: 'shy', note: 'لسه' },
  { id: 'demo-group-project', bg: '#F7E0C8', ink: '#6A3418', prop: 'group', face: 'stressed', note: 'لوحدي' },
  { id: 'demo-mom-one-minute', bg: '#F6D6C8', ink: '#7A2E24', prop: 'door', face: 'panic', note: 'دقيقة' },
  { id: 'demo-family-question', bg: '#F8D5DE', ink: '#7A3148', prop: 'circle', face: 'shy', note: 'سؤال' },
  { id: 'demo-wrong-chat', bg: '#F7E7A8', ink: '#6E5310', prop: 'phone', face: 'shock', note: 'غلط' },
  { id: 'demo-seen-no-reply', bg: '#D7E8F4', ink: '#1E4C6B', prop: 'ticks', face: 'waiting', note: 'متشاف' },
  { id: 'demo-good-news', bg: '#D7EBD9', ink: '#1D5A38', prop: 'star', face: 'happy', note: 'خبر' },
  { id: 'demo-sarcastic-ok', bg: '#E6D8F3', ink: '#4C2E66', prop: 'thumb', face: 'smug', note: 'ماشي' },
]

function eyes(face) {
  if (face === 'happy') {
    return `<path d="M250 250c12 16 28 16 40 0M350 250c12 16 28 16 40 0" fill="none" stroke="#241711" stroke-width="8" stroke-linecap="round"/>`
  }
  if (face === 'bored') {
    return `<path d="M246 268h48M346 268h48" stroke="#241711" stroke-width="8" stroke-linecap="round"/>`
  }
  if (face === 'shy') {
    return `<circle cx="268" cy="274" r="8" fill="#241711"/><circle cx="372" cy="280" r="8" fill="#241711"/>`
  }
  if (face === 'shock' || face === 'panic') {
    return `<circle cx="268" cy="262" r="18" fill="#fff" stroke="#241711" stroke-width="6"/><circle cx="372" cy="262" r="18" fill="#fff" stroke="#241711" stroke-width="6"/><circle cx="268" cy="264" r="6" fill="#241711"/><circle cx="372" cy="264" r="6" fill="#241711"/>`
  }
  if (face === 'smug') {
    return `<path d="M246 270h46" stroke="#241711" stroke-width="8" stroke-linecap="round"/><circle cx="372" cy="266" r="10" fill="#241711"/>`
  }
  return `<circle cx="268" cy="262" r="10" fill="#241711"/><circle cx="372" cy="262" r="10" fill="#241711"/>`
}

function brows(face) {
  if (face === 'stressed' || face === 'panic') {
    return `<path d="M236 228l48 16M404 228l-48 16" stroke="#241711" stroke-width="7" stroke-linecap="round"/>`
  }
  if (face === 'smug') {
    return `<path d="M240 236h44M348 228l48 10" stroke="#241711" stroke-width="7" stroke-linecap="round"/>`
  }
  if (face === 'shy') {
    return `<path d="M240 240h46M354 246h46" stroke="#241711" stroke-width="7" stroke-linecap="round"/>`
  }
  return `<path d="M238 232h50M352 232h50" stroke="#241711" stroke-width="7" stroke-linecap="round"/>`
}

function mouth(face) {
  if (face === 'happy') return `<path d="M286 330c18 28 50 28 68 0" fill="none" stroke="#241711" stroke-width="8" stroke-linecap="round"/>`
  if (face === 'shock' || face === 'panic') return `<ellipse cx="320" cy="338" rx="16" ry="22" fill="#241711"/>`
  if (face === 'smug' || face === 'bored') return `<path d="M292 332h46" stroke="#241711" stroke-width="8" stroke-linecap="round"/>`
  if (face === 'shy') return `<path d="M300 334c10 8 28 8 38 0" fill="none" stroke="#241711" stroke-width="7" stroke-linecap="round"/>`
  if (face === 'waiting') return `<path d="M300 336c16 10 34 4 48-8" fill="none" stroke="#241711" stroke-width="8" stroke-linecap="round"/>`
  return `<path d="M286 324c20 8 48 18 70 4" fill="none" stroke="#241711" stroke-width="8" stroke-linecap="round"/>`
}

function blush(face) {
  if (face !== 'shy' && face !== 'stressed') return ''
  return `<ellipse cx="232" cy="308" rx="18" ry="10" fill="#E07A7A" opacity="0.8"/><ellipse cx="408" cy="308" rx="18" ry="10" fill="#E07A7A" opacity="0.8"/>`
}

function sweat(face) {
  if (face !== 'stressed' && face !== 'panic' && face !== 'shy') return ''
  return `<path d="M430 214c10 18 10 28 0 40c12-12 18-24 0-40z" fill="#7EB6D6"/>`
}

function prop(kind, ink) {
  if (kind === 'desk') {
    return `<rect x="150" y="470" width="340" height="18" rx="6" fill="${ink}"/><rect x="188" y="430" width="92" height="40" rx="6" fill="#fffaf3" stroke="${ink}" stroke-width="6"/><circle cx="470" cy="430" r="28" fill="none" stroke="${ink}" stroke-width="8"/><path d="M470 430l14-16" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`
  }
  if (kind === 'meeting') {
    return `<rect x="150" y="470" width="340" height="16" rx="6" fill="${ink}"/><circle cx="190" cy="430" r="22" fill="#fffaf3" stroke="${ink}" stroke-width="6"/><circle cx="250" cy="418" r="22" fill="#fffaf3" stroke="${ink}" stroke-width="6"/><circle cx="450" cy="430" r="22" fill="#fffaf3" stroke="${ink}" stroke-width="6"/>`
  }
  if (kind === 'calendar') {
    return `<rect x="430" y="150" width="110" height="120" rx="12" fill="#fffaf3" stroke="${ink}" stroke-width="8"/><path d="M430 186h110" stroke="${ink}" stroke-width="8"/><circle cx="462" cy="230" r="8" fill="${ink}"/><circle cx="498" cy="230" r="8" fill="${ink}"/>`
  }
  if (kind === 'moon') {
    return `<circle cx="500" cy="150" r="42" fill="#F7E7A1"/><circle cx="522" cy="138" r="34" fill="#D9E2F2"/>`
  }
  if (kind === 'book') {
    return `<path d="M180 470h120c20-28 20-28 0-56H180v56zM300 470h120c-20-28-20-28 0-56H300v56z" fill="#fffaf3" stroke="${ink}" stroke-width="7"/>`
  }
  if (kind === 'group') {
    return `<circle cx="170" cy="250" r="36" fill="#fffaf3" stroke="${ink}" stroke-width="7"/><circle cx="470" cy="250" r="36" fill="#fffaf3" stroke="${ink}" stroke-width="7"/><rect x="250" y="470" width="140" height="16" fill="${ink}"/>`
  }
  if (kind === 'door') {
    return `<rect x="450" y="150" width="110" height="210" rx="8" fill="#fffaf3" stroke="${ink}" stroke-width="8"/><circle cx="530" cy="260" r="6" fill="${ink}"/>`
  }
  if (kind === 'circle') {
    return `<circle cx="150" cy="230" r="28" fill="none" stroke="${ink}" stroke-width="8"/><circle cx="490" cy="210" r="28" fill="none" stroke="${ink}" stroke-width="8"/><circle cx="500" cy="330" r="24" fill="none" stroke="${ink}" stroke-width="8"/>`
  }
  if (kind === 'phone') {
    return `<rect x="452" y="168" width="92" height="150" rx="14" fill="#241711"/><rect x="462" y="184" width="72" height="110" rx="6" fill="#fffaf3"/><path d="M476 214h44M476 236h30" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`
  }
  if (kind === 'ticks') {
    return `<path d="M450 210l16 16 34-40" fill="none" stroke="#2E7DC6" stroke-width="8" stroke-linecap="round"/><path d="M468 210l16 16 34-40" fill="none" stroke="#2E7DC6" stroke-width="8" stroke-linecap="round"/>`
  }
  if (kind === 'star') {
    return `<path d="M500 120l14 36h38l-30 22 12 36-34-22-34 22 12-36-30-22h38z" fill="#E3B341"/>`
  }
  return `<path d="M470 250c30-40 70-10 40 30c-8 28-40 28-48 4" fill="none" stroke="${ink}" stroke-width="10" stroke-linecap="round"/>`
}

function sceneSvg(scene) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 720" role="img" aria-label="رسم تجريبي">
  <rect width="640" height="720" fill="${scene.bg}"/>
  <rect x="28" y="28" width="584" height="664" fill="none" stroke="${scene.ink}" stroke-width="10"/>
  <text x="52" y="78" fill="${scene.ink}" font-family="Tahoma, Arial, sans-serif" font-size="28" font-weight="700">رسم تجريبي</text>
  <text x="430" y="78" fill="${scene.ink}" font-family="Tahoma, Arial, sans-serif" font-size="28">${scene.note}</text>
  ${prop(scene.prop, scene.ink)}
  <circle cx="320" cy="300" r="108" fill="#FFF9F2" stroke="#241711" stroke-width="8"/>
  ${brows(scene.face)}
  ${eyes(scene.face)}
  ${blush(scene.face)}
  ${mouth(scene.face)}
  ${sweat(scene.face)}
  <path d="M250 408c40 70 100 70 140 0" fill="none" stroke="#241711" stroke-width="8"/>
  <text x="52" y="660" fill="${scene.ink}" font-family="Tahoma, Arial, sans-serif" font-size="22">ليس ميمًا حقيقيًا</text>
</svg>
`
}

for (const scene of scenes) {
  writeFileSync(path.join(outDir, `${scene.id}.svg`), sceneSvg(scene), 'utf8')
}

writeFileSync(
  path.join(root, 'apps', 'web', 'public', 'favicon.svg'),
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#F6E7D4"/>
  <rect x="6" y="6" width="52" height="52" rx="10" fill="none" stroke="#8C1D18" stroke-width="4"/>
  <circle cx="32" cy="30" r="12" fill="#FFF9F2" stroke="#241711" stroke-width="3"/>
  <circle cx="27" cy="28" r="2" fill="#241711"/>
  <circle cx="37" cy="28" r="2" fill="#241711"/>
  <path d="M27 35c3 4 7 4 10 0" fill="none" stroke="#241711" stroke-width="2" stroke-linecap="round"/>
</svg>
`,
  'utf8',
)

console.log(`Wrote ${scenes.length} demo illustrations`)
