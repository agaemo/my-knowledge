# OpenTelemetry

## 何か

テレメトリデータ（トレース・メトリクス・ログ）の生成・収集・エクスポートを標準化するオープンソースのフレームワーク。
特定のベンダーやツールに依存しない「共通の仕様とAPI群」を提供する。

出典: [What is OpenTelemetry?](https://opentelemetry.io/docs/what-is-opentelemetry/)

## なぜ存在するか

マイクロサービスの普及により、Datadog・New Relic・Jaeger など監視ツールが乱立した。
それぞれ独自のSDKを使うため、ツールを変えるたびにアプリのコードを書き直す必要があった（ベンダーロックイン）。

OpenTelemetry はこの問題を解決する：
- **データの所有権**: 生成したテレメトリデータは自分のもの。ベンダーに依存しない
- **学習コストの削減**: 1つのAPIを覚えれば、どのバックエンドにも送れる

```
[アプリ] → OpenTelemetry SDK → OpenTelemetry Collector → Datadog
                                                         → Jaeger
                                                         → Prometheus
                                                         → (任意のバックエンド)
```

バックエンド（ストレージ）とフロントエンド（可視化）は意図的に他のツールに委ねている。

## Signal（シグナル）

OpenTelemetry が扱うテレメトリデータの種類。

| Signal | 定義 | 例 |
|---|---|---|
| Traces | リクエストがアプリを通る経路 | APIが3つのサービスを経由した記録 |
| Metrics | 実行時に計測した数値 | CPU使用率・リクエスト数/秒 |
| Logs | 発生したイベントの記録 | エラーログ・認証ログ |
| Baggage | Signal間で共有するコンテキスト情報 | ユーザーIDをトレース全体に伝搬 |

出典: [OpenTelemetry Signals](https://opentelemetry.io/docs/concepts/signals/)

## 主要コンポーネント

### SDK

各プログラミング言語向けの実装。アプリにインポートしてテレメトリを生成・エクスポートする。

```ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://collector:4318/v1/traces' }),
});
sdk.start();
```

### Collector

アプリとバックエンドの間に立つプロキシ。テレメトリを受け取り、変換・フィルタリングして複数のバックエンドへ送る。

```
[アプリ（SDK）] → Collector（受信 → 処理 → エクスポート） → バックエンド
```

Collectorを挟むことで、バックエンドの変更がアプリのコードに影響しなくなる。

## いつ使うか

- 複数の監視ツールを併用している（トレースはJaeger、メトリクスはPrometheus など）
- 将来的にツールを乗り換える可能性がある
- マイクロサービス構成で分散トレーシングが必要

## いつ使わないか

- 単一サービスで Datadog 一択と決まっている → Datadog のネイティブSDKの方がシンプル
- インフラ・NW機器の死活監視が主目的 → Zabbix
