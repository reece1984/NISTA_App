interface UploadProgressProps {
  uploaded: number
  total: number
  percent: number
}

export default function UploadProgress({ uploaded, total, percent }: UploadProgressProps) {
  return (
    <div className="p-2 border-t border-slate-100 bg-slate-50/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-600">Upload progress</span>
        <span className="text-xs font-bold text-navy">{uploaded} of {total}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
