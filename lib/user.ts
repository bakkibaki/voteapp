import { User } from "./types";

const USER_STORAGE_KEY = "vote_app_user";

const AVATAR_OPTIONS = [
  "😊", "😎", "🤓", "😇", "🥳", "🤗", "🧐", "😴",
  "🐶", "🐱", "🐼", "🐨", "🦊", "🦁", "🐯", "🐸",
  "🌟", "⭐", "✨", "💫", "🔥", "💎", "🎨", "🎭"
];

export function getAvatarOptions(): string[] {
  return AVATAR_OPTIONS;
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const userJson = localStorage.getItem(USER_STORAGE_KEY);
  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function createUser(name: string, username: string, avatar: string, age?: string, gender?: string): User {
  const user: User = {
    id: `user_${Date.now()}`,
    name,
    username,
    avatar,
    joinedDate: new Date().toISOString(),
    age,
    gender,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  return user;
}

export function updateUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function hasUser(): boolean {
  return getCurrentUser() !== null;
}
