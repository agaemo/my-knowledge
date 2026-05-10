# 生成パターン（Creational）

「どのようにオブジェクトを生成するか」を抽象化するパターン群。  
呼び出し側が具体的なクラスに依存しないようにすることで、生成ロジックの変更をカプセル化する。

---

## Factory Method

**何を解決するか：** サブクラスに生成するオブジェクトの種類を決めさせたい。

```java
// 抽象クラスでメソッドの骨格を定義
abstract class Dialog {
    // Factory Method — サブクラスが具体型を決める
    abstract Button createButton();

    void render() {
        Button btn = createButton();
        btn.render();
    }
}

class WindowsDialog extends Dialog {
    @Override
    Button createButton() { return new WindowsButton(); }
}
```

**現代の等価物：** DIフレームワーク（Springの `@Bean`）、型パラメータ + ファクトリ関数。

**いつ使うか：** 生成するクラスをサブクラスやプラグインで差し替えたいとき。

---

## Abstract Factory

**何を解決するか：** 関連するオブジェクト群（製品ファミリー）を、具体クラスを指定せずにまとめて生成したい。

```java
interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class MacFactory implements GUIFactory {
    public Button createButton() { return new MacButton(); }
    public Checkbox createCheckbox() { return new MacCheckbox(); }
}
```

**Factory Method との違い：** Factory Method は1種類のオブジェクト生成に焦点。Abstract Factory は複数種類のオブジェクトをセットで提供する。

**いつ使うか：** OS・テーマ・データベースエンジンなど「ファミリー」単位で切り替えたいとき。

---

## Builder

**何を解決するか：** 多くのオプションを持つ複雑なオブジェクトを、段階的に組み立てたい。

```java
Pizza pizza = new Pizza.Builder("Large")
    .cheese(true)
    .pepperoni(true)
    .mushrooms(false)
    .build();
```

**現代の等価物：** Kotlin の名前付き引数 + デフォルト値（ほぼ Builder 不要になる）、Python の `dataclass`。

```kotlin
// Kotlin では Builder パターンがほぼ不要
val pizza = Pizza(size = "Large", cheese = true, pepperoni = true)
```

**いつ使うか：** コンストラクタ引数が多く、組み合わせが複雑なとき。テストデータの組み立てにも有効。

---

## Prototype

**何を解決するか：** 既存のオブジェクトをコピーして新しいオブジェクトを生成したい。クラスに依存せずにコピーできる。

```java
interface Prototype {
    Prototype clone();
}
```

**現代の等価物：** JavaScript の `Object.assign` / spread operator、Java の `clone()`、Python の `copy.deepcopy()`。

**いつ使うか：** オブジェクトの初期化コストが高く、類似したオブジェクトが多数必要なとき。

---

## Singleton

**何を解決するか：** クラスのインスタンスが1つだけであることを保証し、グローバルアクセスポイントを提供したい。

```java
class Config {
    private static Config instance;

    private Config() {}

    public static synchronized Config getInstance() {
        if (instance == null) instance = new Config();
        return instance;
    }
}
```

**現代の等価物：** Node.js のモジュールシステム（`require()` はキャッシュされる）、DIコンテナのスコープ設定（`@Singleton`）。

**注意点：** グローバル状態はテストを難しくし、隠れた依存を生む。DIコンテナに管理させる方が多くの場合優れる。

**いつ使うか：** 設定・ロガー・DBコネクションプールなど、共有リソースへのアクセスを一元管理したいとき。
