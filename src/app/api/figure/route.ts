import prismaDB from '@/lib/prisma-db';
import { currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// connect with db
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body; // match with zodResolver

    if (!user || !user.id || !user.firstName) {
      return new NextResponse('Unauthorised ', { status: 401 });
    }

    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      return new NextResponse('Missed required fields, ', { status: 400 });
    }

    // TODO
    const figure = await prismaDB.figure.create({
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed,
      },
    });

    return NextResponse.json(figure);
  } catch (err) {
    console.log('[Figure post]: ', err);
    return new NextResponse('Internal Error: ', { status: 500 });
  }
}
