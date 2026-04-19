//src\app\api\sprints\[id]\items\route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - récupérer les items d’un sprint
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const items = await prisma.sprintItem.findMany({
      where: { sprintId: params.id },
      include: {
        backlog: true,
      },
      orderBy: { position: "asc" },
    });

    // ✅ IMPORTANT : retourner les backlog
const backlogs = items.map((item: typeof items[number]) => item.backlog);

    return NextResponse.json(backlogs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}


// POST - ajouter un item au sprint
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { backlogId, position } = body;

    const item = await prisma.sprintItem.create({
      data: {
        sprintId: params.id,
        backlogId,
        position,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur ajout" }, { status: 500 });
  }
}
