import SearchInput from '@/components/SearchInput';
import prismaDB from '@/lib/prisma-db';
import Categories from '@/components/Categories';
import FigureList from '@/components/FigureList';

interface Props {
  searchParams: {
    categoryId: string;
    name: string;
  };
}

export default async function Home({
  searchParams: { categoryId, name },
}: Props) {
  const categories = await prismaDB.category.findMany();

  const data = await prismaDB.figure.findMany({
    where: {
      categoryId: categoryId,
      name: {
        search: name,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  return (
    <div className="h-full p-4 space-y-4">
      <SearchInput />
      <Categories data={categories} />
      <FigureList data={data} />
    </div>
  );
}
