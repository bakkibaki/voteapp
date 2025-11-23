"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 実際の送信処理はここに実装
    // 今はダミーとして表示だけ
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            vote
          </h1>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition font-semibold"
          >
            <ArrowLeft size={20} />
            ホームに戻る
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">お問い合わせ</h1>

          <div className="mb-6 text-gray-300">
            <p>
              本サービスに関するご質問、ご意見、不具合のご報告などは、
              下記のフォームからお送りください。
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
              <p className="text-green-400 font-medium">
                ✓ お問い合わせを受け付けました
              </p>
              <p className="text-gray-400 text-sm mt-2">
                ご連絡ありがとうございます。内容を確認の上、ご返信いたします。
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  お名前 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500"
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  お問い合わせ内容 <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500 resize-none"
                  placeholder="お問い合わせ内容をご記入ください"
                />
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <p className="text-sm text-cyan-400">
                  ご入力いただいた個人情報は、お問い合わせへの対応のみに使用し、
                  適切に管理いたします。詳しくは
                  <a
                    href="/privacy"
                    className="underline hover:text-cyan-300 ml-1"
                  >
                    プライバシーポリシー
                  </a>
                  をご確認ください。
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Send size={20} />
                送信する
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-700">
            <h2 className="text-lg font-bold text-white mb-3">よくある質問</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Q. 投票は匿名ですか？
                </h3>
                <p className="text-sm">
                  A. はい、投票は匿名で行われます。ユーザー名は表示されますが、
                  個人を特定する情報は公開されません。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Q. 投票を削除できますか？
                </h3>
                <p className="text-sm">
                  A. 投票を作成したユーザーのみ、自分が作成した投票を削除できます。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Q. コメントを削除したいです
                </h3>
                <p className="text-sm">
                  A. コメントの削除機能は現在開発中です。不適切なコメントがある場合は、
                  お問い合わせフォームからご連絡ください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
