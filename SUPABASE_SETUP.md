# Supabaseセットアップガイド

このアプリケーションをSupabaseに接続するための手順です。

## 1. Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com)にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインイン
4. 「New Project」をクリック
5. プロジェクト名を入力（例: vote-app）
6. データベースパスワードを設定
7. リージョンを選択（Tokyo推奨）
8. 「Create new project」をクリック

## 2. 環境変数を設定

1. Supabaseのダッシュボードで「Settings」→「API」を開く
2. 以下の値をコピー：
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`用
   - **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`用

3. `.env.local`ファイルを作成（`.env.local.example`をコピー）:
```bash
cp .env.local.example .env.local
```

4. `.env.local`を編集して、コピーした値を貼り付け:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. データベーステーブルを作成

Supabaseのダッシュボードで「SQL Editor」を開き、以下のSQLを実行:

```sql
-- 既存のテーブルを削除（必要な場合のみ）
-- DROP TABLE IF EXISTS comments;
-- DROP TABLE IF EXISTS votes;

-- votesテーブル
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  options JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT,
  author_id TEXT,
  author_name TEXT,
  vote_records JSONB DEFAULT '[]'::jsonb,
  show_analytics BOOLEAN DEFAULT true
);

-- commentsテーブル
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  vote_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id TEXT,
  likes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  vote_changed BOOLEAN DEFAULT FALSE,
  voted_option_text TEXT
);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_vote_id ON comments(vote_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
```

## 4. 既存のデータベースを更新（必要な場合）

既にテーブルを作成済みの場合は、以下のSQLを実行して新しいカラムを追加してください：

```sql
-- commentsテーブルにvoted_option_textカラムを追加
ALTER TABLE comments ADD COLUMN IF NOT EXISTS voted_option_text TEXT;

-- votesテーブルにshow_analyticsカラムを追加
ALTER TABLE votes ADD COLUMN IF NOT EXISTS show_analytics BOOLEAN DEFAULT true;
```

## 5. 開発サーバーを再起動

```bash
npm run dev
```

これで完了です！データベースに接続されました🎉
