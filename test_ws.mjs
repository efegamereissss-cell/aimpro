import WebSocket from 'ws';

console.log('Testing WebSocket connection...');
// Public free fast broker: wss://broker.emqx.io:8084/mqtt or direct ws
const ws = new WebSocket('wss://echo.websocket.org');
ws.on('open', () => {
  console.log('Echo WebSocket open!');
  ws.send(JSON.stringify({ test: 'hello' }));
});
ws.on('message', (data) => {
  console.log('Received echo message:', data.toString());
  process.exit(0);
});
ws.on('error', (err) => {
  console.error('WS error:', err);
});
