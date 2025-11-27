export interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

export interface CustomQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface VoteRecord {
  userId: string;
  optionId: string;
  // 旧形式の属性（後方互換性のため保持）
  age?: string;
  gender?: string;
  region?: string;
  occupation?: string;
  // 新形式：カスタム質問への回答 { questionId: answer }
  customAttributes?: Record<string, string>;
  timestamp: string;
}

export interface Vote {
  id: string;
  title: string;
  options: VoteOption[];
  createdAt: string;
  category?: string;
  authorId?: string;
  authorName?: string;
  voteRecords?: VoteRecord[];
  showAnalytics?: boolean;
  commentCount?: number;
  isPrivate?: boolean;
  customQuestions?: CustomQuestion[];
}

export interface VotesData {
  votes: Vote[];
}

export interface User {
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

export interface Comment {
  id: string;
  voteId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  parentId?: string;
  likes: string[];
  createdAt: string;
  voteChanged?: boolean;
  votedOptionText?: string;
  needsReply?: boolean;
}

export interface CommentsData {
  comments: Comment[];
}
