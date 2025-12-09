import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await request.json();
    const supabase = createClient();

    // コメントの所有者確認
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: "コメントが見つかりません" },
        { status: 404 }
      );
    }

    if (comment.user_id !== userId) {
      return NextResponse.json(
        { error: "このコメントを削除する権限がありません" },
        { status: 403 }
      );
    }

    // コメントを削除
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Failed to delete comment:", deleteError);
      return NextResponse.json(
        { error: "コメントの削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/comments/[id]/delete:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
