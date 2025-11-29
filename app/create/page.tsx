"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Send, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/user";
import { suggestCategory } from "@/lib/categoryUtils";
import { CustomQuestion } from "@/lib/types";

const CATEGORIES = [
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

const QUESTION_TEMPLATES = [
  {
    id: 'graduation_year',
    question: '卒業年度or内定者or社会人を教えてください',
    options: ['25卒', '26卒', '27卒', '28卒', '内定者', '社会人1-3年目', '社会人4年目以上'],
  },
  {
    id: 'gender',
    question: '性別を教えてください',
    options: ['男性', '女性', 'その他', '回答しない'],
  },
  {
    id: 'region',
    question: 'お住まいの地域を教えてください',
    options: ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄', '海外'],
  },
  {
    id: 'industry',
    question: '業界を教えてください',
    options: ['商社', '金融', 'IT・通信', 'コンサル', 'メーカー', '広告・マスコミ', 'デベロッパー・不動産', 'サービス', '公務員・団体', 'その他'],
  },
  {
    id: 'education',
    question: '学歴を教えてください',
    options: ['高校卒', '専門学校卒', '短大卒', '大学卒', '大学院卒（修士）', '大学院卒（博士）', '在学中'],
  },
  {
    id: 'overseas_experience',
    question: '海外経験の有無',
    options: ['留学経験あり', '海外インターンあり', '短期留学・語学留学あり', '旅行のみ', '海外経験なし'],
  },
];

interface CustomQuestionBuilder extends CustomQuestion {
  options: string[];
}

export default function CreateVotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [category, setCategory] = useState("その他");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestionBuilder[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (title.trim()) {
      const suggested = suggestCategory(title);
      setCategory(suggested);
    }
  }, [title]);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // カスタム質問の管理
  const addCustomQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      {
        id: `q-${Date.now()}`,
        question: "",
        options: ["", ""],
      },
    ]);
  };

  const addCustomQuestionFromTemplate = (templateId: string) => {
    const template = QUESTION_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setCustomQuestions([
        ...customQuestions,
        {
          id: `q-${Date.now()}`,
          question: template.question,
          options: [...template.options],
        },
      ]);
    }
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const updateCustomQuestion = (index: number, question: string) => {
    const newQuestions = [...customQuestions];
    newQuestions[index].question = question;
    setCustomQuestions(newQuestions);
  };

  const addCustomQuestionOption = (questionIndex: number) => {
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].options.push("");
    setCustomQuestions(newQuestions);
  };

  const removeCustomQuestionOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...customQuestions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
        (_, i) => i !== optionIndex
      );
      setCustomQuestions(newQuestions);
    }
  };

  const updateCustomQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setCustomQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validOptions = options.filter((opt) => opt.trim() !== "");

      if (validOptions.length < 2) {
        alert("少なくとも2つの選択肢を入力してください");
        setIsSubmitting(false);
        return;
      }

      // カスタム質問のバリデーション
      const validCustomQuestions = customQuestions
        .filter((q) => q.question.trim() !== "")
        .map((q) => ({
          ...q,
          options: q.options.filter((opt) => opt.trim() !== ""),
        }))
        .filter((q) => q.options.length >= 2);

      // 不完全な質問がある場合は警告
      const incompleteQuestions = customQuestions.filter(
        (q) => q.question.trim() !== "" && q.options.filter((opt) => opt.trim() !== "").length < 2
      );
      if (incompleteQuestions.length > 0) {
        alert("各質問には少なくとも2つの選択肢を入力してください");
        setIsSubmitting(false);
        return;
      }

      const currentUser = getCurrentUser();

      console.log('Creating vote with custom questions:', validCustomQuestions);

      const requestBody = {
        title,
        options: validOptions,
        category,
        authorId: currentUser?.id,
        authorName: currentUser?.name,
        showAnalytics,
        isPrivate,
        customQuestions: validCustomQuestions.length > 0 ? validCustomQuestions : undefined,
      };

      console.log('Request body:', requestBody);

      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("投票の作成に失敗しました");
      }

      const vote = await response.json();
      router.push(`/votes/${vote.id}`);
    } catch (error) {
      alert("エラーが発生しました");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            vote就活
          </h1>
          <div className="flex items-center gap-3">
            {getCurrentUser() && (
              <button
                onClick={() => router.push('/profile')}
                className="text-3xl hover:scale-110 transition-transform"
                title="プロフィール"
              >
                {getCurrentUser()?.avatar}
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition font-semibold"
            >
              <ArrowLeft size={20} />
              ホームに戻る
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            投票を作成
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                投票のタイトル
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500"
                placeholder="例: 第一志望は大手企業？ベンチャー企業？"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                カテゴリー
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-700 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Lock size={16} />
                  プライベートモード
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                オンにすると、URLを知っている人だけが投票にアクセスできます
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnalytics}
                  onChange={(e) => setShowAnalytics(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-700 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-sm font-semibold text-gray-300">
                  属性別分析を表示する
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                オフにすると、投票者の属性情報が他のユーザーに表示されません
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                選択肢（2つ以上）
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500"
                      placeholder={`選択肢 ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition flex items-center gap-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-3 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition flex items-center gap-2 font-medium"
              >
                <Plus size={18} />
                選択肢を追加
              </button>
            </div>

            {/* カスタム質問セクション */}
            <div className="border-t border-gray-800 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  カスタム属性質問（オプション）
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  投票者に質問したい属性を自由に設定できます。テンプレートから選ぶか、独自の質問を追加できます
                </p>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-400 mb-3">📋 テンプレートから追加</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUESTION_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => addCustomQuestionFromTemplate(template.id)}
                        className="text-xs px-3 py-2 bg-gray-900 hover:bg-gray-700 border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-white rounded-lg transition-all text-left"
                      >
                        {template.question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {customQuestions.length > 0 && (
                <div className="space-y-4 mb-4">
                  {customQuestions.map((question, qIndex) => (
                    <div
                      key={question.id}
                      className="bg-gray-800 border border-gray-700 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-2 mb-3">
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateCustomQuestion(qIndex, e.target.value)}
                          placeholder={`質問 ${qIndex + 1}（例：年代を教えてください）`}
                          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomQuestion(qIndex)}
                          className="px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-medium">選択肢</label>
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) =>
                                updateCustomQuestionOption(qIndex, oIndex, e.target.value)
                              }
                              placeholder={`選択肢 ${oIndex + 1}（例：10代、20代、30代...）`}
                              className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500 text-sm"
                            />
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeCustomQuestionOption(qIndex, oIndex)}
                                className="px-3 py-2 text-gray-500 hover:text-red-500 transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addCustomQuestionOption(qIndex)}
                          className="text-xs px-3 py-1.5 text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                        >
                          <Plus size={14} />
                          選択肢を追加
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addCustomQuestion}
                className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition flex items-center gap-2 font-medium"
              >
                <Plus size={18} />
                独自の質問を追加
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {isSubmitting ? (
                "作成中..."
              ) : (
                <>
                  <Send size={20} />
                  投票を作成
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
