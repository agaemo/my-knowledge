# CPUアーキテクチャ

CPUの命令セット（ISA: Instruction Set Architecture）の種類。同じプログラムでもコンパイル先のアーキテクチャが違うと実行できない。

## なぜ意識するか

ソフトウェアのバイナリはコンパイル時に特定のCPU命令セット向けに生成される。異なるアーキテクチャのCPUでは直接実行できないため、開発環境・本番環境・Dockerイメージのアーキテクチャが一致していないと動かない。

## 主なアーキテクチャ

### x86-64（AMD64）

```
別名: x86_64・amd64・Intel 64
```

- 64ビット版x86命令セット。AMDが設計し、Intelが採用した
- WindowsPC・Linuxサーバーのほぼすべてはこのアーキテクチャ
- 「AMD64」と「x86_64」は同じものを指す（Intelのサーバーでもamd64と表示される）
- クラウド（AWS・GCP・Azure）の汎用インスタンスはほとんどx86-64

### ARM / AArch64（ARM64）

```
別名: arm64・aarch64
```

- ARMホールディングスが設計するRISCベースの命令セット
- 消費電力が少なく、スマートフォン・タブレット・組み込みデバイスに広く使われてきた
- **Apple Silicon（M1・M2・M3・M4）** もARM64アーキテクチャ
- AWSのGravitonインスタンスもARM64（コスト効率が高い）

### x86（32ビット）

- x86-64の前身。32ビット。現在は主にレガシーシステムや組み込み向け

## IntelとAMDの関係

IntelとAMDはどちらも **x86-64互換** のCPUを製造しており、ソフトウェアから見た命令セットは同じ。「IntelかAMDか」はアーキテクチャの違いではなくメーカーの違いで、同じバイナリが動く。

```
x86-64 の実装:
  Intel → Core i9・Xeon など
  AMD   → Ryzen・EPYC など
  どちらでも同じバイナリが動く
```

## Apple Silicon（M チップ）

2020年にAppleがIntel x86-64 から自社設計のARM64チップに移行した。

```
2020年以前: MacBook/iMac → Intel x86-64
2020年以降: MacBook/iMac → Apple Silicon（ARM64）
```

### Rosetta 2

Apple SiliconのMacでx86-64向けバイナリを動かすための変換レイヤー。インストール時またはアプリ初回起動時にx86-64命令をARM64に変換する（JITではなくAOT変換）。

多くのアプリはRosetta 2で透過的に動くが、パフォーマンスはネイティブより低く、低レベルの処理（カーネル拡張・仮想化）では使えない制約もある。

## Macユーザーが遭遇しやすい場面

### Dockerイメージのアーキテクチャ不一致

```bash
# Apple Silicon(ARM64)のMacでx86-64イメージを使うと警告が出る
WARNING: The requested image's platform (linux/amd64) does not match
         the detected host platform (linux/arm64/v8)
```

マルチアーキテクチャイメージ（`linux/amd64` と `linux/arm64` の両方を含む）を使うか、ビルド時に `--platform linux/amd64` を指定することで回避できる。

### 本番環境との差異

本番（AWS EC2等）がx86-64でローカルがARM64の場合、ライブラリやバイナリの挙動が異なることがある。CI環境を本番と同じアーキテクチャに合わせるか、マルチアーキテクチャビルドを構成する。

### 仮想化の制約

ARM64のMacでx86-64のVMを動かすには命令セット変換が必要で、パフォーマンスが大きく落ちる。Parallels DesktopはWindows ARM（ARM64版Windows）をネイティブ速度で動かせるが、x86-64版Windowsは変換経由になる。

## アーキテクチャの確認方法

```bash
# macOS
uname -m         # arm64 または x86_64

# Linux
uname -m         # aarch64 または x86_64
arch

# Docker
docker info | grep Architecture
```

## 関連

- [仮想化](./virtualization) — VMはホストのCPUアーキテクチャに依存する
- [エンディアン](./endianness) — アーキテクチャごとにバイト順が異なる（x86はリトル、ネットワークはビッグ）
- [Docker](/dev-tools/infra/docker) — マルチアーキテクチャイメージのビルドと実行
