# XaaS（X as a Service）

クラウド上でサービスとして提供される IT リソースの総称。「どのレイヤーまでベンダーが管理し、どこからを自分たちが担うか」を表す責任分担モデル。

## なぜ存在するか

オンプレミスではインフラからアプリまで全て自前で管理していた。クラウドの登場で「インフラだけ借りる」「実行環境ごと借りる」「ソフトウェアそのものを使う」という選択肢が生まれ、その分担の粒度を表す言葉として XaaS が使われるようになった。

「どのレイヤーを自分たちでコントロールするか」と「どのレイヤーの管理コストを手放すか」のトレードオフを整理する概念。

## 責任分担モデル

管理する層が多いほど自由度が上がり、管理コストも上がる。

```
                 管理する層   自由度   管理コスト
                 ─────────────────────────────────
オンプレミス     全層         最大     最大
IaaS             OS 以上      高       高
PaaS             アプリ以上   中       中
FaaS / CaaS      コード以上   中       低〜中
SaaS             データのみ   最小     最小
```

各モデルで何を管理するか：

| レイヤー | オンプレ | IaaS | PaaS | SaaS |
|---|:---:|:---:|:---:|:---:|
| アプリケーション | 自前 | 自前 | 自前 | ベンダー |
| データ | 自前 | 自前 | 自前 | 自前 |
| ランタイム・MW | 自前 | 自前 | ベンダー | ベンダー |
| OS | 自前 | 自前 | ベンダー | ベンダー |
| 仮想化 | 自前 | ベンダー | ベンダー | ベンダー |
| ハードウェア | 自前 | ベンダー | ベンダー | ベンダー |

## 主要な XaaS

### IaaS（Infrastructure as a Service）
仮想サーバー・ストレージ・ネットワークを提供。OS より上は自前で管理。  
**例**: AWS EC2・Google Compute Engine・Azure VM

### PaaS（Platform as a Service）
アプリを動かす実行環境を提供。OS・ミドルウェアの管理が不要。  
**例**: Heroku・Google App Engine・AWS Elastic Beanstalk・Render

### SaaS（Software as a Service）
完成したソフトウェアをサービスとして提供。自分たちはデータを入れて使うだけ。  
**例**: Slack・Gmail・Salesforce・GitHub・Notion

### FaaS（Function as a Service）
関数単位でコードを実行する。サーバーの存在を意識しない（サーバーレス）。  
**例**: AWS Lambda・Google Cloud Functions・Cloudflare Workers  
**特徴**: リクエストがないときはコストがかからない。コールドスタートの遅延がある。

### CaaS（Container as a Service）
コンテナの実行・管理基盤を提供。Kubernetes クラスターの運用をベンダーが担う。  
**例**: Google Kubernetes Engine（GKE）・Amazon EKS・Azure AKS

### DBaaS（Database as a Service）
データベースのプロビジョニング・バックアップ・パッチ適用をベンダーが担う。  
**例**: Amazon RDS・Cloud SQL・PlanetScale・Neon

### BaaS（Backend as a Service）
認証・DB・ストレージ・プッシュ通知などのバックエンド機能をまとめて提供。  
**例**: Firebase・Supabase・Appwrite

### DaaS（Desktop as a Service）
仮想デスクトップ環境をクラウドで提供。端末を選ばず同じ環境を使える。  
**例**: Amazon WorkSpaces・Azure Virtual Desktop  
**使われる場面**: リモートワーク・BYOD 環境・セキュリティ要件が高い業種

## どれを選ぶか

選択の軸は「コントロールの必要性」と「運用コストの許容量」。

| 状況 | 向いているモデル |
|---|---|
| インフラを細かく制御したい（特殊な OS 設定・ライセンス持ち込み） | IaaS |
| アプリ開発に集中したい・インフラを意識したくない | PaaS |
| イベント駆動・バースト性の高い処理 | FaaS |
| コンテナで動かしたいが Kubernetes の運用はしたくない | CaaS |
| 自社で作る必要のない汎用業務ツール | SaaS |
| 小チームで認証・DBを素早く用意したい | BaaS |

**「作る vs. 買う vs. 借りる」の判断基準：**  
自社の差別化に直結しない機能は、できるだけ上位の XaaS に任せる。認証・メール送信・監視・決済は SaaS や BaaS で賄い、ビジネスロジックの実装に集中するのが現代的なアプローチ。
