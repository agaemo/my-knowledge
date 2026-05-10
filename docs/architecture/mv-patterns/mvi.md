# MVI（Model-View-Intent）

MVVM をさらに厳格にし、状態変化を**単方向の不変フロー**に限定したパターン。  
Elm アーキテクチャ（2012年）を起源とし、Redux・Jetpack Compose・SwiftUI の設計思想に影響を与えた。

## 構成

```
View → Intent（ユーザー操作） → Reducer → 新しい State → View
         ↑                                               ↓
         └───────────────────────────────────────────────┘
                        （単方向ループ）
```

| 役割 | 責任 |
|---|---|
| **Model** | 画面全体の状態（UI State）。イミュータブルなデータ |
| **View** | State を受け取って表示するだけ。状態を持たない |
| **Intent** | ユーザー操作・イベントを表すデータ（「ボタンを押した」「テキストを入力した」） |
| **Reducer** | 現在の State と Intent を受け取り、次の State を返す純粋関数 |

## コード例（Redux / TypeScript）

```typescript
// State — 画面全体を1つのイミュータブルなオブジェクトで表す
type CounterState = {
    count: number;
    isLoading: boolean;
};

// Intent — 起きうる操作を列挙（Action とも呼ぶ）
type CounterIntent =
    | { type: 'INCREMENT' }
    | { type: 'DECREMENT' }
    | { type: 'RESET' };

// Reducer — 純粋関数。副作用なし
function reducer(state: CounterState, intent: CounterIntent): CounterState {
    switch (intent.type) {
        case 'INCREMENT': return { ...state, count: state.count + 1 };
        case 'DECREMENT': return { ...state, count: state.count - 1 };
        case 'RESET':     return { ...state, count: 0 };
    }
}

// View — State を受け取るだけ
function CounterView({ state, dispatch }: { state: CounterState, dispatch: (i: CounterIntent) => void }) {
    return (
        <div>
            <span>{state.count}</span>
            <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
        </div>
    );
}
```

## MVVM との違い

MVVM では ViewModel が状態を「更新」する（ミュータブルな操作）。  
MVI では Reducer が古い State + Intent から「新しい State を作る」（イミュータブルな変換）。

```
MVVM: state.count++              ← 既存の状態を変更
MVI:  return { ...state, count: state.count + 1 }  ← 新しい状態を生成
```

## なぜ存在するか

MVVM でも ViewModel の状態が複数のメソッドで変更されると、「なぜこの状態になったか」の追跡が難しくなる。  
MVI では全ての状態変化が Intent → Reducer の一箇所に集まるため、再現性が高く、タイムトラベルデバッグ（Redux DevTools）が可能になる。

## テスタビリティ

Reducer が純粋関数のため、テストが最もシンプル。

```typescript
test('INCREMENT で count が増える', () => {
    const state = { count: 0, isLoading: false };
    const next = reducer(state, { type: 'INCREMENT' });
    expect(next.count).toBe(1);
    expect(state.count).toBe(0); // 元の State は変化しない
});
```

## いつ使うか

- Redux を使う React アプリ
- Jetpack Compose（Android の推奨アーキテクチャ）
- 状態変化の履歴を追跡・デバッグしたいとき
- 複数の操作が絡み合う複雑な状態管理が必要なとき
