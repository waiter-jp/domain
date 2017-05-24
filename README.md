# WAITER ドメインパッケージ

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
set MONGOLAB_URI=**********MongoDB接続文字列**********
set REDIS_URL=**********Redis Cache接続文字列**********
set SQL_SERVER_USERNAME=**********SQL Serverユーザーネーム**********
set SQL_SERVER_PASSWORD=**********SQL Serverパスワード**********
set SQL_SERVER_SERVER=**********SQL Serverサーバー**********
set SQL_SERVER_DATABASE=**********SQL Serverデータベース**********
set WAITER_SECRET=**********JWTシークレット**********
set WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS=**********カウンターリセット単位(秒)**********
set WAITER_NUMBER_OF_TOKENS_PER_UNIT=**********カウンター単位あたりの発行トークン数**********
set WAITER_DEVELOPER_EMAIL=**********環境名**********
```

DEBUG

```shell
set DEBUG=waiter-domain:*
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
