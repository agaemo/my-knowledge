import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const features = [
  { title: 'Architecture', details: 'レイヤード・オニオン・DDD・ヘキサゴナル・GoF・SOLID・関数型パターン・MVC/MVP/MVVM', link: '/architecture/' },
  { title: 'Frontend', details: '状態管理・リアクティブプログラミング・JSランタイム（Node.js/Deno）・レンダリング戦略・ネイティブ速度ツールチェーン（SWC/Biome/Oxc）', link: '/frontend/' },
  { title: 'Backend', details: 'REST・GraphQL・gRPC・tRPC', link: '/backend/' },
  { title: 'AI', details: 'ハルシネーション・推論モデル・コンテキストエンジニアリング・RAG・AIエージェント・Evals', link: '/ai/' },
  { title: 'Testing', details: 'TDD・テスト戦略・テストピラミッド・ヘッドレスブラウザ（Playwright・Puppeteer）', link: '/testing/' },
  { title: 'Security', details: 'CORS・XSS・CSRF・SQLi・SSRF・IDOR・ブルートフォース・レインボーテーブル・ゼロデイ・Zero Trust', link: '/security/' },
  { title: '認証', details: 'Basic認証・セッション認証・APIキー・JWT・Bearer・OAuth2・OIDC・SAML', link: '/auth/' },
  { title: 'OS', details: 'UNIX設計思想・Linux・ディストリビューション・ファイルディスクリプタ・I/Oリダイレクト', link: '/os/' },
  { title: 'Networking', details: 'OSIモデル・HTTP/2/3・DNS・TLS・WebSocket/SSE・VPC・NAT', link: '/networking/' },
  { title: 'Observability', details: 'ログ・メトリクス・トレース・OpenTelemetry・分散トレーシング・ログ集約・Zabbix', link: '/observability/' },
  { title: 'SRE', details: '単一障害点・カスケード障害・サーキットブレーカー・バルクヘッド・ポストモーテム・SLO', link: '/sre/' },
  { title: '開発プロセス', details: 'アジャイル・ウォーターフォール・Shape Up・ADR', link: '/process/' },
  { title: 'Deployment', details: 'カナリアリリース・ブルーグリーン・フィーチャーフラグ・エッジコンピューティング', link: '/deployment/' },
  { title: 'Dev Tools', details: 'Docker・Podman・Buildah・Kubernetes・Terraform・GitHub Actions・Nix・mise', link: '/dev-tools/' },
  { title: 'Platforms', details: 'クラウド・XaaS（IaaS/PaaS/SaaS/FaaS）・BaaS・分散DB・Kafka・CMS（ヘッドレス CMS）', link: '/platforms/' },
  { title: '組織', details: 'コンウェイの法則・サイロ化・DevOps・Team Topologies・IC/EM/Staff Engineer・The Model', link: '/org/' },
  { title: 'ビジネス', details: 'ユニコーン・資金調達ステージ・VC・ARR/バーンレート・PMF・SLG/PLG/MLG/CLG', link: '/business/' },
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
