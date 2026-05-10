# MVP（Model-View-Presenter）

MVC の Controller を Presenter に置き換えたパターン。View をインターフェース（抽象）として扱い、Presenter が View に一切依存しないようにする。

## 構成

```
User → View → Presenter → Model
       ↑            ↓
       └────────────┘
      （Viewインターフェース経由）
```

| 役割 | 責任 |
|---|---|
| **Model** | データとビジネスロジック（MVC と同じ） |
| **View** | 表示のみ。インターフェースを実装し、Presenter からの指示を受ける |
| **Presenter** | Viewインターフェースだけに依存してロジックを処理。UIフレームワーク非依存 |

## コード例（Android 旧来の MVP）

```kotlin
// View インターフェース — 表示操作だけを定義
interface LoginView {
    fun showError(message: String)
    fun navigateToHome()
    fun showLoading(show: Boolean)
}

// Presenter — Android クラスに依存しない純粋な Kotlin
class LoginPresenter(
    private val view: LoginView,
    private val authRepo: AuthRepository
) {
    fun login(email: String, password: String) {
        view.showLoading(true)
        authRepo.login(email, password)
            .onSuccess { view.navigateToHome() }
            .onFailure { view.showError(it.message) }
        view.showLoading(false)
    }
}

// Activity が View を実装
class LoginActivity : AppCompatActivity(), LoginView {
    private lateinit var presenter: LoginPresenter

    override fun showError(message: String) { /* Toast 表示 */ }
    override fun navigateToHome() { startActivity(...) }
    override fun showLoading(show: Boolean) { progressBar.visibility = ... }
}
```

## MVC との違い

MVC の Controller は View を直接更新したり、View の具体的な型を知っていることが多い。  
MVP の Presenter は **View インターフェースだけを知る**。Presenter のテストでは View をモックに差し替えられる。

```kotlin
// Presenter のテスト — Android なしで完全にテスト可能
@Test
fun `login failure shows error`() {
    val mockView = mock<LoginView>()
    val presenter = LoginPresenter(mockView, FakeAuthRepo(shouldFail = true))

    presenter.login("user@example.com", "wrong")

    verify(mockView).showError(any())
}
```

## なぜ存在するか

Android では Activity/Fragment が View とコントローラーロジックを兼ねて肥大化しやすかった。Presenter を分離してテスタビリティを確保するために広まった。

## いつ使うか

- UIフレームワーク（Android Activity・WinForms）に依存させたくないロジックを持つとき
- Presenter を JVM ユニットテストで完全にテストしたいとき
- Android では現在 MVVM + ViewModel が主流で MVP は旧来のアプローチ
