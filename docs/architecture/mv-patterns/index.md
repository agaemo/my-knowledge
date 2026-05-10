# MV* パターン

UIを持つアプリケーションで「表示・ロジック・データ」をどう分離するかを定めたパターン群。  
Model（データ）と View（表示）の間に何を置くか、それが名前の違いになっている。

全パターンに共通する目的は **「UIコードとビジネスロジックの分離」**。テスタビリティと変更容易性が主な動機。

---

## 比較

| パターン | 仲介役の名前 | Viewとの結合 | テスタビリティ | 主な用途 |
|---|---|---|---|---|
| [MVC](/architecture/mv-patterns/mvc) | Controller | 間接的（Controllerが更新） | Controller はテスト可能 | Web フレームワーク（Rails・Spring MVC） |
| [MVP](/architecture/mv-patterns/mvp) | Presenter | インターフェース経由（疎） | Presenter は高くテスト可能 | Android（旧来）・WinForms |
| [MVVM](/architecture/mv-patterns/mvvm) | ViewModel | データバインディング（自動） | ViewModel は高くテスト可能 | Vue・Angular・WPF・SwiftUI |
| [MVI](/architecture/mv-patterns/mvi) | なし（単方向フロー） | 一方向のみ | 最もテストしやすい | Redux・Elm・Jetpack Compose |

---

## 選び方

**Web フレームワーク（Rails / Django / Spring）：** MVC が標準。フレームワークが構造を決めているので選択の余地はほぼない。

**フロントエンド（Vue / Angular）：** MVVM。データバインディングがフレームワークに組み込まれている。

**React：** 公式には MV* を名乗らないが、状態管理（Redux / Zustand）を加えると MVI に近い考え方になる。

**厳密なテスタビリティが必要な場合：** MVP または MVI。View をインターフェース越しに差し替えられるため、UI なしでロジックを全テストできる。
