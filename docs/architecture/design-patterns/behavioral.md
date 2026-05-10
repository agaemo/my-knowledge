# 振る舞いパターン（Behavioral）

オブジェクト間の通信・責務の割り当て・アルゴリズムの交換を扱うパターン群。

---

## Strategy

**何を解決するか：** アルゴリズムをカプセル化し、実行時に切り替え可能にしたい。

```java
interface SortStrategy {
    void sort(List<Integer> data);
}

class QuickSort implements SortStrategy { ... }
class MergeSort implements SortStrategy { ... }

class Sorter {
    private SortStrategy strategy;
    Sorter(SortStrategy strategy) { this.strategy = strategy; }
    void sort(List<Integer> data) { strategy.sort(data); }
}
```

**現代の等価物：** 関数を引数として渡す（高階関数）。`sort(list, compareFn)` は Strategy そのもの。

```typescript
// TypeScript では関数を渡すだけ — Strategy クラスは不要
const sorted = list.sort((a, b) => a.price - b.price);
```

**いつ使うか：** ソート・検索・バリデーション・圧縮など、アルゴリズムを差し替えたいとき。

---

## Observer

**何を解決するか：** あるオブジェクトの状態変化を、依存する複数のオブジェクトに自動通知したい。

```java
interface Observer {
    void update(String event);
}

class EventBus {
    private List<Observer> observers = new ArrayList<>();
    void subscribe(Observer o) { observers.add(o); }
    void notify(String event) { observers.forEach(o -> o.update(event)); }
}
```

**現代の等価物：** JavaScript の `EventEmitter`・DOM の `addEventListener`、Vue/React のリアクティビティシステム、RxJS の Observable。

**いつ使うか：** UIの状態管理、ドメインイベントの発行、プラグイン機構など「1対多」の通知が必要なとき。

---

## Command

**何を解決するか：** 操作（リクエスト）をオブジェクトとして封じ込め、キュー・ロギング・アンドゥを可能にしたい。

```java
interface Command {
    void execute();
    void undo();
}

class MoveCommand implements Command {
    void execute() { piece.move(dx, dy); }
    void undo() { piece.move(-dx, -dy); }
}

class History {
    Deque<Command> history = new ArrayDeque<>();
    void execute(Command cmd) {
        cmd.execute();
        history.push(cmd);
    }
    void undo() { history.pop().undo(); }
}
```

**現代の等価物：** クロージャ・ラムダ。Kotlin の `() -> Unit`、JavaScript の `() => {}` は Command の簡易版。

**いつ使うか：** アンドゥ/リドゥ、タスクキュー、トランザクションログ、マクロ記録。

---

## Template Method

**何を解決するか：** 処理の骨格をスーパークラスで定義し、一部のステップだけサブクラスに実装させたい。

```java
abstract class DataMigration {
    // 骨格（テンプレート）— オーバーライド不可
    final void migrate() {
        connect();
        extractData();
        transformData(); // サブクラスが実装
        loadData();
        disconnect();
    }

    abstract void transformData();
}
```

**現代の等価物：** コールバック・フック（`beforeSave()` / `afterSave()` など）。React の `useEffect` / ライフサイクルメソッドも Template Method の考え方。

**いつ使うか：** フレームワーク設計。共通の処理フローがあり、特定ステップだけカスタマイズさせたいとき。

---

## State

**何を解決するか：** オブジェクトの内部状態によって振る舞いを変えたい。状態ごとの条件分岐を排除する。

```java
interface TrafficLightState {
    void handle(TrafficLight light);
}

class GreenState implements TrafficLightState {
    public void handle(TrafficLight light) {
        light.setState(new YellowState()); // 次の状態へ遷移
    }
}
```

**いつ使うか：** ステートマシン（注文ステータス・ワークフロー・接続状態）。`if (state == "A") ... else if (state == "B")` が増え始めたとき。

---

## Chain of Responsibility

**何を解決するか：** リクエストを処理できるオブジェクトを事前に決めず、チェーンに沿って渡していきたい。

```java
abstract class Handler {
    Handler next;
    void setNext(Handler next) { this.next = next; }
    abstract void handle(Request request);
}

class AuthHandler extends Handler {
    void handle(Request request) {
        if (!request.isAuthenticated()) throw new UnauthorizedException();
        if (next != null) next.handle(request);
    }
}
```

**現代の等価物：** Express / Koa のミドルウェアチェーン（`next()` を呼ぶパターン）、Java の Servlet Filter。

**いつ使うか：** 認証・ロギング・バリデーションなど、リクエストパイプラインの構築。

---

## Iterator

**何を解決するか：** コレクションの内部表現を公開せずに要素を順に巡回したい。

```java
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    System.out.println(it.next());
}
```

**現代の等価物：** 言語レベルで完全に吸収されているパターン。Python のイテレータプロトコル（`__iter__` / `__next__`）、JavaScript のイテラブルプロトコル（`Symbol.iterator`）、Java の enhanced for。

**いつ使うか：** ほぼ無意識に使っている。カスタムデータ構造（グラフ・ツリー）を `for...of` で巡回させたいとき、明示的に実装する。

---

## Mediator

**何を解決するか：** 多数のオブジェクトが直接参照し合う代わりに、仲介者を通じて通信させる。

```
// Before: A → B, A → C, B → C (密結合)
// After: A → Mediator → B, C (疎結合)
```

**いつ使うか：** チャットルーム・航空管制・UIコンポーネント間の調整（Redux はその一例）。

---

## Memento

**何を解決するか：** カプセル化を壊さずにオブジェクトの内部状態を保存・復元したい。

```java
class Editor {
    private String text;

    Memento save() { return new Memento(text); } // スナップショット作成
    void restore(Memento m) { text = m.getText(); } // 復元

    record Memento(String text) {}
}
```

**いつ使うか：** テキストエディタのアンドゥ、ゲームのセーブデータ、トランザクションのロールバック。

---

## Visitor

**何を解決するか：** データ構造（クラス階層）を変更せずに、新しい操作を追加したい。

```java
interface ShapeVisitor {
    void visit(Circle circle);
    void visit(Rectangle rect);
}

// 操作を追加するとき、Shape クラスには触れず Visitor を増やす
class AreaCalculator implements ShapeVisitor { ... }
class SVGExporter implements ShapeVisitor { ... }
```

**いつ使うか：** コンパイラのAST処理、ドキュメントのエクスポート（PDF・HTML・Markdown）。Shape のような安定したクラス階層に対して、操作の種類が増え続けるとき。

---

## Interpreter

**何を解決するか：** 言語の文法をクラス階層で表現し、文を評価・解釈する。

**いつ使うか：** SQLパーサー・正規表現エンジン・設定ファイルのDSLなど。実装コストが高いため、現代ではパーサーライブラリを使うことがほとんど。

---

## Null Object

*GoF 外だが頻繁に補足されるパターン。*

**何を解決するか：** `null` チェックを排除するために、「何もしない」実装を提供する。

```java
interface Logger {
    void log(String msg);
}

class NoOpLogger implements Logger {
    public void log(String msg) {} // 何もしない
}

// null チェック不要、Logger がなければ NoOpLogger を渡す
```
