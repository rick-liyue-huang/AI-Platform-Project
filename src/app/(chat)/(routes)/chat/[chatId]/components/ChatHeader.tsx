'use client';

import React from 'react';
import { Figure, Message } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  Edit,
  MessageSquare,
  MoreVertical,
  Trash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import BotAvatar from '@/components/BotAvatar';
import { auth, useUser } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface Props {
  figure: Figure & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}
export default function ChatHeader({ figure }: Props) {
  const router = useRouter();
  const { user } = useUser();
  // const {userId} = auth() // can be replaced with this
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/figure/${figure.id}`);

      toast({
        description: 'delete figure success',
      });
      router.refresh(); // refresh the server component
      router.push('/');
    } catch (err) {
      toast({
        description: 'Delete figure went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex w-full justify-between items-center border-b border-primary/10 pb-4">
      <div className="flex gap-x-4 items-center ">
        <Button size="icon" variant={'ghost'} onClick={() => router.back()}>
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <BotAvatar src={figure.src} />
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <p className="font-bold">{figure.name}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3 mr-1" />
              {figure._count.messages}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Created by {figure.userName}
          </p>
        </div>
      </div>
      {user?.id === figure.userId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'secondary'}>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/figures/${figure.id}`)}
            >
              <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash className="w-4 h-4 mr-2 text-muted-foreground" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
