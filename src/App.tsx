import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Route, Routes, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  return (
    <>
      <Header />
      <RouteEffects />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          tabIndex={-1}
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
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
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <MotionConfig reducedMotion="user">
        <Pages />
      </MotionConfig>
    </LocaleProvider>
  );
}
