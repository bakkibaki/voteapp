"use client";

import { useState } from "react";
import { createUser, getAvatarOptions } from "@/lib/user";

interface QuickNameSetupModalProps {
  onComplete: () => void;
}

export default function QuickNameSetupModal({ onComplete }: QuickNameSetupModalProps) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("😊");

  const avatarOptions = getAvatarOptions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim()) {
      // ユーザー名は名前から自動生成（簡素化）
      const username = `user_${Date.now()}`;
      createUser(name, username, selectedAvatar);
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          コメントするには名前を設定
        </h2>
        <p className="text-gray-400 mb-6">
          名前とアバターを設定して、コメントを投稿しましょう
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              コメントに表示される名前です
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              アバター
            </label>
            <div className="grid grid-cols-6 gap-3">
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

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            設定して投稿する
          </button>

          <p className="text-xs text-center text-gray-500">
            後から<a href="/profile" className="text-cyan-400 hover:text-cyan-300 underline">プロフィールページ</a>で詳細を設定できます
          </p>
        </form>
      </div>
    </div>
  );
}
