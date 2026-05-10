# SOLID 原則

GoF デザインパターンの多くが「どうやって解決するか」であるのに対し、SOLID は「どういう設計を目指すか」という指針。  
Robert C. Martin（Uncle Bob）が2000年代に提唱。「なぜ変更が難しいか」「なぜテストが書けないか」の根本に必ずどれかの違反がある。


## S — Single Responsibility Principle（単一責任の原則）

**原則：** クラスを変更する理由は1つだけであるべき。

「責任 = 変更の理由」と捉える。2つの機能があれば、どちらかの要件変更のたびにクラスを触ることになり、もう一方への影響リスクが生まれる。

```java
// 違反: レポート生成とファイル保存という2つの責任を持つ
class Report {
    String generate() { ... }
    void saveToFile(String path) { ... } // ← ファイル I/O の責任が混入
}

// 改善: 責任を分離
class ReportGenerator {
    String generate() { ... }
}

class ReportSaver {
    void save(String content, String path) { ... }
}
```

**見分け方：** 「〇〇の変更のとき」「△△の変更のとき」と理由が複数思いつくクラスは違反候補。


## O — Open/Closed Principle（開放閉鎖の原則）

**原則：** 拡張に対しては開いており、修正に対しては閉じているべき。

新しい機能を追加するとき、既存のコードを変更せずに済む設計にする。変更はバグを生む。

```java
// 違反: 新しい形を追加するたびに AreaCalculator を変更しなければならない
class AreaCalculator {
    double calc(Object shape) {
        if (shape instanceof Circle) { ... }
        else if (shape instanceof Rectangle) { ... }
        // Triangle を追加するたびにここを編集
    }
}

// 改善: Shape を拡張することで対応。AreaCalculator には触れない
interface Shape {
    double area();
}

class Circle implements Shape { public double area() { ... } }
class Triangle implements Shape { public double area() { ... } } // 追加するだけ
```

**GoF との関係：** Strategy・Decorator・Factory Method はこの原則を実現する手段になることが多い。


## L — Liskov Substitution Principle（リスコフの置換原則）

**原則：** サブクラスは、親クラスの代わりに使えなければならない。

継承は「is-a」関係を表すが、振る舞いの互換性がなければ継承を使うべきでない。

```java
// 違反例（有名な正方形・長方形問題）
class Rectangle {
    void setWidth(int w) { this.width = w; }
    void setHeight(int h) { this.height = h; }
}

class Square extends Rectangle {
    @Override
    void setWidth(int w) {
        super.setWidth(w);
        super.setHeight(w); // 正方形なので高さも合わせる
    }
    // → Rectangle として使うコードが壊れる
}
```

**見分け方：** サブクラスで `throw UnsupportedOperationException()` が出てきたら要注意。親クラスの前提条件を強める・事後条件を弱めると違反。


## I — Interface Segregation Principle（インターフェース分離の原則）

**原則：** クライアントは、自分が使わないメソッドに依存させられるべきでない。

巨大なインターフェースを小さく分割する。実装クラスが「使わないメソッドを実装させられる」状態は設計の臭い。

```java
// 違反: Printer は scan() も fax() も実装しなければならない
interface MultifunctionDevice {
    void print();
    void scan();
    void fax();
}

// 改善: 機能ごとに分離
interface Printer { void print(); }
interface Scanner { void scan(); }
interface FaxMachine { void fax(); }

// 単純なプリンタは Printer だけ実装すればよい
class SimplePrinter implements Printer { ... }
```


## D — Dependency Inversion Principle（依存性逆転の原則）

**原則：** 上位モジュールは下位モジュールに依存してはならない。どちらも抽象に依存すべき。

「具体クラスではなくインターフェースに依存せよ」とも言われる。テスタビリティと置き換えやすさの根拠になる。

```java
// 違反: UserService が MySQL に直接依存している
class UserService {
    private MySQLUserRepository repo = new MySQLUserRepository();
    // → PostgreSQL に変えたいとき UserService を変更しなければならない
}

// 改善: 抽象（インターフェース）に依存させ、具体はDIで注入
class UserService {
    private UserRepository repo;
    UserService(UserRepository repo) { this.repo = repo; }
}
// → MySQLUserRepository でも InMemoryUserRepository でも差し替え可能
```

**現代の等価物：** DI コンテナ（Spring・Guice・Dagger）はこの原則を自動化するツール。テストでモック注入できるのはこの原則のおかげ。


## まとめ

| 原則 | 一言 | 違反のサイン |
|---|---|---|
| S | 変更理由を1つに絞る | クラスが「〜と〜と〜を担当」している |
| O | 拡張はコード追加で、既存を変えない | 機能追加のたびに `if-else` が増える |
| L | 親の代わりに子を使っても壊れない | `UnsupportedOperationException` の実装 |
| I | 使わないメソッドに依存させない | インターフェースに空実装が並ぶ |
| D | 抽象に依存し、具体に依存しない | `new 具体クラス()` がコード中に散在 |
