"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ThumbsUp, Check, BarChart3, Trash2, MessageCircle } from "lucide-react";
import { Vote } from "@/lib/types";
import { getCurrentUser, hasUser } from "@/lib/user";
import UserSetupModal from "@/components/UserSetupModal";
import CommentSection from "@/components/CommentSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import { getRelativeTime } from "@/lib/dateUtils";

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
  const [voteChanged, setVoteChanged] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    fetchVote();
    if (!hasUser()) {
      setShowUserSetup(true);
    } else {
      setUserSetupComplete(true);
    }
    // localStorageから投票履歴を読み込む
    const savedVotes = localStorage.getItem('userVotes');
    if (savedVotes && params.id) {
      const votes = JSON.parse(savedVotes);
      if (votes[params.id as string]) {
        setUserVote(votes[params.id as string]);
      }
    }
  }, [params.id]);

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
          region: currentUser?.region,
          occupation: currentUser?.occupation,
        }),
      });

      if (!response.ok) {
        throw new Error("投票に失敗しました");
      }

      const updatedVote = await response.json();
      setVote(updatedVote);
      setUserVote(optionId);
      setSelectedOption(null);

      // localStorageに保存
      const savedVotes = localStorage.getItem('userVotes');
      const votes = savedVotes ? JSON.parse(savedVotes) : {};
      votes[params.id as string] = optionId;
      localStorage.setItem('userVotes', JSON.stringify(votes));
    } catch (error) {
      alert("エラーが発生しました");
    } finally {
      setVoting(false);
    }
  };

  const confirmVoteChange = () => {
    if (pendingVote) {
      setVoteChanged(true);
      submitVote(pendingVote);
      setPendingVote(null);
    }
    setShowChangeWarning(false);
  };

  const handleDeleteVote = async () => {
    if (!vote || isDeleting) return;

    setIsDeleting(true);
    try {
      const currentUser = getCurrentUser();
      const response = await fetch(`/api/votes/${params.id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("投票の削除に失敗しました");
      }

      // ホームに戻る
      router.push("/");
    } catch (error) {
      alert("エラーが発生しました");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (!vote) {
    return null;
  }

  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
  const hasVoted = userVote !== null;
  const votedOptionText = userVote ? vote.options.find(opt => opt.id === userVote)?.text : undefined;

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            vote
          </h1>
          <div className="flex items-center gap-3">
            {getCurrentUser()?.id === vote.authorId && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-red-500 hover:text-red-400 transition font-semibold"
                title="投票を削除"
              >
                <Trash2 size={20} />
                削除
              </button>
            )}
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
              className="flex items-center gap-2 text-gray-400 hover:text-white transition font-semibold"
            >
              <ArrowLeft size={20} />
              ホームに戻る
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                {vote.category || '一般'}
              </span>
              <span className="text-xs text-gray-500">
                {getRelativeTime(vote.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-6">
              {vote.title}
            </h1>

            {!hasVoted ? (
              <div className="space-y-3 mb-6">
                {vote.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleVoteClick(option.id)}
                    disabled={voting}
                    className="w-full text-left bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-cyan-500 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
                  >
                    <span className="text-sm font-medium text-gray-200">
                      {option.text}
                    </span>
                  </button>
                ))}
                <div className="text-center text-xs text-gray-500 mt-2">
                  <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full font-medium border border-yellow-500/30">
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
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl transition-all duration-300 border border-cyan-500/30"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {userVote === option.id && (
                            <Check size={16} className="text-cyan-400" />
                          )}
                          <span className="text-sm font-medium text-gray-200">
                            {option.text}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-gray-800">
              <span className="flex items-center gap-1">
                <ThumbsUp size={16} />
                {totalVotes.toLocaleString()}人が投票
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 size={16} />
                {vote.options.length}つの選択肢
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={16} />
                {commentCount}件のコメント
              </span>
            </div>
          </div>
        </div>

        {hasVoted && (
          <div className={`mt-4 rounded-xl p-4 border ${voteChanged ? 'bg-orange-500/10 border-orange-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
            <p className={`text-sm text-center font-medium ${voteChanged ? 'text-orange-400' : 'text-green-400'}`}>
              {voteChanged ? '✓ 投票を変更しました（変更済み）' : '✓ 投票が完了しました'}
            </p>
          </div>
        )}

        {hasVoted && (
          <CommentSection
            voteId={vote.id}
            userVotedOptionText={votedOptionText}
            onCommentCountChange={setCommentCount}
          />
        )}

        {!hasVoted && (
          <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-sm text-cyan-400 text-center font-medium">
              💬 投票するとコメントが見れます
            </p>
          </div>
        )}

        {getCurrentUser()?.id === vote.authorId && vote.showAnalytics !== false && (
          <AnalyticsSection vote={vote} />
        )}
      </div>

      {showChangeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2 text-white">投票を変更しますか？</h3>
            <p className="text-gray-400 mb-4">
              既に投票済みです。投票を変更してもよろしいですか？
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowChangeWarning(false)}
                className="flex-1 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300 transition"
              >
                キャンセル
              </button>
              <button
                onClick={confirmVoteChange}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold"
              >
                変更する
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2 text-red-500">投票を削除しますか？</h3>
            <p className="text-gray-400 mb-4">
              この操作は取り消せません。投票とすべてのコメントが完全に削除されます。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300 disabled:opacity-50 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteVote}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition"
              >
                {isDeleting ? (
                  "削除中..."
                ) : (
                  <>
                    <Trash2 size={16} />
                    削除する
                  </>
                )}
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
