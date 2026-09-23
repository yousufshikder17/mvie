import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.js'],
        // Set before any module loads. db.js reads DB_DRIVER at import time and
        // builds its client immediately, so this cannot be done in a setup file.
        // dotenv does not overwrite variables that already exist, so a real .env
        // on the machine cannot leak a live database into the suite.
        env: {
            NODE_ENV: 'test',
            DB_DRIVER: 'pglite',
            DATABASE_URL: '',
            JWT_SECRET: 'test-only-secret-never-used-outside-vitest',
            JWT_EXPIRES_IN: '1d',
            // The suite makes far more than the production 100 requests per
            // window; without this the limiter starts returning 429 partway
            // through and tests fail for a reason unrelated to what they assert.
            RATE_LIMIT_MAX_REQUESTS: '1000000',
            RATE_LIMIT_WINDOW_MINUTES: '15',
            // Deliberately a DIFFERENT number from the one above, and still
            // far above what the suite needs. It has to stay lower so a test
            // can prove the stricter limiter is actually mounted on the
            // public routes rather than merely defined.
            PUBLIC_RATE_LIMIT_MAX_REQUESTS: '1000',
            PUBLIC_RATE_LIMIT_WINDOW_MINUTES: '5',
            // The suite registers a user per test and deliberately fails
            // logins, so both auth limiters need headroom here. Distinct
            // numbers again, so a test can prove which one it hit.
            AUTH_RATE_LIMIT_MAX_REQUESTS: '5000',
            AUTH_RATE_LIMIT_WINDOW_MINUTES: '15',
            REGISTER_RATE_LIMIT_MAX_REQUESTS: '5000',
            REGISTER_RATE_LIMIT_WINDOW_MINUTES: '60',
            // Fake keys so the suite never depends on a real .env. The adapters
            // refuse to run without a key before fetch is reached, and the tests
            // stub fetch, so these are never sent anywhere. Pinning them also
            // stops a local run from picking up the real keys.
            TMDB_ACCESS_TOKEN: 'test-tmdb-token',
            RAWG_API_KEY: 'test-rawg-key',
            // A throwaway pair made for the suite (web-push rejects malformed
            // keys). Not the production pair.
            VAPID_PUBLIC_KEY: 'BCovQGI7wfHpQPf2tOxvFoMgH1CL2X5cRqQc6ekewyhiqB-tBCKkCGKM6TF2y1HeUD9o6WDmoE-9Zgkru0ULEVY',
            VAPID_PRIVATE_KEY: 'CP7Qhu-ujFEGGeyh9HW1RE-SF3-Nhsb7FO0uBVbvnds',
            VAPID_SUBJECT: 'mailto:test@example.com',
        },
        // Every worker boots its own pglite, close to 1 GB each. Vitest's
        // default is one worker per core, which on a 16-core laptop tried to
        // take >10 GB and killed workers mid-run. Raise with --maxWorkers=N.
        maxWorkers: 2,
        // pglite compiles a WASM Postgres on first boot.
        testTimeout: 30000,
        hookTimeout: 30000,
    },
});
