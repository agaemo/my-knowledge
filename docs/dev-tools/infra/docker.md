# Docker

## 何か

アプリケーションとその依存関係（ランタイム・ライブラリ・設定）をコンテナとしてパッケージ化し、どの環境でも同じように動かすプラットフォーム。

「自分のマシンでは動く」問題を解消する。

→ [公式サイト](https://www.docker.com/) / [ドキュメント](https://docs.docker.com/)

## なぜ存在するか

従来の仮想マシン（VM）はOS全体を含むため起動が遅く重い。Dockerはホス トOSのカーネルを共有する軽量なコンテナで、起動が速くポータブル。

- **環境の再現性**: Dockerfile に環境定義を書くことで誰でも同じ環境を作れる
- **依存関係の分離**: 異なるバージョンのランタイムをプロジェクトごとに共存させられる
- **デプロイの簡略化**: ビルドしたイメージをそのまま本番で動かせる

## 主要概念

### Dockerfile
イメージのビルド手順を記述するファイル。

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 依存関係だけ先にコピーしてキャッシュを活用する
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

### Image（イメージ）
Dockerfile からビルドした読み取り専用のテンプレート。Docker Hub などのレジストリで配布できる。

### Container（コンテナ）
イメージを実行したもの。プロセスとして動作し、停止・削除できる。

### Volume（ボリューム）
コンテナ外にデータを永続化する仕組み。コンテナを削除してもデータが残る。

```bash
docker run -v mydata:/var/lib/postgresql/data postgres
```

### Network
コンテナ間の通信を制御する仮想ネットワーク。同一ネットワーク内のコンテナはコンテナ名で名前解決できる。

## よく使うコマンド

```bash
# イメージのビルド
docker build -t myapp:1.0 .

# コンテナの起動
docker run -d -p 8080:3000 --name app myapp:1.0

# 実行中コンテナの確認
docker ps

# ログの確認
docker logs -f app

# コンテナ内でコマンド実行
docker exec -it app sh

# コンテナの停止・削除
docker stop app && docker rm app

# イメージの一覧・削除
docker images
docker rmi myapp:1.0
```

## Docker Compose

複数コンテナをまとめて定義・起動するツール。ローカル開発環境の構築に特に便利。

```yaml
# compose.yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/mydb
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      retries: 5

volumes:
  pgdata:
```

```bash
docker compose up -d    # バックグラウンドで起動
docker compose logs -f  # ログ確認
docker compose down     # 停止・削除
```

## マルチステージビルド

ビルド環境と実行環境を分離してイメージを軽量化する。

```dockerfile
# ビルドステージ
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 実行ステージ（ビルドツールを含まない）
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

## .dockerignore

ビルドコンテキストから除外するファイルを指定する。`node_modules` などを除外することでビルドが速くなる。

```
node_modules
.git
.env
*.log
```

## Kubernetes との関係

Docker はコンテナを単一ホストで動かすツール。複数ホストにまたがってコンテナをオーケストレーションするのが Kubernetes。

本番環境では Docker でビルドしたイメージを Kubernetes でデプロイするのが一般的な構成。

## いつ使うか

- ローカル開発環境を統一したい（Docker Compose）
- アプリをコンテナとしてパッケージ化して配布・デプロイしたい
- CI/CD でビルド・テスト環境を再現可能にしたい
