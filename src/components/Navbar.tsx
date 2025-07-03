'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Button = ({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) => (
  <Link
    href={href}
    className={`cursor-pointer py-4 font-extralight rounded-sm transition-colors text-xs px-12 ${
      active
        ? 'text-white bg-[#251938] shadow-lg shadow-purple-500/50'
        : 'text-gray-200 hover:text-white  bg-[#251938]/30 hover:bg-[#251938]/90 hover:scale-105 transition-all duration-300'
    }`}
  >
    {children}
  </Link>
);

const Navbar = () => {
  const pathname = usePathname();
  return (
    <nav className='fixed top-0 left-0 w-full py-24 sm:py-24 sm:px-24 z-50 '>
      <div className='flex justify-center sm:justify-start px-8 gap-8'>
        <Button href='/' active={pathname === '/'}>
          Assignment
        </Button>
        <Button href='/experimental' active={pathname === '/experimental'}>
          Try this out!
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
