"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-white mb-6">利用規約</h1>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">第1条（適用）</h2>
              <p>
                本利用規約（以下「本規約」）は、当サイト「vote」（以下「本サービス」）の
                利用条件を定めるものです。ユーザーの皆様には、本規約に従って
                本サービスをご利用いただきます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">第2条（利用登録）</h2>
              <p className="mb-2">
                本サービスでは、ユーザー名とプロフィール情報を登録することで
                投票やコメントが可能になります。登録情報は正確かつ最新の情報を
                提供してください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">第3条（禁止事項）</h2>
              <p className="mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>他のユーザーまたは第三者の権利を侵害する行為</li>
                <li>誹謗中傷、差別的表現を含む投稿</li>
                <li>虚偽の情報を登録・投稿する行為</li>
                <li>不正アクセス、システムへの攻撃行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>複数アカウントでの不正投票</li>
                <li>商業目的での無断利用</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">第4条（投稿コンテンツ）</h2>
              <p className="mb-2">
                ユーザーが投稿した投票、コメント等のコンテンツの著作権は、
                投稿したユーザーに帰属します。ただし、本サービスの運営・改善のため、
                当サイトは投稿コンテンツを利用できるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">第5条（コンテンツの削除）</h2>
              <p>
                当サイトは、ユーザーが投稿したコンテンツが本規約に違反すると
                判断した場合、事前通知なく削除できるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">第6条（免責事項）</h2>
              <p className="mb-2">
                本サービスは現状有姿で提供されます。当サイトは、以下について
                一切の責任を負いません：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>本サービスの完全性、正確性、確実性</li>
                <li>本サービスの中断、停止、終了</li>
                <li>ユーザー間のトラブル</li>
                <li>データの消失、破損</li>
                <li>本サービスの利用によって生じた損害</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">第7条（サービスの変更・終了）</h2>
              <p>
                当サイトは、ユーザーへの事前通知なく、本サービスの内容を変更、
                または提供を中止・終了することができます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">第8条（利用規約の変更）</h2>
              <p>
                当サイトは、必要に応じて本規約を変更することがあります。
                変更後の規約は、本ページに掲載した時点で効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">第9条（準拠法・裁判管轄）</h2>
              <p className="mb-2">
                本規約の解釈にあたっては、日本法を準拠法とします。
              </p>
              <p>
                本サービスに関して紛争が生じた場合には、
                当サイトの所在地を管轄する裁判所を専属的合意管轄とします。
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
