import './pageLoader.css';

export default function PageLoader({ label = 'Loading your workspace...' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader__orb" />
      <p>{label}</p>
    </div>
  );
}
