import { Route, Routes } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import AnalyzePage from './pages/AnalyzePage';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="analyze" element={<AnalyzePage />} />
        <Route path="report" element={<ReportPage />} />
      </Route>
    </Routes>
  );
}
