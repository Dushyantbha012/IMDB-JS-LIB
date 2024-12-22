import net from 'net';

export function createConnection(host = '127.0.0.1', port = 6379) {
  const client = new net.Socket();
  let responseQueue = [];
  let subscriptions = {};

  client.connect(port, host, () => {
    console.log('Connected to Redis server');
  });

  client.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Handle pub/sub messages
      if (line.startsWith('Message')) {
        const [_, channel, jsonStr] = line.match(/Message (\S+) (.+)/) || [];
        if (channel && jsonStr && subscriptions[channel]) {
          try {
            const message = JSON.parse(jsonStr);
            subscriptions[channel].forEach(cb => {
              switch (message.Type) {
                case 0: // StringMessage
                  cb(message.Content);
                  break;
                case 1: // JSONMessage
                  cb(message.Content);
                  break;
                case 2: // BinaryMessage
                  cb(Buffer.from(message.Content));
                  break;
                case 3: // IntegerMessage
                  cb(parseInt(message.Content, 10));
                  break;
                case 4: // ArrayMessage
                  cb(message.Content);
                  break;
                default:
                  cb(message.Content);
              }
            });
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        }
        continue;
      }
      
      // Handle regular responses
      const resolveFn = responseQueue.shift();
      if (resolveFn) resolveFn(line.trim());
    }
  });

  function sendCommand(command) {
    return new Promise((resolve) => {
      responseQueue.push(resolve);
      client.write(command + '\n');
    });
  }

  // Example command wrappers
  async function set(key, value) {
    // Properly escape and quote the value if it's a string
    const quotedValue = typeof value === 'string' ? 
      `"${value.replace(/"/g, '\\"')}"` : value;
    const res = await sendCommand(`SET ${key} ${quotedValue}`);
    return res === 'OK';
  }

  async function get(key) {
    const res = await sendCommand(`GET ${key}`);
    return res === '(nil)' ? null : res;
  }

  async function lpush(key, values) {
    if (!Array.isArray(values)) return 0;
    const cmd = `LPUSH ${key} ${values.join(' ')}`;
    const res = await sendCommand(cmd);
    return parseInt(res, 10) || 0;
  }

  async function rpush(key, values) {
    if (!Array.isArray(values)) return 0;
    const cmd = `RPUSH ${key} ${values.join(' ')}`;
    const res = await sendCommand(cmd);
    return parseInt(res, 10) || 0;
  }

  async function lpop(key) {
    const res = await sendCommand(`LPOP ${key}`);
    return res === '(nil)' ? null : res;
  }

  async function rpop(key) {
    const res = await sendCommand(`RPOP ${key}`);
    return res === '(nil)' ? null : res;
  }

  async function sadd(key, members) {
    if (!Array.isArray(members)) return 0;
    const cmd = `SADD ${key} ${members.join(' ')}`;
    const res = await sendCommand(cmd);
    return parseInt(res, 10) || 0;
  }

  async function smembers(key) {
    const res = await sendCommand(`SMEMBERS ${key}`);
    return res === '(nil)' ? null : res.split(' ');
  }

  async function hset(key, field, value) {
    const res = await sendCommand(`HSET ${key} ${field} ${value}`);
    return res === 'OK';
  }

  async function hget(key, field) {
    const res = await sendCommand(`HGET ${key} ${field}`);
    return res === '(nil)' ? null : res;
  }

  async function subscribe(channel, callback) {
    subscriptions[channel] = subscriptions[channel] || [];
    subscriptions[channel].push(callback);
    const res = await sendCommand(`SUBSCRIBE ${channel}`);
    return res === 'OK';
  }

  async function publish(channel, message) {
    const res = await sendCommand(`PUBLISH ${channel} ${message}`);
    return res === 'OK';
  }

  async function publishString(channel, message) {
    const res = await sendCommand(`PUBLISH ${channel} ${message}`);
    return res === 'OK';
  }

  async function publishJSON(channel, data) {
    const res = await sendCommand(`PUBLISH_JSON ${channel} ${JSON.stringify(data)}`);
    return res === 'OK';
  }

  async function publishInt(channel, number) {
    const res = await sendCommand(`PUBLISH_INT ${channel} ${number}`);
    return res === 'OK';
  }

  async function publishBinary(channel, data) {
    if (data instanceof Buffer) {
      data = data.toString('base64');
    }
    const res = await sendCommand(`PUBLISH_BIN ${channel} ${data}`);
    return res === 'OK';
  }

  async function publishArray(channel, array) {
    const jsonArr = JSON.stringify(array);
    const res = await sendCommand(`PUBLISH_ARRAY ${channel} ${jsonArr}`);
    return res === 'OK';
  }

  // Return object exposing methods
  return {
    set,
    get,
    lpush,
    rpush,
    lpop,
    rpop,
    sadd,
    smembers,
    hset,
    hget,
    subscribe,
    publish,
    publishString,
    publishJSON,
    publishInt,
    publishBinary,
    publishArray
  };
}
