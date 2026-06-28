import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div style={{ maxWidth: 480, margin: '3rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Đăng ký</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" placeholder="Họ và tên" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Mật khẩu" />
        <button type="submit">Tạo tài khoản</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  )
}
