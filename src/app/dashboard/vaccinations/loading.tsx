export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-40 bg-slate-200 rounded-xl" />
      <div className="space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}
      </div>
    </div>
  )
}
