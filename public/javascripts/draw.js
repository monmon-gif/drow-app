/* global hostname,$,io */
'use strict';

hostname = (hostname === 'localhost')
  ? 'http://' + hostname + ':3000'
  : 'https://' + hostname;

var socket = io.connect(hostname);

window.addEventListener('load', function () {
  var canvas = document.getElementById("main");
  var c = canvas.getContext("2d");

  // CSSで決めた表示サイズに合わせて、描画用サイズも同じにする
  var w = $('canvas').width();
  var h = $('canvas').height();
  canvas.width = w;
  canvas.height = h;

  var drawing = false;
  var pos;

  var COLORS = {
    red: '#FF0000',
    yellow: '#FFFF00',
    blue: '#0000FF',
    green: '#008000',
    purple: '#800080',
    white: '#FFFFFF',
    black: '#000000'
  };

  // 通常ペン太さ / 消しゴム太さ
  var PEN_WIDTH = 6;
  var ERASER_WIDTH = 20;

  var drawColor = COLORS.black;
  var erasing = false;

  c.lineJoin = "round";
  c.lineCap = "round";
  c.lineWidth = PEN_WIDTH;

  // ====== 入力（マウス） ======
  canvas.addEventListener("mousedown", function (event) {
    drawing = true;
    pos = getPosT(event);
  }, false);

  canvas.addEventListener("mouseup", function () {
    drawing = false;
    socket.emit('drawEnd');
  }, false);

  // ====== 入力（タッチ/ペン含む pointer） ======
  canvas.addEventListener("pointerdown", function (event) {
    drawing = true;
    pos = getPosT(event);
  });

  canvas.addEventListener("pointermove", function (event) {
    if (!drawing) return;

    var newPos = getPosT(event);

    // 自分の画面に描く
    drawStroke(pos, newPos, drawColor, erasing);

    // 相手にも送る（消しゴム状態も送る）
    socket.emit('draw', {
      pos: pos,
      newPos: newPos,
      drawColor: drawColor,
      erasing: erasing
    });

    pos = newPos;
  });

  canvas.addEventListener("pointerup", function () {
    drawing = false;
  });

  canvas.addEventListener("pointerleave", function () {
    drawing = false;
  });

  // ====== 描画関数（受信側にも使う） ======
  function drawStroke(pos, newPos, color, isErasing) {
    // 消しゴムなら「透明で削る」
    c.globalCompositeOperation = isErasing ? "destination-out" : "source-over";

    // 太さ切替
    c.lineWidth = isErasing ? ERASER_WIDTH : PEN_WIDTH;

    // 消しゴム中は色は実質関係ないが、通常時に使う
    c.strokeStyle = color;

    c.beginPath();
    c.moveTo(pos.x, pos.y);
    c.lineTo(newPos.x, newPos.y);
    c.stroke();
    c.closePath();

    // 念のため戻しておく（他の処理に影響させない）
    c.globalCompositeOperation = "source-over";
  }

  // ずれない座標
  function getPosT(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function clear() {
    c.clearRect(0, 0, canvas.width, canvas.height);
  }

  // ====== 色クリック：白なら消しゴム ======
  $('li').click(function () {
    var colorKey = $(this).attr('id');   // "red" など
    drawColor = COLORS[colorKey];

    // 白を選んだら消しゴムモード
    erasing = (colorKey === "white");

    console.log("color=", drawColor, "erasing=", erasing);
  });

  // ====== 全消し ======
  $('#clear').click(function () {
    socket.emit('clear');
    clear();
  });

  // ====== socket受信 ======
  socket.on('init', function (cache) {
    cache.forEach(function (drawData) {
      // 既存データに erasing がない場合も想定して false
      drawStroke(drawData.pos, drawData.newPos, drawData.drawColor, !!drawData.erasing);
    });
  });

  socket.on('draw', function (data) {
    drawStroke(data.pos, data.newPos, data.drawColor, !!data.erasing);
  });

  socket.on('clear', function () {
    clear();
  });
});
