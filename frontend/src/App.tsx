import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routers/routes';

const App = () => {
  const element = useRoutes(routes);
  return <Suspense fallback={null}>{element}</Suspense>;
};

export default App;
