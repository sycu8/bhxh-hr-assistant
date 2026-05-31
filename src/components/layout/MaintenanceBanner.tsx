export function MaintenanceBanner({ message }: { message: string | null }) {
  const text = message?.trim();
  if (!text) return null;
  return (
    <div
      role="status"
      className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-center text-sm leading-snug text-amber-950"
    >
      {text}
    </div>
  );
}
