import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Card, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import {
    FaStar,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaClock,
    FaBookmark,
    FaGlobe,
    FaEdit,
    FaTrash,
    FaCamera,
} from 'react-icons/fa';
import ReviewModal from '../components/ReviewModal';

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

const fallbackCuisineImage = (cuisine) =>
    CUISINE_IMAGES[cuisine] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80';

const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) return photoPath;
    return `${RESTAURANT_API}/${photoPath}`;
};

const getHeroImageUrl = (restaurant, restaurantPhotos) => {
    if (restaurantPhotos && restaurantPhotos.length > 0) {
        return getPhotoUrl(restaurantPhotos[0].photo_path);
    }
    if (!restaurant?.image) return fallbackCuisineImage(restaurant?.cuisine);
    if (restaurant.image.startsWith('http://') || restaurant.image.startsWith('https://')) {
        return restaurant.image;
    }
    if (restaurant.image.startsWith('uploads/')) {
        return `${RESTAURANT_API}/${restaurant.image}`;
    }
    return fallbackCuisineImage(restaurant?.cuisine);
};

// ── Edit Review Modal ──────────────────────────────────────────────────────────
const EditReviewModal = ({ show, handleClose, review, onUpdated }) => {
    const dispatch = useDispatch();
    const [rating, setRating] = useState(review?.rating || 0);
    const [hover, setHover] = useState(null);
    const [comment, setComment] = useState(review?.comment || '');
    const loading = useSelector(state => state.review.submitting);
    const error = useSelector(state => state.review.error);

    useEffect(() => {
        if (review) {
            /* eslint-disable react-hooks/set-state-in-effect */
            setRating(review.rating || 0);
            setComment(review.comment || '');
            /* eslint-enable react-hooks/set-state-in-effect */
            dispatch({ type: 'review/clearReviewError' });
        }
    }, [review, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { return; }
        try {
            await dispatch(updateReview({ reviewId: review.id, rating, comment })).unwrap();
            handleClose();
            if (onUpdated) onUpdated();
        } catch (err) {
            // Error is handled in redux state
            console.error(err);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Edit Your Review</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <div className="text-center mb-4">
                        <h5 className="text-muted mb-3">Update your rating</h5>
                        <div className="d-flex justify-content-center gap-2">
                            {[...Array(5)].map((_, index) => {
                                const currentRating = index + 1;
                                return (
                                    <FaStar
                                        key={index}
                                        size={40}
                                        style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                        color={currentRating <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                                        onClick={() => setRating(currentRating)}
                                        onMouseEnter={() => setHover(currentRating)}
                                        onMouseLeave={() => setHover(null)}
                                    />
                                );
                            })}
                        </div>
                        {rating > 0 && (
                            <p className="mt-2 text-primary fw-bold">
                                {['Terrible', 'Poor', 'Average', 'Good', 'Excellent'][rating - 1]}
                            </p>
                        )}
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Comment</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Update your comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100 rounded-pill fw-bold py-2" disabled={loading}>
                        {loading
                            ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</>
                            : 'Save Changes'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
import { useSelector, useDispatch } from 'react-redux';
import { fetchRestaurantById, selectCurrentRestaurant, selectRestaurantLoading } from '../store/slices/restaurantSlice';
import { fetchReviewPhotos, selectReviewPhotos, deleteReview, updateReview } from '../store/slices/reviewSlice';
import { addFavourite, selectFavouriteLoading } from '../store/slices/favouriteSlice';
import { selectAuthRole, selectAuthUser, selectIsAuthenticated } from '../store/slices/authSlice';

// ── Main Page ──────────────────────────────────────────────────────────────────
const RestaurantDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const restaurant = useSelector(selectCurrentRestaurant);
    const loading = useSelector(selectRestaurantLoading);
    const reviewPhotos = useSelector(selectReviewPhotos);
    const favouriteLoading = useSelector(selectFavouriteLoading);
    const isLoggedIn = useSelector(selectIsAuthenticated);
    const role = useSelector(selectAuthRole);
    const currentUser = useSelector(selectAuthUser);

    const [error, setError] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [favouriteSuccess, setFavouriteSuccess] = useState('');
    const [lightboxPhoto, setLightboxPhoto] = useState(null);

    const [editingReview, setEditingReview] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);

    const fetchRestaurantData = async () => {
        try {
            const result = await dispatch(fetchRestaurantById(id)).unwrap();

            // Fetch review photos for every review
            const reviews = result?.reviews || [];
            reviews.forEach(review => {
                dispatch(fetchReviewPhotos(review.id));
            });
        } catch (err) {
            setError(err || 'Failed to load restaurant details.');
        }
    };

    useEffect(() => {
        fetchRestaurantData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, dispatch]);

    const handleAddFavourite = async () => {
        if (!isLoggedIn) { navigate('/auth'); return; }
        setFavouriteSuccess('');
        try {
            await dispatch(addFavourite(id)).unwrap();
            setFavouriteSuccess('Added to favourites!');
            setTimeout(() => setFavouriteSuccess(''), 2500);
        } catch (err) {
            setFavouriteSuccess(err || 'Could not add to favourites.');
            setTimeout(() => setFavouriteSuccess(''), 3000);
        }
    };

    const handleReviewSubmitted = () => {
        setShowReviewModal(false);
        fetchRestaurantData();
    };

    const handleOpenEdit = (review) => {
        setEditingReview(review);
        setShowEditModal(true);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Delete this review?')) return;
        setDeleteLoadingId(reviewId);
        try {
            await dispatch(deleteReview(reviewId)).unwrap();
            fetchRestaurantData();
        } catch (err) {
            alert(err || 'Failed to delete review.');
        } finally {
            setDeleteLoadingId(null);
        }
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

    const heroImageUrl = getHeroImageUrl(restaurant, restaurant?.photos);

    return (
        <div className="restaurant-details-page">

            {/* ── Hero Banner ── */}
            <div className="position-relative mb-4" style={{ height: '430px', width: '100%', overflow: 'hidden' }}>
                <img
                    src={heroImageUrl}
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
                />
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
                                <Badge bg="secondary" className="fs-6 p-2">{restaurant.amenities}</Badge>
                            )}
                            {restaurant.photos && restaurant.photos.length > 0 && (
                                <Badge bg="dark" className="fs-6 p-2">
                                    <FaCamera className="me-1" />
                                    {restaurant.photos.length} photo{restaurant.photos.length !== 1 ? 's' : ''}
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

                        {/* ── Action buttons ── */}
                        <div className="d-flex gap-2 border-bottom pb-4 mb-4 flex-wrap">
                            {isLoggedIn && role === 'user' && (
                                <Button onClick={() => setShowReviewModal(true)} variant="primary" className="px-4">
                                    <FaStar className="me-2" /> Write a Review
                                </Button>
                            )}
                            {isLoggedIn && role === 'user' && (
                                <Button variant="outline-secondary" onClick={handleAddFavourite} disabled={favouriteLoading}>
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

                        {/* ── Overview ── */}
                        <div className="mb-5">
                            <h3 className="fw-bold mb-3">Overview</h3>
                            <p className="fs-5 text-secondary mb-0">
                                {restaurant.description || 'No description available.'}
                            </p>
                        </div>

                        {/* ── Restaurant Photo Gallery ── */}
                        {restaurant.photos && restaurant.photos.length > 0 && (
                            <div className="mb-5">
                                <h3 className="fw-bold mb-4">
                                    Photos{' '}
                                    <Badge bg="secondary" pill>{restaurant.photos.length}</Badge>
                                </h3>
                                <Row xs={2} md={3} className="g-2">
                                    {restaurant.photos.map((photo) => (
                                        <Col key={photo.id}>
                                            <div
                                                className="rounded overflow-hidden"
                                                style={{ height: '160px', cursor: 'pointer' }}
                                                onClick={() => setLightboxPhoto(getPhotoUrl(photo.photo_path))}
                                            >
                                                <img
                                                    src={getPhotoUrl(photo.photo_path)}
                                                    alt="Restaurant"
                                                    style={{
                                                        width: '100%', height: '100%', objectFit: 'cover',
                                                        transition: 'transform 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        )}

                        {/* ── Reviews ── */}
                        <div className="mb-5">
                            <h3 className="fw-bold mb-4">
                                Reviews{' '}
                                <Badge bg="secondary" pill>{restaurant.review_count || 0}</Badge>
                            </h3>

                            {restaurant.reviews && restaurant.reviews.length > 0 ? (
                                restaurant.reviews.map((review) => {
                                    const isOwnReview =
                                        currentUser?.id && String(review.user_id) === String(currentUser.id);
                                    const avatarLetter = isOwnReview
                                        ? (currentUser?.name?.[0] || 'Y').toUpperCase()
                                        : 'U';
                                    const displayName = isOwnReview
                                        ? 'You'
                                        : `User ${String(review.user_id).slice(-4)}`;
                                    const starColor = '#28a745';

                                    return (
                                        <Card key={review.id} className="mb-3 shadow-sm border-0" style={{ borderRadius: '16px' }}>
                                            <Card.Body className="p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                            style={{
                                                                width: 46, height: 46, fontSize: 18,
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
                                                                {review.updated_at && review.updated_at !== review.created_at && (
                                                                    <span className="ms-1 text-muted fst-italic">(edited)</span>
                                                                )}
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
                                                        {isOwnReview && (
                                                            <div className="d-flex gap-1 mt-1">
                                                                <Button
                                                                    variant="outline-primary" size="sm"
                                                                    className="py-0 px-2" style={{ fontSize: '0.75rem' }}
                                                                    onClick={() => handleOpenEdit(review)}
                                                                >
                                                                    <FaEdit className="me-1" />Edit
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger" size="sm"
                                                                    className="py-0 px-2" style={{ fontSize: '0.75rem' }}
                                                                    disabled={deleteLoadingId === review.id}
                                                                    onClick={() => handleDeleteReview(review.id)}
                                                                >
                                                                    {deleteLoadingId === review.id
                                                                        ? <Spinner size="sm" animation="border" />
                                                                        : <><FaTrash className="me-1" />Delete</>}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="mb-2 text-dark" style={{
                                                    fontSize: '0.92rem', lineHeight: '1.6',
                                                    borderLeft: `3px solid ${starColor}`,
                                                    paddingLeft: '12px', fontStyle: 'italic',
                                                }}>
                                                    "{review.comment || 'No comment left.'}"
                                                </p>

                                                {/* ── Review Photos ── */}
                                                {reviewPhotos[review.id] && reviewPhotos[review.id].length > 0 && (
                                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                                        {reviewPhotos[review.id].map((photo, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={`/api/reviews/${photo.photo_path}`}
                                                                alt="review"
                                                                style={{
                                                                    width: '90px',
                                                                    height: '90px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '10px',
                                                                    cursor: 'pointer',
                                                                    border: '2px solid #f1f5f9',
                                                                }}
                                                                onClick={() => setLightboxPhoto(`/api/reviews/${photo.photo_path}`)}
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
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

                    {/* ── Sidebar ── */}
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

            {/* ── Lightbox ── */}
            {lightboxPhoto && (
                <div
                    onClick={() => setLightboxPhoto(null)}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.88)',
                        zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'zoom-out',
                    }}
                >
                    <img
                        src={lightboxPhoto}
                        alt="Full size"
                        style={{
                            maxWidth: '90vw', maxHeight: '90vh',
                            borderRadius: '12px', objectFit: 'contain',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightboxPhoto(null)}
                        style={{
                            position: 'absolute', top: 24, right: 32,
                            background: 'none', border: 'none',
                            color: '#fff', fontSize: '2rem', cursor: 'pointer',
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* ── New Review Modal ── */}
            <ReviewModal
                show={showReviewModal}
                handleClose={() => setShowReviewModal(false)}
                restaurantName={restaurant.name}
                restaurantId={restaurant.id}
                onReviewSubmitted={handleReviewSubmitted}
            />

            {/* ── Edit Review Modal ── */}
            {editingReview && (
                <EditReviewModal
                    show={showEditModal}
                    handleClose={() => { setShowEditModal(false); setEditingReview(null); }}
                    review={editingReview}
                    onUpdated={() => {
                        setShowEditModal(false);
                        setEditingReview(null);
                        fetchRestaurantData();
                    }}
                />
            )}
        </div>
    );
};

export default RestaurantDetailsPage;