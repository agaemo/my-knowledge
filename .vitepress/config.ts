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
        text: 'Testing',
        link: '/testing/',
        collapsed: true,
        items: [
          { text: 'TDD', link: '/testing/tdd' },
          { text: 'テスト戦略', link: '/testing/testing-strategy' },
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
          { text: 'AIエージェント', link: '/ai/ai-agents' },
          { text: 'Fine-tuning', link: '/ai/fine-tuning' },
          { text: 'Evals', link: '/ai/evals' },
          { text: 'MCP', link: '/ai/mcp' },
          { text: 'LLMOps', link: '/ai/llmops' },
        ],
      },
      {
        text: 'API',
        link: '/api/',
        collapsed: true,
        items: [
          { text: 'REST設計', link: '/api/rest-design' },
          { text: 'GraphQL', link: '/api/graphql' },
          { text: 'gRPC', link: '/api/grpc' },
          { text: 'tRPC', link: '/api/trpc' },
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
        ],
      },
      {
        text: 'Dev Tools',
        link: '/tools/',
        collapsed: true,
        items: [
          {
            text: 'Infra',
            link: '/tools/infra/',
            collapsed: true,
            items: [
              { text: 'Docker', link: '/tools/infra/docker' },
              { text: 'Kubernetes', link: '/tools/infra/kubernetes' },
              { text: 'Terraform', link: '/tools/infra/terraform' },
            ],
          },
          {
            text: 'Local',
            link: '/tools/local/',
            collapsed: true,
            items: [
              { text: 'VSCode', link: '/tools/local/vscode' },
              { text: 'Cursor', link: '/tools/local/cursor' },
            ],
          },
        ],
      },
      {
        text: 'Platforms',
        link: '/tools/platforms',
        collapsed: true,
        items: [
          {
            text: 'Cloud',
            link: '/tools/cloud/',
            collapsed: true,
            items: [
              { text: 'AWS', link: '/tools/cloud/aws' },
              { text: 'GCP', link: '/tools/cloud/gcp' },
              { text: 'Azure', link: '/tools/cloud/azure' },
            ],
          },
          {
            text: 'Database',
            link: '/tools/database/',
            collapsed: true,
            items: [
              { text: 'PlanetScale', link: '/tools/database/planetscale' },
              { text: 'CockroachDB', link: '/tools/database/cockroachdb' },
              { text: 'TiDB', link: '/tools/database/tidb' },
            ],
          },
          {
            text: 'BaaS',
            link: '/tools/baas/',
            collapsed: true,
            items: [
              { text: 'Firebase', link: '/tools/baas/firebase' },
              { text: 'Supabase', link: '/tools/baas/supabase' },
            ],
          },
          {
            text: 'Hosting / Edge',
            link: '/tools/hosting/',
            collapsed: true,
            items: [
              { text: 'Vercel', link: '/tools/hosting/vercel' },
              { text: 'Cloudflare', link: '/tools/hosting/cloudflare' },
            ],
          },
          {
            text: 'CI/CD',
            link: '/tools/ci-cd/',
            collapsed: true,
            items: [
              { text: 'GitHub Actions', link: '/tools/ci-cd/github-actions' },
            ],
          },
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
