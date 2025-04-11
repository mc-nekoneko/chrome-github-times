# GitHub Times

GitHubの日付表示をローカル時間形式（yyyy/MM/dd hh:mm）に変換するChrome拡張機能です。

## 機能

- GitHub.com上のコミット履歴画面やPRの画面などで表示される日付を、ローカル時間形式（yyyy/MM/dd hh:mm）で表示します
- マウスホバー時に元の日時情報も確認できます
- タイムゾーンと日付表示形式をカスタマイズ可能

## インストール方法

### 開発版をインストール

1. このリポジトリをクローンするか、ZIPファイルとしてダウンロードして解凍します
2. 必要なパッケージをインストールし、ビルドします
```bash
npm install
npm run build
```
3. Chromeで `chrome://extensions` を開きます
4. 右上の「デベロッパーモード」をオンにします
5. 「パッケージ化されていない拡張機能を読み込む」をクリックし、このリポジトリの`dist`ディレクトリを選択します

## 開発方法

```bash
# 必要なパッケージをインストール
npm install

# 開発サーバーを起動
npm run dev

# ビルド
npm run build

# コードのフォーマット
npm run format

# リンター実行
npm run lint

# フォーマットとリンターの問題を自動修正
npm run check
```

## ライセンス

MITライセンス 
