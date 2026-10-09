import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './fonts.css';
import './styles.css';
import './pan.css';
import './growth.css';
import { emptyGrowth, type GrowthData } from './growth';

const root = document.getElementById('root')!;
let initialGrowth: GrowthData = emptyGrowth;
try {
  const raw = document.getElementById('pan-bootstrap')?.textContent;
  if (raw) initialGrowth = JSON.parse(raw);
} catch {
  /* The API can load public content after hydration. */
}
const app = (
  <StrictMode>
    <BrowserRouter>
      <App initialGrowth={initialGrowth} />
    </BrowserRouter>
  </StrictMode>
);
if (root.innerHTML.trim() && !root.innerHTML.includes('<!--app-html-->')) hydrateRoot(root, app);
else createRoot(root).render(app);
