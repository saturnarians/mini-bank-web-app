import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";

export const GET = authorize(
  ["admin", "superadmin"],
  async (req, { session }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") || "pending";
      const limit = parseInt(searchParams.get("limit") || "20");
      const cursor = searchParams.get("cursor") || undefined;

      const transactions = await prisma.transaction.findMany({
        where: {
          approvalStatus: status as any,
        },
        include: {
          account: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        take: limit + 1,
        orderBy: { timestamp: "desc" },
      });

      const hasNextPage = transactions.length > limit;
      const items = hasNextPage ? transactions.slice(0, limit) : transactions;

      return NextResponse.json(
        {
          transactions: items,
          nextCursor: hasNextPage ? items[items.length - 1].id : null,
          hasMore: hasNextPage,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get pending transactions error:", error);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }
  }
);
