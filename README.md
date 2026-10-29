# omoikane (思金)

<https://blog.kubosho.com> で使う画像を管理するツールです。

## セットアップ

### 環境変数

このプロジェクトでは、[dotenvx](https://dotenvx.com/) を使って環境変数を暗号化して管理しています。`.env` ファイルは暗号化した状態でリポジトリにコミットしています。

アプリケーションを動かすには、復号用の鍵が必要です。

1. プロジェクト管理者から `DOTENV_PRIVATE_KEY` を受け取ります。
2. ルートディレクトリに `.env.keys` ファイルを作り、鍵を書き込みます。

```bash
DOTENV_PRIVATE_KEY="your_private_key_here"
```

### ログインできるアカウントの追加

ログインできるのは、環境変数 `ALLOWED_EMAILS` に登録したメールアドレスのアカウントだけです。`ALLOWED_EMAILS` が空の場合は、どのアカウントもログインできません。

アカウントを追加するときは、今の値を確認してから、新しいメールアドレスをカンマ区切りで足して設定し直します。`dotenvx set` は値を上書きするため、既存のメールアドレスも含めて指定します。

```bash
npx dotenvx get ALLOWED_EMAILS -f .env
npx dotenvx set ALLOWED_EMAILS "existing@example.com,new@example.com" -f .env
```

`.env` を変更したあとは、開発サーバーを再起動すると反映されます。

### AWSの設定

AWSのリソースを管理するには、AWS CLIのプロファイルとリージョンを設定する必要があります。環境変数を自動で読み込めるように、[direnv](https://direnv.net/) の利用をお勧めします。

#### 方法1: direnvを使う（推奨）

`direnv` をインストールし、プロジェクトルートの `.envrc` を作成または編集します。

```bash
export AWS_PROFILE="{YOUR_AWS_PROFILE}"
export AWS_DEFAULT_REGION="{YOUR_AWS_REGION}"
```

設定を許可します。

```bash
direnv allow
```

#### 方法2: 手動でexportする

direnvを使わない場合は、TerraformやAWSのコマンドを実行する前に、変数を手動でexportする必要があります。

```bash
export AWS_PROFILE="{YOUR_AWS_PROFILE}"
export AWS_DEFAULT_REGION="{YOUR_AWS_REGION}"
```

## 開発

開発サーバーを起動します。

```bash
npm run dev
```

アプリケーションをビルドします。

```bash
npm run build
```

コードをlintします。

```bash
npm run lint
```

テストを実行します。

```bash
npm run test
```

Storybookを起動します。

```bash
npm run storybook
```
