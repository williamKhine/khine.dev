import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/app/_components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "William Khine",
  description: "Fullstack Developer in Toronto, Canada",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
