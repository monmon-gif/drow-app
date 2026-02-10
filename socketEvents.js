'use strict';

var redis = require('./redis');

module.exports = function (io) {
  var cache = [];
  io.on('connection', async function (socket) {
    console.log('connected!!');

    // 接続された時にredisに保存されたデータをcacheに入れる
    try {
      const result = await redis.get('drawCache');
      if (result) {
        console.log('>>>>', result);
        cache = JSON.parse(result);
      } else {
        cache = [];
      }
    } catch (err) {
      console.error('Redis get error:', err);
      cache = [];
    }

    socket.emit('init', cache);

    // canvasに描画されたときに送られてくるデータ
    socket.on('draw', function (data) {
      socket.broadcast.emit('draw', data);
      cache.push(data);
    });

    // drawごとにredisに書き込んでいると負荷が大きいのでマウスを話した時のイベントに設定する
    socket.on('drawEnd', async function () {
      // objectをJSON.stringifyしないといけない
      try {
        await redis.set('drawCache', JSON.stringify(cache));
      } catch (err) {
        console.error('Redis set error:', err);
      }
    });

    // CLEARボタンを押されたらcacheをクリアしてredisのデータを消す
    socket.on('clear', async function () {
      socket.broadcast.emit('clear');
      cache = [];
      try {
        await redis.del('drawCache');
      } catch (err) {
        console.error('Redis del error:', err);
      }
    });
  });
};
