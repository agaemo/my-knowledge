# Firebase

Google が提供するBaaS（Backend as a Service）。モバイル・Webアプリ向けのバックエンド機能をフルマネージドで提供する。

## なぜ存在するか

バックエンドをゼロから構築するには認証・DB・ストレージ・通知などの共通基盤が必要になる。Firebaseはそれらをまとめて提供し、フロントエンド・モバイル開発者がバックエンドを意識せずにアプリを作れるようにする。

## 主要サービス

### Authentication
メール・パスワード、Google、GitHub など多様なプロバイダーに対応した認証基盤。

```js
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

const auth = getAuth()
const provider = new GoogleAuthProvider()

const result = await signInWithPopup(auth, provider)
const user = result.user
```

### Firestore
ドキュメント指向のリアルタイムNoSQLデータベース。クライアントからの直接読み書きとリアルタイム同期が特徴。

```js
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore'

const db = getFirestore()

// 書き込み
await setDoc(doc(db, 'users', userId), { name: 'Alice', role: 'admin' })

// リアルタイム購読
onSnapshot(doc(db, 'users', userId), (snapshot) => {
  console.log(snapshot.data())
})
```

### Storage
画像・動画・ファイルを保存するオブジェクトストレージ。Firebase Authと統合したセキュリティルールで制御できる。

### Cloud Functions
サーバーレス関数。Firestoreの変更・認証イベント・HTTPリクエストをトリガーにバックエンド処理を実行する。

```js
import { onDocumentCreated } from 'firebase-functions/v2/firestore'

export const onUserCreated = onDocumentCreated('users/{userId}', (event) => {
  const user = event.data?.data()
  // ウェルカムメール送信など
})
```

### Realtime Database
JSON ツリー構造のリアルタイムDB。Firestoreより古く、シンプルなユースケース向け。新規プロジェクトでは Firestore を推奨。

### Hosting
静的ファイルとCloud FunctionsをCDN経由で配信するホスティング。

## セキュリティルール

Firestore・Storageへのアクセス制御はセキュリティルールで定義する。クライアントから直接アクセスするため、ルールの設計が重要。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // 本人のみ読み書き可
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## いつ使うか

- モバイルアプリ（iOS・Android・Flutter）のバックエンドを素早く用意したい
- リアルタイム同期が必要（チャット・コラボレーションツールなど）
- 認証・通知・ストレージを個別に実装したくない
- サーバー管理をしたくない小〜中規模のプロジェクト

## Supabase との比較

| 観点 | Firebase | Supabase |
|------|----------|----------|
| DB | NoSQL（Firestore） | PostgreSQL（RDB） |
| OSSか | 否 | OSS |
| ローカル開発 | エミュレーターあり | Dockerで完全再現可 |
| 複雑なクエリ | 苦手 | SQLで自由に書ける |
| リアルタイム | 強い | 対応（WebSocket） |
