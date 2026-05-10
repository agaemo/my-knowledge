# 構造パターン（Structural）

クラスやオブジェクトを組み合わせて、より大きな構造を作るパターン群。  
インターフェースの変換・機能の追加・複雑さの隠蔽を担う。

---

## Adapter

**何を解決するか：** 互換性のないインターフェース同士を接続したい。

```java
// 外部ライブラリのインターフェース（変更できない）
class LegacyLogger {
    void log(String message) { ... }
}

// アプリが期待するインターフェース
interface Logger {
    void info(String message);
}

// Adapter — LegacyLogger を Logger として使えるようにする
class LoggerAdapter implements Logger {
    private LegacyLogger legacy = new LegacyLogger();
    public void info(String message) { legacy.log(message); }
}
```

**いつ使うか：** 外部ライブラリや既存コードを、変更せずに新しいインターフェースに適合させたいとき。

---

## Bridge

**何を解決するか：** 抽象（何をするか）と実装（どうするか）を独立して拡張したい。

継承で組み合わせると爆発的にクラスが増える問題を解決する。

```
// 継承だと: RemoteControl × (TV, Radio) × (BasicRemote, AdvancedRemote) = 4クラス
// Bridge だと: Remote と Device を別の階層で拡張できる
```

**いつ使うか：** 抽象と実装の両軸で独立に拡張が必要なとき。プラットフォーム別実装（Windows/Mac/Linux）の分離など。

---

## Composite

**何を解決するか：** 個々のオブジェクトとオブジェクトの集合（コンテナ）を同じインターフェースで扱いたい。

```java
interface Component {
    void render();
}

class Leaf implements Component {
    public void render() { /* 自分を描画 */ }
}

class Container implements Component {
    List<Component> children = new ArrayList<>();
    public void render() {
        children.forEach(Component::render); // 子が Leaf でも Container でも同じ呼び方
    }
}
```

**いつ使うか：** ファイルシステム（ファイル vs ディレクトリ）、UIコンポーネントツリー、組織階層など木構造データを扱うとき。

---

## Decorator

**何を解決するか：** 継承を使わず、オブジェクトに動的に機能を追加したい。

```java
interface DataSource {
    void write(String data);
}

class FileDataSource implements DataSource {
    public void write(String data) { /* ファイルに書き込む */ }
}

class EncryptionDecorator implements DataSource {
    private DataSource wrapped;
    public EncryptionDecorator(DataSource source) { this.wrapped = source; }
    public void write(String data) {
        wrapped.write(encrypt(data)); // 暗号化してから委譲
    }
}

// 組み合わせ可能
DataSource source = new CompressionDecorator(new EncryptionDecorator(new FileDataSource()));
```

**現代の等価物：** Python の `@decorator` 構文、Express/Koa のミドルウェア、Java の Stream API。

**いつ使うか：** ロギング・キャッシュ・圧縮・暗号化など、横断的機能を組み合わせ可能に追加したいとき。

---

## Facade

**何を解決するか：** 複雑なサブシステム群に対して、シンプルな窓口インターフェースを提供したい。

```java
// 内部は複雑だが、外部には単純な API を公開
class VideoConverter {
    public File convert(String filename, String format) {
        VideoFile file = new VideoFile(filename);
        Codec codec = CodecFactory.extract(file);
        BitrateReader reader = new BitrateReader(file, codec);
        VideoEncoder encoder = new VideoEncoder(reader, format);
        return encoder.getResult();
    }
}
```

**いつ使うか：** ライブラリや複雑なシステムの初期化・利用をシンプルに見せたいとき。マイクロサービスの BFF（Backend for Frontend）も Facade の考え方。

---

## Flyweight

**何を解決するか：** 大量の細かいオブジェクトを効率的に扱いたい。共有できる状態（内部状態）と個別の状態（外部状態）を分離する。

```java
// 木を100万本描画するとき、種類（色・テクスチャ）は共有し、座標だけ個別に持つ
class TreeType { // 共有（Flyweight）
    String name, color, texture;
}

class Tree { // 個別
    int x, y;
    TreeType type; // 共有オブジェクトへの参照
}
```

**いつ使うか：** ゲームの大量スプライト、テキストエディタの文字オブジェクト、地図上の大量マーカーなど、メモリ消費が問題になるとき。

---

## Proxy

**何を解決するか：** 別のオブジェクトへのアクセスを制御する代理オブジェクトを提供したい。

種類：
- **Virtual Proxy** — コストの高いオブジェクトの遅延初期化
- **Protection Proxy** — アクセス制御
- **Remote Proxy** — 別プロセス・別サーバー上のオブジェクトへのアクセス（RPC の根幹）
- **Caching Proxy** — 結果をキャッシュ

```java
interface Image {
    void display();
}

class RealImage implements Image {
    RealImage(String filename) { loadFromDisk(); } // コストが高い
    public void display() { ... }
}

// 初めて display() が呼ばれるまでロードを遅延
class LazyImage implements Image {
    private RealImage real;
    private String filename;
    public void display() {
        if (real == null) real = new RealImage(filename);
        real.display();
    }
}
```

**現代の等価物：** Java の動的プロキシ（`java.lang.reflect.Proxy`）、JavaScript の `Proxy` オブジェクト、Spring AOP（トランザクション・ログなどを Proxy で差し込む）。
