import PocketBase from 'pocketbase';

// pulled from env at build time; falls back to local dev
const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';

const pb = new PocketBase(PB_URL);

// keep auth across page refreshes
pb.authStore.onChange(() => {
  // intentional no-op — pocketbase serialises to localStorage automatically
}, true);

export default pb;
