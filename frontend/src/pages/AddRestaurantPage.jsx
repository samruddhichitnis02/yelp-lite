import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaStore, FaImage, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const AddRestaurantPage = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('auth_role');

    const [formData, setFormData] = useState({
        name: '',
        cuisine: 'American',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        description: '',
        phone: '',
        website: '',
        hours_of_operation: '',
        amenities: '',
        price_range: '$$',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = role === 'owner'
                ? '/restaurants/owner/create'
                : '/restaurants/';

            await api.post(endpoint, {
                name: formData.name,
                cuisine: formData.cuisine,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code,
                description: formData.description,
                phone: formData.phone,
                website: formData.website,
                hours_of_operation: formData.hours_of_operation,
                amenities: formData.amenities,
                price_range: formData.price_range,
            });

            navigate(role === 'owner' ? '/owner/dashboard' : '/');
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to create restaurant. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <div className="mb-4">
                        <h2 className="fw-bold d-flex align-items-center">
                            <FaStore className="me-2 text-primary" />
                            {role === 'owner' ? 'Add Your Restaurant' : 'Add New Restaurant'}
                        </h2>
                        <p className="text-muted">
                            {role === 'owner'
                                ? 'Create your restaurant listing to start managing it from your dashboard.'
                                : 'Create a new restaurant listing for others to discover.'}
                        </p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4 p-md-5">
                            <Form onSubmit={handleSubmit}>

                                <h5 className="fw-bold mb-4 border-bottom pb-2">
                                    <FaInfoCircle className="me-2 text-muted" /> Basic Information
                                </h5>

                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Restaurant Name <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                required
                                                placeholder="e.g. Bella Italia"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Cuisine Type <span className="text-danger">*</span></Form.Label>
                                            <Form.Select name="cuisine" value={formData.cuisine} onChange={handleChange}>
                                                <option>American</option>
                                                <option>Italian</option>
                                                <option>Mexican</option>
                                                <option>Japanese</option>
                                                <option>Chinese</option>
                                                <option>Indian</option>
                                                <option>Thai</option>
                                                <option>Korean</option>
                                                <option>Mediterranean</option>
                                                <option>French</option>
                                                <option>Vietnamese</option>
                                                <option>Brazilian</option>
                                                <option>BBQ</option>
                                                <option>Vegan</option>
                                                <option>Seafood</option>
                                                <option>Other</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Description <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        required
                                        placeholder="Describe your restaurant's atmosphere and specialties..."
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <h5 className="fw-bold mb-4 border-bottom pb-2 mt-5">
                                    <FaMapMarkerAlt className="me-2 text-muted" /> Location & Contact
                                </h5>

                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Street Address <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                required
                                                placeholder="123 Market St"
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">City <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                required
                                                placeholder="San Jose"
                                                value={formData.city}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">State</Form.Label>
                                            <Form.Select name="state" value={formData.state} onChange={handleChange}>
                                                <option value="">Select state...</option>
                                                {US_STATES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Zip Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="zip_code"
                                                placeholder="95101"
                                                value={formData.zip_code}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Contact Phone</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                placeholder="(555) 000-0000"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Website</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="website"
                                                placeholder="https://..."
                                                value={formData.website}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Hours of Operation</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="hours_of_operation"
                                                placeholder="Mon-Sun 9AM-10PM"
                                                value={formData.hours_of_operation}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h5 className="fw-bold mb-4 border-bottom pb-2 mt-5">
                                    <FaImage className="me-2 text-muted" /> Details
                                </h5>

                                <Row className="mb-4">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Pricing Tier</Form.Label>
                                            <Form.Select name="price_range" value={formData.price_range} onChange={handleChange}>
                                                <option value="$">$ (Inexpensive)</option>
                                                <option value="$$">$$ (Moderate)</option>
                                                <option value="$$$">$$$ (Expensive)</option>
                                                <option value="$$$$">$$$$ (Very Expensive)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Amenities</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="amenities"
                                                placeholder="wifi, outdoor seating, parking..."
                                                value={formData.amenities}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end mt-4 gap-3">
                                    <Button variant="outline-secondary" type="button" onClick={() => navigate(-1)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" className="px-5 fw-bold" disabled={loading}>
                                        {loading
                                            ? <><Spinner size="sm" animation="border" className="me-2" />Creating...</>
                                            : 'Create Listing'
                                        }
                                    </Button>
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