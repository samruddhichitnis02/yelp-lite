import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const USER_API = 'http://localhost:8001';
const RESTAURANT_API = 'http://localhost:8002';

const HistoryPage = () => {
    const [history, setHistory] = useState({ restaurants_added: [], reviews_written: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('auth_token');

                const historyRes = await axios.get(`${USER_API}/me/history`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const rawHistory = historyRes.data;

                const enrichedReviews = await Promise.all(
                    (rawHistory.reviews_written || []).map(async (review) => {
                        try {
                            const restaurantRes = await axios.get(
                                `${RESTAURANT_API}/restaurants/${review.restaurant_id}`
                            );

                            return {
                                ...review,
                                restaurant: restaurantRes.data,
                            };
                        } catch (err) {
                            return {
                                ...review,
                                restaurant: null,
                            };
                        }
                    })
                );

                setHistory({
                    restaurants_added: rawHistory.restaurants_added || [],
                    reviews_written: enrichedReviews,
                });
            } catch (err) {
                console.error(err);
                setError('Failed to load history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">My Activity</h2>

            <h4 className="mt-4 mb-3">Restaurants Added</h4>
            {history.restaurants_added.length > 0 ? (
                <Row>
                    {history.restaurants_added.map((r) => (
                        <Col key={r.id} md={4} className="mb-4">
                            <Card className="h-100 shadow-sm border-0">
                                <Card.Img
                                    variant="top"
                                    src={
                                        r.image
                                            ? `${RESTAURANT_API}/${r.image}`
                                            : 'https://via.placeholder.com/400x220?text=Restaurant'
                                    }
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <Card.Body>
                                    <Card.Title className="fw-bold">{r.name}</Card.Title>
                                    <Card.Text className="text-muted mb-2">
                                        {r.city}{r.state ? `, ${r.state}` : ''}
                                    </Card.Text>
                                    <Card.Text>{r.description}</Card.Text>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Badge bg="primary">{r.cuisine || 'Restaurant'}</Badge>
                                        <Link to={`/restaurant/${r.id}`} className="btn btn-sm btn-outline-primary">
                                            View
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <p>No restaurants added yet.</p>
            )}

            <h4 className="mt-5 mb-3">Reviews Written</h4>
            {history.reviews_written.length > 0 ? (
                <Row>
                    {history.reviews_written.map((review) => {
                        const restaurant = review.restaurant;

                        return (
                            <Col key={review.id} md={6} className="mb-4">
                                <Card className="h-100 shadow-sm border-0">
                                    <Card.Img
                                        variant="top"
                                        src={
                                            restaurant?.image
                                                ? `${RESTAURANT_API}/${restaurant.image}`
                                                : 'https://via.placeholder.com/400x220?text=Restaurant'
                                        }
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <Card.Title className="fw-bold mb-1">
                                                    {restaurant?.name || 'Restaurant'}
                                                </Card.Title>
                                                <Card.Text className="text-muted mb-0">
                                                    {restaurant?.city || ''}
                                                    {restaurant?.state ? `, ${restaurant.state}` : ''}
                                                </Card.Text>
                                            </div>
                                            <Badge bg="warning" text="dark">
                                                Rating: {review.rating}
                                            </Badge>
                                        </div>

                                        <Card.Text className="mt-3">
                                            {review.comment || 'No comment provided.'}
                                        </Card.Text>

                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <small className="text-muted">
                                                {review.created_at
                                                    ? new Date(review.created_at).toLocaleDateString()
                                                    : ''}
                                            </small>

                                            {restaurant?.id && (
                                                <Link
                                                    to={`/restaurant/${restaurant.id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    View Restaurant
                                                </Link>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <p>No reviews written yet.</p>
            )}
        </Container>
    );
};

export default HistoryPage;