import prismaDB from '@/lib/prisma-db';
import { auth, redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import React from 'react';
import ChatClient from './components/ChatClient';

interface Props {
  params: {
    chatId: string;
  };
}

export default async function ChatPage({ params: { chatId } }: Props) {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const figure = await prismaDB.figure.findUnique({
    where: {
      id: chatId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
        where: {
          userId,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  if (!figure) {
    return redirect('/');
  }

  return <ChatClient figure={figure} />;
}
