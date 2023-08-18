import React from 'react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface Props {
  src: string;
}

export default function BotAvatar({ src }: Props) {
  return (
    <Avatar className="w-12 h-12">
      <AvatarImage src={src} />
    </Avatar>
  );
}
