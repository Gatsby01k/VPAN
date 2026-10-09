import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import type { GrowthData } from './growth';

export function renderPage(url: string, initialGrowth?: GrowthData) {
  return renderToString(
    <MemoryRouter initialEntries={[url]}>
      <App initialGrowth={initialGrowth} />
    </MemoryRouter>,
  );
}
export { pageMeta } from './data';
