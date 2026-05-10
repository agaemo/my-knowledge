# MVC（Model-View-Controller）

最も歴史が古く、最も広く使われている MV* パターン。1970年代に Smalltalk で生まれ、Web フレームワークで普及した。

## 構成

```
User → Controller → Model
                 ↓
              View ← Model
```

| 役割 | 責任 |
|---|---|
| **Model** | データとビジネスロジック。DBとのやり取り、バリデーション |
| **View** | 表示。Model のデータをレンダリングするだけ |
| **Controller** | 入力を受け取り、Model を更新し、View を選ぶ |

## コード例（Rails 風）

```ruby
# Controller — リクエストを受け取り、Model を操作して View を指定
class PostsController
  def create
    @post = Post.new(post_params)  # Model を操作
    if @post.save
      redirect_to @post            # View（redirect）を選ぶ
    else
      render :new                  # View を選ぶ
    end
  end
end

# Model — ビジネスロジックとデータ
class Post < ApplicationRecord
  validates :title, presence: true
end
```

```erb
<!-- View — 表示だけ -->
<h1><%= @post.title %></h1>
```

## なぜ存在するか

HTML を直接生成するスクリプト（PHP の初期など）ではロジックと表示が混在し、変更が伝播しやすかった。Controller を挟むことで「何をするか（Controller）」「どう表示するか（View）」「データはどうか（Model）」を独立して変更できるようにした。

## 特徴と注意点

**Fat Controller 問題：** Controller にロジックが集まりすぎると「Fat Controller」になる。ビジネスロジックは Model か Service クラスに追い出すのが現代的なプラクティス。

**Web フレームワークでの変形：** Rails・Django・Spring MVC の「MVC」はオリジナルと若干異なる。View は受動的で Model を直接観察しない（Controller が橋渡しする）サーバーサイドの変形。

## いつ使うか

- Web フレームワーク（Rails / Laravel / Spring MVC / Django）の標準構造として
- フレームワークが MVC を採用していれば自然に従う
