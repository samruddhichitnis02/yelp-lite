import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Tab, Nav } from 'react-bootstrap';
import { FaHistory, FaStar, FaUtensils, FaMapMarkerAlt, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const USER_API = '/api/users';
const RESTAURANT_API = '/api/restaurants';
const REVIEW_API = '/api/reviews';

const CUISINE_IMAGES = {
    Italian: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    Japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80',
    American: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80',
    Mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80',
    Chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80',
    Indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80',
    Thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&q=80',
    Korean: 'https://images.unsplash.com/photo-1583502236840-cd52cd6d3f34?w=1200&q=80',
    Mediterranean: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
    French: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    Vietnamese: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=1200&q=80',
    BBQ: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1200&q=80',
    Vegan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80',
    Brazilian: 'https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80',
};

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

const getCuisineImage = (restaurant) => {
    if (restaurant?.image) {
        if (restaurant.image.startsWith('http://') || restaurant.image.startsWith('https://')) {
            return restaurant.image;
        }
        return `${RESTAURANT_API}/${restaurant.image}`;
    }

    return (
        CUISINE_IMAGES[restaurant?.cuisine] ||
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
    );
};

const formatLocalDate = (value) => {
    if (!value) return 'Unknown date';

    const raw = String(value);
    const datePart = raw.includes('T') ? raw.split('T')[0] : raw;
    const [year, month, day] = datePart.split('-').map(Number);

    if (!year || !month || !day) {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return 'Unknown date';

        return parsed.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    const localDate = new Date(year, month - 1, day);

    return localDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const HistoryPage = () => {
    const [history, setHistory] = useState({
        restaurants_added: [],
        reviews_written: [],
    });
    const [restaurantNames, setRestaurantNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('auth_token');

                const res = await axios.get(`${USER_API}/me/history`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const historyData = res.data;
                setHistory(historyData);

                const restaurantIdsFromReviews = [
                    ...new Set(
                        (historyData.reviews_written || [])
                            .map((review) => review.restaurant_id)
                            .filter(Boolean)
                    ),
                ];

                const restaurantEntries = await Promise.all(
                    restaurantIdsFromReviews.map(async (restaurantId) => {
                        try {
                            const response = await axios.get(
                                `${RESTAURANT_API}/restaurants/${restaurantId}`
                            );
                            return [restaurantId, response.data.name];
                        } catch {
                            return [restaurantId, 'Restaurant'];
                        }
                    })
                );

                setRestaurantNames(Object.fromEntries(restaurantEntries));
            } catch (err) {
                console.error('Failed to load history:', err);
                setError('Failed to load history. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleDeleteReview = async (reviewId, e) => {
        e.stopPropagation();

        const confirmDelete = window.confirm('Are you sure you want to delete this review?');
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem('auth_token');

            await axios.delete(`${REVIEW_API}/${reviewId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setHistory((prev) => ({
                ...prev,
                reviews_written: prev.reviews_written.filter((review) => review.id !== reviewId),
            }));
        } catch (err) {
            console.error('Failed to delete review:', err);
            alert('Failed to delete review. Please try again.');
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
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold d-flex align-items-center gap-2">
                        <FaHistory className="text-primary" /> My History
                    </h2>
                    <p className="text-muted">
                        A record of all the restaurants you&apos;ve added and reviews you&apos;ve written.
                    </p>
                </Col>
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}

            <Tab.Container defaultActiveKey="restaurants">
                <Nav variant="tabs" className="mb-4 fw-semibold">
                    <Nav.Item>
                        <Nav.Link eventKey="restaurants">
                            <FaUtensils className="me-2" />
                            Restaurants Added
                            <Badge bg="primary" className="ms-2">
                                {history.restaurants_added.length}
                            </Badge>
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link eventKey="reviews">
                            <FaStar className="me-2" />
                            Reviews Written
                            <Badge bg="warning" text="dark" className="ms-2">
                                {history.reviews_written.length}
                            </Badge>
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
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
                                            className="h-100 shadow-sm border-0"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                                        >
                                            <Card.Img
                                                variant="top"
                                                src={getCuisineImage(restaurant)}
                                                style={{ height: '200px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src =
                                                        CUISINE_IMAGES[restaurant.cuisine] ||
                                                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
                                                }}
                                            />

                                            <Card.Body>
                                                <Card.Title className="fw-bold">{restaurant.name}</Card.Title>

                                                <div className="mb-2">
                                                    <Badge bg="light" text="dark" className="me-2 border">
                                                        {restaurant.cuisine || 'Restaurant'}
                                                    </Badge>
                                                </div>

                                                <Card.Text className="text-muted mb-2">
                                                    <FaMapMarkerAlt className="me-1 text-danger" />
                                                    {[restaurant.city, restaurant.state].filter(Boolean).join(', ')}
                                                </Card.Text>

                                                <div className="d-flex align-items-center mb-2">
                                                    <StarRating rating={Math.round(restaurant.avg_rating || 0)} />
                                                    <span className="ms-2 small text-muted">
                                                        {restaurant.avg_rating
                                                            ? Number(restaurant.avg_rating).toFixed(1)
                                                            : '0.0'}
                                                    </span>
                                                </div>

                                                <div className="fw-bold text-success">
                                                    {restaurant.price_range || '$'}
                                                </div>
                                            </Card.Body>

                                            <Card.Footer className="bg-transparent border-0 text-muted small">
                                                <FaCalendarAlt className="me-1" />
                                                Added {formatLocalDate(restaurant.created_at)}
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Tab.Pane>

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
                                                        {review.comment || (
                                                            <em className="text-muted">No comment left.</em>
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="d-flex align-items-start gap-2 ms-3">
                                                    <Badge
                                                        bg="light"
                                                        text="dark"
                                                        className="border text-muted flex-shrink-0"
                                                    >
                                                        {restaurantNames[review.restaurant_id] || 'Restaurant'}
                                                    </Badge>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={(e) => handleDeleteReview(review.id, e)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-muted small mt-2">
                                                <FaCalendarAlt className="me-1" />
                                                {formatLocalDate(review.created_at)}
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