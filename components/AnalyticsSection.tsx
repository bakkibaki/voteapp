"use client";

import { Vote } from "@/lib/types";
import { BarChart3 } from "lucide-react";

interface AnalyticsSectionProps {
  vote: Vote;
}

export default function AnalyticsSection({ vote }: AnalyticsSectionProps) {
  // デバッグ情報
  console.log('AnalyticsSection - vote data:', {
    hasCustomQuestions: !!vote.customQuestions,
    customQuestionsLength: vote.customQuestions?.length || 0,
    voteRecordsLength: vote.voteRecords?.length || 0,
    firstRecordCustomAttributes: vote.voteRecords?.[0]?.customAttributes,
  });

  if (!vote.voteRecords || vote.voteRecords.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mt-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-cyan-400" size={24} />
          <h2 className="text-xl font-bold text-white">属性別分析</h2>
        </div>
        <p className="text-gray-400">まだ投票データがありません</p>
      </div>
    );
  }

  // カスタム質問の分析を生成
  const renderCustomQuestions = () => {
    if (!vote.customQuestions || vote.customQuestions.length === 0) {
      return null;
    }

    return vote.customQuestions.map((question, qIdx) => {
          const colors = [
            'from-blue-500 to-purple-500',
            'from-pink-500 to-rose-500',
            'from-green-500 to-teal-500',
            'from-orange-500 to-red-500',
            'from-cyan-500 to-blue-500',
            'from-amber-500 to-orange-500',
          ];
          const color = colors[qIdx % colors.length];

          return (
            <div key={question.id}>
              <h3 className="text-lg font-semibold text-white mb-3">{question.question}</h3>
              <div className="space-y-3">
                {question.options.map((option) => {
                  // この属性を選択した人の数
                  const total = vote.voteRecords?.filter(
                    (r) => r.customAttributes?.[question.id] === option
                  ).length || 0;

                  if (total === 0) return null;

                  // 各投票選択肢ごとの内訳
                  const analytics = vote.options.map((voteOption) => {
                    const count = vote.voteRecords?.filter(
                      (r) => r.optionId === voteOption.id && r.customAttributes?.[question.id] === option
                    ).length || 0;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                    return {
                      optionText: voteOption.text,
                      count,
                      percentage,
                    };
                  }).filter((a) => a.count > 0);

                  return (
                    <div key={option} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">{option}</span>
                        <span className="text-sm text-gray-500">{total}人</span>
                      </div>
                      <div className="space-y-2">
                        {analytics.map((a, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-300">{a.optionText}</span>
                                <span className="text-sm font-medium text-white">{a.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                  className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all`}
                                  style={{ width: `${a.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        });
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-cyan-400" size={24} />
        <h2 className="text-xl font-bold text-white">属性別分析</h2>
      </div>

      {/* カスタム質問の分析 */}
      {renderCustomQuestions()}
    </div>
  );
}
