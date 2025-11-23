"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createUser, getAvatarOptions } from "@/lib/user";

interface UserSetupModalProps {
  onComplete: () => void;
}

const AGE_OPTIONS = ['10代', '20代', '30代', '40代', '50代', '60代以上'];
const GENDER_OPTIONS = ['男性', '女性', 'その他', '回答しない'];
const REGION_OPTIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄', '海外'];
const OCCUPATION_OPTIONS = ['会社員', '公務員', '自営業', '学生', '主婦/主夫', 'パート/アルバイト', '無職', 'その他'];

export default function UserSetupModal({ onComplete }: UserSetupModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [region, setRegion] = useState("");
  const [occupation, setOccupation] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("😊");
  const [step, setStep] = useState(1);

  const avatarOptions = getAvatarOptions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (name && username) {
        setStep(2);
      }
    } else if (step === 2) {
      if (age && gender) {
        setStep(3);
      }
    } else if (step === 3) {
      if (region && occupation) {
        setStep(4);
      }
    } else {
      createUser(name, username, selectedAvatar, age, gender, region, occupation);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          {step === 1 ? "プロフィールを設定" : step === 2 ? "年代・性別" : step === 3 ? "地域・職業" : "アバターを選択"}
        </h2>
        <p className="text-gray-400 mb-6">
          {step === 1
            ? "投票やコメントを始めるには、プロフィールが必要です"
            : step === 2
            ? "年代と性別を選択してください"
            : step === 3
            ? "お住まいの地域と職業を選択してください"
            : "あなたのアバターを選んでください"
          }
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  表示名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={20}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500"
                  placeholder="例: 田中太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  required
                  maxLength={15}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500"
                  placeholder="例: tanaka_taro"
                />
                <p className="text-xs text-gray-500 mt-1">
                  英数字とアンダースコアのみ使用可能
                </p>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  年代
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AGE_OPTIONS.map((ageOption) => (
                    <button
                      key={ageOption}
                      type="button"
                      onClick={() => setAge(ageOption)}
                      className={'px-4 py-3 rounded-xl font-medium transition ' + (age === ageOption ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700')}
                    >
                      {ageOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  性別
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map((genderOption) => (
                    <button
                      key={genderOption}
                      type="button"
                      onClick={() => setGender(genderOption)}
                      className={'px-4 py-3 rounded-xl font-medium transition ' + (gender === genderOption ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700')}
                    >
                      {genderOption}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : step === 3 ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  お住まいの地域
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {REGION_OPTIONS.map((regionOption) => (
                    <button
                      key={regionOption}
                      type="button"
                      onClick={() => setRegion(regionOption)}
                      className={'px-3 py-2 rounded-lg font-medium transition text-sm ' + (region === regionOption ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700')}
                    >
                      {regionOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  職業
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OCCUPATION_OPTIONS.map((occupationOption) => (
                    <button
                      key={occupationOption}
                      type="button"
                      onClick={() => setOccupation(occupationOption)}
                      className={'px-3 py-2 rounded-lg font-medium transition text-sm ' + (occupation === occupationOption ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700')}
                    >
                      {occupationOption}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="grid grid-cols-6 gap-3 mb-4">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-3xl p-3 rounded-xl transition ${
                      selectedAvatar === avatar
                        ? "bg-cyan-500/20 ring-2 ring-cyan-500"
                        : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 border border-gray-700 rounded-xl hover:bg-gray-800 transition font-semibold text-gray-300"
              >
                戻る
              </button>
            )}
            <button
              type="submit"
              disabled={(step === 1 && (!name || !username)) || (step === 2 && (!age || !gender)) || (step === 3 && (!region || !occupation))}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {step < 4 ? "次へ" : "完了"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
