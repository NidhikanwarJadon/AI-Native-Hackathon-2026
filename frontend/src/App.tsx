import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routers/routes';

// Feature module routes are added to src/routers/routeList.ts as they land —
// this shell stays the same, it just renders whatever routes exist.
function App() {
  const element = useRoutes(routes);
  return <Suspense fallback={null}>{element}</Suspense>;
}

export default App;
