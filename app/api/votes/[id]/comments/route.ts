import { NextRequest, NextResponse } from "next/server";
import { getCommentsByVoteId, createComment } from "@/lib/comments";
import { Comment } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await getCommentsByVoteId(id);
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: "コメントの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, userName, userAvatar, content, parentId, voteChanged, votedOptionText, needsReply } = body;

    if (!userId || !userName || !content) {
      return NextResponse.json(
        { error: "必要な情報が不足しています" },
        { status: 400 }
      );
    }

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      voteId: id,
      userId,
      userName,
      userAvatar,
      content,
      parentId,
      likes: [],
      createdAt: new Date().toISOString(),
      voteChanged,
      votedOptionText,
      needsReply,
    };

    const createdComment = await createComment(comment);
    return NextResponse.json(createdComment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "コメントの投稿に失敗しました" },
      { status: 500 }
    );
  }
}
