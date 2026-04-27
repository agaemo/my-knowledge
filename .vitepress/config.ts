import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'my-knowledge',
  description: '個人の知識ベース',
  lang: 'ja',
  base: '/my-knowledge/',
  themeConfig: {
    nav: [
      { text: 'ホーム', link: '/' },
    ],
    sidebar: [
      {
        text: 'Architecture',
        items: [
          { text: 'レイヤード', link: '/architecture/01_layered' },
          { text: 'モジュラーモノリス', link: '/architecture/02_modular-monolith' },
          { text: 'オニオン', link: '/architecture/03_onion' },
          { text: 'DDD', link: '/architecture/04_ddd' },
          { text: 'ヘキサゴナル', link: '/architecture/05_hexagonal' },
          { text: 'イベント駆動', link: '/architecture/06_event-driven' },
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
          { text: 'RAG', link: '/ai/rag' },
          { text: 'AIエージェント', link: '/ai/ai-agents' },
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
    ],
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/agaemo/my-knowledge' },
    ],
  },
})
