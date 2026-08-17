import { NavLink } from 'react-router-dom';
import { signOut } from '../../firebase/auth';

const LINKS = [
  { to: '/paycheck', label: 'Paycheck' },
  { to: '/allocations', label: 'Allocations' },
  { to: '/categories', label: 'Categories' },
  { to: '/subscriptions', label: 'Subscriptions' },
  { to: '/purchases', label: 'Log Purchase' },
  { to: '/summary', label: 'Summary' },
];

export function NavBar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">Budget-Maxxing</span>
      <div className="navbar-links">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </div>
      <button onClick={() => signOut()}>Sign out</button>
    </nav>
  );
}
