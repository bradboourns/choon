import { Search } from 'lucide-react';
import Input from './Input';

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({ placeholder = 'Search events, artists, venues' }: SearchBarProps) {
  return (
    <label className="relative block w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" aria-hidden />
      <Input placeholder={placeholder} className="pl-10" aria-label={placeholder} />
    </label>
  );
}
