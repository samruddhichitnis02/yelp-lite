import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { signupUser, signupOwner, loginUser, loginOwner, saveAuthData } from '../services/auth';
import api from '../services/api';

const SCREEN = { AUTH: 'auth', FORGOT: 'forgot', RESET: 'reset' };

const FOOD_IMAGES = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80',
];

const AuthPage = () => {
    const [screen, setScreen] = useState(SCREEN.AUTH);
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('user');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', location: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [imgIndex] = useState(() => Math.floor(Math.random() * FOOD_IMAGES.length));

    const navigate = useNavigate();

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', location: '' });
        setError('');
        setSuccess('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTabSelect = (key) => {
        setUserType(key);
        resetForm();
    };

    const handleModeToggle = () => {
        setIsLogin((prev) => !prev);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (isLogin) {
            try {
                setLoading(true);
                const data = userType === 'owner'
                    ? await loginOwner({ email: formData.email, password: formData.password })
                    : await loginUser({ email: formData.email, password: formData.password });
                saveAuthData(data);
                navigate(userType === 'owner' ? '/owner/dashboard' : '/profile');
            } catch (err) {
                setError(err?.response?.data?.detail || 'Login failed. Please try again.');
            } finally {
                setLoading(false);
            }
            return;
        }
        try {
            setLoading(true);
            const data = userType === 'owner'
                ? await signupOwner({ name: formData.name, email: formData.email, password: formData.password, location: formData.location })
                : await signupUser({ name: formData.name, email: formData.email, password: formData.password });
            saveAuthData(data);
            navigate(userType === 'owner' ? '/owner/dashboard' : '/profile');
        } catch (err) {
            setError(err?.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const endpoint = userType === 'owner' ? '/auth/owner/forgot-password' : '/auth/user/forgot-password';
            const res = await api.post(endpoint, { email: forgotEmail });
            if (res.data.reset_token) {
                setResetToken(res.data.reset_token);
                setSuccess('Reset token generated! Copy it below and proceed to reset your password.');
            } else {
                setSuccess('If that email is registered, a reset token has been generated.');
            }
        } catch (err) {
            setError(err?.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            const endpoint = userType === 'owner' ? '/auth/owner/reset-password' : '/auth/user/reset-password';
            const res = await api.post(endpoint, { token: resetToken, new_password: newPassword });
            setSuccess(res.data.message + ' Redirecting to login...');
            setTimeout(() => {
                setScreen(SCREEN.AUTH); setIsLogin(true);
                setResetToken(''); setNewPassword(''); setConfirmPassword(''); setForgotEmail(''); setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err?.response?.data?.detail || 'Reset failed. The token may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            <style>{`
                .auth-input {
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 12px 16px;
                    font-size: 0.95rem;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    background: #fafafa;
                }
                .auth-input:focus {
                    border-color: #e94560;
                    box-shadow: 0 0 0 3px rgba(233,69,96,0.12);
                    background: #fff;
                    outline: none;
                }
                .auth-tab {
                    padding: 10px 24px;
                    border: none;
                    background: transparent;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #94a3b8;
                    cursor: pointer;
                    border-bottom: 2.5px solid transparent;
                    transition: all 0.2s;
                }
                .auth-tab.active {
                    color: #e94560;
                    border-bottom-color: #e94560;
                }
                .auth-tab:hover:not(.active) { color: #475569; }
                .social-btn {
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    width: 100%; padding: 11px 16px;
                    border: 1.5px solid #e2e8f0; border-radius: 10px;
                    background: #fff; font-size: 0.9rem; font-weight: 500;
                    color: #374151; cursor: pointer;
                    transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
                    margin-bottom: 10px;
                }
                .social-btn:hover { background: #f8fafc; border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
                .divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
                .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
                .divider span { color: #94a3b8; font-size: 0.82rem; }
                .submit-btn {
                    width: 100%; padding: 13px;
                    background: #e94560; color: #fff; border: none;
                    border-radius: 10px; font-size: 1rem; font-weight: 700;
                    cursor: pointer; transition: background 0.18s, box-shadow 0.18s;
                    box-shadow: 0 4px 14px rgba(233,69,96,0.35);
                    margin-top: 6px;
                }
                .submit-btn:hover:not(:disabled) { background: #c73652; box-shadow: 0 6px 18px rgba(233,69,96,0.45); }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
                .auth-panel-image {
                    position: relative; flex: 1;
                    background-size: cover; background-position: center;
                    display: none;
                }
                @media (min-width: 900px) { .auth-panel-image { display: block; } }
                .auth-panel-form {
                    width: 100%; max-width: 480px;
                    margin: 0 auto;
                    padding: 48px 40px;
                    overflow-y: auto;
                    display: flex; flex-direction: column; justify-content: center;
                }
                @media (max-width: 600px) { .auth-panel-form { padding: 32px 20px; } }
            `}</style>

            {/* Left — food image panel */}
            <div className="auth-panel-image" style={{ backgroundImage: `url(${FOOD_IMAGES[imgIndex]})` }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(10,10,30,0.75) 0%, rgba(233,69,96,0.45) 100%)',
                }}>
                    <div style={{ position: 'absolute', bottom: 48, left: 40, right: 40 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <span style={{ color: '#e94560', fontSize: '2rem' }}>✦</span>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>Yelp Prototype</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
                            Discover the best restaurants near you. Real reviews, real experiences.
                        </p>
                        <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
                            {['🍝 Italian', '🍣 Japanese', '🍔 American', '🌮 Mexican'].map(t => (
                                <span key={t} style={{
                                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                                    padding: '5px 12px', borderRadius: 20, fontSize: '0.78rem',
                                    fontWeight: 600, backdropFilter: 'blur(6px)',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right — form panel */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', minHeight: '100vh' }}>
                <div className="auth-panel-form">

                    {/* Logo */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ color: '#e94560', fontSize: '1.5rem' }}>✦</span>
                            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1e293b' }}>Yelp Prototype</span>
                        </div>
                        <h2 style={{ fontWeight: 700, fontSize: '1.6rem', color: '#1e293b', margin: 0 }}>
                            {screen === SCREEN.AUTH ? (isLogin ? 'Welcome back' : 'Create an account') : screen === SCREEN.FORGOT ? 'Reset your password' : 'Choose new password'}
                        </h2>
                        <p style={{ color: '#64748b', marginTop: 4, fontSize: '0.93rem' }}>
                            {screen === SCREEN.AUTH ? (isLogin ? 'Sign in to continue exploring restaurants' : 'Join to discover and review restaurants') : ''}
                        </p>
                    </div>

                    {/* User type tabs */}
                    <div style={{ display: 'flex', borderBottom: '1.5px solid #e2e8f0', marginBottom: 24 }}>
                        <button className={`auth-tab${userType === 'user' ? ' active' : ''}`} onClick={() => handleTabSelect('user')}>Regular User</button>
                        <button className={`auth-tab${userType === 'owner' ? ' active' : ''}`} onClick={() => handleTabSelect('owner')}>Restaurant Owner</button>
                    </div>

                    {/* ── FORGOT PASSWORD ── */}
                    {screen === SCREEN.FORGOT && (
                        <>
                            <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Forgot Password</h5>
                            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 20 }}>Enter your {userType} email to get a reset token.</p>
                            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                            {success && <Alert variant="success" className="py-2">{success}</Alert>}
                            <Form onSubmit={handleForgotSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>Email address</Form.Label>
                                    <Form.Control type="email" placeholder="name@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="auth-input" />
                                </Form.Group>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null} Get Reset Token
                                </button>
                            </Form>
                            {resetToken && (
                                <div className="mt-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem' }}>Your Reset Token (copy this):</Form.Label>
                                    <Form.Control as="textarea" rows={3} readOnly value={resetToken} style={{ fontSize: '0.75rem', wordBreak: 'break-all' }} onClick={(e) => e.target.select()} className="auth-input" />
                                    <Button variant="outline-success" size="sm" className="mt-2 w-100" onClick={() => setScreen(SCREEN.RESET)}>Proceed to Reset Password →</Button>
                                </div>
                            )}
                            <div className="text-center mt-3">
                                <Button variant="link" className="p-0 text-decoration-none" style={{ color: '#e94560' }} onClick={() => { setScreen(SCREEN.AUTH); setError(''); setSuccess(''); }}>← Back to Login</Button>
                            </div>
                        </>
                    )}

                    {/* ── RESET PASSWORD ── */}
                    {screen === SCREEN.RESET && (
                        <>
                            <h5 style={{ fontWeight: 700, marginBottom: 4 }}>Reset Password</h5>
                            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: 20 }}>Paste your reset token and choose a new password.</p>
                            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                            {success && <Alert variant="success" className="py-2">{success}</Alert>}
                            <Form onSubmit={handleResetSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>Reset Token</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="Paste your reset token here" value={resetToken} onChange={(e) => setResetToken(e.target.value)} required style={{ fontSize: '0.75rem' }} className="auth-input" />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>New Password</Form.Label>
                                    <Form.Control type="password" placeholder="Min. 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="auth-input" />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>Confirm New Password</Form.Label>
                                    <Form.Control type="password" placeholder="Repeat your new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="auth-input" />
                                </Form.Group>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null} Reset Password
                                </button>
                            </Form>
                            <div className="text-center mt-3">
                                <Button variant="link" className="p-0 text-decoration-none" style={{ color: '#e94560' }} onClick={() => { setScreen(SCREEN.FORGOT); setError(''); setSuccess(''); }}>← Back</Button>
                            </div>
                        </>
                    )}

                    {/* ── MAIN AUTH ── */}
                    {screen === SCREEN.AUTH && (
                        <>
                            {error && <Alert variant="danger" className="py-2">{error}</Alert>}

                            {/* Social buttons — visual only, no OAuth backend */}
                            {isLogin && (
                                <>
                                    <button type="button" className="social-btn" onClick={() => setError('Google login is not available in this prototype.')}>
                                        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.8 13.3l7.9 6.1C12.5 13.2 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.1-4.5 6.7l7 5.4c4.1-3.8 6.5-9.4 6.5-16.1z"/><path fill="#FBBC05" d="M10.7 28.6A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6L2.3 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.2-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7-5.4c-2 1.4-4.6 2.2-8.2 2.2-6.2 0-11.4-3.7-13.3-9l-7.9 6.1C6.7 42.6 14.7 48 24 48z"/></svg>
                                        Continue with Google
                                    </button>
                                    <button type="button" className="social-btn" onClick={() => setError('Apple login is not available in this prototype.')}>
                                        <svg width="18" height="18" viewBox="0 0 814 1000"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.4 135.4-317 269.1-317 70.6 0 129.2 46.4 173.4 46.4 42.8 0 109.9-49.1 189.2-49.1 30.8 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg>
                                        Continue with Apple
                                    </button>
                                    <div className="divider"><span>or</span></div>
                                </>
                            )}

                            <Form onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>Full Name</Form.Label>
                                        <Form.Control type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="auth-input" />
                                    </Form.Group>
                                )}
                                {!isLogin && userType === 'owner' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>Restaurant Location</Form.Label>
                                        <Form.Control type="text" name="location" placeholder="e.g. San Jose, CA" value={formData.location} onChange={handleChange} required className="auth-input" />
                                    </Form.Group>
                                )}
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>Email address</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required className="auth-input" />
                                </Form.Group>
                                <Form.Group className="mb-1">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#374151' }}>Password</Form.Label>
                                    <Form.Control type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="auth-input" />
                                </Form.Group>
                                {isLogin && (
                                    <div className="text-end mb-2 mt-1">
                                        <Button variant="link" className="p-0 text-decoration-none small" style={{ color: '#e94560' }}
                                            onClick={() => { setScreen(SCREEN.FORGOT); setError(''); setSuccess(''); setForgotEmail(formData.email); }}>
                                            Forgot password?
                                        </Button>
                                    </div>
                                )}
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading
                                        ? <><Spinner animation="border" size="sm" className="me-2" />{isLogin ? 'Logging In...' : 'Signing Up...'}</>
                                        : isLogin ? 'Log In' : 'Sign Up'
                                    }
                                </button>
                            </Form>

                            <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: '0.9rem' }}>
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                <button type="button" onClick={handleModeToggle} style={{ background: 'none', border: 'none', color: '#e94560', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;