import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { LocaleProvider } from './locale';
import { Header, Footer, RouteEffects } from './components/NetworkLayout';
import {
  Home,
  Network,
  Industries,
  Markets,
  Country,
  About,
  Contact,
  Legal,
  NotFound,
  Knowledge,
} from './pages/NetworkPages';
import ConnectionEngine from './pages/ConnectionEngine';
import DealDesk from './pages/DealDesk';
import { GrowthProvider, type GrowthData } from './growth';
function LegacyRoute({ offer = false }: { offer?: boolean }) {
  const location = useLocation();
  return <Navigate replace to={(offer ? '/join' : '/find-a-partner') + location.search} />;
}
function Pages() {
  const location = useLocation();
  return (
    <>
      <Header />
      <RouteEffects />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/network" element={<Network />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/markets/:slug" element={<Country />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/find-a-partner"
            element={<ConnectionEngine key={'need' + location.pathname} />}
          />
          <Route path="/join" element={<ConnectionEngine key={'offer' + location.pathname} />} />
          <Route path="/privacy" element={<Legal type="privacy" />} />
          <Route path="/terms" element={<Legal type="terms" />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/knowledge/:slug" element={<Knowledge />} />
          <Route path="/admin" element={<DealDesk />} />
          <Route path="/affiliates" element={<LegacyRoute offer />} />
          <Route path="/teams" element={<LegacyRoute offer />} />
          <Route path="/payment-partners" element={<LegacyRoute offer />} />
          <Route path="/merchants" element={<LegacyRoute />} />
          <Route path="/apply" element={<LegacyApply />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
function LegacyApply() {
  const { search } = useLocation();
  const role = new URLSearchParams(search).get('role');
  return <LegacyRoute offer={role !== null && role !== 'merchant'} />;
}
export default function App({ initialGrowth }: { initialGrowth?: GrowthData }) {
  return (
    <LocaleProvider initialLanguage={initialGrowth?.language}>
      <GrowthProvider initial={initialGrowth}>
        <Pages />
      </GrowthProvider>
    </LocaleProvider>
  );
}
