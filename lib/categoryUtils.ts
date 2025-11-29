const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '商社': ['商社', '総合商社', '専門商社', '三菱商事', '三井物産', '伊藤忠', '住友商事', '丸紅', '双日', '豊田通商', 'トレーディング', '貿易'],
  '金融': ['金融', '銀行', 'メガバンク', '地銀', '証券', '保険', '生命保険', '損害保険', '資産運用', '投資銀行', 'リース', 'クレジット', 'ファンド', 'アセット', '野村', '大和', 'SMBC', 'みずほ', '三菱UFJ', '三井住友'],
  'IT・通信': ['IT', 'Web', 'SaaS', 'ソフトウェア', 'システム', 'エンジニア', 'プログラマー', 'SE', '開発', 'アプリ', 'AI', 'DX', 'クラウド', '通信', 'キャリア', 'NTT', 'ソフトバンク', 'KDDI', '楽天', 'サイバー', 'DeNA', 'メルカリ'],
  'コンサル': ['コンサル', 'コンサルティング', '戦略コンサル', '総合コンサル', 'ITコンサル', '人事コンサル', 'アクセンチュア', 'デロイト', 'PwC', 'EY', 'KPMG', 'マッキンゼー', 'BCG', 'ベイン'],
  'メーカー': ['メーカー', '製造', '自動車', '電機', '機械', '化学', '素材', '食品', '製薬', 'トヨタ', 'ホンダ', '日産', 'ソニー', 'パナソニック', '日立', '三菱電機', '富士通', 'NEC', '旭化成', '味の素'],
  '広告・マスコミ': ['広告', 'マスコミ', 'テレビ', '放送', '出版', '新聞', '雑誌', '編集', '記者', 'アナウンサー', '電通', '博報堂', 'フジテレビ', 'TBS', '日テレ', 'テレ朝', 'NHK', '朝日新聞', '読売新聞'],
  'デベロッパー・不動産': ['デベロッパー', '不動産', '建設', 'ゼネコン', 'ハウスメーカー', '設計', '建築', '施工', '三菱地所', '三井不動産', '住友不動産', '野村不動産', '東急不動産', '大成建設', '鹿島建設', '清水建設', '大林組', '竹中工務店'],
  'サービス': ['サービス', '小売', '流通', '百貨店', 'スーパー', 'コンビニ', '飲食', 'レストラン', 'ホテル', '旅行', '航空', '鉄道', 'JR', 'ANA', 'JAL', 'JTB', '三越伊勢丹', '高島屋', 'セブン', 'ローソン', 'ファミマ'],
  '公務員・団体': ['公務員', '国家公務員', '地方公務員', '省庁', '自治体', '市役所', '区役所', '警察', '消防', '教員', '公立', 'NPO', '財団', '社団', '独法', '公社', '公団'],
  'インターン': ['インターン', 'インターンシップ', 'サマーインターン', 'ウィンターインターン', '短期インターン', '長期インターン', '1dayインターン', '説明会', '会社説明会', 'セミナー', 'OB訪問', 'OG訪問'],
  'ES・面接': ['ES', 'エントリーシート', '履歴書', '志望動機', '自己PR', 'ガクチカ', '面接', '一次面接', '二次面接', '最終面接', 'GD', 'グループディスカッション', 'グルディス', 'ケース面接', 'プレゼン', 'Webテスト', 'SPI', '玉手箱', 'TG-WEB'],
  '業界研究': ['業界', '業界研究', '企業研究', '選考', '就活', '就職', '新卒', '25卒', '26卒', '27卒', '採用', '内定', 'NNT', '持ち駒', 'お祈り', '選考ルート', '本選考', '早期選考', 'オファー', 'リクルーター'],
  'その他': ['その他', '雑談', '相談', '質問', 'アドバイス', '悩み', '不安'],
};

export function suggestCategory(title: string): string {
  const lowerTitle = title.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'その他';
}

// トレンドカテゴリーを取得（投票数が多い順）
export function getTrendingCategories(votes: any[]): string[] {
  const categoryCounts: Record<string, number> = {};

  // 各カテゴリーの投票数を集計
  votes.forEach(vote => {
    const category = vote.category || 'その他';
    const totalVotes = vote.options?.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0) || 0;
    categoryCounts[category] = (categoryCounts[category] || 0) + totalVotes;
  });

  // カテゴリーを投票数でソート
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  // すべてのカテゴリーを含めるため、投票がないカテゴリーも追加
  const allCategories = [
    '商社',
    '金融',
    'IT・通信',
    'コンサル',
    'メーカー',
    '広告・マスコミ',
    'デベロッパー・不動産',
    'サービス',
    '公務員・団体',
    'インターン',
    'ES・面接',
    '業界研究',
    'その他',
  ];

  // トレンドカテゴリーに含まれていないカテゴリーを後ろに追加
  const remainingCategories = allCategories.filter(cat => !sortedCategories.includes(cat));

  return [...sortedCategories, ...remainingCategories];
}
