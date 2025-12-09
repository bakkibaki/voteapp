"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ThumbsUp, Check, BarChart3, Trash2, MessageCircle, Share2, Copy, Lock } from "lucide-react";
import { Vote } from "@/lib/types";
import { getCurrentUser, hasUser } from "@/lib/user";
import CustomQuestionModal from "@/components/CustomQuestionModal";
import CommentSection from "@/components/CommentSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import UserSetupModal from "@/components/UserSetupModal";
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
  const [voteChanged, setVoteChanged] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showCustomQuestions, setShowCustomQuestions] = useState(false);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [commentKey, setCommentKey] = useState(0);
  const [showUserSetup, setShowUserSetup] = useState(false);

  useEffect(() => {
    fetchVote();
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
      console.log('Fetched vote data:', data);
      console.log('Custom questions:', data.customQuestions);
      setVote(data);
    } catch (error) {
      alert("エラーが発生しました");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = (optionId: string) => {
    console.log('handleVoteClick called');
    console.log('vote?.customQuestions:', vote?.customQuestions);
    console.log('customQuestions length:', vote?.customQuestions?.length);

    // ユーザー登録チェック
    if (!hasUser()) {
      setPendingOptionId(optionId);
      setShowUserSetup(true);
      return;
    }

    if (userVote && userVote !== optionId) {
      setPendingVote(optionId);
      setShowChangeWarning(true);
      return;
    }

    // カスタム質問がある場合、またはコメント入力のためにモーダルを表示
    console.log('Showing custom questions modal');
    setPendingOptionId(optionId);
    setShowCustomQuestions(true);
  };

  const submitVote = async (optionId: string, customAttributes?: Record<string, string>) => {
    if (voting) return;

    console.log('submitVote called with:', { optionId, customAttributes });

    setVoting(true);
    try {
      const currentUser = getCurrentUser();
      const requestBody = {
        optionId,
        userId: currentUser?.id,
        age: currentUser?.age,
        gender: currentUser?.gender,
        region: currentUser?.region,
        occupation: currentUser?.occupation,
        customAttributes,
      };

      console.log('Sending vote request:', requestBody);

      const response = await fetch(`/api/votes/${params.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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

  const shareToTwitter = () => {
    if (!vote) return;
    const url = `https://voteapp-4pn3.vercel.app/votes/${params.id}`;
    const text = `${vote.title}\n\n投票に参加しよう！`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToLine = () => {
    if (!vote) return;
    const url = `https://voteapp-4pn3.vercel.app/votes/${params.id}`;
    const text = `${vote.title}\n\n投票に参加しよう！`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text + '\n' + url)}`, '_blank');
  };

  const handleCustomQuestionsComplete = async (answers: Record<string, string>, comment?: string, needsReply?: boolean) => {
    console.log('handleCustomQuestionsComplete called:', {
      pendingOptionId,
      answers,
      comment,
      needsReply,
      hasComment: !!comment,
    });

    if (pendingOptionId) {
      const optionId = pendingOptionId; // IDを保存
      setShowCustomQuestions(false);
      setSelectedOption(optionId);
      await submitVote(optionId, answers);

      // コメントがある場合は投稿
      if (comment && vote) {
        const currentUser = getCurrentUser();
        if (currentUser) {
          try {
            const votedOption = vote.options.find(opt => opt.id === optionId);
            console.log('Posting comment after vote:', {
              comment,
              votedOptionText: votedOption?.text,
              needsReply,
            });
            const response = await fetch(`/api/votes/${params.id}/comments`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: currentUser.id,
                userName: currentUser.name,
                userAvatar: currentUser.avatar,
                content: comment,
                votedOptionText: votedOption?.text,
                needsReply: needsReply,
              }),
            });

            console.log('Comment post response:', response.status, response.ok);
            if (response.ok) {
              const result = await response.json();
              console.log('Comment posted successfully:', result);
              // コメント投稿成功後、CommentSectionを更新
              setCommentKey(prev => prev + 1);
            } else {
              const error = await response.text();
              console.error('Comment post failed:', error);
            }
          } catch (error) {
            console.error("Failed to post comment:", error);
          }
        } else {
          console.log('No current user found for comment posting');
        }
      } else {
        console.log('No comment to post or vote not found', { comment, vote: !!vote });
      }

      setPendingOptionId(null);
    }
  };

  const copyUrl = async () => {
    const url = `https://voteapp-4pn3.vercel.app/votes/${params.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('URLをコピーしました！');
    } catch (error) {
      alert('URLのコピーに失敗しました');
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
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition"
          >
            vote就活
          </button>
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                  {vote.category || '一般'}
                </span>
                {vote.isPrivate && (
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 flex items-center gap-1">
                    <Lock size={12} />
                    プライベート
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {getRelativeTime(vote.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {vote.title}
            </h1>

            {vote.authorName && vote.authorId && (
              <button
                onClick={() => router.push(`/profile/${vote.authorId}`)}
                className="flex items-center gap-2 mb-6 text-sm text-gray-400 hover:text-cyan-400 transition"
              >
                <span>投稿者:</span>
                <span className="font-medium">{vote.authorName}</span>
              </button>
            )}

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

            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-800">
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Share2 size={16} />
                共有:
              </span>
              <button
                onClick={shareToTwitter}
                className="px-3 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/20 transition flex items-center gap-1 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </button>
              <button
                onClick={shareToLine}
                className="px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition flex items-center gap-1 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                LINE
              </button>
              <button
                onClick={copyUrl}
                className="px-3 py-2 bg-gray-700/50 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition flex items-center gap-1 text-sm font-medium"
              >
                <Copy size={14} />
                URLコピー
              </button>
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

        {hasVoted && vote.showAnalytics !== false && (
          <AnalyticsSection vote={vote} />
        )}

        {hasVoted && (
          <CommentSection
            key={commentKey}
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
            // ユーザー登録完了後、投票モーダルを表示
            if (pendingOptionId) {
              setShowCustomQuestions(true);
            }
          }}
        />
      )}

      {showCustomQuestions && vote && pendingOptionId && (
        <CustomQuestionModal
          questions={vote.customQuestions || []}
          selectedOptionText={vote.options.find(opt => opt.id === pendingOptionId)?.text}
          onComplete={handleCustomQuestionsComplete}
          onCancel={() => {
            setShowCustomQuestions(false);
            setPendingOptionId(null);
          }}
        />
      )}
    </div>
  );
}
