import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import { FaHistory, FaStar, FaUtensils, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StarRating = ({ rating }) => (
  <span>
    {[1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        size={14}
        color={star <= rating ? '#f5a623' : '#ddd'}
        className="me-1"
      />
    ))}
  </span>
);

const HistoryPage = () => {
  const [history, setHistory] = useState({ restaurants_added: [], reviews_written: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/me/history');
        setHistory(res.data);
      } catch (err) {
        setError('Failed to load history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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
          <h2 className="fw-bold d-flex align-items-center gap-2">
            <FaHistory className="text-primary" /> My History
          </h2>
          <p className="text-muted">A record of all the restaurants you've added and reviews you've written.</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tab.Container defaultActiveKey="restaurants">
        <Nav variant="tabs" className="mb-4 fw-semibold">
          <Nav.Item>
            <Nav.Link eventKey="restaurants">
              <FaUtensils className="me-2" />
              Restaurants Added
              <Badge bg="primary" className="ms-2">{history.restaurants_added.length}</Badge>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="reviews">
              <FaStar className="me-2" />
              Reviews Written
              <Badge bg="warning" text="dark" className="ms-2">{history.reviews_written.length}</Badge>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Restaurants Added Tab */}
          <Tab.Pane eventKey="restaurants">
            {history.restaurants_added.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FaUtensils size={48} className="mb-3 opacity-25" />
                <h5>No restaurants added yet</h5>
                <p>When you add a restaurant listing, it will appear here.</p>
              </div>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {history.restaurants_added.map((restaurant) => (
                  <Col key={restaurant.id}>
                    <Card
                      className="h-100 shadow-sm border-0 hover-shadow"
                      style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {restaurant.image ? (
                        <Card.Img
                          variant="top"
                          src={`http://localhost:8000/${restaurant.image}`}
                          style={{ height: '160px', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className="bg-light d-flex align-items-center justify-content-center"
                          style={{ height: '160px' }}
                        >
                          <FaUtensils size={40} className="text-muted opacity-25" />
                        </div>
                      )}
                      <Card.Body>
                        <Card.Title className="fw-bold mb-1">{restaurant.name}</Card.Title>
                        {restaurant.cuisine && (
                          <Badge bg="light" text="dark" className="mb-2 border">{restaurant.cuisine}</Badge>
                        )}
                        {(restaurant.city || restaurant.state) && (
                          <p className="text-muted small mb-1">
                            <FaMapMarkerAlt className="me-1" />
                            {[restaurant.city, restaurant.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                        <div className="d-flex align-items-center gap-2 mt-2">
                          <StarRating rating={Math.round(restaurant.avg_rating)} />
                          <span className="text-muted small">{restaurant.avg_rating?.toFixed(1)}</span>
                        </div>
                        {restaurant.price_range && (
                          <span className="text-success fw-bold small">{restaurant.price_range}</span>
                        )}
                      </Card.Body>
                      <Card.Footer className="bg-transparent border-0 text-muted small">
                        <FaCalendarAlt className="me-1" />
                        Added {restaurant.created_at ? new Date(restaurant.created_at).toLocaleDateString() : 'N/A'}
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab.Pane>

          {/* Reviews Written Tab */}
          <Tab.Pane eventKey="reviews">
            {history.reviews_written.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FaStar size={48} className="mb-3 opacity-25" />
                <h5>No reviews written yet</h5>
                <p>When you review a restaurant, it will appear here.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {history.reviews_written.map((review) => (
                  <Card
                    key={review.id}
                    className="shadow-sm border-0"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/restaurant/${review.restaurant_id}`)}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="mb-1">
                            <StarRating rating={review.rating} />
                            <span className="ms-2 fw-semibold">{review.rating} / 5</span>
                          </div>
                          <p className="mb-1 text-secondary">
                            {review.comment || <em className="text-muted">No comment left.</em>}
                          </p>
                        </div>
                        <Badge bg="outline-secondary" className="border text-muted ms-3 flex-shrink-0">
                          Restaurant #{review.restaurant_id}
                        </Badge>
                      </div>
                      <div className="text-muted small mt-2">
                        <FaCalendarAlt className="me-1" />
                        {review.created_at ? new Date(review.created_at + 'Z').toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                            }) : 'Unknown date'}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default HistoryPage;