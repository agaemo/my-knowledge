# 状態管理パターン

フロントエンドの「状態（State）」をどこに・どう持つかを設計するパターン。  
UI が複雑になるにつれて「どのコンポーネントがどのデータを持つか」が管理の核心になる。

## 状態とは何か

状態とは、「時間とともに変化し、UIに影響するデータ」。

```
状態の例:
  - ログイン中のユーザー情報
  - フォームの入力値
  - モーダルが開いているか
  - サーバーから取得した商品一覧
  - ローディング中かどうか
```

## 状態の種類

まず「何の状態か」を区別することが設計の出発点。

| 種類 | 内容 | 例 |
|---|---|---|
| **ローカル UI 状態** | 特定コンポーネントだけが使う | モーダルの開閉・フォームの入力値 |
| **グローバル UI 状態** | 複数コンポーネントが共有する | 認証状態・テーマ・言語設定 |
| **サーバー状態** | サーバーのデータをフロントにキャッシュしたもの | APIから取得したユーザー一覧・商品データ |
| **URL 状態** | URL に反映される状態 | 検索クエリ・ページ番号・フィルター |

**よくある失敗：** サーバー状態をグローバルストアに入れる。サーバー状態は専用のライブラリ（React Query・SWR）に任せる方が、キャッシュ・再取得・同期が自動化されて扱いやすい。

## Flux アーキテクチャ

Facebook が 2014年に提唱した、状態管理の考え方の基礎。**単方向データフロー**が核心。

```
Action → Dispatcher → Store → View → Action → ...
```

- **Action** — 「何が起きたか」を表すオブジェクト（`{ type: 'ADD_TO_CART', payload: item }`）
- **Store** — 状態を保持する唯一の場所
- **View** — Store の状態を表示するだけ
- **単方向** — View は直接 Store を変更しない。必ず Action を発行する

「双方向データバインディングで状態の変化の追跡が困難になった」という MVC の課題への回答。

## Redux

Flux の考え方を実装したライブラリ。3つの原則が特徴。

```
1. Single Source of Truth — アプリ全体の状態を1つの Store に
2. State is Read-Only     — 状態を直接変更しない。Action を dispatch する
3. Pure Function Reducers — (state, action) => newState で状態遷移を表現

Reducer の例:
  function cartReducer(state = [], action) {
    switch (action.type) {
      case 'ADD_ITEM': return [...state, action.payload];
      case 'REMOVE_ITEM': return state.filter(i => i.id !== action.payload.id);
      default: return state;
    }
  }
```

**Redux の価値：** タイムトラベルデバッグ（Redux DevTools）・状態変化の完全な追跡・テストしやすさ。

**現在の立ち位置：** ボイラープレートが多く、小中規模では過剰になりやすい。Redux Toolkit が冗長さを改善した。

## 軽量なグローバル状態管理

Redux の複雑さへの反動で、シンプルなライブラリが普及した。

**Zustand（React）**
```typescript
const useStore = create<State>((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
}));
// コンポーネントで: const { count, increment } = useStore();
```

**Jotai / Recoil** — 原子（Atom）単位で状態を管理。コンポーネントに必要な状態だけを購読できる。

## サーバー状態の分離

API から取得したデータを Redux や Zustand に入れると、キャッシュ・ローディング・再取得・エラーハンドリングを全部自前で書く必要が生じる。

**React Query / SWR** はサーバー状態に特化したライブラリで、これを自動化する。

```typescript
// React Query の例
const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使う
});
// ローディング・エラー・キャッシュ・再取得が自動管理される
```

## 設計の判断基準

```
この状態、どこに置くべきか？

  1 コンポーネントだけが使う
      → ローカル状態（useState）

  親子間で共有する（バケツリレーが浅い）
      → Props で渡す

  多数のコンポーネントが共有する UI 状態（認証・テーマ）
      → Context API または Zustand などの軽量グローバルストア

  サーバーのデータ
      → React Query / SWR

  Redux が必要なケース
      → 状態変化の完全な追跡・タイムトラベルデバッグが必要なとき
```

## いつ複雑な状態管理が必要か

「状態をどこに置くか」に迷い始めたとき・Prop drilling が深くなったとき・同じデータを複数箇所で取得していると気づいたとき。  
早期に複雑な状態管理を入れると、不必要な間接層が生まれる。**まずローカル状態で始め、必要になったら引き上げる**のが原則。
