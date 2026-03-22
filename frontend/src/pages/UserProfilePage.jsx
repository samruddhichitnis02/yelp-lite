import React, { useEffect, useState,  } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { FaUserEdit, FaCamera, FaRobot } from 'react-icons/fa';
import api from '../services/api';
import { getStoredUser } from '../services/auth';

const UserProfilePage = () => {
    // Mock User State
    const storedUser = JSON.parse(localStorage.getItem('auth_user') || '{}');

    useEffect(() => {
    const fetchUser = async () => {
        try {
        const res = await api.get('/me/user');
        const user = res.data;

        setUserDetails((prev) => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
        }));
        } catch (err) {
        console.error('Failed to fetch user:', err);
        }
    };

    fetchUser();
    }, []);

    const [userDetails, setUserDetails] = useState({
        name: storedUser.name || '',
        email: storedUser.email || '',
        phone: '',
        about: '',
        city: '',
        state: '',
        country: '',
        language: '',
        gender: ''
    });

    // Mock Preferences State for AI Assistant
    const [preferences, setPreferences] = useState({
        cuisines: ['Italian', 'Thai', 'Mexican'],
        priceRange: '$$',
        radius: '10 miles',
        dietary: ['Vegetarian'],
        ambiance: ['Casual', 'Outdoor Seating'],
        sortPref: 'Rating'
    });

    return (
        <Container className="py-5">
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold">Profile & AI Preferences</h2>
                    <p className="text-muted">Manage your personal details and configure the AI Assistant.</p>
                </Col>
            </Row>

            <Row>
                <Col lg={4} className="mb-4">
                    {/* Profile Picture Card */}
                    <Card className="shadow-sm border-0 mb-4 text-center">
                        <Card.Body className="py-5">
                            <div className="position-relative d-inline-block mb-3">
                                <img
                                    src="https://via.placeholder.com/150"
                                    alt="Profile"
                                    className="rounded-circle"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                                <Button
                                    variant="primary"
                                    className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow"
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <FaCamera />
                                </Button>
                            </div>
                            <h4 className="fw-bold">{userDetails.name}</h4>
                            <p className="text-muted">{userDetails.city}, {userDetails.state}</p>
                        </Card.Body>
                    </Card>

                    {/* AI Assistant Call to Action */}
                    <Card className="shadow-sm border-0 bg-primary text-white text-center">
                        <Card.Body className="py-4">
                            <FaRobot size={48} className="mb-3 opacity-75" />
                            <h4>Try the AI Assistant</h4>
                            <p className="small opacity-75">Your preferences below are used to give you the perfect restaurant recommendations.</p>
                            <Button variant="light" className="rounded-pill fw-bold w-100">Chat Now</Button>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <div className="bg-white p-4 rounded shadow-sm mb-4">
                        <h4 className="fw-bold mb-4 border-bottom pb-2">Personal Information</h4>
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control type="text" value={userDetails.name} readOnly />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control type="email" value={userDetails.email} readOnly />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Phone Number</Form.Label>
                                        <Form.Control type="text" value={userDetails.phone} readOnly />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Gender</Form.Label>
                                        <Form.Select value={userDetails.gender} readOnly>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                            <option>Decline to state</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>City</Form.Label>
                                        <Form.Control type="text" value={userDetails.city} readOnly />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>State</Form.Label>
                                        <Form.Control type="text" value={userDetails.state} readOnly />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Country</Form.Label>
                                        <Form.Select value={userDetails.country} readOnly>
                                            <option>USA</option>
                                            <option>Canada</option>
                                            <option>UK</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>About Me</Form.Label>
                                        <Form.Control as="textarea" rows={3} value={userDetails.about} readOnly />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button variant="outline-primary"><FaUserEdit className="me-2" />Edit Profile</Button>
                        </Form>
                    </div>

                    {/* AI Preferences Section */}
                    <div className="bg-light p-4 rounded shadow-sm border border-primary border-opacity-25">
                        <h4 className="fw-bold mb-4 border-bottom pb-2">AI Recommendations Preferences</h4>
                        <Form className="text-muted">

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-dark">Default Price Range</Form.Label>
                                        <Form.Select value={preferences.priceRange} readOnly>
                                            <option value="$">$ (Cheap)</option>
                                            <option value="$$">$$ (Moderate)</option>
                                            <option value="$$$">$$$ (Expensive)</option>
                                            <option value="$$$$">$$$$ (Very Expensive)</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-dark">Sort Preference</Form.Label>
                                        <Form.Select value={preferences.sortPref} readOnly>
                                            <option>Rating (Highest First)</option>
                                            <option>Distance (Closest)</option>
                                            <option>Popularity</option>
                                            <option>Price (Lowest)</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="mb-4">
                                <Form.Label className="fw-bold text-dark d-block">Favorite Cuisines</Form.Label>
                                {preferences.cuisines.map(c => <Badge bg="secondary" key={c} className="me-2 p-2 fs-6">{c}</Badge>)}
                                <Badge bg="outline-secondary" text="dark" className="border me-2 p-2 fs-6" style={{ cursor: 'pointer' }}>+ Add</Badge>
                            </div>

                            <div className="mb-4">
                                <Form.Label className="fw-bold text-dark d-block">Dietary Restrictions</Form.Label>
                                {preferences.dietary.map(d => <Badge bg="success" key={d} className="me-2 p-2 fs-6">{d}</Badge>)}
                                <Badge bg="outline-secondary" text="dark" className="border me-2 p-2 fs-6" style={{ cursor: 'pointer' }}>+ Add</Badge>
                            </div>

                            <div className="mb-4">
                                <Form.Label className="fw-bold text-dark d-block">Ambiance Preferences</Form.Label>
                                {preferences.ambiance.map(a => <Badge bg="info" key={a} className="me-2 p-2 fs-6">{a}</Badge>)}
                                <Badge bg="outline-secondary" text="dark" className="border me-2 p-2 fs-6" style={{ cursor: 'pointer' }}>+ Add</Badge>
                            </div>

                            <Button variant="primary">Save AI Preferences</Button>
                        </Form>
                    </div>

                </Col>
            </Row>
        </Container>
    );
};

export default UserProfilePage;
