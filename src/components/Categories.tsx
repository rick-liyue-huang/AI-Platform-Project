'use client';

import { cn } from '@/lib/utils';
import { Category } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import React from 'react';

interface Props {
  data: Category[];
}

export default function Categories({ data }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get('categoryId');

  const handleSelect = (id: string | undefined) => {
    const query = {
      categoryId: id,
    };

    const urlPath = queryString.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      {
        skipEmptyString: true,
        skipNull: true,
      }
    );
    router.push(urlPath);
  };

  return (
    <div className="w-full overflow-x-auto space-x-2 flex p-1">
      <button
        className={cn(
          `
      flex items-center text-center text-xs md:text-sm px-2 md:px-4 py-2 md:py-3 rounded-md bg-primary/10 hover:opacity-75 transition
    `,
          !categoryId ? 'bg-primary/25' : 'bg-primary/10'
        )}
        onClick={() => handleSelect(undefined)}
      >
        Newest
      </button>
      {data.map((item) => (
        <button
          key={item.id}
          className={cn(
            `
      flex items-center text-center text-xs md:text-sm px-2 md:px-4 py-2 md:py-3 rounded-md bg-primary/10 hover:opacity-75 transition
    `,
            item.id === categoryId ? 'bg-primary/25' : 'bg-primary/10'
          )}
          onClick={() => handleSelect(item.id)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
