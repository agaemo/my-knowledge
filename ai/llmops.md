# LLMOps

## 何か

LLMを使ったシステムの本番運用に必要なプラクティス・ツール群。
MLOpsのLLM特化版。

「作って動かす」だけでなく「継続的に改善・運用する」ための仕組み。

## MLOpsとの違い

| | MLOps | LLMOps |
|---|---|---|
| モデル管理 | 自前学習・バージョン管理が中心 | APIプロバイダー依存が多い |
| 評価 | 精度・F1スコアなど数値指標 | LLM-as-Judgeなど主観的評価を含む |
| デプロイ | モデルのサービング | プロンプト・設定のデプロイ |
| 変化の頻度 | モデル再学習は低頻度 | プロンプト改善は高頻度 |
| コスト管理 | 計算リソース | APIトークン消費量 |

## 主要コンポーネント

### プロンプト管理

プロンプトをコードと同様にバージョン管理する。

```ts
// プロンプトをコードから分離して管理する例
const prompts = {
  v1: `あなたはカスタマーサポートです。...`,
  v2: `あなたは親切なサポート担当です。回答は3文以内にしてください。...`,
};

// 環境変数やフラグでバージョンを切り替える
const prompt = prompts[process.env.PROMPT_VERSION ?? 'v2'];
```

### オブザーバビリティ

LLMの呼び出しを記録・監視する。

記録すべきもの：
- 入力プロンプト（ユーザー入力・システムプロンプト）
- 出力
- レイテンシ
- トークン消費量・コスト
- エラー

```ts
async function tracedLlmCall(prompt: string) {
  const startedAt = Date.now();
  try {
    const response = await llm.generate(prompt);
    logger.info({
      event: 'llm_call',
      latencyMs: Date.now() - startedAt,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cost: calcCost(response.usage),
    });
    return response;
  } catch (error) {
    logger.error({ event: 'llm_error', error });
    throw error;
  }
}
```

### Evals パイプライン

→ [Evals](/ai/evals) 参照

プロンプト変更・モデル切り替え時に自動でEvalsを実行してデグレードを検知する。

### A/Bテスト

プロンプトやモデルの変更を段階的にロールアウトして比較する。

```ts
const variant = userId.hashCode() % 2 === 0 ? 'control' : 'treatment';
const prompt = variant === 'control' ? promptV1 : promptV2;
const response = await llm.generate(prompt);

analytics.track('llm_response', { variant, quality: await evaluate(response) });
```

## コスト管理

LLMのAPIコストはトークン消費量に比例するため、監視・最適化が重要。

### 削減手法

| 手法 | 効果 | トレードオフ |
|---|---|---|
| プロンプト圧縮 | 入力トークン削減 | エンジニアリングコスト |
| キャッシング | 同一リクエストのコスト0化 | キャッシュ管理の複雑さ |
| 小さいモデルへの切り替え | 単価削減 | 品質低下の可能性 |
| バッチ処理 | スループット向上 | レイテンシ増加 |
| RAGによるコンテキスト削減 | 不要な情報を排除 | RAG構築コスト |

### アラート設定

```ts
// 日次コストが閾値を超えたらアラート
if (dailyCost > COST_THRESHOLD_USD) {
  await notify(`LLMコストが閾値超過: $${dailyCost}`);
}
```

## モデルバージョン管理

APIプロバイダーがモデルを更新・廃止するため、固定バージョンを指定する。

```ts
// NG: エイリアスを使うと予期せぬ更新が入る
model: 'gpt-4o'

// OK: バージョンを固定する
model: 'gpt-4o-2024-11-20'
```

モデル更新時は Evals を実行して品質変化を確認してから切り替える。

## 代表的なツール

| カテゴリ | ツール |
|---|---|
| オブザーバビリティ | LangSmith, Langfuse, Helicone |
| プロンプト管理 | Promptflow, LangSmith |
| Evals | RAGAS, promptfoo, Braintrust |
| ゲートウェイ（コスト管理・ルーティング） | LiteLLM, OpenRouter |

## フェーズ別の優先度

### プロトタイプ段階
- ログを残す（後から分析できるように）

### 本番リリース前
- Evalsパイプラインの構築
- コストアラートの設定
- モデルバージョンの固定

### スケール後
- A/Bテストの仕組み
- Fine-tuningの検討
- コスト最適化
