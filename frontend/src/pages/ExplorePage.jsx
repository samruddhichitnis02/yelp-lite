import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Badge, Spinner } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import RestaurantCard from '../components/RestaurantCard';
import api from '../services/api';

// const CUISINES = ['Italian', 'Japanese', 'American', 'Vegan', 'Mexican', 'Chinese', 'Indian', 'Thai', 'Korean', 'BBQ', 'Mediterranean', 'French', 'Vietnamese', 'Brazilian'];

const CUISINES = [
    { label: 'Italian', emoji: '🍝' },
    { label: 'Japanese', emoji: '🍣' },
    { label: 'American', emoji: '🍔' },
    { label: 'Vegan', emoji: '🥗' },
    { label: 'Mexican', emoji: '🌮' },
    { label: 'Chinese', emoji: '🥡' },
    { label: 'Indian', emoji: '🍛' },
    { label: 'Thai', emoji: '🍜' },
    { label: 'Korean', emoji: '🥩' },
    { label: 'BBQ', emoji: '🔥' },
    { label: 'Mediterranean', emoji: '🫒' },
    { label: 'French', emoji: '🥐' },
    { label: 'Vietnamese', emoji: '🍲' },
    { label: 'Brazilian', emoji: '🥩' },
];

// const KEYWORDS = ['wifi', 'outdoor seating', 'parking', 'family-friendly', 'romantic', 'quiet', 'reservations'];

const KEYWORDS = [
    { label: 'wifi', emoji: '📶' },
    { label: 'outdoor seating', emoji: '🌿' },
    { label: 'parking', emoji: '🅿️' },
    { label: 'family-friendly', emoji: '👨‍👩‍👧' },
    { label: 'romantic', emoji: '🕯️' },
    { label: 'quiet', emoji: '🤫' },
    { label: 'reservations', emoji: '📅' },
];

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
            <style>{`
                .hero-input::placeholder { color: rgba(255,255,255,0.4) !important; }
                .hero-input { color: #fff !important; }
                .pill-btn { transition: all 0.18s ease; }
                .pill-btn:hover { opacity: 1 !important; transform: translateY(-1px); }
            `}</style>

            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                padding: '56px 0 44px',
                marginBottom: '40px'
            }}>
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col md={10} lg={8}>
                            <h1 className="fw-bold mb-2" style={{ color: '#fff', fontSize: '2.6rem', letterSpacing: '-0.5px' }}>
                                Discover the Best <span style={{ color: '#e94560' }}>Restaurants</span> Near You
                            </h1>
                            <p className="mb-4" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem' }}>
                                Find your next favorite culinary experience
                            </p>

                            <Form onSubmit={handleSearch}>
                                {/* Main search bar */}
                                <div className="d-flex gap-2 mb-3" style={{
                                    background: 'rgba(255,255,255,0.07)',
                                    borderRadius: '14px',
                                    padding: '10px',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <Form.Control
                                        placeholder="Search by restaurant name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="hero-input border-0 flex-grow-1"
                                        style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '11px 18px', fontSize: '1rem' }}
                                    />
                                    <Button type="submit" style={{
                                        background: '#e94560', border: 'none', borderRadius: '8px',
                                        padding: '11px 26px', fontWeight: '600', whiteSpace: 'nowrap'
                                    }}>
                                        <FaSearch className="me-2" />Search
                                    </Button>
                                </div>

                                {/* Secondary filters */}
                                <Row className="g-2 mb-4">
                                    {[
                                        { placeholder: '🍽  Cuisine type (e.g. Italian)', value: cuisine, setter: setCuisine },
                                        { placeholder: '📍  City or zip code', value: location, setter: setLocation },
                                        { placeholder: '🔑  Keyword (e.g. wifi, quiet)', value: keyword, setter: setKeyword },
                                    ].map((f, i) => (
                                        <Col md={4} key={i}>
                                            <Form.Control
                                                placeholder={f.placeholder}
                                                value={f.value}
                                                onChange={(e) => f.setter(e.target.value)}
                                                className="hero-input"
                                                style={{
                                                    background: 'rgba(255,255,255,0.07)',
                                                    border: '1px solid rgba(255,255,255,0.13)',
                                                    borderRadius: '10px',
                                                    padding: '10px 16px',
                                                }}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </Form>

                            {/* Cuisine pills */}
                            <div className="mb-3">
                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                    <div style={{ height: '1px', width: '24px', background: 'rgba(255,255,255,0.2)' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Cuisine</span>
                                    <div style={{ height: '1px', width: '24px', background: 'rgba(255,255,255,0.2)' }} />
                                </div>
                                <div className="d-flex flex-wrap justify-content-center gap-2">
                                    {CUISINES.map(c => (
                                        <button key={c.label} type="button" className="pill-btn" onClick={() => handleCuisineClick(c.label)} style={{
                                            background: cuisine === c.label ? '#e94560' : 'rgba(255,255,255,0.07)',
                                            border: `1px solid ${cuisine === c.label ? '#e94560' : 'rgba(255,255,255,0.15)'}`,
                                            color: cuisine === c.label ? '#fff' : 'rgba(255,255,255,0.72)',
                                            borderRadius: '20px', padding: '6px 15px',
                                            fontSize: '0.82rem', fontWeight: '500', cursor: 'pointer',
                                        }}>{c.emoji} {c.label}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Keyword pills */}
                            <div>
                                <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                    <div style={{ height: '1px', width: '24px', background: 'rgba(255,255,255,0.2)' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Keywords</span>
                                    <div style={{ height: '1px', width: '24px', background: 'rgba(255,255,255,0.2)' }} />
                                </div>
                                <div className="d-flex flex-wrap justify-content-center gap-2">
                                    {KEYWORDS.map(k => (
                                        <button key={k.label} type="button" className="pill-btn" onClick={() => handleKeywordClick(k.label)} style={{
                                            background: keyword === k.label ? '#0f9b58' : 'rgba(255,255,255,0.06)',
                                            border: `1px solid ${keyword === k.label ? '#0f9b58' : 'rgba(255,255,255,0.12)'}`,
                                            color: keyword === k.label ? '#fff' : 'rgba(255,255,255,0.6)',
                                            borderRadius: '20px', padding: '6px 15px',
                                            fontSize: '0.82rem', fontWeight: '500', cursor: 'pointer',
                                        }}>{k.emoji} {k.label}</button>
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