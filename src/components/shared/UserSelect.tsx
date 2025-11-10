import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { ChevronDown, User } from 'lucide-react'
import { cn } from '../../lib/utils'

interface UserOption {
  id: number
  email: string
  name?: string
}

interface UserSelectProps {
  value: number | null
  onChange: (userId: number | null) => void
  projectId?: number
  placeholder?: string
  className?: string
}

export default function UserSelect({
  value,
  onChange,
  projectId,
  placeholder = 'Select user...',
  className
}: UserSelectProps) {
  const [users, setUsers] = useState<UserOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true)

        // If projectId is provided, fetch project members
        // Otherwise, fetch all users (for now, we'll fetch all users)
        const { data, error } = await supabase
          .from('users')
          .select('id, email')
          .order('email')

        if (error) throw error

        setUsers(data || [])
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [projectId])

  const selectedUser = users.find(u => u.id === value)

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <User size={16} className="text-gray-400 flex-shrink-0" />
          <span className={cn(
            'text-sm truncate',
            selectedUser ? 'text-gray-900' : 'text-gray-500'
          )}>
            {selectedUser ? selectedUser.email : placeholder}
          </span>
        </div>
        <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
            ) : (
              <>
                <button
                  onClick={() => {
                    onChange(null)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                >
                  Unassigned
                </button>
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onChange(user.id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-gray-50',
                      value === user.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    )}
                  >
                    {user.email}
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
