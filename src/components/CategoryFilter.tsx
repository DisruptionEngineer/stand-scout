import { Category } from '../data/types';
import {
  Apple, Egg, Droplets, CakeSlice, Milk, Drumstick,
  Flower2, Palette, Flame, Snowflake, CookingPot, MoreHorizontal,
} from 'lucide-react';

const categoryIcons: Record<Category, React.ComponentType<{ className?: string }>> = {
  [Category.Produce]: Apple,
  [Category.Eggs]: Egg,
  [Category.Honey]: Droplets,
  [Category.BakedGoods]: CakeSlice,
  [Category.Dairy]: Milk,
  [Category.Meat]: Drumstick,
  [Category.Flowers]: Flower2,
  [Category.Crafts]: Palette,
  [Category.Firewood]: Flame,
  [Category.Seasonal]: Snowflake,
  [Category.Preserves]: CookingPot,
  [Category.Other]: MoreHorizontal,
};

interface CategoryFilterProps {
  selected: Category[];
  onChange: (categories: Category[]) => void;
  compact?: boolean;
}

export default function CategoryFilter({ selected, onChange, compact = false }: CategoryFilterProps) {
  const toggle = (cat: Category) => {
    if (selected.includes(cat)) {
      onChange(selected.filter(c => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-2'}`}>
      {Object.values(Category).map(cat => {
        const Icon = categoryIcons[cat];
        const active = selected.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={`flex items-center gap-1.5 rounded-full border transition-all ${
              compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
            } font-medium ${
              active
                ? 'bg-forest text-white border-forest'
                : 'bg-white text-earth border-sage-dark/40 hover:border-forest hover:text-forest'
            }`}
          >
            <Icon className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            {cat}
          </button>
        );
      })}
    </div>
  );
}

export { categoryIcons };
