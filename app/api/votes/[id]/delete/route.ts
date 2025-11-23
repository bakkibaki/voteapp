import { NextRequest, NextResponse } from "next/server";
import { deleteVote } from "@/lib/data";

export async function DELETE(
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

    const success = await deleteVote(id, userId);

    if (!success) {
      return NextResponse.json(
        { error: "投票の削除に失敗しました" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "投票の削除に失敗しました" },
      { status: 500 }
    );
  }
}
