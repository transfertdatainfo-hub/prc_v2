// src/app/api/backlogs/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_USER_ID = "user-1";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const backlog = await prisma.backlog.findFirst({
    where: { id: params.id, userId: DEFAULT_USER_ID },
  });

  if (!backlog) {
    return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  }

  return NextResponse.json(backlog);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { title, description, parentId, position, type, highlightColor, backlogType } = body;

  const existing = await prisma.backlog.findFirst({
    where: { id: params.id, userId: DEFAULT_USER_ID },
  });

  if (!existing) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const backlog = await prisma.backlog.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId }),
        ...(position !== undefined && { position }),
        ...(type !== undefined && { type }),
        ...(highlightColor !== undefined && { highlightColor }),
        ...(backlogType !== undefined && { backlogType }),
      },
    });
    return NextResponse.json(backlog);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await prisma.backlog.findFirst({
    where: { id: params.id, userId: DEFAULT_USER_ID },
  });

  if (!existing) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const children = await prisma.backlog.findMany({
    where: { parentId: params.id },
  });

  if (children.length > 0) {
    return NextResponse.json(
      { error: "Impossible de supprimer un nœud qui contient des sous-éléments" },
      { status: 400 }
    );
  }

  await prisma.backlog.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}