import { NavLink } from 'react-router';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/experiments', label: 'Experiments' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/events', label: 'Events' },
  { to: '/metrics', label: 'Metrics' },
  { to: '/settings', label: 'Settings' }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark">AB</div>
        <div>
          <strong>Experiment Bank</strong>
          <span>Risk-safe rollout UI</span>
        </div>
      </div>
      <nav aria-label="Main navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
