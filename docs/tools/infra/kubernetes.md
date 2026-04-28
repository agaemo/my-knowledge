# Kubernetes（k8s）

## 何か

コンテナ化されたアプリケーションのデプロイ・スケーリング・管理を自動化するオーケストレーションプラットフォーム。Google が社内システム Borg をベースに OSS 化。

## なぜ存在するか

コンテナ単体（Docker）では「どのサーバーで動かすか」「落ちたら再起動するか」「負荷に応じて増減するか」を自分で管理しなければならない。k8s はこれらを自動化する。

## 主要概念

### Pod
k8s の最小デプロイ単位。1つ以上のコンテナをまとめたもの。同一 Pod 内のコンテナは localhost で通信できる。

### Deployment
Pod の望ましい状態（レプリカ数・イメージバージョン）を宣言する。k8s が現状とのズレを検知して自動修復する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: app
          image: myapp:1.2.0
          ports:
            - containerPort: 8080
```

### Service
Pod への安定したアクセス口。Pod は再起動のたびに IP が変わるため、Service が仮想 IP を提供する。

| 種別 | 用途 |
|---|---|
| ClusterIP | クラスター内部からのみアクセス（デフォルト） |
| NodePort | ノードの特定ポートで外部公開 |
| LoadBalancer | クラウドの LB を自動プロビジョン |

### Ingress
HTTP/HTTPS のルーティングルール。1つの LB で複数サービスにパスベース・ホストベースで振り分ける。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /users
            backend:
              service:
                name: user-service
                port:
                  number: 80
```

### ConfigMap / Secret
設定値と機密情報を Pod から切り離して管理する。Secret は base64 エンコードされる（暗号化ではない）。

### Namespace
クラスター内の論理的な分離単位。チームやサービスごとにリソースを分けるために使う。

## よく使うコマンド

```bash
kubectl get pods                    # Pod 一覧
kubectl describe pod <name>         # Pod の詳細・イベント確認
kubectl logs <pod> -f               # ログのストリーミング
kubectl exec -it <pod> -- bash      # Pod 内に入る
kubectl apply -f manifest.yaml      # マニフェスト適用
kubectl rollout status deploy/<name> # ロールアウト進捗確認
kubectl rollout undo deploy/<name>  # 直前のバージョンに戻す
```

## いつ使うか

- 複数コンテナを本番環境で安定稼働させたい
- オートスケーリング・自己修復・ローリングアップデートが必要
- マルチクラウド・オンプレミスでポータブルな実行環境が必要

## いつ使わないか

- 小規模サービスや PoC（運用コストが高い）
- 単一サーバーで十分なワークロード → Docker Compose や systemd で十分
- サーバーレスで賄えるケース → AWS Lambda / Cloud Run を検討
