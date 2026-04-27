# Harness Engineering（Claude Code）

## 何か

Claude Code（AIコーディングエージェント）の動作環境を設計・構成すること。
「AIに何を許可するか」「どんな手順で動かすか」「どんな情報を常に与えるか」を設計する。

素のAIに仕事をさせるのではなく、**プロジェクト固有のルール・知識・制約を組み込んだ環境**を作ることで、AIの出力品質と一貫性を高める。

## 構成要素

```
プロジェクト/
├── CLAUDE.md              # AIへの常時コンテキスト（設計思想・ルール）
└── .claude/
    ├── settings.json      # 権限・ツール設定・hooks
    └── commands/          # スラッシュコマンド（再利用可能なプロンプト）
        ├── review.md
        ├── db-migration.md
        └── agents/        # 専門エージェント定義
            ├── tester.md
            └── reviewer.md
```

## CLAUDE.md の設計

AIが毎回読む「プロジェクトの憲法」。以下を書く。

```markdown
# プロジェクト概要
何を作っているか、主要な技術スタック

# アーキテクチャ決定
- レイヤー構造・依存の向き
- 避けるべきパターン（例: サービス層でthrowしない、Result型を使う）

# コーディング規約
- 命名ルール
- コメントをどこに書くか

# テスト方針
- テストを書く対象・書かない対象
- モックの使い方

# 禁止事項
- やってはいけないこと（例: .envをコミットしない）
```

**書いてはいけないもの**: コードパターンや構造（コードから読み取れる）、git履歴（git logで確認できる）

## settings.json による権限制御

AIがどのツールを自動実行できるかを制御する。

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test:*)",
      "Bash(npm run build)",
      "Bash(git status)",
      "Bash(git diff*)",
      "Read(**/*)",
      "Edit(**/*)"
    ],
    "deny": [
      "Bash(git push*)",
      "Bash(rm -rf*)"
    ]
  }
}
```

## Hooks

AIのアクション前後に自動実行されるシェルコマンド。

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run typecheck 2>&1 | head -20"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude finished\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

### よく使う hooks のパターン

| タイミング | 用途 | コマンド例 |
|---|---|---|
| ファイル編集後 | 型チェック自動実行 | `npm run typecheck` |
| ファイル編集後 | Lint自動修正 | `npm run lint:fix` |
| セッション終了時 | 通知 | `osascript` で macOS 通知 |
| ツール実行前 | 危険操作のガード | カスタムバリデーション |

## Commands（スラッシュコマンド）

繰り返し使うプロンプトをファイルとして定義する。`/review` のように呼び出せる。

```markdown
<!-- .claude/commands/review.md -->
以下の観点でコードレビューをしてください：
1. バグ・ロジックエラー
2. セキュリティ問題（SQLインジェクション・認証漏れ）
3. このプロジェクトのアーキテクチャ規約への違反
4. テストの不足

変更ファイル: $ARGUMENTS
```

```markdown
<!-- .claude/commands/db-migration.md -->
DBマイグレーションを安全に実行します。
1. 現在のスキーマを確認
2. マイグレーションファイルを生成
3. ローカルDBで実行・検証
4. ロールバック手順を確認

変更内容: $ARGUMENTS
```

## Agents（専門エージェント）

特定の役割を持つAIを定義する。タスクに応じて呼び出す。

```markdown
<!-- .claude/commands/agents/tester.md -->
あなたはテスト専門エージェントです。

## 役割
- 実装前: 失敗するテストを書く（TDDのRedフェーズ）
- 実装後: カバレッジを補完するテストを追加する

## ルール
- テスト名は「[条件]のとき[期待結果]」の形式
- 1テスト1アサーション
- InMemoryリポジトリを使い、DBモックを避ける
```

## 設計の考え方

### AIに何度も同じことを言わなくて済む仕組みを作る

「毎回プロンプトで指示する」→「CLAUDE.mdやCommandsに組み込む」にする。

### AIの判断範囲を明確にする

- 自動でやってよいこと（テスト実行・lint修正）
- 確認が必要なこと（DBマイグレーション・push）
- やってはいけないこと（force push・本番操作）

### フィードバックループを組み込む

hooks でAIの行動直後に型チェック・テストを走らせ、問題をすぐに検知できるようにする。
AIが間違えても自分でエラーを見て修正できる。

## グローバル設定 vs プロジェクト設定

| | 場所 | 用途 |
|---|---|---|
| グローバル | `~/.claude/CLAUDE.md` | 全プロジェクト共通の個人ルール |
| グローバル | `~/.claude/settings.json` | 全プロジェクト共通の権限 |
| プロジェクト | `.claude/settings.json` | そのプロジェクト固有の権限・hooks |
| プロジェクト | `CLAUDE.md` | そのプロジェクトの設計・規約 |
