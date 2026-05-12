import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'my-knowledge',
  description: '個人の知識ベース',
  lang: 'ja',
  base: '/my-knowledge/',
  srcDir: './docs',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/my-knowledge/logo.svg' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'ホーム', link: '/' },
    ],
    sidebar: [
      {
        text: '設計・開発',
        items: [
      {
        text: 'Architecture',
        link: '/architecture/',
        collapsed: true,
        items: [
          { text: 'レイヤード', link: '/architecture/layered' },
          { text: 'モジュラーモノリス', link: '/architecture/modular-monolith' },
          { text: 'オニオン', link: '/architecture/onion' },
          { text: 'DDD', link: '/architecture/ddd' },
          { text: 'ヘキサゴナル', link: '/architecture/hexagonal' },
          { text: 'イベント駆動', link: '/architecture/event-driven' },
          { text: 'ストラングラーフィグ', link: '/architecture/strangler-fig' },
          { text: 'CQRS / Event Sourcing', link: '/architecture/cqrs-event-sourcing' },
          { text: 'CAP定理', link: '/architecture/cap-theorem' },
          {
            text: 'GoF デザインパターン',
            link: '/architecture/design-patterns/',
            collapsed: true,
            items: [
              { text: '生成パターン', link: '/architecture/design-patterns/creational' },
              { text: '構造パターン', link: '/architecture/design-patterns/structural' },
              { text: '振る舞いパターン', link: '/architecture/design-patterns/behavioral' },
              { text: 'SOLID 原則', link: '/architecture/design-patterns/solid' },
              { text: 'プログラミング原則', link: '/architecture/design-patterns/principles' },
            ],
          },
          {
            text: '関数型パターン',
            link: '/architecture/functional-patterns/',
          },
          {
            text: 'MV* パターン',
            link: '/architecture/mv-patterns/',
            collapsed: true,
            items: [
              { text: 'MVC', link: '/architecture/mv-patterns/mvc' },
              { text: 'MVP', link: '/architecture/mv-patterns/mvp' },
              { text: 'MVVM', link: '/architecture/mv-patterns/mvvm' },
              { text: 'MVI', link: '/architecture/mv-patterns/mvi' },
            ],
          },
        ],
      },
      {
        text: 'Frontend',
        link: '/frontend/',
        collapsed: true,
        items: [
          { text: '状態管理パターン', link: '/frontend/state-management' },
          { text: 'リアクティブプログラミング', link: '/frontend/reactivity' },
          { text: 'JavaScript ランタイム', link: '/frontend/js-runtime' },
          { text: 'CSS設計手法', link: '/frontend/css-methodology' },
          { text: 'レンダリング戦略', link: '/frontend/rendering-strategy' },
          { text: 'アプリプラットフォーム', link: '/frontend/app-platform' },
          { text: 'i18n（国際化）', link: '/frontend/i18n' },
        ],
      },
      {
        text: 'Backend',
        link: '/backend/',
        collapsed: true,
        items: [
          { text: 'リバースプロキシ', link: '/backend/reverse-proxy' },
          { text: '冪等性', link: '/backend/idempotency' },
          {
            text: 'API',
            link: '/backend/api/',
            collapsed: true,
            items: [
              { text: 'REST設計', link: '/backend/api/rest-design' },
              { text: 'GraphQL', link: '/backend/api/graphql' },
              { text: 'gRPC', link: '/backend/api/grpc' },
              { text: 'tRPC', link: '/backend/api/trpc' },
              { text: 'APIバージョニング', link: '/backend/api/api-versioning' },
              { text: 'API Gateway', link: '/backend/api/api-gateway' },
            ],
          },
        ],
      },
      {
        text: 'AI',
        link: '/ai/',
        collapsed: true,
        items: [
          { text: 'AI・ML・LLM 全体像', link: '/ai/overview' },
          {
            text: 'LLM の基礎概念',
            link: '/ai/llm-basics/',
            collapsed: true,
            items: [
              { text: 'ハルシネーション', link: '/ai/llm-basics/hallucination' },
              { text: '推論モデル', link: '/ai/llm-basics/reasoning-models' },
              { text: 'コンテキストエンジニアリング', link: '/ai/llm-basics/context-engineering' },
            ],
          },
          {
            text: 'プロンプト',
            link: '/ai/prompt/',
            collapsed: true,
            items: [
              { text: 'プロンプトエンジニアリング', link: '/ai/prompt/prompt-engineering' },
              { text: 'Prompt Injection', link: '/ai/prompt/prompt-injection' },
            ],
          },
          {
            text: 'データ・検索',
            link: '/ai/data-search/',
            collapsed: true,
            items: [
              { text: 'RAG', link: '/ai/data-search/rag' },
              { text: 'Embeddings', link: '/ai/data-search/embeddings' },
              { text: 'マルチモーダル', link: '/ai/data-search/multimodal' },
            ],
          },
          {
            text: 'エージェント',
            link: '/ai/agents/',
            collapsed: true,
            items: [
              { text: 'AIエージェント', link: '/ai/agents/ai-agents' },
              { text: 'MCP', link: '/ai/agents/mcp' },
            ],
          },
          {
            text: 'モデル改善・運用',
            link: '/ai/mlops/',
            collapsed: true,
            items: [
              { text: 'Fine-tuning', link: '/ai/mlops/fine-tuning' },
              { text: 'Evals', link: '/ai/mlops/evals' },
              { text: 'LLMOps', link: '/ai/mlops/llmops' },
              { text: 'Langfuse', link: '/ai/mlops/langfuse' },
              { text: 'HITL', link: '/ai/mlops/hitl' },
            ],
          },
          {
            text: '開発スタイル',
            link: '/ai/dev-style/',
            collapsed: true,
            items: [
              { text: 'AI-DLC', link: '/ai/dev-style/ai-dlc' },
              { text: 'Vibe Coding', link: '/ai/dev-style/vibe-coding' },
              { text: 'Harness Engineering', link: '/ai/dev-style/harness-engineering' },
            ],
          },
          {
            text: 'コンピュータビジョン',
            link: '/ai/computer-vision/',
            collapsed: true,
            items: [
              { text: 'OCR', link: '/ai/computer-vision/ocr' },
              { text: '物体検出', link: '/ai/computer-vision/object-detection' },
            ],
          },
        ],
      },
      {
        text: 'Testing',
        link: '/testing/',
        collapsed: true,
        items: [
          { text: 'TDD', link: '/testing/tdd' },
          { text: 'テストダブル', link: '/testing/test-doubles' },
          { text: '契約テスト', link: '/testing/contract-testing' },
          { text: 'テスト戦略', link: '/testing/testing-strategy' },
        ],
      },
      {
        text: 'Security',
        link: '/security/',
        collapsed: true,
        items: [
          { text: 'CORS', link: '/security/cors' },
          { text: 'Cookie', link: '/security/cookie' },
          { text: '暗号化の基礎', link: '/security/encryption' },
          { text: 'セキュリティ設計原則', link: '/security/principles' },
          {
            text: 'コードで防ぐ攻撃',
            link: '/security/code-attacks/',
            collapsed: true,
            items: [
              { text: 'Web攻撃手法', link: '/security/code-attacks/web-attacks' },
            ],
          },
          {
            text: '脅威・リスク',
            link: '/security/threats/',
            collapsed: true,
            items: [
              { text: 'ゼロデイ攻撃・N-day攻撃', link: '/security/threats/zero-day' },
              { text: 'サプライチェーン攻撃', link: '/security/threats/supply-chain-attack' },
            ],
          },
        ],
      },
      {
        text: '認証',
        link: '/auth/',
        collapsed: true,
        items: [
          { text: '使い分けガイド', link: '/auth/overview' },
          { text: 'Basic 認証', link: '/auth/basic-auth' },
          { text: 'セッション認証', link: '/auth/session-auth' },
          { text: 'APIキー認証', link: '/auth/api-key' },
          { text: 'JWT', link: '/auth/jwt' },
          { text: 'Bearer 認証', link: '/auth/bearer' },
          { text: 'OAuth2', link: '/auth/oauth2' },
          { text: 'OpenID Connect（OIDC）', link: '/auth/oidc' },
          { text: 'SAML', link: '/auth/saml' },
        ],
      },
        ], // 設計・開発 end
      },
      {
        text: '運用・インフラ',
        items: [
      {
        text: 'Observability',
        link: '/observability/',
        collapsed: true,
        items: [
          { text: 'オブザーバビリティ', link: '/observability/observability' },
          { text: 'OpenTelemetry', link: '/observability/opentelemetry' },
          { text: '分散トレーシング', link: '/observability/distributed-tracing' },
          { text: 'ログ集約', link: '/observability/log-aggregation' },
          { text: 'Zabbix', link: '/observability/zabbix' },
          { text: 'メトリクス設計', link: '/observability/metrics-design' },
        ],
      },
      {
        text: 'SRE',
        link: '/sre/',
        collapsed: true,
        items: [
          { text: 'SREとは何か', link: '/sre/what-is-sre' },
          { text: 'SLI / SLO / SLA', link: '/sre/slo-sli-sla' },
          { text: 'エラーバジェット', link: '/sre/error-budget' },
          {
            text: '障害パターン',
            link: '/sre/failure/',
            collapsed: true,
            items: [
              { text: '単一障害点（SPOF）', link: '/sre/failure/single-point-of-failure' },
              { text: 'カスケード障害', link: '/sre/failure/cascade-failure' },
              { text: 'リトライストーム', link: '/sre/failure/retry-storm' },
            ],
          },
          {
            text: '対策パターン',
            link: '/sre/resilience/',
            collapsed: true,
            items: [
              { text: 'タイムアウト設計', link: '/sre/resilience/timeout' },
              { text: 'サーキットブレーカー', link: '/sre/resilience/circuit-breaker' },
              { text: 'バルクヘッド', link: '/sre/resilience/bulkhead' },
              { text: 'バックプレッシャー', link: '/sre/resilience/backpressure' },
            ],
          },
          { text: 'ポストモーテム', link: '/sre/postmortem' },
        ],
      },
      {
        text: 'Deployment',
        link: '/deployment/',
        collapsed: true,
        items: [
          { text: 'カナリアリリース', link: '/deployment/canary-release' },
          { text: 'ブルーグリーン', link: '/deployment/blue-green' },
          { text: 'フィーチャーフラグ', link: '/deployment/feature-flags' },
          { text: 'エッジコンピューティング', link: '/deployment/edge-computing' },
          { text: 'CDN', link: '/deployment/cdn' },
          { text: 'GitOps', link: '/deployment/gitops' },
        ],
      },
      {
        text: 'Dev Tools',
        link: '/dev-tools/',
        collapsed: true,
        items: [
          {
            text: 'Infra',
            link: '/dev-tools/infra/',
            collapsed: true,
            items: [
              { text: 'Docker', link: '/dev-tools/infra/docker' },
              { text: 'Podman', link: '/dev-tools/infra/podman' },
              { text: 'Buildah', link: '/dev-tools/infra/buildah' },
              { text: 'Kubernetes', link: '/dev-tools/infra/kubernetes' },
              { text: 'Terraform', link: '/dev-tools/infra/terraform' },
              { text: 'Ansible', link: '/dev-tools/infra/ansible' },
            ],
          },
          {
            text: 'プラットフォームエンジニアリング',
            link: '/dev-tools/platform-engineering',
          },
          {
            text: 'CI/CD',
            link: '/dev-tools/ci-cd/',
            collapsed: true,
            items: [
              { text: 'GitHub Actions', link: '/dev-tools/ci-cd/github-actions' },
            ],
          },
          {
            text: '環境管理',
            link: '/dev-tools/env-management/',
            collapsed: true,
            items: [
              { text: 'Nix', link: '/dev-tools/env-management/nix' },
              { text: 'mise', link: '/dev-tools/env-management/mise' },
            ],
          },
        ],
      },
      {
        text: 'Platforms',
        link: '/platforms/',
        collapsed: true,
        items: [
          { text: 'クラウド', link: '/platforms/cloud' },
          { text: 'XaaS', link: '/platforms/xaas' },
          {
            text: 'Database',
            link: '/platforms/database/',
            collapsed: true,
            items: [
              { text: 'RDBMS', link: '/platforms/database/rdbms' },
              { text: 'NoSQL', link: '/platforms/database/nosql' },
              { text: 'NewSQL', link: '/platforms/database/newsql' },
              { text: 'インメモリDB', link: '/platforms/database/in-memory-db' },
              { text: 'OLAP（分析DB）', link: '/platforms/database/olap' },
            ],
          },
          { text: 'BaaS', link: '/platforms/baas' },
          { text: 'Apache Kafka', link: '/platforms/kafka' },
        ],
      },
        ], // 運用・インフラ end
      },
      {
        text: '組織・プロセス・事業',
        items: [
          {
        text: '組織',
        link: '/org/',
        collapsed: true,
        items: [
          { text: 'コンウェイの法則', link: '/org/conways-law' },
          { text: 'エンジニアリングロール', link: '/org/engineering-roles' },
          { text: 'The Model', link: '/org/the-model' },
        ],
      },
      {
        text: 'ビジネス',
        link: '/business/',
        collapsed: true,
        items: [
          { text: '会社の種類', link: '/business/company-types' },
          { text: '資金調達', link: '/business/funding' },
          { text: '重要指標', link: '/business/metrics' },
          { text: '成長戦略', link: '/business/growth-strategy' },
          { text: 'North Star Metric', link: '/business/north-star-metric' },
          { text: 'KGI・KPI・OKR', link: '/business/kpi' },
          { text: 'OKR', link: '/business/okr' },
          { text: 'Rule of 40', link: '/business/rule-of-40' },
        ],
      },
      {
        text: '開発プロセス',
        link: '/process/',
        collapsed: true,
        items: [
          { text: 'アジャイル', link: '/process/agile' },
          { text: 'ウォーターフォール', link: '/process/waterfall' },
          { text: 'Shape Up', link: '/process/shape-up' },
          { text: 'セマンティックバージョニング', link: '/process/semver' },
          { text: 'ADR', link: '/process/adr' },
          { text: 'PoC / Prototype / MVP / Spike', link: '/process/poc' },
          { text: '技術的負債', link: '/process/technical-debt' },
        ],
      },
        ], // 組織・プロセス・事業 end
      },
    ],
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/agaemo/my-knowledge' },
    ],
  },
})
