"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ThumbsUp, Check, BarChart3 } from "lucide-react";
import { Vote } from "@/lib/types";
import { getCurrentUser, hasUser } from "@/lib/user";
import UserSetupModal from "@/components/UserSetupModal";
import CommentSection from "@/components/CommentSection";
import AnalyticsSection from "@/components/AnalyticsSection";

export default function VoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vote, setVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showChangeWarning, setShowChangeWarning] = useState(false);
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [userSetupComplete, setUserSetupComplete] = useState(false);

  useEffect(() => {
    fetchVote();
    if (!hasUser()) {
      setShowUserSetup(true);
    } else {
      setUserSetupComplete(true);
    }
  }, []);

  const fetchVote = async () => {
    try {
      const response = await fetch(`/api/votes/${params.id}`);
      if (!response.ok) {
        throw new Error("投票の取得に失敗しました");
      }
      const data = await response.json();
      setVote(data);
    } catch (error) {
      alert("エラーが発生しました");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = (optionId: string) => {
    if (userVote && userVote !== optionId) {
      setPendingVote(optionId);
      setShowChangeWarning(true);
      return;
    }

    setSelectedOption(optionId);
    submitVote(optionId);
  };

  const submitVote = async (optionId: string) => {
    if (voting) return;

    setVoting(true);
    try {
      const currentUser = getCurrentUser();
      const response = await fetch(`/api/votes/${params.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optionId,
          userId: currentUser?.id,
          age: currentUser?.age,
          gender: currentUser?.gender,
        }),
      });

      if (!response.ok) {
        throw new Error("投票に失敗しました");
      }

      const updatedVote = await response.json();
      setVote(updatedVote);
      setUserVote(optionId);
      setSelectedOption(null);
    } catch (error) {
      alert("エラーが発生しました");
    } finally {
      setVoting(false);
    }
  };

  const confirmVoteChange = () => {
    if (pendingVote) {
      submitVote(pendingVote);
      setPendingVote(null);
    }
    setShowChangeWarning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!vote) {
    return null;
  }

  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
  const hasVoted = userVote !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            vote
          </h1>
          <div className="flex items-center gap-3">
            {getCurrentUser() && (
              <button
                onClick={() => router.push('/profile')}
                className="text-3xl hover:scale-110 transition-transform"
                title="プロフィール"
              >
                {getCurrentUser()?.avatar}
              </button>
            )}
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={20} />
              ホームに戻る
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                一般
              </span>
              <span className="text-xs text-gray-500">
                {new Date(vote.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {vote.title}
            </h1>

            {!hasVoted ? (
              <div className="space-y-3 mb-6">
                {vote.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleVoteClick(option.id)}
                    disabled={voting}
                    className="w-full text-left bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {option.text}
                    </span>
                  </button>
                ))}
                <div className="text-center text-xs text-gray-500 mt-2">
                  <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-medium">
                    💡 選択肢をクリックして投票
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {vote.options.map((option) => {
                  const percentage =
                    totalVotes > 0
                      ? Math.round((option.votes / totalVotes) * 100)
                      : 0;

                  return (
                    <div key={option.id} className="relative">
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {userVote === option.id && (
                            <Check size={16} className="text-blue-600" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {option.text}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-600 pt-4 border-t">
              <span className="flex items-center gap-1">
                <ThumbsUp size={16} />
                {totalVotes.toLocaleString()}人が投票
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 size={16} />
                {vote.options.length}つの選択肢
              </span>
            </div>
          </div>
        </div>

        {hasVoted && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800 text-center font-medium">
              ✓ 投票が完了しました
            </p>
          </div>
        )}

        <CommentSection voteId={vote.id} />

        {getCurrentUser()?.id === vote.authorId && (
          <AnalyticsSection vote={vote} />
        )}
      </div>

      {showChangeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2">投票を変更しますか？</h3>
            <p className="text-gray-600 mb-4">
              既に投票済みです。投票を変更してもよろしいですか？
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowChangeWarning(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                onClick={confirmVoteChange}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                変更する
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserSetup && (
        <UserSetupModal
          onComplete={() => {
            setShowUserSetup(false);
            setUserSetupComplete(true);
          }}
        />
      )}
    </div>
  );
}
