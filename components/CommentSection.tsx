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

  useEffect(() => {
    fetchComments();
  }, [voteId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/votes/${voteId}/comments`);
      if (response.ok) {
        const data = await response.json();
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
    if (!newComment.trim() || submitting) return;

    // ユーザーが未設定の場合はモーダルを表示
    if (!currentUser) {
      setShowNameSetup(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/votes/${voteId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          content: newComment,
          parentId: replyTo?.id,
          votedOptionText: userVotedOptionText,
        }),
      });

      if (response.ok) {
        setNewComment("");
        setReplyTo(null);
        await fetchComments();
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
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

  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (commentId: string) =>
    comments.filter((c) => c.parentId === commentId);

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const replies = getReplies(comment.id);
    const isLiked = currentUser ? comment.likes.includes(currentUser.id) : false;

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

              {!isReply && (
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
            <div className="flex-1 flex gap-2">
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
          onComplete={() => {
            setShowNameSetup(false);
            setCurrentUser(getCurrentUser());
            // 設定完了後、自動的にコメントを送信
            if (newComment.trim()) {
              handleSubmit(new Event('submit') as any);
            }
          }}
        />
      )}
    </>
  );
}
