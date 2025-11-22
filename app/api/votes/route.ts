import { NextRequest, NextResponse } from "next/server";
import { createVote, getAllVotes } from "@/lib/data";
import { Vote } from "@/lib/types";

export async function GET() {
  try {
    const votes = await getAllVotes();
    return NextResponse.json(votes);
  } catch (error) {
    return NextResponse.json(
      { error: "投票の取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, options, category, authorId, authorName } = body;

    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "タイトルと2つ以上の選択肢が必要です" },
        { status: 400 }
      );
    }

    const vote: Vote = {
      id: Date.now().toString(),
      title,
      options: options.map((text: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        text,
        votes: 0,
      })),
      createdAt: new Date().toISOString(),
      category,
      authorId,
      authorName,
    };

    const createdVote = await createVote(vote);
    return NextResponse.json(createdVote, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "投票の作成に失敗しました" },
      { status: 500 }
    );
  }
}
