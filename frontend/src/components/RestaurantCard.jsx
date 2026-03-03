import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
    return (
        <Card className="h-100 shadow-sm border-0 mb-4 restaurant-card position-relative overflow-hidden">
            {/* Decorative top border color for premium feel */}
            <div style={{ height: '4px', backgroundColor: 'var(--primary-color)' }}></div>
            <Card.Img
                variant="top"
                src={restaurant.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                style={{ height: '200px', objectFit: 'cover' }}
                alt={restaurant.name}
            />
            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0 fw-bold">{restaurant.name}</Card.Title>
                    <Badge bg="danger" className="d-flex align-items-center">
                        <FaStar className="me-1" /> {restaurant.rating}
                    </Badge>
                </div>

                <Card.Subtitle className="mb-2 text-muted d-flex align-items-center">
                    <FaMapMarkerAlt className="me-1 text-danger" /> {restaurant.location}
                </Card.Subtitle>

                <div className="mb-3">
                    <Badge bg="light" text="dark" className="me-2 rounded-pill border">
                        {restaurant.cuisine}
                    </Badge>
                    <Badge bg="light" text="dark" className="rounded-pill border">
                        {restaurant.priceRange}
                    </Badge>
                </div>

                <Card.Text className="text-muted small flex-grow-1">
                    {restaurant.description || "A wonderful place to dine and enjoy great food with friends and family."}
                </Card.Text>

                <Button
                    as={Link}
                    to={`/restaurant/${restaurant.id}`}
                    variant="outline-primary"
                    className="mt-auto w-100 rounded-pill"
                >
                    View Details
                </Button>
            </Card.Body>
        </Card>
    );
};

export default RestaurantCard;
