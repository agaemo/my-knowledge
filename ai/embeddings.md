# Embeddings（埋め込み）

## 何か

テキスト（や画像・音声）を数値ベクトルに変換する技術。
意味が近いテキストはベクトル空間でも近くなる性質を持つ。

```
「犬」     → [0.21, -0.45, 0.87, ...]
「猫」     → [0.19, -0.43, 0.85, ...]  ← 近い
「データベース」 → [-0.82, 0.31, -0.12, ...] ← 遠い
```

## なぜ重要か

LLMはテキストを直接比較できない（キーワードマッチしかできない）が、
Embeddingsを使うと「意味的な類似度」で比較・検索できる。

応用範囲が広い：
- セマンティック検索
- 推薦システム
- クラスタリング・分類
- RAGの基盤

## 類似度の計算

ベクトル間の距離で類似度を測る。コサイン類似度が最もよく使われる。

```ts
/** コサイン類似度（-1〜1、1が最も近い） */
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}
```

## 代表的なモデル

| モデル | 提供元 | 次元数 | 特徴 |
|---|---|---|---|
| text-embedding-3-small | OpenAI | 1536 | コスパ良し |
| text-embedding-3-large | OpenAI | 3072 | 高精度 |
| text-embedding-ada-002 | OpenAI | 1536 | 旧世代、移行推奨 |
| embed-v3 | Cohere | 1024 | 多言語対応が強い |
| mxbai-embed-large | MixedBread | 1024 | OSS、ローカル実行可能 |

## 実装例

```ts
import OpenAI from 'openai';

const openai = new OpenAI();

/** テキストをベクトルに変換する */
async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

// セマンティック検索の例
const query = '認証エラーの対処法';
const queryVec = await embed(query);

const results = documents
  .map(doc => ({
    doc,
    score: cosineSimilarity(queryVec, doc.embedding),
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);
```

## Vector DB

大量のベクトルを高速に近傍検索するための専用DB。

| DB | 特徴 |
|---|---|
| pgvector | PostgreSQL拡張。既存のRDBに追加できる |
| Pinecone | フルマネージド。セットアップが楽 |
| Weaviate | OSS。ハイブリッド検索が得意 |
| Qdrant | OSS・Rust製。高速 |
| Chroma | OSS。開発・PoC向け |

```sql
-- pgvectorの例
CREATE EXTENSION vector;
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536)
);

-- 近傍検索（コサイン距離）
SELECT content, 1 - (embedding <=> $1::vector) AS similarity
FROM documents
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

## ハイブリッド検索

ベクトル検索（セマンティック）とキーワード検索（BM25）を組み合わせる。
固有名詞・型番など「意味より表記が重要」な場合にベクトル検索が弱いため。

```
スコア = α × ベクトル類似度 + (1-α) × BM25スコア
```

## 注意点

### 次元の呪い

次元数が大きいほど検索精度は上がるが、ストレージ・計算コストも増える。
用途に合わせて次元数を選ぶ。

### モデルは統一する

インデックス作成時と検索時で異なるモデルを使うと意味のある比較ができない。

### テキストの前処理

不要なHTMLタグ・記号の除去、長すぎるテキストの分割をしてからEmbeddingする。
