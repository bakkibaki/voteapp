'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, MessageCircle, Plus, Check, Search } from 'lucide-react';
import { Vote } from '@/lib/types';
import { hasUser, getCurrentUser } from '@/lib/user';
import UserSetupModal from '@/components/UserSetupModal';

const CATEGORIES = ['すべて', 'ライフスタイル', 'テクノロジー', 'エンターテイメント', 'スポーツ', '政治', 'その他'];

export default function Home() {
  const router = useRouter();
  const [polls, setPolls] = useState<Vote[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [showChangeWarning, setShowChangeWarning] = useState(false);
  const [pendingVote, setPendingVote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPolls();
    if (!hasUser()) {
      setShowUserSetup(true);
    }
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await fetch('/api/votes');
      if (response.ok) {
        const data = await response.json();
        setPolls(data);
      }
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    const hadVoted = userVotes[pollId] !== undefined;
    const changedVote = hadVoted && userVotes[pollId] !== optionId;

    if (changedVote) {
      setPendingVote({ pollId, optionId });
      setShowChangeWarning(true);
      return;
    }

    await submitVote(pollId, optionId);
  };

  const submitVote = async (pollId: string, optionId: string) => {
    try {
      const currentUser = getCurrentUser();
      const response = await fetch(`/api/votes/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optionId,
          userId: currentUser?.id,
          age: currentUser?.age,
          gender: currentUser?.gender,
        }),
      });

      if (response.ok) {
        setUserVotes({ ...userVotes, [pollId]: optionId });
        await fetchPolls();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const confirmVoteChange = async () => {
    if (pendingVote) {
      await submitVote(pendingVote.pollId, pendingVote.optionId);
      setPendingVote(null);
    }
    setShowChangeWarning(false);
  };

  const hasVoted = (pollId: string) => userVotes[pollId] !== undefined;

  const getTotalVotes = (poll: Vote) => {
    return poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  };

  const getPercentage = (poll: Vote, optionVotes: number) => {
    const total = getTotalVotes(poll);
    return total > 0 ? Math.round((optionVotes / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  const filteredPolls = polls
    .filter((poll) => selectedCategory === 'すべて' || poll.category === selectedCategory)
    .filter((poll) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        poll.title.toLowerCase().includes(query) ||
        poll.category?.toLowerCase().includes(query) ||
        poll.authorName?.toLowerCase().includes(query)
      );
    });

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
              onClick={() => router.push('/create')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              投票を作成
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="投票を検索（タイトル、カテゴリー、作成者）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={'px-4 py-2 rounded-full whitespace-nowrap transition ' + (selectedCategory === category ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPolls.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedCategory !== 'すべて'
                  ? '検索結果が見つかりません'
                  : 'まだ投票がありません'}
              </p>
              {searchQuery || selectedCategory !== 'すべて' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('すべて');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  フィルタをクリア
                </button>
              ) : (
                <button
                  onClick={() => router.push('/create')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  最初の投票を作成する
                </button>
              )}
            </div>
          ) : (
            filteredPolls.map((poll) => {
              const totalVotes = getTotalVotes(poll);

              return (
                <div key={poll.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {poll.category || 'その他'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(poll.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>

                    <h3
                      className="text-lg font-bold text-gray-900 mb-4 cursor-pointer hover:text-blue-600"
                      onClick={() => router.push(`/votes/${poll.id}`)}
                    >
                      {poll.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      {hasVoted(poll.id) ? (
                        <>
                          {poll.options.map((option) => {
                            const percentage = getPercentage(poll, option.votes);
                            return (
                              <div key={option.id} className="relative">
                                <div
                                  className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg transition-all duration-300"
                                  style={{ width: percentage + '%' }}
                                />
                                <div className="relative px-4 py-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {userVotes[poll.id] === option.id && <Check size={16} className="text-blue-600" />}
                                    <span className="text-sm font-medium text-gray-700">{option.text}</span>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          {poll.options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleVote(poll.id, option.id)}
                              className="w-full text-left bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-lg px-4 py-3 transition-all"
                            >
                              <span className="text-sm font-medium text-gray-700">{option.text}</span>
                            </button>
                          ))}
                          <div className="text-center text-xs text-gray-500 mt-2">
                            <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-medium">
                              💡 選択肢をクリックして投票
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={16} />
                        {totalVotes.toLocaleString()}人
                      </span>
                      <button
                        onClick={() => router.push(`/votes/${poll.id}`)}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <MessageCircle size={16} />
                        詳細を見る
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
          }}
        />
      )}
    </div>
  );
}
