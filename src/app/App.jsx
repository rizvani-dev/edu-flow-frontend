import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';
import AppRoutes from './AppRoutes';
import ErrorBoundary from '../components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </ErrorBoundary>
  );
}

export default App;
