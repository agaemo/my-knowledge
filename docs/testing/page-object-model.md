# Page Object Model

## なぜ存在するか

E2E テストを素直に書くと、DOM セレクターやページ操作が各テストに直接散らばる。
UI が変わるたびにすべてのテストを修正することになり、テストコードが壊れやすくなる。

Page Object Model（POM）は、ページの操作をオブジェクトに閉じ込め、テストコードからページ構造の詳細を隠す設計パターン。

```
変更前: テストがセレクターを直接持つ
  test → page.click('#login-btn')  ← UI変更で全テストが壊れる

変更後: テストがPage Objectを通じて操作する
  test → LoginPage.submit()  ← セレクターはPage Object内だけ
              ↓
          page.click('#login-btn')
```

## 構造

```ts
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.fill('[name="email"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('[name="password"]', password);
  }

  async submit() {
    await this.page.click('button[type="submit"]');
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}
```

```ts
// tests/login.spec.ts
import { LoginPage } from '../pages/LoginPage';

test('正しい認証情報でログインできる', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL('/dashboard');
});

test('誤ったパスワードでエラーが表示される', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('user@example.com', 'wrong');
  await expect(page.locator('.error')).toBeVisible();
});
```

## 何を隠すか

Page Object は **操作のインターフェース** を提供し、**検証はテストコード側に残す** のが原則。

```ts
// 悪い例: Page Object の中でアサーションする
async login(email: string, password: string) {
  // ...
  await expect(this.page).toHaveURL('/dashboard'); // ← テストが柔軟でなくなる
}

// 良い例: 操作だけ担当し、検証はテスト側で行う
async login(email: string, password: string) {
  await this.fillEmail(email);
  await this.fillPassword(password);
  await this.submit();
  // 検証なし
}
```

## ディレクトリ構成の例

```
tests/
├── pages/          # Page Objects
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── CheckoutPage.ts
└── specs/          # テストコード
    ├── login.spec.ts
    └── checkout.spec.ts
```

## Playwright との組み合わせ

Playwright では `page.getByRole` や `page.getByLabel` のような**意味的ロケーター**を Page Object 内で使うと、セレクターへの依存をさらに減らせる。

```ts
async submit() {
  await this.page.getByRole('button', { name: '送信' }).click();
  // '#submit-btn' より変更に強い
}
```

## いつ使うか

**有効な場面**:
- 複数のテストが同じページ操作を共有するとき
- UI の変更が頻繁に起きるプロダクト
- チームで E2E テストを分担して書くとき

**過剰になる場面**:
- テストが少数（数件程度）で重複がほぼないとき → 直接書く方がシンプル
- Playwright の Fixtures でセットアップを共通化できる場合 → POM より軽量な選択肢がある
