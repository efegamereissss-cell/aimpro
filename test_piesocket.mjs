const room = 'aimpro_test_room';
const url = `wss://free.blr2.piesocket.com/v3/${room}?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self=0`;

console.log('Connecting to:', url);
const ws1 = new WebSocket(url);
const ws2 = new WebSocket(url);

ws1.onopen = () => {
  console.log('WS 1 opened!');
  setTimeout(() => {
    ws1.send(JSON.stringify({ from: 'ws1', text: 'hello from ws1' }));
  }, 500);
};

ws2.onopen = () => {
  console.log('WS 2 opened!');
};

ws2.onmessage = (event) => {
  console.log('WS 2 received:', event.data);
  process.exit(0);
};

ws1.onerror = (e) => console.log('WS1 error:', e);
ws2.onerror = (e) => console.log('WS2 error:', e);

setTimeout(() => {
  console.log('Timeout after 4s');
  process.exit(1);
}, 4000);
