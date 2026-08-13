import { Route, Routes } from 'react-router-dom';

import { DailyPage } from '../features/daily';
import { HomePage, RecoveryPage } from '../features/home';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/daily" element={<DailyPage />} />
      <Route path="*" element={<RecoveryPage />} />
    </Routes>
  );
}
