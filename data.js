/* =========================================================
   Autostay CS Dashboard — Portfolio Static Data
   All figures are fictional / illustrative only
   ========================================================= */
(function () {
  'use strict';

  /* ── FICTIONAL DATA ─────────────────────────────────── */
  var MANAGERS = [
    { name:'담당자 A', chats:23, frtMin:4, resMin:464, score:21, comment:'응대 보완 · 장기지연 집중' },
    { name:'담당자 B', chats:4, frtMin:13, resMin:398, score:9.4, comment:'컴플레인 多 · 원인 재분류' },
    { name:'담당자 C', chats:1, frtMin:45, resMin:105, score:0.8, comment:'표본 적음 · 코칭 필요' },
  ];

  var TAGS = [
    { tag:'#정기구독/차량변경', count:5, pct:10.9, riskScore:92, avgRes:336, p50:'1h 16m', p90:'23h 16m', grade:'지연' },
    { tag:'#정기구독/환불문의', count:3, pct:6.5, riskScore:76, avgRes:82, p50:'1h 20m', p90:'1h 42m', grade:'보통' },
    { tag:'#정기구독', count:3, pct:6.5, riskScore:94, avgRes:1005, p50:'1h 17m', p90:'1일 23h', grade:'지연' },
    { tag:'#컴플레인/응대', count:6, pct:13.0, riskScore:88, avgRes:142, p50:'2h 10m', p90:'9h 30m', grade:'모니터링' },
    { tag:'#앱오류/예약', count:4, pct:8.7, riskScore:66, avgRes:58, p50:'48m', p90:'2h 05m', grade:'주의' },
    { tag:'#이용문의', count:11, pct:23.9, riskScore:38, avgRes:31, p50:'22m', p90:'1h 02m', grade:'정상' },
    { tag:'#미분류', count:14, pct:30.4, riskScore:48, avgRes:45, p50:'33m', p90:'1h 40m', grade:'분류필요' },
  ];

  /* 최근 7일 일별 채팅 트렌드 */
  var DAILY_LABELS = ['7/21','7/22','7/23','7/24','7/25','7/26','7/27'];
  var DAILY_TOTAL  = [4,5,6,7,8,9,7];
  var DAILY_OPEN   = [1,1,2,3,5,7,9];

  /* ── HELPERS ────────────────────────────────────────── */
  function el(id) { return document.getElementById(id); }
  function setText(id, v) { var e = el(id); if (e) e.textContent = v; }
  function setHtml(id, v) { var e = el(id); if (e) e.innerHTML = v; }
  function fmtMin(min) {
    if (min < 60) return min + '분';
    var h = Math.floor(min / 60);
    var m = min % 60;
    return h + 'h' + (m ? ' ' + m + 'm' : '');
  }

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
    var score = 58;
    fillHealthGauge(score);
    setText('healthScore', score + '점');
    setText('healthGrade', 'C · 주의');
    setText('healthSub',   '감점 42점 · 장기지연 24% · 컴플레인율 13% · 담당자 편중 82%');
    setHtml('healthDeductDetail',
      '<strong>감점 내역</strong><br>' +
      '장기지연율 24%: -12점 · 컴플레인율 13%: -10점 · 담당자 편중 82%: -14점 · VOC 미분류 30%: -6점');
  }

  /* ── SMALL GAUGES ───────────────────────────────────── */
  function renderGauges() {
    /* 30분 해결율 3% */
    fillSmallGauge('gsvg-quick', 0.03);
    setText('gval-quick', '3%');
    setText('gsub-quick', '1건 · 자동화 여부 미구분');
    setText('gbadge-quick', '주의');

    /* 8h+ 지연율 24% (낮을수록 좋음) */
    fillSmallGauge('gsvg-slow', 0.24);
    setText('gval-slow', '24%');
    setText('gsub-slow', '7/29건 · 완료 건 기준');
    setText('gbadge-slow', '장기지연');

    /* FRT 4분 */
    fillSmallGauge('gsvg-frt', 0.86);
    setText('gval-frt', '4분');
    setText('gsub-frt', '목표 <5분');
    setText('gbadge-frt', '정상');

    /* 운영 판정: 실사용 화면에서는 자동화 여부 미구분 */
    fillSmallGauge('gsvg-fcr', 0.58);
    setText('gval-fcr', '58점');
    setText('gsub-fcr', '운영 판정 점수');
    setText('gbadge-fcr', 'C');

    /* 담당자 편중도 82% */
    fillSmallGauge('gsvg-conc', 0.82);
    setText('gval-conc', '82%');
    setText('gsub-conc', '배정 기준 · 전체 기준 50%');
    setText('gbadge-conc', '과부하');
  }

  /* ── HERO META ──────────────────────────────────────── */
  function renderHeroMeta() {
    setText('himTotal', '46건');
    setText('himFrt',   '4분');
    setText('himFcr',   '58점');
    setText('himRange',  '7/21-7/27');
    setText('channelName', 'Autostay [OPS]');
    setText('updatedAt',   '2026-07-27 10:31 업데이트');
    setText('cacheBadge',  '메모리 캐시 · 비식별 가상');
    setText('heroDecisionSummary', '운영 판정 58점 · 주의. 장기지연 7건, 컴플레인 6건, 담당자 편중 82%가 오늘 우선 과제입니다.');
  }

  /* ── HERO ACTION CARD ───────────────────────────────── */
  function renderHacCard() {
    setText('hacGrade', '58점');
    setHtml('hacBody',
      '<ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.9">' +
      '<li>장기 지연 큐 <strong>7건</strong> 우선 정리 — 최장 1일 23h</li>' +
      '<li>컴플레인 <strong>6건</strong> 추이 점검 — #컴플레인 중심 재분류</li>' +
      '<li>담당자 A 배정 편중 <strong>82%</strong> — 신규 문의 분산</li>' +
      '</ul>');
    setHtml('hacFooter',
      '<span style="font-size:11px;color:#999">완료 기준: 장기지연 50% 축소 · 편중도 70% 이하 · 컴플레인 원인 분류 완료</span>');
  }

  /* ── KPI GRID ───────────────────────────────────────── */
  function renderKpiGrid() {
    var kg = el('kpiGrid');
    if (!kg) return;
    var items = [
      { label:'총 채팅',    value:'46건', delta:'7일 기준',  pos:true  },
      { label:'FRT P50',    value:'4분',   delta:'정상',  pos:true  },
      { label:'운영 판정',  value:'58점',   delta:'C · 주의', pos:false },
      { label:'30분 해결',  value:'3%',   delta:'1건', pos:false },
      { label:'8h+ 지연',   value:'24%',   delta:'7건', pos:false },
      { label:'컴플레인율', value:'13%',  delta:'모니터링', pos:false },
      { label:'미배정',     value:'0건',   delta:'정상', pos:true },
      { label:'오픈 채팅',   value:'9건',   delta:'전원 배정', pos:true },
    ];
    kg.innerHTML = items.map(function (k) {
      return '<div class="kpi-card" style="background:#fff;border:1px solid #e8e2d8;border-radius:10px;padding:12px 14px">' +
        '<div class="kpi-label" style="font-size:11px;color:#888;margin-bottom:4px">' + k.label + '</div>' +
        '<div class="kpi-val" style="font-size:20px;font-weight:700;color:#12253a">'  + k.value + '</div>' +
        '<div class="kpi-delta" style="font-size:11px;font-weight:600;color:' + (k.pos ? '#1a8060' : '#b83050') + '">' + k.delta + '</div>' +
        '</div>';
    }).join('');

    setHtml('kpiGridSecondary', [
      { label:'데이터 범위', value:'7/21-7/27', note:'비식별 가상 7일 · 46건' },
      { label:'담당자 편중', value:'82%', note:'담당자 A · 23건' },
      { label:'피크 시간', value:'12~15시', note:'20건 · 오후 집중' },
      { label:'캐시', value:'메모리 캐시', note:'인스턴스 한정 표시' },
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
      '<span style="font-size:12px;color:#b87030;font-weight:600">⚠ 8시간+ 장기 지연 7건 — 우선 정리 필요</span>' +
      '<span style="font-size:12px;color:#1a5c5c">ℹ 최근 7일 채팅량 46건 · 비식별 가상 데이터</span>' +
      '<span style="font-size:12px;color:#1a5c5c">ℹ 미배정 0건 · 오픈 채팅 9건 전원 배정</span>';
  }

  /* ── INSIGHTS STRIP ─────────────────────────────────── */
  function renderInsights() {
    var s = el('insightsStrip');
    if (!s) return;
    s.innerHTML =
      '<div class="insight-item" style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0;background:#fff3e0;border:1px solid #ffd080;border-radius:8px;padding:6px 12px;font-size:12px">' +
        '<span>⚡</span><span>장기지연 7건과 담당자 A 편중 82%가 동시에 발생 — 신규 문의 라우팅 분산 검토</span></div>' +
      '<div class="insight-item" style="display:inline-flex;align-items:center;gap:6px;margin:4px 8px 4px 0;background:#e8f4ec;border:1px solid #90d4b0;border-radius:8px;padding:6px 12px;font-size:12px">' +
        '<span>✅</span><span>미배정 채팅 0건 · 오픈 큐 정상 — 장기지연과 컴플레인 원인 관리에 집중</span></div>';
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
        '<td style="text-align:right">' + fmtMin(m.frtMin) + '</td>' +
        '<td style="text-align:right">' + fmtMin(m.resMin) + '</td>' +
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
        '활성 담당자: <strong>3명</strong><br>' +
        '총 처리: <strong>46건</strong><br>' +
        '평균 운영 점수: <strong>10점</strong><br>' +
        '최단 FRT: <strong>담당자 A 4분</strong><br>' +
        '개선 필요: <strong>담당자 A 편중 82%</strong>' +
        '</div></div>';
    }

    /* Mgr risk strip */
    setHtml('mgrRiskStrip',
      '<div style="background:#fff3e0;border:1px solid #ffd080;border-radius:6px;padding:8px 12px;font-size:12px;margin-bottom:8px">' +
      '⚠ <strong>담당자 A</strong> 배정 편중 82% — 장기지연 큐 우선 정리 및 신규 문의 분산 권고</div>');
  }

  /* ── RESOLUTION PANEL ───────────────────────────────── */
  function renderResolution() {
    setHtml('resSummary',
      '<div style="display:flex;gap:16px;margin-bottom:8px;flex-wrap:wrap">' +
      '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#98a2b3">0%</div><div style="font-size:11px;color:#888">5분 이내</div></div>' +
      '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#1d6450">3%</div><div style="font-size:11px;color:#888">5~30분</div></div>' +
      '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#243350">72%</div><div style="font-size:11px;color:#888">30분~8시간</div></div>' +
      '<div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#ae3f4d">24%</div><div style="font-size:11px;color:#888">8시간+</div></div>' +
      '</div>');

    var bands = [
      { label:'5분 이내', count:0, pct:0, color:'#98a2b3' },
      { label:'5~30분', count:1, pct:3, color:'#1d6450' },
      { label:'30분~8시간', count:21, pct:72, color:'#243350' },
      { label:'8시간 이상', count:7, pct:24, color:'#ae3f4d' },
    ];
    setHtml('resList', bands.map(function (b) {
      return '<div style="margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">' +
          '<span>' + b.label + '</span><strong>' + b.count + '건 (' + b.pct + '%)</strong></div>' +
        '<div style="height:8px;background:#ece6de;border-radius:4px;overflow:hidden">' +
          '<div style="height:100%;width:' + b.pct + '%;background:' + b.color + ';border-radius:4px"></div></div></div>';
    }).join(''));
    setHtml('avgResNote',
      '<div style="font-size:11px;color:#888;margin-top:8px">측정 가능 closed 상담 기준 · 장기지연은 #정기구독 계열과 컴플레인 태그에 집중되어 있습니다.</div>');
  }

  /* ── LONG DELAY PANEL ───────────────────────────────── */
  function renderLongDelay() {
    var delayHtml = '<div style="padding:8px 0">' +
      '<div style="font-size:13px;font-weight:700;color:#ae3f4d;margin-bottom:8px">🐢 8시간+ 장기 지연 현황</div>' +
      '<div style="font-size:24px;font-weight:700;color:#ae3f4d;margin-bottom:4px">7건</div>' +
      '<div style="font-size:12px;color:#888;margin-bottom:12px">완료 건 기준 8시간+ 장기 지연</div>' +
      '<div style="font-size:12px;line-height:2">' +
        '#정기구독: <strong>3건</strong><br>' +
        '#차량변경: <strong>2건</strong><br>' +
        '#환불문의: <strong>1건</strong><br>' +
        '#컴플레인: <strong>1건</strong></div>' +
      '<div style="margin-top:10px;background:#fff3e0;border-radius:6px;padding:8px;font-size:11px;color:#b87030">' +
        '⚠ 최장 1일 23h — 장기 큐 우선 정리 필요</div>' +
      '</div>';
    setHtml('longDelayPanel', delayHtml);
    setHtml('longDelayPanelInline', delayHtml);
  }

  /* ── BOT PANEL ──────────────────────────────────────── */
  function renderBotPanel() {
    setHtml('botPanel',
      '<div style="padding:8px 0">' +
      '<div style="font-size:12px;margin-bottom:4px">자동화 여부</div>' +
      '<div style="font-size:22px;font-weight:700;color:#12253a">미구분</div>' +
      '<div style="font-size:12px;color:#b87030;margin-bottom:12px">실사용 화면 기준 자동화 여부 별도 미분류</div>' +
      '<div style="font-size:12px;line-height:2">' +
        '5분 내 해결: <strong>0건</strong><br>' +
        '5~30분 해결: <strong>1건</strong><br>' +
        '자동화 판별: <strong>수집 대상 아님</strong><br>' +
        '운영 활용: <strong>응답 속도 개선 후보 확인</strong></div></div>');
  }

  /* ── GROUP PANEL ────────────────────────────────────── */
  function renderGroupPanel() {
    setHtml('groupPanel',
      '<div style="padding:8px 0">' +
      '<div style="font-size:12px;line-height:2.2">' +
        '운영 채널: <strong>채널톡 [OPS]</strong><br>' +
        '활성 담당자: <strong>3명</strong><br>' +
        '총 처리: <strong>46건</strong><br>' +
        '오픈 채팅: <strong>9건</strong><br>' +
        '미배정 채팅: <strong>0건</strong><br>' +
        '데이터 범위: <strong>7/21-7/27</strong></div></div>');
  }

  /* ── CHANNEL STATS ──────────────────────────────────── */
  function renderChannelStats() {
    setHtml('channelStats',
      '<div style="font-size:12px;line-height:2;margin-top:8px">' +
      '앱 인앱: <strong>28건</strong> (61%)<br>' +
      '웹 채팅: <strong>13건</strong> (28%)<br>' +
      '이메일: <strong>5건</strong> (11%)</div>');
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
        'API 엔드포인트: channel / managers / open-chats / tags 모두 OK로 가정<br>' +
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
        '데모 기준: 최근 7일 비식별 가상 데이터 46건</div>',
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
        { label:'채팅량',    prev:'39건', curr:'46건', delta:'+7건', pos:true },
        { label:'FRT P50',   prev:'6분',    curr:'4분',    delta:'-2분',  pos:true },
        { label:'운영 판정', prev:'61점',   curr:'58점',   delta:'-3점',  pos:false },
        { label:'컴플레인율', prev:'9%',   curr:'13%',   delta:'+4%p',pos:false },
      ].map(function (w) {
        return '<div style="background:#fff;border:1px solid #ece6de;border-radius:8px;padding:8px 12px;min-width:120px">' +
          '<div style="font-size:11px;color:#888;margin-bottom:2px">' + w.label + '</div>' +
          '<div style="font-size:16px;font-weight:700">' + w.curr + '</div>' +
          '<div style="font-size:11px;color:' + (w.pos ? '#1a8060' : '#b83050') + '">' + w.delta + ' vs 이전 기간</div>' +
          '</div>';
      }).join('') + '</div>');

    /* SLA Tracker */
    setHtml('slaTracker',
      '<div style="padding:8px 0">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:8px">SLA 준수율</div>' +
      [
        { label:'30분 내 해결', target:70, actual:3 },
        { label:'8시간 내 해결', target:90, actual:76 },
        { label:'미배정 해소', target:100, actual:100 },
      ].map(function (s) {
        var ok = s.actual >= s.target;
        return '<div style="margin-bottom:8px">' +
          '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">' +
            '<span>' + s.label + '</span>' +
            '<strong style="color:' + (ok ? '#1d6450' : '#ae3f4d') + '">' + s.actual + '% / 목표 ' + s.target + '%</strong></div>' +
          '<div style="height:8px;background:#ece6de;border-radius:4px;overflow:hidden">' +
            '<div style="height:100%;width:' + s.actual + '%;background:' + (ok ? '#1d6450' : '#ae3f4d') + ';border-radius:4px"></div></div></div>';
      }).join('') + '</div>');

    /* 운영 판정 Panel */
    setHtml('fcrPanel',
      '<div style="display:flex;flex-wrap:wrap;gap:16px;padding:8px 0">' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">운영 판정</div><div style="font-size:24px;font-weight:700;color:#b87030">58점</div><div style="font-size:11px;color:#888">C · 주의</div></div>' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">컴플레인율</div><div style="font-size:24px;font-weight:700;color:#ae3f4d">13%</div><div style="font-size:11px;color:#888">모니터링</div></div>' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">반복/미분류</div><div style="font-size:24px;font-weight:700;color:#243350">14건</div><div style="font-size:11px;color:#888">분류 필요</div></div>' +
      '</div>');

    /* Percentile Panel */
    var percentileHtml = '<div style="padding:8px 0">' +
      [
        { label:'P50 (중앙값)', val:'1h 16m', color:'#1d6450' },
        { label:'P75',          val:'4h 20m', color:'#243350' },
        { label:'P90',          val:'23h 16m', color:'#b87030' },
        { label:'P95',          val:'1일 23h', color:'#ae3f4d' },
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
        { label:'8~12시간', count:3,  pct:43, color:'#b87030' },
        { label:'12~24시간', count:2, pct:29, color:'#ae3f4d' },
        { label:'24~48시간', count:1, pct:14, color:'#8f2030' },
        { label:'48시간+',   count:1, pct:14, color:'#5a1020' },
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
      '<th style="text-align:right">채팅수</th><th style="text-align:right">FRT</th><th style="text-align:right">운영 점수</th></tr></thead>' +
      '<tbody>' +
      [['앱 인앱','28','4분','62점'],['웹 채팅','13','8분','55점'],['이메일','5','18분','48점']].map(function (r) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:6px 0">' + r[0] + '</td>' +
          '<td style="text-align:right">' + r[1] + '</td><td style="text-align:right">' + r[2] + '</td><td style="text-align:right">' + r[3] + '</td></tr>';
      }).join('') + '</tbody></table></div>');

    /* Anomaly Panel */
    setHtml('anomalyPanel',
      '<div style="padding:8px 0">' +
      '<div style="background:#fff3e0;border:1px solid #ffd080;border-radius:6px;padding:10px;font-size:12px;margin-bottom:8px">' +
        '⚡ <strong>7월 26일</strong> — 채팅량 9건으로 7일 평균 대비 <strong>+1.8σ</strong> 이상치 탐지<br>' +
        '원인 추정: 정기구독 차량변경 문의 집중</div>' +
      '<div style="font-size:12px;color:#888">최근 7일 이상치 탐지: <strong>1일</strong></div>' +
      '</div>');

    /* Forecast Panel */
    setHtml('forecastPanel',
      '<div style="padding:8px 0">' +
      '<div style="font-size:12px;line-height:2.2">' +
        '7일 이동평균: <strong>6.6건/일</strong><br>' +
        '모멘텀: <strong>→ 보합</strong><br>' +
        '내일 예상 채팅: <strong>6~9건</strong><br>' +
        '다음 피크 예상: <strong>평일 오후</strong></div>' +
      '<div style="margin-top:8px;background:#e8f4ec;border:1px solid #90d4b0;border-radius:6px;padding:8px;font-size:11px;color:#1a7050">' +
        '📈 장기지연과 편중이 핵심 리스크로 표시되는 가상 시나리오입니다.</div>' +
      '</div>');

    renderDiagPanel('diag-api');

    /* Weekday Load */
    setHtml('weekdayLoadPanel',
      ['월','화','수','목','금','토','일'].map(function (d, i) {
        var vals = [4,5,6,7,8,9,7];
        var pct = Math.round(vals[i] / 9 * 100);
        return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<span style="width:20px;font-size:12px;font-weight:600">' + d + '</span>' +
          '<div style="flex:1;height:8px;background:#ece6de;border-radius:4px;overflow:hidden">' +
            '<div style="height:100%;width:' + pct + '%;background:' + (i >= 5 ? '#ae3f4d' : '#243350') + ';border-radius:4px"></div></div>' +
          '<span style="width:36px;font-size:11px;text-align:right">' + vals[i] + '건</span>' +
          '</div>';
      }).join(''));

    setHtml('bizHoursSplit',
      '<div style="margin-top:8px;font-size:11px;color:#888">' +
        '업무시간(8-19h): <strong>45건</strong> · 야간: <strong>1건</strong></div>');

    /* Hour load KV */
    setText('hourLoadKV', '');
    setHtml('hourLoadKV',
      '<div style="font-size:11px;color:#888;margin-top:6px">' +
        '피크: <strong>12~15시 20건</strong> · 8~11시 14건 · 16~19시 11건</div>');

    /* Complaint trend KV */
    setText('complaintTrendKV', '');
    setHtml('complaintTrendKV',
      '<div style="font-size:11px;color:#888;margin-top:6px">' +
        '평균 컴플레인율 <strong>13%</strong> · 모니터링 6건 · 추세 → 원인 분류 필요</div>');

    /* VOC risk cards */
    setHtml('vocRiskCards',
      '<div style="display:flex;flex-wrap:wrap;gap:10px;padding:8px 0">' +
      TAGS.filter(function (t) { return t.riskScore >= 70; }).map(function (t) {
        return '<div style="background:#fff;border:1px solid #e8e2d8;border-radius:8px;padding:10px 14px;min-width:160px">' +
          '<div style="font-size:12px;font-weight:700">' + t.tag + '</div>' +
          '<div style="font-size:20px;font-weight:700;color:' + (t.riskScore >= 85 ? '#ae3f4d' : '#b87030') + '">' + t.riskScore + '<span style="font-size:11px;font-weight:400"> /100</span></div>' +
          '<div style="font-size:11px;color:#888">평균 해결 ' + fmtMin(t.avgRes) + '</div>' +
          '</div>';
      }).join('') + '</div>');

    /* Tag res table */
    setHtml('tagResTable',
      '<table style="width:100%;font-size:12px;border-collapse:collapse">' +
      '<thead><tr style="color:#888;border-bottom:1px solid #ece6de">' +
        '<th style="text-align:left;padding:4px 0">태그</th>' +
        '<th style="text-align:right">건수</th><th style="text-align:right">평균 해결</th><th style="text-align:right">P90</th><th style="text-align:right">평가</th></tr></thead>' +
      '<tbody>' +
      TAGS.slice(0, 5).map(function (t) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:5px 0">' + t.tag + '</td>' +
          '<td style="text-align:right">' + t.count + '</td><td style="text-align:right">' + fmtMin(t.avgRes) + '</td><td style="text-align:right">' + t.p90 + '</td><td style="text-align:right">' + t.grade + '</td></tr>';
      }).join('') + '</tbody></table>');

    /* Tag co-occur */
    setHtml('tagCooccurPanel',
      '<div style="padding:8px 0;font-size:12px">' +
      '<div style="margin-bottom:8px;font-weight:600">자주 함께 등장하는 태그 쌍</div>' +
      [['#정기구독 + #차량변경', 5],['#정기구독 + #환불문의', 3],['#컴플레인 + #응대', 6]].map(function (c) {
        return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #ece6de">' +
          '<span>' + c[0] + '</span><strong>' + c[1] + '건</strong></div>';
      }).join('') + '</div>');

    /* Complaint cat */
    setHtml('complaintCatSummary',
      '<div style="font-size:13px;font-weight:700;margin-bottom:8px">컴플레인 세분화</div>' +
      [['응대 품질 불만',33,'#ae3f4d'],['처리 지연',33,'#b87030'],['정책 불만',17,'#8f4219'],['오안내',17,'#243350'],['기타',0,'#6b7280']].map(function (c) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #ece6de;font-size:12px">' +
          '<span style="display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;background:' + c[2] + ';border-radius:2px;display:inline-block"></span>' + c[0] + '</span>' +
          '<strong>' + c[1] + '%</strong></div>';
      }).join(''));

    /* Mgr quadrant legend */
    setHtml('mgrQuadrantLegend',
      '<div style="font-size:11px;color:#888;margin-top:6px;text-align:center">' +
      'X축: 채팅 처리량 · Y축: 처리 부담 점수 — 우상단일수록 편중 리스크가 큽니다.</div>');

    /* Mgr FRT table */
    setHtml('mgrFrtTable',
      '<table style="width:100%;font-size:12px;border-collapse:collapse">' +
      '<thead><tr style="color:#888;border-bottom:1px solid #ece6de">' +
        '<th style="text-align:left;padding:4px 0">담당자</th>' +
        '<th style="text-align:right">FRT P50</th><th style="text-align:right">FRT P75</th><th style="text-align:right">FRT P90</th></tr></thead>' +
      '<tbody>' +
      MANAGERS.map(function (m) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:5px 0;font-weight:600">' + m.name + '</td>' +
          '<td style="text-align:right">' + fmtMin(m.frtMin) + '</td>' +
          '<td style="text-align:right">' + fmtMin(Math.round(m.frtMin * 1.7)) + '</td>' +
          '<td style="text-align:right">' + fmtMin(Math.round(m.frtMin * 2.8)) + '</td></tr>';
      }).join('') + '</tbody></table>');

    /* Conc risk panel */
    setHtml('concRiskPanel',
      '<div style="padding:8px 0;font-size:13px">' +
      '<div style="font-weight:700;margin-bottom:8px">담당자 편중도 분석</div>' +
      '<div style="margin-bottom:6px">담당자 A <strong style="color:#ae3f4d">82%</strong> — 배정 기준 최고 집중</div>' +
      '<div style="font-size:12px;color:#888">배정 기준 오픈 채팅 대부분이 단일 담당자에게 집중된 가상 시나리오입니다.<br>신규 문의 분산과 장기 큐 우선 처리가 필요합니다.</div></div>');
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
          y: Object.assign({ title:{ display:true, text:'처리 부담 점수', color:'#666' }, min:0, max:25 }, axisStyle()),
        } },
    });

    /* 4. Channel Chart */
    tryChart('channelChart', {
      type: 'doughnut',
      data: {
        labels: ['앱 인앱','웹 채팅','이메일'],
        datasets: [{ data:[28,13,5], backgroundColor:['#12253a','#1a5c5c','#3a9080'] }],
      },
      options: { responsive:true, maintainAspectRatio:false, cutout:'60%', plugins: basePlugins },
    });

    /* 5. Hour Load Chart */
    tryChart('hourLoadChart', {
      type: 'bar',
      data: {
        labels: Array.from({length:24}, function (_,i) { return i + '시'; }),
        datasets: [{ label:'채팅 건수',
          data: [0,0,0,0,0,0,0,1,3,4,4,3,5,5,5,5,3,3,3,2,0,0,0,0],
          backgroundColor: function (ctx) {
            var h = ctx.dataIndex;
            return (h >= 12 && h <= 15) ? '#ae3f4d' : '#24335088';
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
          data: [8,9,10,11,12,14,13],
          borderColor:'#ae3f4d', backgroundColor:'#ae3f4d22',
          fill:true, tension:0.4, pointRadius:2 }],
      },
      options: { responsive:true, maintainAspectRatio:false, plugins: basePlugins,
        scales: { x: Object.assign({ ticks:{ maxRotation:0, maxTicksLimit:10 } }, axisStyle()), y: Object.assign({ min:0, max:16 }, axisStyle()) } },
    });

    /* 7. Complaint Category Chart */
    tryChart('complaintCatChart', {
      type: 'pie',
      data: {
        labels: ['응대 품질 불만','처리 지연','정책 불만','오안내','기타'],
        datasets: [{ data:[33,33,17,17,0], backgroundColor:['#ae3f4d','#b87030','#8f4219','#243350','#6b7280'] }],
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
        '- CS 건강 점수: 58점(C · 주의)\\n' +
        '- 총 채팅: 46건 / FRT P50: 4분 / 운영 점수: 58점\\n' +
        '- 우선 조치: 장기지연 7건 정리, 컴플레인 6건 원인 분류, 담당자 A 라우팅 분산';
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
      '<div style="font-size:24px;font-weight:700;color:#ae3f4d;margin-bottom:4px">7건</div>' +
      '<div style="font-size:12px;color:#666;line-height:1.7">완료 건 기준 8시간+ 장기지연 가상 시나리오입니다.<br>담당자 A · #정기구독/#차량변경 문의가 우선 정리 대상입니다.</div>' +
      '<div style="margin-top:8px;font-size:11px;color:#888">계산 기준: 7/29건 · 24%</div>' +
      '</div>';
    setHtml('longDelayPanel', delayHtml);
    setHtml('longDelayPanelInline', delayHtml);

    setHtml('mgrRiskStrip',
      '<div style="background:#fff3e0;border:1px solid #ffd080;border-radius:6px;padding:8px 12px;font-size:12px;margin-bottom:8px">' +
      '⚠ <strong>담당자 A</strong> 배정 편중 82% · 장기지연 7건 집중 — 신규 문의 분산과 장기 큐 우선 처리 권고</div>');
    setHtml('concRiskPanel',
      '<div style="padding:8px 0;font-size:13px">' +
      '<div style="font-weight:700;margin-bottom:8px">담당자 편중도 분석</div>' +
      '<div style="margin-bottom:6px">담당자 A <strong style="color:#ae3f4d">82%</strong> · 배정 기준 최고 집중</div>' +
      '<div style="font-size:12px;color:#888">오픈 채팅 대부분이 단일 담당자에게 몰린 상태로 가정한 가상 시나리오입니다.<br>원본과 동일하게 배정 분산 여부를 운영 리스크로 표시합니다.</div></div>');

    setHtml('botPanel',
      '<div style="font-size:13px;line-height:1.9">' +
      '<strong>자동화 여부 미구분</strong> · 5분 내 해결 0건<br>' +
      '5~30분 해결 1건 · 응답 속도 개선 후보 확인<br>' +
      '<span style="color:#888;font-size:12px">실사용 화면 기준 자동화 여부는 별도 분류하지 않는 가상 시나리오입니다.</span></div>');
    setHtml('channelStats',
      '<div style="font-size:12px;line-height:2;margin-top:8px">' +
      '앱 인앱: <strong>28건</strong> (61%)<br>웹 채팅: <strong>13건</strong> (28%)<br>이메일: <strong>5건</strong> (11%)</div>');

    setHtml('wowStrip',
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      [
        { label:'채팅량', curr:'46건', delta:'+7건', pos:true },
        { label:'FRT', curr:'4분', delta:'-1분', pos:true },
        { label:'운영 판정', curr:'58점', delta:'-3점', pos:false },
        { label:'컴플레인율', curr:'13%', delta:'+4%p', pos:false },
      ].map(function (w) {
        return '<div style="background:#fff;border:1px solid #ece6de;border-radius:8px;padding:8px 12px;min-width:120px">' +
          '<div style="font-size:11px;color:#888;margin-bottom:2px">' + w.label + '</div>' +
          '<div style="font-size:16px;font-weight:700">' + w.curr + '</div>' +
          '<div style="font-size:11px;color:' + (w.pos ? '#1a8060' : '#b83050') + '">' + w.delta + ' vs 전주</div></div>';
      }).join('') + '</div>');

    setHtml('fcrPanel',
      '<div style="display:flex;flex-wrap:wrap;gap:16px;padding:8px 0">' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">운영 판정</div><div style="font-size:24px;font-weight:700;color:#b87030">58점</div><div style="font-size:11px;color:#888">C · 주의</div></div>' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">컴플레인율</div><div style="font-size:24px;font-weight:700;color:#ae3f4d">13%</div><div style="font-size:11px;color:#888">모니터링</div></div>' +
      '<div style="min-width:140px"><div style="font-size:11px;color:#888">미분류</div><div style="font-size:24px;font-weight:700;color:#243350">14건</div><div style="font-size:11px;color:#888">분류 필요</div></div>' +
      '</div>');

    var percentileHtml = '<div style="padding:8px 0">' +
      [
        { label:'P50 (중앙값)', val:'1h 16m', color:'#1d6450' },
        { label:'P75', val:'4h 20m', color:'#243350' },
        { label:'P90', val:'23h 16m', color:'#b87030' },
        { label:'P95', val:'1일 23h', color:'#ae3f4d' },
      ].map(function (p) {
        return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ece6de;font-size:13px">' +
          '<span style="color:#666">' + p.label + '</span><strong style="color:' + p.color + '">' + p.val + '</strong></div>';
      }).join('') + '</div>';
    setHtml('percentilePanel', percentileHtml);
    setHtml('percentilePanelInline', percentileHtml);

    setHtml('sourcePerfPanel',
      '<div style="padding:8px 0;font-size:12px"><table style="width:100%;border-collapse:collapse">' +
      '<thead><tr style="color:#888;border-bottom:1px solid #ece6de"><th style="text-align:left;padding:4px 0">채널</th><th style="text-align:right">채팅수</th><th style="text-align:right">FRT</th><th style="text-align:right">운영 점수</th></tr></thead><tbody>' +
      [['앱 인앱','28','4분','62점'],['웹 채팅','13','8분','55점'],['이메일','5','18분','48점']].map(function (r) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:6px 0">' + r[0] + '</td><td style="text-align:right">' + r[1] + '</td><td style="text-align:right">' + r[2] + '</td><td style="text-align:right">' + r[3] + '</td></tr>';
      }).join('') + '</tbody></table></div>');

    setHtml('anomalyPanel',
      '<div style="padding:8px 0"><div style="background:#fff3e0;border:1px solid #ffd080;border-radius:6px;padding:10px;font-size:12px;margin-bottom:8px">' +
      '⚡ <strong>7월 26일</strong> 채팅량 9건 · 7일 평균 대비 +1.8σ 이상치 감지<br>원인 추정: 정기구독 차량변경 문의 집중</div>' +
      '<div style="font-size:12px;color:#888">최근 7일 이상치 탐지: <strong>1일</strong></div></div>');
    setHtml('forecastPanel',
      '<div style="padding:8px 0"><div style="font-size:12px;line-height:2.2">' +
      '7일 이동평균: <strong>6.6건/일</strong><br>모멘텀: <strong>→ 보합</strong><br>내일 예상 채팅: <strong>6~9건</strong><br>다음 피크 예상: <strong>평일 오후</strong></div></div>');

    setHtml('tagResTable',
      '<table style="width:100%;font-size:12px;border-collapse:collapse"><thead><tr style="color:#888;border-bottom:1px solid #ece6de">' +
      '<th style="text-align:left;padding:4px 0">태그</th><th style="text-align:right">건수</th><th style="text-align:right">평균 해결</th><th style="text-align:right">P90</th><th style="text-align:right">평가</th></tr></thead><tbody>' +
      TAGS.slice(0, 5).map(function (t) {
        return '<tr style="border-bottom:1px solid #f4f0e8"><td style="padding:5px 0">' + t.tag + '</td><td style="text-align:right">' + t.count + '</td><td style="text-align:right">' + fmtMin(t.avgRes) + '</td><td style="text-align:right">' + t.p90 + '</td><td style="text-align:right">' + t.grade + '</td></tr>';
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
