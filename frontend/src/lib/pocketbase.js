import PocketBase from 'pocketbase';

// Pulled from env at build time; falls back to local dev.
// IMPORTANT: set VITE_PB_URL in your .env / .env.production before building,
// otherwise the app will try to reach PocketBase on localhost in production.
const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';

const pb = new PocketBase(PB_URL);

// keep auth across page refreshes
pb.authStore.onChange(() => {
  // intentional no-op — pocketbase serialises to localStorage automatically
}, true);

export default pb;
