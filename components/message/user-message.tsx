import React from 'react'

type UserMessageProps = {
  message: string
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="mt-6 flex min-h-10 w-full items-center space-x-1">
      <div className="flex-1 break-words text-xl">{message}</div>
    </div>
  )
}
