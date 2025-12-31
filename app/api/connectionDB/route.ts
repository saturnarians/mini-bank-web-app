import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        await prisma.$runCommandRaw({ ping:1 })

        return NextResponse.json(
        {
            status: "ok",
            db: " Connected",
            timeStamp: new Date().toISOString(),
        },
        {status: 200}
    )
    } catch( error ){
        console.error(" DB Health check Failed ", error );
        return NextResponse.json(
            {
                status: "Error",
                db: " Not Connected",
                timeStamp: new Date().toISOString(),
            },
            {status: 500}
        )
    }
}