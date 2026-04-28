# CSS設計手法

CSSのスタイル定義をどう構造化・スコープ化するかのアプローチ。グローバルなCSSはスケールするにつれ衝突・予測不能な上書きが起きやすく、それを解決するために様々な手法が生まれた。

## なぜ存在するか

CSSはデフォルトでグローバルスコープを持つ。プロジェクトが大きくなると、どのスタイルがどこに影響するかを把握しきれなくなる。設計手法はこの問題に対して「命名規則」「スコープの分離」「抽象化」などのアプローチで対処する。

## BEM（Block Element Modifier）

クラス名の命名規則によってスコープと意図を表現する。

```css
/* Block */
.card { }

/* Element（Blockの構成要素） */
.card__title { }
.card__body { }

/* Modifier（状態・バリアント） */
.card--featured { }
.card__title--large { }
```

**メリット:** ビルドツール不要。クラス名を見ればどこに属するか分かる。  
**デメリット:** クラス名が長くなる。命名の一貫性を人間が維持する必要がある。  
**向いている場面:** Vanilla CSS・SCSSを使うプロジェクト。フレームワーク非依存。

## CSS Modules

ファイル単位でCSSをスコープ化する。ビルド時にクラス名をハッシュ化し、他のコンポーネントと衝突しないようにする。

```css
/* Button.module.css */
.button {
  background: blue;
}
```

```tsx
// Button.tsx
import styles from './Button.module.css'

const Button = () => (
  <button className={styles.button}>クリック</button>
  // → <button class="Button_button__3xYz9">クリック</button>
)
```

**メリット:** スコープが自動で保証される。通常のCSSの知識がそのまま使える。  
**デメリット:** 動的スタイルの記述がやや冗長。  
**向いている場面:** React・Next.jsなどコンポーネントベースのプロジェクト。

## CSS-in-JS

JavaScriptでスタイルを記述し、コンポーネントに紐付ける。propsに応じた動的スタイルをJSのロジックで表現できる。

```tsx
// styled-components の例
import styled from 'styled-components'

const Button = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? 'blue' : 'white'};
  color: ${props => props.primary ? 'white' : 'blue'};
  padding: 8px 16px;
`

// 使う側
<Button primary>送信</Button>
```

**メリット:** 動的スタイルをJSの変数・ロジックで表現できる。コンポーネントとスタイルが1ファイルに収まる。  
**デメリット:** ランタイムのオーバーヘッドがある。SSRとの相性に注意が必要。  
**向いている場面:** デザインシステム・テーマ切り替え・動的スタイルが多いアプリ。

## Tailwind CSS（ユーティリティファースト）

あらかじめ定義された単機能クラスを組み合わせてスタイルを組む。CSSファイルをほとんど書かない。

```tsx
const Button = () => (
  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    クリック
  </button>
)
```

**メリット:** CSSファイルが増えない。デザイントークンが統一される。クラスを見れば見た目が分かる。  
**デメリット:** HTMLが長くなる。Tailwindのクラス名を覚える必要がある。  
**向いている場面:** 素早くUIを組みたい。デザインシステムとの一貫性を保ちたい。

## 比較

| 手法 | スコープ | 動的スタイル | 学習コスト | ビルドツール |
|------|---------|------------|-----------|------------|
| BEM | 命名規則 | △ | 低 | 不要 |
| CSS Modules | ファイル単位 | △ | 低 | 必要 |
| CSS-in-JS | コンポーネント | ◎ | 中 | 必要 |
| Tailwind | ユーティリティ | ○ | 中 | 必要 |

## いつ使うか

- **BEM**: フレームワーク不使用・既存のSCSSプロジェクト
- **CSS Modules**: React系プロジェクトでシンプルに始めたい
- **CSS-in-JS**: テーマ・動的スタイルが複雑なデザインシステム
- **Tailwind**: 素早い開発・デザイントークンの統一・チームのコンポーネント設計がしっかりしている
