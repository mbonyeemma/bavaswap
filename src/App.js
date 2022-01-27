import logo from './logo.svg';
import './App.css';
import Header from './components/Header'
import Index from './pages/Index'
import { ToastProvider, useToasts } from 'react-toast-notifications';

function App() {
  return (
    <div className="App">
                <ToastProvider>

            <Index />
            </ToastProvider>

    </div>
  );
}

export default App;
