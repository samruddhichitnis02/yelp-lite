import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('user'); // 'user' or 'owner'
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would dispatch a login action or make an API call here.
        // For now, we mock the redirection.
        if (userType === 'owner') {
            navigate('/owner/dashboard');
        } else {
            navigate('/profile');
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
                                    onSelect={(k) => setUserType(k)}
                                    className="w-100 nav-fill custom-auth-tabs"
                                >
                                    <Tab eventKey="user" title={<span className="fw-bold py-3 d-block">Regular User</span>} />
                                    <Tab eventKey="owner" title={<span className="fw-bold py-3 d-block">Restaurant Owner</span>} />
                                </Tabs>
                            </Card.Header>

                            <Card.Body className="p-4 p-md-5">
                                <h4 className="fw-bold mb-4 text-center">
                                    {isLogin ? `Log in to your ${userType} account` : `Create a ${userType} account`}
                                </h4>

                                <Form onSubmit={handleSubmit}>
                                    {!isLogin && (
                                        <Form.Group className="mb-3" controlId="formName">
                                            <Form.Label>Full Name</Form.Label>
                                            <Form.Control type="text" placeholder="John Doe" required />
                                        </Form.Group>
                                    )}

                                    <Form.Group className="mb-3" controlId="formEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control type="email" placeholder="name@example.com" required />
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="formPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="••••••••" required />
                                    </Form.Group>

                                    {!isLogin && userType === 'owner' && (
                                        <Form.Group className="mb-4" controlId="formRestaurantLocation">
                                            <Form.Label>Restaurant Location (City/Zip)</Form.Label>
                                            <Form.Control type="text" placeholder="e.g. San Francisco, 94105" required />
                                        </Form.Group>
                                    )}

                                    <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3 rounded-pill">
                                        {isLogin ? 'Log In' : 'Sign Up'}
                                    </Button>
                                </Form>

                                <div className="text-center mt-4">
                                    <span className="text-muted">
                                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    </span>
                                    <Button
                                        variant="link"
                                        className="p-0 text-decoration-none fw-bold"
                                        onClick={() => setIsLogin(!isLogin)}
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
