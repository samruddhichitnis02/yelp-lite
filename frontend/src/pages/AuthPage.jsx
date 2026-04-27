import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signupUser, signupOwner, saveAuthData } from '../services/auth';
import api from '../services/api';

const SCREEN = { AUTH: 'auth', FORGOT: 'forgot', RESET: 'reset' };

const FOOD_IMAGES = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80',
];

import { useSelector, useDispatch } from 'react-redux';
import { loginUser, loginOwner, selectAuthLoading, selectAuthError, clearError, syncAuth } from '../store/slices/authSlice';

const AuthPage = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectAuthLoading);
    const authError = useSelector(selectAuthError);

    const [searchParams] = useSearchParams();
    const [screen, setScreen] = useState(SCREEN.AUTH);
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
    const [userType, setUserType] = useState('user');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', location: '' });
    const [localLoading, setLocalLoading] = useState(false); // for signup
    const [localError, setLocalError] = useState(''); // for signup
    const setError = setLocalError;
    const setLoading = setLocalLoading;
    const [success, setSuccess] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [imgIndex] = useState(() => Math.floor(Math.random() * FOOD_IMAGES.length));

    const navigate = useNavigate();

    React.useEffect(() => {
        setIsLogin(searchParams.get('mode') !== 'signup');
        dispatch(clearError());
        setLocalError('');
        setSuccess('');
    }, [searchParams, dispatch]);

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', location: '' });
        dispatch(clearError());
        setLocalError('');
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
        dispatch(clearError());
        setLocalError('');

        if (isLogin) {
            const action = userType === 'owner'
                ? await dispatch(loginOwner({ email: formData.email, password: formData.password }))
                : await dispatch(loginUser({ email: formData.email, password: formData.password }));

            if (action.meta.requestStatus === 'fulfilled') {
                navigate(userType === 'owner' ? '/owner/dashboard' : '/profile');
            }
            return;
        }

        // Signup flow (keeping simple for now as per plan focus)
        try {
            setLocalLoading(true);
            const data = userType === 'owner'
                ? await signupOwner({ name: formData.name, email: formData.email, password: formData.password, location: formData.location })
                : await signupUser({ name: formData.name, email: formData.email, password: formData.password });
            saveAuthData(data);
            dispatch(syncAuth()); // Update redux state after manual save
            navigate(userType === 'owner' ? '/owner/dashboard' : '/profile');
        } catch (err) {
            setLocalError(err?.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLocalLoading(false);
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
                                    {localError && <Alert variant="danger" className="py-2">{localError}</Alert>}
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
                                    {localError && <Alert variant="danger" className="py-2">{localError}</Alert>}
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
                                    {(isLogin ? authError : localError) && (
                                        <Alert variant="danger" className="py-2">
                                            {isLogin ? authError : localError}
                                        </Alert>
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
                                <button type="submit" className="submit-btn" disabled={loading || localLoading}>
                                    {loading || localLoading
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