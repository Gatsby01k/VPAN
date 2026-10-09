import { Route, Routes } from 'react-router-dom';
import { LocaleProvider } from './locale';
import { Footer, Header, RouteEffects } from './components/Layout';
import Home from './pages/Home';
import {
  AboutPage,
  CountryPage,
  LegalPage,
  MarketsPage,
  NotFoundPage,
  PartnerPage,
} from './pages/Explore';
import ApplyPage from './pages/Apply';
import AdminPage from './pages/Admin';

function Pages() {
  return (
    <>
      <Header />
      <RouteEffects />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/affiliates" element={<PartnerPage roleId="affiliate" />} />
          <Route path="/teams" element={<PartnerPage roleId="team" />} />
          <Route path="/payment-partners" element={<PartnerPage roleId="provider" />} />
          <Route path="/merchants" element={<PartnerPage roleId="merchant" />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/markets/:slug" element={<CountryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <Pages />
    </LocaleProvider>
  );
}
