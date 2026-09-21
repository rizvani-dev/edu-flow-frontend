import './pageLoader.css';

export default function PageLoader({ label = 'Loading your workspace...' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader__logo" aria-hidden="true">
        <span>Edu</span>
        <strong>Flow</strong>
      </div>
      <p>{label}</p>
    </div>
  );
}
