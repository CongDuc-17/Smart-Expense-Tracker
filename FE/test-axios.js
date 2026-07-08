import axios from 'axios';
axios.interceptors.request.use((config) => {
  throw new Error('Sync error in interceptor');
});
axios.post('http://example.com').then(() => console.log('Resolved')).catch(e => console.log('Caught:', e.message));
