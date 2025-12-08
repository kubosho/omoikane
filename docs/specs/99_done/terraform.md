# TerraformによるAWS管理

## 目的

インフラ（Cognito, IAM, S3）を、Terraformを用いて管理する。

これにより、インフラ構成の可視性と変更容易性を高め、運用をしやすくする。

## 現状

- インフラをコードで管理していない
- AWSのWeb UIからインフラ構成を変更している

## 機能概要

Cognito・IAM・S3などのAWSリソースをTerraformで定義・管理する。

## 機能一覧

### Cognito

- **User Pool**:
  - ユーザー認証・管理を行う
  - **Identity Provider**: Google (OIDC) を設定し、Googleアカウントでのログインを可能にする
- **User Pool Client**:
  - アプリケーションがCognitoを利用するためのクライアント設定
- **Identity Pool**:
  - 認証されたユーザーに対して、AWSリソースへのアクセス権限（一時クレデンシャル）を付与する
  - User Pool および Google IdP と連携する

### IAM

- **Authenticated Role**:
  - Cognito Identity Pool で認証されたユーザーに割り当てるIAMロール
  - 認証済みユーザーのみがこのロールを引き受けられるようにする
  - S3へのアクセスはサーバーサイド（API Route）でこのロールの一時クレデンシャルを取得して行う。そのためS3操作権限を付与する

### S3

- **Bucket**:
  - 画像ファイルを保存するバケット
  - CORS設定：署名付きURLをクライアント側で使うため必要

## 変更対象のファイル

`tools/terraform/` ディレクトリ配下に以下のファイルを配置する。

- `main.tf`: リソース定義
- `variables.tf`: 変数定義（プロジェクト名、リージョン、Google Client ID/Secretなど）
- `outputs.tf`: 作成されたリソースのIDなど（必要に応じて）
- `providers.tf`: AWSプロバイダー設定

## 運用方法

ステート管理はローカル（`terraform.tfstate`）でおこなう。

機密情報が含まれるので、`terraform.tfstate` および `terraform.tfstate.backup` は `.gitignore` に追加する。
