import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Evoting from './pages/Evoting'
import Form from './components/Form'
import NotFound from './pages/NotFound'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AdminEvoting from "./pages/AdminEvoting";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/evoting",
        element: <Evoting />
    },
    {
        path: "/admin/evoting",
        element: <AdminEvoting />
    },
    {
        path: "/form",
        element: <Form />
    },
    {
        path: "*",
        element: <NotFound />
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
