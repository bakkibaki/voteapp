import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, content } = await request.json();
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
        { error: "このコメントを編集する権限がありません" },
        { status: 403 }
      );
    }

    // コメントを更新
    const { error: updateError } = await supabase
      .from("comments")
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id);

    if (updateError) {
      console.error("Failed to update comment:", updateError);
      return NextResponse.json(
        { error: "コメントの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/comments/[id]/edit:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
