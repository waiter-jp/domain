# WAITER ドメインパッケージ

## プロジェクト背景
- TIFF2016にて、チケット購入サイトへのアクセスがある量感を超えると、システムで受け止め切ることは簡単でないことを知る。
- インフラにコストをかけることで解決するのは簡単だが、コストに限度のないケースは少ない。
- GMO、SendGrid等、外部サービスと連携するシステムをつくる以上、外部サービス側の限度を考慮する必要がある。
- アプリケーション(ソフトウェア)のレベルでできる限りのことはしたい。

## 要件
- 本システムにかかる負荷と、フロントエンドアプリケーション側のインフラ(ウェブサーバー、DBサーバー)への負荷が分離していること。
- 厳密にコントロールできる、というよりは、2017/07あたりに間に合わせる、かつ、**それなりに有効**であることが大事。
- フロントウェブサーバーに負荷をかけられないため、クライアントサイドから呼び出せることが必須。

## サイト入場許可フロー
```
                                                         ........................
                                                         :                      :
                                                         :  WAITER              :
                                                         :                      :
+--------------+                                         :  +----------------+  :
|              |--(A)------ Passport Request -------------->|                |  :
|  End-user    |           + client_id                   :  |  Passport      |  :
|  Local       |                                         :  |  Issue         |  :
|              |<-(B)------ Encoded Passport ---------------|  Server        |  :
|              |                                         :  |                |  :
|              |                                         :  +--------■■------+  :
|              |                                         :           ■■         :
|              |                                         :         SECRET       :
|              |                                         :           ■■         :
|              |                                   +-----------------■■------------+
|              |                                   |     :                      :  |
|              |                                   |  Client                    :  |
|              |                                   |  Frontend                  :  |
|              |                                   |  Server                    :  |
|              |                                   |     :                      :  |
|              |                                   |     :  +----------------+  :  |
|              |--(C)------ Verify Request ---------------->|                |  :  |
|              |                                   |     :  |  Token         |  :  |
|              |                                   |     :  |  Verifier      |  :  |
|              |<-(D)------ Verify Result ----------------->|                |  :  |
|              |                                   |     :  |                |  :  |
|              |                                   |     :  +----------------+  :  |
|              |                                   |     :                      :  |
+--------------+                                   +-------------------------------+
                                                         :                      :
                                                         :                      :
                                                         ........................
```

## Getting Started

### 言語
[TypeScript](https://www.typescriptlang.org/)

### 開発方法
npmでパッケージをインストール。

```shell
npm install
```
[npm](https://www.npmjs.com/)

typescriptをjavascriptにコンパイル。

```shell
npm run build -- -w
```


### Required environment variables
```shell
set WAITER_SECRET=**********JWTシークレット**********
set WAITER_DEVELOPER_EMAIL=**********環境名**********
```

DEBUG

```shell
set DEBUG=waiter-domain:*
```

for test
```shell
set TEST_MONGOLAB_URI=**********MongoDB接続文字列**********
set TEST_REDIS_HOST=**********Redis Cacheホスト**********
set TEST_REDIS_PORT=**********Redis Cacheポート**********
set TEST_REDIS_KEY=**********Redis Cacheパスワード**********
set TEST_SQL_SERVER_USERNAME=**********SQL Serverユーザーネーム**********
set TEST_SQL_SERVER_PASSWORD=**********SQL Serverパスワード**********
set TEST_SQL_SERVER_SERVER=**********SQL Serverサーバー**********
set TEST_SQL_SERVER_DATABASE=**********SQL Serverデータベース**********
```

## tslint

コード品質チェックをtslintで行う。
* [tslint](https://github.com/palantir/tslint)
* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib)

`npm run check`でチェック実行。改修の際には、必ずチェックすること。


## clean
`npm run clean`で不要なソース削除。


## test
`npm test`でチェック実行。


## versioning
`npm version patch -f -m "enter your commit comment..."`でチェック実行。
