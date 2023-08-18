import prismaDB from '@/lib/prisma-db';
import React from 'react';
import FigureForm from './components/FigureForm';
import { auth, redirectToSignIn } from '@clerk/nextjs';

interface Props {
  params: {
    figureId: string;
  };
}

export default async function FigureIdPage({ params: { figureId } }: Props) {
  // TODO

  // confirm the userId who create the figure
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const figure = await prismaDB.figure.findUnique({
    where: {
      id: figureId,
      userId,
    },
  });

  const categories = await prismaDB.category.findMany();

  return <FigureForm initialData={figure} categories={categories} />;
}
