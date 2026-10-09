import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './fonts.css';
import './styles.css';
import './pan.css';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
if (root.innerHTML.trim() && !root.innerHTML.includes('<!--app-html-->')) hydrateRoot(root, app);
else createRoot(root).render(app);
