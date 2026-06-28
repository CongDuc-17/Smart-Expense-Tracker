import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div style={{ maxWidth: 700, margin: '3rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Smart Expense Tracker</h1>
      <p>Quản lý chi tiêu và thu nhập một cách dễ dàng.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <Link to="/login">Đăng nhập</Link>
        <Link to="/register">Đăng ký</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </div>
  )
}
