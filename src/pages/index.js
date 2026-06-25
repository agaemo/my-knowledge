import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const features = [
  {
    title: '設計・開発',
    details: 'アーキテクチャパターン・フロントエンド/バックエンド設計・AI/LLM エンジニアリング・テスト手法・セキュリティ・認証など、ソフトウェアを設計・実装するための概念と判断基準',
    link: '/architecture/',
  },
  {
    title: '運用・インフラ',
    details: 'OS・ネットワーク・オブザーバビリティ・SRE・デプロイ戦略・開発ツール・クラウドプラットフォームなど、システムを動かし続けるための知識',
    link: '/os/',
  },
  {
    title: '組織・プロセス・事業',
    details: 'チーム設計・組織パターン・開発プロセス・ビジネス指標・成長戦略など、プロダクトとチームを持続的に成長させるための考え方',
    link: '/org/',
  },
];

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="ホーム" description={siteConfig.tagline}>
      <header className={styles.heroBanner}>
        <div className="container">
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroTagline}>{siteConfig.tagline}</p>
          <div className={styles.notice}>
            ⚠️ コンテンツの大部分は Claude Code で生成したものであり、未精査のものを含みます。
          </div>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/architecture/">
              Architecture から読む
            </Link>
            <Link className="button button--secondary button--lg" href="https://github.com/agaemo/my-knowledge">
              GitHub
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className={styles.featureGrid}>
              {features.map(({ title, details, link }) => (
                <Link key={title} to={link} className={styles.featureCard}>
                  <h3>{title}</h3>
                  <p>{details}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
