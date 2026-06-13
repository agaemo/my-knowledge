# Unixパーミッションとアクセス制御

Linuxはマルチユーザーを前提に設計されており、すべてのファイル・プロセス・リソースに**誰が何をできるか**を定義するアクセス制御の仕組みを持つ。

## 基本パーミッション（rwx）

すべてのファイル・ディレクトリは **所有者（owner）・グループ（group）・その他（others）** の3者に対して **読み取り（r）・書き込み（w）・実行（x）** の権限を持つ。

```bash
$ ls -la /etc/passwd
-rw-r--r-- 1 root root 2847 Jan  1 00:00 /etc/passwd
│└┬┘└┬┘└┬┘
│ │  │  └── others: r--（読み取りのみ）
│ │  └───── group:  r--（読み取りのみ）
│ └──────── owner:  rw-（読み書き可）
└────────── ファイル種別（- = 通常ファイル、d = ディレクトリ）
```

数字で表すと `r=4, w=2, x=1` の和になる（644 = rw-r--r--）。

```bash
chmod 644 file.txt       # rw-r--r--
chmod 755 script.sh      # rwxr-xr-x（実行可能スクリプト）
chmod 700 secret/        # rwx------（所有者のみ全権）

chown user:group file    # 所有者とグループを変更
```

## 特殊なパーミッション

### setuid（SUID）

実行時に**ファイルの所有者の権限**で動くフラグ。一般ユーザーがrootの権限でプログラムを実行できる。

```bash
$ ls -la /usr/bin/passwd
-rwsr-xr-x 1 root root ... /usr/bin/passwd
     ↑ sビットがsetuid（rootとして実行される）
```

`/usr/bin/passwd`（パスワード変更コマンド）は一般ユーザーが実行するが、`/etc/shadow`（root専有ファイル）を書き換える必要があるためsetuidが設定されている。

### setgid（SGID）

実行時にファイルのグループ権限で動く（ファイル）、または配下のファイルを同一グループで作成する（ディレクトリ）。

### sticky bit

ディレクトリに設定すると、他人が作ったファイルを削除できなくなる。`/tmp` に設定されており、誰でも書き込めるが他のユーザーのファイルは消せない。

```bash
$ ls -la /tmp
drwxrwxrwt ... /tmp
         ↑ tビットがsticky
```

## ACL（Access Control List）

基本パーミッションは「所有者・グループ・その他」の3者しか設定できない。**ACL**はそれを拡張し、任意のユーザー・グループごとに細かい権限を設定できる。

```bash
# ACLの確認
getfacl file.txt

# 特定ユーザーに読み取り権限を付与
setfacl -m u:alice:r file.txt

# 特定グループに読み書き権限を付与
setfacl -m g:devteam:rw file.txt

# ACLの削除
setfacl -x u:alice file.txt
```

`ls -la` で `+` がついているファイルはACLが設定されている。

```
-rw-r--r--+ 1 bob bob ... file.txt
           ↑ ACLあり
```

### 基本パーミッションとACLの使い分け

| 状況 | 手段 |
|------|------|
| 所有者1人・グループ1つで十分 | 基本パーミッション（chmod） |
| 特定ユーザーだけ追加で許可したい | ACL（setfacl） |
| 複数のチームが異なる権限でアクセス | ACL |

## 権限昇格（Privilege Escalation）

一般ユーザーの権限からより高い権限（root等）を得ること。ペネトレーションテストの重要フェーズで、初期アクセス後に行われる。

### 主な手法

**setuidバイナリの悪用**  
setuidが設定されたバイナリに脆弱性があれば、root権限でコードを実行できる。

```bash
# setuidが設定されたバイナリを探す（侵入後の定番操作）
find / -perm -4000 -type f 2>/dev/null
```

**カーネル脆弱性の悪用**  
カーネル自体のバグを突く。Dirty COWはその代表例。

**sudo の設定ミス**  
`/etc/sudoers` の設定ミスで意図せず一般ユーザーにroot権限のコマンドが許可されている場合がある。

```bash
sudo -l      # 現在のユーザーが sudo できるコマンドを確認
```

**SUID + GTFOBins**  
[GTFOBins](https://gtfobins.github.io/) はsetuidが設定された標準ツール（find・vim・python等）でシェルを昇格する方法をまとめたデータベース。

### 防御側の視点

- setuidバイナリを最小限にする（不必要なSUIDを外す）
- sudoersを最小権限で設定し定期的に監査する
- カーネルを常に最新に保つ
- Linuxのケーパビリティ（Capabilities）を使い、rootへの昇格なしに特定の権限だけ付与する

## 関連

- [カーネル](/os/kernel) — カーネルがアクセス制御を実施する
- [Dirty COW脆弱性](/security/pentest/dirty-cow) — カーネル脆弱性による権限昇格の具体例
- [FHSと主要ディレクトリ](/security/pentest/living-off-the-land#fhsとツールの所在linux) — `/etc/shadow` など権限昇格の標的になるファイルの場所
