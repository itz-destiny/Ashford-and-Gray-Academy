// Loaded by Next.js once per runtime (server / edge). Wires Sentry if a DSN
// is configured; otherwise this file is a no-op.
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('../sentry.server.config');
    }
    if (process.env.NEXT_RUNTIME === 'edge') {
        await import('../sentry.edge.config');
    }
}
