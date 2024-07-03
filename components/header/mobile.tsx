'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import type { LinkDef } from '../ui/types'
import { cn } from '../ui/util'

import Logo from '../logo'
import MenuToggleButton from '../commerce/mobile-menu-toggle-button'
import NavMenu from '../commerce/mobile-nav-menu'
import HistoryContainer from '../history/history-container'
import { ModeToggle } from '../mode-toggle'

const bagClx = 'mt-4 mb-8 border-none py-0 px-4 w-full ' +
  'sm:min-w-[350px] sm:max-w-[500px] sm:mx-auto min-h-[60vh] max-h-[70vh] ' +
  'sm:animate-in sm:zoom-in-90 '

const MobileHeader: React.FC<{
  currentAs: string | undefined
  links: LinkDef[]
  className?: string,
  setChatbotOpen: (open: boolean) => void,
}> = ({
  currentAs,
  links,
  className = '',
  setChatbotOpen,
}) => {
    const [menuState, setMenuState] = useState<'closed' | 'nav' | 'login' | 'bag'>('closed')
    const [bagDrawerOpen, setBagDrawerOpen] = useState<boolean>(false)
    const router = useRouter()

    const menuOpen = () => menuState !== 'closed'
    const onLoginChanged = (token: string) => {
      if (!!token) setMenuState('nav')
    }

    const setMenuOpen = (open: boolean) => {
      if (!open) {
        setMenuState('closed')
      } else {
        setMenuState('nav')
      }
    }

    const openBag = () => {
      if (menuOpen()) {
        setMenuState('bag')
      } else {
        setBagDrawerOpen(true)
      }
    }

    const handleCheckout = () => {
      setMenuState('closed')
      setBagDrawerOpen(false)
      router.push('/checkout')
    }

    useEffect(() => {
      // Can extend logic here if required
    }, [])

    return (
      <>
        <header className={cn(
          `bg-background fixed z-header top-0 left-0 w-full ${menuOpen() ? 'hidden' : 'block'}`,
          className
        )}>
          <div className='w-full h-full flex flex-row justify-between items-center font-bold pr-5'>
            <Logo href='/' size='md' outerClx={'p-6 h-full'} variant='text-only' />
            {menuOpen() && (
              <div className={'absolute left-0 top-0 bottom-0 right-0 pl-8 ' +
                'flex flex-row ' +
                'bg-background animate-mobile-menu-open'
              }>
              </div>
            )}
            <div className='flex gap-0 flex-row'>
              <ModeToggle />
              <HistoryContainer location="header" />
              <MenuToggleButton className='text-foreground' open={menuOpen()} setOpen={setMenuOpen} />
            </div>
          </div>
        </header>
        {menuOpen() && (
          <div className={
            'fixed top-0 left-0 w-full h-full ' +
            'flex flex-column bg-background z-10 animate-mobile-menu-open'
          }>
            <NavMenu
              currentAs={currentAs}
              links={links}
              className='sm:animate-in sm:zoom-in-90 w-full'
              commonItemClx='px-0 text-xl h-16 justify-start'
              setMenuState={setMenuState}
              setChatbotOpen={setChatbotOpen}
              setMenuOpen={setMenuOpen}
            />
          </div>
        )}
      </>
    )
  }

export default MobileHeader