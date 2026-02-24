import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{
        marginLeft: '220px', flex: 1,
        padding: '36px 40px',
        maxWidth: 'calc(100vw - 220px)',
        minHeight: '100vh'
      }}>
        <Outlet />
      </main>
    </div>
  )
}