"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, BarChart3, MessageCircle, Calendar, FileText, ThumbsUp, Trash2 } from "lucide-react";
import { getCurrentUser, hasUser, getAvatarOptions, updateUser } from "@/lib/user";
import { Vote, Comment } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [votes, setVotes] = useState<Vote[]>([]);
  const [votedVotes, setVotedVotes] = useState<Vote[]>([]);
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [voteToDelete, setVoteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const AGE_OPTIONS = ['25卒', '26卒', '27卒', '28卒', '29卒以降', '既卒'];
  const GENDER_OPTIONS = ['男性', '女性', 'その他', '回答しない'];
  const REGION_OPTIONS = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄', '海外'];
  const OCCUPATION_OPTIONS = ['就活中', '内定者', '社会人1-3年目', '社会人4年目以上', '大学院生', 'その他'];

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
        fetch("/api/votes/1/comments").catch(() => null),
      ]);

      if (votesRes.ok) {
        const votesData = await votesRes.json();
        setVotes(votesData);
      }

      if (commentsRes && commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData);
      }

      // localStorageから投票履歴を取得
      const savedVotes = localStorage.getItem('userVotes');
      if (savedVotes) {
        const votesMap = JSON.parse(savedVotes);
        const voteIds = Object.keys(votesMap);

        if (voteIds.length > 0) {
          // 投票した投票の詳細を取得
          const votedVotesData = await Promise.all(
            voteIds.map(async (voteId) => {
              try {
                const res = await fetch(`/api/votes/${voteId}`);
                if (res.ok) {
                  const voteData = await res.json();
                  return { ...voteData, userSelectedOptionId: votesMap[voteId] };
                }
                return null;
              } catch {
                return null;
              }
            })
          );

          setVotedVotes(votedVotesData.filter((v) => v !== null) as Vote[]);
        }
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

  const handleDeleteClick = (voteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVoteToDelete(voteId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteVote = async () => {
    if (!voteToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/votes/${voteToDelete}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("投票の削除に失敗しました");
      }

      // リストから削除
      setVotes(votes.filter((v) => v.id !== voteToDelete));
      setShowDeleteConfirm(false);
      setVoteToDelete(null);
    } catch (error) {
      alert("エラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetData = () => {
    // localStorageをクリアしてホームに戻る
    localStorage.clear();
    router.push("/");
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
    votesParticipated: votedVotes.length,
    commentsPosted: userComments.length,
  };

  const avatarOptions = getAvatarOptions();

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
                      <label className="block text-sm font-semibold text-gray-300 mb-2">卒業年度</label>
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
                      <label className="block text-sm font-semibold text-gray-300 mb-2">状況</label>
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

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <FileText size={18} />
                  <span className="text-xs font-semibold">作成した投票</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.votesCreated}</p>
              </div>

              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <ThumbsUp size={18} />
                  <span className="text-xs font-semibold">投票した数</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.votesParticipated}</p>
              </div>

              <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <MessageCircle size={18} />
                  <span className="text-xs font-semibold">コメント数</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.commentsPosted}</p>
              </div>
            </div>

            {votedVotes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ThumbsUp size={20} className="text-green-400" />
                  投票した投票
                </h3>
                <div className="space-y-3">
                  {votedVotes.map((vote: any) => {
                    const totalVotes = vote.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
                    const selectedOption = vote.options.find((opt: any) => opt.id === vote.userSelectedOptionId);
                    return (
                      <button
                        key={vote.id}
                        onClick={() => router.push(`/votes/${vote.id}`)}
                        className="w-full text-left p-4 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:border-green-500/50 transition"
                      >
                        <h4 className="font-semibold text-white mb-2">{vote.title}</h4>
                        {selectedOption && (
                          <div className="mb-2 text-sm">
                            <span className="text-green-400 font-medium">あなたの投票: </span>
                            <span className="text-gray-300">{selectedOption.text}</span>
                          </div>
                        )}
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
                      <div
                        key={vote.id}
                        className="relative p-4 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:border-cyan-500/50 transition group"
                      >
                        <button
                          onClick={(e) => handleDeleteClick(vote.id, e)}
                          className="absolute top-3 right-3 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                          title="削除"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div
                          onClick={() => router.push(`/votes/${vote.id}`)}
                          className="cursor-pointer"
                        >
                          <h4 className="font-semibold text-white mb-2 pr-10">{vote.title}</h4>
                          <div className="flex gap-4 text-sm text-gray-400">
                            <span>{vote.options.length}個の選択肢</span>
                            <span>•</span>
                            <span>{totalVotes}票</span>
                            <span>•</span>
                            <span>{new Date(vote.createdAt).toLocaleDateString("ja-JP")}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 危険ゾーン */}
            <div className="mt-8 pt-6 border-t border-red-900/30">
              <h3 className="text-lg font-bold text-red-500 mb-2">⚠️ 危険ゾーン</h3>
              <p className="text-sm text-gray-400 mb-4">
                この操作は取り消せません。すべてのデータが削除され、新規ユーザーとして始めることができます。
              </p>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-600/10 border border-red-600/30 text-red-500 rounded-xl hover:bg-red-600/20 transition font-semibold"
              >
                すべてのデータをリセット
              </button>
            </div>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-800 rounded-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2 text-red-500">⚠️ データをリセットしますか？</h3>
            <p className="text-gray-400 mb-4">
              この操作により、以下のデータがすべて削除されます：
            </p>
            <ul className="text-sm text-gray-300 mb-4 space-y-1 list-disc list-inside">
              <li>ユーザープロフィール情報</li>
              <li>投票履歴</li>
              <li>すべてのローカルデータ</li>
            </ul>
            <p className="text-sm text-yellow-400 mb-4">
              ※ この操作は取り消せません。新規ユーザーとして最初からやり直すことができます。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-300 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 font-semibold transition"
              >
                リセットする
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
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setVoteToDelete(null);
                }}
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
    </div>
  );
}
