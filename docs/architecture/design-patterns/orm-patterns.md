# Active Record vs Data Mapper

DB のテーブルとオブジェクトをどう対応させるかの2つのアプローチ。Martin Fowler の *Patterns of Enterprise Application Architecture* が出典。ORM やフレームワークの設計思想に直結する。

## Active Record（アクティブレコード）

**オブジェクト自身がデータアクセスの責任を持つ。**

テーブルの1行がそのまま1オブジェクトになり、オブジェクトが `save()`・`find()` などのメソッドを持つ。

```ruby
# Rails の ActiveRecord の例
class User < ApplicationRecord
    validates :email, presence: true
end

# 使い方
user = User.new(name: 'Alice', email: 'alice@example.com')
user.save   # DB に保存

user = User.find(1)   # DB から取得
user.update(name: 'Bob')  # DB を更新
user.destroy   # DB から削除
```

```python
# Django ORM の例
class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()

user = User.objects.get(id=1)
user.name = 'Bob'
user.save()
```

**代表的な実装:** Rails の ActiveRecord・Laravel の Eloquent・Django ORM

**メリット:**
- シンプルで直感的。CRUD が短いコードで書ける
- 小規模アプリや管理画面に向いている
- フレームワークとの統合が密で、マイグレーション・バリデーションが一体

**デメリット:**
- モデルが「DB の操作」と「ビジネスルール」の両方を持つ（SRP 違反になりやすい）
- DB なしでビジネスロジックの単体テストが難しい
- ドメインモデルが DB のスキーマに引きずられる

## Data Mapper（データマッパー）

**オブジェクトと DB のマッピングを別の層（Mapper）が担う。**

ドメインオブジェクトは DB を知らない「純粋なオブジェクト」として存在し、Mapper が変換を担当する。

```typescript
// ドメインオブジェクト — DB を知らない
class User {
    constructor(
        public readonly id: string,
        public name: string,
        public email: string,
    ) {}

    changeName(newName: string) {
        if (!newName) throw new Error('Name cannot be empty');
        this.name = newName;
    }
}

// Mapper（TypeORM・Prisma などが担う）
@Entity()
class UserEntity {
    @PrimaryColumn() id: string;
    @Column() name: string;
    @Column() email: string;
}

// Repository が変換を仲介する
class UserRepository {
    async findById(id: string): Promise<User> {
        const entity = await orm.findOne(UserEntity, { id });
        return new User(entity.id, entity.name, entity.email);
    }
}
```

**代表的な実装:** TypeORM・Hibernate・SQLAlchemy（Identity Map 方式）・Doctrine

**メリット:**
- ドメインオブジェクトが DB から独立 → ビジネスロジックの単体テストが容易
- DB スキーマとドメインモデルを独立して設計できる
- DDD・ヘキサゴナルアーキテクチャとの相性が良い

**デメリット:**
- コードが増える（Mapper・Repository の実装が必要）
- 単純な CRUD には過剰になりやすい

## 使い分け

| | Active Record | Data Mapper |
|---|---|---|
| 向いている場面 | 小〜中規模・管理画面・CRUD 中心 | 複雑なビジネスロジック・DDD・テスト重視 |
| コード量 | 少ない | 多い |
| テスタビリティ | やや難しい | 高い |
| DB との結合 | 強い | 疎 |
| 代表フレームワーク | Rails・Laravel・Django | TypeORM・Hibernate・Doctrine |

## Prisma の位置づけ

Prisma は厳密には Active Record でも Data Mapper でもなく、**スキーマファーストの独自アプローチ**。生成されたクライアントが Mapper に近い役割を果たすが、ドメインオブジェクトは自分で定義する必要がある。

```typescript
// Prisma はクエリビルダーとして機能し、マッピングはアプリ側が担う
const userData = await prisma.user.findUnique({ where: { id } });
const user = new User(userData.id, userData.name, userData.email); // 手動でドメイン変換
```
