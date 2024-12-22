import { createConnection } from './dushy-imdb-lib.js';

async function runExample() {
    const redis = createConnection('127.0.0.1', 6379);

    try {
        // String operations
        console.log('\n=== String Operations ===');
        await redis.set('value', "Hello, World!");
        const greeting = await redis.get('value');
        console.log('GET greeting:', greeting);

        // List operations
        console.log('\n=== List Operations ===');
        await redis.lpush('mylist', ['first', 'second']);
        await redis.rpush('mylist', ['third', 'fourth']);
        console.log('LPOP:', await redis.lpop('mylist'));
        console.log('RPOP:', await redis.rpop('mylist'));

        // Set operations
        console.log('\n=== Set Operations ===');
        await redis.sadd('myset', ['apple', 'banana', 'orange']);
        const members = await redis.smembers('myset');
        console.log('SMEMBERS:', members);

        // Hash operations
        console.log('\n=== Hash Operations ===');
        await redis.hset('user:1', 'name', 'John');
        await redis.hset('user:1', 'age', '30');
        console.log('HGET name:', await redis.hget('user:1', 'name'));
        console.log('HGET age:', await redis.hget('user:1', 'age'));

        // Pub/Sub operations
        console.log('\n=== Pub/Sub Operations ===');
        
        // Subscribe to different types of messages
        await redis.subscribe('string_channel', (message) => {
            console.log('Received string message:', message);
        });

        await redis.subscribe('json_channel', (message) => {
            console.log('Received JSON message:', message);
        });

        await redis.subscribe('binary_channel', (message) => {
            console.log('Received binary message:', message);
        });

        await redis.subscribe('int_channel', (message) => {
            console.log('Received integer message:', message);
        });

        await redis.subscribe('array_channel', (message) => {
            console.log('Received array message:', message);
        });

        // Publish different types of messages
        await redis.publishString('string_channel', 'Hello, World!');
        await redis.publishJSON('json_channel', { name: 'John', age: 30 });
        await redis.publishBinary('binary_channel', Buffer.from('Hello Binary!'));
        await redis.publishInt('int_channel', 42);
        await redis.publishArray('array_channel', [1, "two", { three: 3 }]);

    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the example
console.log('Starting Redis example...');
runExample().catch(console.error);
