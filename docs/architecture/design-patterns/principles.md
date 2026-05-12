# プログラミング原則

SOLID が OOP の設計指針であるのに対し、ここで扱う原則はより広く、言語やパラダイムを問わず適用される実践的な指針。

## DRY — Don't Repeat Yourself

**原則：** 知識はシステム内で唯一・明確・権威ある表現を持つべき。

1999年の書籍 *The Pragmatic Programmer*（Dave Thomas・Andy Hunt）で提唱。「コードをコピペしない」と理解されがちだが、本質は**知識の重複を避ける**こと。コードだけでなく、設定・ドキュメント・スキーマの重複にも適用される。

```python
# 違反: 割引計算ロジックが2箇所にある
def cart_total(items):
    return sum(item.price * 0.9 for item in items)  # 10%引き

def invoice_total(items):
    return sum(item.price * 0.9 for item in items)  # 同じロジックが重複

# 改善: 知識を1箇所に集める
DISCOUNT_RATE = 0.9

def apply_discount(price):
    return price * DISCOUNT_RATE

def cart_total(items):
    return sum(apply_discount(item.price) for item in items)
```

**注意：** 「コードが似ている」と「知識が重複している」は別。偶然似ているだけで意味が異なるコードを無理に共通化すると、一方の変更がもう一方を壊す。**WET（Write Everything Twice）を恐れすぎて早期抽象化するのは DRY 違反より危険**。

## KISS — Keep It Simple, Stupid

**原則：** 設計はできる限りシンプルに保つ。複雑さは意図的に導入しない限り価値を生まない。

航空エンジニアの Kelly Johnson が提唱。「未来のために複雑にする」「賢いコードを書く」衝動への警戒。

```typescript
// 過度に賢いコード
const getStatus = (n: number) => ['inactive', 'active', 'pending'][n] ?? 'unknown';

// シンプルで読みやすいコード
function getStatus(n: number): string {
    if (n === 0) return 'inactive';
    if (n === 1) return 'active';
    if (n === 2) return 'pending';
    return 'unknown';
}
```

**いつ使うか：** コードレビューで「これは本当に必要な複雑さか？」と問い続けるための基準として。抽象化・最適化・汎用化を検討するたびに立ち返る。

## YAGNI — You Ain't Gonna Need It

**原則：** 今必要でない機能は実装しない。

Extreme Programming（XP）で提唱。「将来使うかもしれない」という推測で書かれたコードは、使われないまま保守コストだけを生み続ける。

```java
// YAGNI 違反: まだ誰も国際化を要求していない
class UserService {
    User createUser(String name, String email, Locale locale, TimeZone timezone) {
        // 将来のためにロケール対応を入れた — でも使われない
    }
}

// YAGNI に従う: 必要になったとき追加する
class UserService {
    User createUser(String name, String email) { ... }
}
```

**DRY・KISS との関係：** DRY は「重複するな」、KISS は「シンプルにせよ」、YAGNI は「余計に作るな」。3つは補完し合い、**過剰エンジニアリングへの対抗手段**として機能する。

## Law of Demeter — デメテルの法則

**別名：** Principle of Least Knowledge（最小知識の原則）

**原則：** オブジェクトは直接の知り合いとだけ話せ。見知らぬオブジェクトに話しかけるな。

1987年にノースイースタン大学で提唱。「ドット2つ以上のチェーン」はしばしば違反のサイン。

```java
// 違反: Customer の内部構造（Wallet → Money）を知っている
amount = customer.getWallet().getMoney().getAmount();

// 改善: Customer に必要な操作を持たせる
amount = customer.getAmount();
```

**なぜ重要か：** チェーンが長いほど、間にある全クラスの内部構造に依存することになる。`Wallet` の実装が変わると、`customer.getWallet()` を呼ぶすべての場所が壊れる。

**いつ使うか：** メソッドチェーンが長くなったとき。ただし Builder パターンや Stream API のような「流暢なインターフェース（Fluent Interface）」は例外 — 同じオブジェクトを返しているだけなので違反ではない。

## Composition over Inheritance — 合成優先の原則

**原則：** 継承よりもオブジェクトの合成（委譲）を優先せよ。

GoF 本でも言及されている重要な指針。継承は「is-a」関係を表すが、再利用のために使うと脆い基底クラス問題（親の変更が子を壊す）が生じる。

```java
// 継承: "LoggingList は ArrayList だ" — 本当にそうか？
class LoggingList extends ArrayList<String> {
    @Override
    public boolean add(String item) {
        log(item);
        return super.add(item);
    }
    // ArrayList の実装変更に引きずられる
}

// 合成: "LoggingList は List を持つ"
class LoggingList {
    private final List<String> list = new ArrayList<>();

    public boolean add(String item) {
        log(item);
        return list.add(item);
    }
    // list の実装を自由に差し替えられる
}
```

**いつ使うか：** 再利用が目的なら合成を選ぶ。継承を使うのは「真の is-a 関係」かつ「LSP（リスコフの置換原則）を満たせる」ときのみ。

## Separation of Concerns — 関心の分離

**原則：** 異なる関心事（責務）は異なる部分に分けよ。

Edsger Dijkstra が 1974年に提唱した概念。SOLID の SRP と近いが、より広い概念。SRP が「クラスの変更理由を1つに」と言うのに対し、SoC は「HTML はコンテンツ、CSS はスタイル、JS は振る舞い」のような大きな粒度にも適用される。

**具体例：**

| レイヤー | 関心 |
|---|---|
| プレゼンテーション層 | 表示の仕方 |
| ビジネスロジック層 | ルールの計算 |
| データアクセス層 | データの読み書き |

```typescript
// 違反: UI コンポーネントがビジネスロジックと API 呼び出しを持つ
function UserCard({ userId }) {
    const discount = user.isPremium ? price * 0.8 : price; // ビジネスロジック
    const data = await fetch(`/api/users/${userId}`);      // データ取得
    return <div>{data.name} — {discount}円</div>;
}

// 改善: 関心を分離
// ビジネスロジック → useDiscount hook
// データ取得 → useUser hook
// 表示 → UserCard（State を受け取るだけ）
```

**アーキテクチャへの影響：** レイヤードアーキテクチャ・ヘキサゴナルアーキテクチャ・MVC などの根拠になる概念。「なぜこう分けるのか」の答えが SoC。

## 車輪の再発明（Reinventing the Wheel）

既存のライブラリ・フレームワーク・パターンで解決できる問題を、あえて自前で実装してしまうこと。

**問題になるケース：**

```
日付処理を自前で実装 → バグだらけ・タイムゾーン対応漏れ
→ date-fns や Day.js を使えば解決していた

認証の暗号化を自前で実装 → セキュリティホール
→ 実績あるライブラリを使うべき場面
```

**ただし、意図的な再実装が正しい場合もある：**
- 外部依存を減らしたい（ライブラリのサイズ・ライセンスの問題）
- 既存実装が要件を満たさない
- 学習目的

DRY・YAGNI と密接に関係する。「すでにあるものを作らない」という判断がこの言葉の核心。

## ボイラープレート（Boilerplate）

毎回書かなければならない定型的なコードのこと。本質的なロジックではないが省略できない。

```typescript
// ボイラープレートが多い例（Redux 旧来のパターン）
// Action Type 定義・Action Creator・Reducer・型定義… を毎回書く

// ボイラープレートを減らした例（Redux Toolkit）
const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
        increment: state => { state.value += 1 },
    },
});
```

フレームワークやライブラリが「ボイラープレートを減らす」ことを売りにすることが多い。コード生成（scaffolding）・テンプレート・規約（Convention over Configuration）はボイラープレートを削減する手段。

**DI との関係：** DI コンテナを使わず手動で依存を渡すとボイラープレートが増える。コンテナはこの定型コードを自動化する。
