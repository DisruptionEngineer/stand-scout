import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search stands, products, places...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-earth-light" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-sage-dark bg-white text-earth text-sm placeholder:text-earth-light/50 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-light hover:text-earth p-0 border-0 bg-transparent"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
