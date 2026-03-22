import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Tabs,
  Tab,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { signupUser, signupOwner, saveAuthData } from '../services/auth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      location: '',
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTabSelect = (key) => {
    setUserType(key || 'user');
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
      setError('Login integration will be added separately.');
      return;
    }


    try {
      setLoading(true);

      const data =
      userType === 'owner'
    ? await signupOwner({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        location: formData.location,
      })
    : await signupUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      saveAuthData(data);
      navigate('/profile');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                  <Tab
                    eventKey="user"
                    title={<span className="fw-bold py-3 d-block">Regular User</span>}
                  />
                  <Tab
                    eventKey="owner"
                    title={<span className="fw-bold py-3 d-block">Restaurant Owner</span>}
                  />
                </Tabs>
              </Card.Header>

              <Card.Body className="p-4 p-md-5">
                <h4 className="fw-bold mb-4 text-center">
                  {isLogin ? `Log in to your ${userType} account` : `Create a ${userType} account`}
                </h4>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <Form.Group className="mb-3" controlId="formName">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  )}

                  {!isLogin && userType === 'owner' && (
                    <Form.Group className="mb-4" controlId="formOwnerLocation">
                      <Form.Label>Restaurant Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        placeholder="e.g. San Jose, CA"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 fw-bold mb-3 rounded-pill"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing Up...
                      </>
                    ) : (
                      isLogin ? 'Log In' : 'Sign Up'
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <span className="text-muted">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  </span>
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none fw-bold"
                    onClick={handleModeToggle}
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthPage;