# リアクティブプログラミング

「データが変化したら、それに依存する処理が自動的に実行される」という考え方。  
Excel のセルが好例：A1 に数値を入れると、`=A1*2` の式が入ったセルが自動的に更新される。

## なぜ存在するか

UI はデータと表示を同期させる必要がある。非リアクティブな設計では同期を手動で書く。

```javascript
// 非リアクティブ: データを変えたら、表示を手動で更新しなければならない
let count = 0;

function increment() {
    count++;
    document.getElementById('counter').textContent = count; // 手動で更新
}
```

アプリが大きくなるほど「どこを更新すれば画面が正しくなるか」の管理が破綻する。  
リアクティブプログラミングはデータの変化を**宣言的**に伝播させ、この手動同期をなくす。

## リアクティビティの基本モデル

```
リアクティブな値（Signal / ref）
      ↓ 変化を検知
依存している計算（computed / derived state）が自動で再計算
      ↓
依存している副作用（watch / effect）が自動で実行
      ↓
UIが自動で更新される
```

## Vue のリアクティビティ

Vue 3 の Composition API は `ref` / `computed` / `watch` でリアクティビティを表現する。

```typescript
import { ref, computed, watch } from 'vue';

const price = ref(100);           // リアクティブな値
const taxRate = ref(0.1);

// price か taxRate が変わると自動で再計算される
const priceWithTax = computed(() => price.value * (1 + taxRate.value));

// priceWithTax が変わると自動で実行される
watch(priceWithTax, (newVal) => {
    console.log(`税込価格: ${newVal}`);
});

price.value = 200;
// → priceWithTax が 220 に自動更新 → watch が自動実行
```

Vue の内部では依存関係を追跡している。`computed` が評価されるとき「どの ref を読んだか」を記録し、その ref が変わったときだけ再計算する。

## Signal（現代のリアクティビティ）

2023年以降、フレームワークを超えて「Signal」という概念が広まっている。Vue の `ref`・Solid.js の `createSignal`・Angular のシグナル・Preact Signals が同じアイデアを共有する。

```typescript
// Solid.js の例
import { createSignal, createEffect } from 'solid-js';

const [count, setCount] = createSignal(0);

// count が変わったときだけ実行される（依存関係を自動追跡）
createEffect(() => {
    console.log(count()); // count を読むことで依存が登録される
});

setCount(1); // → Effect が自動実行される
```

Signal の特徴は**細粒度のリアクティビティ**。変化した値だけが再計算・再レンダリングされ、コンポーネント全体を再描画しない。

## React との違い

React はリアクティブプログラミングとは設計が異なる。

```
Vue / Solid / Signal 系:
  データの変化を追跡 → 変化した部分だけ更新（プッシュ型）

React:
  状態が変わると setState → コンポーネント全体を再レンダリング → 仮想 DOM で差分を適用
  （プル型。変化の追跡ではなく比較による更新）
```

React も `useMemo` / `useCallback` / `React.memo` で不要な再計算を防ぐが、これはリアクティビティではなくメモ化によるパフォーマンス最適化。

## RxJS と Observable

非同期イベントのストリームをリアクティブに扱うライブラリ。Angular で広く使われる。

```typescript
import { fromEvent, debounceTime, switchMap } from 'rxjs';

// 検索入力の例
fromEvent(searchInput, 'input').pipe(
    debounceTime(300),              // 300ms 待つ
    switchMap(e => searchApi(e.target.value)), // 前のリクエストをキャンセル
).subscribe(results => {
    renderResults(results);
});
```

「時間をまたぐイベントの連鎖」を宣言的に書ける。ただし学習コストが高く、Promise / async-await で十分な場面に使うと過剰になる。

## いつ使うか

- **Vue / Angular を使うなら** 自動的にリアクティビティの上で開発している
- **React を使うなら** `useState` + 仮想 DOM の仕組みで似たことを実現している
- **RxJS** は WebSocket のような継続的なストリーム・複雑なイベント合成に向いている
- **Signal** はパフォーマンスが重要な場面（大量の細かい更新）で特に効果がある
