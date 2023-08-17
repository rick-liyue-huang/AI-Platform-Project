'use client';

import { Category, Figure } from '@prisma/client';
import React from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Props {
  initialData: Figure | null;
  categories: Category[];
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name must be at least 1 character long',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 character long',
  }),
  instructions: z.string().min(100, {
    message: 'Instructions must be at least 100 character long',
  }),
  seed: z.string().min(100, {
    message: 'Seed must be at least 100 character long',
  }),
  src: z.string().min(1, {
    message: 'Source must be at least 1 character long',
  }),
  categoryId: z.string().min(1, {
    message: 'Category must be at least 1 character long',
  }),
});

export default function FigureForm({ initialData, categories }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      instructions: '',
      seed: '',
      src: '',
      categoryId: undefined,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return <div>FigureForm</div>;
}
