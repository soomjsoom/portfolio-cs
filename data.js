/* Deterministic synthetic chats. Aggregates, charts and exports share this grain. */
(function () {
  'use strict';
  const DAY = 86400000;
  const managerNames = ['담당자 A', '담당자 B', '담당자 C', '담당자 D'];
  const tagNames = ['단순이용문의', '정기구독', '정기구독/차량변경', '컴플레인/서비스품질', '컴플레인/시스템', '컴플레인/가격환불', '회원/탈퇴', '미분류'];
  const sources = ['native', 'phone', 'other'];
  const avg = values => values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  const percentile = (values, p) => values.length ? [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor((values.length - 1) * p))] : null;
  const dateKey = ms => new Date(ms + 9 * 3600000).toISOString().slice(0, 10);
  const shortDate = ms => dateKey(ms).slice(5).replace('-', '/');
  const countBy = (rows, key) => rows.reduce((out, row) => { const v = key(row); out[v] = (out[v] || 0) + 1; return out; }, {});
  function records(now) {
    const midnight = Date.parse(dateKey(now) + 'T00:00:00+09:00');
    const rows = [];
    for (let day = 0; day < 70; day++) {
      const count = day === 3 ? 41 : 14 + (day * 7 % 13);
      for (let j = 0; j < count; j++) {
        const seed = day * 31 + j;
        const closedAt = Math.min(now - 60000, midnight - day * DAY + (8 + j % 12) * 3600000);
        const resolutionMin = [3, 16, 38, 82, 160, 410, 670, 1320][(seed * 7 + Math.floor(seed / 8)) % 8];
        const createdAt = closedAt - resolutionMin * 60000;
        const assigneeId = seed % 5 === 0 ? 'demo-d' : ['demo-a', 'demo-a', 'demo-b', 'demo-c'][seed % 4];
        const tag = tagNames[seed % tagNames.length];
        rows.push({ id: 'demo-chat-' + day + '-' + j, userId: 'demo-customer-' + (seed % 850),
          name: '가상 고객 ' + String(seed % 850 + 1).padStart(3, '0'),
          assigneeId, tags: [...new Set(seed % 11 === 0 ? [tag, '정기구독'] : [tag])], source: sources[seed % 3],
          createdAt, closedAt, resolutionMin,
          date: dateKey(createdAt), status: 'closed',
          frtMin: Math.min(resolutionMin, [2, 4, 6, 9, 18, 32][seed % 6]), state: 'closed',
          messages: 3 + seed % 8, reopened: seed % 17 === 0 });
      }
    }
    const open = Array.from({ length: 6 }, (_, i) => ({ id: 'demo-open-' + i, userId: 'demo-active-' + i,
      name: '가상 고객 O-' + (i + 1), assigneeId: i === 0 ? null : 'demo-' + ['a', 'b', 'c', 'd'][i % 4],
      tags: [tagNames[i + 1]], source: sources[i % 3], createdAt: now - [45, 180, 680, 1700, 5100, 12000][i] * 60000,
      elapsedMin: [45, 180, 680, 1700, 5100, 12000][i], ageMin: [45, 180, 680, 1700, 5100, 12000][i], state: 'opened', status: 'opened' }));
    return { rows, open, midnight };
  }
  function matches(row, filters) {
    return (!filters || !filters.managers.size || filters.managers.has(row.assigneeId || '_unassigned'))
      && (!filters || !filters.tags.size || row.tags.some(t => filters.tags.has(t)))
      && (!filters || !filters.sources.size || filters.sources.has(row.source));
  }
  function create(days = 7, filters = null) {
    const now = Date.now();
    const fixture = records(now);
    const range = days === 'all' ? 70 : Number(days);
    const cutoff = fixture.midnight - (range - 1) * DAY;
    const rows = fixture.rows.filter(r => r.createdAt >= cutoff && matches(r, filters));
    const open = fixture.open.filter(r => matches(r, filters));
    const total = rows.length;
    const durations = rows.map(r => r.resolutionMin);
    const frts = rows.map(r => r.frtMin);
    const bucketKeys = ['0~5분', '5~30분', '30분~2시간', '2~8시간', '8시간+'];
    const resolutionBuckets = Object.fromEntries(bucketKeys.map(k => [k, 0]));
    rows.forEach(r => resolutionBuckets[bucketKeys[r.resolutionMin < 5 ? 0 : r.resolutionMin < 30 ? 1 : r.resolutionMin < 120 ? 2 : r.resolutionMin < 480 ? 3 : 4]]++);
    const rate = count => total ? Math.round(count / total * 100) : 0;
    const sla = threshold => { const count = durations.filter(v => v <= threshold).length; return { count, total, rate: rate(count) }; };
    const labels = Array.from({ length: range }, (_, i) => shortDate(cutoff + i * DAY));
    const values = labels.map(label => rows.filter(r => shortDate(r.createdAt) === label).length);
    const complaints = rows.filter(r => r.tags.some(t => t.includes('컴플레인')));
    const complaintValues = labels.map(label => complaints.filter(r => shortDate(r.createdAt) === label).length);
    const tagCounts = {};
    rows.forEach(r => r.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const tagsSorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    const managers = managerNames.map((name, i) => {
      const id = 'demo-' + String.fromCharCode(97 + i);
      const subset = rows.filter(r => r.assigneeId === id);
      const res = subset.map(r => r.resolutionMin), frt = subset.map(r => r.frtMin);
      return { id, name, count: subset.length, avgResolutionMin: avg(res), medianResolutionMin: percentile(res, .5),
        p90ResolutionMin: percentile(res, .9),
        avgFrtMin: avg(frt), medianFrtMin: percentile(frt, .5),
        complaintCount: subset.filter(r => r.tags.some(t => t.includes('컴플레인'))).length,
        complaintHandled: subset.filter(r => r.tags.some(t => t.includes('컴플레인'))).length,
        operatorScore: Math.max(5, 88 - Math.round((avg(res) || 0) / 14)), touchScore: 56 + i * 7 };
    }).sort((a, b) => b.count - a.count);
    const heatmap = {};
    const hourLoad = Array(24).fill(0), weekdayLoad = Array(7).fill(0);
    rows.forEach(r => { const kst = new Date(r.createdAt + 9 * 3600000); const day = (kst.getUTCDay() + 6) % 7; const hour = kst.getUTCHours(); heatmap[day + '-' + hour] = (heatmap[day + '-' + hour] || 0) + 1; hourLoad[hour]++; weekdayLoad[day]++; });
    const tagResolutionStats = tagsSorted.map(([tag, count]) => {
      const subset = rows.filter(r => r.tags.includes(tag)).map(r => r.resolutionMin);
      return { tag, count, avg: avg(subset), median: percentile(subset, .5), p50: percentile(subset, .5), p90: percentile(subset, .9),
        avgResolutionMin: avg(subset), medianResolutionMin: percentile(subset, .5), p90ResolutionMin: percentile(subset, .9),
        slow8h: subset.filter(v => v >= 480).length, slow8hRate: Math.round(subset.filter(v => v >= 480).length / count * 100) };
    });
    const category = r => r.tags.some(t => t.includes('컴플레인')) ? 'complaint' : r.tags.some(t => t.includes('구독')) ? 'subscribe' : r.tags.includes('단순이용문의') ? 'inquiry' : r.tags.includes('미분류') ? 'unknown' : 'other';
    const complaintCategory = r => r.tags.some(t => t.includes('서비스')) ? 'service' : r.tags.some(t => t.includes('시스템')) ? 'system' : r.tags.some(t => t.includes('환불')) ? 'pricing' : 'other';
    const complaintCategories = countBy(complaints, complaintCategory);
    const complaintCategoryTrend = { labels };
    ['service', 'system', 'pricing', 'churn', 'other'].forEach(k => { complaintCategoryTrend[k] = labels.map(label => complaints.filter(r => shortDate(r.createdAt) === label && complaintCategory(r) === k).length); });
    const peakIndex = values.indexOf(Math.max(...values));
    const peakRows = rows.filter(r => shortDate(r.createdAt) === labels[peakIndex]);
    const userCounts = countBy(rows, r => r.userId);
    const repeat = Object.values(userCounts).filter(n => n > 1).length;
    const reopened = rows.filter(r => r.reopened).length;
    const prev = fixture.rows.filter(r => r.createdAt < cutoff && r.createdAt >= cutoff - range * DAY && matches(r, filters));
    const previousTotal = prev.length;
    const snapshotWow = { currentTotal: total, previousTotal, delta: total - previousTotal, deltaPct: previousTotal ? Math.round((total / previousTotal - 1) * 100) : null, baselineComplete: range <= 30 };
    const recent7 = fixture.rows.filter(r => r.createdAt >= fixture.midnight - 6 * DAY && matches(r, filters));
    const previous7 = fixture.rows.filter(r => r.createdAt < fixture.midnight - 6 * DAY && r.createdAt >= fixture.midnight - 13 * DAY && matches(r, filters));
    const peakHours = Array(24).fill(0);
    peakRows.forEach(r => peakHours[new Date(r.createdAt + 9 * 3600000).getUTCHours()]++);
    return {
      channel: { id: null, name: '가상 CS 채널' }, updatedAt: new Date(now).toISOString(),
      summary: { totalChats: total, openChats: open.length, unassignedChats: open.filter(r => !r.assigneeId).length,
        avgResolutionMin: avg(durations), peakDay: { label: labels[peakIndex], count: values[peakIndex] },
        peakDayCount: values[peakIndex], activeDayAvg: Math.round(total / (values.filter(Boolean).length || 1)),
        complaintCount: complaints.length, complaintRate: rate(complaints.length) },
      dailyTrend: { labels, values }, complaintTrend: { labels, total: values, complaints: complaintValues },
      sources: Object.fromEntries(sources.map(s => [s, rows.filter(r => r.source === s).length])),
      sourceStats: sources.map(source => { const subset = rows.filter(r => r.source === source).map(r => r.resolutionMin); return { source, count: subset.length, avgResolutionMin: avg(subset), medianResolutionMin: percentile(subset, .5), p90ResolutionMin: percentile(subset, .9) }; }),
      managers, tags: { labels: tagsSorted.map(r => r[0]), values: tagsSorted.map(r => r[1]) },
      heatmap, hourLoad, weekdayLoad, resolutionBuckets,
      resolutionStats: { avg: avg(durations), median: percentile(durations, .5), p75: percentile(durations, .75), p90: percentile(durations, .9), p95: percentile(durations, .95), avgEx8h: avg(durations.filter(v => v < 480)), agentHandleTimeAvailable: false, agentHandleTimeNote: '가상 해결시간에는 고객 대기 시간이 포함됩니다.' },
      frtStats: { avg: avg(frts), median: percentile(frts, .5), p90: percentile(frts, .9), sla5min: { rate: rate(frts.filter(v => v <= 5).length) } },
      slaStats: { sla30Min: sla(30), sla2Hour: sla(120), sla8Hour: sla(480) },
      longChats: rows.filter(r => r.resolutionMin >= 480), openChatList: open,
      agingBuckets: { lt8h: open.filter(r => r.ageMin < 480).length, h8_24: open.filter(r => r.ageMin >= 480 && r.ageMin < 1440).length, d1_3: open.filter(r => r.ageMin >= 1440 && r.ageMin < 4320).length, d3_7: open.filter(r => r.ageMin >= 4320 && r.ageMin < 10080).length, d7plus: open.filter(r => r.ageMin >= 10080).length },
      vocCategories: countBy(rows, category), complaintCategories, complaintCategoryTrend, tagResolutionStats,
      tagCooccurrence: [{ pair: ['컴플레인/서비스품질', '정기구독'], cnt: rows.filter(r => r.tags.includes('컴플레인/서비스품질') && r.tags.includes('정기구독')).length }],
      repeatStats: { total: Object.keys(userCounts).length, repeat, repeatRate: Object.keys(userCounts).length ? Math.round(repeat / Object.keys(userCounts).length * 100) : 0, avgChatsPerCustomer: Object.keys(userCounts).length ? +(total / Object.keys(userCounts).length).toFixed(1) : 0 },
      fcrStats: { available: true, fcrRate: total ? 100 - rate(reopened) : 0, reopenedCount: reopened, reopenedRate: rate(reopened), note: '가상 재오픈 이벤트 기반' },
      workingHoursStats: { businessIn: rows.filter(r => { const d = new Date(r.createdAt + 9 * 3600000); return d.getUTCDay() > 0 && d.getUTCDay() < 6 && d.getUTCHours() >= 9 && d.getUTCHours() < 19; }).length,
        businessOut: rows.filter(r => { const d = new Date(r.createdAt + 9 * 3600000); return !(d.getUTCDay() > 0 && d.getUTCDay() < 6 && d.getUTCHours() >= 9 && d.getUTCHours() < 19); }).length },
      peakAnalysis: { date: labels[peakIndex], count: values[peakIndex], topTags: Object.entries(countBy(peakRows, r => r.tags[0])).map(([tag, cnt]) => ({ tag, cnt })).sort((a, b) => b.cnt - a.cnt).slice(0, 3), topAssignees: Object.entries(countBy(peakRows, r => r.assigneeId)).map(([id, cnt]) => ({ id, cnt })), peakHour: { hour: peakHours.indexOf(Math.max(...peakHours)), cnt: Math.max(...peakHours) } },
      bots: [{ id: 'demo-bot', name: '가상 안내 봇', count: Math.round(total * .14) }], groups: [],
      taggingQuality: { unknownCount: rows.filter(r => r.tags.includes('미분류')).length, autoTaggingAvailable: false, blocker: '가상 태그 데이터 / 실제 본문 미수집' },
      snapshotStore: { enabled: true, count: 70, source: 'synthetic', message: '비식별 가상 데이터 70일' },
      snapshotWow, wow: snapshotWow,
      snapshotForecast: { last7Avg: Math.round(recent7.length / 7), last14Avg: Math.round(previous7.length / 7), momentum: previous7.length ? Math.round((recent7.length / previous7.length - 1) * 100) : 0, nextDayProjection: Math.round(recent7.length / 7) },
      anomalies: (() => { const q1 = percentile(values, .25), q3 = percentile(values, .75); const lower = Math.max(0, q1 - (q3 - q1) * 1.5), upper = q3 + (q3 - q1) * 1.5; return values.map((val,i) => ({label:labels[i],val,isHigh:val>upper,lower,upper})).filter(a=>a.val<lower || a.val>upper); })(),
      dataNote: { collected: fixture.rows.length, processed: total, limit: 2000, isSampled: false, currentPeriodComplete: true, baselineComplete: range <= 30, processedMinAt: cutoff, processedMaxAt: fixture.midnight, openChatsSampled: false },
      diagnostics: { cacheHit: false, cacheSource: 'synthetic', kvEnabled: false, totalMs: 0, paginationMs: 0, pages: 1, warnings: [], callTiming: [{ label: '로컬 가상 데이터', ok: true, status: 200, ms: 0 }] }
    };
  }
  window.PortfolioDemo = { create, records, avg, percentile };
})();
