import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';

export function PageShell() {
  return (
    <div className="page-shell">
      <NavBar />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
