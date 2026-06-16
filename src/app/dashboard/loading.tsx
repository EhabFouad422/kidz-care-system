export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1,2].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl" />)}
      </div>
    </div>
  )
}
