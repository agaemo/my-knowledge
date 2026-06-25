# プロパティベーステスト

## なぜ存在するか

例ベースのテスト（通常のユニットテスト）は、開発者が思いついた例しか検証できない。エッジケースや境界値の見落としが多い。

プロパティベーステストは、**入力を自動生成**して大量のケースを試し、「どんな入力でも成り立つべき性質（プロパティ）」を検証する。

```
例ベースのテスト:
  expect(add(1, 2)).toBe(3)   // 開発者が考えた1例
  expect(add(0, 0)).toBe(0)   // もう1例

プロパティベーステスト:
  任意の a, b に対して add(a, b) === add(b, a) が成り立つ  // 交換法則
  → ツールが a=0, a=-1, a=MAX_INT ... を自動生成して検証
```

## プロパティの考え方

「この関数はどんな入力でもXを満たすべき」という性質を言語化する。

| プロパティのパターン | 例 |
|---|---|
| 逆操作で元に戻る | `decode(encode(s)) === s` |
| 交換・結合法則 | `sort(sort(arr))` の結果は `sort(arr)` と同じ |
| 不変条件 | ソート後の配列の長さは元と同じ |
| 境界値での安全性 | 空配列・最大値・負の数でもクラッシュしない |
| 対称性 | `serialize` → `deserialize` が元のオブジェクトと等しい |

## ツール：fast-check（TypeScript / JavaScript）

```ts
import fc from 'fast-check';

// 加算の交換法則
test('add は交換法則を満たす', () => {
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) => {
      return add(a, b) === add(b, a);
    })
  );
});

// ソートの不変条件
test('sort 後も配列の長さは変わらない', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      return sort(arr).length === arr.length;
    })
  );
});
```

fast-check は失敗したとき、**最小再現ケース（shrinking）** を自動的に探してレポートする。

```
Property failed after 42 tests
{ seed: 1234, path: "0:1", endOnFailure: true }
Counterexample: [-2147483648]  ← 失敗する最小の入力を絞り込んでくれる
```

## 例ベーステストとの組み合わせ

プロパティベーステストは例ベーステストの**置き換えではなく補完**。

```ts
// 例ベース: 具体的な動作を文書化する
test('空文字列を encode すると空文字列が返る', () => {
  expect(encode('')).toBe('');
});

// プロパティベース: 任意の入力での性質を保証する
test('encode → decode で元に戻る', () => {
  fc.assert(
    fc.property(fc.string(), (s) => {
      return decode(encode(s)) === s;
    })
  );
});
```

## いつ使うか

**特に有効な場面**:
- エンコード・シリアライズ・パース処理（可逆性の検証）
- ソート・フィルター・集計などのアルゴリズム
- 数値計算（オーバーフロー・精度の問題）
- バリデーションロジック（境界値の見落とし防止）

**向かない場面**:
- 外部 API 呼び出しを含む処理（副作用があって繰り返せない）
- UI の見た目の検証
- 「プロパティ」が言語化しにくいビジネスロジック
