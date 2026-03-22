import React, { useState } from 'react';
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
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    setError('');
    setSuccess('');
    setSearched(false);
    try {
      const res = await api.get('/restaurants/search', {
        params: { name: searchTerm }
      });
      // Only show unclaimed restaurants (owner_id is null)
      const unclaimed = res.data.filter(r => r.owner_id === null);
      setResults(unclaimed);
      setSearched(true);
    } catch (err) {
      setError('Failed to search restaurants.');
    } finally {
      setSearching(false);
    }
  };

  const handleClaim = async (restaurantId) => {
    setClaimingId(restaurantId);
    setError('');
    setSuccess('');
    try {
      await api.post(`/restaurants/${restaurantId}/claim`);
      setSuccess('Restaurant claimed successfully! Redirecting to dashboard...');
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
          Search for your restaurant in our database and claim ownership to manage it.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Search Bar */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <Form onSubmit={handleSearch}>
            <Form.Label className="fw-bold mb-2">Search by Restaurant Name</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="e.g. Pasta Paradise, Burger Joint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
              />
              <Button type="submit" variant="primary" disabled={searching}>
                {searching
                  ? <Spinner size="sm" animation="border" />
                  : <><FaSearch className="me-1" /> Search</>
                }
              </Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {/* Results */}
      {searched && (
        results.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <FaStore size={48} className="mb-3" />
            <h5>No unclaimed restaurants found for "{searchTerm}"</h5>
            <p>The restaurant may already be claimed, or try a different search term.</p>
            <Button variant="primary" onClick={() => navigate('/add-restaurant')}>
              Add a New Restaurant Instead
            </Button>
          </div>
        ) : (
          <>
            <p className="text-muted mb-3">{results.length} unclaimed restaurant(s) found</p>
            <Row>
              {results.map(r => (
                <Col key={r.id} md={6} lg={4} className="mb-4">
                  <Card className="shadow-sm border-0 h-100">
                    {r.image ? (
                      <Card.Img
                        variant="top"
                        src={`http://localhost:8000/${r.image}`}
                        style={{ height: '150px', objectFit: 'cover' }}
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
                        {r.cuisine} • {r.price_range}
                      </p>
                      <p className="text-muted small mb-2">
                        {r.address}, {r.city}, {r.state}
                      </p>
                      {r.hours_of_operation && (
                        <p className="text-muted small mb-2">
                          🕐 {r.hours_of_operation}
                        </p>
                      )}
                      <Badge bg="warning" text="dark" className="mb-3">
                        Unclaimed
                      </Badge>
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
        )
      )}
    </Container>
  );
};

export default ClaimRestaurantPage;