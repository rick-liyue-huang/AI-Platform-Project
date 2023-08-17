import prismaDB from '@/lib/prisma-db';
import React from 'react';
import FigureForm from './components/FigureForm';

interface Props {
  params: {
    figureId: string;
  };
}

export default async function FigureIdPage({ params: { figureId } }: Props) {
  // TODO

  const figure = await prismaDB.figure.findUnique({
    where: {
      id: figureId,
    },
  });

  const categories = await prismaDB.category.findMany();

  return <FigureForm initialData={figure} categories={categories} />;
}
