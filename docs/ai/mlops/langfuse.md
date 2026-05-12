# Langfuse

## 何か

LLMアプリケーション向けのオブザーバビリティ・評価プラットフォーム。
トレーシング・プロンプト管理・Evalsを一つのツールに統合している。

LLMOpsの「記録→評価→改善」サイクルを実装するためのOSS。セルフホストも可能。

## なぜ必要か

LLMアプリケーションのデバッグは通常のアプリとは異なる難しさがある。

- どのプロンプトが問題を引き起こしたか追跡できない
- レイテンシ・コストがどのステップで増えているか見えない
- プロンプト変更前後の品質比較ができない
- エラーが確率的で再現性が低い

一般的なAPMツール（Datadog・OpenTelemetryなど）はLLMの入出力・トークン数・モデル名などのコンテキストを扱う設計になっていない。Langfuseはそれを補う。

## 主要機能

### トレーシング

LLMの呼び出しをSpan・Traceとして記録する。

```ts
import { Langfuse } from 'langfuse';

const langfuse = new Langfuse();

const trace = langfuse.trace({ name: 'chat-response', userId: 'user-123' });
const span = trace.span({ name: 'llm-call' });

const response = await llm.generate(prompt);

span.end({
  input: prompt,
  output: response.text,
  usage: { input: response.inputTokens, output: response.outputTokens },
});
```

記録できる主なメタデータ：
- 入出力（プロンプト・応答）
- トークン消費量とコスト
- レイテンシ（ステップごと）
- ユーザーID・セッションID
- モデル名・バージョン

### プロンプト管理

プロンプトをコード外でバージョン管理し、デプロイなしで切り替えられる。

```ts
// Langfuse上で管理されたプロンプトを取得
const promptTemplate = await langfuse.getPrompt('customer-support-v2');
const compiled = promptTemplate.compile({ userMessage: input });

const response = await llm.generate(compiled);
```

- プロンプトのバージョン履歴が残る
- A/Bテスト用に複数バージョンを並走させられる
- コードリリースなしにプロンプトを更新できる

### Evals

収集したトレースに対してスコアを付与し、品質を定量化する。

```ts
// LLM-as-Judgeでスコアを付与
await langfuse.score({
  traceId: trace.id,
  name: 'quality',
  value: 4.2,
  comment: '回答は正確だが冗長',
});
```

スコアの付与方法：
- 手動（人間によるアノテーション）
- LLM-as-Judge（別モデルが評価）
- ユーザーフィードバック（👍👎などのUI）

データセットを作成してリグレッションテストとして実行することもできる。

## LangSmithとの比較

どちらもLLMオブザーバビリティ領域の代表的ツール。

| | Langfuse | LangSmith |
|---|---|---|
| ライセンス | OSS（MIT）+ クラウド | クラウドのみ（LangChain社） |
| セルフホスト | 可能 | 不可 |
| LangChain依存 | なし | LangChainと統合が深い |
| プロンプト管理 | あり | あり |
| Evals | あり | あり |

::: tip セルフホストが必要な場面
個人情報・機密データを含むLLMの入出力をサードパーティに送れないケースでは、Langfuseのセルフホストが有力な選択肢になる。
:::

## いつ使うか

- LLMの本番稼働後、問題の原因を特定したいとき
- プロンプト変更による品質変化を定量的に比較したいとき
- コスト・レイテンシのボトルネックを特定したいとき
- チームでプロンプトをバージョン管理したいとき

プロトタイプ段階では不要なことが多い。本番リリース前後から導入を検討するのが現実的。

→ [LLMOps](/ai/mlops/llmops) — Langfuseが担うオブザーバビリティ・Evalsの位置づけ  
→ [Evals](/ai/mlops/evals) — Evalの設計・種類の詳細
