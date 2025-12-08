"use client";

import { useState, useEffect } from "react";
import { Vote } from "@/lib/types";
import { BarChart3 } from "lucide-react";

interface AnalyticsSectionProps {
  vote: Vote;
}

type AnalyticsTab = "custom" | "attributes";

export default function AnalyticsSection({ vote }: AnalyticsSectionProps) {
  // カスタム質問がない場合は属性タブを初期表示
  const hasCustomQuestions = vote.customQuestions && vote.customQuestions.length > 0;
  const [activeTab, setActiveTab] = useState<AnalyticsTab>(hasCustomQuestions ? "custom" : "attributes");
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

  // ユーザー属性ベースの分析を生成
  const renderUserAttributes = () => {
    const attributes = [
      { key: 'age', label: '卒業年度' },
      { key: 'gender', label: '性別' },
      { key: 'region', label: '地域' },
      { key: 'occupation', label: '状況' },
    ];

    const colors = [
      'from-cyan-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
    ];

    return attributes.map((attribute, attrIdx) => {
      // この属性を持つユーザーを集計
      const attributeValues = new Map<string, number>();
      vote.voteRecords?.forEach((record) => {
        const value = (record as any)[attribute.key];
        if (value) {
          attributeValues.set(value, (attributeValues.get(value) || 0) + 1);
        }
      });

      // 属性値がない場合はスキップ
      if (attributeValues.size === 0) return null;

      const color = colors[attrIdx % colors.length];

      return (
        <div key={attribute.key}>
          <h3 className="text-lg font-semibold text-white mb-3">{attribute.label}</h3>
          <div className="space-y-3">
            {Array.from(attributeValues.entries()).map(([value, total]) => {
              // 各投票選択肢ごとの内訳
              const analytics = vote.options.map((voteOption) => {
                const count = vote.voteRecords?.filter(
                  (r) => r.optionId === voteOption.id && (r as any)[attribute.key] === value
                ).length || 0;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                return {
                  optionText: voteOption.text,
                  count,
                  percentage,
                };
              }).filter((a) => a.count > 0);

              return (
                <div key={value} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{value}</span>
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

  // カスタム質問の分析を生成
  const renderCustomQuestions = () => {
    if (!vote.customQuestions || vote.customQuestions.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">この投票にはカスタム質問がありません</p>
        </div>
      );
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

      {/* タブ */}
      <div className="flex gap-2 border-b border-gray-700">
        {hasCustomQuestions && (
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "custom"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            質問ベース
          </button>
        )}
        <button
          onClick={() => setActiveTab("attributes")}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === "attributes"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          属性ベース
        </button>
      </div>

      {/* コンテンツ */}
      <div className="space-y-6">
        {activeTab === "custom" && renderCustomQuestions()}
        {activeTab === "attributes" && renderUserAttributes()}
      </div>
    </div>
  );
}
