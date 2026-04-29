# Evals（LLM評価）

## 何か

LLMやAIシステムの出力品質を測定・比較する仕組み。
「プロンプトを変えたら改善したか」「モデルを変えたら壊れないか」を定量的に判断できる。

::: warning Evals なき LLM 開発は感覚頼り
テストなき開発が危険なのと同様に、Evals なしでは「なんとなく良くなった」を数字で示せず、デグレードにも気づけない。
:::

## なぜ必要か

LLMの出力は確率的で、人手レビューでは以下が難しい：
- 数百〜数千のケースを毎回確認できない
- 「なんとなく良くなった」を数字で示せない
- デグレードに気づけない

## Evalの種類

### コードベースEval（ユニットテスト的）

期待出力が明確に定義できる場合。

```ts
const cases = [
  {
    input: '東京の天気は？',
    expected: (output: string) => output.includes('東京'),
  },
  {
    input: '1+1は？',
    expected: (output: string) => output.includes('2'),
  },
];

for (const c of cases) {
  const output = await llm.generate(c.input);
  assert(c.expected(output), `Failed: ${c.input}`);
}
```

### LLM-as-Judge

別のLLMが評価する。出力が複雑で正解が一意でない場合に有効。

```ts
const judgePrompt = `
以下の回答を1〜5点で評価してください。
評価基準: 正確性・簡潔さ・日本語の自然さ

質問: ${question}
回答: ${answer}

スコアと理由をJSON形式で返してください。
{ "score": 4, "reason": "..." }
`;

const judgment = await judge.generate(judgePrompt);
```

::: warning Judge のバイアス
Judge も LLM なので、長い回答を好む・同じモデルの回答を高く評価するなどのバイアスがある。単一指標に依存せず、複数の評価方法を組み合わせる。
:::

### 人間評価

最終的な品質基準。コストが高いため、モデル選定や大きな変更時に実施する。

A/Bテスト形式（どちらが良いか選ばせる）が有効。

## Evalセットの設計

### ゴールデンセット

人間が正解をラベル付けしたデータセット。品質の基準線になる。

```ts
type EvalCase = {
  id: string;
  input: string;
  expectedOutput?: string;   // 完全一致が期待できる場合
  evaluator?: (output: string) => boolean; // 柔軟な判定
  tags: string[];            // 'edge-case' | 'happy-path' | 'regression'
};
```

### カバレッジ

- ハッピーパス（通常ケース）
- エッジケース（境界値・特殊文字）
- 過去に失敗したケース（リグレッション防止）

## メトリクス

| メトリクス | 何を測るか | 向いている場面 |
|---|---|---|
| 正確率 | 期待出力との一致率 | 分類・Q&A |
| BLEU/ROUGE | 参照文との n-gram 一致度 | 翻訳・要約 |
| LLM Judge スコア | 品質の主観的評価 | 会話・生成 |
| レイテンシ | 応答時間 | UX評価 |
| コスト | トークン消費量 | 運用評価 |

## CI への組み込み

```yaml
# .github/workflows/evals.yml
- name: Run evals
  run: npm run evals
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

- name: Check pass rate
  run: |
    PASS_RATE=$(cat eval-results.json | jq '.passRate')
    if (( $(echo "$PASS_RATE < 0.9" | bc -l) )); then
      echo "Eval pass rate below threshold: $PASS_RATE"
      exit 1
    fi
```

## よくある失敗

### Evalセットが小さすぎる

10件では統計的に意味がない。最低でも100件、できれば500件以上。

### テストセットが汚染されている

::: warning 改善用と評価用を分離する
プロンプト改善時に Eval ケースを参照してしまうとオーバーフィットする。改善用データと評価用データは必ず分離する。
:::

### 一つのメトリクスだけ見る

スコアが上がっても別の観点が悪化することがある。複数の指標を組み合わせる。
