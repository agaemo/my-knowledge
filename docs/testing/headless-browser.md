# ヘッドレスブラウザ

## なぜ存在するか

ブラウザは GUI を描画するために多くのリソースを消費する。テスト・スクレイピング・PDF 生成などの自動化では画面表示は不要で、DOM 操作・JavaScript 実行・ネットワーク通信だけあれば十分。
ヘッドレスブラウザは GUI を持たないブラウザで、サーバー環境での実行・高速化・並列化が可能になる。

## 主な用途

| 用途 | 内容 |
|---|---|
| E2E テスト | 実際のブラウザ操作をシミュレートして画面フローを検証 |
| スクレイピング | JavaScript でレンダリングされる SPA のデータ取得 |
| スクリーンショット | ページの視覚的リグレッションテスト・OGP 画像生成 |
| PDF 生成 | HTML テンプレートを PDF に変換（請求書・レポート） |
| パフォーマンス計測 | ページロード時間・Core Web Vitals の自動計測 |

## 代表的なツール

### Playwright

Microsoft 製。Chromium・Firefox・WebKit（Safari）の3エンジンをサポート。
現在のデファクトスタンダードで、テストの書きやすさとデバッグ機能が優れている。

```ts
import { chromium } from 'playwright';

const browser = await chromium.launch(); // headless: true がデフォルト
const page = await browser.newPage();
await page.goto('https://example.com');
await page.click('button[type="submit"]');
await expect(page.locator('h1')).toHaveText('完了');
await browser.close();
```

**特徴**:
- 自動待機（Auto-wait）: 要素が操作可能になるまで自動的に待つ
- トレース・スクリーンショット・動画記録が組み込み
- `codegen` コマンドで操作を記録してコード生成できる

### Puppeteer

Google 製。Chromium（または Chrome）専用。Playwright の前身にあたり、Chrome DevTools Protocol を直接扱う。

```ts
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
const screenshot = await page.screenshot({ fullPage: true });
await browser.close();
```

**Playwright との比較**:

| 観点 | Playwright | Puppeteer |
|---|---|---|
| 対応ブラウザ | Chromium・Firefox・WebKit | Chromium のみ |
| 自動待機 | あり（デフォルト） | なし（手動で waitFor が必要） |
| テスト統合 | テストランナー内蔵 | 別途 Jest 等が必要 |
| コミュニティ | 急成長中 | 成熟・安定 |

## E2E テストにおける位置づけ

ヘッドレスブラウザを使う E2E テストはテストピラミッドの頂点にあたり、実行コストが高い。

```
        /E2E\          ← ヘッドレスブラウザで実行。数十件程度に絞る
       /------\
      /統合テスト\       ← API・DB を実際に使う。数百件
     /------------\
    /  単体テスト   \    ← 外部依存なし。数千件
   /--------------\
```

すべての画面フローを E2E にするのではなく、**クリティカルパス（ログイン・決済・主要ユーザーフロー）** に絞るのが原則。

## ローカル vs CI

| 環境 | 注意点 |
|---|---|
| ローカル | GUI モードで実行してデバッグ（`--headed`） |
| CI | ヘッドレスモードで実行。Linux では `xvfb` が不要（Playwright はデフォルト対応） |

Playwright は `playwright install` で必要なブラウザバイナリを管理するため、環境ごとのブラウザバージョン差異を防げる。

## いつ使うか

**ヘッドレスブラウザが必要な場合**:
- SPA（Vue・React）の画面操作を含む E2E テスト
- JavaScript でレンダリングされるページのスクレイピング
- HTML → PDF 変換（請求書・帳票）
- ページの視覚的リグレッションテスト

**不要な場合（より軽量な代替を使う）**:
- API の振る舞いテスト → 統合テスト（supertest など）で十分
- 静的 HTML のスクレイピング → cheerio（DOM パーサー）で十分
- コンポーネントの見た目テスト → Storybook・Chromatic の方が適切
