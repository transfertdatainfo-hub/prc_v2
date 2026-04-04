// src/app/api/backlogs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER_ID = "user-1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const backlogs = await prisma.backlog.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      ...(type && { type }),
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(backlogs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, type, parentId, description, backlogType } = body;

  if (!title || !type) {
    return NextResponse.json(
      { error: "Titre et type requis" },
      { status: 400 }
    );
  }

  const maxPosition = await prisma.backlog.aggregate({
    where: { userId: DEFAULT_USER_ID, parentId: parentId || null },
    _max: { position: true },
  });

  const backlog = await prisma.backlog.create({
    data: {
      title,
      backlogType: backlogType || "task",
      type,
      description: description || null,
      parentId: parentId || null,
      userId: DEFAULT_USER_ID,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

  return NextResponse.json(backlog);
}