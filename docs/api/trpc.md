# tRPC

## 何か

TypeScript のフルスタックアプリ向けの RPC フレームワーク。
**スキーマ定義ファイルなし・コード生成なし**でサーバーとクライアントの型安全を実現する。

「tRPC の t は TypeScript の t」。gRPC とは別物。

## gRPC・REST との比較

| | REST | gRPC | tRPC |
|---|---|---|---|
| スキーマ定義 | OpenAPI（任意） | .proto ファイル（必須） | TypeScript コード（自動） |
| コード生成 | 任意 | 必須 | **不要** |
| 型安全 | 手動で合わせる | proto から自動生成 | **TypeScript で自動推論** |
| 対応言語 | 何でも | 何でも | **TypeScript のみ** |
| ブラウザ対応 | 完全対応 | grpc-web が必要 | 完全対応 |

## 仕組み

サーバーで定義した関数の型がそのままクライアントに伝わる。

```ts
// server/router.ts
import { z } from 'zod';
import { router, publicProcedure } from './trpc';

export const appRouter = router({
  user: router({
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await userRepo.findById(input.id);
        // 戻り値: User | null — この型がクライアントに伝わる
      }),

    create: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return await userRepo.create(input);
      }),
  }),
});

export type AppRouter = typeof appRouter; // ← この型をクライアントに渡す
```

```ts
// client/app.ts
import { createTRPCProxyClient } from '@trpc/client';
import type { AppRouter } from '../server/router';

const trpc = createTRPCProxyClient<AppRouter>({ ... });

// 型が完全に推論される
const user = await trpc.user.getById.query({ id: '123' });
//    ^ User | null — IDEで補完される

const newUser = await trpc.user.create.mutate({
  email: 'alice@example.com',
  name: 'Alice',
  // 不正な入力はコンパイルエラー
});
```

## React との統合

Next.js や React と組み合わせると最も効果が出る。

```ts
// React コンポーネントで直接使う
import { trpc } from '../utils/trpc';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = trpc.user.getById.useQuery({ id: userId });
  //            ^ User | null | undefined — 型安全

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not found</div>;

  return <div>{user.name}</div>;
}
```

## バリデーション（Zod）

tRPC は Zod と組み合わせて使うのが標準。実行時バリデーションと型推論を同時に行う。

```ts
.input(
  z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    age: z.number().min(18, '18歳以上のみ登録できます'),
    role: z.enum(['admin', 'user']),
  })
)
// input の型は自動的に { email: string; age: number; role: 'admin' | 'user' } に推論される
```

## 認証・ミドルウェア

```ts
// 認証済みのプロシージャを定義
const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } });
});

// 使い方
export const appRouter = router({
  profile: router({
    update: protectedProcedure  // ← 認証必須
      .input(z.object({ name: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return await userRepo.update(ctx.user.id, input);
      }),
  }),
});
```

## いつ tRPC を使うか

### 向いている場面

- **TypeScript フルスタック**（Next.js・Remix など）
- クライアントとサーバーを同じリポジトリで管理している
- 型安全を最大化したい
- コード生成の手間を省きたい

### 向いていない場面

- TypeScript 以外のクライアントがある（Android・iOS ネイティブ等）
- 外部に公開する API（REST か GraphQL の方が汎用的）
- マイクロサービス間の通信（gRPC の方が高速・多言語対応）

## 制約

- **TypeScript 専用**: Python・Go・Swift などからは使えない
- 外部 API として公開には向かない（OpenAPI の代わりにはならない）
- サーバーとクライアントの強い結合（分離したいなら REST/GraphQL）
