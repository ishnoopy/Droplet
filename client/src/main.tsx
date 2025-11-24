import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from './layout.tsx'
import Home from './pages/Home/Home.tsx'
import { SocketProvider } from './providers/SocketProvider.tsx'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home />}
    ]
  }
])

createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <RouterProvider router={router} />
  </SocketProvider>
);
