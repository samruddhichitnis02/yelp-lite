import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import RestaurantCard from '../components/RestaurantCard';
import api from '../services/api';

const CUISINES = ['Italian', 'Japanese', 'American', 'Vegan', 'Mexican', 'Chinese', 'Indian', 'Thai', 'Korean', 'BBQ', 'Mediterranean', 'French', 'Vietnamese', 'Brazilian'];

const KEYWORDS = ['wifi', 'outdoor seating', 'parking', 'family-friendly', 'romantic', 'quiet', 'reservations'];

const ExplorePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [location, setLocation] = useState('');
    const [keyword, setKeyword] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRestaurants = async (params = {}) => {
        setLoading(true);
        try {
            // Remove undefined/empty params
            const cleanParams = Object.fromEntries(
                Object.entries(params).filter(([_, v]) => v)
            );
            const res = await api.get('/restaurants/search', { params: cleanParams });
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
            name: searchTerm,
            cuisine: cuisine,
            location: location,
            keyword: keyword,
        });
    };

    const handleCuisineClick = (c) => {
        const newCuisine = cuisine === c ? '' : c;
        setCuisine(newCuisine);
        fetchRestaurants({
            name: searchTerm,
            cuisine: newCuisine,
            location: location,
            keyword: keyword,
        });
    };

    const handleKeywordClick = (k) => {
        const newKeyword = keyword === k ? '' : k;
        setKeyword(newKeyword);
        fetchRestaurants({
            name: searchTerm,
            cuisine: cuisine,
            location: location,
            keyword: newKeyword,
        });
    };

    const handleClear = () => {
        setSearchTerm('');
        setCuisine('');
        setLocation('');
        setKeyword('');
        fetchRestaurants();
    };

    const hasFilters = searchTerm || cuisine || location || keyword;

    return (
        <div className="explore-page">
            {/* Hero Section */}
            <div className="bg-light py-5 mb-5 border-bottom" style={{ backgroundImage: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col md={9}>
                            <h1 className="fw-bold mb-3">Discover Best Restaurants Around You</h1>
                            <p className="lead text-muted mb-4">Find your new favorite culinary experience. Be inspired.</p>

                            <Form onSubmit={handleSearch}>
                                {/* Main search bar */}
                                <InputGroup className="mb-3 shadow-sm rounded-pill overflow-hidden" size="lg">
                                    <Form.Control
                                        placeholder="Search by restaurant name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-0 px-4"
                                    />
                                    <Button type="submit" variant="primary" className="px-5">
                                        <FaSearch className="me-1" /> Search
                                    </Button>
                                </InputGroup>

                                {/* Cuisine + Location filters */}
                                <Row className="g-2 mb-3">
                                    <Col md={4}>
                                        <Form.Control
                                            placeholder="Cuisine type (e.g. Italian)"
                                            value={cuisine}
                                            onChange={(e) => setCuisine(e.target.value)}
                                            className="rounded-pill px-4 border"
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Control
                                            placeholder="City or zip code"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="rounded-pill px-4 border"
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Control
                                            placeholder="Keyword (e.g. wifi, quiet)"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            className="rounded-pill px-4 border"
                                        />
                                    </Col>
                                </Row>
                            </Form>

                            {/* Cuisine quick badges */}
                            <div className="mb-2">
                                <small className="text-muted fw-bold me-2">CUISINE:</small>
                                <div className="d-inline-flex flex-wrap gap-2">
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
                            </div>

                            {/* Keyword quick badges */}
                            <div className="mt-2">
                                <small className="text-muted fw-bold me-2">KEYWORDS:</small>
                                <div className="d-inline-flex flex-wrap gap-2">
                                    {KEYWORDS.map(k => (
                                        <Badge
                                            key={k}
                                            bg={keyword === k ? 'success' : 'white'}
                                            text={keyword === k ? 'white' : 'dark'}
                                            className="border px-3 py-2 rounded-pill"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleKeywordClick(k)}
                                        >
                                            {k}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Main Content */}
            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-0">
                            {cuisine ? `${cuisine} Restaurants` : keyword ? `"${keyword}" Results` : 'All Restaurants'}
                        </h3>
                        {hasFilters && (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {searchTerm && <Badge bg="primary" className="px-2 py-1">Name: {searchTerm}</Badge>}
                                {cuisine && <Badge bg="primary" className="px-2 py-1">Cuisine: {cuisine}</Badge>}
                                {location && <Badge bg="primary" className="px-2 py-1">Location: {location}</Badge>}
                                {keyword && <Badge bg="success" className="px-2 py-1">Keyword: {keyword}</Badge>}
                            </div>
                        )}
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-muted">{restaurants.length} results</span>
                        {hasFilters && (
                            <Button variant="outline-secondary" size="sm" onClick={handleClear}>
                                <FaTimes className="me-1" /> Clear All
                            </Button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-3">Loading restaurants...</p>
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
                        <FaSearch size={48} className="text-muted mb-3" />
                        <h4 className="text-muted">No restaurants found.</h4>
                        <p className="text-muted">Try adjusting your search filters.</p>
                        <Button variant="primary" onClick={handleClear}>
                            Show All Restaurants
                        </Button>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default ExplorePage;