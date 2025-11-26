"use client";

import { Vote, VoteRecord, CustomQuestion } from "@/lib/types";
import { BarChart3 } from "lucide-react";

interface AnalyticsSectionProps {
  vote: Vote;
}

const AGE_GROUPS = ['10代', '20代', '30代', '40代', '50代', '60代以上'];
const GENDERS = ['男性', '女性', 'その他', '回答しない'];
const REGIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄', '海外'];
const OCCUPATIONS = ['会社員', '公務員', '自営業', '学生', '主婦/主夫', 'パート/アルバイト', '無職', 'その他'];

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

  // 従来の固定属性の分析（後方互換性のため）
  const getTotalForGroup = (group: string, type: 'age' | 'gender' | 'region' | 'occupation') => {
    const records = vote.voteRecords || [];
    if (type === 'age') {
      return records.filter(r => r.age === group).length;
    } else if (type === 'gender') {
      return records.filter(r => r.gender === group).length;
    } else if (type === 'region') {
      return records.filter(r => r.region === group).length;
    } else {
      return records.filter(r => r.occupation === group).length;
    }
  };

  const renderAttributeSection = (
    title: string,
    attributes: string[],
    type: 'age' | 'gender' | 'region' | 'occupation',
    color: string
  ) => {
    const analytics = vote.options.map((option) => {
      const optionRecords = vote.voteRecords?.filter(r => r.optionId === option.id) || [];
      const breakdown: Record<string, number> = {};

      attributes.forEach(attr => {
        breakdown[attr] = optionRecords.filter(r => {
          if (type === 'age') return r.age === attr;
          if (type === 'gender') return r.gender === attr;
          if (type === 'region') return r.region === attr;
          if (type === 'occupation') return r.occupation === attr;
          return false;
        }).length;
      });

      return {
        optionText: option.text,
        breakdown,
      };
    });

    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
        <div className="space-y-3">
          {attributes.map((attr) => {
            const total = getTotalForGroup(attr, type);
            if (total === 0) return null;

            return (
              <div key={attr} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{attr}</span>
                  <span className="text-sm text-gray-500">{total}人</span>
                </div>
                <div className="space-y-2">
                  {analytics.map((a, idx) => {
                    const count = a.breakdown[attr];
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                    if (count === 0) return null;

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-300">{a.optionText}</span>
                            <span className="text-sm font-medium text-white">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
