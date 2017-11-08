<img src="https://motionpicture.jp/images/common/logo_01.svg" alt="motionpicture" title="motionpicture" align="right" height="56" width="98"/>

# WAITER ドメインパッケージ

[![CircleCI](https://circleci.com/gh/motionpicture/waiter-domain.svg?style=svg)](https://circleci.com/gh/motionpicture/waiter-domain)
[![Coverage Status](https://coveralls.io/repos/github/motionpicture/waiter-domain/badge.svg)](https://coveralls.io/github/motionpicture/waiter-domain)
[![Known Vulnerabilities](https://snyk.io/test/github/motionpicture/waiter-domain/badge.svg)](https://snyk.io/test/github/motionpicture/waiter-domain)


## Table of contents

* [Background](#background)
* [Requirement](#requirement)
* [Specification](#specification)
* [Usage](#usage)
* [Code Samples](#code-samples)
* [Jsdoc](#jsdoc)
* [License](#license)


## Background
- チケット購入サイトへのアクセスがある量感を超えると、システムで受け止め切ることは簡単でない。
- インフラにコストをかけることで解決するのは簡単だが、コストに限度のないケースは少ない。
- GMO、SendGrid等、外部サービスと連携するシステムをつくる以上、外部サービス側の限度を考慮する必要がある。
- アプリケーション(ソフトウェア)のレベルでできる限りのことはしたい。

## Requirement
- 本システムにかかる負荷と、フロントエンドアプリケーション側のインフラ(ウェブサーバー、DBサーバー)への負荷が分離していること。
- 厳密にコントロールできる、というよりは、**それなりに有効**であることが大事。
- フロントウェブサーバーに負荷をかけられないため、クライアントサイドから呼び出せることが必須。

## Specification
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
**発行規則**

- 許可証発行規則。事前にWAITERに環境変数として登録。

field                                        | type                            | description
:------------------------------------------- | :------------------------------ | :-------------------------------------- 
scope                                        | string                          | スコープ
aggregationUnitInSeconds                     | number                          | 許可証数集計単位(秒)
threshold                                    | number                          | 単位時間当たりの許可証数閾値

```json
{
    "scope" : "mcdonalds",
    "aggregationUnitInSeconds" : 300,
    "threshold": 120
}
```

**許可証発行単位**

- スコープごとに発行単位が作成される。許可証の発行を依頼されると、単位ごとに発行数を集計しながら発行を試みる。  

field                                   | type                            | description
:-------------------------------------- | :------------------------------ | :-------------------------------------- 
identifier                              | string                          | 許可証発行単位識別子
validFrom                               | number                          | いつから有効な発行単位か
validThrough                            | number                          | いつまで有効な発行単位か
numberOfRequests                        | number                          | 許可証発行リクエスト数

**許可証**

- 発行者が発行する許可証は鍵によって暗号化される。
- 発行依頼者は鍵を事前に設定することで暗号化された許可証を検証し、許可するかどうかを判断する。

field                                   | type                            | description
:-------------------------------------- | :------------------------------ | :-------------------------------------- 
iss                                     | string                          | 発行者
scope                                   | string                          | スコープ
issueUnit                               | IIssueUnit                      | 発行単許可証発行単位位名

```json
{
    "issuer" : "https://waiter.example.com",
    "scope": "mcdonalds",
    "issueUnit": {
        "identifier": "scope:1508227500",
        "validFrom": 1508227500,
        "validThrough": 1508227800,
        "numberOfRequests": 2
    }
}
```

**暗号化された許可証**

- jsonwebtoken
- 期限つき

```jsonwebtoken
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnQiOiJtb3Rpb25waWN0dXJlIiwic2NvcGUiOiJ0ZXN0c2NvcGUiLCJpc3N1ZXIiOiJtb3Rpb25waWN0dXJlOjE0OTU3NzQ5MjAiLCJpc3N1ZWRfcGxhY2UiOjgsImlhdCI6MTQ5NTc3NDkyMywiZXhwIjoxNDk1Nzc0OTUzfQ.W_WgQs6rrQhkyXPNW8hDP1IJ1gxI_Nalk3sSDpzUzr8
```


## Usage

### Environment variables

| Name                                       | Required              | Purpose                           | Value        |
|--------------------------------------------|-----------------------|-----------------------------------|--------------|
| `DEBUG`                                    | false                 | Debug                             | waiter-domain:* |
| `WAITER_PASSPORT_ISSUER`                   | true                  | 許可証発行者識別子                 ||
| `WAITER_RULES`                             | true                  | 発行規則リスト                    ||
| `WAITER_SECRET`                            | true                  | 許可証暗号化の秘密鍵               ||


## Code Samples

コードサンプルは [example](https://github.com/motionpicture/waiter-domain/tree/master/example) にあります。

## Jsdoc

`npm run doc`でjsdocを作成できます。./docに出力されます。

## License

ISC
