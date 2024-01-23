import Link from "next/link";
import { IoIosMenu } from "react-icons/io";

export default function Header() {
  return (
    <header className="container mx-auto my-6 flex justify-between px-4">
      <h1 className="text-4xl">
        <Link href={"/"}>WILLIAM KHINE</Link>
      </h1>
      <button className="sm:hidden">
        <IoIosMenu size={"2rem"} />
      </button>
      <nav className="my-auto hidden gap-4 sm:flex">
        <Link href={"/projects"}>Projects</Link>
        <Link href={"/about"}>About</Link>
        <Link href={"/contact"}>Contact</Link>
      </nav>
    </header>
  );
}
