import { useMemo, useState } from 'react';
import { FaBars, FaBell, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import './dashboardShell.css';

export default function DashboardShell({
  children,
  title = 'Edu Flow',
  subtitle = 'School workspace',
  roleLabel = 'Dashboard',
  logoUrl,
  userName,
  userRole,
  navItems = [],
  activeItem,
  onNavChange,
  notificationCount = 0,
  onNotifications,
  onLogout,
  rightSlot,
}) {
  const [open, setOpen] = useState(false);
  const brandLogo = logoUrl || logo;

  const activeLabel = useMemo(
    () => navItems.find((item) => item.id === activeItem)?.label || roleLabel,
    [activeItem, navItems, roleLabel]
  );

  const handleNav = (id) => {
    onNavChange?.(id);
    setOpen(false);
  };

  return (
    <div className="edu-shell">
      <aside className={`edu-sidebar ${open ? 'is-open' : ''}`} aria-label={`${roleLabel} navigation`}>
        <div className="edu-sidebar__brand">
          <img
            src={brandLogo}
            alt={`${title} logo`}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = logo;
            }}
          />
          <div>
            <span>{roleLabel}</span>
            <strong>{title}</strong>
          </div>
          <button type="button" className="edu-sidebar__close" onClick={() => setOpen(false)} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="edu-sidebar__nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={`edu-sidebar__item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
              >
                {Icon ? <Icon /> : null}
                <span>{item.label}</span>
                {item.badge ? <small>{item.badge}</small> : null}
              </button>
            );
          })}
        </nav>

        {onLogout ? (
          <div className="edu-sidebar__footer">
            <button type="button" className="edu-sidebar__logout" onClick={onLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        ) : null}
      </aside>

      {open ? <button type="button" className="edu-shell__scrim" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}

      <div className="edu-shell__body">
        <header className="edu-topbar">
          <button type="button" className="edu-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <FaBars />
          </button>
          <div className="edu-topbar__title">
            <span>{activeLabel}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="edu-topbar__actions">
            {rightSlot}
            {onNotifications ? (
              <button type="button" className="edu-icon-btn" onClick={onNotifications} aria-label="Open notifications">
                <FaBell />
                {notificationCount > 0 ? <small>{notificationCount}</small> : null}
              </button>
            ) : null}
            <div className="edu-user-chip">
              <span>{userName || 'User'}</span>
              <small>{userRole || roleLabel}</small>
            </div>
          </div>
        </header>
        <main className="edu-shell__content">{children}</main>
      </div>
    </div>
  );
}
