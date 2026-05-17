export default function Loading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-24 bg-white border rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-28 bg-white border rounded-xl" />
        <div className="h-28 bg-white border rounded-xl" />
        <div className="h-28 bg-white border rounded-xl" />
        <div className="h-28 bg-white border rounded-xl" />
      </div>
      <div className="h-72 bg-white border rounded-xl" />
    </div>
  );
}
