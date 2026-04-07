const fs = require('fs');
const path = require('path');
const net = require('net');
const { execSync, spawn } = require('child_process');

const DEFAULT_PORT = Number(process.env.LIGHTHOUSE_PORT || 3100);
const DEFAULT_BASE_URL =
  process.env.LIGHTHOUSE_BASE_URL || `http://127.0.0.1:${DEFAULT_PORT}`;
const REPORTS_DIR = path.join(process.cwd(), '.tmp-lighthouse');
const STRICT_PERFECT_MODE = process.env.LIGHTHOUSE_STRICT_PERFECT === '1';

const LIGHTHOUSE_PAGES = [
  {
    label: 'auth',
    path: '/auth',
    categories: ['performance', 'accessibility', 'best-practices'],
    thresholds: {
      performance: 0.9,
      accessibility: 1,
      'best-practices': 1,
    },
  },
  {
    label: 'support',
    path: '/support',
    categories: ['performance', 'accessibility', 'best-practices', 'seo'],
    thresholds: {
      performance: 0.95,
      accessibility: 1,
      'best-practices': 1,
      seo: 1,
    },
  },
  {
    label: 'faq',
    path: '/faq',
    categories: ['performance', 'accessibility', 'best-practices', 'seo'],
    thresholds: {
      performance: 0.95,
      accessibility: 1,
      'best-practices': 1,
      seo: 1,
    },
  },
];

function resolveThresholds(page) {
  if (!STRICT_PERFECT_MODE) {
    return page.thresholds;
  }

  return Object.fromEntries(page.categories.map((category) => [category, 1]));
}

function resolveChromePath() {
  const candidates = process.platform === 'win32'
    ? [
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
      ]
    : [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function ensureReportsDir() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function waitForPort(port, host = '127.0.0.1', timeoutMs = 60000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.connect(port, host);

      socket.once('connect', () => {
        socket.end();
        resolve();
      });

      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Server did not start on ${host}:${port} within ${timeoutMs}ms`));
          return;
        }

        setTimeout(tryConnect, 500);
      });
    };

    tryConnect();
  });
}

function startProductionServer(port) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args =
    process.platform === 'win32'
      ? ['/c', `npm run start -- --port ${port}`]
      : ['run', 'start', '--', '--port', String(port)];

  const server = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const logPath = path.join(REPORTS_DIR, 'lighthouse-server.log');
  const logStream = fs.createWriteStream(logPath, { flags: 'a' });

  server.stdout.on('data', (chunk) => logStream.write(chunk));
  server.stderr.on('data', (chunk) => logStream.write(chunk));

  return { server, logStream, logPath };
}

function stopProductionServer(server) {
  if (!server || server.killed) {
    return;
  }

  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${server.pid} /t /f`, { stdio: 'ignore' });
    } catch {
      server.kill();
    }
    return;
  }

  server.kill('SIGTERM');
}

function formatScore(score) {
  return Math.round((score || 0) * 100);
}

async function safeKillChrome(chrome) {
  if (!chrome) {
    return;
  }

  try {
    await chrome.kill();
  } catch (error) {
    if (error && typeof error.message === 'string' && error.message.includes('EPERM')) {
      console.warn(`⚠️  Ignoring Chrome cleanup warning: ${error.message}`);
      return;
    }

    throw error;
  }
}

async function run() {
  ensureReportsDir();

  if (!process.env.LIGHTHOUSE_SKIP_BUILD) {
    console.log('🏗️  Building production bundle for Lighthouse...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  const chromePath = resolveChromePath();
  if (!chromePath) {
    throw new Error('No compatible Chrome/Chromium executable found for Lighthouse.');
  }

  const { default: lighthouse } = await import('lighthouse');
  const { launch } = await import('chrome-launcher');

  const { server, logStream, logPath } = startProductionServer(DEFAULT_PORT);

  try {
    console.log(`🚀 Starting Next.js production server on ${DEFAULT_BASE_URL}...`);
    await waitForPort(DEFAULT_PORT);

    const chrome = await launch({
      chromePath,
      chromeFlags: ['--headless=new', '--disable-dev-shm-usage', '--no-sandbox'],
    });

    try {
      const summary = [];
      let hasFailures = false;

      for (const page of LIGHTHOUSE_PAGES) {
        const url = new URL(page.path, DEFAULT_BASE_URL).toString();
        console.log(`🔎 Auditing ${url}`);

        const result = await lighthouse(url, {
          port: chrome.port,
          logLevel: 'error',
          output: 'json',
          onlyCategories: page.categories,
          emulatedFormFactor: 'mobile',
          screenEmulation: {
            mobile: true,
            width: 390,
            height: 844,
            deviceScaleFactor: 3,
            disabled: false,
          },
        });

        const reportPath = path.join(REPORTS_DIR, `${page.label}.json`);
        fs.writeFileSync(reportPath, result.report);

        const categoryScores = Object.fromEntries(
          page.categories.map((category) => [category, result.lhr.categories[category].score])
        );

        const thresholds = resolveThresholds(page);

        const failures = Object.entries(thresholds)
          .filter(([key, threshold]) => (categoryScores[key] ?? 0) < threshold)
          .map(([key, threshold]) => ({
            category: key,
            expected: formatScore(threshold),
            actual: formatScore(categoryScores[key]),
          }));

        if (failures.length > 0) {
          hasFailures = true;
        }

        summary.push({
          label: page.label,
          url,
          scores: Object.fromEntries(
            Object.entries(categoryScores).map(([key, value]) => [key, formatScore(value)])
          ),
          thresholds: Object.fromEntries(
            Object.entries(thresholds).map(([key, value]) => [key, formatScore(value)])
          ),
          failures,
        });
      }

      const summaryPath = path.join(REPORTS_DIR, 'summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

      console.log('\n📋 Lighthouse summary');
      console.table(
        summary.map((entry) => ({
          page: entry.label,
          performance: entry.scores.performance ?? 'n/a',
          accessibility: entry.scores.accessibility ?? 'n/a',
          'best-practices': entry.scores['best-practices'] ?? 'n/a',
          seo: entry.scores.seo ?? 'n/a',
        }))
      );

      if (hasFailures) {
        console.error(`\n❌ Lighthouse thresholds failed. See ${summaryPath}`);
        process.exitCode = 1;
        return;
      }

      console.log(`\n✅ Lighthouse thresholds passed. Reports: ${summaryPath}`);
    } finally {
      await safeKillChrome(chrome);
    }
  } finally {
    stopProductionServer(server);
    logStream.end();
    console.log(`🧾 Server logs written to ${logPath}`);
  }
}

run().catch((error) => {
  console.error('\n❌ Lighthouse guardrails failed:', error.message);
  process.exitCode = 1;
});
