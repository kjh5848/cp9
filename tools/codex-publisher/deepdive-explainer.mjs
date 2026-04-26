function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inferTopic(text) {
  if (/식기세척|설거지|건조|급수|배수/.test(text)) {
    return {
      type: 'dishwasher',
      label: '주방 동선',
      accent: '#2563eb',
      soft: '#eff6ff',
      title: '구매 전에는 세척력보다 설치와 루틴을 먼저 봅니다',
      items: ['설치 공간', '급수·배수', '건조 방식', '식기 적재'],
      caption: '식기세척기는 제품 하나가 아니라 주방 물길, 전기, 수납 동선을 함께 바꾸는 가전입니다.',
    }
  }
  if (/커피|에스프레소|캡슐|원두|추출/.test(text)) {
    return {
      type: 'coffee',
      label: '홈카페 구조',
      accent: '#92400e',
      soft: '#fff7ed',
      title: '커피머신은 맛보다 먼저 사용 방식을 고르는 제품입니다',
      items: ['추출 방식', '원두·캡슐', '세척 루틴', '주방 분위기'],
      caption: '캡슐형, 반자동, 전자동은 성능 차이보다 매일 커피를 대하는 태도가 다릅니다.',
    }
  }
  if (/청소|오염|먼지|물걸레|흡입|바닥/.test(text)) {
    return {
      type: 'cleaner',
      label: '오염 처리',
      accent: '#0f766e',
      soft: '#f0fdfa',
      title: '청소기는 흡입력보다 오염을 처리하는 루틴이 중요합니다',
      items: ['오염 종류', '물통 관리', '브러시 세척', '보관 위치'],
      caption: '건식 먼지, 젖은 오염, 반려동물 털은 필요한 구조와 관리 방식이 다릅니다.',
    }
  }
  return {
    type: 'general',
    label: '선택 기준',
    accent: '#f97316',
    soft: '#fff7ed',
    title: '좋은 선택은 스펙표보다 생활 장면에서 시작합니다',
    items: ['사용 공간', '관리 난이도', '장기 비용', '브랜드 성격'],
    caption: '같은 가격대라도 실제 생활 루틴과 맞지 않으면 만족도는 크게 떨어집니다.',
  }
}

function diagramFor(topic, index) {
  if (topic.type === 'dishwasher') {
    const diagrams = [
      `<div style="height:132px;border-radius:18px;background:#fff;border:1px solid rgba(37,99,235,.16);position:relative;overflow:hidden;">
<div style="position:absolute;left:20px;right:20px;bottom:20px;height:54px;border:3px solid ${topic.accent};border-radius:12px;background:#eff6ff;"></div>
<div style="position:absolute;left:42px;bottom:34px;width:42px;height:28px;border-radius:7px;background:#fff;border:2px solid ${topic.accent};"></div>
<div style="position:absolute;right:42px;bottom:34px;width:52px;height:28px;border-radius:7px;background:#fff;border:2px solid ${topic.accent};"></div>
<div style="position:absolute;left:24px;top:22px;font-size:12px;font-weight:900;color:#1d4ed8;">하부장 폭</div>
<div style="position:absolute;right:24px;top:22px;font-size:12px;font-weight:900;color:#1d4ed8;">문 열림 공간</div>
</div>`,
      `<div style="height:132px;border-radius:18px;background:#fff;border:1px solid rgba(37,99,235,.16);position:relative;overflow:hidden;">
<div style="position:absolute;left:28px;top:24px;width:42px;height:84px;border-radius:14px;background:#dbeafe;border:2px solid ${topic.accent};"></div>
<div style="position:absolute;left:104px;top:34px;width:78px;height:64px;border-radius:16px;background:#eff6ff;border:3px solid ${topic.accent};"></div>
<div style="position:absolute;right:32px;top:28px;width:32px;height:32px;border-radius:999px;background:${topic.accent};"></div>
<div style="position:absolute;left:70px;top:56px;width:34px;height:4px;background:${topic.accent};"></div>
<div style="position:absolute;right:66px;top:58px;width:38px;height:4px;background:${topic.accent};"></div>
<div style="position:absolute;left:25px;bottom:12px;font-size:12px;font-weight:900;color:#1d4ed8;">급수</div>
<div style="position:absolute;left:123px;bottom:12px;font-size:12px;font-weight:900;color:#1d4ed8;">본체</div>
<div style="position:absolute;right:26px;bottom:12px;font-size:12px;font-weight:900;color:#1d4ed8;">전원</div>
</div>`,
      `<div style="height:132px;border-radius:18px;background:#fff;border:1px solid rgba(37,99,235,.16);position:relative;overflow:hidden;">
<div style="position:absolute;left:24px;top:24px;width:70px;height:84px;border-radius:14px;border:3px solid ${topic.accent};background:#eff6ff;"></div>
<div style="position:absolute;left:38px;top:42px;width:42px;height:6px;border-radius:99px;background:${topic.accent};"></div>
<div style="position:absolute;left:38px;top:60px;width:42px;height:6px;border-radius:99px;background:${topic.accent};"></div>
<div style="position:absolute;left:38px;top:78px;width:42px;height:6px;border-radius:99px;background:${topic.accent};"></div>
<div style="position:absolute;right:24px;top:26px;width:96px;height:80px;border-radius:18px;background:#f8fafc;border:2px dashed ${topic.accent};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#1d4ed8;">식기 패턴</div>
</div>`,
      `<div style="height:132px;border-radius:18px;background:#fff;border:1px solid rgba(37,99,235,.16);position:relative;overflow:hidden;">
<div style="position:absolute;left:30px;bottom:28px;width:80px;height:62px;border-radius:16px;border:3px solid ${topic.accent};background:#eff6ff;"></div>
<div style="position:absolute;left:48px;top:24px;width:8px;height:36px;border-radius:99px;background:#93c5fd;"></div>
<div style="position:absolute;left:72px;top:18px;width:8px;height:42px;border-radius:99px;background:#60a5fa;"></div>
<div style="position:absolute;left:96px;top:24px;width:8px;height:36px;border-radius:99px;background:#93c5fd;"></div>
<div style="position:absolute;right:28px;top:42px;font-size:13px;line-height:1.5;font-weight:900;color:#1d4ed8;">건조는<br/>소재와 적재가<br/>결과를 바꿉니다</div>
</div>`,
    ]
    return diagrams[index % diagrams.length]
  }

  const labels = topic.items.slice(0, 4)
  return `<div style="height:132px;border-radius:18px;background:#fff;border:1px solid rgba(15,23,42,.1);display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:14px;box-sizing:border-box;">
${labels.map((label, itemIndex) => `<div style="border-radius:16px;background:${topic.soft};border:1px solid rgba(15,23,42,.08);display:flex;align-items:center;justify-content:center;text-align:center;font-size:13px;font-weight:900;color:${topic.accent};">${String(itemIndex + 1).padStart(2, '0')}<br/>${escapeHtml(label)}</div>`).join('')}
</div>`
}

function buildExplainer({ heading, index, topic }) {
  const stage = String(index + 1).padStart(2, '0')
  const chips = topic.items.map((item) => (
    `<span style="display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 12px;border-radius:999px;background:#fff;border:1px solid rgba(15,23,42,.1);font-size:13px;font-weight:800;color:#111;">${escapeHtml(item)}</span>`
  )).join('')

  return `<aside class="cp9-deepdive-explainer" data-cp9-explainer="${stage}" style="box-sizing:border-box;width:100%;border:1px solid #dbe3ef;border-radius:24px;background:${topic.soft};padding:18px;margin:18px 0 26px;box-shadow:0 12px 30px rgba(15,23,42,.06);">
<div style="display:grid;grid-template-columns:minmax(190px,240px) minmax(0,1fr);gap:18px;align-items:center;">
${diagramFor(topic, index)}
<div style="min-width:0;">
<span style="display:inline-block;margin:0 0 6px;color:${topic.accent};font-size:13px;font-weight:900;">${escapeHtml(topic.label)}</span>
<strong style="display:block;font-size:19px;line-height:1.42;color:#111;margin:0 0 8px;letter-spacing:-.03em;word-break:keep-all;">${escapeHtml(heading || topic.title)}</strong>
<p style="margin:0;color:#475467;font-size:14px;line-height:1.65;word-break:keep-all;">${escapeHtml(topic.caption)}</p>
</div>
</div>
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;">${chips}</div>
</aside>`
}

function shouldSkipHeading(heading) {
  return /대표 상품|구매 링크|구매 후보|빠른 비교|마지막|출처|참고 자료|파트너스|가격과 구성/.test(heading)
}

export function enhanceDeepdiveExplainers(html, options = {}) {
  const source = String(html || '')
  if (!options.force && source.includes('cp9-deepdive-explainer')) {
    return { html: source, changed: false, count: (source.match(/cp9-deepdive-explainer/g) || []).length, reason: 'already_present' }
  }

  const text = stripHtml(source)
  if (!/딥다이브|브랜드|철학|사용 맥락|설치|루틴|관리/.test(text)) {
    return { html: source, changed: false, count: 0, reason: 'not_deepdive_like' }
  }

  const cleaned = options.force
    ? source.replace(/\n?<aside class="cp9-deepdive-explainer"[\s\S]*?<\/aside>\n?/g, '\n')
    : source

  const topic = inferTopic(text)
  let count = 0
  const enhanced = cleaned.replace(/(<h2\b[^>]*>([\s\S]*?)<\/h2>)/gi, (match, fullHeading, headingHtml) => {
    const heading = stripHtml(headingHtml)
    if (count >= 4 || shouldSkipHeading(heading)) return match
    const explainer = buildExplainer({ heading, index: count, topic })
    count += 1
    return `${fullHeading}\n${explainer}`
  })

  return { html: enhanced, changed: count > 0 || enhanced !== source, count }
}
