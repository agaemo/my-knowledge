# オブザーバビリティ（可観測性）

## 何か

「システムの内部状態を外部から推測できる能力」。
障害が起きたとき「何が・どこで・なぜ」起きたかを調査できる状態にしておく。

3つの柱: **ログ・メトリクス・トレース**

## ログ（Logs）

**いつ何が起きたかの記録。**

### 構造化ログ

文字列ではなく JSON で出力する。ログ収集基盤でフィルタリング・集計できる。

```ts
// Bad: 文字列ログ（機械が解析しにくい）
console.log(`User ${userId} placed order ${orderId} for ${amount}yen`);

// Good: 構造化ログ
logger.info('order.placed', {
  userId,
  orderId,
  amount,
  currency: 'JPY',
});
```

### ログレベルの使い分け

| レベル | 用途 |
|---|---|
| DEBUG | 開発時の詳細情報（本番では無効化） |
| INFO | 正常なイベント（注文確定・ユーザー登録） |
| WARN | 問題になりうる状態（リトライ発生・低残量） |
| ERROR | 対処が必要なエラー（DB接続失敗・外部API失敗） |
| FATAL | 即時停止が必要（データ破損・致命的バグ） |

### 相関ID（Correlation ID）

1つのリクエストが複数のサービスを通るとき、同じIDをすべてのログに付与する。
ログが散らばっていても「このリクエストのログだけ」を追跡できる。

```ts
// ミドルウェアで全リクエストに correlationId を付与
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] ?? crypto.randomUUID();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
});

// ログに必ず含める
logger.info('user.created', {
  correlationId: req.correlationId,
  userId: user.id,
});
```

## メトリクス（Metrics）

**数値で表した時系列データ。** グラフ化してトレンドや異常を検知する。

### 種類

| 種類 | 説明 | 例 |
|---|---|---|
| Counter | 単調増加する数値 | リクエスト総数・エラー総数 |
| Gauge | 上下する現在値 | 接続中セッション数・CPU使用率 |
| Histogram | 値の分布 | レスポンスタイムのパーセンタイル |

### 重要なメトリクス（RED Method）

Webサービスのサービス健全性を測る3指標。

```
Rate     — リクエスト数/秒
Error    — エラー率（%）
Duration — レスポンスタイム（p50・p95・p99）
```

```ts
// Prometheusの例
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
});

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, path: req.path, status: res.statusCode });
    end({ method: req.method, path: req.path });
  });
  next();
});
```

## トレース（Traces）

**1リクエストが複数サービスを通る経路の記録。** どこで時間がかかっているか・どこで失敗したかを可視化する。

```
[ブラウザ] → [APIゲートウェイ] → [注文サービス] → [DBクエリ]
                                                 → [在庫サービス]
                                                 → [通知サービス]
```

### スパン（Span）

1つの操作単位をスパンと呼ぶ。スパンが木構造に連なったものがトレース。

```ts
// OpenTelemetryの例
const tracer = trace.getTracer('order-service');

async function placeOrder(orderId: string) {
  const span = tracer.startSpan('placeOrder');
  span.setAttribute('order.id', orderId);

  try {
    await chargePayment(orderId);  // 子スパンが自動生成される
    await reserveInventory(orderId);
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (e) {
    span.recordException(e);
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw e;
  } finally {
    span.end();
  }
}
```

## 3つの柱の使い分け

| 状況 | 使うもの |
|---|---|
| 「エラーが増えた」を検知する | メトリクス（アラート） |
| 「いつ・何が起きたか」を調べる | ログ |
| 「どのサービスが遅いか」を特定する | トレース |

```
アラート（メトリクス）で異常を検知
    ↓
ログで何が起きたか確認
    ↓
トレースでどこが原因か特定
```

## ヘルスチェックエンドポイント

ロードバランサー・Kubernetes がサービスの生死を確認するために使う。

```ts
// Liveness: プロセスが生きているか
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

// Readiness: リクエストを受け付けられる状態か（DB接続確認など）
app.get('/readyz', async (req, res) => {
  const dbOk = await checkDatabase();
  if (!dbOk) return res.status(503).json({ status: 'not ready', reason: 'db' });
  res.json({ status: 'ok' });
});
```

## アラート設計

### SLO（Service Level Objective）

「99.9% のリクエストは 500ms 以内に返す」などの目標値を先に決める。
SLO が守れていないときにアラートを出す。

### アラートの原則

- **ページ（緊急）**: 今すぐ対応しないとサービスに影響。深夜でも起こす。
- **チケット（非緊急）**: 営業時間内に対応すれば良い。

アラートが多すぎると疲弊してアラートを無視するようになる（アラート疲れ）。
**緊急アラートは本当に緊急なものだけ**にする。

## ツール選択

| 用途 | OSS | マネージド |
|---|---|---|
| ログ収集 | Elasticsearch + Kibana | Datadog / CloudWatch |
| メトリクス | Prometheus + Grafana | Datadog / CloudWatch |
| トレース | Jaeger / Zipkin | Datadog / AWS X-Ray |
| 統合 | OpenTelemetry（標準規格） | 各社が対応 |
