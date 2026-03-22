import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import RestaurantCard from '../components/RestaurantCard';
import api from '../services/api';

const CUISINES = ['Italian', 'Japanese', 'American', 'Vegan', 'Mexican', 'Chinese', 'Indian', 'Thai', 'Korean', 'BBQ'];

const ExplorePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [location, setLocation] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRestaurants = async (params = {}) => {
        setLoading(true);
        try {
            const res = await api.get('/restaurants/search', { params });
            setRestaurants(res.data);
        } catch (err) {
            console.error('Failed to fetch restaurants:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchRestaurants({
            name: searchTerm || undefined,
            cuisine: cuisine || undefined,
            location: location || undefined,
        });
    };

    const handleCuisineClick = (c) => {
        setCuisine(c);
        setSearchTerm('');
        setLocation('');
        fetchRestaurants({ cuisine: c });
    };

    const handleClear = () => {
        setSearchTerm('');
        setCuisine('');
        setLocation('');
        fetchRestaurants();
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
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-0 px-4"
                                    />
                                    <Button type="submit" variant="primary" className="px-5">
                                        <FaSearch /> Search
                                    </Button>
                                </InputGroup>

                                <Row className="g-2 mb-3">
                                    <Col md={6}>
                                        <Form.Control
                                            placeholder="Filter by cuisine..."
                                            value={cuisine}
                                            onChange={(e) => setCuisine(e.target.value)}
                                            className="rounded-pill px-4"
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Control
                                            placeholder="Filter by city or zip..."
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="rounded-pill px-4"
                                        />
                                    </Col>
                                </Row>
                            </Form>

                            <div className="d-flex justify-content-center gap-2 flex-wrap mt-3">
                                {CUISINES.map(c => (
                                    <Badge
                                        key={c}
                                        bg={cuisine === c ? 'primary' : 'white'}
                                        text={cuisine === c ? 'white' : 'dark'}
                                        className="border px-3 py-2 rounded-pill"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleCuisineClick(c)}
                                    >
                                        {c}
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
                    <h3 className="fw-bold mb-0">
                        {cuisine ? `${cuisine} Restaurants` : 'All Restaurants'}
                    </h3>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-muted">{restaurants.length} results</span>
                        {(searchTerm || cuisine || location) && (
                            <Button variant="outline-secondary" size="sm" onClick={handleClear}>
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : restaurants.length > 0 ? (
                    <Row>
                        {restaurants.map(restaurant => (
                            <Col key={restaurant.id} xs={12} sm={6} md={4} lg={4} className="mb-4">
                                <RestaurantCard restaurant={restaurant} />
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="text-center py-5">
                        <h4 className="text-muted">No restaurants found.</h4>
                        <Button variant="link" onClick={handleClear}>Clear Search</Button>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default ExplorePage;