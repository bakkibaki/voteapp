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
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editOccupation, setEditOccupation] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const AGE_OPTIONS = ['10代', '20代', '30代', '40代', '50代', '60代以上'];
  const GENDER_OPTIONS = ['男性', '女性', 'その他', '回答しない'];
  const REGION_OPTIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄', '海外'];
  const OCCUPATION_OPTIONS = ['会社員', '公務員', '自営業', '学生', '主婦/主夫', 'パート/アルバイト', '無職', 'その他'];

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
      setEditAge(user.age || "");
      setEditGender(user.gender || "");
      setEditRegion(user.region || "");
      setEditOccupation(user.occupation || "");
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
        age: editAge,
        gender: editGender,
        region: editRegion,
        occupation: editOccupation,
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
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
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
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
                      className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-500"
                      placeholder="表示名"
                    />
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none text-white placeholder-gray-500"
                      placeholder="自己紹介"
                      rows={3}
                    />
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">年代</label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {AGE_OPTIONS.map((ageOption) => (
                          <button
                            key={ageOption}
                            type="button"
                            onClick={() => setEditAge(ageOption)}
                            className={`px-3 py-2 rounded-lg font-medium transition ${editAge === ageOption ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                          >
                            {ageOption}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">性別</label>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {GENDER_OPTIONS.map((genderOption) => (
                          <button
                            key={genderOption}
                            type="button"
                            onClick={() => setEditGender(genderOption)}
                            className={`px-3 py-2 rounded-lg font-medium transition ${editGender === genderOption ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                          >
                            {genderOption}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">地域</label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {REGION_OPTIONS.map((regionOption) => (
                          <button
                            key={regionOption}
                            type="button"
                            onClick={() => setEditRegion(regionOption)}
                            className={`px-2 py-2 rounded-lg font-medium transition text-sm ${editRegion === regionOption ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                          >
                            {regionOption}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">職業</label>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {OCCUPATION_OPTIONS.map((occupationOption) => (
                          <button
                            key={occupationOption}
                            type="button"
                            onClick={() => setEditOccupation(occupationOption)}
                            className={`px-2 py-2 rounded-lg font-medium transition text-sm ${editOccupation === occupationOption ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                          >
                            {occupationOption}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-500/50 transition font-semibold"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-700 rounded-xl hover:bg-gray-800 transition text-gray-300"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                      <button
                        onClick={startEdit}
                        className="text-gray-500 hover:text-cyan-400 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                    <p className="text-gray-400 mb-2">@{user.username}</p>
                    {user.bio && (
                      <p className="text-gray-200 mb-3">{user.bio}</p>
                    )}
                    {(user.age || user.gender || user.region || user.occupation) && (
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {user.age && (
                          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30 font-medium">
                            {user.age}
                          </span>
                        )}
                        {user.gender && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30 font-medium">
                            {user.gender}
                          </span>
                        )}
                        {user.region && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 font-medium">
                            {user.region}
                          </span>
                        )}
                        {user.occupation && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full border border-orange-500/30 font-medium">
                            {user.occupation}
                          </span>
                        )}
                      </div>
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
              <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-sm font-semibold text-gray-300 mb-3">
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
                          ? "bg-cyan-500/20 ring-2 ring-cyan-500"
                          : "bg-gray-900 hover:bg-gray-700 border border-gray-700"
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <FileText size={18} />
                  <span className="text-sm font-semibold">作成した投票</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.votesCreated}</p>
              </div>

              <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <MessageCircle size={18} />
                  <span className="text-sm font-semibold">コメント数</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.commentsPosted}</p>
              </div>
            </div>

            {createdVotes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-cyan-400" />
                  作成した投票
                </h3>
                <div className="space-y-3">
                  {createdVotes.map((vote) => {
                    const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes, 0);
                    return (
                      <button
                        key={vote.id}
                        onClick={() => router.push(`/votes/${vote.id}`)}
                        className="w-full text-left p-4 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:border-cyan-500/50 transition"
                      >
                        <h4 className="font-semibold text-white mb-2">{vote.title}</h4>
                        <div className="flex gap-4 text-sm text-gray-400">
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
