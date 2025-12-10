import { useQuery } from '@tanstack/react-query'
import { User } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'

interface OwnerCellProps {
  assignedTo: number | null
}

export default function OwnerCell({ assignedTo }: OwnerCellProps) {
  const { data: user } = useQuery({
    queryKey: ['user', assignedTo],
    queryFn: async () => {
      if (!assignedTo) return null
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', assignedTo)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!assignedTo
  })

  if (!assignedTo || !user) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
          <User className="w-3 h-3" />
        </div>
        <span className="text-xs">Unassigned</span>
      </div>
    )
  }

  // Get initials from name
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-medium">
        {initials}
      </div>
      <span className="text-sm text-slate-900">{user.name || user.email}</span>
    </div>
  )
}
