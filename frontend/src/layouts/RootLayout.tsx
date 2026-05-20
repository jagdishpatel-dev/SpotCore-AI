import { Outlet } from 'react-router-dom';
import AppChrome from '$lib/components/AppChrome';
import AppFooter from '$lib/components/AppFooter';

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-geoscorer-bg text-geoscorer-text">
      <AppChrome />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
