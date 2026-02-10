'use strict';

const { createClient } = require('redis');

let redis;

// Redis Cloud（Heroku addon）の設定（環境変数REDISCLOUD_URLを使用）
if (process.env.REDISCLOUD_URL) {
    redis = createClient({
        url: process.env.REDISCLOUD_URL
    });
} else {
    // ローカル開発環境
    redis = createClient();
}

// 接続を確立
redis.connect().catch(console.error);

// エラーハンドリング
redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis connected'));

module.exports = redis;
