import { NextRequest, NextResponse } from "next/server";
import { getVoteById, updateVote } from "@/lib/data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vote = await getVoteById(id);

    if (!vote) {
      return NextResponse.json(
        { error: "投票が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(vote);
  } catch (error) {
    return NextResponse.json(
      { error: "投票の取得に失敗しました" },
      { status: 500 }
    );
  }
}
