import AddReading from './pages/AddReading';
import AddRefill from './pages/AddRefill';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import History from './pages/History';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddReading": AddReading,
    "AddRefill": AddRefill,
    "Dashboard": Dashboard,
    "Drivers": Drivers,
    "History": History,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};