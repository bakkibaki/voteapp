"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createUser, getAvatarOptions } from "@/lib/user";

interface UserSetupModalProps {
  onComplete: () => void;
}

const AGE_OPTIONS = ['10代', '20代', '30代', '40代', '50代', '60代以上'];
const GENDER_OPTIONS = ['男性', '女性', 'その他', '回答しない'];

export default function UserSetupModal({ onComplete }: UserSetupModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
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
    } else {
      createUser(name, username, selectedAvatar, age, gender);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {step === 1 ? "プロフィールを設定" : step === 2 ? "属性を選択" : "アバターを選択"}
        </h2>
        <p className="text-gray-600 mb-6">
          {step === 1
            ? "投票やコメントを始めるには、プロフィールが必要です"
            : step === 2
            ? "年代と性別を選択してください（属性別分析に使用されます）"
            : "あなたのアバターを選んでください"
          }
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  表示名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={20}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="例: 田中太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  required
                  maxLength={15}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  年代
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AGE_OPTIONS.map((ageOption) => (
                    <button
                      key={ageOption}
                      type="button"
                      onClick={() => setAge(ageOption)}
                      className={'px-4 py-3 rounded-xl font-medium transition ' + (age === ageOption ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                    >
                      {ageOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  性別
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GENDER_OPTIONS.map((genderOption) => (
                    <button
                      key={genderOption}
                      type="button"
                      onClick={() => setGender(genderOption)}
                      className={'px-4 py-3 rounded-xl font-medium transition ' + (gender === genderOption ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                    >
                      {genderOption}
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
                        ? "bg-blue-100 ring-2 ring-blue-500"
                        : "bg-gray-100 hover:bg-gray-200"
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
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition font-semibold"
              >
                戻る
              </button>
            )}
            <button
              type="submit"
              disabled={(step === 1 && (!name || !username)) || (step === 2 && (!age || !gender))}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {step < 3 ? "次へ" : "完了"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
