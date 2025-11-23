"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">プライバシーポリシー</h1>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. 収集する情報</h2>
              <p className="mb-2">
                当サイトでは、より良いサービスを提供するため、以下の情報を収集する場合があります：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>ユーザーが入力した表示名、ユーザー名</li>
                <li>投票内容、コメント内容</li>
                <li>年代、性別、地域、職業などの属性情報</li>
                <li>アクセス情報（IPアドレス、ブラウザ情報、アクセス日時）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. 情報の利用目的</h2>
              <p className="mb-2">収集した情報は以下の目的で利用します：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>サービスの提供・運営</li>
                <li>投票結果の集計・分析</li>
                <li>サービスの改善・向上</li>
                <li>不正利用の防止</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Cookieについて</h2>
              <p>
                当サイトでは、ユーザーの利便性向上のためCookieを使用しています。
                Cookieはユーザーのブラウザに保存される小さなテキストファイルで、
                ユーザー設定や投票履歴の保存に使用されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. 広告配信について</h2>
              <p className="mb-2">
                当サイトでは、第三者配信の広告サービス（Google AdSense）を利用しています。
                広告配信事業者は、ユーザーの興味に応じた広告を表示するため、
                Cookieを使用してユーザーのサイト訪問に関する情報を収集することがあります。
              </p>
              <p className="mt-2">
                詳細は
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline ml-1"
                >
                  Googleのプライバシーポリシー
                </a>
                をご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. 第三者への情報提供</h2>
              <p>
                当サイトは、法令に基づく場合を除き、ユーザーの同意なく
                第三者に個人情報を提供することはありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. データの保存</h2>
              <p>
                ユーザーデータはブラウザのローカルストレージおよびSupabaseデータベースに保存されます。
                ユーザーはブラウザの設定からデータを削除できます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. プライバシーポリシーの変更</h2>
              <p>
                当サイトは、必要に応じてプライバシーポリシーを変更することがあります。
                変更後のポリシーは、本ページに掲載した時点で効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. お問い合わせ</h2>
              <p>
                プライバシーポリシーに関するご質問は、
                <a
                  href="/contact"
                  className="text-cyan-400 hover:text-cyan-300 underline ml-1"
                >
                  お問い合わせページ
                </a>
                からご連絡ください。
              </p>
            </section>

            <div className="pt-6 border-t border-gray-700 text-sm text-gray-500">
              制定日：2025年11月24日
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
