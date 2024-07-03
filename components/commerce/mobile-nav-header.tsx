'use client'
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import Logo from '../logo'
import { ModeToggle } from '../mode-toggle'
import HistoryContainer from '../history/history-container'
import MenuToggleButton from '../commerce/mobile-menu-toggle-button'
interface MobileNavHeaderProps {
    setMenuOpen: (open: boolean) => void
}

const MobileNavHeader: React.FC<MobileNavHeaderProps> = ({ setMenuOpen }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [menuState, setMenuState] = useState<'closed' | 'nav' | 'login' | 'bag'>('closed')
    const menuOpen = () => menuState !== 'nav'

    return (
        <>
            <div className="w-full  text-2xl cursor-pointer">
                <div className='flex justify-between'>
                    <Logo variant='text-only' size='md' outerClx={'p-6 h-full'} />
                    <div className="flex gap-0 flex-row items-center pr-5">
                        <ModeToggle />
                        <HistoryContainer location="header" />
                        <MenuToggleButton className='text-foreground' open={menuOpen()} setOpen={setMenuOpen} />
                    </div>
                </div>
            </div>
        </>
    )
};

export default MobileNavHeader;