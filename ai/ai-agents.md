# AI エージェント設計パターン

## 何か

LLM が「ツールを使って行動し、結果を見て次のアクションを決める」仕組み。
単発の質問応答（1ターン）ではなく、**複数ステップのタスクを自律的に遂行する**。

## 基本構造：ReAct ループ

```
Thought  → 今何をすべきか考える
Action   → ツールを呼び出す
Observation → ツールの結果を見る
（繰り返し）
Answer   → 十分な情報が集まったら回答する
```

```
Thought: ファイルの中身を確認してから修正すべきだ
Action: ReadFile("src/user.ts")
Observation: [ファイルの中身]
Thought: 42行目のバリデーションが不足している
Action: EditFile("src/user.ts", ...)
Observation: 成功
Answer: バリデーションを追加しました
```

## ツール（Tool Use）

エージェントが呼び出せる関数を定義する。LLMはツールの説明を読んで「いつ何を使うか」を判断する。

```ts
const tools = [
  {
    name: 'read_file',
    description: 'ファイルの内容を読み取る。編集前に必ず呼ぶ。',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'ファイルパス' },
      },
      required: ['path'],
    },
  },
  {
    name: 'run_tests',
    description: 'テストスイートを実行して結果を返す',
    parameters: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'テストファイルのパターン（例: *.test.ts）' },
      },
    },
  },
];
```

**ツール説明が重要**: LLMはツール名と description だけを見て使うかどうか判断する。
説明が曖昧だと使い方を誤る。

## エージェントの種類

### Single Agent

1つのLLMが全ての判断とアクションを担う。シンプルなタスクに適している。

```
ユーザー → Agent → ツール群 → 回答
```

### Multi-Agent

複数のエージェントが役割を分担する。複雑なタスク・大きなコンテキストに適している。

```
ユーザー → Orchestrator
               ├→ Researcher（情報収集担当）
               ├→ Coder（実装担当）
               └→ Reviewer（レビュー担当）
```

**Orchestrator パターン**: 指揮役が計画を立て、専門エージェントにタスクを割り当てる。

```ts
// Orchestratorの動き
const plan = await orchestrator.plan(userRequest);
// plan: ["コードベースを調査", "実装する", "テストを書く", "レビューする"]

for (const step of plan) {
  const agent = selectAgent(step); // 担当エージェントを選ぶ
  const result = await agent.execute(step, context);
  context.addResult(result);
}
```

## コンテキスト管理

エージェントループが長くなるとコンテキストウィンドウを超える。

### 戦略

**Summarization**: 古いターンを要約して圧縮する。

```ts
if (context.tokenCount > THRESHOLD) {
  const summary = await llm.summarize(context.oldTurns);
  context.replace(context.oldTurns, summary);
}
```

**Handoff**: エージェント間でコンテキストを引き継ぐ時は、必要な情報だけを渡す（全履歴は渡さない）。

```ts
// 全コンテキストではなく、次のエージェントに必要な情報だけ渡す
const handoff = {
  task: '認証モジュールを実装する',
  decisions: ['Onionアーキテクチャを使う', 'JWTで認証する'],
  constraints: ['throwしない、Result型を使う'],
};
await nextAgent.execute(handoff);
```

## 信頼境界とガードレール

エージェントが自律的に動くほど、予期しない操作のリスクが上がる。

### Human-in-the-loop

破壊的操作の前に人間の確認を挟む。

```ts
if (action.isDangerous) {
  const confirmed = await askUser(`${action.description}を実行してよいですか？`);
  if (!confirmed) return;
}
```

### ツールの権限スコープを絞る

エージェントに渡すツールは最小権限にする。

```ts
// NG: 何でもできるシェルツール
{ name: 'bash', description: 'シェルコマンドを実行する' }

// OK: 目的を限定したツール
{ name: 'run_tests', description: 'テストのみ実行する（編集不可）' }
{ name: 'read_file', description: 'ファイルを読み取る（書き込み不可）' }
```

### 操作ログ

エージェントが何をしたか記録し、監査・ロールバックできるようにする。

## よくある失敗パターン

| 失敗 | 原因 | 対策 |
|---|---|---|
| 無限ループ | ツールが失敗し続けても止まらない | 最大ステップ数を設定する |
| ハルシネーション | ツール結果を無視して嘘をつく | Observationを必ず参照させる指示を入れる |
| コンテキスト溢れ | 長いタスクでコンテキストが尽きる | 定期的なサマリー・タスク分割 |
| 権限昇格 | ツールを組み合わせて想定外の操作をする | ツールの権限スコープを最小化 |

## エージェント設計のチェックリスト

- [ ] ループの終了条件が明確か（最大ステップ数・完了判定）
- [ ] 破壊的操作に人間確認が入っているか
- [ ] ツールの説明が正確で曖昧でないか
- [ ] コンテキスト管理の戦略があるか
- [ ] 操作ログを残しているか
