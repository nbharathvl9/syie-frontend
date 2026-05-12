"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

/**
 * LayoutShell — client wrapper that conditionally renders the Navbar.
 * Extracted from layout.js so that the root layout can remain a Server
 * Component and export Next.js `metadata`.
 */
export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const noNavRoutes = ["/login", "/register"];
  const showNavbar = !noNavRoutes.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
}
