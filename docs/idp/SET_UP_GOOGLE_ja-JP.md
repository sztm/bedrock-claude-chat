# Google の外部 ID プロバイダーを設定する

## ステップ1: Google OAuth 2.0 クライアントの作成

1. Google Developer Consoleにアクセスします。
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択します。
3. 「認証情報」に移動し、「認証情報を作成」をクリックして、「OAuth クライアントID」を選択します。
4. プロンプトが表示された場合、同意画面を設定します。
5. アプリケーションの種類で「ウェブアプリケーション」を選択します。
6. リダイレクトURIは現時点では空白のままにし、後で設定するために一時的に保存します。[ステップ5を参照](#step-5-update-google-oauth-client-with-cognito-redirect-uris)
7. 作成後、クライアントIDとクライアントシークレットをメモしておきます。

詳細については、[Googleの公式ドキュメント](https://support.google.com/cloud/answer/6158849?hl=en)を参照してください。

## ステップ 2: Google OAuth 認証情報を AWS Secrets Manager に保存

1. AWS マネジメントコンソールにアクセスします。
2. Secrets Manager に移動し、「新しいシークレットを保存」を選択します。
3. 「その他のタイプのシークレット」を選択します。
4. Google OAuth の clientId と clientSecret をキーと値のペアとして入力します。

   1. キー: clientId、値: <YOUR_GOOGLE_CLIENT_ID>
   2. キー: clientSecret、値: <YOUR_GOOGLE_CLIENT_SECRET>

5. プロンプトに従ってシークレットに名前と説明を付けます。CDK コードで使用するため、シークレット名を控えておきます。例: googleOAuthCredentials。（ステップ 3 の変数名 <YOUR_SECRET_NAME> で使用）
6. シークレットを確認して保存します。

### 注意

キー名は正確に 'clientId' と 'clientSecret' の文字列と一致する必要があります。

## ステップ 3: cdk.json の更新

cdk.json ファイルに、ID プロバイダと SecretName を追加します。

以下のようになります：

```json
{
  "context": {
    // ...
    "identityProviders": [
      {
        "service": "google",
        "secretName": "<YOUR_SECRET_NAME>"
      }
    ],
    "userPoolDomainPrefix": "<UNIQUE_DOMAIN_PREFIX_FOR_YOUR_USER_POOL>"
  }
}
```

### 注意

#### ユニーク性

userPoolDomainPrefix は、すべての Amazon Cognito ユーザーの間でグローバルにユニークである必要があります。他の AWS アカウントですでに使用されている接頭辞を選択すると、ユーザープールドメインの作成に失敗します。ユニーク性を確保するために、識別子、プロジェクト名、または環境名を接頭辞に含めることをお勧めします。

## ステップ 4: CDKスタックのデプロイ

AWS に CDK スタックをデプロイします：

```sh
npx cdk deploy --require-approval never --all
```

## ステップ 5: Cognito リダイレクト URI で Google OAuth クライアントを更新

スタックをデプロイした後、CloudFormation のアウトプットに AuthApprovedRedirectURI が表示されます。Google Developer Console に戻り、正しいリダイレクト URI で OAuth クライアントを更新してください。