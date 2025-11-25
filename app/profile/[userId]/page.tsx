"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BarChart3, MessageCircle, Calendar, FileText, ThumbsUp } from "lucide-react";
import { getCurrentUser } from "@/lib/user";
import { Vote, Comment } from "@/lib/types";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  age?: string;
  gender?: string;
  region?: string;
  occupation?: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const currentUser = getCurrentUser();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [votedVotes, setVotedVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 自分のプロフィールを見ようとしている場合は /profile にリダイレクト
    if (currentUser?.id === userId) {
      router.push("/profile");
      return;
    }
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const votesRes = await fetch("/api/votes");

      if (votesRes.ok) {
        const votesData = await votesRes.json();
        setVotes(votesData);

        // このユーザーが作成した投票を取得
        const createdVotes = votesData.filter((v: Vote) => v.authorId === userId);

        if (createdVotes.length > 0) {
          // 最初の投票から基本情報を取得
          const firstVote = createdVotes[0];
          const userInfo: UserProfile = {
            id: userId,
            name: firstVote.authorName || "名無しさん",
            username: `user-${userId.slice(0, 8)}`,
            avatar: "👤",
            joinedDate: firstVote.createdAt,
          };

          // 投票記録から属性情報を取得（最新のもの）
          for (const vote of votesData) {
            const userRecord = vote.voteRecords?.find((r: any) => r.userId === userId);
            if (userRecord) {
              if (userRecord.age) userInfo.age = userRecord.age;
              if (userRecord.gender) userInfo.gender = userRecord.gender;
              if (userRecord.region) userInfo.region = userRecord.region;
              if (userRecord.occupation) userInfo.occupation = userRecord.occupation;
              break; // 最初に見つかった情報を使用
            }
          }

          setUser(userInfo);
        } else {
          // 投票を作成していない場合、投票記録から情報を取得
          for (const vote of votesData) {
            const userRecord = vote.voteRecords?.find((r: any) => r.userId === userId);
            if (userRecord) {
              const userInfo: UserProfile = {
                id: userId,
                name: "名無しさん",
                username: `user-${userId.slice(0, 8)}`,
                avatar: "👤",
                joinedDate: userRecord.timestamp,
                age: userRecord.age,
                gender: userRecord.gender,
                region: userRecord.region,
                occupation: userRecord.occupation,
              };
              setUser(userInfo);
              break;
            }
          }
        }

        // このユーザーが投票した投票を取得
        const userVotedVotes: Vote[] = [];
        for (const vote of votesData) {
          const userRecord = vote.voteRecords?.find((r: any) => r.userId === userId);
          if (userRecord) {
            userVotedVotes.push({ ...vote, userSelectedOptionId: userRecord.optionId } as any);
          }
        }
        setVotedVotes(userVotedVotes);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">ユーザーが見つかりません</p>
          <button
            onClick={() => router.push("/")}
            className="text-cyan-400 hover:text-cyan-300"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const createdVotes = votes.filter((v) => v.authorId === userId);

  const stats = {
    votesCreated: createdVotes.length,
    votesParticipated: votedVotes.length,
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            vote
          </h1>
          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={() => router.push('/profile')}
                className="text-3xl hover:scale-110 transition-transform"
                title="プロフィール"
              >
                {currentUser.avatar}
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <div className="text-6xl">{user.avatar}</div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
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
                            <span className="text-green-400 font-medium">投票: </span>
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
