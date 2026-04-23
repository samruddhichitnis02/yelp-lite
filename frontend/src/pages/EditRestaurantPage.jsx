import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaStore, FaMapMarkerAlt, FaInfoCircle, FaImage, FaEdit } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const RESTAURANT_API = '/api/restaurants';

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const CUISINES = [
    'American', 'Italian', 'Mexican', 'Japanese', 'Chinese',
    'Indian', 'Thai', 'Korean', 'Mediterranean', 'French',
    'Vietnamese', 'Brazilian', 'BBQ', 'Vegan', 'Seafood', 'Other'
];

const EditRestaurantPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const photoInputRef = useRef(null);

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

    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);

    // Load existing restaurant data
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await axios.get(`${RESTAURANT_API}/restaurants/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const r = res.data;
                setFormData({
                    name: r.name || '',
                    cuisine: r.cuisine || 'American',
                    address: r.address || '',
                    city: r.city || '',
                    state: r.state || '',
                    zip_code: r.zip_code || '',
                    description: r.description || '',
                    phone: r.phone || '',
                    website: r.website || '',
                    hours_of_operation: r.hours_of_operation || '',
                    amenities: Array.isArray(r.amenities)
                        ? r.amenities.join(', ')
                        : r.amenities || '',
                    price_range: r.price_range || '$$',
                });
                setExistingPhotos(r.photos || []);
            } catch (err) {
                setError('Failed to load restaurant data.');
            } finally {
                setLoadingData(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files || []);
        setPhotos((prev) => [...prev, ...files]);
        const previews = files.map((f) => URL.createObjectURL(f));
        setPhotoPreviews((prev) => [...prev, ...previews]);
        e.target.value = '';
    };

    const removeNewPhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadNewPhotos = async (token) => {
        for (const photo of photos) {
            const uploadData = new FormData();
            uploadData.append('file', photo);
            await axios.post(
                `${RESTAURANT_API}/restaurants/${id}/photos`,
                uploadData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');

            if (!token) {
                setError('You must be logged in to edit a restaurant.');
                setLoading(false);
                return;
            }

            await axios.put(
                `${RESTAURANT_API}/restaurants/${id}`,
                {
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
                    amenities: formData.amenities ? formData.amenities.trim() : '',
                    price_range: formData.price_range,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            try {
                if (photos.length > 0) {
                    await uploadNewPhotos(token);
                }
                setSuccess(
                    photos.length > 0
                        ? 'Restaurant updated successfully with new photos!'
                        : 'Restaurant updated successfully!'
                );
            } catch (photoErr) {
                setSuccess('Restaurant details updated, but photo upload failed.');
            }

            setTimeout(() => navigate(`/restaurant/${id}`), 1500);
        } catch (err) {
            setError(
                typeof err?.response?.data?.detail === 'string'
                    ? err.response.data.detail
                    : JSON.stringify(
                          err?.response?.data?.detail ||
                          err?.response?.data ||
                          'Failed to update restaurant. Please try again.'
                      )
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: '#e94560' }} />
            </div>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <div className="mb-4">
                        <h2 className="fw-bold d-flex align-items-center">
                            <FaEdit className="me-2 text-primary" /> Edit Restaurant
                        </h2>
                        <p className="text-muted">
                            Update your restaurant details and photos below.
                        </p>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4 p-md-5">
                            <form onSubmit={handleSubmit}>
                                <h5 className="fw-bold mb-4 border-bottom pb-2">
                                    <FaInfoCircle className="me-2 text-muted" /> Basic Information
                                </h5>

                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">
                                                Restaurant Name <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">
                                                Cuisine Type <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Select
                                                name="cuisine"
                                                value={formData.cuisine}
                                                onChange={handleChange}
                                            >
                                                {CUISINES.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">
                                        Description <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        required
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
                                            <Form.Label className="fw-bold">
                                                Street Address <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">
                                                City <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                required
                                                value={formData.city}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">State</Form.Label>
                                            <Form.Select
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select state...</option>
                                                {US_STATES.map((s) => (
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
                                    <FaImage className="me-2 text-muted" /> Additional Details
                                </h5>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Pricing Tier</Form.Label>
                                            <Form.Select
                                                name="price_range"
                                                value={formData.price_range}
                                                onChange={handleChange}
                                            >
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
                                            <Form.Text className="text-muted">
                                                Separate with commas
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Existing Photos */}
                                {existingPhotos.length > 0 && (
                                    <>
                                        <h5 className="fw-bold mb-3 border-bottom pb-2 mt-5">
                                            <FaImage className="me-2 text-muted" /> Existing Photos
                                        </h5>
                                        <Row xs={3} md={4} className="g-2 mb-4">
                                            {existingPhotos.map((photo, idx) => (
                                                <Col key={idx}>
                                                    <div
                                                        className="rounded overflow-hidden"
                                                        style={{ height: '100px' }}
                                                    >
                                                        <img
                                                            src={`${RESTAURANT_API}${photo.url}`}
                                                            alt=""
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </>
                                )}

                                {/* Upload New Photos */}
                                <h5 className="fw-bold mb-3 border-bottom pb-2 mt-3">
                                    <FaImage className="me-2 text-muted" /> Add New Photos
                                    <span className="text-muted fw-normal fs-6 ms-2">(Optional)</span>
                                </h5>

                                <div className="mb-4">
                                    <Button
                                        variant="outline-secondary"
                                        type="button"
                                        onClick={() => photoInputRef.current?.click()}
                                    >
                                        <FaImage className="me-2" /> Upload Photos
                                    </Button>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        ref={photoInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handlePhotoSelect}
                                    />

                                    <Form.Text className="text-muted ms-3">
                                        You can select multiple photos
                                    </Form.Text>

                                    {photoPreviews.length > 0 && (
                                        <Row xs={3} md={4} className="g-2 mt-2">
                                            {photoPreviews.map((src, idx) => (
                                                <Col key={idx}>
                                                    <div
                                                        className="position-relative rounded overflow-hidden"
                                                        style={{ height: '100px' }}
                                                    >
                                                        <img
                                                            src={src}
                                                            alt=""
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            type="button"
                                                            className="position-absolute top-0 end-0 m-1 rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                            style={{ width: '22px', height: '22px', fontSize: '14px' }}
                                                            onClick={() => removeNewPhoto(idx)}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    )}
                                </div>

                                <div className="d-flex justify-content-end mt-4 gap-3">
                                    <Button
                                        variant="outline-secondary"
                                        type="button"
                                        onClick={() => navigate('/owner/dashboard')}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="px-5 fw-bold"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</>
                                            : 'Save Changes'
                                        }
                                    </Button>
                                </div>
                            </form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default EditRestaurantPage;