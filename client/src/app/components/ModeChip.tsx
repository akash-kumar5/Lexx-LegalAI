const ModeChip: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={[
      // base
      "px-3 py-1 rounded-full text-sm transition-colors",
      "border focus:outline-none focus:ring-2 focus:ring-offset-1",
      // light
      active
        ? "bg-zinc-900 text-white border-zinc-900 focus:ring-zinc-400"
        : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100 focus:ring-zinc-300",
      // dark
      "dark:focus:ring-stone-700 dark:focus:ring-offset-0",
      active
        ? "dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
        : "dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800",
    ].join(" ")}
  >
    {label}
  </button>
);

export default ModeChip