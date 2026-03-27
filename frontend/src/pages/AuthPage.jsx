import React, { useState } from 'react';
import {
  Container, Row, Col, Card, Form,
  Button, Tabs, Tab, Alert, Spinner,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { signupUser, signupOwner, loginUser, loginOwner, saveAuthData } from '../services/auth';
import api from '../services/api';

// Three screens: 'auth' | 'forgot' | 'reset'
const SCREEN = { AUTH: 'auth', FORGOT: 'forgot', RESET: 'reset' };

const AuthPage = () => {
  const [screen, setScreen] = useState(SCREEN.AUTH);
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('user');

  const [formData, setFormData] = useState({ name: '', email: '', password: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Forgot / Reset state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    setUserType(key || 'user');
    resetForm();
  };

  const handleModeToggle = () => {
    setIsLogin((prev) => !prev);
    resetForm();
  };

  // ── Main login/signup submit ──────────────────────────────────────────────
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

  // ── Forgot password: request reset token ─────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = userType === 'owner'
        ? '/auth/owner/forgot-password'
        : '/auth/user/forgot-password';
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

  // ── Reset password: submit new password ───────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = userType === 'owner'
        ? '/auth/owner/reset-password'
        : '/auth/user/reset-password';
      const res = await api.post(endpoint, { token: resetToken, new_password: newPassword });
      setSuccess(res.data.message + ' Redirecting to login...');
      setTimeout(() => {
        setScreen(SCREEN.AUTH);
        setIsLogin(true);
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotEmail('');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Reset failed. The token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary">Yelp Prototype</h2>
              <p className="text-muted">Discover and review the best restaurants</p>
            </div>

            <Card className="shadow-lg border-0 rounded-p overflow-hidden">
              <Card.Header className="bg-white p-0 border-0">
                <Tabs
                  activeKey={userType}
                  onSelect={handleTabSelect}
                  className="w-100 nav-fill custom-auth-tabs"
                >
                  <Tab eventKey="user" title={<span className="fw-bold py-3 d-block">Regular User</span>} />
                  <Tab eventKey="owner" title={<span className="fw-bold py-3 d-block">Restaurant Owner</span>} />
                </Tabs>
              </Card.Header>

              <Card.Body className="p-4 p-md-5">

                {/* ── FORGOT PASSWORD SCREEN ── */}
                {screen === SCREEN.FORGOT && (
                  <>
                    <h4 className="fw-bold mb-1 text-center">Forgot Password</h4>
                    <p className="text-muted text-center small mb-4">
                      Enter your {userType} email to get a reset token.
                    </p>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleForgotSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="name@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                        />
                      </Form.Group>

                      <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3 rounded-pill" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                        Get Reset Token
                      </Button>
                    </Form>

                    {/* Show the token inline so user can copy it */}
                    {resetToken && (
                      <div className="mb-3">
                        <Form.Label className="fw-bold">Your Reset Token (copy this):</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          readOnly
                          value={resetToken}
                          style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}
                          onClick={(e) => e.target.select()}
                        />
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="mt-2 w-100"
                          onClick={() => setScreen(SCREEN.RESET)}
                        >
                          Proceed to Reset Password →
                        </Button>
                      </div>
                    )}

                    <div className="text-center mt-3">
                      <Button variant="link" className="p-0 text-decoration-none" onClick={() => { setScreen(SCREEN.AUTH); setError(''); setSuccess(''); }}>
                        ← Back to Login
                      </Button>
                    </div>
                  </>
                )}

                {/* ── RESET PASSWORD SCREEN ── */}
                {screen === SCREEN.RESET && (
                  <>
                    <h4 className="fw-bold mb-1 text-center">Reset Password</h4>
                    <p className="text-muted text-center small mb-4">
                      Paste your reset token and choose a new password.
                    </p>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleResetSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Reset Token</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Paste your reset token here"
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                          required
                          style={{ fontSize: '0.75rem' }}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Min. 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Repeat your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </Form.Group>

                      <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3 rounded-pill" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                        Reset Password
                      </Button>
                    </Form>

                    <div className="text-center mt-2">
                      <Button variant="link" className="p-0 text-decoration-none" onClick={() => { setScreen(SCREEN.FORGOT); setError(''); setSuccess(''); }}>
                        ← Back
                      </Button>
                    </div>
                  </>
                )}

                {/* ── MAIN AUTH SCREEN ── */}
                {screen === SCREEN.AUTH && (
                  <>
                    <h4 className="fw-bold mb-4 text-center">
                      {isLogin ? `Log in to your ${userType} account` : `Create a ${userType} account`}
                    </h4>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                      {!isLogin && (
                        <Form.Group className="mb-3" controlId="formName">
                          <Form.Label>Full Name</Form.Label>
                          <Form.Control type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                        </Form.Group>
                      )}

                      {!isLogin && userType === 'owner' && (
                        <Form.Group className="mb-4" controlId="formOwnerLocation">
                          <Form.Label>Restaurant Location</Form.Label>
                          <Form.Control type="text" name="location" placeholder="e.g. San Jose, CA" value={formData.location} onChange={handleChange} required />
                        </Form.Group>
                      )}

                      <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
                      </Form.Group>

                      <Form.Group className="mb-1" controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                      </Form.Group>

                      {/* Forgot password link — only shown on login */}
                      {isLogin && (
                        <div className="text-end mb-3">
                          <Button
                            variant="link"
                            className="p-0 text-decoration-none small"
                            onClick={() => { setScreen(SCREEN.FORGOT); setError(''); setSuccess(''); setForgotEmail(formData.email); }}
                          >
                            Forgot password?
                          </Button>
                        </div>
                      )}

                      <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3 rounded-pill mt-2" disabled={loading}>
                        {loading
                          ? <><Spinner animation="border" size="sm" className="me-2" />{isLogin ? 'Logging In...' : 'Signing Up...'}</>
                          : isLogin ? 'Log In' : 'Sign Up'
                        }
                      </Button>
                    </Form>

                    <div className="text-center mt-4">
                      <span className="text-muted">{isLogin ? "Don't have an account? " : 'Already have an account? '}</span>
                      <Button variant="link" className="p-0 text-decoration-none fw-bold" onClick={handleModeToggle}>
                        {isLogin ? 'Sign Up' : 'Log In'}
                      </Button>
                    </div>
                  </>
                )}

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthPage;