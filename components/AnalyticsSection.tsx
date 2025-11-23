"use client";

import { Vote, VoteRecord } from "@/lib/types";
import { BarChart3 } from "lucide-react";

interface AnalyticsSectionProps {
  vote: Vote;
}

const AGE_GROUPS = ['10代', '20代', '30代', '40代', '50代', '60代以上'];
const GENDERS = ['男性', '女性', 'その他', '回答しない'];
const REGIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄', '海外'];
const OCCUPATIONS = ['会社員', '公務員', '自営業', '学生', '主婦/主夫', 'パート/アルバイト', '無職', 'その他'];

export default function AnalyticsSection({ vote }: AnalyticsSectionProps) {
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

  // 年代別の集計
  const ageAnalytics = vote.options.map((option) => {
    const optionRecords = vote.voteRecords?.filter(r => r.optionId === option.id) || [];
    const ageBreakdown: Record<string, number> = {};

    AGE_GROUPS.forEach(age => {
      ageBreakdown[age] = optionRecords.filter(r => r.age === age).length;
    });

    return {
      optionText: option.text,
      breakdown: ageBreakdown,
    };
  });

  // 性別の集計
  const genderAnalytics = vote.options.map((option) => {
    const optionRecords = vote.voteRecords?.filter(r => r.optionId === option.id) || [];
    const genderBreakdown: Record<string, number> = {};

    GENDERS.forEach(gender => {
      genderBreakdown[gender] = optionRecords.filter(r => r.gender === gender).length;
    });

    return {
      optionText: option.text,
      breakdown: genderBreakdown,
    };
  });

  // 地域別の集計
  const regionAnalytics = vote.options.map((option) => {
    const optionRecords = vote.voteRecords?.filter(r => r.optionId === option.id) || [];
    const regionBreakdown: Record<string, number> = {};

    REGIONS.forEach(region => {
      regionBreakdown[region] = optionRecords.filter(r => r.region === region).length;
    });

    return {
      optionText: option.text,
      breakdown: regionBreakdown,
    };
  });

  // 職業別の集計
  const occupationAnalytics = vote.options.map((option) => {
    const optionRecords = vote.voteRecords?.filter(r => r.optionId === option.id) || [];
    const occupationBreakdown: Record<string, number> = {};

    OCCUPATIONS.forEach(occupation => {
      occupationBreakdown[occupation] = optionRecords.filter(r => r.occupation === occupation).length;
    });

    return {
      optionText: option.text,
      breakdown: occupationBreakdown,
    };
  });

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

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-6 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-cyan-400" size={24} />
        <h2 className="text-xl font-bold text-white">属性別分析</h2>
        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full font-medium border border-cyan-500/30">
          作成者限定
        </span>
      </div>

      {/* 年代別分析 */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">年代別</h3>
        <div className="space-y-3">
          {AGE_GROUPS.map((age) => {
            const total = getTotalForGroup(age, 'age');
            if (total === 0) return null;

            return (
              <div key={age} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{age}</span>
                  <span className="text-sm text-gray-500">{total}人</span>
                </div>
                <div className="space-y-2">
                  {ageAnalytics.map((analytics, idx) => {
                    const count = analytics.breakdown[age];
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                    if (count === 0) return null;

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">{analytics.optionText}</span>
                            <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: percentage + '%' }}
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

      {/* 性別分析 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">性別</h3>
        <div className="space-y-3">
          {GENDERS.map((gender) => {
            const total = getTotalForGroup(gender, 'gender');
            if (total === 0) return null;

            return (
              <div key={gender} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">{gender}</span>
                  <span className="text-sm text-gray-500">{total}人</span>
                </div>
                <div className="space-y-2">
                  {genderAnalytics.map((analytics, idx) => {
                    const count = analytics.breakdown[gender];
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                    if (count === 0) return null;

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">{analytics.optionText}</span>
                            <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: percentage + '%' }}
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

      {/* 地域別分析 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">地域</h3>
        <div className="space-y-3">
          {REGIONS.map((region) => {
            const total = getTotalForGroup(region, 'region');
            if (total === 0) return null;

            return (
              <div key={region} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">{region}</span>
                  <span className="text-sm text-gray-500">{total}人</span>
                </div>
                <div className="space-y-2">
                  {regionAnalytics.map((analytics, idx) => {
                    const count = analytics.breakdown[region];
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                    if (count === 0) return null;

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">{analytics.optionText}</span>
                            <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all"
                              style={{ width: percentage + '%' }}
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

      {/* 職業別分析 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">職業</h3>
        <div className="space-y-3">
          {OCCUPATIONS.map((occupation) => {
            const total = getTotalForGroup(occupation, 'occupation');
            if (total === 0) return null;

            return (
              <div key={occupation} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">{occupation}</span>
                  <span className="text-sm text-gray-500">{total}人</span>
                </div>
                <div className="space-y-2">
                  {occupationAnalytics.map((analytics, idx) => {
                    const count = analytics.breakdown[occupation];
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                    if (count === 0) return null;

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">{analytics.optionText}</span>
                            <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                              style={{ width: percentage + '%' }}
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
    </div>
  );
}
