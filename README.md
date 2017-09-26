# WAITER ドメインパッケージ

## プロジェクト背景
- チケット購入サイトへのアクセスがある量感を超えると、システムで受け止め切ることは簡単でない。
- インフラにコストをかけることで解決するのは簡単だが、コストに限度のないケースは少ない。
- GMO、SendGrid等、外部サービスと連携するシステムをつくる以上、外部サービス側の限度を考慮する必要がある。
- アプリケーション(ソフトウェア)のレベルでできる限りのことはしたい。

## 要件
- 本システムにかかる負荷と、フロントエンドアプリケーション側のインフラ(ウェブサーバー、DBサーバー)への負荷が分離していること。
- 厳密にコントロールできる、というよりは、2017/07あたりに間に合わせる、かつ、**それなりに有効**であることが大事。
- フロントウェブサーバーに負荷をかけられないため、クライアントサイドから呼び出せることが必須。

## 仕様
### とりあえず発行数を制御した許可証発行サーバーをたててみる
---
```
                                                         ........................
                                                         :                      :
                                                         :  WAITER              :
                                                         :                      :
+--------------+                                         :  +----------------+  :
|              |--(A)------ Passport Request -------------->|                |  :
|  End-user    |                                         :  |  Passport      |  :
|  Local       |                                         :  |  Issue         |  :
|              |<-(B)------ Passport -----------------------|  Server        |  :
|              |                                         :  |                |  :
|              |                                         :  +----------------+  :
|              |                                         :                      :
|              |                                         ........................
|              |                                         
|              |                                   +-------------------------------+
|              |                                   |                               |
|              |                                   |  Client                       |
|              |                                   |  Frontend                     |
|              |                                   |  Server                       |
|              |                                   |                               |
|              |                                   |                               |
|              |--(C)------ Request -------------->|                               |
|              |            + passport             |                               |
|              |                                   |                               |
|              |                                   |                               |
|              |                                   |                               |
|              |                                   |                               |
|              |                                   |                               |
+--------------+                                   +-------------------------------+
```

### 許可証の検証をどうするか
---
- DBを共有 → 負荷を分離する必要があるので使えない
  
そこで、  
[jsonwebtoken](https://jwt.io/)

### 許可証の暗号化と検証をフローに入れてみる
---
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
|              |<-(D)------ Verify Result ------------------|                |  :  |
|              |                                   |     :  |                |  :  |
|              |                                   |     :  +----------------+  :  |
|              |                                   |     :                      :  |
+--------------+                                   +-------------------------------+
                                                         :                      :
                                                         :                      :
                                                         ........................
```

### 登場用語
---
**クライアント**

- 許可証発行対象のアプリケーションクライアント。事前にWAITER側DBに登録。

field                                   | type                            | description
:-------------------------------------- | :------------------------------ | :-------------------------------------- 
id                                      | string                          | クライアントID
secret                                  | string                          | クライアントシークレット
passport_issuer_work_shift_in_sesonds   | number                          | 許可証発行者の勤務シフト時間(秒)
total_number_of_passports_per_issuer    | number                          | 発行者ひとりあたりの許可証発行可能数

```json
{
    "id": "motionpicture",
    "secret": "secret",
    "passport_issuer_work_shift_in_sesonds" : 300,
    "total_number_of_passports_per_issuer": 120
}
```

**許可証発行者**

- クライアント専属で勤務。クライアントが許可証の発行を依頼すると、勤務シフト内の発行者が発行を試みる。  
- 発行者の勤務は秒単位でのシフト制で、許可証発行枚数には限りがある。  

field                                   | type                            | description
:-------------------------------------- | :------------------------------ | :-------------------------------------- 
id                                      | string                          | 発行者ID

**許可証**

- 発行者が発行する許可証は鍵によって暗号化される。
- クライアントは鍵を事前に共有してもらうことで、暗号化された許可証を検証し、許可するかどうかを判断する。

field                                   | type                            | description
:-------------------------------------- | :------------------------------ | :-------------------------------------- 
client                                  | string                          | クライアントID
scope                                   | string                          | スコープ
issuer                                  | number                          | 発行者ID
issued_place                            | number                          | 発行者が何番目に発行した許可証か

```json
{
    "client": "motionpicture",
    "scope": "purchase",
    "issuer" : "motionpicture:1495696920",
    "issued_place": "11"
}
```

**暗号化された許可証**

- jsonwebtoken
- 期限つき

```jsonwebtoken
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnQiOiJtb3Rpb25waWN0dXJlIiwic2NvcGUiOiJ0ZXN0c2NvcGUiLCJpc3N1ZXIiOiJtb3Rpb25waWN0dXJlOjE0OTU3NzQ5MjAiLCJpc3N1ZWRfcGxhY2UiOjgsImlhdCI6MTQ5NTc3NDkyMywiZXhwIjoxNDk1Nzc0OTUzfQ.W_WgQs6rrQhkyXPNW8hDP1IJ1gxI_Nalk3sSDpzUzr8
```


## Getting Started

### 言語
---
[TypeScript](https://www.typescriptlang.org/)

### 開発方法
---
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
---
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
