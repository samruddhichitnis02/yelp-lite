import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaHeart, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CUISINE_IMAGES = {
    'Italian': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    'Japanese': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
    'American': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    'Mexican': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    'Chinese': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    'Thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
    'Korean': 'https://images.unsplash.com/photo-1583502236840-cd52cd6d3f34?w=600&q=80',
    'Mediterranean': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    'French': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    'Vietnamese': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&q=80',
    'BBQ': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
    'Vegan': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'Brazilian': 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80',
};

const FavouritesPage = () => {
    const navigate = useNavigate();
    const [favourites, setFavourites] = useState([]);
    const [restaurants, setRestaurants] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [removingId, setRemovingId] = useState(null);

    const fetchFavourites = async () => {
        setLoading(true);
        try {
            const res = await api.get('/favourites/');
            const favs = res.data;
            setFavourites(favs);

            // Fetch restaurant details for each favourite
            const restaurantDetails = {};
            await Promise.all(
                favs.map(async (fav) => {
                    try {
                        const r = await api.get(`/restaurants/${fav.restaurant_id}`);
                        restaurantDetails[fav.restaurant_id] = r.data;
                    } catch (e) {
                        console.error(`Failed to fetch restaurant ${fav.restaurant_id}`);
                    }
                })
            );
            setRestaurants(restaurantDetails);
        } catch (err) {
            setError('Failed to load favourites.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavourites();
    }, []);

    const handleRemove = async (restaurantId) => {
        setRemovingId(restaurantId);
        try {
            await api.delete(`/favourites/${restaurantId}`);
            setFavourites(prev => prev.filter(f => f.restaurant_id !== restaurantId));
        } catch (err) {
            setError('Failed to remove from favourites.');
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="fw-bold mb-1">
                        <FaHeart className="text-danger me-2" /> My Favourites
                    </h2>
                    <p className="text-muted mb-0">Restaurants you have saved</p>
                </div>
                <span className="text-muted">{favourites.length} saved</span>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {favourites.length === 0 ? (
                <div className="text-center py-5">
                    <FaHeart size={60} className="text-muted mb-4" />
                    <h4 className="text-muted">No favourites yet</h4>
                    <p className="text-muted">Start exploring and save restaurants you love!</p>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        Explore Restaurants
                    </Button>
                </div>
            ) : (
                <Row>
                    {favourites.map(fav => {
                        const restaurant = restaurants[fav.restaurant_id];
                        if (!restaurant) return null;

                        const imageUrl = restaurant.image
                            ? `http://localhost:8000/${restaurant.image}`
                            : CUISINE_IMAGES[restaurant.cuisine] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80';

                        const location = [restaurant.city, restaurant.state]
                            .filter(Boolean)
                            .join(', ');

                        return (
                            <Col key={fav.id} xs={12} sm={6} md={4} className="mb-4">
                                <Card className="h-100 shadow-sm border-0 overflow-hidden">
                                    <div style={{ height: '4px', backgroundColor: 'var(--primary-color)' }}></div>
                                    <Card.Img
                                        variant="top"
                                        src={imageUrl}
                                        style={{ height: '180px', objectFit: 'cover' }}
                                        alt={restaurant.name}
                                    />
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <Card.Title className="mb-0 fw-bold">{restaurant.name}</Card.Title>
                                            <Badge bg="danger" className="d-flex align-items-center">
                                                <FaStar className="me-1" />
                                                {restaurant.avg_rating > 0 ? restaurant.avg_rating.toFixed(1) : 'New'}
                                            </Badge>
                                        </div>

                                        <Card.Subtitle className="mb-2 text-muted d-flex align-items-center">
                                            <FaMapMarkerAlt className="me-1 text-danger" />
                                            {location || 'Location not specified'}
                                        </Card.Subtitle>

                                        <div className="mb-3">
                                            <Badge bg="light" text="dark" className="me-2 rounded-pill border">
                                                {restaurant.cuisine}
                                            </Badge>
                                            <Badge bg="light" text="dark" className="rounded-pill border">
                                                {restaurant.price_range}
                                            </Badge>
                                        </div>

                                        <Card.Text className="text-muted small flex-grow-1">
                                            {restaurant.description
                                                ? restaurant.description.length > 80
                                                    ? restaurant.description.substring(0, 80) + '...'
                                                    : restaurant.description
                                                : 'A wonderful place to dine.'}
                                        </Card.Text>

                                        <div className="d-flex gap-2 mt-auto">
                                            <Button
                                                as={Link}
                                                to={`/restaurant/${restaurant.id}`}
                                                variant="outline-primary"
                                                className="flex-grow-1 rounded-pill"
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                className="rounded-pill"
                                                onClick={() => handleRemove(restaurant.id)}
                                                disabled={removingId === restaurant.id}
                                            >
                                                {removingId === restaurant.id
                                                    ? <Spinner size="sm" animation="border" />
                                                    : <FaTrash />
                                                }
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </Container>
    );
};

export default FavouritesPage;