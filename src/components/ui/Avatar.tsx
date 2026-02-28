interface AvatarProps {
  name: string;
}

export default function Avatar({ name }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-elevated)] text-xs font-semibold">{initials}</div>;
}
