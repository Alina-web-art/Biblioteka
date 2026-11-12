import { HashRouter, Routes, Route } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import RequestPage from './pages/RequestPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/request" element={<RequestPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
