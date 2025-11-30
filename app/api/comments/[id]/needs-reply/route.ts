import { NextRequest, NextResponse } from "next/server";
import { updateCommentNeedsReply } from "@/lib/comments";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { needsReply } = body;

    if (needsReply === undefined) {
      return NextResponse.json(
        { error: "needsReply is required" },
        { status: 400 }
      );
    }

    const updatedComment = await updateCommentNeedsReply(id, needsReply);

    if (!updatedComment) {
      return NextResponse.json(
        { error: "Failed to update comment" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment needs reply:", error);
    return NextResponse.json(
      { error: "Failed to update comment needs reply" },
      { status: 500 }
    );
  }
}
