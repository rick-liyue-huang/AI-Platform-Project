'use client';

import { Figure, Message } from '@prisma/client';
import React, { FormEvent, useState } from 'react';
import ChatHeader from './ChatHeader';
import { useRouter } from 'next/navigation';
import { useCompletion } from 'ai/react';
import ChatForm from './ChatForm';
import ChatMessages from './ChatMessages';
import { ChatMessageProps } from './ChatMessage';

interface Props {
  figure: Figure & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}
export default function ChatClient({ figure }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(figure.messages);

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${figure.id}`,
      onFinish(prompt, completion) {
        const systemMessage: ChatMessageProps = {
          role: 'system',
          content: completion,
        };
        setMessages((current) => [...current, systemMessage]);
        setInput('');

        router.refresh();
      },
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const userMessage: ChatMessageProps = {
      role: 'user',
      content: input,
    };
    setMessages((current) => [...current, userMessage]);
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2">
      <ChatHeader figure={figure} />
      <ChatMessages figure={figure} isLoading={isLoading} messages={messages} />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
