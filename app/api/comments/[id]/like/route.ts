import { NextRequest, NextResponse } from "next/server";
import { toggleCommentLike } from "@/lib/comments";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ユーザーIDが必要です" },
        { status: 400 }
      );
    }

    const comment = await toggleCommentLike(id, userId);

    if (!comment) {
      return NextResponse.json(
        { error: "コメントが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json(
      { error: "いいねの処理に失敗しました" },
      { status: 500 }
    );
  }
}
