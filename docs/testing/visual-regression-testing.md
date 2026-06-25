# ビジュアルリグレッションテスト

## なぜ存在するか

機能テストは「ボタンが存在するか」「テキストが正しいか」を検証するが、「見た目が壊れていないか」は検証できない。CSS の変更・フォントの読み込み失敗・レイアウトのズレは、機能テストをすべて通過しても発生する。

ビジュアルリグレッションテストは、ページやコンポーネントの**スクリーンショットを比較**して、見た目の変化を自動検出する。

```
基準スクリーンショット（ベースライン）を保存
     ↓
変更後に再撮影して差分を画像で比較
     ↓
差分があれば fail（ピクセル単位で変化を可視化）
```

## ツール

### Playwright（組み込みのビジュアル比較）

```ts
test('トップページの見た目', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('top-page.png');
});

// 特定コンポーネントだけ比較
test('ボタンコンポーネントの見た目', async ({ page }) => {
  await page.goto('/components/button');
  const button = page.locator('.btn-primary');
  await expect(button).toHaveScreenshot('button-primary.png');
});
```

初回実行でベースライン画像を生成し、2回目以降は差分を検出する。

```bash
# ベースライン更新
npx playwright test --update-snapshots
```

### Chromatic（Storybook 連携）

Storybook のストーリーを自動でスクリーンショット撮影・比較するクラウドサービス。
PR ごとに差分レビューの UI が提供されるため、変更の承認・却下がチームで行いやすい。

```bash
npx chromatic --project-token=<token>
```

### reg-suit

ローカルまたは CI で動作するオープンソースのビジュアルリグレッションツール。
S3・GCS に画像を保存し、差分レポートを HTML で出力する。

## 差分検出の仕組み

ピクセル単位で比較するため、フォントレンダリングや OS の違いで誤検知が出ることがある。許容範囲を設定して対応する：

```ts
await expect(page).toHaveScreenshot('page.png', {
  maxDiffPixels: 100,      // 100ピクセルまで差異を許容
  threshold: 0.2,          // 色の差異の許容度（0〜1）
});
```

## いつ使うか

**有効な場面**:
- デザインシステム・UI コンポーネントライブラリの品質保証
- CSS リファクタリング後のリグレッション検出
- マルチブラウザ対応の確認（Chromium・Firefox・WebKit）
- リリース前のデザイン崩れ検出

**コスト面の注意**:
- スクリーンショット撮影はブラウザ起動が必要で実行が遅い
- ベースライン画像の管理コスト（CI 環境・ストレージ）
- フォント・OS 依存の誤検知への対処が必要

**スナップショットテストとの使い分け**:
- CSS の変化を検出したい → ビジュアルリグレッションテスト
- HTML 構造・テキストの変化を検出したい → スナップショットテスト
