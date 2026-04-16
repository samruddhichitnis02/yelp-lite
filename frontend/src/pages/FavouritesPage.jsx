import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaMapMarkerAlt, FaStar, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const USER_API = 'http://localhost:8001';

const CUISINE_IMAGES = {
  Italian: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  Japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
  American: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
  Mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
  Chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
  Indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  Thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
  Korean: 'https://images.unsplash.com/photo-1583502236840-cd52cd6d3f34?w=600&q=80',
  Mediterranean: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
  French: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  Vegan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
};

const FALLBACK =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

const getImage = (r) => {
  if (!r.image) return CUISINE_IMAGES[r.cuisine] || FALLBACK;

  if (r.image.startsWith('http')) return r.image;

  if (r.image.startsWith('uploads/')) {
    return CUISINE_IMAGES[r.cuisine] || FALLBACK;
  }

  return CUISINE_IMAGES[r.cuisine] || FALLBACK;
};

const FavouritesPage = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavourites = async () => {
    try {
      const token = localStorage.getItem('auth_token');

      const res = await axios.get(`${USER_API}/favourites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ DIRECT USE — NO EXTRA FETCH
      setFavourites(res.data);
    } catch (err) {
      setError('Failed to load favourites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const handleRemove = async (restaurantId) => {
    try {
      const token = localStorage.getItem('auth_token');

      await axios.delete(`${USER_API}/favourites/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavourites((prev) =>
        prev.filter((r) => r.id !== restaurantId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner /></div>;

  if (error) return (
    <Container className="py-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between mb-4 border-bottom pb-3">
        <div>
          <h2 className="fw-bold">
            <FaHeart className="text-danger me-2" />
            My Favourites
          </h2>
          <p className="text-muted mb-0">Restaurants you have saved</p>
        </div>
        <span className="text-muted">{favourites.length} saved</span>
      </div>

      <Row>
        {favourites.map((r) => {
          const location = [r.city, r.state].filter(Boolean).join(', ');

          return (
            <Col key={r.id} md={4} className="mb-4">
              <Card className="shadow-sm border-0 h-100">

                <Card.Img
                  variant="top"
                  src={getImage(r)}
                  style={{ height: '180px', objectFit: 'cover' }}
                />

                <Card.Body className="d-flex flex-column">

                  <div className="d-flex justify-content-between">
                    <Card.Title className="fw-bold">{r.name}</Card.Title>
                    <Badge bg="danger">
                      <FaStar className="me-1" />
                      {r.avg_rating > 0 ? r.avg_rating.toFixed(1) : 'New'}
                    </Badge>
                  </div>

                  <Card.Text className="text-muted">
                    <FaMapMarkerAlt className="me-1 text-danger" />
                    {location}
                  </Card.Text>

                  <div className="mb-2">
                    <Badge bg="light" text="dark" className="me-2">
                      {r.cuisine}
                    </Badge>
                    <Badge bg="light" text="dark">
                      {r.price_range}
                    </Badge>
                  </div>

                  <Card.Text className="small flex-grow-1">
                    {r.description}
                  </Card.Text>

                  <div className="d-flex gap-2 mt-auto">
                    <Button
                      as={Link}
                      to={`/restaurant/${r.id}`}
                      variant="outline-primary"
                      className="w-100"
                    >
                      View Details
                    </Button>

                    <Button
                      variant="outline-danger"
                      onClick={() => handleRemove(r.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>

                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default FavouritesPage;