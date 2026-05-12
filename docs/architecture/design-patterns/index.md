# GoF デザインパターン

## なぜ存在するか

1994年に出版された書籍 *Design Patterns: Elements of Reusable Object-Oriented Software*（著者4名が「Gang of Four」と呼ばれる）が出典。  
オブジェクト指向設計において繰り返し現れる問題と解決策を23のパターンとして体系化した。

**共通言語としての価値が核心。**「Observer パターンにする」と言えばチーム全員が同じ構造をイメージできる。パターン自体は特定言語に縛られない設計の語彙だった。

## Javaと現代言語

GoFが書かれた当時の主流はC++・Java。クラス継承とインターフェースしか表現手段がなかったため、パターンを自前で実装する必要があった。

現代の言語・フレームワークはパターンの多くを言語機能として吸収している。

| パターン | 吸収した言語・仕組み |
|---|---|
| Iterator | `for...in`・Python イテレーターズプロトコル・Java enhanced for |
| Observer | JavaScript の EventEmitter・RxJS・Vue の reactivity |
| Strategy | 高階関数・クロージャ（関数を引数で渡す） |
| Command | クロージャ・ラムダ・Kotlin の `() -> Unit` |
| Template Method | コールバック・高階関数・フレームワークのフック |
| Decorator | Python の `@decorator` 構文 |
| Singleton | Node.js のモジュールシステム・DI コンテナ |
| Factory Method / Abstract Factory | DI フレームワーク（Spring・Guice） |
| Builder | 名前付き引数（Kotlin・Python）・メソッドチェーン |

パターンを「知らなくても使っている」状態が現代。だからこそ名前と構造を理解していると、設計の意図を正確に伝えられる。

## 23パターンの分類

| 種別 | パターン |
|---|---|
| [生成](/architecture/design-patterns/creational) | Abstract Factory・Builder・Factory Method・Prototype・Singleton |
| [構造](/architecture/design-patterns/structural) | Adapter・Bridge・Composite・Decorator・Facade・Flyweight・Proxy |
| [振る舞い](/architecture/design-patterns/behavioral) | Chain of Responsibility・Command・Interpreter・Iterator・Mediator・Memento・Observer・State・Strategy・Template Method・Visitor |

## エンタープライズアプリケーションパターン

- [Repository](/architecture/design-patterns/repository) — データアクセスを抽象化し、ビジネスロジックから DB の詳細を分離する
- [Dependency Injection](/architecture/design-patterns/dependency-injection) — 依存オブジェクトを外から渡す。テスタビリティと疎結合の基盤
- [Active Record vs Data Mapper](/architecture/design-patterns/orm-patterns) — DB とオブジェクトのマッピング2アプローチ。ORM 選定の判断基準

## その他の原則

- [プログラミング原則](/architecture/design-patterns/principles) — DRY・KISS・YAGNI・LoD・合成優先・SoC

## いつ学ぶか

- 設計レビューで「なぜこうなっているか」を説明・理解したいとき
- リファクタリングの方向性を探るとき（「これは Strategy に直せる」）
- フレームワークの内部を読むとき（多くが GoF パターンで実装されている）
