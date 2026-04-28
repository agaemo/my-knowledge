# MCP（Model Context Protocol）

## 何か

LLMアプリケーションと外部ツール・データソースを接続するための標準プロトコル。
Anthropicが2024年11月に公開したオープン標準。

```
LLMアプリ（Claude, Cursor など）
    ↕ MCP
MCPサーバー（DB, ファイルシステム, API, ブラウザ など）
```

## なぜ重要か

MCP以前は、ツール連携を各アプリが独自に実装していた。
MCPが標準化することで：

- 一度MCPサーバーを作れば、対応する全クライアントで使える
- クライアント側はMCPを実装するだけで全サーバーに接続できる
- エコシステムが共有される（コミュニティ製サーバーを流用できる）

USB-Cのようなもの：デバイス（クライアント）とケーブル（サーバー）の規格を統一。

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│  MCP Host（Claude Desktop / IDE など）   │
│  ┌──────────────────────────────────┐   │
│  │  LLM Application                 │   │
│  │  ┌────────────┐  ┌────────────┐ │   │
│  │  │ MCP Client │  │ MCP Client │ │   │
│  └──┴────────────┴──┴────────────┴─┘   │
└────────────┬───────────────┬────────────┘
             ↕ stdio/SSE     ↕ stdio/SSE
    ┌────────────────┐  ┌────────────────┐
    │  MCPサーバーA  │  │  MCPサーバーB  │
    │  （ファイルDB）│  │  （GitHub API）│
    └────────────────┘  └────────────────┘
```

## MCPサーバーが提供できるもの

### Tools（ツール）

LLMが呼び出せる関数。ファイル操作・API実行・DB検索など。

```ts
server.tool('search_database', {
  query: z.string().describe('検索クエリ'),
  limit: z.number().optional().default(10),
}, async ({ query, limit }) => {
  const results = await db.search(query, limit);
  return { content: [{ type: 'text', text: JSON.stringify(results) }] };
});
```

### Resources（リソース）

LLMがコンテキストとして読み込めるデータ。ファイル内容・DBレコードなど。

```ts
server.resource('config://app', async () => ({
  contents: [{
    uri: 'config://app',
    mimeType: 'application/json',
    text: JSON.stringify(appConfig),
  }],
}));
```

### Prompts（プロンプトテンプレート）

再利用可能なプロンプトをサーバーが提供する。

## MCPサーバーの実装例（TypeScript）

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'my-server', version: '1.0.0' });

server.tool('get_weather', {
  city: z.string().describe('都市名'),
}, async ({ city }) => {
  const weather = await fetchWeather(city);
  return {
    content: [{ type: 'text', text: `${city}の天気: ${weather.description}` }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## トランスポート

### stdio（標準入出力）

ローカルプロセス間通信。最もシンプル。Claude DesktopやCLIツールで使われる。

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"]
    }
  }
}
```

### SSE（Server-Sent Events）

HTTP経由のリモート通信。Webサービスとして提供する場合に使う。

## セキュリティ考慮点

- MCPサーバーはLLMの代わりにツールを実行するため、Prompt Injectionの経路になりうる
- サーバーに渡す権限は最小限にする
- 外部から取得したデータをそのままツール引数に使わない

## 主要なコミュニティサーバー

- `@modelcontextprotocol/server-filesystem` - ファイル操作
- `@modelcontextprotocol/server-github` - GitHub API
- `@modelcontextprotocol/server-postgres` - PostgreSQL
- `@modelcontextprotocol/server-puppeteer` - ブラウザ操作
- `@modelcontextprotocol/server-slack` - Slack

## Claude Codeとの関係

Claude Codeは MCP クライアントとして動作する。
`.claude/settings.json` でMCPサーバーを設定すると、Claude Codeがそのツールを使えるようになる。
