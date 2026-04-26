function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function topicBrief({ title = '', keyword = '', html = '' }) {
  const text = `${title} ${keyword} ${stripHtml(html)}`.slice(0, 5000)
  if (/식기세척|설거지/.test(text)) {
    return {
      category: '프리미엄 주방가전 리포트',
      decision: '설치 공간, 급수·배수, 건조 방식, 식기 적재 패턴을 먼저 본다.',
      reader: '빌트인 또는 대용량 식기세척기를 장기 사용 가전으로 보는 사람',
      risk: '세척력만 보고 사면 설치, 문 열림 공간, 건조 결과에서 불만이 생길 수 있다.',
    }
  }
  if (/커피|에스프레소|캡슐|원두/.test(text)) {
    return {
      category: '홈카페 장비 리포트',
      decision: '맛보다 먼저 캡슐형, 반자동, 전자동 중 반복 가능한 사용 방식을 고른다.',
      reader: '집에서 커피 루틴과 취향 이미지를 만들고 싶은 사람',
      risk: '관리 시간, 원두·캡슐 비용, 세척 난이도를 낮게 보면 방치될 수 있다.',
    }
  }
  if (/청소|오염|먼지|물걸레|흡입/.test(text)) {
    return {
      category: '생활 청소 루틴 리포트',
      decision: '흡입력보다 오염 종류, 물통 관리, 브러시 세척, 보관 위치를 먼저 본다.',
      reader: '아이, 반려동물, 주방 오염처럼 반복 오염을 자주 처리하는 사람',
      risk: '청소 후 관리 루틴이 번거로우면 좋은 제품도 사용 빈도가 떨어진다.',
    }
  }
  return {
    category: '구매 판단 리포트',
    decision: '브랜드 이미지, 사용 장면, 관리 난이도, 장기 비용을 함께 본다.',
    reader: '가격표보다 실제 생활 맥락으로 제품을 고르고 싶은 사람',
    risk: '스펙만 보고 사면 공간, 관리, 유지비에서 후회가 생길 수 있다.',
  }
}

function reportStyle() {
  return `<style>
.cp9-deepdive-report{max-width:820px!important;color:#1f2937!important;font-size:17px!important;line-height:1.86!important}
.cp9-deepdive-report p{word-break:keep-all;overflow-wrap:anywhere}
.cp9-deepdive-report h2{margin:44px 0 18px!important;padding:18px 20px!important;border-left:6px solid #111827!important;border-radius:18px!important;background:#f8fafc!important;color:#111!important;font-size:25px!important;line-height:1.38!important;letter-spacing:-.04em!important}
.cp9-deepdive-report h3{margin-top:28px!important;color:#111!important}
.cp9-report-brief{border:1px solid #d1d5db;border-radius:22px;background:#f8fafc;color:#111827;padding:20px;margin:24px 0 32px;box-shadow:0 10px 28px rgba(15,23,42,.06)}
.cp9-report-brief span{display:inline-block;margin:0 0 10px;color:#bfdbfe;font-weight:900;font-size:14px}
.cp9-report-brief h2{background:transparent!important;border:0!important;border-radius:0!important;margin:0 0 16px!important;padding:0!important;color:#111827!important;font-size:22px!important}
.cp9-report-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.cp9-report-grid div{border:1px solid #e5e7eb;border-radius:16px;padding:14px;background:#fff}
.cp9-report-grid strong{display:block;margin:0 0 7px;color:#111827;font-size:14px}
.cp9-report-grid p{margin:0!important;color:#475467!important;font-size:14px!important;line-height:1.65!important}
.cp9-magazine-card{border:1px solid #e5e7eb;border-radius:18px;background:#fff;padding:16px 18px;margin:18px 0 22px;box-shadow:0 8px 24px rgba(15,23,42,.05)}
.cp9-magazine-card strong{display:block;margin:0 0 8px;color:#111827;font-size:15px}
.cp9-magazine-card p{margin:0!important;color:#475467!important;font-size:15px!important;line-height:1.72!important}
.cp9-magazine-card ul{margin:0!important;padding-left:20px!important;color:#475467!important;font-size:15px!important;line-height:1.75!important}
.cp9-pullquote{border-left:5px solid #ff5a00;background:#fff7ed;border-radius:16px;padding:16px 18px;margin:20px 0;color:#111827;font-size:18px;line-height:1.68;font-weight:800;letter-spacing:-.035em}
@media (max-width:760px){.cp9-report-grid{grid-template-columns:1fr}.cp9-deepdive-report{font-size:16px!important}.cp9-deepdive-report h2{font-size:22px!important}}
</style>`
}

function reportBrief(brief) {
  return `<section class="cp9-report-brief">
<span>${escapeHtml(brief.category)}</span>
<h2>리포트 요약</h2>
<div class="cp9-report-grid">
<div><strong>핵심 판단</strong><p>${escapeHtml(brief.decision)}</p></div>
<div><strong>읽어야 할 사람</strong><p>${escapeHtml(brief.reader)}</p></div>
<div><strong>가장 큰 리스크</strong><p>${escapeHtml(brief.risk)}</p></div>
</div>
</section>`
}

function magazineBlock(index, heading) {
  if (/구매 후보|구매 링크|마지막|출처|참고|파트너스|빠른 비교/.test(heading)) return ''
  const variants = [
    `<blockquote class="cp9-pullquote">비싼 제품을 고르는 글이 아니라, 내 주방에서 덜 귀찮아질 방법을 찾는 글입니다.</blockquote>`,
    `<aside class="cp9-magazine-card"><strong>읽는 법</strong><ul><li>브랜드 이름보다 내가 반복하는 사용 장면을 먼저 봅니다.</li><li>세척력, 건조, 설치, AS 중 어디서 스트레스를 줄일지 정합니다.</li><li>멋진 스펙 하나보다 매일 안 귀찮은 구조가 오래 갑니다.</li></ul></aside>`,
    `<aside class="cp9-magazine-card"><strong>현실 체크</strong><p>식기세척기는 주방에 들어오는 순간부터 가전이 아니라 동거인이 됩니다. 조용한 동거인인지, 문 열 때마다 부딪히는 동거인인지는 설치 전에 갈립니다.</p></aside>`,
    `<aside class="cp9-magazine-card"><strong>한 줄 판단</strong><p>${escapeHtml(heading.replace(/^\d+\.\s*/, ''))} 섹션은 브랜드의 멋보다 실제 생활에서 생기는 불편을 줄이는지 확인하는 파트입니다.</p></aside>`,
  ]
  return variants[index % variants.length]
}

function injectMagazineBlocks(html) {
  let count = 0
  return String(html || '').replace(/(<h2\b[^>]*>([\s\S]*?)<\/h2>)/gi, (match, full, headingHtml) => {
    const heading = stripHtml(headingHtml)
    if (count >= 10) return match
    const block = magazineBlock(count, heading)
    if (!block) return match
    count += 1
    return `${full}\n${block}`
  })
}

export function enhanceDeepdiveReportFormat(html, options = {}) {
  let next = String(html || '')
    .replace(/<style>\s*\.cp9-deepdive-report[\s\S]*?<\/style>\s*/g, '')
    .replace(/\n?<section class="cp9-report-brief"[\s\S]*?<\/section>\n?/g, '\n')
    .replace(/\n?<(?:aside|blockquote) class="(?:cp9-magazine-card|cp9-pullquote)"[\s\S]*?<\/(?:aside|blockquote)>\n?/g, '\n')

  const brief = topicBrief({ title: options.title, keyword: options.keyword, html: next })
  next = next.replace(/<article class="cp9-article"/, '<article class="cp9-article cp9-deepdive-report"')
  if (!next.includes('cp9-deepdive-report')) {
    next = `<article class="cp9-deepdive-report">${next}</article>`
  }
  next = injectMagazineBlocks(next)

  const firstParagraphEnd = next.indexOf('</p>')
  const insertion = `${reportStyle()}\n${reportBrief(brief)}`
  if (firstParagraphEnd === -1) {
    return { html: `${insertion}\n${next}`, changed: true }
  }

  const insertAt = firstParagraphEnd + 4
  return {
    html: `${next.slice(0, insertAt)}\n${insertion}\n${next.slice(insertAt)}`,
    changed: true,
  }
}
