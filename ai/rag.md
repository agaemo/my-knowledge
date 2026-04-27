# RAG（Retrieval-Augmented Generation）

## 何か

LLM の回答を生成する前に、外部の知識ベースから関連情報を検索して文脈に加える手法。

LLM 単体の問題:
- 学習データの知識カットオフがある（最新情報を知らない）
- 社内ドキュメント・プロジェクト固有の情報を持っていない
- 根拠のある情報を出せない（ハルシネーション）

RAGはこれらを解決する。

## 基本的な流れ

```
[質問] → [検索] → [関連文書を取得] → [LLMへ渡す] → [回答生成]

1. ユーザーの質問をベクトル化
2. ベクトルDBで類似度の高い文書チャンクを検索
3. 取得した文書 + 質問をLLMのプロンプトに組み込む
4. LLMが文書を根拠に回答する
```

## システム構成

```
                  ┌─────────────────────────────┐
                  │         Knowledge Base       │
  [ドキュメント]  │  チャンク化 → Embedding →   │
                  │        Vector DB 格納        │
                  └─────────────────────────────┘
                               ↓ 検索
[質問] → Embedding → 類似チャンク取得 → LLM → [回答]
```

## インデックス構築（オフライン）

### チャンク化

文書を小さな単位に分割する。

```ts
// 固定長チャンク（シンプルだが文脈が切れやすい）
const chunks = splitByTokens(document, { size: 512, overlap: 50 });

// セマンティックチャンク（段落・見出しで分割。精度が高い）
const chunks = splitByMarkdownHeaders(document);
```

**overlap（重複）を設ける理由**: チャンクの境界で文脈が切れるのを防ぐ。
チャンク末尾50トークンを次のチャンクの先頭にも含める。

### Embedding（埋め込み）

テキストを数値ベクトルに変換する。意味が近いテキストはベクトルも近くなる。

```ts
import OpenAI from 'openai';
const openai = new OpenAI();

const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: chunkText,
});

const vector = embedding.data[0].embedding; // number[]
```

### Vector DB への格納

```ts
// pgvector（PostgreSQL拡張）の例
await db.query(
  'INSERT INTO documents (content, embedding) VALUES ($1, $2)',
  [chunkText, JSON.stringify(vector)]
);
```

## 検索・生成（オンライン）

```ts
async function ragQuery(question: string): Promise<string> {
  // 1. 質問をベクトル化
  const queryEmbedding = await embed(question);

  // 2. 類似チャンクを取得（上位3件）
  const chunks = await vectorDb.similaritySearch(queryEmbedding, { topK: 3 });

  // 3. プロンプトに組み込む
  const context = chunks.map(c => c.content).join('\n\n---\n\n');
  const prompt = `
以下のドキュメントを参考に質問に答えてください。
ドキュメントに答えがない場合は「わかりません」と答えてください。

## ドキュメント
${context}

## 質問
${question}
  `;

  // 4. LLMで回答生成
  const response = await llm.generate(prompt);
  return response;
}
```

## チャンク戦略の比較

| 戦略 | 精度 | 実装コスト | 向いている文書 |
|---|---|---|---|
| 固定長（トークン数） | 低め | 低 | 構造のない文書 |
| 段落・見出しで分割 | 高め | 中 | Markdown・HTML |
| 文単位 | 高い | 中 | 短い事実情報が多い文書 |
| 階層型（親子チャンク） | 最高 | 高 | 長い技術文書 |

## Re-ranking（再ランキング）

ベクトル検索は「意味が近い」を返すが、「質問に答えられる」かどうかは別問題。
Re-ranking モデルで取得結果を並び替えると精度が上がる。

```ts
// ベクトル検索で20件取得 → Re-rankで上位3件に絞る
const candidates = await vectorDb.similaritySearch(queryEmbedding, { topK: 20 });
const reranked = await reranker.rank(question, candidates);
const topChunks = reranked.slice(0, 3);
```

## よくある失敗

### チャンクが大きすぎる

LLMのコンテキストに入れる情報が多すぎると、重要な部分が埋もれる。
**対策**: 512〜1024トークンを目安にする。

### メタデータを捨てている

どのドキュメントの何ページ目か、いつ更新されたかなどを一緒に格納すると、フィルタリングや出典表示に使える。

```ts
await vectorDb.insert({
  content: chunkText,
  embedding: vector,
  metadata: {
    source: 'design-doc.md',
    section: 'アーキテクチャ',
    updatedAt: '2025-04-01',
  },
});
```

### 検索クエリと文書の表現が違う

「どうすれば〜できますか？」という質問と「〜の手順は以下の通りです」という文書は意味が近くても表現が違いベクトルが離れる。

**対策（HyDE）**: 質問に対する「仮の回答」をLLMに生成させ、その仮回答でベクトル検索する。

```ts
const hypotheticalAnswer = await llm.generate(`
次の質問に対する回答を1段落で書いてください（正確でなくてよい）：
${question}
`);
const queryVector = await embed(hypotheticalAnswer); // 仮回答でベクトル化
```

## RAG が不要な場面

- 文書が少量（数十件程度）→ 全文をコンテキストに入れる方がシンプル
- リアルタイム性不要で知識が固定 → Fine-tuning の方が精度が出る
