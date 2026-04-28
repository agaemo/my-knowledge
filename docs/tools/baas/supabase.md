# Supabase

PostgreSQLをベースにしたOSSのBaaS。Firebase の代替として設計されており、認証・データベース・ストレージ・リアルタイム通信をセルフホストまたはクラウドで提供する。

## なぜ存在するか

FirebaseはNoSQLのため複雑なリレーショナルなデータ設計が難しく、ベンダーロックインも懸念される。Supabaseは標準PostgreSQLを使うことで、SQLの表現力とOSSの透明性を両立させた。

## 主要機能

### Database（PostgreSQL）
フルマネージドの PostgreSQL。Row Level Security（RLS）でテーブル単位のアクセス制御を行う。

```sql
-- RLS ポリシーの例：本人のデータのみ参照可
create policy "users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);
```

### Auth
メール・パスワード、OAuthプロバイダー、マジックリンクに対応した認証基盤。

```js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

// サインアップ
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
})

// 現在のユーザー取得
const { data: { user } } = await supabase.auth.getUser()
```

### Database クエリ（JS クライアント）
PostgREST を通じてREST APIが自動生成される。

```js
// 取得
const { data, error } = await supabase
  .from('posts')
  .select('id, title, author(name)')
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(10)

// 挿入
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'Hello', body: '...', user_id: user.id })
  .select()
```

### Realtime
PostgreSQLのWAL（Write-Ahead Log）を監視し、テーブルの変更をWebSocketでクライアントに配信する。

```js
const channel = supabase
  .channel('posts-changes')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
    console.log('新規投稿:', payload.new)
  })
  .subscribe()
```

### Storage
ファイルのアップロード・配信。バケット単位でRLSポリシーを適用できる。

```js
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file)
```

### Edge Functions
Deno ベースのサーバーレス関数。Supabase のサービスと同一ネットワーク内で動作するため低レイテンシ。

## ローカル開発

Supabase CLIでローカル環境をDocker上に完全再現できる。

```bash
supabase init
supabase start        # PostgreSQL・Auth・Storage などが起動
supabase db diff      # スキーマ変更をマイグレーションファイルに出力
supabase db push      # マイグレーションをリモートに適用
```

## いつ使うか

- RDB（PostgreSQL）でデータを管理したい
- 複雑なリレーションや集計クエリが必要
- ベンダーロックインを避けたい（OSSでセルフホスト可能）
- Firebase からの移行先を探している

## Firebase との比較

| 観点 | Supabase | Firebase |
|------|----------|----------|
| DB | PostgreSQL（RDB） | NoSQL（Firestore） |
| OSSか | OSS | 否 |
| ローカル開発 | Dockerで完全再現可 | エミュレーターあり |
| 複雑なクエリ | SQLで自由に書ける | 苦手 |
| リアルタイム | 対応（WALベース） | 強い |
