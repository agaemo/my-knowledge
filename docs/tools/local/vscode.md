# VSCode

Microsoftが開発するオープンソースのコードエディタ。軽量でありながら拡張機能によってほぼあらゆる言語・フレームワークに対応でき、現在最も広く使われているエディタ。

## なぜ存在するか

従来のIDEは高機能だが重く、起動が遅い。テキストエディタは軽いがコード補完や静的解析が弱い。VSCodeはその中間を狙い、拡張機能で必要な機能だけを追加できる設計にした。

## 主要機能

### IntelliSense
型情報・ドキュメント・補完候補をリアルタイムで表示する。Language Server Protocol（LSP）で各言語の実装を差し替えられる。

### 統合ターミナル
エディタ内でターミナルを開ける。プロジェクトのルートで自動的に開くため、ディレクトリ移動が不要。

### Git統合
変更差分のハイライト・コミット・ブランチ操作がエディタ内から行える。

### Dev Containers
Dockerコンテナ内で開発環境を動かす。`.devcontainer/` に設定を書けばチーム全員が同一環境で開発できる。

## おすすめ拡張機能

### 汎用
| 拡張機能 | 用途 |
|----------|------|
| ESLint | JavaScriptのLint |
| Prettier | コードフォーマッター |
| GitLens | git blameの強化・履歴表示 |
| Error Lens | エラーをインラインで表示 |
| Path Intellisense | ファイルパスの補完 |

### 言語・フレームワーク
| 拡張機能 | 用途 |
|----------|------|
| Astro | Astroのシンタックスハイライト・補完 |
| Prisma | Prismaスキーマのサポート |
| Tailwind CSS IntelliSense | クラス名の補完・プレビュー |

## 設定（settings.json）

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.linkedEditing": true,
  "editor.bracketPairColorization.enabled": true,
  "files.autoSave": "onFocusChange",
  "terminal.integrated.defaultProfile.osx": "zsh"
}
```

## よく使うショートカット（Mac）

| 操作 | ショートカット |
|------|--------------|
| コマンドパレット | `⌘ + Shift + P` |
| ファイル検索 | `⌘ + P` |
| シンボル検索 | `⌘ + Shift + O` |
| 全文検索 | `⌘ + Shift + F` |
| ターミナル開閉 | `` ⌃ + ` `` |
| 定義へ移動 | `F12` |
| 参照一覧 | `Shift + F12` |
| 一括リネーム | `F2` |
| 行の複製 | `⌥ + Shift + ↓` |
| マルチカーソル | `⌥ + Click` |

## Cursorとの比較

VSCodeはベースとして安定しており、GitHub Copilotを入れればAI補完も使える。ただしAI操作はあくまで「補助」の位置づけ。AIをより積極的に使った開発スタイルには[Cursor](/tools/local/cursor)が適している。
