import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sprint = await prisma.sprint.findFirst({
      where: {
        status: "active",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sprint);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
