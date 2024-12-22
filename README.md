# Dushy Redis Client Library

A lightweight Redis client implementation in JavaScript supporting basic Redis operations and pub/sub with multiple data types.

## Installation

```bash
npm install dushy-imdb-lib
```

## Usage

```javascript
import { createConnection } from 'dushy-imdb-lib';

const redis = createConnection('127.0.0.1', 6379);
```

## Supported Operations

### String Operations
```javascript
await redis.set('key', 'value');
const value = await redis.get('key');
```

### List Operations
```javascript
await redis.lpush('mylist', ['first', 'second']);
await redis.rpush('mylist', ['third', 'fourth']);
const leftItem = await redis.lpop('mylist');
const rightItem = await redis.rpop('mylist');
```

### Set Operations
```javascript
await redis.sadd('myset', ['item1', 'item2']);
const members = await redis.smembers('myset');
```

### Hash Operations
```javascript
await redis.hset('user:1', 'name', 'John');
const value = await redis.hget('user:1', 'name');
```

### Pub/Sub Operations

Subscribe to channels:
```javascript
await redis.subscribe('mychannel', (message) => {
    console.log('Received:', message);
});
```

Publish different data types:
```javascript
// String
await redis.publishString('channel', 'Hello World');

// JSON
await redis.publishJSON('channel', { name: 'John', age: 30 });

// Binary
await redis.publishBinary('channel', Buffer.from('Hello Binary!'));

// Integer
await redis.publishInt('channel', 42);

// Array
await redis.publishArray('channel', [1, "two", { three: 3 }]);
```

## Error Handling

The library uses Promise-based error handling:

```javascript
try {
    await redis.set('key', 'value');
} catch (error) {
    console.error('Redis operation failed:', error);
}
```

## License

APACHE-2.0 License
