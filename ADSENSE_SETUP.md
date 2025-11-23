# Google AdSense 設定ガイド

このアプリケーションはGoogle AdSenseによる広告収益化の準備が整っています。

## セットアップ手順

### 1. Google AdSenseアカウントの作成

1. [Google AdSense](https://www.google.com/adsense/)にアクセス
2. Googleアカウントでログイン
3. サイトURLを登録: `https://voteapp-4pn3.vercel.app`
4. 審査申請を提出（通常2-4週間）

### 2. 広告コードの取得

審査通過後:
1. AdSenseダッシュボードで「広告」→「広告ユニット」
2. 「ディスプレイ広告」を選択
3. 広告ユニットを作成
4. **パブリッシャーID** (`ca-pub-XXXXXXXXXX`) をコピー
5. **広告スロットID** をコピー

### 3. コードへの設定

#### `app/layout.tsx`
```typescript
// 34行目のXXXXXXXXXXを実際のパブリッシャーIDに置き換え
src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
```

#### `components/AdBanner.tsx`
```typescript
// 26行目のXXXXXXXXXXを実際のパブリッシャーIDに置き換え
data-ad-client="ca-pub-XXXXXXXXXX"
```

#### `app/page.tsx`
```typescript
// 301行目の"1234567890"を実際の広告スロットIDに置き換え
dataAdSlot="1234567890"
```

### 4. 広告の表示場所

現在の設定:
- **投票一覧ページ**: 3つの投票ごとに1つの広告を表示

### 5. 収益目安

- 1,000PV/日: 月¥3,000-10,000
- 5,000PV/日: 月¥15,000-50,000
- 10,000PV/日: 月¥30,000-100,000

※ジャンル、クリック率、広告単価により変動

### 6. 注意事項

- 自分で広告をクリックしない
- 不正クリックを誘導しない
- AdSenseポリシーを遵守

### 7. デプロイ

設定完了後、GitHubにプッシュしてVercelに自動デプロイ:
```bash
git add .
git commit -m "Configure Google AdSense"
git push origin main
```

## サポート

AdSenseに関する質問は[AdSenseヘルプセンター](https://support.google.com/adsense)をご確認ください。
