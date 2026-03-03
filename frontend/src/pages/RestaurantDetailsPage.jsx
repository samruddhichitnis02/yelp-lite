import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Card, ProgressBar, Nav, Tab } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaShare, FaBookmark } from 'react-icons/fa';

// Mock data (same as on Explore page for continuity)
const DUMMY_RESTAURANT = {
    id: 1,
    name: 'Pasta Paradise',
    cuisine: 'Italian',
    rating: 4.8,
    reviewCount: 342,
    location: '123 Main St, Downtown, CA 90001',
    phone: '(555) 123-4567',
    hours: 'Mon-Sun: 11:00 AM - 10:00 PM',
    priceRange: '$$',
    description: 'Authentic Italian cuisine made with love. We use only the freshest ingredients imported directly from Italy. Join us for a memorable dining experience featuring our signature handmade pasta and wood-fired pizzas.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'
    ],
    reviews: [
        { id: 101, user: 'Sarah M.', date: 'Oct 12, 2025', rating: 5, text: 'Absolutely amazing pasta! Will definitely come back.' },
        { id: 102, user: 'John D.', date: 'Sep 28, 2025', rating: 4, text: 'Great atmosphere but the wait was a bit long.' },
        { id: 103, user: 'Emily R.', date: 'Aug 15, 2025', rating: 5, text: 'The tiramisu is to die for. Highly recommend.' }
    ]
};

import ReviewModal from '../components/ReviewModal';

const RestaurantDetailsPage = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('menu');
    const [showReviewModal, setShowReviewModal] = useState(false);

    // In reality, you would fetch data using the ID:
    const restaurant = DUMMY_RESTAURANT;

    return (
        <div className="restaurant-details pb-5">
            <ReviewModal
                show={showReviewModal}
                handleClose={() => setShowReviewModal(false)}
                restaurantName={restaurant.name}
            />
            {/* Hero Banner with Image */}
            <div
                className="position-relative bg-dark mb-4"
                style={{
                    height: '350px',
                    width: '100%',
                    overflow: 'hidden'
                }}
            >
                <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                />
                <div className="position-absolute bottom-0 w-100" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                    <Container className="pb-4 pt-5 text-white">
                        <h1 className="display-4 fw-bold mb-2">{restaurant.name}</h1>
                        <div className="d-flex align-items-center gap-3">
                            <Badge bg="danger" className="d-flex align-items-center fs-6 p-2">
                                <FaStar className="me-1" /> {restaurant.rating} ({restaurant.reviewCount} reviews)
                            </Badge>
                            <Badge bg="light" text="dark" className="fs-6 p-2">{restaurant.priceRange} • {restaurant.cuisine}</Badge>
                        </div>
                    </Container>
                </div>
            </div>

            <Container>
                <Row className="mb-4">
                    <Col md={8}>
                        {/* Quick Actions */}
                        <div className="d-flex gap-2 border-bottom pb-4 mb-4">
                            <Button onClick={() => setShowReviewModal(true)} variant="primary" size="lg" className="px-4">
                                <FaStar className="me-2" /> Write a Review
                            </Button>
                            <Button variant="outline-secondary">
                                <FaShare className="me-2" /> Share
                            </Button>
                            <Button variant="outline-secondary">
                                <FaBookmark className="me-2" /> Save
                            </Button>
                        </div>

                        {/* Description & Overview */}
                        <h3 className="fw-bold mb-3">Overview</h3>
                        <p className="lead">{restaurant.description}</p>

                        <div className="mt-4 mb-5">
                            <h4 className="fw-bold mb-3">Photos</h4>
                            <div className="d-flex gap-3 overflow-auto pb-2">
                                {restaurant.images.map((img, idx) => (
                                    <img key={idx} src={img} alt={`Gallery ${idx}`} className="rounded shadow-sm" style={{ height: '150px', minWidth: '200px', objectFit: 'cover' }} />
                                ))}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="mt-5">
                            <h3 className="fw-bold mb-4">Reviews</h3>
                            {restaurant.reviews.map(review => (
                                <Card key={review.id} className="mb-3 border-0 border-bottom rounded-0 pb-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <div>
                                            <h6 className="fw-bold mb-0">{review.user}</h6>
                                            <small className="text-muted">{review.date}</small>
                                        </div>
                                        <Badge bg="danger" className="d-flex align-items-center align-self-start">
                                            <FaStar className="me-1" /> {review.rating}
                                        </Badge>
                                    </div>
                                    <Card.Text>{review.text}</Card.Text>
                                </Card>
                            ))}
                        </div>

                    </Col>

                    {/* Sidebar / Info Card */}
                    <Col md={4}>
                        <Card className="shadow-sm border-0 sticky-top" style={{ top: '90px' }}>
                            <Card.Body>
                                <h5 className="fw-bold mb-3">Contact & Hours</h5>
                                <ul className="list-unstyled mb-0">
                                    <li className="mb-3 d-flex align-items-start">
                                        <FaMapMarkerAlt className="text-danger mt-1 me-3 fs-5" />
                                        <span>{restaurant.location}</span>
                                    </li>
                                    <li className="mb-3 d-flex align-items-center">
                                        <FaPhoneAlt className="text-danger me-3 fs-5" />
                                        <span>{restaurant.phone}</span>
                                    </li>
                                    <li className="d-flex align-items-start">
                                        <FaClock className="text-danger mt-1 me-3 fs-5" />
                                        <span>{restaurant.hours}</span>
                                    </li>
                                </ul>
                                <hr />
                                <div className="d-grid mt-3">
                                    <Button variant="outline-primary" onClick={() => alert('Get Directions action')}>Get Directions</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default RestaurantDetailsPage;
