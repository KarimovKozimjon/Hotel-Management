const fs = require('fs');

function readHar(path) {
  const raw = fs.readFileSync(path, 'utf8');
  return JSON.parse(raw);
}

function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

function summarizeHar(har, label) {
  const pages = har?.log?.pages ?? [];
  const entries = har?.log?.entries ?? [];

  const pageRows = pages.map((p) => ({
    id: p.id,
    title: p.title,
    onContentLoad: safeNum(p.pageTimings?.onContentLoad),
    onLoad: safeNum(p.pageTimings?.onLoad),
  }));

  const rows = entries.map((e) => {
    const time = safeNum(e.time) ?? 0;
    const wait = safeNum(e.timings?.wait);
    const started = Date.parse(e.startedDateTime || '');
    const end = Number.isFinite(started) ? started + time : null;

    return {
      method: e.request?.method,
      url: e.request?.url,
      status: e.response?.status,
      resource: e._resourceType,
      time,
      wait,
      started,
      end,
      pageref: e.pageref,
    };
  });

  const optionsCount = rows.filter((r) => r.method === 'OPTIONS').length;
  const span = (() => {
    const starts = rows.map((r) => r.started).filter(Number.isFinite);
    const ends = rows.map((r) => r.end).filter(Number.isFinite);
    if (!starts.length || !ends.length) return null;
    return Math.max(...ends) - Math.min(...starts);
  })();

  const topSlow = [...rows].sort((a, b) => b.time - a.time).slice(0, 10);
  const notif = rows
    .filter((r) => typeof r.url === 'string' && r.url.includes('/api/notifications'))
    .sort((a, b) => b.time - a.time);

  return {
    label,
    pageRows,
    entriesCount: rows.length,
    span,
    optionsCount,
    topSlow,
    notif,
  };
}

function formatMs(ms) {
  if (ms == null) return 'n/a';
  if (ms >= 1000) return (ms / 1000).toFixed(2) + 's';
  return ms.toFixed(0) + 'ms';
}

function printSummary(sum) {
  console.log('===', sum.label, '===');
  if (sum.pageRows.length) {
    console.log('Pages:');
    for (const p of sum.pageRows) {
      console.log(`- ${p.id} onLoad=${formatMs(p.onLoad)} onContentLoad=${formatMs(p.onContentLoad)} title=${p.title}`);
    }
  } else {
    console.log('Pages: (none)');
  }

  console.log('Entries:', sum.entriesCount);
  console.log('HAR span:', formatMs(sum.span));
  console.log('OPTIONS count:', sum.optionsCount);

  console.log('Top 10 slow requests:');
  for (const r of sum.topSlow) {
    console.log(`- ${formatMs(r.time)} wait=${formatMs(r.wait)} ${r.method} ${r.status} ${r.resource} ${r.url}`);
  }

  console.log('Notifications requests:');
  if (!sum.notif.length) {
    console.log('- (none)');
  } else {
    for (const r of sum.notif) {
      console.log(`- ${formatMs(r.time)} wait=${formatMs(r.wait)} ${r.method} ${r.status} ${r.url} (page=${r.pageref})`);
    }
  }
  console.log();
}

function main() {
  const [, , filePath, label] = process.argv;
  if (!filePath) {
    console.error('Usage: node scripts/har_summary.cjs <path-to-har> [label]');
    process.exit(2);
  }

  const har = readHar(filePath);
  const sum = summarizeHar(har, label || filePath);
  printSummary(sum);
}

main();
