import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="workspace" id="main-content" tabIndex={-1}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
