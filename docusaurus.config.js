// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'my-knowledge',
  tagline: '用語・概念・設計パターンなど、忘れやすいものをまとめています。',
  favicon: 'logo.svg',

  url: 'https://agaemo.github.io',
  baseUrl: '/my-knowledge/',

  organizationName: 'agaemo',
  projectName: 'my-knowledge',

  trailingSlash: true,
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['ja', 'en'],
        highlightSearchTermsOnTargetPage: true,
        docsRouteBasePath: '/',
        indexBlog: false,
      },
    ],
  ],
  markdown: {
    mermaid: true,
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'my-knowledge',
        logo: {
          alt: 'my-knowledge',
          src: 'logo.svg',
        },
        items: [
          {
            href: 'https://github.com/agaemo/my-knowledge',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      mermaid: {
        theme: { light: 'neutral', dark: 'dark' },
      },
    }),
};

export default config;
