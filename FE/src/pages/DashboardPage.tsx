import { Link } from 'react-router-dom'

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 800, margin: '3rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Dashboard</h2>
      <p>Trang tổng quan sau khi đăng nhập.</p>
      <Link to="/">Về trang chủ</Link>
    </div>
  )
}
