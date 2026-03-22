import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaUserEdit, FaCamera, FaRobot, FaSave, FaTimes } from 'react-icons/fa';
import api from '../services/api';

const COUNTRIES = [
  'USA', 'Canada', 'UK', 'Australia', 'India', 'Germany', 'France',
  'Japan', 'China', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Other'
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const UserProfilePage = () => {
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    about: '',
    city: '',
    state: '',
    country: '',
    languages: '',
    gender: '',
    profile_pic: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me/user');
        const u = res.data;
        setUserDetails({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          about: u.about || '',
          city: u.city || '',
          state: u.state || '',
          country: u.country || '',
          languages: u.languages || '',
          gender: u.gender || '',
          profile_pic: u.profile_pic || '',
        });
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const fd = new FormData();
      fd.append('name', userDetails.name);
      fd.append('phone', userDetails.phone);
      fd.append('about', userDetails.about);
      fd.append('city', userDetails.city);
      fd.append('state', userDetails.state);
      fd.append('country', userDetails.country);
      fd.append('languages', userDetails.languages);
      fd.append('gender', userDetails.gender);
      if (profilePicFile) {
        fd.append('profile_pic', profilePicFile);
      }
      const res = await api.put('/users/me', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const u = res.data;
      setUserDetails({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        about: u.about || '',
        city: u.city || '',
        state: u.state || '',
        country: u.country || '',
        languages: u.languages || '',
        gender: u.gender || '',
        profile_pic: u.profile_pic || '',
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setProfilePicFile(null);
      setProfilePicPreview(null);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setError('');
    setSuccess('');
  };

  const profilePicUrl = profilePicPreview
    ? profilePicPreview
    : userDetails.profile_pic
    ? `http://localhost:8000/${userDetails.profile_pic}`
    : 'https://via.placeholder.com/150';

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Profile & AI Preferences</h2>
          <p className="text-muted">Manage your personal details and configure the AI Assistant.</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col lg={4} className="mb-4">
          {/* Profile Picture Card */}
          <Card className="shadow-sm border-0 mb-4 text-center">
            <Card.Body className="py-5">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                {isEditing && (
                  <Button
                    variant="primary"
                    className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow"
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FaCamera />
                  </Button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handlePicChange}
                />
              </div>
              <h4 className="fw-bold">{userDetails.name}</h4>
              <p className="text-muted">{userDetails.city}{userDetails.city && userDetails.state ? ', ' : ''}{userDetails.state}</p>
            </Card.Body>
          </Card>

          {/* AI Assistant CTA */}
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
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
              <h4 className="fw-bold mb-0">Personal Information</h4>
              {!isEditing ? (
                <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
                  <FaUserEdit className="me-2" />Edit Profile
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button variant="success" onClick={handleSave} disabled={saving}>
                    {saving ? <Spinner size="sm" animation="border" className="me-1" /> : <FaSave className="me-1" />}
                    Save
                  </Button>
                  <Button variant="outline-secondary" onClick={handleCancel}>
                    <FaTimes className="me-1" />Cancel
                  </Button>
                </div>
              )}
            </div>

            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={userDetails.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={userDetails.email}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={userDetails.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="(555) 000-0000"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={userDetails.gender}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Decline to state">Decline to state</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Languages</Form.Label>
                    <Form.Control
                      type="text"
                      name="languages"
                      value={userDetails.languages}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. English, Spanish"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Select
                      name="country"
                      value={userDetails.country}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select country...</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={userDetails.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="San Jose"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>State (abbreviated)</Form.Label>
                    <Form.Select
                      name="state"
                      value={userDetails.state}
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
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>About Me</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="about"
                      value={userDetails.about}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Tell us a bit about yourself..."
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfilePage;