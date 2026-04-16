import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Card, Spinner, Alert } from 'react-bootstrap';
import {
    FaStar,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaClock,
    FaBookmark,
    FaGlobe,
} from 'react-icons/fa';
import axios from 'axios';
import ReviewModal from '../components/ReviewModal';

const USER_API = 'http://localhost:8001';
const RESTAURANT_API = 'http://localhost:8002';

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

const fallbackCuisineImage = (cuisine) =>
    CUISINE_IMAGES[cuisine] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80';

const getImageUrl = (restaurant) => {
    if (!restaurant?.image) return fallbackCuisineImage(restaurant?.cuisine);

    // Use direct remote URLs only
    if (restaurant.image.startsWith('http://') || restaurant.image.startsWith('https://')) {
        return restaurant.image;
    }

    // Ignore broken local upload paths for now and use fallback
    if (restaurant.image.startsWith('uploads/')) {
        return fallbackCuisineImage(restaurant?.cuisine);
    }

    return fallbackCuisineImage(restaurant?.cuisine);
};

const RestaurantDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [favouriteLoading, setFavouriteLoading] = useState(false);
    const [favouriteSuccess, setFavouriteSuccess] = useState('');

    const isLoggedIn = !!localStorage.getItem('auth_token');
    const role = localStorage.getItem('auth_role');
    const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');

    const fetchRestaurant = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${RESTAURANT_API}/restaurants/${id}`);
            setRestaurant(res.data);
        } catch (err) {
            setError('Failed to load restaurant details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurant();
    }, [id]);

    const handleAddFavourite = async () => {
        if (!isLoggedIn) {
            navigate('/auth');
            return;
        }

        setFavouriteLoading(true);
        setFavouriteSuccess('');

        try {
            await axios.post(
                `${USER_API}/favourites/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                }
            );
            setFavouriteSuccess('Added to favourites!');
            setTimeout(() => setFavouriteSuccess(''), 2500);
        } catch (err) {
            setFavouriteSuccess(err?.response?.data?.detail || 'Could not add to favourites.');
            setTimeout(() => setFavouriteSuccess(''), 3000);
        } finally {
            setFavouriteLoading(false);
        }
    };

    const handleReviewSubmitted = () => {
        setShowReviewModal(false);
        fetchRestaurant();
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error || 'Restaurant not found.'}</Alert>
            </Container>
        );
    }

    const imageUrl = getImageUrl(restaurant);

    return (
        <div className="restaurant-details-page">
            <div
                className="position-relative mb-4"
                style={{ height: '430px', width: '100%', overflow: 'hidden' }}
            >
                <img
                    src={imageUrl}
                    alt={restaurant.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.72 }}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackCuisineImage(restaurant.cuisine);
                    }}
                />

                <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.82))' }}
                ></div>

                <div className="position-absolute bottom-0 w-100">
                    <Container className="pb-4 pt-5 text-white">
                        <h1 className="display-4 fw-bold mb-2">{restaurant.name}</h1>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <Badge bg="danger" className="d-flex align-items-center fs-6 p-2">
                                <FaStar className="me-1" />
                                {restaurant.avg_rating > 0 ? Number(restaurant.avg_rating).toFixed(1) : '0'}
                                {` (${restaurant.review_count || 0} reviews)`}
                            </Badge>

                            <Badge bg="light" text="dark" className="fs-6 p-2">
                                {restaurant.price_range || '$'} • {restaurant.cuisine || 'Various'}
                            </Badge>

                            {restaurant.amenities && (
                                <Badge bg="secondary" className="fs-6 p-2">
                                    {restaurant.amenities}
                                </Badge>
                            )}
                        </div>
                    </Container>
                </div>
            </div>

            <Container>
                {favouriteSuccess && (
                    <Alert
                        variant={favouriteSuccess.includes('Added') ? 'success' : 'warning'}
                        className="mb-3"
                    >
                        {favouriteSuccess}
                    </Alert>
                )}

                <Row className="mb-4">
                    <Col md={8}>
                        <div className="d-flex gap-2 border-bottom pb-4 mb-4 flex-wrap">
                            {isLoggedIn && role === 'user' && (
                                <Button
                                    onClick={() => setShowReviewModal(true)}
                                    variant="primary"
                                    className="px-4"
                                >
                                    <FaStar className="me-2" /> Write a Review
                                </Button>
                            )}

                            {isLoggedIn && role === 'user' && (
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleAddFavourite}
                                    disabled={favouriteLoading}
                                >
                                    <FaBookmark className="me-2" />
                                    {favouriteLoading ? 'Saving...' : 'Save'}
                                </Button>
                            )}

                            {!isLoggedIn && (
                                <Button variant="outline-primary" onClick={() => navigate('/auth')}>
                                    Log in to Write a Review
                                </Button>
                            )}
                        </div>

                        <div className="mb-5">
                            <h3 className="fw-bold mb-3">Overview</h3>
                            <p className="fs-5 text-secondary mb-0">
                                {restaurant.description || 'No description available.'}
                            </p>
                        </div>

                        <div className="mb-5">
                            <h3 className="fw-bold mb-4">
                                Reviews{' '}
                                <Badge bg="secondary" pill>
                                    {restaurant.review_count || 0}
                                </Badge>
                            </h3>

                            {restaurant.reviews && restaurant.reviews.length > 0 ? (
                                restaurant.reviews.map((review) => {
                                    const isOwnReview =
                                        currentUser?.id && String(review.user_id) === String(currentUser.id);

                                    const avatarLetter = isOwnReview
                                        ? (currentUser?.name?.[0] || 'Y').toUpperCase()
                                        : 'U';

                                    const displayName = isOwnReview ? 'You' : `User ${String(review.user_id).slice(-4)}`;
                                    const starColor = '#28a745';

                                    return (
                                        <Card
                                            key={review.id}
                                            className="mb-3 shadow-sm border-0"
                                            style={{ borderRadius: '16px' }}
                                        >
                                            <Card.Body className="p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                            style={{
                                                                width: 46,
                                                                height: 46,
                                                                fontSize: 18,
                                                                background: isOwnReview
                                                                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                                                    : 'linear-gradient(135deg, #f093fb, #f5576c)',
                                                            }}
                                                        >
                                                            {avatarLetter}
                                                        </div>

                                                        <div>
                                                            <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                                                                {displayName}
                                                            </div>
                                                            <small className="text-muted">
                                                                {review.created_at
                                                                    ? new Date(review.created_at).toLocaleDateString('en-US', {
                                                                          year: 'numeric',
                                                                          month: 'long',
                                                                          day: 'numeric',
                                                                      })
                                                                    : ''}
                                                            </small>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex flex-column align-items-end gap-1">
                                                        <div className="d-flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <FaStar
                                                                    key={star}
                                                                    style={{
                                                                        color: star <= review.rating ? starColor : '#ddd',
                                                                        fontSize: '1rem',
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                            {review.rating}/5
                                                        </small>
                                                    </div>
                                                </div>

                                                <p
                                                    className="mb-2 text-dark"
                                                    style={{
                                                        fontSize: '0.92rem',
                                                        lineHeight: '1.6',
                                                        borderLeft: `3px solid ${starColor}`,
                                                        paddingLeft: '12px',
                                                        fontStyle: 'italic',
                                                    }}
                                                >
                                                    "{review.comment || 'No comment left.'}"
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    );
                                })
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <FaStar size={32} className="mb-3 opacity-25" />
                                    <p className="mb-0">No reviews yet. Be the first to review!</p>
                                </div>
                            )}
                        </div>
                    </Col>

                    <Col md={4}>
                        <Card className="shadow-sm border-0 sticky-top" style={{ top: '90px', borderRadius: '18px' }}>
                            <Card.Body className="p-4">
                                <h4 className="fw-bold mb-4">Contact & Hours</h4>

                                <div className="d-flex align-items-start gap-3 mb-3">
                                    <FaMapMarkerAlt className="text-danger mt-1" />
                                    <span>
                                        {restaurant.address || 'Address unavailable'}
                                        {restaurant.city ? `, ${restaurant.city}` : ''}
                                        {restaurant.zip_code ? `, ${restaurant.zip_code}` : ''}
                                    </span>
                                </div>

                                <div className="d-flex align-items-start gap-3 mb-3">
                                    <FaPhoneAlt className="text-danger mt-1" />
                                    <span>{restaurant.phone || 'Phone unavailable'}</span>
                                </div>

                                <div className="d-flex align-items-start gap-3 mb-3">
                                    <FaClock className="text-danger mt-1" />
                                    <span>{restaurant.hours_of_operation || 'Hours unavailable'}</span>
                                </div>

                                <div className="d-flex align-items-start gap-3">
                                    <FaGlobe className="text-danger mt-1" />
                                    {restaurant.website ? (
                                        <a href={restaurant.website} target="_blank" rel="noreferrer">
                                            {restaurant.website}
                                        </a>
                                    ) : (
                                        <span>Website unavailable</span>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <ReviewModal
                show={showReviewModal}
                handleClose={() => setShowReviewModal(false)}
                restaurantName={restaurant.name}
                restaurantId={restaurant.id}
                onReviewSubmitted={handleReviewSubmitted}
            />
        </div>
    );
};

export default RestaurantDetailsPage;