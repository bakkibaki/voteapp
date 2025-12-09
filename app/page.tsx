'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, MessageCircle, Plus, Check, Search } from 'lucide-react';
import { Vote } from '@/lib/types';
import { hasUser, getCurrentUser } from '@/lib/user';
import AdBanner from '@/components/AdBanner';
import { getRelativeTime } from '@/lib/dateUtils';
import CustomQuestionModal from '@/components/CustomQuestionModal';
import UserSetupModal from '@/components/UserSetupModal';
import { getTrendingCategories } from '@/lib/categoryUtils';

export default function Home() {
  const router = useRouter();
  const [polls, setPolls] = useState<Vote[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [showChangeWarning, setShowChangeWarning] = useState(false);
  const [pendingVote, setPendingVote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomQuestions, setShowCustomQuestions] = useState(false);
  const [pendingVoteInfo, setPendingVoteInfo] = useState<{ pollId: string; optionId: string; poll: Vote } | null>(null);
  const [categories, setCategories] = useState<string[]>(['すべて']);
  const [showUserSetup, setShowUserSetup] = useState(false);

  useEffect(() => {
    fetchPolls();
    // localStorageから投票履歴を読み込む
    const savedVotes = localStorage.getItem('userVotes');
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await fetch('/api/votes');
      if (response.ok) {
        const data = await response.json();
        setPolls(data);

        // トレンドカテゴリーを取得して設定
        const trendingCategories = getTrendingCategories(data);
        setCategories(['すべて', ...trendingCategories]);
      }
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    console.log('Home page - handleVote called:', { pollId, optionId });

    // ユーザー登録チェック
    if (!hasUser()) {
      const poll = polls.find(p => p.id === pollId);
      if (poll) {
        setPendingVoteInfo({ pollId, optionId, poll });
      }
      setShowUserSetup(true);
      return;
    }

    const hadVoted = userVotes[pollId] !== undefined;
    const changedVote = hadVoted && userVotes[pollId] !== optionId;

    if (changedVote) {
      setPendingVote({ pollId, optionId });
      setShowChangeWarning(true);
      return;
    }

    // カスタム質問がある場合はモーダルを表示
    const poll = polls.find(p => p.id === pollId);
    console.log('Home page - poll found:', poll);
    console.log('Home page - customQuestions:', poll?.customQuestions);
    console.log('Home page - customQuestions length:', poll?.customQuestions?.length);

    if (poll?.customQuestions && poll.customQuestions.length > 0) {
      console.log('Home page - Showing custom questions modal');
      setPendingVoteInfo({ pollId, optionId, poll });
      setShowCustomQuestions(true);
      return;
    }

    console.log('Home page - No custom questions, submitting directly');
    await submitVote(pollId, optionId);
  };

  const submitVote = async (pollId: string, optionId: string, customAttributes?: Record<string, string>) => {
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
          region: currentUser?.region,
          occupation: currentUser?.occupation,
          customAttributes,
        }),
      });

      if (response.ok) {
        const updatedVotes = { ...userVotes, [pollId]: optionId };
        setUserVotes(updatedVotes);
        // localStorageに保存
        localStorage.setItem('userVotes', JSON.stringify(updatedVotes));
        await fetchPolls();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleCustomQuestionsComplete = async (answers: Record<string, string>, comment?: string, needsReply?: boolean) => {
    // 最初にユーザー情報を取得して保存
    const currentUser = getCurrentUser();

    console.log('Home page - handleCustomQuestionsComplete called:', {
      pendingVoteInfo: !!pendingVoteInfo,
      hasCurrentUser: !!currentUser,
      answers,
      comment,
      needsReply,
      hasComment: !!comment,
    });

    if (pendingVoteInfo) {
      await submitVote(pendingVoteInfo.pollId, pendingVoteInfo.optionId, answers);

      // コメントがある場合は投稿
      if (comment && currentUser) {
        console.log('Home page - Posting comment:', {
          hasCurrentUser: !!currentUser,
          comment,
          needsReply,
        });

        if (currentUser) {
          try {
            const votedOption = pendingVoteInfo.poll.options.find(opt => opt.id === pendingVoteInfo.optionId);
            console.log('Home page - About to post comment:', {
              pollId: pendingVoteInfo.pollId,
              votedOptionText: votedOption?.text,
            });

            const response = await fetch(`/api/votes/${pendingVoteInfo.pollId}/comments`, {
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

            console.log('Home page - Comment post response:', response.status, response.ok);
            if (response.ok) {
              const result = await response.json();
              console.log('Home page - Comment posted successfully:', result);
            } else {
              const error = await response.text();
              console.error('Home page - Comment post failed:', error);
            }
          } catch (error) {
            console.error("Failed to post comment:", error);
          }
        } else {
          console.log('Home page - No current user found');
        }
      } else {
        console.log('Home page - No comment to post');
      }

      setShowCustomQuestions(false);
      setPendingVoteInfo(null);
    } else {
      console.log('Home page - No pendingVoteInfo');
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  const filteredPolls = polls
    .filter((poll) => !poll.isPrivate) // プライベート投票は一覧に表示しない
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
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-full hover:shadow-xl hover:shadow-purple-500/50 transition-all font-semibold"
            >
              <Plus size={20} />
              投票を作成
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pb-8 mt-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="投票を検索（タイトル、カテゴリー、作成者）"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400">🔥 トレンド順に表示中</span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={'px-4 py-2 rounded-full whitespace-nowrap transition font-medium ' + (selectedCategory === category ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700')}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPolls.length === 0 ? (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
              <p className="text-gray-400 mb-4">
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
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  フィルタをクリア
                </button>
              ) : (
                <button
                  onClick={() => router.push('/create')}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  最初の投票を作成する
                </button>
              )}
            </div>
          ) : (
            <>
              {filteredPolls.map((poll, index) => {
                const totalVotes = getTotalVotes(poll);
                const showAd = (index + 1) % 3 === 0 && index !== filteredPolls.length - 1;

              return (
                <>
                <div key={poll.id} className="bg-gray-900 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-all overflow-hidden group">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                        {poll.category || 'その他'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(poll.createdAt)}
                      </span>
                    </div>

                    <h3
                      className="text-lg font-bold text-white mb-4 cursor-pointer group-hover:text-cyan-400 transition"
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
                                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg transition-all duration-300 border border-cyan-500/30"
                                  style={{ width: percentage + '%' }}
                                />
                                <div className="relative px-4 py-3 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {userVotes[poll.id] === option.id && <Check size={16} className="text-cyan-400" />}
                                    <span className="text-sm font-medium text-gray-200">{option.text}</span>
                                  </div>
                                  <span className="text-sm font-bold text-white">{percentage}%</span>
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
                              className="w-full text-left bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-cyan-500 rounded-lg px-4 py-3 transition-all"
                            >
                              <span className="text-sm font-medium text-gray-200">{option.text}</span>
                            </button>
                          ))}
                          <div className="text-center text-xs text-gray-500 mt-2">
                            <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full font-medium border border-yellow-500/30">
                              💡 選択肢をクリックして投票
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400 pt-3 border-t border-gray-800">
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={16} />
                        {totalVotes.toLocaleString()}人
                      </span>
                      <button
                        onClick={() => router.push(`/votes/${poll.id}`)}
                        className="flex items-center gap-1 hover:text-cyan-400 transition"
                      >
                        <MessageCircle size={16} />
                        {poll.commentCount || 0}件のコメント
                      </button>
                      {poll.authorName && poll.authorId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/profile/${poll.authorId}`);
                          }}
                          className="ml-auto text-xs hover:text-cyan-400 transition"
                        >
                          by {poll.authorName}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {showAd && (
                  <div key={`ad-${index}`}>
                    <AdBanner
                      dataAdSlot="1234567890"
                      dataAdFormat="auto"
                      dataFullWidthResponsive={true}
                    />
                  </div>
                )}
              </>
              );
            })}</>

          )}
        </div>
      </div>

      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-4">
            <a href="/privacy" className="hover:text-cyan-400 transition">
              プライバシーポリシー
            </a>
            <a href="/terms" className="hover:text-cyan-400 transition">
              利用規約
            </a>
            <a href="/contact" className="hover:text-cyan-400 transition">
              お問い合わせ
            </a>
          </div>
          <div className="text-center text-xs text-gray-500">
            © 2025 vote就活. All rights reserved.
          </div>
        </div>
      </footer>

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

      {showUserSetup && (
        <UserSetupModal
          onComplete={() => {
            setShowUserSetup(false);
            // ユーザー登録完了後、投票モーダルを表示
            if (pendingVoteInfo) {
              if (pendingVoteInfo.poll.customQuestions && pendingVoteInfo.poll.customQuestions.length > 0) {
                setShowCustomQuestions(true);
              } else {
                // カスタム質問がない場合は直接投票
                submitVote(pendingVoteInfo.pollId, pendingVoteInfo.optionId);
                setPendingVoteInfo(null);
              }
            }
          }}
        />
      )}

      {showCustomQuestions && pendingVoteInfo && (
        <CustomQuestionModal
          questions={pendingVoteInfo.poll.customQuestions || []}
          onComplete={handleCustomQuestionsComplete}
          onCancel={() => {
            setShowCustomQuestions(false);
            setPendingVoteInfo(null);
          }}
        />
      )}

    </div>
  );
}
