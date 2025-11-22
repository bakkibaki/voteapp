export interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

export interface VoteRecord {
  userId: string;
  optionId: string;
  age?: string;
  gender?: string;
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
}

export interface CommentsData {
  comments: Comment[];
}
