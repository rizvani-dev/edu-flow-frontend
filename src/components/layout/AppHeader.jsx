import logo from '../../assets/logo.png';
import './appShell.css';

export default function AppHeader({
  title = 'EduFlow',
  subtitle = 'School operations, messaging, and analytics in one place.',
}) {
  return (
    <header className="app-shell__header">
      <div className="app-shell__brand">
        <img src={logo} alt="EduFlow" />
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
