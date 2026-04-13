import type React from "react";
import { PublicHeader } from "./Header/PublicHeader";
import { PublicFooter } from "./Footer/PublicFooter";

interface PublicLayoutProps {
  children: React.ReactNode;
  headerTransparentOnTop?: boolean;
}

export default function PublicLayout({
  children,
  headerTransparentOnTop = false,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader transparentOnTop={headerTransparentOnTop} />
      <main className="min-w-0">{children}</main>
      <PublicFooter />
    </div>
  );
}

