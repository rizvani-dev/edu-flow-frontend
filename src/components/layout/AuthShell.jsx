import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import './appShell.css';

export default function AuthShell({ children }) {
  return (
    <div className="app-shell app-shell--auth">
      <AppHeader />
      <main className="app-shell__content">{children}</main>
      <AppFooter />
    </div>
  );
}
