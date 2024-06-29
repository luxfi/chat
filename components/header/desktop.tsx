import React from 'react'

import { cn } from '../ui/util'
import Logo from '../logo'


import DesktopNav from '../commerce/desktop-nav-menu'


import type { LinkDef } from '../ui/types'
import { ModeToggle } from '../mode-toggle'
import HistoryContainer from '../history/history-container'

const DesktopHeader: React.FC<{
  currentAs: string | undefined
  links: LinkDef[]
  className?: string
}> = ({
  currentAs,
  links,
  className = ''
}) => {

    // TODO move 13px into a size class and configure twMerge to recognize say, 'text-size-nav' 
    // (vs be beat out by 'text-color-nav')
    return (
      <header className={cn('fixed w-full p-1 md:p-2 flex justify-between h-[80px] pl-[24px] items-center z-10 backdrop-blur md:backdrop-blur-none bg-background/80 md:bg-transparent', className)} >
        {/* md or larger */}
        <div className={
          'flex flex-row h-[80px] items-center justify-between ' +
          'mx-[24px] w-full max-w-screen'
        }>
          <Logo size='md' href='/' outerClx='hidden lg:flex' key='two' variant='text-only' />
          <Logo size='sm' href='/' outerClx='hidden md:flex lg:hidden' key='one' variant='text-only' />
          {/* md or larger */}
          <div className='flex w-full gap-4 items-center justify-between lg:ml-20'>
            <DesktopNav links={links} />
            <div className="flex gap-0.5">
              <ModeToggle />
              <HistoryContainer location="header" />
            </div>
          </div>
        </div>
      </header>
    )
  }

export default DesktopHeader

