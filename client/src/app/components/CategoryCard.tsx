import Link from "next/link";

interface CategoryCardProps {
  name: string;
  description: string;
  route: string;
}

export default function CategoryCard({ name, description, route }: CategoryCardProps) {
  return (
    <Link href={route}>
      <div className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-md transition transform hover:scale-[1.02] cursor-pointer flex flex-col justify-between h-full">
        <div>
          <h2 className="text-xl font-semibold mb-2">{name}</h2>
          <p className="text-zinc-400 text-sm">{description}</p>
        </div>
        <div className="mt-4 text-right text-red-500 text-sm">→</div>
      </div>
    </Link>
  );
}
