const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'ライフスタイル': ['朝食', '昼食', '夕食', '食事', '料理', 'ファッション', '服', '趣味', '休日', '生活', '家事', '掃除', '洗濯', 'インテリア', '部屋', 'ペット', '旅行', '温泉', 'ホテル', '健康', '運動', 'ダイエット', '睡眠'],
  'テクノロジー': ['スマホ', 'パソコン', 'PC', 'アプリ', 'ゲーム', 'AI', 'プログラミング', 'ソフトウェア', 'ハードウェア', 'iPhone', 'Android', 'Mac', 'Windows', 'IT', 'ネット', 'インターネット', 'SNS', 'Twitter', 'Instagram', 'YouTube', 'サイト'],
  'エンターテイメント': ['映画', 'ドラマ', 'アニメ', '漫画', '音楽', 'ライブ', 'コンサート', 'アーティスト', 'バンド', 'アイドル', '芸能人', 'タレント', '俳優', '女優', '配信', 'Netflix', 'Amazon'],
  'スポーツ': ['サッカー', '野球', 'バスケ', 'テニス', 'ゴルフ', 'ラグビー', 'バレー', '水泳', 'マラソン', '柔道', '格闘技', 'オリンピック', 'ワールドカップ', '試合', '選手', 'チーム', '練習'],
  '政治': ['選挙', '政治', '政党', '国会', '首相', '大統領', '政策', '法律', '憲法', '税金', '外交', '国際', '経済', '株', '景気', '年金', '社会保障'],
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
