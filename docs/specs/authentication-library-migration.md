# 認証ライブラリの変更 (Auth.js -> Better Auth)

## 目的

Auth.js（旧NextAuth.js）からBetter Authへライブラリを変更し、より柔軟な認証機能と拡張性を確保する。

## 現状

Auth.js（旧NextAuth.js）を使用して認証機能を実装している。

## 機能概要

アプリケーション内の認証ロジック、セッション管理、フックの利用箇所をAuth.jsからBetter Authに置き換える。

### 参考にするページ

- [Migrating from Auth.js to Better Auth](https://authjs.dev/getting-started/migrate-to-better-auth)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Better Auth Installation Guide](https://www.better-auth.com/docs/installation)
- [Better Auth Next.js Integration](https://www.better-auth.com/docs/integrations/next)
- [Better Auth Google Provider](https://www.better-auth.com/docs/authentication/google)

## 機能一覧

### パッケージ変更

- **削除**: `next-auth`
- **追加**: `better-auth`

### 環境変数の追加

- `BETTER_AUTH_SECRET`: 暗号化とハッシュに使用するシークレット値（32文字以上）
- `BETTER_AUTH_URL`: アプリケーションのベースURL

### 実装の変更点

#### 設定ファイル (`src/features/auth/auth.ts`)

- `NextAuth` の初期化コードを `betterAuth` に置き換える
- プロバイダー設定の記述方法を `socialProviders` に変更する

#### クライアント (`src/features/auth/auth-client.ts`) [新規]

- `createAuthClient` を使用してクライアントインスタンスを作成する
- `signIn`, `signOut`, `useSession` をエクスポートする

#### サーバーサイド認証 (`src/app/api/auth/[...auth]/route.ts`)

- Auth.js の `handlers` オブジェクトを使う方式から、Better Auth の `toNextJsHandler(auth)` を使う方式に変更する

#### コンポーネント

- `SignInButton` / `SignOutButton` で `authClient` のメソッドを直接呼び出すように変更する

## 変更対象のファイル

### 修正

- `package.json`
- `src/features/auth/auth.ts`
- `src/app/api/auth/[...auth]/route.ts`
- `src/features/auth/components/SignInButton/SignInButton.tsx`
- `src/features/auth/components/SignOutButton/SignOutButton.tsx`

### 新規作成

- `src/features/auth/auth-client.ts`

### 削除

- `src/features/auth/server-actions.ts`
- `src/features/auth/middleware.ts`
