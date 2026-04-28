# Fine-tuning（ファインチューニング）

## 何か

事前学習済みモデルを、特定のタスク・ドメイン向けに追加学習させる技術。
ベースモデルの汎用知識を保持しつつ、目的に特化した振る舞いを習得させる。

## プロンプトエンジニアリングとの使い分け

| | プロンプト | Fine-tuning |
|---|---|---|
| コスト | 低（追加学習不要） | 高（データ収集・学習が必要） |
| 即効性 | 即座に試せる | データ準備〜学習に時間がかかる |
| 一貫性 | プロンプト次第でブレる | 安定した出力スタイルを習得できる |
| コンテキスト節約 | 毎回例示が必要 | Few-shotなしで動く |
| 向いている用途 | 試作・柔軟な対応 | 量産・特定タスクの高精度化 |

Fine-tuningはプロンプトで解決できない場合の次の手。先にプロンプトエンジニアリングを尽くす。

## Fine-tuningが有効な場面

- 特定フォーマットの出力を一貫して返したい（JSON・特定の文体）
- ドメイン固有の知識・専門用語に強くしたい
- Few-shot例をプロンプトに毎回入れるコストを削減したい
- モデルのキャラクター・トーンを固定したい

## 手法の種類

### Full Fine-tuning

全パラメータを更新する。最も効果が高いが、計算コストが高い。
小さなモデルや十分なGPUリソースがある場合に有効。

### PEFT（Parameter-Efficient Fine-Tuning）

パラメータの一部だけを更新する。計算コストを大幅に削減できる。

**LoRA（Low-Rank Adaptation）** が最も広く使われる：

```
元のパラメータ行列 W を固定し、
小さな行列 A・B を追加学習する。

W' = W + α × (B × A)

A: (d × r)  r ≪ d  ← rankを小さく保つ
B: (r × d)
```

更新するパラメータ数を1/100以下に減らせる。

### RLHF（Reinforcement Learning from Human Feedback）

人間の好み評価を報酬シグナルとして強化学習する。ChatGPTなどで使われた手法。
実装コストが高く、一般的なアプリ開発では通常不要。

## データ準備

Fine-tuningの品質はデータで決まる。

### データ形式（OpenAI の例）

```jsonl
{"messages": [
  {"role": "system", "content": "あなたはカスタマーサポート担当です。"},
  {"role": "user", "content": "返品したいのですが"},
  {"role": "assistant", "content": "ご不便をおかけして申し訳ございません。返品はご購入から30日以内であれば承ります。"}
]}
{"messages": [
  {"role": "user", "content": "営業時間を教えてください"},
  {"role": "assistant", "content": "平日9:00〜18:00です。土日祝はお休みをいただいております。"}
]}
```

### データ量の目安

| ケース | 目安 |
|---|---|
| スタイル・フォーマット調整 | 50〜100件 |
| ドメイン特化 | 数百〜1,000件 |
| 高精度な専門タスク | 1,000件〜 |

品質 > 数量。ノイズの多い大量データより、高品質な少量データの方が効果が高い。

## APIでのFine-tuning（OpenAI）

```ts
import OpenAI from 'openai';
const openai = new OpenAI();

// 1. データをアップロード
const file = await openai.files.create({
  file: fs.createReadStream('training_data.jsonl'),
  purpose: 'fine-tune',
});

// 2. Fine-tuningジョブを作成
const job = await openai.fineTuning.jobs.create({
  training_file: file.id,
  model: 'gpt-4o-mini',
});

// 3. 完了後、Fine-tunedモデルを使う
const response = await openai.chat.completions.create({
  model: job.fine_tuned_model, // 'ft:gpt-4o-mini:org:name:id'
  messages: [{ role: 'user', content: 'こんにちは' }],
});
```

## よくある失敗

### データが少なすぎる

50件未満でFine-tuningしても効果が出にくい。まずプロンプトで試す。

### ネガティブ例を入れない

「こういう回答をしてはいけない」という例も学習データに含めると、望ましくない振る舞いを抑制できる。

### 評価セットを持たない

Fine-tuning前後で Evals を実行して改善を定量的に確認する。
感覚だけで「良くなった」と判断しない。

### カタストロフィック・フォーゲッティング

特定タスクに特化しすぎて、汎用能力が低下することがある。
元モデルの能力も Evals に含めておく。
