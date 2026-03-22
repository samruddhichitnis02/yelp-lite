import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaShare, FaBookmark, FaGlobe } from 'react-icons/fa';
import ReviewModal from '../components/ReviewModal';
import api from '../services/api';

const CUISINE_IMAGES = {
    'Italian': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    'Japanese': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80',
    'American': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80',
    'Mexican': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80',
    'Chinese': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80',
    'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80',
    'Thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=1200&q=80',
    'Korean': 'https://images.unsplash.com/photo-1583502236840-cd52cd6d3f34?w=1200&q=80',
    'Mediterranean': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
    'French': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    'Vietnamese': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=1200&q=80',
    'BBQ': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1200&q=80',
    'Vegan': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80',
    'Brazilian': 'https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80',
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
            const res = await api.get(`/restaurants/${id}`);
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
        try {
            await api.post('/favourites/', { restaurant_id: parseInt(id) });
            setFavouriteSuccess('Added to favourites!');
            setTimeout(() => setFavouriteSuccess(''), 3000);
        } catch (err) {
            setFavouriteSuccess(err?.response?.data?.detail || 'Could not add to favourites.');
            setTimeout(() => setFavouriteSuccess(''), 3000);
        } finally {
            setFavouriteLoading(false);
        }
    };

    const handleReviewSubmitted = () => {
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
            <Container className="py-5 text-center">
                <h4 className="text-muted">{error || 'Restaurant not found.'}</h4>
                <Button variant="primary" onClick={() => navigate('/')}>Back to Explore</Button>
            </Container>
        );
    }

    const imageUrl = restaurant.image
        ? `http://localhost:8000/${restaurant.image}`
        : CUISINE_IMAGES[restaurant.cuisine] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80';

    const fullAddress = [restaurant.address, restaurant.city, restaurant.state, restaurant.zip_code]
        .filter(Boolean)
        .join(', ');

    return (
        <div className="restaurant-details pb-5">
            <ReviewModal
                show={showReviewModal}
                handleClose={() => setShowReviewModal(false)}
                restaurantName={restaurant.name}
                restaurantId={restaurant.id}
                onReviewSubmitted={handleReviewSubmitted}
            />

            {/* Hero Banner */}
            <div
                className="position-relative bg-dark mb-4"
                style={{ height: '350px', width: '100%', overflow: 'hidden' }}
            >
                <img
                    src={imageUrl}
                    alt={restaurant.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                />
                <div className="position-absolute bottom-0 w-100" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                    <Container className="pb-4 pt-5 text-white">
                        <h1 className="display-4 fw-bold mb-2">{restaurant.name}</h1>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                            <Badge bg="danger" className="d-flex align-items-center fs-6 p-2">
                                <FaStar className="me-1" />
                                {restaurant.avg_rating > 0 ? restaurant.avg_rating.toFixed(1) : 'New'}
                                {restaurant.review_count > 0 && ` (${restaurant.review_count} reviews)`}
                            </Badge>
                            <Badge bg="light" text="dark" className="fs-6 p-2">
                                {restaurant.price_range} • {restaurant.cuisine}
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
                    <Alert variant={favouriteSuccess.includes('Added') ? 'success' : 'warning'} className="mb-3">
                        {favouriteSuccess}
                    </Alert>
                )}

                <Row className="mb-4">
                    <Col md={8}>
                        {/* Quick Actions */}
                        <div className="d-flex gap-2 border-bottom pb-4 mb-4 flex-wrap">
                            {isLoggedIn && role === 'user' && (
                                <Button
                                    onClick={() => setShowReviewModal(true)}
                                    variant="primary"
                                    size="lg"
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

                        {/* Description */}
                        <h3 className="fw-bold mb-3">Overview</h3>
                        <p className="lead">{restaurant.description || 'No description available.'}</p>

                        {/* Reviews Section */}
                        <div className="mt-5">
                            <h3 className="fw-bold mb-4">
                                Reviews
                                {restaurant.review_count > 0 && (
                                    <Badge bg="secondary" className="ms-2 fs-6">{restaurant.review_count}</Badge>
                                )}
                            </h3>

                            {restaurant.reviews && restaurant.reviews.length > 0 ? (
                                restaurant.reviews.map(review => {
                                    const isOwnReview = currentUser?.id === review.user_id;
                                    return (
                                        <Card key={review.id} className="mb-3 border-0 border-bottom rounded-0 pb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <div>
                                                    <h6 className="fw-bold mb-0">
                                                        {isOwnReview ? 'You' : `User #${review.user_id}`}
                                                    </h6>
                                                    <small className="text-muted">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </small>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Badge bg="danger" className="d-flex align-items-center">
                                                        <FaStar className="me-1" /> {review.rating}
                                                    </Badge>
                                                    {isOwnReview && (
                                                        <ReviewActions
                                                            review={review}
                                                            restaurantId={restaurant.id}
                                                            onDone={handleReviewSubmitted}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <Card.Text>{review.comment}</Card.Text>
                                        </Card>
                                    );
                                })
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <p>No reviews yet. Be the first to review!</p>
                                </div>
                            )}
                        </div>
                    </Col>

                    {/* Sidebar */}
                    <Col md={4}>
                        <Card className="shadow-sm border-0 sticky-top" style={{ top: '90px' }}>
                            <Card.Body>
                                <h5 className="fw-bold mb-3">Contact & Hours</h5>
                                <ul className="list-unstyled mb-0">
                                    {fullAddress && (
                                        <li className="mb-3 d-flex align-items-start">
                                            <FaMapMarkerAlt className="text-danger mt-1 me-3 fs-5 flex-shrink-0" />
                                            <span>{fullAddress}</span>
                                        </li>
                                    )}
                                    {restaurant.phone && (
                                        <li className="mb-3 d-flex align-items-center">
                                            <FaPhoneAlt className="text-danger me-3 fs-5 flex-shrink-0" />
                                            <span>{restaurant.phone}</span>
                                        </li>
                                    )}
                                    {restaurant.hours_of_operation && (
                                        <li className="mb-3 d-flex align-items-start">
                                            <FaClock className="text-danger mt-1 me-3 fs-5 flex-shrink-0" />
                                            <span>{restaurant.hours_of_operation}</span>
                                        </li>
                                    )}
                                    {restaurant.website && (
                                        <li className="d-flex align-items-center">
                                            <FaGlobe className="text-danger me-3 fs-5 flex-shrink-0" />
                                            <a href={restaurant.website} target="_blank" rel="noreferrer" className="text-truncate">
                                                {restaurant.website}
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

// Inline component for edit/delete buttons on own reviews
const ReviewActions = ({ review, restaurantId, onDone }) => {
    const [editing, setEditing] = useState(false);
    const [rating, setRating] = useState(review.rating);
    const [comment, setComment] = useState(review.comment);
    const [saving, setSaving] = useState(false);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            await api.put(`/reviews/${review.id}`, { rating, comment });
            setEditing(false);
            onDone();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await api.delete(`/reviews/${review.id}`);
            onDone();
        } catch (err) {
            console.error(err);
        }
    };

    if (editing) {
        return (
            <div className="mt-2 w-100">
                <select
                    className="form-select mb-2"
                    value={rating}
                    onChange={e => setRating(parseInt(e.target.value))}
                >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                </select>
                <textarea
                    className="form-control mb-2"
                    rows={2}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />
                <div className="d-flex gap-2">
                    <Button size="sm" variant="success" onClick={handleUpdate} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={() => setEditing(false)}>
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex gap-1">
            <Button size="sm" variant="outline-primary" onClick={() => setEditing(true)}>Edit</Button>
            <Button size="sm" variant="outline-danger" onClick={handleDelete}>Delete</Button>
        </div>
    );
};

export default RestaurantDetailsPage;