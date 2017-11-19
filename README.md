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

### v1を経て...
- 複数の流入制限設定に対応する必要がある。
- 制限設定により幅を持たせられるか。
- できる限り、流入者に対して平等に許可証を発行したい。
- サービスとして、保守の領域にコミットするものを持つ必要がある。
- オープンソース。
- できる限りのインフラ非依存。クラウドベンダー非依存。クラウドベンダー切り替え。
- 事後の分析に値する何かはありうるか。
- 導入の手間。

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
|  End-user    |           + scope                       :  |  Passport      |  :
|  Local       |                                         :  |  Issue         |  :
|              |<-(B)------ Encoded Passport ---------------|  Server        |  :
|              |                                         :  |                |  :
|              |                                         :  +--------■■------+  :
|              |                                         :           ■■         :
|              |                                         :           ■■         :
|              |                                         :         SECRET       :
|              |                                         :(environment variable):
|              |                                         :           ■■         :
|              |                                         :           ■■         :
|              |                                   +-----------------■■------------+
|              |                                   |     :                      :  |
|              |                                   |  Client                    :  |
|              |                                   |  Frontend                  :  |
|              |                                   |  Server                    :  |
|              |                                   |     :                      :  |
|              |                                   |     :  +----------------+  :  |
|              |--(C)------ Verify Request ---------------->|                |  :  |
|              |            + encoded passport     |     :  |  Token         |  :  |
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
unavailableHoursSpecifications               | array                           | サービス休止時間帯設定リスト
unavailableHoursSpecifications.startDate     | string                          | サービス休止開始日時
unavailableHoursSpecifications.endDate       | string                          | サービス休止終了日時

```json
{
    "scope" : "mcdonalds",
    "aggregationUnitInSeconds" : 300,
    "threshold": 120,
    "unavailableHoursSpecifications":[
        {"startDate":"2017-11-10T09:00:00Z","endDate":"2017-11-10T09:30:00Z"}
    ]
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
iat                                     | number                          | 発行unixタイムスタンプ
exp                                     | number                          | 期限unixタイムスタンプ
scope                                   | string                          | スコープ
issueUnit                               | IIssueUnit                      | 発行単許可証発行単位位名

```json
{
  "scope": "scope",
  "issueUnit": {
    "identifier": "scope:1511059500",
    "validFrom": 1511059500,
    "validThrough": 1511059800,
    "numberOfRequests": 1
  },
  "iat": 1511059610,
  "exp": 1511059910,
  "iss": "https://waiter.example.com"
}
```

**暗号化された許可証**

- jsonwebtoken
- 期限つき

```jsonwebtoken
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InNjb3BlIiwiaXNzdWVVbml0Ijp7ImlkZW50aWZpZXIiOiJzY29wZToxNTExMDU5NTAwIiwidmFsaWRGcm9tIjoxNTExMDU5NTAwLCJ2YWxpZFRocm91Z2giOjE1MTEwNTk4MDAsIm51bWJlck9mUmVxdWVzdHMiOjF9LCJpYXQiOjE1MTEwNTk2MTAsImV4cCI6MTUxMTA1OTkxMCwiaXNzIjoiaHR0cHM6Ly93YWl0ZXIuZXhhbXBsZS5jb20ifQ.wE_osB77zotND2H56tUMyCFAaAS6SHlp4wCMyvRsVt4
```


## Usage

### Environment variables

 Name                                       | Required              | Value                | Purpose                           
--------------------------------------------|-----------------------|----------------------|-----------------------------------
 `DEBUG`                                    | false                 | waiter-domain:*      | Debug
 `WAITER_PASSPORT_ISSUER`                   | true                  |                      | 許可証発行者識別子
 `WAITER_RULES`                             | true                  |                      | 発行規則リスト
 `WAITER_SECRET`                            | true                  |                      | 許可証暗号化の秘密鍵


## Code Samples

コードサンプルは [example](https://github.com/motionpicture/waiter-domain/tree/master/example) にあります。

## Jsdoc

`npm run doc`でjsdocを作成できます。./docに出力されます。

## License

ISC
