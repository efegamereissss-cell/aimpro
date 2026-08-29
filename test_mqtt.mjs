import mqtt from 'mqtt';

console.log('Testing MQTT broker connection...');
const topic = 'aimpro/dm/test_channel_123';

const client1 = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
  clientId: 'test_client_1_' + Math.random().toString(16).substring(2, 8),
  clean: true,
  connectTimeout: 4000
});

const client2 = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
  clientId: 'test_client_2_' + Math.random().toString(16).substring(2, 8),
  clean: true,
  connectTimeout: 4000
});

client1.on('connect', () => {
  console.log('Client 1 connected to MQTT broker!');
  client1.subscribe(topic, () => {
    console.log('Client 1 subscribed to topic:', topic);
  });
});

client2.on('connect', () => {
  console.log('Client 2 connected to MQTT broker!');
  client2.subscribe(topic, () => {
    console.log('Client 2 subscribed to topic:', topic);
    setTimeout(() => {
      console.log('Client 2 publishing test message...');
      client2.publish(topic, JSON.stringify({ hello: 'world', from: 'client2' }));
    }, 500);
  });
});

client1.on('message', (t, msg) => {
  console.log('SUCCESS! Client 1 received message from Client 2:', msg.toString());
  client1.end();
  client2.end();
  process.exit(0);
});

setTimeout(() => {
  console.log('Timeout failed');
  client1.end();
  client2.end();
  process.exit(1);
}, 8000);
