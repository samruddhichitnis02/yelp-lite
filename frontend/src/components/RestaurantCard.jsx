import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
    const CUISINE_IMAGES = {
    'Italian': [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
        'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80',
        'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=600&q=80',
    ],
    'Japanese': [
        'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
        'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80',
        'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80',
    ],
    'American': [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
        'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=600&q=80',
        'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
    ],
    'Mexican': [
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
        'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&q=80',
        'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&q=80',
    ],
    'Chinese': [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
        'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&q=80',
        'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
    ],
    'Indian': [
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
        'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80',
    ],
    'Thai': [
        'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
        'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&q=80',
        'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600&q=80',
    ],
    'Korean': [
        'https://images.unsplash.com/photo-1583502236840-cd52cd6d3f34?w=600&q=80',
        'https://images.unsplash.com/photo-1557580293-15b8a4df7b67?w=600&q=80',
        'https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=600&q=80',
    ],
    'Mediterranean': [
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&q=80',
        'https://images.unsplash.com/photo-1540914124281-342587941389?w=600&q=80',
    ],
    'French': [
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
        'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    ],
    'Vietnamese': [
        'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&q=80',
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
        'https://images.unsplash.com/photo-1609253448756-8b4ca0880e3d?w=600&q=80',
    ],
    'BBQ': [
        'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
        'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80',
    ],
    'Vegan': [
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80',
    ],
    'Brazilian': [
        'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    ],
};

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80',
];

const getCuisineImage = (cuisine, id) => {
    const images = CUISINE_IMAGES[cuisine] || FALLBACK_IMAGES;
    return images[id % images.length];
};

const imageUrl = restaurant.image
    ? `http://localhost:8000/${restaurant.image}`
    : getCuisineImage(restaurant.cuisine, restaurant.id);

    const location = [restaurant.city, restaurant.state]
        .filter(Boolean)
        .join(', ');

    return (
        <Card className="h-100 shadow-sm border-0 mb-4 restaurant-card position-relative overflow-hidden">
            <div style={{ height: '4px', backgroundColor: 'var(--primary-color)' }}></div>
            <Card.Img
                variant="top"
                src={imageUrl}
                style={{ height: '200px', objectFit: 'cover' }}
                alt={restaurant.name}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80';
                }}
            />
            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0 fw-bold">{restaurant.name}</Card.Title>
                    <Badge bg="danger" className="d-flex align-items-center">
                        <FaStar className="me-1" /> {restaurant.avg_rating > 0 ? restaurant.avg_rating.toFixed(1) : 'New'}
                    </Badge>
                </div>

                <Card.Subtitle className="mb-2 text-muted d-flex align-items-center">
                    <FaMapMarkerAlt className="me-1 text-danger" /> {location || 'Location not specified'}
                </Card.Subtitle>

                <div className="mb-3">
                    <Badge bg="light" text="dark" className="me-2 rounded-pill border">
                        {restaurant.cuisine || 'Various'}
                    </Badge>
                    <Badge bg="light" text="dark" className="rounded-pill border">
                        {restaurant.price_range || '$'}
                    </Badge>
                </div>

                <Card.Text className="text-muted small flex-grow-1">
                    {restaurant.description
                        ? restaurant.description.length > 80
                            ? restaurant.description.substring(0, 80) + '...'
                            : restaurant.description
                        : 'A wonderful place to dine and enjoy great food.'}
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