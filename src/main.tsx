import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './fonts.css';
import './styles.css';
import './editorial-controls.css';
import './growth.css';
import './editorial.css';
import './audit.css';
import './network.css';
import './network-integration.css';
import './evolution.css';
import './commercial-public.css';
import './counterpart-public.css';
import './counterpart-editions.css';
import './counterpart-finishing.css';
import { emptyGrowth, type GrowthData } from './growth';
import { languageFromSearch } from './locale';

const root = document.getElementById('root')!;
let initialGrowth: GrowthData = emptyGrowth;
try {
  const raw = document.getElementById('vladdos-bootstrap')?.textContent;
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
const language = languageFromSearch(window.location.search);
// Static hosts can serve the English fallback document for an unknown Russian URL.
if (document.documentElement.lang === language && root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
