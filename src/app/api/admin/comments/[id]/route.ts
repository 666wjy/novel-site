import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { deleteComment } from "@/lib/comments";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { id } = await params;
  try {
    await deleteComment(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete comment error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
