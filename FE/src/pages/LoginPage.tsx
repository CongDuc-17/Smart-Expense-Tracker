import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Đăng nhập</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Mật khẩu" />
        <button type="submit">Đăng nhập</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  )
}
