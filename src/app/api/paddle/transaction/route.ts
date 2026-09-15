import { NextRequest, NextResponse } from "next/server";
import { fulfillPaddleTransaction } from "@/lib/paddle";
import { getAccessToken } from "@/lib/purchases";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id?.startsWith("txn_")) {
    return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
  }

  try {
    const result = await fulfillPaddleTransaction(id);
    if (!result.status) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: result.status,
      paid: result.ok,
      email: result.email || null,
      type: result.type || null,
      novelSlug: result.novelSlug || null,
      token: result.email ? getAccessToken(result.email) : null,
    });
  } catch (err) {
    console.error("Transaction status error:", err);
    return NextResponse.json({ error: "Failed to load transaction" }, { status: 500 });
  }
}
