import SearchInput from '@/components/SearchInput';
import prismaDB from '@/lib/prisma-db';
import Categories from '@/components/Categories';

export default async function Home() {
  const categories = await prismaDB.category.findMany();
  return (
    <div className="h-full p-4 space-y-4">
      <SearchInput />
      <Categories data={categories} />
    </div>
  );
}
