import { Route, Routes } from 'react-router-dom';

import { DailyPage } from '../features/daily';
import { RecoveryPage } from '../features/home';
import { LabIndexRoute, LabLevelRoute, ProductHomeRoute, TutorialRoute } from './ProductRoutes';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<ProductHomeRoute />} />
      <Route path="/daily" element={<DailyPage />} />
      <Route path="/tutorial" element={<TutorialRoute />} />
      <Route path="/lab" element={<LabIndexRoute />} />
      <Route path="/lab/:levelId" element={<LabLevelRoute />} />
      <Route path="*" element={<RecoveryPage />} />
    </Routes>
  );
}
