# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## v4.2.0 - 2019-07-18

### Added

- JsonWebToken自体の期限調整機能を追加

## v4.1.0 - 2019-03-15

### Added

- 許可証発行規則にて利用可能期間をポジティブリストとして指定することができるように機能追加

## v4.0.0 - 2019-02-09

### Added

- プロジェクトと規則のMongoDBリポジトリを追加
- キャッシュサービスを追加

### Changed

- update packages

## v3.0.0 - 2018-11-29

### Added

- 発行規則をプロジェクト単位で管理できるように対応
- 発行規則にクライアント設定を追加

## v2.0.4 - 2018-08-02

### Changed

- [@waiter/factory](https://www.npmjs.com/package/@waiter/factory)をインストール。

## v2.0.3 - 2018-08-01

### Changed

- パッケージ名を変更。
- 依存パッケージを最新化。

## v2.0.2 - 2017-12-01
### Fixed
- fix Node Security Advisory [Regular Expression Denial of Service](https://nodesecurity.io/advisories/532).

## v2.0.1 - 2017-11-22
### Security
- テスト網羅率100%化。

## v2.0.0 - 2017-11-22
### Added
- 発行規則環境変数を追加(複数の発行規則に対応)
- 発行規則InMemoryレポジトリを追加。
- 現在の許可証発行数取得サービスを追加。
- 発行規則にサービス休止時間帯の設定を追加。
- 許可証インターフェースに発行日時と期限のプロパティを追加。

### Removed
- MongoDBリポジトリを削除。
- SqlServerリポジトリを削除。


## v1.0.1 - 2017-07-13
### Fixed
- 発行者勤務シフト時間が文字列として入力された場合に許可証の期限が正しく設定されないバグに対応。

## v1.0.0 - 2017-07-10
### Added
- ファーストリリース。
