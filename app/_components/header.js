'use client'
import Link from "next/link";
import { IoIosMenu } from "react-icons/io";

import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [navItems, setNavItems] = useState();
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/nav-items.json');
        const data = await response.json();
        setNavItems(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchItems();
  }, [])

  return (
    <>
      <header className="container my-6 flex justify-between px-4">
        <h1 className="text-4xl">
          <Link href={"/"}>WILLIAM KHINE</Link>
        </h1>
        <button className="sm:hidden" onClick={() => { setIsMenuExpanded(!isMenuExpanded) }}>
          <IoIosMenu size={"2rem"} />
        </button>
        <nav className="my-auto hidden gap-4 sm:flex">
          {navItems && navItems.map(navItem => {
            return (
              <Link key={navItem.id} href={navItem.link}>
                {navItem.item}
              </Link>
            )
          })}
        </nav>
      </header>
      {isMenuExpanded && (
        <nav className="container flex flex-col text-center absolute">
          {navItems && navItems.map(navItem => {
            return (
              <Link key={navItem.id} href={navItem.link} className="text-xl py-2 w-full border-b">
                {navItem.item}
              </Link>
            )
          })}
        </nav>
      )}
    </>
  );
}
