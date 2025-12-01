"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Heart, Reply, Send, X } from "lucide-react";
import { Comment } from "@/lib/types";
import { getCurrentUser } from "@/lib/user";
import { getRelativeTime } from "@/lib/dateUtils";
import QuickNameSetupModal from "./QuickNameSetupModal";

interface CommentSectionProps {
  voteId: string;
  userVotedOptionText?: string;
  onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({ voteId, userVotedOptionText, onCommentCountChange }: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNameSetup, setShowNameSetup] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [needsReply, setNeedsReply] = useState(true); // デフォルトで異論を歓迎

  useEffect(() => {
    fetchComments();
  }, [voteId]);

  useEffect(() => {
    // ページ表示時とlocalStorageの変更時にユーザー情報を更新
    const updateCurrentUser = () => {
      setCurrentUser(getCurrentUser());
    };

    updateCurrentUser();

    // localStorageの変更を監視
    window.addEventListener('storage', updateCurrentUser);
    return () => window.removeEventListener('storage', updateCurrentUser);
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/votes/${voteId}/comments`);
      if (response.ok) {
        const data = await response.json();
        console.log('CommentSection - fetched comments:', data.map((c: any) => ({ id: c.id, needsReply: c.needsReply })));
        setComments(data);
        if (onCommentCountChange) {
          onCommentCountChange(data.length);
        }
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called', { newComment, submitting, currentUser });

    if (!newComment.trim() || submitting) {
      console.log('Early return: empty comment or submitting', { newComment: newComment.trim(), submitting });
      return;
    }

    // ユーザーが未設定の場合はモーダルを表示
    if (!currentUser) {
      console.log('No current user, showing name setup modal');
      setShowNameSetup(true);
      return;
    }

    console.log('Submitting comment...');
    setSubmitting(true);
    try {
      const requestBody = {
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        content: newComment,
        parentId: replyTo?.id,
        votedOptionText: userVotedOptionText,
        needsReply: replyTo ? undefined : needsReply, // 返信の場合はneedsReplyを設定しない
      };
      console.log('Request body:', requestBody);

      const response = await fetch(`/api/votes/${voteId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        console.log('Comment posted successfully');
        setNewComment("");
        setReplyTo(null);
        setNeedsReply(true); // デフォルトに戻す（異論を歓迎）
        await fetchComments();
      } else {
        const errorData = await response.json();
        console.error('Failed to post comment:', errorData);
        alert("コメントの投稿に失敗しました: " + (errorData.error || "不明なエラー"));
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("コメントの投稿中にエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  const handleToggleNeedsReply = async (commentId: string, currentNeedsReply: boolean) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/comments/${commentId}/needs-reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ needsReply: !currentNeedsReply }),
      });

      if (response.ok) {
        // ローカルで状態を更新（即座にUIを更新）
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, needsReply: !currentNeedsReply }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle needs reply:", error);
    }
  };

  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (commentId: string) =>
    comments.filter((c) => c.parentId === commentId);

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const replies = getReplies(comment.id);
    const isLiked = currentUser ? comment.likes.includes(currentUser.id) : false;
    const isOwnComment = currentUser && comment.userId === currentUser.id;

    return (
      <div className={`${isReply ? "ml-12 mt-3" : ""}`}>
        <div className="flex gap-3">
          <div className="text-2xl flex-shrink-0">{comment.userAvatar}</div>
          <div className="flex-1">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/profile/${comment.userId}`);
                  }}
                  className="font-semibold text-sm text-white hover:text-cyan-400 transition"
                >
                  {comment.userName}
                </button>
                {comment.votedOptionText && (
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {comment.votedOptionText}派
                  </span>
                )}
                {comment.voteChanged && (
                  <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
                    投票変更
                  </span>
                )}
                {!comment.parentId && (
                  <button
                    onClick={() => {
                      console.log('Badge clicked:', { commentId: comment.id, currentNeedsReply: comment.needsReply, isOwnComment });
                      if (isOwnComment) {
                        handleToggleNeedsReply(comment.id, comment.needsReply || false);
                      }
                    }}
                    disabled={!isOwnComment}
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      comment.needsReply
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-gray-700/10 text-gray-500 border-gray-600/30'
                    } ${isOwnComment ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'} transition`}
                    title={isOwnComment ? `クリックで切り替え (現在: ${comment.needsReply})` : `(値: ${comment.needsReply})`}
                  >
                    💬 {comment.needsReply ? '返信希望' : '返信不要'} [{String(comment.needsReply)}]
                  </button>
                )}
                <span className="text-xs text-gray-500">
                  {getRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-300">{comment.content}</p>
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm">
              <button
                onClick={() => handleLike(comment.id)}
                disabled={!currentUser}
                className={`flex items-center gap-1 transition ${
                  isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                {comment.likes.length > 0 && (
                  <span className="text-red-500 font-semibold">{comment.likes.length}</span>
                )}
              </button>

              {!isReply && comment.needsReply && (
                <button
                  onClick={() => setReplyTo(comment)}
                  disabled={!currentUser}
                  className="flex items-center gap-1 text-gray-400 hover:text-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Reply size={16} />
                  返信
                </button>
              )}
            </div>

            {replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mt-4">
        <p className="text-center text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mt-4">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle size={20} className="text-cyan-400" />
          <h3 className="text-lg font-bold text-white">
            コメント ({comments.length})
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          {replyTo && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply size={16} className="text-cyan-400" />
                <span className="text-sm text-cyan-300">
                  {replyTo.userName}さんに返信
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-cyan-400 hover:text-cyan-300"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <div className="text-2xl flex-shrink-0">{currentUser?.avatar || "😊"}</div>
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={currentUser ? "コメントを追加..." : "コメントするには名前を設定してください"}
                  className="flex-1 px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* 返信を受け付けるかのチェックボックス（返信時は非表示） */}
              {!replyTo && newComment.trim() && currentUser && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="needsReply"
                    checked={needsReply}
                    onChange={(e) => setNeedsReply(e.target.checked)}
                    className="w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  />
                  <label htmlFor="needsReply" className="text-sm text-gray-300 cursor-pointer select-none">
                    💬 返信を希望する（異論を歓迎）
                    <span className="text-xs text-gray-500 ml-1">※投稿後も変更可能</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {topLevelComments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              まだコメントがありません
            </p>
          ) : (
            topLevelComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>

      {showNameSetup && (
        <QuickNameSetupModal
          onComplete={async () => {
            setShowNameSetup(false);
            const updatedUser = getCurrentUser();
            setCurrentUser(updatedUser);
            // 設定完了後、自動的にコメントを送信
            if (newComment.trim() && updatedUser) {
              setSubmitting(true);
              try {
                const response = await fetch(`/api/votes/${voteId}/comments`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userId: updatedUser.id,
                    userName: updatedUser.name,
                    userAvatar: updatedUser.avatar,
                    content: newComment,
                    parentId: replyTo?.id,
                    votedOptionText: userVotedOptionText,
                    needsReply: replyTo ? undefined : needsReply,
                  }),
                });

                if (response.ok) {
                  setNewComment("");
                  setReplyTo(null);
                  setNeedsReply(true); // デフォルトに戻す（異論を歓迎）
                  await fetchComments();
                } else {
                  alert("コメントの投稿に失敗しました");
                }
              } catch (error) {
                console.error("Failed to post comment:", error);
                alert("コメントの投稿中にエラーが発生しました");
              } finally {
                setSubmitting(false);
              }
            }
          }}
        />
      )}
    </>
  );
}
