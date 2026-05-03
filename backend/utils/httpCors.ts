/** Comma-separated list in ADDITIONAL_CORS_ORIGINS, e.g. https://prod.vercel.app,https://branch.vercel.app */

function hostnameFrom(origin: string): string | null {
  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isTrustedVercelHost(host: string) {
  return host === 'vercel.app' || host.endsWith('.vercel.app');
}

function buildAllowlist(): Set<string> {
  const extras = String(process.env.ADDITIONAL_CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const set = new Set<string>();
  const push = (s?: string) => {
    if (s && s.length) set.add(s);
  };

  push(process.env.FRONTEND_URL?.replace(/\/$/, ''));
  push(process.env.CLIENT_URL?.replace(/\/$/, ''));

  for (const raw of extras) {
    push(raw.replace(/\/$/, ''));
  }

  push('http://localhost:5173');
  push('http://localhost:3000');
  push('http://127.0.0.1:5173');
  push('http://127.0.0.1:3000');

  return set;
}

const allowlisted = () => buildAllowlist();

/** When true (default in prod if unset — see server.ts): echo request Origin when host is allowlisted OR any *.vercel.app */
export function isProductionOriginAllowed(origin: string | undefined, mode: 'default' | 'relaxed'): boolean {
  if (!origin) return true;

  const host = hostnameFrom(origin);
  if (!host) return mode === 'relaxed';

  if (mode === 'relaxed') return true;

  const list = allowlisted();
  if (list.has(origin)) return true;
  return isTrustedVercelHost(host);
}
