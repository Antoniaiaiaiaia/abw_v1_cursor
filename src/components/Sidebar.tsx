interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function Sidebar({ selectedCategory, onCategoryChange }: SidebarProps) {
  const categories = [
    { id: 'all', label: 'All Jobs' },
    { id: 'dev', label: 'Dev Job' },
    { id: 'non-dev', label: 'Non Dev Job' },
    { id: 'intern', label: 'Intern' },
  ];

  return (
    <aside className="w-48 shrink-0 border-r border-gray-200">
      <div className="sticky top-0 py-8 pr-6">
        <nav className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full px-3 py-2 text-left transition-colors ${
                selectedCategory === category.id
                  ? 'text-[var(--brand)]'
                  : 'text-gray-400 hover:text-[var(--brand)]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
