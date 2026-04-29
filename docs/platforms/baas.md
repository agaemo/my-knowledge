# BaaS（Backend as a Service）

## なぜ存在するか

Webアプリ・モバイルアプリに必要なバックエンド機能（認証・DB・ストレージ・リアルタイム通信）は、多くのプロジェクトで共通している。
BaaSはこれらをマネージドサービスとして提供し、フロントエンド・モバイル開発者がバックエンドをゼロから構築しなくても済むようにする。

## 主な機能領域

| 機能 | 内容 |
|---|---|
| 認証 | メール・パスワード、OAuth（Google・GitHub など）、マジックリンク |
| データベース | クライアントから直接読み書きできるDB（セキュリティルールでアクセス制御） |
| ストレージ | 画像・動画などのファイルのアップロード・配信 |
| リアルタイム | DBの変更をWebSocketでクライアントにプッシュ |
| サーバーレス関数 | イベントドリブンなバックエンド処理 |

## 代表的なプロダクト

### Firebase

Googleが提供するBaaS。モバイル・Webアプリ向けに設計されており、リアルタイム同期が強い。

- **Firestore**: ドキュメント指向のNoSQLデータベース。クライアントからの直接読み書きとリアルタイム同期が特徴
- **Authentication**: 多様なプロバイダーに対応した認証基盤
- **Cloud Functions**: Firestoreの変更・認証イベント・HTTPリクエストをトリガーに処理を実行
- **セキュリティルール**: クライアント直接アクセスのため、ルール設計が重要

```js
// Firestoreのリアルタイム購読
onSnapshot(doc(db, 'users', userId), (snapshot) => {
  console.log(snapshot.data())
})
```

### Supabase

PostgreSQLをベースにしたOSSのBaaS。Firebaseの代替として設計されており、SQLの表現力とOSSの透明性が特徴。

- **Database**: フルマネージドのPostgreSQL。Row Level Security（RLS）でアクセス制御
- **Auth**: Firebase Authと同等の認証機能
- **Realtime**: PostgreSQLのWALを監視し、変更をWebSocketで配信
- **Edge Functions**: Denoベースのサーバーレス関数

```sql
-- RLSポリシー：本人のデータのみ参照可
create policy "users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);
```

## Firebase vs Supabase

| 観点 | Firebase | Supabase |
|---|---|---|
| DB | NoSQL（Firestore） | PostgreSQL（RDB） |
| OSSか | 否 | OSS（セルフホスト可） |
| ローカル開発 | エミュレーターあり | Dockerで完全再現可 |
| 複雑なクエリ | 苦手 | SQLで自由に書ける |
| リアルタイム | 強い | 対応（WALベース） |
| ベンダーロックイン | 高い | 低い（標準PostgreSQL） |

## いつ使うか

**向いている状況**:
- モバイル・Webアプリのバックエンドを素早く立ち上げたい
- 認証・ストレージ・DBを個別に実装したくない
- リアルタイム同期が必要（チャット・コラボレーションツール）
- 小〜中規模でサーバー管理コストを下げたい

**向かない状況**:
- 複雑なビジネスロジックやカスタムバックエンドが必要
- データ主権・コンプライアンスの要件が厳しい
- 大規模になったときのコスト・パフォーマンス要件が読めない
