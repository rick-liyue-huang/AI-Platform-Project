'use client';

import { Figure, Message } from '@prisma/client';
import React from 'react';
import ChatHeader from './ChatHeader';

interface Props {
  figure: Figure & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}
export default function ChatClient({ figure }: Props) {
  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader figure={figure} />
    </div>
  );
}
