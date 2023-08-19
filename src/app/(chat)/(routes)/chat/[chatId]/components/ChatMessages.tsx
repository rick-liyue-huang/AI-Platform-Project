'use client';

import { Figure, Message } from '@prisma/client';
import React, { ElementRef, useEffect, useRef, useState } from 'react';
import ChatMessage, { ChatMessageProps } from './ChatMessage';

interface Props {
  isLoading: boolean;
  figure: Figure;
  messages: ChatMessageProps[];
}

export default function ChatMessages({ isLoading, figure, messages }: Props) {
  const [fakeLoading, setFakeLoading] = useState<boolean>(
    messages.length === 0 ? true : false
  );
  const scrollRef = useRef<ElementRef<'div'>>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFakeLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto pr-4">
      <ChatMessage
        isLoading={fakeLoading}
        src={figure.src}
        role={'system'}
        content={`Hello, I'm ${figure.name}, ${figure.description} `}
      />
      {messages.map((m) => (
        <ChatMessage
          role={m.role}
          key={m.content}
          content={m.content}
          src={figure.src}
        />
      ))}
      {isLoading && <ChatMessage role="system" src={figure.src} isLoading />}
      <div ref={scrollRef} />
    </div>
  );
}
