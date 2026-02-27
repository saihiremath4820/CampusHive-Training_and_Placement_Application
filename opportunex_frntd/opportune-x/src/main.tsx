import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import App from './App';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';

import { SocketProvider } from './context/SocketContext';
import Toast from './components/admin/shared/Toast';

window.onerror = function (msg, _url, lineNo, columnNo, _error) {
    const div = document.createElement('div');
    div.style.color = 'red';
    div.style.padding = '20px';
    div.style.background = '#fff';
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.zIndex = '9999';
    div.innerText = 'Runtime Error: ' + msg + '\nLine: ' + lineNo + '\nColumn: ' + columnNo;
    document.body.appendChild(div);
    return false;
};

const root = document.getElementById('root');
if (root) {
    createRoot(root).render(
        <StrictMode>
            <SocketProvider>
                <BrowserRouter>
                    <Toast />
                    <Routes>
                        <Route path="/" element={<App />} />
                        <Route path="/forgot-password" element={<ForgotPassword onSwitch={() => { }} />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                    </Routes>
                </BrowserRouter>
            </SocketProvider>
        </StrictMode>
    );
}
