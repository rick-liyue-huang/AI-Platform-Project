import prismaDB from '@/lib/prisma-db';
import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// connect with db
export async function PATCH(
  req: Request,
  { params }: { params: { figureId: string } }
) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body; // match with zodResolver

    // check the params firstly
    if (!params.figureId) {
      return new NextResponse('FigureId is required, ', { status: 400 });
    }

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
    const figure = await prismaDB.figure.update({
      where: {
        id: params.figureId,
      },
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
    console.log('[Figure patch]: ', err);
    return new NextResponse('Internal Error: ', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { figureId: string } }
) {
  try {
    const { userId } = auth();

    // HAVE NOT LOGIN
    if (!userId) {
      return new NextResponse('Unauthorized, ', { status: 401 });
    }

    const figure = await prismaDB.figure.delete({
      where: {
        userId,
        id: params.figureId,
      },
    });
    return NextResponse.json(figure);
  } catch (err) {
    console.log('[Figure delete], ', err);
    return new NextResponse('Internal Error, ', { status: 500 });
  }
}
