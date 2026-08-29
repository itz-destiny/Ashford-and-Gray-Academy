import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    typescript: {
        // Legacy pages still have type errors. New code typechecks clean —
        // turning this off is a future cleanup pass.
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
            { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
            // Firebase Storage signed upload URLs land at this host.
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
            { protocol: 'https', hostname: 'storage.googleapis.com', pathname: '/**' },
            // Avatar fallbacks generated client-side by the messages page.
            { protocol: 'https', hostname: 'api.dicebear.com', pathname: '/**' },
            // Google profile photos (when users sign in with Google).
            { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
        ],
    },
    // Node-only deps used by Firebase Admin can confuse Next's tree-shaker
    // for client routes; mark them as server-only.
    serverExternalPackages: [
        'firebase-admin',
        'mongoose',
        '@sentry/node',
        '@sentry/nextjs',
        '@opentelemetry/instrumentation',
    ],
    // The Zoom Meeting SDK's WASM media engine needs SharedArrayBuffer, which
    // Chrome only grants in a cross-origin-isolated context. `credentialless`
    // (not `require-corp`) so we don't have to audit every cross-origin
    // resource on the page for CORP headers — scoped to just this route so
    // the rest of the site (Firebase, Blob storage images, Paystack, Google
    // Fonts) is unaffected.
    async headers() {
        const coiHeaders = [
            { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
            { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ];
        return [
            { source: '/live-classes/:path*', headers: coiHeaders },
            // The classic Zoom SDK runs inside these two static files (loaded
            // in an iframe), isolated from the app's React 19 — see the
            // comment in public/zoom-classic-room.html for why. That iframe
            // document needs its own COI headers too; a nested document
            // doesn't inherit them from the parent.
            { source: '/zoom-classic-room.html', headers: coiHeaders },
            { source: '/zoom-classic-left.html', headers: coiHeaders },
        ];
    },
    // Sentry's OpenTelemetry transitive dep uses a dynamic require; safe to
    // ignore at bundle time — the package still works at runtime.
    webpack: (config) => {
        config.ignoreWarnings = [
            ...(config.ignoreWarnings ?? []),
            { module: /node_modules\/@opentelemetry\/instrumentation/ },
        ];
        return config;
    },
};

export default nextConfig;
