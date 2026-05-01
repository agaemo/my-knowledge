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
        ],
      },
      {
        text: 'Frontend',
        link: '/frontend/',
        collapsed: true,
        items: [
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
            text: 'コンピュータビジョン',
            link: '/ai/computer-vision/',
            collapsed: true,
            items: [
              { text: 'OCR', link: '/ai/computer-vision/ocr' },
              { text: '物体検出', link: '/ai/computer-vision/object-detection' },
            ],
          },
          { text: 'AI-DLC', link: '/ai/ai-dlc' },
          { text: 'Vibe Coding', link: '/ai/vibe-coding' },
          { text: 'Harness Engineering', link: '/ai/harness-engineering' },
          { text: 'プロンプトエンジニアリング', link: '/ai/prompt-engineering' },
          { text: 'Prompt Injection', link: '/ai/prompt-injection' },
          { text: 'RAG', link: '/ai/rag' },
          { text: 'Embeddings', link: '/ai/embeddings' },
          { text: 'マルチモーダル', link: '/ai/multimodal' },
          { text: 'AIエージェント', link: '/ai/ai-agents' },
          { text: 'MCP', link: '/ai/mcp' },
          { text: 'Fine-tuning', link: '/ai/fine-tuning' },
          { text: 'Evals', link: '/ai/evals' },
          { text: 'LLMOps', link: '/ai/llmops' },
          { text: 'HITL', link: '/ai/hitl' },
        ],
      },
      {
        text: 'Testing',
        link: '/testing/',
        collapsed: true,
        items: [
          { text: 'TDD', link: '/testing/tdd' },
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
          {
            text: 'コードで防ぐ攻撃',
            collapsed: true,
            items: [
              { text: 'Web攻撃手法', link: '/security/web-attacks' },
            ],
          },
          {
            text: '脅威・リスク',
            collapsed: true,
            items: [
              { text: 'ゼロデイ攻撃・N-day攻撃', link: '/security/zero-day' },
              { text: 'サプライチェーン攻撃', link: '/security/supply-chain-attack' },
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
      {
        text: 'Observability',
        link: '/observability/',
        collapsed: true,
        items: [
          { text: 'オブザーバビリティ', link: '/observability/observability' },
        ],
      },
      {
        text: 'SRE',
        link: '/sre/',
        collapsed: true,
        items: [
          { text: 'SLI / SLO / SLA', link: '/sre/slo-sli-sla' },
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
        text: '開発プロセス',
        link: '/process/',
        collapsed: true,
        items: [
          { text: 'アジャイル', link: '/process/agile' },
          { text: 'ウォーターフォール', link: '/process/waterfall' },
          { text: 'Shape Up', link: '/process/shape-up' },
          { text: 'セマンティックバージョニング', link: '/process/semver' },
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
              { text: 'Kubernetes', link: '/dev-tools/infra/kubernetes' },
              { text: 'Terraform', link: '/dev-tools/infra/terraform' },
            ],
          },
          {
            text: 'CI/CD',
            link: '/dev-tools/ci-cd/',
            collapsed: true,
            items: [
              { text: 'GitHub Actions', link: '/dev-tools/ci-cd/github-actions' },
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
          {
            text: 'Database',
            link: '/platforms/database/',
            collapsed: true,
            items: [
              { text: 'NoSQL', link: '/platforms/database/nosql' },
              { text: 'NewSQL', link: '/platforms/database/newsql' },
              { text: 'インメモリDB', link: '/platforms/database/in-memory-db' },
            ],
          },
          { text: 'BaaS', link: '/platforms/baas' },
        ],
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
