import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge
} from 'react-bootstrap';
import { FaCamera, FaSave, FaTimes, FaStore } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CUISINES = [
  'American', 'Italian', 'Mexican', 'Japanese', 'Chinese',
  'Indian', 'Thai', 'Mediterranean', 'French', 'Korean',
  'Vegan / Vegetarian', 'Seafood', 'BBQ', 'Other'
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const OwnerProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [restaurant, setRestaurant] = useState({
    name: '',
    cuisine: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    website: '',
    hours_of_operation: '',
    amenities: '',
    price_range: '',
    image: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/restaurants/owner/profile');
        setRestaurant(res.data);
      } catch (err) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError('Failed to load restaurant profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRestaurant((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setPhotoPreview(URL.createObjectURL(file));
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/restaurants/owner/profile/photo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setRestaurant(res.data);
    setSuccess('Photo updated successfully!');
  } catch (err) {
    setError('Failed to upload photo.');
  }
};

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Save text fields first
      const res = await api.put('/restaurants/owner/profile', {
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        description: restaurant.description,
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        zip_code: restaurant.zip_code,
        phone: restaurant.phone,
        website: restaurant.website,
        hours_of_operation: restaurant.hours_of_operation,
        amenities: restaurant.amenities,
        price_range: restaurant.price_range,
      });
      setRestaurant(res.data);

      // If a new photo was selected, upload it separately
      if (photoFile) {
        const fd = new FormData();
        fd.append('file', photoFile);
        const photoRes = await api.post('/restaurants/owner/profile/photo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setRestaurant(photoRes.data);
        setPhotoFile(null);
        setPhotoPreview(null);
      }

      setSuccess('Restaurant profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError('');
    setSuccess('');
  };

  const imageUrl = photoPreview
    ? photoPreview
    : restaurant.image
    ? `http://localhost:8000/${restaurant.image}`
    : null;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <Container className="py-5 text-center">
        <FaStore size={60} className="text-muted mb-4" />
        <h3>No Restaurant Profile Found</h3>
        <p className="text-muted">You haven't claimed or been linked to a restaurant yet.</p>
        <Button variant="primary" onClick={() => navigate('/owner/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Restaurant Profile</h2>
          <p className="text-muted mb-0">View and update your restaurant details.</p>
        </div>
        <div className="d-flex gap-2">
          {!isEditing ? (
            <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="success" onClick={handleSave} disabled={saving}>
                {saving
                  ? <Spinner size="sm" animation="border" className="me-1" />
                  : <FaSave className="me-1" />}
                Save Changes
              </Button>
              <Button variant="outline-secondary" onClick={handleCancel}>
                <FaTimes className="me-1" /> Cancel
              </Button>
            </>
          )}
          <Button variant="outline-dark" onClick={() => navigate('/owner/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        {/* Left — Photo */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm border-0 text-center">
            <Card.Body className="py-4">
              <div className="position-relative d-inline-block mb-3">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Restaurant"
                    className="rounded"
                    style={{ width: '100%', maxHeight: '220px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="bg-light rounded d-flex align-items-center justify-content-center"
                    style={{ width: '220px', height: '180px' }}
                  >
                    <FaStore size={48} className="text-muted" />
                  </div>
                )}

                  <Button
                    variant="primary"
                    className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow"
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FaCamera />
                  </Button>
            
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </div>
              <h5 className="fw-bold">{restaurant.name}</h5>
              <p className="text-muted mb-1">{restaurant.cuisine}</p>
              <Badge bg="secondary">{restaurant.price_range}</Badge>
            </Card.Body>
          </Card>
        </Col>

        {/* Right — Details Form */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">

              <h5 className="fw-bold border-bottom pb-2 mb-4">Basic Information</h5>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Restaurant Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={restaurant.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pricing Tier</Form.Label>
                    <Form.Select
                      name="price_range"
                      value={restaurant.price_range || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select...</option>
                      <option value="$">$ (Inexpensive)</option>
                      <option value="$$">$$ (Moderate)</option>
                      <option value="$$$">$$$ (Expensive)</option>
                      <option value="$$$$">$$$$ (Very Expensive)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cuisine Type</Form.Label>
                    <Form.Select
                      name="cuisine"
                      value={restaurant.cuisine || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select cuisine...</option>
                      {CUISINES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={restaurant.phone || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="(555) 000-0000"
                    />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={restaurant.description || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Describe your restaurant..."
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="fw-bold border-bottom pb-2 mb-4 mt-3">Location</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Street Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={restaurant.address || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="123 Main St"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={restaurant.city || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="San Jose"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Select
                      name="state"
                      value={restaurant.state || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select state...</option>
                      {US_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Zip Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="zip_code"
                      value={restaurant.zip_code || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="95101"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      type="text"
                      name="website"
                      value={restaurant.website || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://..."
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="fw-bold border-bottom pb-2 mb-4 mt-3">Operations</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hours of Operation</Form.Label>
                    <Form.Control
                      type="text"
                      name="hours_of_operation"
                      value={restaurant.hours_of_operation || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Mon-Sun 9AM-10PM"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amenities</Form.Label>
                    <Form.Control
                      type="text"
                      name="amenities"
                      value={restaurant.amenities || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="WiFi, Outdoor Seating, Parking..."
                    />
                  </Form.Group>
                </Col>
              </Row>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OwnerProfilePage;