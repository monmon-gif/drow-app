# drawSync

Socket.IOを使用したリアルタイムお絵かき同期アプリケーション

## 概要

複数のユーザーがリアルタイムで同じキャンバスにお絵かきできるWebアプリケーションです。描画データはRedisに保存され、ページをリロードしても描画内容が保持されます。

## 技術スタック

- **Node.js** - サーバーサイドランタイム
- **Express** - Webフレームワーク
- **Socket.IO** - リアルタイム双方向通信
- **Redis** - データキャッシュ（Redis Cloud）
- **EJS** - テンプレートエンジン

## ローカル開発

### 前提条件

- Node.js（v18以上推奨）
- Redis（ローカルにインストール、または Docker）

### セットアップ

```bash
# 依存関係のインストール
npm install

# Redisを起動（別ターミナルで）
redis-server

# アプリケーションを起動
npm start
```

ブラウザで http://localhost:3000 にアクセス

## Herokuへのデプロイ

### 前提条件

- Heroku CLI がインストール済み
- Heroku アカウントにログイン済み（`heroku login`）

### デプロイ手順

```bash
# 1. Herokuアプリを作成
heroku create [任意のアプリ名]

# 2. Redis Cloudアドオンを追加（無料プラン: 30MB）
heroku addons:create rediscloud:30

# 3. 環境変数が設定されたことを確認
heroku config
# REDISCLOUD_URL が表示されればOK

# 4. Herokuにデプロイ
git push heroku main

# 5. ログを確認
heroku logs --tail

# 6. アプリを開く
heroku open
```

### Redis Cloud 無料プランの仕様

| 項目 | 内容 |
|------|------|
| プラン名 | `rediscloud:30` |
| 料金 | 無料 |
| メモリ | 30MB |
| 同時接続数 | 30 |
| 注意点 | 30日間非アクティブだとリソースが削除される |

## Herokuアプリの管理

### アプリの停止

```bash
# Dynoを0にスケールダウン（アプリ停止）
heroku ps:scale web=0
```

### アプリの再開

```bash
heroku ps:scale web=1
```

### アプリの削除

```bash
# アプリ名を確認
heroku apps

# アプリを完全に削除（アドオンも一緒に削除される）
heroku apps:destroy --app [アプリ名] --confirm [アプリ名]
```

**注意:** 削除操作は取り消せません

## 修正履歴

### node-redis v4対応（2026年1月）

#### 変更理由
- node-redis v4以降でAPIが大幅に変更された
- `createClient()` だけでは接続されず、明示的に `connect()` が必要
- コールバック形式が廃止され、Promise形式に変更

#### 変更ファイル

**redis.js**
- `createClient()` の新しいAPI形式に変更
- `redis.connect()` を明示的に呼び出し
- エラーハンドリングと接続ログを追加
- 環境変数を `REDISCLOUD_URL` に変更（Redis Cloud対応）

**socketEvents.js**
- コールバック形式から `async/await` 形式に変更
- `redis.get()`, `redis.set()`, `redis.del()` を `await` で呼び出し
- 各Redis操作に `try/catch` でエラーハンドリングを追加

### Redis Cloud対応

以前使用していた Redis To Go（`REDISTOGO_URL`）は廃止されたため、Redis Cloud（`REDISCLOUD_URL`）に移行しました。

## ライセンス

ISC
