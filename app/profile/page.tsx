"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, BarChart3, MessageCircle, Calendar, FileText } from "lucide-react";
import { getCurrentUser, hasUser, getAvatarOptions, updateUser } from "@/lib/user";
import { Vote, Comment } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [votes, setVotes] = useState<Vote[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (!hasUser()) {
      router.push("/");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [votesRes, commentsRes] = await Promise.all([
        fetch("/api/votes"),
        fetch("/api/votes/1/comments").catch(() => ({ ok: false })),
      ]);

      if (votesRes.ok) {
        const votesData = await votesRes.json();
        setVotes(votesData);
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    if (user) {
      setEditName(user.name);
      setEditBio(user.bio || "");
      setEditAvatar(user.avatar);
      setIsEditing(true);
    }
  };

  const saveEdit = () => {
    if (user) {
      const updatedUser = {
        ...user,
        name: editName,
        bio: editBio,
        avatar: editAvatar,
      };
      updateUser(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  const createdVotes = votes.filter((v) => v.authorId === user.id);
  const userComments = comments.filter((c) => c.userId === user.id);

  const stats = {
    votesCreated: createdVotes.length,
    commentsPosted: userComments.length,
  };

  const avatarOptions = getAvatarOptions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            vote
          </h1>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            ホームに戻る
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="text-6xl">{user.avatar}</div>
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="表示名"
                    />
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="自己紹介"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                      <button
                        onClick={startEdit}
                        className="text-gray-500 hover:text-blue-600 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                    <p className="text-gray-600 mb-2">@{user.username}</p>
                    {user.bio && (
                      <p className="text-gray-800 mb-3">{user.bio}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={16} />
                      参加日: {new Date(user.joinedDate).toLocaleDateString("ja-JP")}
                    </div>
                  </>
                )}
              </div>
            </div>

            {showAvatarPicker && isEditing && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  アバターを選択
                </p>
                <div className="grid grid-cols-8 gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => {
                        setEditAvatar(avatar);
                        setShowAvatarPicker(false);
                      }}
                      className={`text-3xl p-2 rounded-lg transition ${
                        editAvatar === avatar
                          ? "bg-blue-100 ring-2 ring-blue-500"
                          : "bg-white hover:bg-gray-200"
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <FileText size={18} />
                  <span className="text-sm font-semibold">作成した投票</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.votesCreated}</p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <MessageCircle size={18} />
                  <span className="text-sm font-semibold">コメント数</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.commentsPosted}</p>
              </div>
            </div>

            {createdVotes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  作成した投票
                </h3>
                <div className="space-y-3">
                  {createdVotes.map((vote) => {
                    const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
                    return (
                      <button
                        key={vote.id}
                        onClick={() => router.push(`/votes/${vote.id}`)}
                        className="w-full text-left p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{vote.title}</h4>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{vote.options.length}個の選択肢</span>
                          <span>•</span>
                          <span>{totalVotes}票</span>
                          <span>•</span>
                          <span>{new Date(vote.createdAt).toLocaleDateString("ja-JP")}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
