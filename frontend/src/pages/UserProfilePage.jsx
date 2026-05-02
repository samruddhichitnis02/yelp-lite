import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUserEdit, FaCamera, FaRobot, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const USER_API = '/api/users';

const COUNTRIES = [
  'USA', 'Canada', 'UK', 'Australia', 'India', 'Germany', 'France',
  'Japan', 'China', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Other'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const DEFAULT_PROFILE =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80';

const normalizeLanguagesForInput = (languages) => {
  if (!languages) return '';
  if (Array.isArray(languages)) return languages.join(', ');
  return String(languages);
};

const getProfilePicUrl = (profilePic, preview) => {
  if (preview) return preview;
  if (!profilePic) return DEFAULT_PROFILE;

  if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
    return profilePic;
  }

  if (profilePic.startsWith('uploads/')) {
    return `${USER_API}/${profilePic}`;
  }

  return DEFAULT_PROFILE;
};

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
    location: '',
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

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      const res = await axios.get(`${USER_API}/me/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        languages: normalizeLanguagesForInput(u.languages),
        gender: u.gender || '',
        location: u.location || '',
        profile_pic: u.profile_pic || '',
      });
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
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
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();

      // Only append fields that have a non-empty value so the backend
      // doesn't overwrite existing data with empty strings.
      if (userDetails.name)      formData.append('name',      userDetails.name.trim());
      if (userDetails.phone)     formData.append('phone',     userDetails.phone.trim());
      if (userDetails.about)     formData.append('about',     userDetails.about.trim());
      if (userDetails.city)      formData.append('city',      userDetails.city.trim());
      if (userDetails.state)     formData.append('state',     userDetails.state.trim());
      if (userDetails.country)   formData.append('country',   userDetails.country.trim());
      if (userDetails.languages) formData.append('languages', userDetails.languages.trim());
      if (userDetails.gender)    formData.append('gender',    userDetails.gender.trim());
      if (userDetails.location)  formData.append('location',  userDetails.location.trim());

      if (profilePicFile) {
        formData.append('profile_pic', profilePicFile);
      }

      const res = await axios.put(`${USER_API}/users/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const u = res.data;

      setUserDetails({
        name: u.name || '',
        email: u.email || userDetails.email || '',
        phone: u.phone || '',
        about: u.about || '',
        city: u.city || '',
        state: u.state || '',
        country: u.country || '',
        languages: normalizeLanguagesForInput(u.languages),
        gender: u.gender || '',
        location: u.location || '',
        profile_pic: u.profile_pic || '',
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setProfilePicFile(null);
      setProfilePicPreview(null);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to save profile.');
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
    fetchUser();
  };

  const profilePicUrl = getProfilePicUrl(userDetails.profile_pic, profilePicPreview);

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
          <Card className="shadow-sm border-0 mb-4 text-center">
            <Card.Body className="py-5">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_PROFILE;
                  }}
                />

                {isEditing && (
                  <Button
                    variant="danger"
                    className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow"
                    style={{ width: '42px', height: '42px' }}
                    onClick={() => fileInputRef.current?.click()}
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

              <h4 className="fw-bold">{userDetails.name || 'User'}</h4>
              <p className="text-muted mb-0">
                {userDetails.city}
                {userDetails.city && userDetails.state ? ', ' : ''}
                {userDetails.state}
              </p>
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 bg-primary text-white text-center">
            <Card.Body className="py-4">
              <FaRobot size={48} className="mb-3 opacity-75" />
              <h4>Try the AI Assistant</h4>
              <p className="small opacity-75">
                Your preferences below are used to give you the perfect restaurant recommendations.
              </p>
              <Button variant="light" className="rounded-pill fw-bold w-100">
                Chat Now
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <div className="bg-white p-4 rounded shadow-sm mb-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
              <h4 className="fw-bold mb-0">Personal Information</h4>

              {!isEditing ? (
                <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
                  <FaUserEdit className="me-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button variant="success" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Spinner size="sm" animation="border" className="me-1" />
                    ) : (
                      <FaSave className="me-1" />
                    )}
                    Save
                  </Button>

                  <Button variant="outline-secondary" onClick={handleCancel}>
                    <FaTimes className="me-1" />
                    Cancel
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
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
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
                      {COUNTRIES.map((c) => (
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
                      {US_STATES.map((s) => (
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
                      rows={4}
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