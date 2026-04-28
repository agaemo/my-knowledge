# ブルーグリーンデプロイメント

## 何か

本番環境（Blue）と同一構成の環境（Green）を用意し、新バージョンを Green に展開して、
準備が整ったらトラフィックを一括で Blue → Green へ切り替えるリリース戦略。

切り替えは瞬時で、問題があれば即座に Blue へ戻せる。

## なぜ存在するか

ダウンタイムなしのリリースと高速ロールバックを両立するため。

- デプロイ中のユーザーへの影響ゼロ（切り替えが瞬時）
- 問題発生時は DNS/LB の向き先を変えるだけで即ロールバック
- 新バージョンを本番と同一環境で事前検証できる

## 仕組み

```
【デプロイ前】
Load Balancer ──▶ [Blue: v1] （現行本番）
                  [Green: v1]（待機中）

【デプロイ中】
Load Balancer ──▶ [Blue: v1] （引き続き本番）
                  [Green: v2]（新バージョンをデプロイ・検証）

【切り替え後】
Load Balancer ──▶ [Blue: v1] （待機・ロールバック用に保持）
                  [Green: v2]（新本番）

【ロールバック時】
Load Balancer ──▶ [Blue: v1] （即座に戻す）
```

## 実装例

### AWS（ALB ターゲットグループ切り替え）

```bash
# Green（新バージョン）へデプロイ・検証後、ALB のターゲットグループを切り替え
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions \
    Type=forward,TargetGroupArn=$GREEN_TARGET_GROUP_ARN

# ロールバックは Blue のターゲットグループに戻すだけ
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions \
    Type=forward,TargetGroupArn=$BLUE_TARGET_GROUP_ARN
```

### Kubernetes（Service の selector 切り替え）

```yaml
# Blue（v1）の Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
spec:
  template:
    metadata:
      labels:
        app: myapp
        version: blue

---
# Green（v2）の Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
spec:
  template:
    metadata:
      labels:
        app: myapp
        version: green

---
# Service の selector を blue → green に変えるだけで切り替え
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: green  # ← ここを変える
```

```bash
# 切り替えコマンド（Green へ）
kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'

# ロールバック（Blue へ）
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'
```

## データベースの扱い

ブルーグリーンで最も注意が必要なのは DB。

```
【互換性を保つアプローチ（推奨）】

Step 1: Blue（v1）稼働中に新カラムを追加（nullable）
Step 2: Green（v2）をデプロイ → 新旧カラム両方を書く
Step 3: Blue → Green に切り替え
Step 4: 旧カラムへの書き込みを停止
Step 5: 旧カラムを削除

→ ストラングラーフィグの「データ移行」と同じ考え方
```

スキーマ変更が後方互換でない場合は、切り替えと同時に DB も切り替える必要があり、
ロールバックが複雑になる。この場合はカナリアリリースの方が適していることが多い。

## カナリアリリースとの違い

[カナリアリリース](/deployment/canary-release) を参照。

## いつ使うか

- ダウンタイムゼロのリリースが必要
- 即時ロールバックを保証したい（金融・EC など障害コストが高いシステム）
- 新バージョンを本番相当の環境で十分に検証してから切り替えたい

## いつ使わないか

- 本番と同規模の環境を2セット維持するコストが払えない
- DB 変更が後方互換でなく、切り替えとロールバックが複雑になる場合
- 段階的なリスク分散が必要なとき → カナリアリリースを検討
