//src\app\api\sprints\[id]\items\[itemId]\route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    await prisma.sprintItem.deleteMany({
      where: {
        sprintId: params.id,
        backlogId: params.itemId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
