import logo from './logo.svg';
import './App.css';
import Header from './components/Header'
import Index from './pages/Index'
import SwiftUI from './pages/SwiftUI'
import { ToastProvider, useToasts } from 'react-toast-notifications';

function App() {
  return (
    <div className="App">
                <ToastProvider>

            <SwiftUI />
            </ToastProvider>

    </div>
  );
}

export default App;
