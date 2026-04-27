import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'my-knowledge',
  description: '個人の知識ベース',
  lang: 'ja',
  base: '/my-knowledge/',
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
        items: [
          { text: 'TDD', link: '/testing/tdd' },
          { text: 'テスト戦略', link: '/testing/testing-strategy' },
        ],
      },
      {
        text: 'AI',
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
        items: [
          { text: 'REST設計', link: '/api/rest-design' },
          { text: 'GraphQL', link: '/api/graphql' },
          { text: 'gRPC', link: '/api/grpc' },
          { text: 'tRPC', link: '/api/trpc' },
        ],
      },
      {
        text: '認証',
        items: [
          { text: 'JWT', link: '/auth/jwt' },
          { text: 'OAuth2', link: '/auth/oauth2' },
        ],
      },
      {
        text: 'Observability',
        items: [
          { text: 'オブザーバビリティ', link: '/observability/observability' },
        ],
      },
      {
        text: '開発プロセス',
        items: [
          { text: 'アジャイル', link: '/process/agile' },
          { text: 'ウォーターフォール', link: '/process/waterfall' },
          { text: 'Shape Up', link: '/process/shape-up' },
        ],
      },
      {
        text: 'Deployment',
        items: [
          { text: 'カナリアリリース', link: '/deployment/canary-release' },
          { text: 'ブルーグリーン', link: '/deployment/blue-green' },
          { text: 'フィーチャーフラグ', link: '/deployment/feature-flags' },
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
