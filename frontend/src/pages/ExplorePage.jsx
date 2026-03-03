import React, { useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import RestaurantCard from '../components/RestaurantCard';

// Dummy data to simulate backend response
const DUMMY_RESTAURANTS = [
    { id: 1, name: 'Pasta Paradise', cuisine: 'Italian', rating: 4.8, location: 'Downtown', priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
    { id: 2, name: 'Sushi Sakura', cuisine: 'Japanese', rating: 4.6, location: 'Westside', priceRange: '$$$', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80' },
    { id: 3, name: 'Burger Joint', cuisine: 'American', rating: 4.2, location: 'Uptown', priceRange: '$', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
    { id: 4, name: 'Green Leaf Cafe', cuisine: 'Vegan', rating: 4.9, location: 'Eastside', priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80' },
    { id: 5, name: 'Taco Fiesta', cuisine: 'Mexican', rating: 4.5, location: 'Downtown', priceRange: '$', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80' },
    { id: 6, name: 'Dragon Palace', cuisine: 'Chinese', rating: 4.3, location: 'Chinatown', priceRange: '$$', imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80' },
];

const ExplorePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRestaurants, setFilteredRestaurants] = useState(DUMMY_RESTAURANTS);

    const handleSearch = (e) => {
        e.preventDefault();
        const term = searchTerm.toLowerCase();
        const results = DUMMY_RESTAURANTS.filter(r =>
            r.name.toLowerCase().includes(term) ||
            r.cuisine.toLowerCase().includes(term) ||
            r.location.toLowerCase().includes(term)
        );
        setFilteredRestaurants(results);
    };

    return (
        <div className="explore-page">
            {/* Hero Section */}
            <div className="bg-light py-5 mb-5 border-bottom" style={{ backgroundImage: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col md={8}>
                            <h1 className="fw-bold mb-3">Discover Best Restaurants Around You</h1>
                            <p className="lead text-muted mb-4">Find your new favorite culinary experience. Be inspired.</p>

                            <Form onSubmit={handleSearch}>
                                <InputGroup className="mb-3 shadow-sm rounded-pill overflow-hidden" size="lg">
                                    <Form.Control
                                        placeholder="Search for restaurants, cuisine, or location..."
                                        aria-label="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-0 px-4"
                                    />
                                    <Button type="submit" variant="primary" className="px-5">
                                        <FaSearch /> Search
                                    </Button>
                                </InputGroup>
                            </Form>

                            <div className="d-flex justify-content-center gap-2 flex-wrap mt-3">
                                {['Italian', 'Japanese', 'American', 'Vegan', 'Mexican', 'Chinese'].map(cuisine => (
                                    <Badge
                                        key={cuisine}
                                        bg="white"
                                        text="dark"
                                        className="border px-3 py-2 custom-badge rounded-pill"
                                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => {
                                            setSearchTerm(cuisine);
                                            setFilteredRestaurants(DUMMY_RESTAURANTS.filter(r => r.cuisine === cuisine));
                                        }}
                                    >
                                        {cuisine}
                                    </Badge>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Main Content */}
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0">Recommended For You</h3>
                    <span className="text-muted">{filteredRestaurants.length} results</span>
                </div>

                <Row>
                    {filteredRestaurants.length > 0 ? (
                        filteredRestaurants.map(restaurant => (
                            <Col key={restaurant.id} xs={12} sm={6} md={4} lg={4} className="mb-4">
                                <RestaurantCard restaurant={restaurant} />
                            </Col>
                        ))
                    ) : (
                        <Col className="text-center py-5">
                            <h4 className="text-muted">No restaurants found matching your criteria.</h4>
                            <Button variant="link" onClick={() => setFilteredRestaurants(DUMMY_RESTAURANTS)}>Clear Search</Button>
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default ExplorePage;
