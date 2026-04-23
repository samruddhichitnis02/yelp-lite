import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button,
  InputGroup, Alert, Spinner, Badge
} from 'react-bootstrap';
import { FaSearch, FaStore, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ClaimRestaurantPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [allUnclaimed, setAllUnclaimed] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load all unclaimed restaurants on mount
  useEffect(() => {
    const fetchUnclaimed = async () => {
      try {
        const res = await api.get('/restaurants/search');
        const unclaimed = res.data.filter(r => r.owner_id === null);
        setAllUnclaimed(unclaimed);
        setResults(unclaimed);
      } catch (err) {
        setError('Failed to load restaurants.');
      } finally {
        setLoading(false);
      }
    };
    fetchUnclaimed();
  }, []);

  // Filter locally as user types
  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setResults(allUnclaimed);
    } else {
      setResults(allUnclaimed.filter(r =>
        r.name?.toLowerCase().includes(term) ||
        r.city?.toLowerCase().includes(term) ||
        r.cuisine?.toLowerCase().includes(term)
      ));
    }
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    // Live filter as they type
    const term = val.trim().toLowerCase();
    if (!term) {
      setResults(allUnclaimed);
    } else {
      setResults(allUnclaimed.filter(r =>
        r.name?.toLowerCase().includes(term) ||
        r.city?.toLowerCase().includes(term) ||
        r.cuisine?.toLowerCase().includes(term)
      ));
    }
  };

  const handleClaim = async (restaurantId) => {
    setClaimingId(restaurantId);
    setError('');
    setSuccess('');
    try {
      await api.post(`/restaurants/${restaurantId}/claim`);
      setSuccess('Restaurant claimed successfully! Redirecting to dashboard...');
      // Remove from list
      setAllUnclaimed(prev => prev.filter(r => r.id !== restaurantId));
      setResults(prev => prev.filter(r => r.id !== restaurantId));
      setTimeout(() => navigate('/owner/dashboard'), 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to claim restaurant.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2 className="fw-bold d-flex align-items-center">
          <FaStore className="me-2 text-primary" /> Claim Your Restaurant
        </h2>
        <p className="text-muted">
          Browse unclaimed restaurants below and claim ownership to manage it.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Search Bar */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <Form onSubmit={handleSearch}>
            <Form.Label className="fw-bold mb-2">Filter by name, city, or cuisine</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="e.g. Pasta Paradise, San Jose, Italian..."
                value={searchTerm}
                onChange={handleSearchInput}
                size="lg"
              />
              <Button type="submit" variant="primary">
                <FaSearch className="me-1" /> Search
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Loading unclaimed restaurants...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <FaStore size={48} className="mb-3" />
          <h5>No unclaimed restaurants found{searchTerm ? ` for "${searchTerm}"` : ''}</h5>
          <p>All restaurants may already be claimed, or try a different search.</p>
          <Button variant="primary" onClick={() => navigate('/add-restaurant')}>
            Add a New Restaurant Instead
          </Button>
        </div>
      ) : (
        <>
          <p className="text-muted mb-3">{results.length} unclaimed restaurant(s)</p>
          <Row>
            {results.map(r => (
              <Col key={r.id} md={6} lg={4} className="mb-4">
                <Card className="shadow-sm border-0 h-100">
                  {r.image ? (
                    <Card.Img
                      variant="top"
                      src={`/api/restaurants/${r.image}`}
                      style={{ height: '150px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center"
                      style={{ height: '150px' }}
                    >
                      <FaStore size={40} className="text-muted" />
                    </div>
                  )}
                  <Card.Body>
                    <h5 className="fw-bold mb-1">{r.name}</h5>
                    <p className="text-muted small mb-1">
                      {r.cuisine && `${r.cuisine}`}{r.cuisine && r.price_range && ' • '}{r.price_range}
                    </p>
                    <p className="text-muted small mb-2">
                      {[r.address, r.city, r.state].filter(Boolean).join(', ')}
                    </p>
                    {r.hours_of_operation && (
                      <p className="text-muted small mb-2">🕐 {r.hours_of_operation}</p>
                    )}
                    <Badge bg="warning" text="dark" className="mb-3">Unclaimed</Badge>
                    <div className="d-grid">
                      <Button
                        variant="primary"
                        onClick={() => handleClaim(r.id)}
                        disabled={claimingId === r.id}
                      >
                        {claimingId === r.id
                          ? <><Spinner size="sm" animation="border" className="me-1" />Claiming...</>
                          : <><FaCheck className="me-1" />Claim This Restaurant</>
                        }
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default ClaimRestaurantPage;