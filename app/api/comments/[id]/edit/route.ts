import { NextRequest, NextResponse } from "next/server";
import { updateComment } from "@/lib/comments";

// Edit comment API route
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, content } = await request.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: "ユーザーIDとコンテンツが必要です" },
        { status: 400 }
      );
    }

    const updatedComment = await updateComment(id, userId, content);

    if (!updatedComment) {
      return NextResponse.json(
        { error: "コメントの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, comment: updatedComment });
  } catch (error) {
    console.error("Error in POST /api/comments/[id]/edit:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
