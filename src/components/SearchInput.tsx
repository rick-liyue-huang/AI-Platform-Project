'use client';

import { Search } from 'lucide-react';
import React, {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useState,
} from 'react';
import { Input } from './ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/lib/hooks';
import qs from 'query-string';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get('categoryId');
  const name = searchParams.get('name');

  const [value, setValue] = useState(name ?? '');
  const debouncedVal = useDebounce(value);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setValue((e.target as HTMLInputElement).value);
  };

  useEffect(() => {
    const query = {
      name: debouncedVal,
      categoryId,
    };
    const urlPath = qs.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      {
        skipNull: true,
        skipEmptyString: true,
      }
    );

    router.push(urlPath);
  }, [debouncedVal, router, categoryId]);

  return (
    <div className="relative">
      <Search className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        className="pl-10 bg-primary/10"
        onChange={handleChange}
        value={value}
      />
    </div>
  );
}
