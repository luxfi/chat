'use client'
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import  Logo  from '../logo'

interface MobileNavHeaderProps {
    setMenuOpen: (open: boolean) => void
}

const MobileNavHeader: React.FC<MobileNavHeaderProps> = ({ setMenuOpen }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <>
            <div className="w-full  text-2xl cursor-pointer">
                <div className='flex justify-between'>
                    <Logo variant='text-only' size='md' outerClx={'p-6 h-full'} />
                    <Plus width={28} height={28} className={
                        'block h-full aspect-square hover:bg-background sm:hover:bg-level-1 active:scale-75 text-foreground will-change-transform transition-transform transition-scale transition-duration-[1500] mt-6 mr-6 ' +
                        (!open ? 'rotate-none' : 'rotate-[135deg] scale-110')
                    } onClick={() => setMenuOpen(false)} />
                </div>
            </div>
        </>
    )
};

export default MobileNavHeader;