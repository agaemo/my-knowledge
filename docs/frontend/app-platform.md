# アプリプラットフォーム

モバイル・デスクトップアプリの実装アプローチ。ネイティブ・クロスプラットフォーム・PWAの3つに大別され、開発コスト・パフォーマンス・UXのトレードオフで選択する。

## なぜ複数のアプローチが存在するか

iOS と Android はそれぞれ異なるプラットフォームで、OS・UI・APIが異なる。両プラットフォームに対応するには「それぞれを個別に作る」か「一つのコードから両方を生成する」かの選択が生まれる。さらにWebの進化でブラウザでもネイティブに近い体験が可能になり、PWAという第三の選択肢も登場した。

## ネイティブアプリ

各プラットフォームの公式言語・SDKで開発する。

| プラットフォーム | 言語 | UI フレームワーク |
|----------------|------|----------------|
| iOS | Swift / Objective-C | UIKit / SwiftUI |
| Android | Kotlin / Java | View / Jetpack Compose |
| macOS | Swift | AppKit / SwiftUI |
| Windows | C# | WinUI / WPF |

**メリット:**
- 最高のパフォーマンス
- プラットフォームの最新機能を即座に利用できる
- OS標準のUX・アクセシビリティに自然に対応

**デメリット:**
- iOS・Android それぞれの開発リソースが必要
- コードベースが分かれるため保守コストが高い

## クロスプラットフォーム

一つのコードベースから複数プラットフォーム向けのアプリを生成する。

### Flutter
Googleが開発。DartでUIを含めて記述し、独自レンダリングエンジン（Skia/Impeller）で描画する。OSのUIコンポーネントを使わないため、全プラットフォームで見た目が統一される。

```dart
// Flutter のウィジェット例
class MyButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {},
      child: Text('タップ'),
    );
  }
}
```

**特徴:** iOS・Android・Web・デスクトップを1つのコードでカバー。パフォーマンスはネイティブに近い。

### React Native
Metaが開発。ReactのコンポーネントモデルでUIを書き、実行時にネイティブコンポーネントに変換する。JavaScriptエンジニアがモバイル開発に参入しやすい。

```tsx
// React Native のコンポーネント例
const MyButton = () => (
  <TouchableOpacity onPress={() => {}}>
    <Text>タップ</Text>
  </TouchableOpacity>
)
```

**特徴:** Webエンジニアが学びやすい。大規模なエコシステム。OSのUIコンポーネントを使うためプラットフォームごとの見た目になる。

### その他
- **Kotlin Multiplatform** — ロジック層を共有しUIはネイティブで書く。コード共有とネイティブUXを両立
- **Capacitor / Ionic** — WebアプリをWebViewでラップしてアプリ化。既存のWebコードを流用できる

## PWA（Progressive Web App）

Webアプリにネイティブアプリ的な機能（オフライン動作・プッシュ通知・ホーム画面追加）を付加する技術。

```json
// manifest.json
{
  "name": "My App",
  "start_url": "/",
  "display": "standalone",
  "icons": [{ "src": "/icon.png", "sizes": "192x192" }]
}
```

**メリット:**
- アプリストアの審査が不要
- URLで共有できる
- 1つのコードベースでWeb・モバイルに対応

**デメリット:**
- iOS での制限が多い（プッシュ通知・Bluetooth・NFCなど）
- アプリストアに掲載できないため発見性が低い

## 選択の基準

| 状況 | 推奨アプローチ |
|------|-------------|
| カメラ・生体認証など高度なOS機能が必要 | ネイティブ |
| iOS・Android 両対応でチームが小さい | クロスプラットフォーム（Flutter / React Native） |
| Webエンジニアのみのチーム | React Native または PWA |
| 全プラットフォームで統一UIが必要 | Flutter |
| 既存WebアプリをアプリストアなしでモバイルUI化 | PWA |
| パフォーマンスとUXを最優先 | ネイティブ |
