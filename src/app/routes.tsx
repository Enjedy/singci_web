import { createBrowserRouter, Navigate } from "react-router";

// Pages
import Home from './pages/Home';
import CitizenLayout from './pages/citizen/CitizenLayout';
import Welcome from './pages/citizen/Welcome';
import NewReport from './pages/citizen/NewReport';
import History from './pages/citizen/History';
import Profile from './pages/citizen/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageReports from './pages/admin/ManageReports';
import AdminMap from './pages/admin/AdminMap';
import AdminMessages from './pages/admin/AdminMessages';
import AdminTeams from './pages/admin/AdminTeams';
import AdminQuoteAgent from './pages/admin/AdminQuoteAgent';
import AdminSettings from './pages/admin/AdminSettings';

// Mock components for unimplemented routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <h2 className="text-xl text-slate-400 font-medium">Page {title} (en construction)</h2>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/citizen",
    Component: CitizenLayout,
    children: [
      { index: true, Component: () => <Navigate to="/citizen/home" replace /> },
      { path: "home", Component: Welcome },
      { path: "new", Component: NewReport },
      { path: "history", Component: History },
      { path: "map", Component: () => <Placeholder title="Carte des signalements" /> },
      { path: "profile", Component: Profile },
      { path: "alerts", Component: () => <Placeholder title="Alertes Urgentes" /> },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminHome },
      { path: "dashboard", Component: AdminDashboard },
      { path: "reports", Component: ManageReports },
      { path: "map", Component: AdminMap },
      { path: "messages", Component: AdminMessages },
      { path: "assistant", Component: AdminQuoteAgent },
      { path: "teams", Component: AdminTeams },
      { path: "settings", Component: AdminSettings },
    ],
  },
]);
