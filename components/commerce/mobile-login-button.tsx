'use client'
import React from 'react'

import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator
} from '../ui/primitives'

import { cn } from '../ui/util'
import { signOut, useAuth, signInWithLux, signInWithHanzo } from '@/lib/auth-client'

const MobileAuthWidget: React.FC<{
  noLogin?: boolean
  className?: string
}> = ({
  noLogin = false,
  className
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  if (!isAuthenticated || !user) {
    if (noLogin) return null
    return (
      <div className="flex items-center py-1 px-1 gap-1">
        <Button
          variant='primary'
          className='text-base font-semibold !min-w-0 self-center flex-1'
          onClick={() => signInWithLux()}
        >
          Sign in with Lux
        </Button>
        <Button
          variant='outline'
          className='text-base font-semibold !min-w-0 self-center flex-1'
          onClick={() => signInWithHanzo()}
        >
          Sign in with Hanzo
        </Button>
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size='icon'
          className={cn(
            'rounded-full text-muted border-2 border-muted bg-level-1 hover:bg-level-2 hover:border-foreground hover:text-foreground uppercase w-8 h-8',
            className
          )}
        >
          {user.name?.[0] || user.email?.[0] || '?'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='bg-level-0'>
        <div className="grid gap-4">
          <div className="space-y-2 truncate">
            {user.name && (
              <h4 className="font-medium leading-none truncate">{user.name}</h4>
            )}
            {user.email && (
              <p className="text-sm opacity-50 truncate">{user.email}</p>
            )}
          </div>
          <Separator />
          <Button variant="outline" onClick={() => signOut()}>
            Logout
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default MobileAuthWidget
