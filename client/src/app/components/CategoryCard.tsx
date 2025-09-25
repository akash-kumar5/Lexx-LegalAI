import Link from "next/link";

interface CategoryCardProps {
  name: string;
  description: string;
  route: string;
}

export default function CategoryCard({ name, description, route }: CategoryCardProps) {
  return (
    <Link href={route}>
      <div
        className={`
          p-6 rounded-xl shadow-md cursor-pointer flex flex-col justify-between h-full
          border transition transform hover:scale-[1.02]
          bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-900
          dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-100
        `}
      >
        <div>
          <h2 className="text-xl font-semibold mb-2">{name}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
        <div className="mt-4 text-right text-red-600 dark:text-red-500 text-sm">→</div>
      </div>
    </Link>
  );
}
