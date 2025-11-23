"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Heart, Reply, Send, X } from "lucide-react";
import { Comment } from "@/lib/types";
import { getCurrentUser } from "@/lib/user";
import { getRelativeTime } from "@/lib/dateUtils";

interface CommentSectionProps {
  voteId: string;
  userVotedOptionText?: string;
  onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({ voteId, userVotedOptionText, onCommentCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = getCurrentUser();

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
    if (!newComment.trim() || !currentUser || submitting) return;

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
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{comment.userName}</span>
                {comment.votedOptionText && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {comment.votedOptionText}派
                  </span>
                )}
                {comment.voteChanged && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    投票変更
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {getRelativeTime(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-800">{comment.content}</p>
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm">
              <button
                onClick={() => handleLike(comment.id)}
                disabled={!currentUser}
                className={`flex items-center gap-1 transition ${
                  isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
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
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} className="text-gray-700" />
        <h3 className="text-lg font-bold text-gray-900">
          コメント ({comments.length})
        </h3>
      </div>

      {currentUser && (
        <form onSubmit={handleSubmit} className="mb-6">
          {replyTo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply size={16} className="text-blue-600" />
                <span className="text-sm text-blue-800">
                  {replyTo.userName}さんに返信
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <div className="text-2xl flex-shrink-0">{currentUser.avatar}</div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを追加..."
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>
      )}

      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-yellow-800">
            コメントするには、プロフィールを設定してください
          </p>
        </div>
      )}

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
  );
}
