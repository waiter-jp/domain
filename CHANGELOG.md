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
- テスト網羅率100%化。


## v2.0.0 - 2017-11-22
### Added
- 発行規則環境変数を追加(複数の発行規則に対応)
- 発行規則InMemoryレポジトリを追加。
- 現在の許可証発行数取得サービスを追加。
- 発行規則にサービス休止時間帯の設定を追加。
- 許可証インターフェースに発行日時と期限のプロパティを追加。

### Removed
- MongoDBレポジトリーを削除。
- SqlServerレポジトリーを削除。


## v1.0.1 - 2017-07-13
### Fixed
- 発行者勤務シフト時間が文字列として入力された場合に許可証の期限が正しく設定されないバグに対応。

## v1.0.0 - 2017-07-10
### Added
- ファーストリリース。
