# サインイン時にServer Actionsを実行する際、Vercel側でエラーが出る

## 概要

トップページから認証POSTリクエストを実行した際に、以下のレスポンスが返る。

```text
0:{"a":"$@1","f":"","b":"goCXZbGf2knXc2vEuuvD7"}
1:"https://omoikane.kubosho.com/?error=Configuration"
```

またVercel側のログには以下のログが記録されている。
「only HTTP and HTTPS requests are allowed」

React Server Error側の処理が何か上手くいっていないように見える。

## 前提

- Vercel側には環境変数 `DOTENV_PRIVATE_KEY` を登録しており、デプロイログにも複合できているログが流れている
- `AUTH_COGNITO_ISSUER` の形式は問題ない（`dotenvx decrypt` を実行して確認した）
- Auth.jsはメンテナンスモードに入ったため、他のライブラリに置き換える予定。そのためAuth.jsの挙動に任せる方法で修正はしたくない
  - Auth.jsの置き換えは一旦考えない

## 調査

AUTH_TRUST_HOSTとAUTH_URLは必要ないはず：

> AUTH_TRUST_HOST
> When deploying your application behind a reverse proxy, you’ll need to set AUTH_TRUST_HOST equal to true. This tells Auth.js to trust the X-Forwarded-Host header from the reverse proxy. Auth.js will automatically infer this to be true if we detect the environment variable indicating that your application is running on one of the supported hosting providers. Currently VERCEL and CF_PAGES (Cloudflare Pages) are supported.
> AUTH_URL
> This environment variable is mostly unnecessary with v5 as the host is inferred from the request headers. However, if you are using a different base path, you can set this environment variable as well. For example, AUTH_URL=<http://localhost:3000/web/auth> or AUTH_URL=<https://company.com/app1/auth>

## 留意事項

Next.jsのredirect処理は以下の内容を留意して実装する必要がある：

> - In Server Actions and Route Handlers, redirect should be called outside the try block when using try/catch statements.
> - redirect throws an error so it should be called outside the try block when using try/catch statements.
> - redirect can be called in Client Components during the rendering process but not in event handlers. You can use the useRouter hook instead.

またVercel側でAUTH_SECRETは正しく設定されている。なぜならdotenvxを使って `.env` の内容をVercel側で読み込むようにしているため。
