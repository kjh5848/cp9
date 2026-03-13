import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/infrastructure/clients/prisma";
import { authOptions } from "@/shared/config/auth-options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coupangAccessKey: true, coupangSecretKey: true }
    });

    return NextResponse.json({ 
      coupangAccessKey: user?.coupangAccessKey || "",
      coupangSecretKey: user?.coupangSecretKey || ""
    });

  } catch (error: any) {
    console.error("Error fetching integration settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { coupangAccessKey, coupangSecretKey } = body;

    // TODO: Add more validation here if needed

    // Update the user's Coupang keys
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        coupangAccessKey,
        coupangSecretKey,
      },
    });

    return NextResponse.json({ success: true, message: "API Settings updated successfully" });

  } catch (error: any) {
    console.error("Error updating integration settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
