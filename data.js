/* =========================================================
   Autostay CS Dashboard — Portfolio Static Data
   All figures are fictional / illustrative only
   ========================================================= */
(function () {
  'use strict';

  /* ── FICTIONAL DATA ─────────────────────────────────── */
  var MANAGERS = [
    { name:'김민준', chats:842, frtMin:14, resMin:38, score:91, comment:'FRT·FCR 최우수' },
    { name:'이서연', chats:718, frtMin:17, resMin:45, score:87, comment:'CS점수 안정적' },
    { name:'박지수', chats:621, frtMin:21, resMin:52, score:81, comment:'채팅량 대비 양호' },
    { name:'최현우', chats:412, frtMin:28, resMin:73, score:72, comment:'FRT 개선 필요' },
    { name:'정유나', chats:254, frtMin:19, resMin:41, score:84, comment:'빠른 대응 강점' },
  ];

  var TAGS = [
    { tag:'결제·환불',    count:634, pct:22.3, riskScore:88, avgRes:51 },
    { tag:'서비스 불만',  count:521, pct:18.3, riskScore:92, avgRes:68 },
    { tag:'이용 방법',    count:487, pct:17.1, riskScore:31, avgRes:24 },
    { tag:'구독 해지',    count:418, pct:14.7, riskScore:85, avgRes:44 },
    { tag:'앱 오류',      count:312, pct:11.0, riskScore:74, avgRes:39 },
    { tag:'매장 문의',    count:251, pct:8.8,  riskScore:42, avgRes:29 },
    { tag:'기타',         count:224, pct:7.8,  riskScore:28, avgRes:22 },
  ];

  /* 30일 일별 채팅 트렌드 (4/7 ~ 5/6) */
  var DAILY_LABELS = (function () {
    var arr = [], d = new Date('2025-04-07');
    for (var i = 0; i < 30; i++) {
      arr.push((d.getMonth()+1) + '/' + d.getDate());
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }());
  var DAILY_TOTAL  = [72,68,84,91,103,112,97,66,61,78,89,102,115,108,98,81,74,69,83,96,114,122,107,92,86,91,105,118,124,112];
  var DAILY_OPEN   = [ 8, 7, 9,10, 12, 14,11, 7, 6, 9,10, 12, 14, 13,11, 9, 8, 7, 9,11, 13, 15,12,10, 9,10, 12, 14, 15,13];

  MANAGERS = [
    { name:'A 담당자', chats:18, frtMin:3, resMin:42, score:86, comment:'응답 품질 안정권' },
    { name:'B 담당자', chats:14, frtMin:4, resMin:55, score:80, comment:'일반 문의 처리 양호' },
    { name:'C 담당자', chats:11, frtMin:5, resMin:71, score:74, comment:'복합 이슈 확인 필요' },
    { name:'D 담당자', chats:49, frtMin:6, resMin:186, score:62, comment:'장기지연·배정 편중 집중 점검' },
    { name:'E 담당자', chats:20, frtMin:4, resMin:63, score:78, comment:'피크 시간 보조 투입 적합' },
  ];
  TAGS = [
    { tag:'정기구독', count:24, pct:21.4, riskScore:82, avgRes:68 },
    { tag:'차량변경', count:19, pct:17.0, riskScore:78, avgRes:74 },
    { tag:'결제·환불', count:17, pct:15.2, riskScore:72, avgRes:49 },
    { tag:'컴플레인', count:8, pct:7.1, riskScore:88, avgRes:142 },
    { tag:'앱 오류', count:12, pct:10.7, riskScore:64, avgRes:52 },
    { tag:'매장 문의', count:11, pct:9.8, riskScore:38, avgRes:31 },
    { tag:'미분류', count:21, pct:18.8, riskScore:46, avgRes:28 },
  ];
  DAILY_LABELS = ['6/10','6/11','6/12','6/13','6/14','6/15','6/16'];
  DAILY_TOTAL  = [13,11,15,17,18,20,18];
  DAILY_OPEN   = [1,1,2,2,3,3,2];

  /* ── HELPERS ────────────────────────────────────────── */
  function el(id) { return document.getElementById(id); }
  function setText(id, v) { var e = el(id); if (e) e.textContent = v; }
  function setHtml(id, v) { var e = el(id); if (e) e.innerHTML = v; }

  /* ── LOADING OVERLAY ────────────────────────────────── */
  function animateLoading() {
    var bar  = el('loadProgressBar');
    var txt  = el('loadText');
    var steps = ['lstep-conn','lstep-api','lstep-charts','lstep-done'];
    var msgs  = ['채널톡 연결 중…','데이터 수신 중…','차트 렌더링 중…','완료!'];
    var i = 0;
    if (bar) bar.style.width = '0%';

    var iv = setInterval(function () {
      if (i >= steps.length) { clearInterval(iv); return; }
      if (bar) bar.style.width = ((i + 1) * 25) + '%';
      if (txt) txt.textContent = msgs[i];
      var s = el(steps[i]);
      if (s) s.classList.add('active');
      i++;
    }, 200);
  }

  function dismissOverlay() {
    var ov = el('loadingOverlay');
    if (!ov) return;
    ov.style.transition = 'opacity 0.6s ease';
    ov.style.opacity = '0';
    setTimeout(function () { ov.style.display = 'none'; }, 650);
  }

  /* ── ARC GAUGE (stroke-dasharray) ──────────────────── */
  function fillHealthGauge(score) {
    var arc = 188.5;
    var fill = arc * (score / 100);
    var empty = arc - fill;
    var g = el('gaugeFill');
    if (!g) return;
    g.setAttribute('stroke-dasharray', fill.toFixed(1) + ' ' + empty.toFixed(1));
    g.removeAttribute('stroke-dashoffset');
  }

  function fillSmallGauge(id, pct) {
    var arc = 131.9;
    var fill = arc * Math.min(Math.max(pct, 0), 1);
    var empty = arc - fill;
    var g = el(id);
    if (!g) return;
    g.setAttribute('stroke-dasharray', fill.toFixed(1) + ' ' + empty.toFixed(1));
  }

  /* ── HEALTH SCORE ───────────────────────────────────── */
  function renderHealth() {
    var score = 64;
    fillHealthGauge(score);
    setText('healthScore', score + '점');
    setText('healthGrade', '주의');
    setText('healthSub',   '장기지연 24% · 컴플레인 7% · 담당자 편중 88%');
    setHtml('healthDeductDetail',
      '<strong>감점 내역</strong><br>' +
      '장기지연율 24%: -12점 · 컴플레인율 7.1%: -7점 · 담당자 편중 88%: -14점 · VOC 미분류 18.8%: -3점');
  }

  /* ── SMALL GAUGES ───────────────────────────────────── */
  function renderGauges() {
    /* 30분 해결율 68% */
    fillSmallGauge('gsvg-quick', 0.68);
    setText('gval-quick', '68%');
    setText('gsub-quick', '목표 70%');
    setText('gbadge-quick', '▲ 3%p');

    /* 8h+ 지연율 12% (낮을수록 좋음) */
    fillSmallGauge('gsvg-slow', 0.12);
    setText('gval-slow', '12%');
    setText('gsub-slow', '목표 <5%');
    setText('gbadge-slow', '▼ 1.2%p');

    /* FRT 4분 */
    fillSmallGauge('gsvg-frt', 0.86);
    setText('gval-frt', '4분');
    setText('gsub-frt', '목표 <5분');
    setText('gbadge-frt', '정상');

    /* FCR 93% */
    fillSmallGauge('gsvg-fcr', 0.93);
    setText('gval-fcr', '93%');
    setText('gsub-fcr', '목표 90%');
    setText('gbadge-fcr', '▲ 3%p');

    /* 담당자 편중도 88% */
    fillSmallGauge('gsvg-conc', 0.88);
    setText('gval-conc', '88%');
    setText('gsub-conc', '최고 담당자 집중도');
    setText('gbadge-conc', '주의');
  }

  /* ── HERO META ──────────────────────────────────────── */
  function renderHeroMeta() {
    setText('himTotal', '112건');
    setText('himFrt',   '4분');
    setText('himFcr',   '93%');
    setText('himRange',  '최근 7일');
    setText('channelName', 'Autostay [OPS]');
    setText('updatedAt',   '2026-06-16 14:15 업데이트');
    setText('cacheBadge',  '비식별 가상');
    setText('heroDecisionSummary', '64점 · 주의. 장기지연 13건과 D 담당자 배정 편중 완화가 오늘 우선 과제입니다.');
  }

  /* ── HERO ACTION CARD ───────────────────────────────── */
  function renderHacCard() {
    setText('hacGrade', '64점');
    setHtml('hacBody',
      '<ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.9">' +
      '<li>8시간+ 지연 채팅 <strong>13건</strong> 즉시 처리 — DRI: CS 리드</li>' +
      '<li>컴플레인 태그 <strong>8건</strong> — 원인 재분류 및 재발 이슈 확인</li>' +
      '<li>D 담당자 배정 편중 88% — 신규 문의 라우팅 분산</li>' +
      '</ul>');
    setHtml('hacFooter',
      '<span style="font-size:11px;color:#999">완료 기준: 24시간 내 장기지연 50% 감소 · 편중도 70% 이하</span>');
  }

  /* ── KPI GRID ───────────────────────────────────────── */
  function renderKpiGrid() {
    var kg = el('kpiGrid');
    if (!kg) return;
    var items = [
      { label:'총 채팅',    value:'112건', delta:'+9건',  pos:true  },
      { label:'FRT P50',    value:'4분',   delta:'정상',  pos:true  },
      { label:'FCR',        value:'93%',   delta:'+3%p', pos:true  },
      { label:'30분 해결',  value:'68%',   delta:'+4%p', pos:true  },
      { label:'8h+ 지연',   value:'12%',   delta:'+2%p', pos:false },
      { label:'컴플레인율', value:'7.1%',  delta:'주의', pos:false },
      { label:'미해결',     value:'8건',   delta:'+2건', pos:false },
      { label:'SLA 준수',   value:'87%',   delta:'-3%p', pos:false },
    ];
    kg.innerHTML = items.map(function (k) {
      return '<div class="kpi-card" style="background:#fff;border:1px solid #e8e2d8;border-radius:10px;padding:12px 14px">' +
        '<div class="kpi-label" style="font-size:11px;color:#888;margin-bottom:4px">' + k.label + '</div>' +
        '<div class="kpi-val" style="font-size:20px;font-weight:700;color:#12253a">'  + k.value + '</div>' +
        '<div class="kpi-delta" style="font-size:11px;font-weight:600;color:' + (k.pos ? '#1a8060' : '#b83050') + '">' + k.delta + '</div>' +
        '</div>';
    }).join('');

    setHtml('kpiGridSecondary', [
      { label:'반복 문의', value:'11건', note:'동일 태그 재문의 9.8%' },
      { label:'재오픈 비율', value:'13%', note:'전주 11% → 상승' },
      { label:'피크 시간', value:'10~12시', note:'평균 8건/h' },
      { label:'다음날 예상', value:'15~19건', note:'보합 추세' },
    ].map(function (k) {
      return '<div class="kpi-secondary-card">' +
        '<div class="kpi-secondary-label">' + k.label + '</div>' +
        '<div class="kpi-secondary-value">' + k.value + '</div>' +
        '<div class="kpi-secondary-note">' + k.note + '</div></div>';
    }).join(''));
  }

  /* ── ALERT STRIP ────────────────────────────────────── */
  function renderAlertStrip() {
    var s = el('alertStrip');
    if (!s) return;
    s.style.display = 'flex';
    s.style.gap = '12px';
    s.style.padding = '8px 16px';
    s.innerHTML =
      '<span style="font-size:12px;color:#b87030;font-weight:600">⚠ 8시간+ 장기 지연 13건 — 즉시 처리 필요</span>' +
      '<span style="font-size:12px;color:#1a5c5c">ℹ 최근 7일 채팅량 112건 · 가상 데이터</span>' +
      '<span style="font-size:12px;color:#1a5c5c">ℹ FCR 93% — 목표 상회, 편중 리스크 별도 관리</span>';
  }

  /* ── INSIGHTS STRIP ─────────────────────────────────── */
  function renderInsights() {
    var s = el('insightsStrip');
    if (!s) return;
    s.innerHTML =
      '<div class="insight-item" style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0;background:#fff3e0;border:1px solid #ffd080;border-radius:8px;padding:6px 12px;font-size:12px">' +
        '<span>⚡</span><span>장기지연 13건이 특정 담당자에 집중 — 인입 피크 시간대(10~12시) 라우팅 분산 검토</span></div>' +
      '<div class="insight-item" style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0;background:#e8f4ec;border:1px solid #90d4b0;border-radius:8px;padding:6px 12px;font-size:12px">' +
        '<span>✅</span><span>A 담당자 FRT 3분 · CS점수 86점 — 우수 응대 패턴을 공통 스크립트에 반영 권장</span></div>';
  }

  /* ── TREND CHART PANEL ──────────────────────────────── */
  function renderTrendPanel() {
    var peakVal = Math.max.apply(null, DAILY_TOTAL);
    var peakIdx = DAILY_TOTAL.indexOf(peakVal);
    var avg = Math.round(DAILY_TOTAL.reduce(function (a,b) { return a+b; }, 0) / DAILY_TOTAL.length);
    var openNow = DAILY_OPEN[DAILY_OPEN.length - 1];

    setText('trendTotal',   DAILY_TOTAL.reduce(function (a,b) { return a + b; }, 0) + '건');
    setText('trendPeak',    peakVal + '건');
    setText('trendPeakDay', DAILY_LABELS[peakIdx]);
    setText('trendAvg',     avg + '건/일');
    setText('trendOpen',    openNow + '건');
  }

  /* ── HEATMAP ────────────────────────────────────────── */
  function renderHeatmap() {
    var hm = el('heatmap');
    if (!hm) return;
    var days = ['월','화','수','목','금','토','일'];
    /* 24h × 7days (simplified as 7days × 8 time slots) */
    var slots = ['0-3시','4-7시','8-11시','12-15시','16-19시','20-23시'];
    var data = [
      [2,1,28,45,42,18],   /* 월 */
      [1,2,31,48,44,20],   /* 화 */
      [3,1,35,52,46,22],   /* 수 */
      [2,1,33,49,45,19],   /* 목 */
      [4,2,38,56,50,24],   /* 금 */
      [5,3,52,72,68,31],   /* 토 */
      [4,2,50,68,64,28],   /* 일 */
    ];
    function cellColor(v) {
      if (v >= 60) return '#12253a';
      if (v >= 40) return '#1a5c5c';
      if (v >= 20) return '#3a9080';
      if (v >= 10) return '#7dc4b8';
      return '#c8ede8';
    }
    var headerRow = '<div style="display:grid;grid-template-columns:40px repeat(6,1fr);gap:2px;margin-bottom:2px">' +
      '<div></div>' +
      slots.map(function (s) { return '<div style="font-size:9px;text-align:center;color:#888">' + s + '</div>'; }).join('') +
      '</div>';
    var rows = data.map(function (row, di) {
      return '<div style="display:grid;grid-template-columns:40px repeat(6,1fr);gap:2px;margin-bottom:2px">' +
        '<div style="font-size:11px;display:flex;align-items:center;font-weight:600">' + days[di] + '</div>' +
        row.map(function (v) {
          return '<div style="background:' + cellColor(v) + ';color:#fff;font-size:9px;text-align:center;padding:5px 1px;border-radius:2px;font-weight:600">' + v + '</div>';
        }).join('') +
        '</div>';
    }).join('');
    hm.innerHTML = headerRow + rows;

    /* Legend */
    var lg = el('hmLegend');
    if (lg) {
      lg.style.display = 'flex';
      lg.style.gap = '2px';
      ['#c8ede8','#7dc4b8','#3a9080','#1a5c5c','#12253a'].forEach(function (c) {
        var d = document.createElement('div');
        d.style.cssText = 'width:20px;height:10px;background:' + c + ';border-radius:2px';
        lg.appendChild(d);
      });
    }
  }

  /* ── VOC LIST ───────────────────────────────────────── */
  function renderVocList() {
    var vl = el('vocList');
    if (!vl) return;
    vl.innerHTML = TAGS.map(function (t) {
      return '<div class="voc-list-item" style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #ece6de">' +
        '<div>' +
          '<span style="font-size:13px;font-weight:600">' + t.tag + '</span>' +
          '<span style="margin-left:8px;font-size:11px;color:#888">' + t.pct + '%</span>' +
        '</div>' +
        '<strong style="color:#12253a">' + t.count + '건</strong>' +
        '</div>';
    }).join('');
  }

  /* ── CATEGORY BARS ──────────────────────────────────── */
  function renderCategoryBars() {
    var cb = el('categoryBars');
    if (!cb) return;
    var cats = TAGS.map(function (t, i) {
      return { label:t.tag, count:t.count, pct:t.pct, color:['#ae3f4d','#b87030','#243350','#8f4219','#1d6450','#3a6090','#6b7280'][i] };
    });
    cb.innerHTML = cats.map(function (c) {
      return '<div style="margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">' +
          '<span>' + c.label + '</span>' +
          '<strong>' + c.count + '건 (' + c.pct + '%)</strong>' +
        '</div>' +
        '<div style="height:8px;background:#ece6de;border-radius:4px;overflow:hidden">' +
          '<div style="height:100%;width:' + c.pct*4.5 + 'px;background:' + c.color + ';border-radius:4px;max-width:100%"></div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  /* ── MANAGER TABLE ──────────────────────────────────── */
  function renderManagerTable() {
    var tbody = el('managerTbody');
    if (!tbody) return;
    tbody.innerHTML = MANAGERS.map(function (m, i) {
      var scoreBar = '<div style="display:inline-flex;align-items:center;gap:6px">' +
        '<div style="width:80px;height:6px;background:#ece6de;border-radius:3px;overflow:hidden">' +
          '<div style="height:100%;width:' + m.score + '%;background:' +
            (m.score >= 85 ? '#1d6450' : m.score >= 75 ? '#243350' : '#b87030') + ';border-radius:3px"></div>' +
        '</div>' +
        '<span style="font-size:12px;font-weight:700">' + m.score + '점</span>' +
        '</div>';
      return '<tr>' +
        '<td style="color:#888">' + (i+1) + '</td>' +
        '<td><strong>' + m.name + '</strong></td>' +
        '<td style="text-align:right">' + m.chats.toLocaleString() + '건</td>' +
        '<td style="text-align:right">' + m.frtMin + '분</td>' +
        '<td style="text-align:right">' + m.resMin + '분</td>' +
        '<td style="text-align:right">' + scoreBar + '</td>' +
        '<td style="color:#666;font-size:12px">' + m.comment + '</td>' +
        '</tr>';
    }).join('');

    /* Agent sidebar */
    var sidebar = el('agentSidebar');
    if (sidebar) {
      sidebar.innerHTML =
        '<div style="padding:12px">' +
        '<div style="font-size:13px;font-weight:700;margin-bottom:8px">팀 요약</div>' +
        '<div style="font-size:12px;line-height:2">' +
        '총 담당자: <strong>5명</strong><br>' +
        '팀 평균 FRT: <strong>4.4분</strong><br>' +
        '팀 평균 CS점수: <strong>76점</strong><br>' +
        '최고 담당자: <strong>A 담당자 (86점)</strong><br>' +
        '개선 필요: <strong>D 담당자 (편중 88%)</strong>' +
        '</div></div>';
    }

    /* Mgr risk strip */
    setHtml('mgrRiskStrip',
      '<div style="background:#fff3e0;border:1px solid #ffd080;border-radius:6px;padding:8px 12px;font-size:12px;margin-bottom:8px">' +
      '⚠ <strong>D 담당자</strong> 배정 편중 88% — 장기지연 큐 우선 정리 및 신규 문의 분산 권고</div>');
  }

  /* ── RESOLUTION PANEL ───────────────────────────────── */
  function renderResolution() {
    setHtml('resSummary',
      '<div style="display:flex;gap:16px;margin-bottom:8px;flex-wrap:wrap">' +
      '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#1d6450">64%</div><div style="font-size:11px;color:#888">30분 이내</div></div>' +
      '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#243350">21%</div><div style="font-size:11px;color:#888">30분~2시간</div></div>' +
      '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#b87030">7%</div><div style="font-size:11px;color:#888">2~8시간</div></div>' +
      '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#ae3f4d">8%</div><div style="font-size:11px;color:#888">8시간+</div></div>' +
      '</div>');

    var bands = [
      { label:'30분 이내',  count:1821, pct:64, color:'#1d6450' },
      { label:'30분~2시간', count:598,  pct:21, color:'#243350' },
      { label:'2~8시간',    count:199,  pct:7,  color:'#b87030' },
      { label:'8시간 이상', count:229,  pct:8,  color:'#ae3f4d' },
    ];
    setHtml('resList', bands.map(function (b) {
      return '<div style="margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">' +
          '<span>' + b.label + '</span><strong>' + b.count + '건 (' + b.pct + '%)</strong></div>' +
        '<div style="height:8px;background:#ece6de;border-radius:4px;overflow:hidden">' +
          '<div style="height:100%;width:' + b.pct + '%;background:' + b.color + ';border-radius:4px"></div></div></div>';
    }).join(''));
    setHtml('avgResNote',
      '<div style="font-size:11px;color:#888;margin-top:8px">평균 해결시간 52분 · P90 2시간 14분 · 장기지연은 결제·환불과 서비스 불만 태그에 집중되어 있습니다.</div>');
  }

  /* ── LONG DELAY PANEL ───────────────────────────────── */
  function renderLongDelay() {
    var delayHtml = '<div style="padding:8px 0">' +
      '<div style="font-size:13px;font-weight:700;color:#ae3f4d;margin-bottom:8px">🐢 8시간+ 장기 지연 현황</div>' +
      '<div style="font-size:24px;font-weight:700;color:#ae3f4d;margin-bottom:4px">13건</div>' +
      '<div style="font-size:12px;color:#888;margin-bottom:12px">현재 미해결 장기 지연</div>' +
      '<div style="font-size:12px;line-height:2">' +
        '결제·환불 문의: <strong>9건</strong><br>' +
        '서비스 불만: <strong>6건</strong><br>' +
        '구독 해지: <strong>5건</strong><br>' +
        '기타: <strong>3건</strong></div>' +
      '<div style="margin-top:10px;background:#fff3e0;border-radius:6px;padding:8px;font-size:11px;color:#b87030">' +
        '⚠ 24시간 이상 1건 — 즉각 에스컬레이션 필요</div>' +
      '</div>';
    setHtml('longDelayPanel', delayHtml);
    setHtml('longDelayPanelInline', delayHtml);
  }

  /* ── BOT PANEL ──────────────────────────────────────── */
  function renderBotPanel() {
    setHtml('botPanel',
      '<div style="padding:8px 0">' +
      '<div style="font-size:12px;margin-bottom:4px">자동화 처리 채팅</div>' +
      '<div style="font-size:22px;font-weight:700;color:#12253a">52건 <span style="font-size:14px;font-weight:400;color:#888">(46%)</span></div>' +
      '<div style="font-size:12px;color:#1a8060;margin-bottom:12px">▲ 전월 대비 +2.3%p</div>' +
      '<div style="font-size:12px;line-height:2">' +
        'FAQ 자동 응답: <strong>28건</strong><br>' +
        '환불 정책 안내: <strong>78건</strong><br>' +
        '이용 방법 안내: <strong>50건</strong><br>' +
        '절감 추정 시간: <strong>34.3시간/월</strong></div></div>');
  }

  /* ── GROUP PANEL ────────────────────────────────────── */
  function renderGroupPanel() {
    setHtml('groupPanel',
      '<div style="padding:8px 0">' +
      '<div style="font-size:12px;line-height:2.2">' +
        '운영 채널: <strong>채널톡 [OPS]</strong><br>' +
        '활성 담당자: <strong>5명</strong><br>' +
        '운영 시간: <strong>09:00~22:00</strong><br>' +
        '일 평균 처리: <strong>94.9건</strong><br>' +
        '미배정 채팅: <strong>18건</strong><br>' +
        '그룹 수: <strong>3개</strong></div></div>');
  }

  /* ── CHANNEL STATS ──────────────────────────────────── */
  function renderChannelStats() {
    setHtml('channelStats',
      '<div style="font-size:12px;line-height:2;margin-top:8px">' +
      '앱 인앱: <strong>68건</strong> (61%)<br>' +
      '웹 채팅: <strong>31건</strong> (28%)<br>' +
      '이메일: <strong>13건</strong> (11%)</div>');
  }

  function renderFilterChips() {
    setHtml('filterMgrList', MANAGERS.map(function (m) {
      return '<button class="filter-chip" type="button">' + m.name + '</button>';
    }).join(''));
    setHtml('filterTagList', TAGS.slice(0, 6).map(function (t) {
      return '<button class="filter-chip" type="button">' + t.tag + '</button>';
    }).join(''));
    setHtml('filterSrcList',
      ['앱 인앱', '웹 채팅', '이메일'].map(function (s) {
        return '<button class="filter-chip" type="button">' + s + '</button>';
      }).join(''));
  }

  function renderDiagPanel(tab) {
    var content = {
      'diag-api':
        '<div style="font-size:12px;color:#667085;line-height:2">' +
        '수집 방식: Channel Talk Open API v5 구조 반영<br>' +
        '상태: 포트폴리오 정적 가상 데이터로 대체 렌더링<br>' +
        '조회 기준: 포트폴리오 전시용 가상 시나리오</div>',
      'diag-cache':
        '<div style="font-size:12px;color:#667085;line-height:2">' +
        '원본 운영 환경: 5분 캐시 갱신 구조<br>' +
        '데모 환경: 정적 파일 캐시, 새로고침 시 즉시 렌더링<br>' +
        '오류 대응: API 실패 시 가상 데이터 fallback 가능</div>',
      'diag-limit':
        '<div style="font-size:12px;color:#667085;line-height:2">' +
        '수집 한도: 기간·태그·담당자 필터 기준 페이지네이션 설계<br>' +
        '운영 기준: 7일/14일/30일/전체 기간 전환<br>' +
        '데모 기준: 최근 7일 비식별 가상 데이터 112건</div>',
      'diag-csv':
        '<div style="font-size:12px;color:#667085;line-height:2">' +
        'CSV 기준: 조회 기간, 필터, 담당자, 태그 조건을 반영한 내보내기<br>' +
        '포함 필드: 채팅 ID, 태그, 담당자, FRT, 해결시간, 상태<br>' +
        '데모에서는 외부 파일 생성 없이 기능 구조만 표시합니다.</div>'
    };
    setHtml('diagPanel', content[tab] || content['diag-api']);
  }

  /* ── ADVANCED PANELS ────────────────────────────────── */
  function renderAdvancedPanels() {
    /* WoW Strip */
    setHtml('wowStrip',
      '<div style="display:flex;flex-wrap:wrap;gap:12px;padding:8px 0">' +
      [
        { label:'채팅량',    prev:'2,677건', curr:'2,847건', delta:'+6.3%', pos:true },
        { label:'FRT',       prev:'20분',    curr:'18분',    delta:'-2분',  pos:true },
        { label:'FCR',       prev:'70%',     curr:'72%',     delta:'+2%p',  pos:true },
        { label:'컴플레인율', prev:'7.7%',   curr:'6.8%',   delta:'-0.9%p',pos:true },
      ].map(function (w) {
        return '<div style="background:#fff;border:1px solid #ece6de;border-radius:8px;padding:8px 12px;min-width:120px">' +
          '<div style="font-size:11px;color:#888;margin-bottom:2px">' + w.label + '</div>' +
          '<div style="font-size:16px;font-weight:700">' + w.curr + '</div>' +
          '<div style="font-size:11px;color:' + (w.pos ? '#1a8060' : '#b83050') + '">' + w.delta + ' vs 전월</div>' +
          '</div>';
      }).join('') + '</div>');

    /* SLA Tracker */
    setHtml('slaTracker',
      '<div style="padding:8px 0">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:8px">SLA 준수율</div>' +
      [
        { label:'30분 내 응답',  target:90, actual:89.2 },
        { label:'2시간 내 해결', target:80, actual:85.1 },
        { label:'24시간 내 해결',target:95, actual:98.3 },
      ].map(function (s) {
        var ok = s.actual >= s.target;
        return '<div style="margin-bottom:8px">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">' +
            '<span>' + s.label + '</span>' +
            '<strong style="color:' + (ok ? '#1d6450' : '#ae3f4d') + '">' + s.actual + '% / 목표 ' + s.target + '%</strong></div>' +
          '<div style="height:8px;background:#ece6de;border-radius:4px;overflow:hidden">' +
            '<div style="height:100%;width:' + s.actual + '%;background:' + (ok ? '#1d6450' : '#ae3f4d') + ';border-radius:4px"></div></div></div>';
      }).join('') + '</div>');

    /* FCR Panel */
    setHtml('fcrPanel',
      '<div style="display:flex;flex-wrap:wrap;gap:16px;padding:8px 0">' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">FCR (1차 해결률)</div><div style="font-size:24px;font-weight:700;color:#1d6450">72%</div><div style="font-size:11px;color:#888">목표 75%</div></div>' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">재오픈 비율</div><div style="font-size:24px;font-weight:700;color:#b87030">14%</div><div style="font-size:11px;color:#888">전월 15.8%</div></div>' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">반복 문의 (동일 태그)</div><div style="font-size:24px;font-weight:700;color:#243350">284건</div><div style="font-size:11px;color:#888">10.0%</div></div>' +
      '</div>');

    /* Percentile Panel */
    var percentileHtml = '<div style="padding:8px 0">' +
      [
        { label:'P50 (중앙값)', val:'18분', color:'#1d6450' },
        { label:'P75',          val:'42분', color:'#243350' },
        { label:'P90',          val:'2시간 14분', color:'#b87030' },
        { label:'P95',          val:'5시간 37분', color:'#ae3f4d' },
      ].map(function (p) {
        return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ece6de;font-size:13px">' +
          '<span style="color:#666">' + p.label + '</span><strong style="color:' + p.color + '">' + p.val + '</strong></div>';
      }).join('') + '</div>';
    setHtml('percentilePanel', percentileHtml);
    setHtml('percentilePanelInline', percentileHtml);

    /* Aging Pipeline */
    setHtml('agingPipeline',
      '<div style="padding:8px 0">' +
      [
        { label:'8~12시간', count:9,  pct:39, color:'#b87030' },
        { label:'12~24시간', count:8, pct:35, color:'#ae3f4d' },
        { label:'24~48시간', count:5, pct:22, color:'#8f2030' },
        { label:'48시간+',   count:1, pct:4,  color:'#5a1020' },
      ].map(function (a) {
        return '<div style="margin-bottom:8px">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">' +
            '<span>' + a.label + '</span><strong>' + a.count + '건 (' + a.pct + '%)</strong></div>' +
          '<div style="height:8px;background:#ece6de;border-radius:4px;overflow:hidden">' +
            '<div style="height:100%;width:' + a.pct*2.5 + 'px;background:' + a.color + ';border-radius:4px"></div></div></div>';
      }).join('') + '</div>');

    /* Source Perf Panel */
    setHtml('sourcePerfPanel',
      '<div style="padding:8px 0;font-size:12px">' +
      '<table style="width:100%;border-collapse:collapse">' +
      '<thead><tr style="color:#888;font-weight:400;border-bottom:1px solid #ece6de">' +
        '<th style="text-align:left;padding:4px 0">채널</th>' +
        '<th style="text-align:right">채팅수</th><th style="text-align:right">FRT</th><th style="text-align:right">FCR</th></tr></thead>' +
      '<tbody>' +
      [['앱 인앱','68','3분','94%'],['웹 채팅','31','5분','91%'],['이메일','13','18분','88%']].map(function (r) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:6px 0">' + r[0] + '</td>' +
          '<td style="text-align:right">' + r[1] + '</td><td style="text-align:right">' + r[2] + '</td><td style="text-align:right">' + r[3] + '</td></tr>';
      }).join('') + '</tbody></table></div>');

    /* Anomaly Panel */
    setHtml('anomalyPanel',
      '<div style="padding:8px 0">' +
      '<div style="background:#fff3e0;border:1px solid #ffd080;border-radius:6px;padding:10px;font-size:12px;margin-bottom:8px">' +
        '⚡ <strong>4월 28일 (월)</strong> — 채팅량 122건으로 30일 평균 대비 <strong>+2.4σ</strong> 이상치 탐지<br>' +
        '원인 추정: 주말 이후 결제 오류 집중 문의</div>' +
      '<div style="font-size:12px;color:#888">지난 30일 이상치 탐지: <strong>2일</strong></div>' +
      '</div>');

    /* Forecast Panel */
    setHtml('forecastPanel',
      '<div style="padding:8px 0">' +
      '<div style="font-size:12px;line-height:2.2">' +
        '7일 이동평균: <strong>97.4건/일</strong><br>' +
        '모멘텀: <strong>↑ +8.2%</strong> (상승 추세)<br>' +
        '내일 예상 채팅: <strong>108~124건</strong><br>' +
        '다음 피크 예상: <strong>토·일 (140건+)</strong></div>' +
      '<div style="margin-top:8px;background:#e8f4ec;border:1px solid #90d4b0;border-radius:6px;padding:8px;font-size:11px;color:#1a7050">' +
        '📈 상승 추세 — 구독자 증가에 따른 CS 볼륨 자연 증가로 추정</div>' +
      '</div>');

    renderDiagPanel('diag-api');

    /* Weekday Load */
    setHtml('weekdayLoadPanel',
      ['월','화','수','목','금','토','일'].map(function (d, i) {
        var vals = [82,87,94,91,105,142,138];
        var pct = Math.round(vals[i] / 142 * 100);
        return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<span style="width:20px;font-size:12px;font-weight:600">' + d + '</span>' +
          '<div style="flex:1;height:8px;background:#ece6de;border-radius:4px;overflow:hidden">' +
            '<div style="height:100%;width:' + pct + '%;background:' + (i >= 5 ? '#ae3f4d' : '#243350') + ';border-radius:4px"></div></div>' +
          '<span style="width:36px;font-size:11px;text-align:right">' + vals[i] + '건</span>' +
          '</div>';
      }).join(''));

    setHtml('bizHoursSplit',
      '<div style="margin-top:8px;font-size:11px;color:#888">' +
        '업무시간(9-18h): <strong>58%</strong> · 야간/주말: <strong>42%</strong></div>');

    /* Hour load KV */
    setText('hourLoadKV', '');
    setHtml('hourLoadKV',
      '<div style="font-size:11px;color:#888;margin-top:6px">' +
        '피크: <strong>10~12시 (평균 8건/h)</strong> · 최저: <strong>03~05시 (0~1건/h)</strong></div>');

    /* Complaint trend KV */
    setText('complaintTrendKV', '');
    setHtml('complaintTrendKV',
      '<div style="font-size:11px;color:#888;margin-top:6px">' +
        '평균 컴플레인율 <strong>7.1%</strong> · 최고 <strong>10.2%</strong> (6/15) · 추세 → 모니터링</div>');

    /* VOC risk cards */
    setHtml('vocRiskCards',
      '<div style="display:flex;flex-wrap:wrap;gap:10px;padding:8px 0">' +
      TAGS.filter(function (t) { return t.riskScore >= 70; }).map(function (t) {
        return '<div style="background:#fff;border:1px solid #e8e2d8;border-radius:8px;padding:10px 14px;min-width:160px">' +
          '<div style="font-size:12px;font-weight:700">' + t.tag + '</div>' +
          '<div style="font-size:20px;font-weight:700;color:' + (t.riskScore >= 85 ? '#ae3f4d' : '#b87030') + '">' + t.riskScore + '<span style="font-size:11px;font-weight:400"> /100</span></div>' +
          '<div style="font-size:11px;color:#888">평균 해결 ' + t.avgRes + '분</div>' +
          '</div>';
      }).join('') + '</div>');

    /* Tag res table */
    setHtml('tagResTable',
      '<table style="width:100%;font-size:12px;border-collapse:collapse">' +
      '<thead><tr style="color:#888;border-bottom:1px solid #ece6de">' +
        '<th style="text-align:left;padding:4px 0">태그</th>' +
        '<th style="text-align:right">건수</th><th style="text-align:right">평균 해결</th><th style="text-align:right">P90</th></tr></thead>' +
      '<tbody>' +
      [['결제·환불',634,'51분','2h14m'],['서비스 불만',521,'68분','4h02m'],['이용 방법',487,'24분','48분'],['구독 해지',418,'44분','1h38m'],['앱 오류',312,'39분','1h22m']].map(function (r) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:5px 0">' + r[0] + '</td>' +
          '<td style="text-align:right">' + r[1] + '</td><td style="text-align:right">' + r[2] + '</td><td style="text-align:right">' + r[3] + '</td></tr>';
      }).join('') + '</tbody></table>');

    /* Tag co-occur */
    setHtml('tagCooccurPanel',
      '<div style="padding:8px 0;font-size:12px">' +
      '<div style="margin-bottom:8px;font-weight:600">자주 함께 등장하는 태그 쌍</div>' +
      [['결제·환불 + 서비스 불만', 142],['구독 해지 + 서비스 불만', 98],['앱 오류 + 결제·환불', 72]].map(function (c) {
        return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #ece6de">' +
          '<span>' + c[0] + '</span><strong>' + c[1] + '건</strong></div>';
      }).join('') + '</div>');

    /* Complaint cat */
    setHtml('complaintCatSummary',
      '<div style="font-size:13px;font-weight:700;margin-bottom:8px">컴플레인 세분화</div>' +
      [['응대 품질 불만',42,'#ae3f4d'],['처리 지연',38,'#b87030'],['정책 불만',28,'#8f4219'],['오안내',21,'#243350'],['기타',8,'#6b7280']].map(function (c) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #ece6de;font-size:12px">' +
          '<span style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;background:' + c[2] + ';border-radius:2px;display:inline-block"></span>' + c[0] + '</span>' +
          '<strong>' + c[1] + '%</strong></div>';
      }).join(''));

    /* Mgr quadrant legend */
    setHtml('mgrQuadrantLegend',
      '<div style="font-size:11px;color:#888;margin-top:6px;text-align:center">' +
      'X축: 채팅 처리량 · Y축: CS점수 (FRT·FCR 종합) — 우상단이 이상적</div>');

    /* Mgr FRT table */
    setHtml('mgrFrtTable',
      '<table style="width:100%;font-size:12px;border-collapse:collapse">' +
      '<thead><tr style="color:#888;border-bottom:1px solid #ece6de">' +
        '<th style="text-align:left;padding:4px 0">담당자</th>' +
        '<th style="text-align:right">FRT P50</th><th style="text-align:right">FRT P75</th><th style="text-align:right">FRT P90</th></tr></thead>' +
      '<tbody>' +
      MANAGERS.map(function (m) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:5px 0;font-weight:600">' + m.name + '</td>' +
          '<td style="text-align:right">' + m.frtMin + '분</td>' +
          '<td style="text-align:right">' + Math.round(m.frtMin * 1.7) + '분</td>' +
          '<td style="text-align:right">' + Math.round(m.frtMin * 2.8) + '분</td></tr>';
      }).join('') + '</tbody></table>');

    /* Conc risk panel */
    setHtml('concRiskPanel',
      '<div style="padding:8px 0;font-size:13px">' +
      '<div style="font-weight:700;margin-bottom:8px">담당자 편중도 분석</div>' +
      '<div style="margin-bottom:6px">김민준 <strong style="color:#ae3f4d">38%</strong> — 최고 집중</div>' +
      '<div style="font-size:12px;color:#888">전체 채팅 중 38%를 단일 담당자가 처리 중<br>업무 과부하 리스크 존재 — 적정 분산 권장</div></div>');
  }

  /* ── CHARTS ─────────────────────────────────────────── */
  var chartRegistry = {};

  function tryChart(id, config) {
    var canvas = el(id);
    if (!canvas) return;
    try {
      if (chartRegistry[id]) chartRegistry[id].destroy();
      chartRegistry[id] = new Chart(canvas.getContext('2d'), config);
    }
    catch (e) { console.warn('Chart skipped:', id, e.message); }
  }

  function resizeVisibleCharts() {
    setTimeout(function () {
      Object.keys(chartRegistry).forEach(function (id) {
        var canvas = el(id);
        if (!canvas || !chartRegistry[id]) return;
        var rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          chartRegistry[id].resize();
          chartRegistry[id].update('none');
        }
      });
    }, 80);
  }

  function axisStyle() {
    return { ticks: { color:'#777', font:{ size:10 } }, grid: { color:'#ece6de' } };
  }
  var basePlugins = {
    legend: { labels: { color:'#3a3028', font:{ size:11 }, boxWidth:12 } },
    annotation: {},
  };

  function renderCharts() {
    /* 1. Trend Chart */
    tryChart('trendChart', {
      type: 'bar',
      data: {
        labels: DAILY_LABELS,
        datasets: [
          { label:'총 채팅', data: DAILY_TOTAL,
            backgroundColor: '#24335088', borderColor:'#243350', borderWidth:1 },
          { label:'미해결', type:'line', data: DAILY_OPEN,
            borderColor:'#ae3f4d', backgroundColor:'transparent',
            tension:0.4, pointRadius:2, borderWidth:1.5 },
        ],
      },
      options: { responsive:true, maintainAspectRatio:false,
        plugins: basePlugins, scales: { x: Object.assign({ ticks:{ maxRotation:0, maxTicksLimit:10 } }, axisStyle()), y: axisStyle() } },
    });

    /* 2. Tag Bar Chart */
    tryChart('tagBarChart', {
      type: 'bar',
      data: {
        labels: TAGS.map(function (t) { return t.tag; }),
        datasets: [{ label:'건수',
          data: TAGS.map(function (t) { return t.count; }),
          backgroundColor: ['#ae3f4d','#b87030','#243350','#8f4219','#1d6450','#3a6090','#6b7280'] }],
      },
      options: { responsive:true, maintainAspectRatio:false, indexAxis:'y',
        plugins: basePlugins, scales: { x: axisStyle(), y: axisStyle() } },
    });

    /* 3. Manager Quadrant Chart */
    tryChart('mgrQuadrantChart', {
      type: 'scatter',
      data: {
        datasets: MANAGERS.map(function (m, i) {
          var colors = ['#1d6450','#243350','#8f4219','#ae3f4d','#b87030'];
          return { label: m.name, data:[{ x: m.chats, y: m.score }],
            backgroundColor: colors[i], pointRadius: 12 };
        }),
      },
      options: { responsive:true, maintainAspectRatio:false, plugins: basePlugins,
        scales: {
          x: Object.assign({ title:{ display:true, text:'처리 채팅 수', color:'#666' } }, axisStyle()),
          y: Object.assign({ title:{ display:true, text:'CS 점수',      color:'#666' }, min:60, max:100 }, axisStyle()),
        } },
    });

    /* 4. Channel Chart */
    tryChart('channelChart', {
      type: 'doughnut',
      data: {
        labels: ['앱 인앱','웹 채팅','이메일'],
        datasets: [{ data:[68,31,13], backgroundColor:['#12253a','#1a5c5c','#3a9080'] }],
      },
      options: { responsive:true, maintainAspectRatio:false, cutout:'60%', plugins: basePlugins },
    });

    /* 5. Hour Load Chart */
    tryChart('hourLoadChart', {
      type: 'bar',
      data: {
        labels: Array.from({length:24}, function (_,i) { return i + '시'; }),
        datasets: [{ label:'채팅 건수',
          data: [0,0,0,0,0,1,1,3,5,7,8,8,6,5,5,6,5,4,3,2,1,1,1,0],
          backgroundColor: function (ctx) {
            var h = ctx.dataIndex;
            return (h >= 10 && h <= 12) ? '#ae3f4d' : '#24335088';
          },
          borderRadius: 3 }],
      },
      options: { responsive:true, maintainAspectRatio:false,
        plugins: basePlugins, scales: { x: Object.assign({ ticks:{ maxRotation:0, maxTicksLimit:12 } }, axisStyle()), y: axisStyle() } },
    });

    /* 6. Complaint Trend Chart */
    tryChart('complaintTrendChart', {
      type: 'line',
      data: {
        labels: DAILY_LABELS,
        datasets: [{ label:'컴플레인율 (%)',
          data: [5.8,6.2,6.9,7.4,8.1,10.2,7.1],
          borderColor:'#ae3f4d', backgroundColor:'#ae3f4d22',
          fill:true, tension:0.4, pointRadius:2 }],
      },
      options: { responsive:true, maintainAspectRatio:false, plugins: basePlugins,
        scales: { x: Object.assign({ ticks:{ maxRotation:0, maxTicksLimit:10 } }, axisStyle()), y: Object.assign({ min:0, max:12 }, axisStyle()) } },
    });

    /* 7. Complaint Category Chart */
    tryChart('complaintCatChart', {
      type: 'pie',
      data: {
        labels: ['응대 품질 불만','처리 지연','정책 불만','오안내','기타'],
        datasets: [{ data:[32,29,18,12,9], backgroundColor:['#ae3f4d','#b87030','#8f4219','#243350','#6b7280'] }],
      },
      options: { responsive:true, maintainAspectRatio:false, plugins: basePlugins },
    });
  }

  /* ── TAB SWITCHING ──────────────────────────────────── */
  function initTabs(tabsId) {
    var tabs = el(tabsId);
    if (!tabs) return;
    tabs.querySelectorAll('.cg-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = this.getAttribute('data-tab');
        /* Deactivate all in group */
        tabs.querySelectorAll('.cg-tab').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        /* Find all sibling panes */
        var panel = tabs.closest('.cg-panel');
        if (!panel) return;
        panel.querySelectorAll('.cg-tab-pane').forEach(function (p) { p.classList.remove('active'); });
        var target = panel.querySelector('#' + targetId);
        if (target) target.classList.add('active');
        resizeVisibleCharts();
      });
    });
  }

  /* ── TOOLBAR BUTTONS (no-op for portfolio) ──────────── */
  function initToolbar() {
    var fb = el('filterBtn');
    var rb = el('refreshBtn');
    var cb = el('csvDownloadBtn');
    var copy = el('reportCopyBtn');
    var fd = el('filterDrawer');
    var fc = el('filterCloseBtn');
    var fcl= el('filterClearBtn');
    var status = el('refreshStatus');
    var deductBtn = el('healthDeductBtn');
    var deduct = el('healthDeductDetail');

    if (fb && fd) {
      fb.addEventListener('click', function () {
        fd.style.display = fd.style.display === 'none' ? 'block' : 'none';
      });
    }
    if (rb) rb.addEventListener('click', function () {
      rb.textContent = '✓ 데모 데이터';
      if (status) status.textContent = '가상 데이터 갱신 완료';
      setTimeout(function () { rb.innerHTML = '<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M13.65 2.35A8 8 0 1 0 14.94 8H13a6 6 0 1 1-1.25-3.72L9 7h5V2l-.35.35z"/></svg> 새로고침'; }, 1200);
      setTimeout(function () { if (status) status.textContent = ''; }, 1800);
    });
    if (cb) cb.addEventListener('click', function () { alert('포트폴리오 데모 — CSV 기능은 실제 운영 환경에서만 동작합니다.'); });
    if (copy) copy.addEventListener('click', function () {
      var report = '[OPS] 채널톡 CS 요약\\n' +
        '- CS 건강 점수: 64점(주의)\\n' +
        '- 총 채팅: 112건 / FRT P50: 4분 / FCR: 93%\\n' +
        '- 우선 조치: 8시간+ 지연 13건 처리, 컴플레인 8건 원인 분류, D 담당자 라우팅 분산';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(report).then(function () {
          if (status) status.textContent = '리포트 요약 복사 완료';
        }).catch(function () {
          if (status) status.textContent = '복사 권한 제한 — 요약은 화면에서 확인 가능';
        });
      } else if (status) {
        status.textContent = '복사 기능 미지원 — 요약은 화면에서 확인 가능';
      }
      setTimeout(function () { if (status) status.textContent = ''; }, 2200);
    });
    if (fc && fd) fc.addEventListener('click', function () { fd.style.display = 'none'; });
    if (fcl) fcl.addEventListener('click', function () { /* no-op */ });
    if (deductBtn && deduct) {
      deductBtn.addEventListener('click', function () {
        var open = deduct.style.display !== 'none';
        deduct.style.display = open ? 'none' : 'block';
        deductBtn.textContent = open ? '감점 내역 보기' : '감점 내역 닫기';
      });
    }
    document.querySelectorAll('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        this.classList.toggle('active');
        var selected = document.querySelectorAll('.filter-chip.active').length;
        var count = el('filterCount');
        if (count) {
          count.style.display = selected ? 'inline-flex' : 'none';
          count.textContent = selected;
        }
      });
    });
    document.querySelectorAll('.diag-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.diag-tab').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        renderDiagPanel(this.getAttribute('data-diag'));
      });
    });
  }

  function alignOriginalLikeSampleDom() {
    var delayHtml =
      '<div style="padding:8px 0">' +
      '<div style="font-size:24px;font-weight:700;color:#ae3f4d;margin-bottom:4px">13건</div>' +
      '<div style="font-size:12px;color:#666;line-height:1.7">완료 건 기준 8시간+ 장기지연 가상 시나리오입니다.<br>D 담당자 · #정기구독/#차량변경 문의가 우선 정리 대상입니다.</div>' +
      '<div style="margin-top:8px;font-size:11px;color:#888">계산 기준: 13/54건 · 24%</div>' +
      '</div>';
    setHtml('longDelayPanel', delayHtml);
    setHtml('longDelayPanelInline', delayHtml);

    setHtml('mgrRiskStrip',
      '<div style="background:#fff3e0;border:1px solid #ffd080;border-radius:6px;padding:8px 12px;font-size:12px;margin-bottom:8px">' +
      '⚠ <strong>D 담당자</strong> 배정 편중 88% · 장기지연 9건 집중 — 신규 문의 분산과 장기 큐 우선 처리 권고</div>');
    setHtml('concRiskPanel',
      '<div style="padding:8px 0;font-size:13px">' +
      '<div style="font-weight:700;margin-bottom:8px">담당자 편중도 분석</div>' +
      '<div style="margin-bottom:6px">D 담당자 <strong style="color:#ae3f4d">88%</strong> · 배정 기준 최고 집중</div>' +
      '<div style="font-size:12px;color:#888">오픈 채팅 대부분이 단일 담당자에게 몰린 상태로 가정한 가상 시나리오입니다.<br>원본과 동일하게 배정 분산 여부를 운영 리스크로 표시합니다.</div></div>');

    setHtml('botPanel',
      '<div style="font-size:13px;line-height:1.9">' +
      '<strong>자동화 후보 52건</strong> · 전체 문의의 46%<br>' +
      'FAQ 자동 응답 28건 · 구독 변경 안내 14건 · 결제/환불 안내 10건<br>' +
      '<span style="color:#888;font-size:12px">원본 자동화 효과 패널 구조를 유지한 비식별 가상 데이터입니다.</span></div>');
    setHtml('channelStats',
      '<div style="font-size:12px;line-height:2;margin-top:8px">' +
      '앱 인앱: <strong>68건</strong> (61%)<br>웹 채팅: <strong>31건</strong> (28%)<br>이메일: <strong>13건</strong> (11%)</div>');

    setHtml('wowStrip',
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      [
        { label:'채팅량', curr:'112건', delta:'+9건', pos:true },
        { label:'FRT', curr:'4분', delta:'-1분', pos:true },
        { label:'FCR', curr:'93%', delta:'+2%p', pos:true },
        { label:'컴플레인율', curr:'7.1%', delta:'+1.2%p', pos:false },
      ].map(function (w) {
        return '<div style="background:#fff;border:1px solid #ece6de;border-radius:8px;padding:8px 12px;min-width:120px">' +
          '<div style="font-size:11px;color:#888;margin-bottom:2px">' + w.label + '</div>' +
          '<div style="font-size:16px;font-weight:700">' + w.curr + '</div>' +
          '<div style="font-size:11px;color:' + (w.pos ? '#1a8060' : '#b83050') + '">' + w.delta + ' vs 전주</div></div>';
      }).join('') + '</div>');

    setHtml('fcrPanel',
      '<div style="display:flex;flex-wrap:wrap;gap:16px;padding:8px 0">' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">FCR (1차 해결률)</div><div style="font-size:24px;font-weight:700;color:#1d6450">93%</div><div style="font-size:11px;color:#888">목표 90%</div></div>' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">재오픈 비율</div><div style="font-size:24px;font-weight:700;color:#b87030">13%</div><div style="font-size:11px;color:#888">전주 11%</div></div>' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">반복 문의</div><div style="font-size:24px;font-weight:700;color:#243350">11건</div><div style="font-size:11px;color:#888">9.8%</div></div>' +
      '</div>');

    var percentileHtml = '<div style="padding:8px 0">' +
      [
        { label:'P50 (중앙값)', val:'42분', color:'#1d6450' },
        { label:'P75', val:'1시간 18분', color:'#243350' },
        { label:'P90', val:'4시간 10분', color:'#b87030' },
        { label:'P95', val:'9시간 35분', color:'#ae3f4d' },
      ].map(function (p) {
        return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ece6de;font-size:13px">' +
          '<span style="color:#666">' + p.label + '</span><strong style="color:' + p.color + '">' + p.val + '</strong></div>';
      }).join('') + '</div>';
    setHtml('percentilePanel', percentileHtml);
    setHtml('percentilePanelInline', percentileHtml);

    setHtml('sourcePerfPanel',
      '<div style="padding:8px 0;font-size:12px"><table style="width:100%;border-collapse:collapse">' +
      '<thead><tr style="color:#888;border-bottom:1px solid #ece6de"><th style="text-align:left;padding:4px 0">채널</th><th style="text-align:right">채팅수</th><th style="text-align:right">FRT</th><th style="text-align:right">FCR</th></tr></thead><tbody>' +
      [['앱 인앱','68','3분','94%'],['웹 채팅','31','5분','91%'],['이메일','13','18분','88%']].map(function (r) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:6px 0">' + r[0] + '</td><td style="text-align:right">' + r[1] + '</td><td style="text-align:right">' + r[2] + '</td><td style="text-align:right">' + r[3] + '</td></tr>';
      }).join('') + '</tbody></table></div>');

    setHtml('anomalyPanel',
      '<div style="padding:8px 0"><div style="background:#fff3e0;border:1px solid #ffd080;border-radius:6px;padding:10px;font-size:12px;margin-bottom:8px">' +
      '⚡ <strong>6월 15일</strong> 채팅량 20건 · 7일 평균 대비 +1.8σ 이상치 감지<br>원인 추정: 정기구독 차량변경 문의 집중</div>' +
      '<div style="font-size:12px;color:#888">최근 7일 이상치 탐지: <strong>1일</strong></div></div>');
    setHtml('forecastPanel',
      '<div style="padding:8px 0"><div style="font-size:12px;line-height:2.2">' +
      '7일 이동평균: <strong>16.0건/일</strong><br>모멘텀: <strong>→ 보합</strong><br>내일 예상 채팅: <strong>15~19건</strong><br>다음 피크 예상: <strong>월요일 오전</strong></div></div>');

    setHtml('tagResTable',
      '<table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr style="color:#888;border-bottom:1px solid #ece6de">' +
      '<th style="text-align:left;padding:4px 0">태그</th><th style="text-align:right">건수</th><th style="text-align:right">평균 해결</th><th style="text-align:right">P90</th></tr></thead><tbody>' +
      TAGS.slice(0, 5).map(function (t) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:5px 0">' + t.tag + '</td><td style="text-align:right">' + t.count + '</td><td style="text-align:right">' + t.avgRes + '분</td><td style="text-align:right">' + Math.round(t.avgRes * 2.1) + '분</td></tr>';
      }).join('') + '</tbody></table>');
  }

  /* ── INIT ───────────────────────────────────────────── */
  function init() {
    animateLoading();
    renderHeroMeta();
    renderHacCard();
    renderKpiGrid();
    renderAlertStrip();
    renderInsights();
    renderHealth();
    renderGauges();
    renderTrendPanel();
    renderHeatmap();
    renderVocList();
    renderCategoryBars();
    renderManagerTable();
    renderResolution();
    renderLongDelay();
    renderBotPanel();
    renderGroupPanel();
    renderChannelStats();
    renderFilterChips();
    renderAdvancedPanels();
    renderCharts();
    alignOriginalLikeSampleDom();
    resizeVisibleCharts();
    initTabs('vocTabs');
    initTabs('mgrTabs');
    initTabs('resTabs');
    initToolbar();
    setTimeout(dismissOverlay, 1400);
    setTimeout(function () {
      var ov = el('loadingOverlay');
      if (ov) ov.style.display = 'none';
    }, 2400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
