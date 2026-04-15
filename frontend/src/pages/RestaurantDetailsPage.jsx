import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const RESTAURANT_API = 'http://localhost:8002';
const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

const getImageSrc = (image) => {
    if (!image) return FALLBACK_IMAGE;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${RESTAURANT_API}/${image}`;
};

const RestaurantDetailsPage = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const res = await axios.get(`${RESTAURANT_API}/restaurants/${id}`);
                setRestaurant(res.data);
            } catch (err) {
                setError('Failed to load restaurant details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [id]);

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

    if (!restaurant) return null;

    return (
        <Container className="py-5">
            <Row>
                <Col md={6}>
                    <img
                        src={getImageSrc(restaurant.image)}
                        alt={restaurant.name}
                        className="img-fluid rounded"
                        style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }}
                    />
                </Col>

                <Col md={6}>
                    <h2>{restaurant.name}</h2>
                    <p className="text-muted">{restaurant.cuisine}</p>

                    <p>{restaurant.description}</p>

                    <p><strong>Address:</strong> {restaurant.address}, {restaurant.city}</p>
                    <p><strong>Phone:</strong> {restaurant.phone}</p>
                    <p><strong>Price Range:</strong> {restaurant.price_range}</p>
                    <p><strong>Rating:</strong> {restaurant.avg_rating}</p>
                </Col>
            </Row>

            <hr />

            <h4>Reviews</h4>

            {restaurant.reviews && restaurant.reviews.length > 0 ? (
                restaurant.reviews.map((review) => (
                    <Card key={review.id} className="mb-3">
                        <Card.Body>
                            <strong>Rating: {review.rating}</strong>
                            <p>{review.comment}</p>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <p>No reviews yet.</p>
            )}
        </Container>
    );
};

export default RestaurantDetailsPage;