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
          { text: 'Vibe Coding', link: '/ai/vibe-coding' },
          { text: 'Harness Engineering', link: '/ai/harness-engineering' },
          { text: 'プロンプトエンジニアリング', link: '/ai/prompt-engineering' },
          { text: 'Prompt Injection', link: '/ai/prompt-injection' },
          { text: 'RAG', link: '/ai/rag' },
          { text: 'Embeddings', link: '/ai/embeddings' },
          { text: 'マルチモーダル', link: '/ai/multimodal' },
          { text: 'AIエージェント', link: '/ai/ai-agents' },
          { text: 'Fine-tuning', link: '/ai/fine-tuning' },
          { text: 'Evals', link: '/ai/evals' },
          { text: 'HITL', link: '/ai/hitl' },
          { text: 'MCP', link: '/ai/mcp' },
          { text: 'LLMOps', link: '/ai/llmops' },
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
          { text: 'Web攻撃手法', link: '/security/web-attacks' },
          { text: 'Cookie', link: '/security/cookie' },
        ],
      },
      {
        text: '認証',
        link: '/auth/',
        collapsed: true,
        items: [
          { text: 'JWT', link: '/auth/jwt' },
          { text: 'OAuth2', link: '/auth/oauth2' },
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
