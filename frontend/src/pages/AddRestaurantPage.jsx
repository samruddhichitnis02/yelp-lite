import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FaStore, FaImage, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AddRestaurantPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        cuisine: 'American',
        address: '',
        city: '',
        description: '',
        phone: '',
        hours: '',
        priceTier: '$$'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Restaurant listing created successfully!');
        navigate('/owner/dashboard');
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <div className="mb-4">
                        <h2 className="fw-bold d-flex align-items-center"><FaStore className="me-2 text-primary" /> Add New Restaurant</h2>
                        <p className="text-muted">Create a new restaurant listing to start attracting customers.</p>
                    </div>

                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4 p-md-5">
                            <Form onSubmit={handleSubmit}>
                                <h5 className="fw-bold mb-4 border-bottom pb-2"><FaInfoCircle className="me-2 text-muted" /> Basic Information</h5>

                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Restaurant Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" name="name" required placeholder="e.g. Bella Italia" onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Cuisine Type <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="cuisine" onChange={handleChange}>
                                                <option>American</option>
                                                <option>Italian</option>
                                                <option>Mexican</option>
                                                <option>Japanese</option>
                                                <option>Chinese</option>
                                                <option>Indian</option>
                                                <option>Vegan / Vegetarian</option>
                                                <option>Other</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Description <span className="text-danger">*</span></Form.Label>
                                    <Form.Control as="textarea" rows={3} name="description" required placeholder="Describe your restaurant's atmosphere and specialties..." onChange={handleChange} />
                                </Form.Group>

                                <h5 className="fw-bold mb-4 border-bottom pb-2 mt-5"><FaMapMarkerAlt className="me-2 text-muted" /> Location & Contact</h5>
                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Street Address <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" name="address" required placeholder="123 Market St" onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">City <span className="text-danger">*</span></Form.Label>
                                            <Form.Control type="text" name="city" required placeholder="San Francisco" onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Contact Phone</Form.Label>
                                            <Form.Control type="tel" name="phone" placeholder="(555) 000-0000" onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Hours of Operation</Form.Label>
                                            <Form.Control type="text" name="hours" placeholder="Mon-Sun 9AM-10PM" onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h5 className="fw-bold mb-4 border-bottom pb-2 mt-5"><FaImage className="me-2 text-muted" /> Details & Photos</h5>
                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Pricing Tier</Form.Label>
                                            <Form.Select name="priceTier" onChange={handleChange}>
                                                <option value="$">$ (Inexpensive)</option>
                                                <option value="$$">$$ (Moderate)</option>
                                                <option value="$$$">$$$ (Expensive)</option>
                                                <option value="$$$$">$$$$ (Very Expensive)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Upload Photos</Form.Label>
                                            <Form.Control type="file" multiple accept="image/*" />
                                            <Form.Text className="text-muted">You can select multiple images.</Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end mt-4 gap-3">
                                    <Button variant="outline-secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                                    <Button variant="primary" type="submit" className="px-5 fw-bold">Create Listing</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AddRestaurantPage;
