interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return <div className="fixed right-4 bottom-24 rounded-full bg-[var(--color-elevated)] px-4 py-2 text-sm shadow-[var(--elev-1)] animate-[page-enter_220ms_ease]">{message}</div>;
}
