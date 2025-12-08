# 画像管理ツールへの認可機能追加

## 目的

認可機能を追加し、特定のユーザー以外は画像アップロード・削除をできなくする。

## 現状

- Google認証は実装済み
- 認可の仕組みがない
- Google認証さえすればAWS S3に対する操作が誰でもできる
  - 画像取得
  - 画像投稿・更新
  - 画像削除

## 機能概要

認可されたユーザーに対してのみ、画像のアップロード・削除操作を許可する。

あらかじめ許可したメールアドレス（Allow List）に含まれるユーザーのみ認証できるように制限する。

- 認証方式の詳細は [authentication-library-migration.md](./authentication-library-migration.md) を参照
- インフラ構成は [terraform.md](./terraform.md) を参照

### 認可フロー

1. 認証・認可チェック
   1. クライアントサイドでユーザーがログインしているか確認する
   2. 認可されていることを認証する
2. APIリクエスト
   1. 画像アップロード・削除のリクエストを Next.js の API Route に送信する
   2. リクエストには認証セッション（Cookie等）が含まれる
3. サーバーサイド認証 & 実行
   1. API Route 内でセッションを検証し、必要な認可を持ったユーザーであることを確認する
   2. 認可済みユーザーであることの確認が取れたら、サーバーサイドの AWS クレデンシャルを使用して S3 操作（`PutObject`, `DeleteObject`）を実行する

## 機能一覧

### クライアントサイド

- 画像アップロードボタン (`ImageUploadButton`)
  - 認可されていないユーザーに対しては、無効化（Disabled）する
  - 認可されているユーザーに対しては、画像アップロード機能を提供する
    - API Routeは `/api/images/upload` を呼び出す
- 画像削除ボタン (`TrashButton`)
  - 認可されていないユーザーに対しては、無効化（Disabled）する
  - 認可されているユーザーに対しては、画像を削除機能を提供する
    - API Routeは `/api/images/delete` を呼び出す

### サーバーサイド

- `src/app/api/images/upload/route.ts`
  - 認証ライブラリを使って、セッションを検証する
  - セッションが認証済みの場合は、S3へのアップロード・更新処理を実行する
- `src/app/api/images/delete/route.ts`
  - 認証ライブラリを使って、セッションを検証する
  - セッションが認証済みの場合は、S3からの削除処理を実行する

## 変更対象のファイル

- `src/features/album/components/ImageUploadButton/ImageUploadButton.tsx`
- `src/features/album/components/TrashButton/TrashButton.tsx`
- `src/app/api/images/upload/route.ts` (認証ロジック追加)
- `src/app/api/images/delete/route.ts` (認証ロジック追加)
- `tools/terraform/`: 新規作成 (main.tf, variables.tf, etc.)
