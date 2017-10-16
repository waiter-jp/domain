<img src="https://motionpicture.jp/images/common/logo_01.svg" alt="motionpicture" title="motionpicture" align="right" height="56" width="98"/>

# WAITER ドメインパッケージ

[![CircleCI](https://circleci.com/gh/motionpicture/waiter-domain.svg?style=svg)](https://circleci.com/gh/motionpicture/waiter-domain)
[![Coverage Status](https://coveralls.io/repos/github/motionpicture/waiter-domain/badge.svg)](https://coveralls.io/github/motionpicture/waiter-domain)
[![Known Vulnerabilities](https://snyk.io/test/github/motionpicture/waiter-domain/badge.svg)](https://snyk.io/test/github/motionpicture/waiter-domain)

## プロジェクト背景
- チケット購入サイトへのアクセスがある量感を超えると、システムで受け止め切ることは簡単でない。
- インフラにコストをかけることで解決するのは簡単だが、コストに限度のないケースは少ない。
- GMO、SendGrid等、外部サービスと連携するシステムをつくる以上、外部サービス側の限度を考慮する必要がある。
- アプリケーション(ソフトウェア)のレベルでできる限りのことはしたい。

## 要件
- 本システムにかかる負荷と、フロントエンドアプリケーション側のインフラ(ウェブサーバー、DBサーバー)への負荷が分離していること。
- 厳密にコントロールできる、というよりは、**それなりに有効**であることが大事。
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

- 許可証発行対象のアプリケーションクライアント。事前にWAITERに環境変数として登録。

field                                        | type                            | description
:------------------------------------------- | :------------------------------ | :-------------------------------------- 
id                                           | string                          | クライアントID
secret                                       | string                          | クライアントシークレット
passportIssueRule.aggregationUnitInSeconds   | number                          | 許可証数集計単位(秒)
passportIssueRule.threshold                  | number                          | 単位時間当たりの許可証数閾値

```json
{
    "id": "motionpicture",
    "secret": "secret",
    "passportIssueRule": {
        "aggregationUnitInSeconds" : 300,
        "threshold": 120
    }
}
```

**許可証発行単位**

- クライアントごとに発行単位が作成される。クライアントが許可証の発行を依頼すると、単位ごとに発行数を集計しながら発行を試みる。  

field                                   | type                            | description
:-------------------------------------- | :------------------------------ | :-------------------------------------- 
issueUnitName                           | string                          | 許可証発行単位名

**許可証**

- 発行者が発行する許可証は鍵によって暗号化される。
- クライアントは鍵を事前に設定することで暗号化された許可証を検証し、許可するかどうかを判断する。

field                                   | type                            | description
:-------------------------------------- | :------------------------------ | :-------------------------------------- 
iss                                     | string                          | 発行者
aud                                     | string                          | 許可証が発行されたターゲットクライアント
scope                                   | string                          | スコープ
issueUnitName                           | string                          | 発行単位名
issuedPlace                             | number                          | 発行者が何番目に発行した許可証か

```json
{
    "issuer" : "https://waiter.example.com",
    "client": "motionpicture",
    "scope": "transactions",
    "issueUnitName": "motionpicture:1495696920",
    "issuedPlace": 11
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


### Required environment variables
---
```shell
set WAITER_PASSPORT_ISSUER=**********許可証発行者(通常発行APIのドメインを指定)**********
set WAITER_CLIENTS=**********クライアントリスト(オブジェクトの配列をjsonで指定)**********
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


## clean
`npm run clean`で不要なソース削除。


## test
`npm test`でチェック実行。

