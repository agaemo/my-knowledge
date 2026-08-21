# Graph Engineering

## なぜ存在するか

AI エージェントが長時間のタスクを担うようになると、単一のループの中に判断・状態・副作用が集中してしまう。こうなると、途中経過の再開や、何が起きたかの監査が難しくなる。

Graph Engineering は、エージェント・決定的な関数・evaluator・人間の承認といった異質な実行単位を**明示的な有向グラフ**へ配置し、状態スキーマ・遷移条件・並列/合流・権限・予算・評価・承認・停止・回復を、ノード間の契約として設計・検証・運用する方法論。

:::info[ループの廃止ではない]
Graph Engineering は Loop Engineering を否定するものではない。ループを**ノードの内部に閉じ込める**ことが本質。
:::

## 主要概念

| 概念 | 役割 |
|---|---|
| **Node** | エージェント・決定的関数・evaluator・人間など、個々の実行単位 |
| **Edge** | ノード間の型付きの接続。入出力スキーマ・遷移条件・失敗時の対応を含む |
| **State** | チェックポイントされたタスクの状態 |
| **Policy** | 予算・リトライ・承認閾値など、版管理された制約 |

## いつ使うか

以下のいずれかに該当する場合に採用を検討する。

- 独立して実行できる複数のブランチ（分岐処理）がある
- エージェント・決定的関数・人間の承認を同一の実行フローで連携させる
- 数分を超える待機や、後日の再開が必要になる
- 支払いや削除など、権限レベルの異なる操作が混在する

## いつ不要か

単一のエージェントが短時間で完結するタスクであれば、Graph Engineering の構造化コストは見合わない。その場合は通常のエージェントループ（[Loop Engineering](/ai/dev-style/loop-engineering)）で十分。

## 関連概念

| 概念 | 関係 |
|---|---|
| [Loop Engineering](/ai/dev-style/loop-engineering) | 単一ループで完結する自動化。Graph Engineering はこれが複雑化した際の分解先 |
| [Harness Engineering](/ai/dev-style/harness-engineering) | 個々のノード（エージェント）を制御する仕組み |

## 参考

- [Graph Engineering — suwash (Zenn)](https://zenn.dev/suwash/articles/graph-engineering_20260727)
