# Theme Liquid Docs

<!-- hy-mt2-i18n:start -->
[English](./README.md) | [中文](./README_zh-CN.md) | **日本語** | [Español](./README_es.md)
<!-- hy-mt2-i18n:end -->


Liquidスキーマ、ドロップ、タグ、フィルター向けの自動生成ドキュメントです。スキーマを更新するたびにドキュメントも自動的に再生成されるため、常に最新の状態が保たれます。

## すぐに始める

```bash
git clone https://github.com/Shopify/theme-liquid-docs
cd theme-liquid-docs
yarn install
```

## 内容の構成

- **`data/`** — テーマ用のLiquidドロップ、タグ、フィルターが記載されたJSONファイル
- **`schemas/`** — Liquidテーマアーティファクト用のJSON Schema定義
- **`ai/`** — AIによって生成されるLiquidルールの動作に必要なコンテキストファイル
- **`tests/`** — ドキュメントの正確性を確認するテストセット
- **`scripts/`** — ドキュメント生成の自動化スクリプト

### 利用可能なデータ

`data/`には以下のものが含まれています：
- `filters` — 利用可能なすべてのLiquidフィルター
- `tags` — すべてのLiquidタグ
- `objects` — すべてのLiquidオブジェクト
- `latest.json` — CLIやtheme-tools、その他の依存プロジェクトで使用されるLiquidデータのバージョンを示します。詳細は[リビジョン番号の更新](#updating-revision-number)をご覧ください。

例は`ai/liquid.mdc`を確認してください。

### リビジョン番号の更新

すべての依存プロジェクトで使用されるLiquidドキュメントを更新するには、[GitHub Action](https://github.com/Shopify/theme-liquid-docs/actions/workflows/update-latest.yml)を実行してください。

🚨 このアクションを実行しない場合、依存プロジェクトは`data/latest.json`に記載されているリビジョンIDで指定されたLiquidドキュメントが使用されます。

## 貢献する方法

これらのドキュメントをより良くするためにご協力を：

1. このリポジトリを**フォーク**する
2. 自分専用の機能ブランチを**作成する**（`git checkout -b improve-liquid-docs`)
3. 変更内容を**コミット**する（`git commit -m 'Arrayフィルターの例を追加'`）
4. プッシュしてPull Requestを作成する

## ライセンス

MITライセンスです。詳細は[LICENSE](./LICENSE.md)をご覧ください。
