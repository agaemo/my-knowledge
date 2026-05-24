# レガシーコードへのテスト追加

テストのないコードにテストを後付けするための概念・手法。  
Michael Feathers の *Working Effectively with Legacy Code*（2004）が主な出典。

> 「テストのないコードはレガシーコードである」— Feathers

書かれた日付に関わらず、テストがなければレガシー扱いという定義。

## Seam（縫い目）

**テストのために振る舞いを差し替えられる箇所**のこと。

レガシーコードに直接モックを挿入できない場合、まず seam を見つけ（または作り）、そこに差し替えポイントを設ける。

```java
// 差し替えできない（seam がない）
public class OrderService {
    public void place(Order order) {
        MailClient client = new MailClient(); // new で直接生成
        client.send(order.getEmail());
    }
}

// seam を作った（DI で差し替え可能に）
public class OrderService {
    private final MailClient client;
    public OrderService(MailClient client) { this.client = client; }
}
```

seam の種類：
- **Object Seam** — コンストラクタ引数・セッターで依存を差し替える（上記の DI が典型）
- **Link Seam** — リンク時に差し替える（C/C++ で使われる）
- **Preprocessing Seam** — プリプロセッサで差し替える（C のマクロなど）

## Characterization Test（特性化テスト）

**既存コードが「今どう動いているか」を記録するためのテスト**。

正しいかどうかではなく、変更前の挙動を固定するのが目的。リファクタリング前のセーフティネットとして使う。

```typescript
// 既存の tax() がどう動くか記録する特性化テスト
it('tax() は 1000 に対して 80 を返す（なぜかは不明）', () => {
    expect(tax(1000)).toBe(80);
});
```

手順：
1. テストを書いて実行し、実際の出力を確認する
2. その出力をそのまま期待値として記録する
3. リファクタリング後に同じテストを通す

バグが混入していても「今の挙動」をそのまま固定することが優先される。バグ修正は別タスクとして扱う。

## Golden Master Testing（Approval Testing）

Characterization Test の一形態。  
**既存の出力全体をスナップショットとして保存し、変更後も同じ出力が出ることを検証する**手法。

```
# 初回実行：出力をファイルに保存
$ ./report.sh > golden_master.txt

# 変更後：差分がないことを確認
$ ./report.sh | diff golden_master.txt -
```

テキスト・HTML・画像など大きな出力に向く。細かい単位でアサーションを書けない複雑なレガシーコードに特に有効。

Characterization Test との違い：

| | Characterization Test | Golden Master Testing |
|---|---|---|
| 粒度 | 関数・メソッド単位 | 出力全体（ファイル・文字列） |
| 書き方 | `expect(fn()).toBe(...)` | diff / スナップショット比較 |
| 向いているケース | 関数が特定できる | 出力が複雑・大きい |

## 後付けテストの進め方

1. **seam を探す** — 差し替え可能な箇所を特定する
2. **Characterization Test を書く** — 今の挙動を固定する
3. **リファクタリングする** — テストが通り続けることを確認しながら進める
4. **目的のテストを追加する** — 本来書きたかった仕様テストを書く
