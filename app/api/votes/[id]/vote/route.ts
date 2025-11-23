import { NextRequest, NextResponse } from "next/server";
import { getVoteById, updateVote } from "@/lib/data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { optionId, userId, age, gender, region, occupation, customAttributes } = body;

    if (!optionId) {
      return NextResponse.json(
        { error: "選択肢IDが必要です" },
        { status: 400 }
      );
    }

    const vote = await getVoteById(id);

    if (!vote) {
      return NextResponse.json(
        { error: "投票が見つかりません" },
        { status: 404 }
      );
    }

    const optionIndex = vote.options.findIndex(
      (option) => option.id === optionId
    );

    if (optionIndex === -1) {
      return NextResponse.json(
        { error: "選択肢が見つかりません" },
        { status: 404 }
      );
    }

    // 投票数を増やす
    vote.options[optionIndex].votes += 1;

    // 投票記録を追加
    if (!vote.voteRecords) {
      vote.voteRecords = [];
    }

    // 既存の投票記録を削除（投票変更の場合）
    vote.voteRecords = vote.voteRecords.filter(record => record.userId !== userId);

    // 新しい投票記録を追加
    vote.voteRecords.push({
      userId,
      optionId,
      age,
      gender,
      region,
      occupation,
      customAttributes,
      timestamp: new Date().toISOString(),
    });

    const updatedVote = await updateVote(id, vote);

    return NextResponse.json(updatedVote);
  } catch (error) {
    return NextResponse.json(
      { error: "投票に失敗しました" },
      { status: 500 }
    );
  }
}
