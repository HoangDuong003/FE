import React, { useState } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';

const Forgotpass = () => {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập mật khẩu mới + OTP
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post(`/api/mail/verify/${email}`);
      setStep(2);
      setMessage('Mã xác nhận đã được gửi tới email của bạn.');
    } catch (err) {
      setError(err.response?.data || 'メールの送信に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/api/mail/verify-and-change-password', {
        email,
        newPassword,
        token: otp,
      });
      setMessage('Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(err.response?.data || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fafafa' }}>
      <form
        onSubmit={step === 1 ? handleSendEmail : handleResetPassword}
        style={{
          background: '#fff',
          padding: 48,
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          minWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <img src={require('../../assets/images/urban-logo.png')} alt="logo" style={{ width: 200, marginBottom: 20 }} />
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 28 }}>パスワードを忘れた</h2>
        {message && <div style={{ color: 'green', textAlign: 'center' }}>{message}</div>}
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="メールアドレスを入力してください *"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 16, borderRadius: 5, border: '1px solid #ccc', fontSize: 18 }}
            />
            <button
              type="submit"
              disabled={loading || !email}
              style={{ width: '100%', padding: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 700, cursor: 'pointer', fontSize: 18 }}
            >
              {loading ? '送信中...' : '続ける'}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <input
              type="password"
              placeholder="新しいパスワードを入力してください *"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 16, borderRadius: 5, border: '1px solid #ccc', fontSize: 18 }}
            />
            <input
              type="text"
              placeholder="OTPを入力してください *"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              style={{ width: '100%', padding: 16, borderRadius: 5, border: '1px solid #ccc', fontSize: 18 }}
            />
            <button
              type="submit"
              disabled={loading || !newPassword || !otp}
              style={{ width: '100%', padding: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 700, cursor: 'pointer', fontSize: 18 }}
            >
              {loading ? '処理中...' : '新しいパスワードを設定'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ width: '100%', padding: 10, background: 'none', color: '#1976d2', border: 'none', borderRadius: 5, fontWeight: 600, cursor: 'pointer', marginTop: 4, fontSize: 16 }}
            >
              戻る
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default Forgotpass; 
