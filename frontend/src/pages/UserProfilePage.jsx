import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUserEdit, FaCamera, FaRobot, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const USER_API = 'http://localhost:8001';

const COUNTRIES = [
  'USA', 'Canada', 'UK', 'Australia', 'India', 'Germany', 'France',
  'Japan', 'China', 'Brazil', 'Mexico', 'Italy', 'Spain', 'Other'
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const DEFAULT_PROFILE =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80';

// 🔥 FIXED IMAGE HANDLING
const getProfilePicUrl = (profilePic, preview) => {
  if (preview) return preview;
  if (!profilePic) return DEFAULT_PROFILE;

  if (profilePic.startsWith('http')) return profilePic;

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

  // ✅ FETCH USER
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
        languages: u.languages || '',
        gender: u.gender || '',
        profile_pic: u.profile_pic || '',
      });
    } catch {
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

  // ✅ IMAGE SELECT
  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  // 🔥 FIXED SAVE FUNCTION
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('auth_token');

      const formData = new FormData();

      formData.append('name', userDetails.name || '');
      formData.append('phone', userDetails.phone || '');
      formData.append('about', userDetails.about || '');
      formData.append('city', userDetails.city || '');
      formData.append('state', userDetails.state || '');
      formData.append('country', userDetails.country || '');
      formData.append('languages', userDetails.languages || '');
      formData.append('gender', userDetails.gender || '');

      if (profilePicFile) {
        formData.append('profile_pic', profilePicFile);
      }

      const res = await axios.put(`${USER_API}/users/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const u = res.data;

      setUserDetails((prev) => ({
        ...prev,
        ...u,
      }));

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
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col lg={4} className="mb-4">

          <Card className="shadow-sm border-0 text-center">
            <Card.Body>

              <div className="position-relative mb-3">
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />

                {isEditing && (
                  <Button
                    className="position-absolute bottom-0 end-0 rounded-circle"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FaCamera />
                  </Button>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handlePicChange}
                />
              </div>

              <h4>{userDetails.name}</h4>
              <p className="text-muted">{userDetails.city}, {userDetails.state}</p>

            </Card.Body>
          </Card>

        </Col>

        <Col lg={8}>

          <Card className="p-4 shadow-sm border-0">

            <div className="d-flex justify-content-between mb-3">
              <h4>Personal Information</h4>

              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <FaUserEdit /> Edit
                </Button>
              ) : (
                <div>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Spinner size="sm" /> : <FaSave />} Save
                  </Button>
                  <Button variant="secondary" onClick={handleCancel} className="ms-2">
                    <FaTimes /> Cancel
                  </Button>
                </div>
              )}
            </div>

            <Form>
              <Form.Control name="name" value={userDetails.name} onChange={handleChange} disabled={!isEditing} className="mb-2" />
              <Form.Control value={userDetails.email} disabled className="mb-2" />
              <Form.Control name="phone" value={userDetails.phone} onChange={handleChange} disabled={!isEditing} className="mb-2" />
              <Form.Control name="city" value={userDetails.city} onChange={handleChange} disabled={!isEditing} className="mb-2" />
              <Form.Control name="state" value={userDetails.state} onChange={handleChange} disabled={!isEditing} className="mb-2" />
            </Form>

          </Card>

        </Col>
      </Row>
    </Container>
  );
};

export default UserProfilePage;