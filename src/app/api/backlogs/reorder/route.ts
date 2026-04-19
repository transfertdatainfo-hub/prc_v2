//src\app\api\backlogs\reorder\route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER_ID = "user-1";

export async function POST(req: NextRequest) {
  const { items } = await req.json(); // [{ id, position }]

  // Vérifier que tous les items appartiennent à l'utilisateur
  for (const item of items) {
    const existing = await prisma.backlog.findFirst({
      where: { id: item.id, userId: DEFAULT_USER_ID },
    });
    if (!existing) {
      return NextResponse.json(
        { error: `Item ${item.id} non autorisé` },
        { status: 401 }
      );
    }
  }

  await prisma.$transaction(
    items.map((item: { id: string; position: number }) =>
      prisma.backlog.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    )
  );

  return NextResponse.json({ success: true });
}