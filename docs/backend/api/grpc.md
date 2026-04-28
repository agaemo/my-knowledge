# gRPC

## 何か

Google が開発した高性能な RPC（Remote Procedure Call）フレームワーク。
Protocol Buffers（protobuf）でスキーマを定義し、HTTP/2 でバイナリ通信する。

## REST との比較

| | REST | gRPC |
|---|---|---|
| プロトコル | HTTP/1.1（テキスト） | HTTP/2（バイナリ） |
| データ形式 | JSON（人が読める） | Protocol Buffers（コンパクト） |
| スキーマ | 任意（OpenAPI等） | proto ファイルで必須 |
| 速度 | 比較的遅い | 高速（バイナリ・HTTP/2多重化） |
| ストリーミング | 限定的 | 双方向ストリーミング対応 |
| ブラウザ対応 | 完全対応 | 直接は不可（grpc-web が必要） |

## Protocol Buffers（.proto ファイル）

スキーマと型を定義するIDL（インターフェース定義言語）。各言語のコードが自動生成される。

```protobuf
// user.proto
syntax = "proto3";

package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc CreateUser (CreateUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);  // サーバーストリーミング
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  int64 created_at = 4;
}

message GetUserRequest {
  string id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message ListUsersRequest {
  int32 page_size = 1;
}
```

```bash
# コードを自動生成
protoc --go_out=. --go-grpc_out=. user.proto
# → user.pb.go と user_grpc.pb.go が生成される
```

## ストリーミングの種類

```protobuf
// Unary（1リクエスト → 1レスポンス）
rpc GetUser (GetUserRequest) returns (User);

// Server Streaming（1リクエスト → 複数レスポンス）
rpc ListOrders (ListOrdersRequest) returns (stream Order);

// Client Streaming（複数リクエスト → 1レスポンス）
rpc UploadData (stream DataChunk) returns (UploadResult);

// Bidirectional Streaming（複数リクエスト ↔ 複数レスポンス）
rpc Chat (stream Message) returns (stream Message);
```

## TypeScript でのサーバー実装例

```ts
import * as grpc from '@grpc/grpc-js';
import { UserServiceService } from './generated/user_grpc_pb';

const server = new grpc.Server();

server.addService(UserServiceService, {
  getUser: async (call, callback) => {
    const userId = call.request.getId();
    const user = await userRepo.findById(userId);

    if (!user) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'user not found',
      });
    }

    const response = new User();
    response.setId(user.id);
    response.setName(user.name);
    callback(null, response);
  },

  listUsers: async (call) => {
    const users = await userRepo.findAll();
    for (const user of users) {
      const response = new User();
      response.setId(user.id);
      call.write(response); // ストリームで1件ずつ送る
    }
    call.end();
  },
});
```

## エラーハンドリング

gRPC は HTTP のステータスコードではなく、独自のステータスコードを使う。

| コード | 意味 | REST相当 |
|---|---|---|
| OK | 成功 | 200 |
| NOT_FOUND | リソースが存在しない | 404 |
| ALREADY_EXISTS | 重複 | 409 |
| INVALID_ARGUMENT | リクエストが不正 | 400 |
| UNAUTHENTICATED | 認証失敗 | 401 |
| PERMISSION_DENIED | 権限なし | 403 |
| INTERNAL | サーバーエラー | 500 |

## いつ gRPC を使うか

### 向いている場面

- **マイクロサービス間の内部通信**: バイナリで高速・型安全
- **大量データのストリーミング**: ファイル転送・リアルタイムデータ
- **多言語環境**: proto ファイルから各言語のクライアントを自動生成

### 向いていない場面

- ブラウザから直接呼ぶ API（grpc-web が必要で複雑）
- 外部公開 API（JSONの方がクライアントを選ばない）
- シンプルな CRUD（REST で十分）
