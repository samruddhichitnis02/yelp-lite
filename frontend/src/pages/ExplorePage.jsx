import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import RestaurantCard from '../components/RestaurantCard';

const RESTAURANT_API = '/api/restaurants';

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

const KEYWORDS = [
    { label: 'wifi', emoji: '📶' },
    { label: 'outdoor seating', emoji: '🌿' },
    { label: 'parking', emoji: '🅿️' },
    { label: 'family-friendly', emoji: '👨‍👩‍👧' },
    { label: 'romantic', emoji: '🕯️' },
    { label: 'quiet', emoji: '🤫' },
    { label: 'reservations', emoji: '📅' },
];

const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1600&q=80',
];

const HERO_LABELS = [
    'Fine Dining Awaits',
    'Unforgettable Flavors',
    'Every Craving, Covered',
    'Your Table is Ready',
    'Fresh. Local. Delicious.',
    'Taste Something New',
];

const ExplorePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [location, setLocation] = useState('');
    const [keyword, setKeyword] = useState('');
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [nextSlide, setNextSlide] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showAllCuisines, setShowAllCuisines] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const next = (currentSlide + 1) % HERO_IMAGES.length;
            setNextSlide(next);
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentSlide(next);
                setIsTransitioning(false);
            }, 1000);
        }, 4500);
        return () => clearInterval(interval);
    }, [currentSlide]);

    const fetchRestaurants = async (params = {}) => {
        setLoading(true);
        try {
            const qs = new URLSearchParams();
            if (params.name) qs.append('name', params.name);
            if (params.location) qs.append('location', params.location);
            if (params.keyword) qs.append('keyword', params.keyword);
            if (params.selectedCuisines && params.selectedCuisines.length > 0) {
                params.selectedCuisines.forEach(c => qs.append('cuisine', c));
            }

            const url = `${RESTAURANT_API}/restaurants/search?${qs.toString()}`;
            const res = await axios.get(url);
            setRestaurants(res.data);
        } catch (err) {
            console.error('Failed to fetch restaurants:', err);
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchRestaurants({ name: searchTerm, selectedCuisines, location, keyword });
    };

    const handleCuisineClick = (label) => {
        const updated = selectedCuisines.includes(label)
            ? selectedCuisines.filter(c => c !== label)
            : [...selectedCuisines, label];
        setSelectedCuisines(updated);
        fetchRestaurants({ name: searchTerm, selectedCuisines: updated, location, keyword });
    };

    const handleKeywordClick = (label) => {
        const updated = keyword === label ? '' : label;
        setKeyword(updated);
        fetchRestaurants({ name: searchTerm, selectedCuisines, location, keyword: updated });
    };

    const handleClear = () => {
        setSearchTerm('');
        setSelectedCuisines([]);
        setLocation('');
        setKeyword('');
        fetchRestaurants();
    };

    const hasFilters = searchTerm || selectedCuisines.length > 0 || location || keyword;
    const visibleCuisines = showAllCuisines ? CUISINES : CUISINES.slice(0, 8);

    return (
        <div className="explore-page">
            <style>{`
                .hero-input::placeholder { color: rgba(255,255,255,0.6) !important; }
                .hero-input { color: #fff !important; }
                .hero-input:focus {
                    outline: none !important;
                    box-shadow: 0 0 0 2px rgba(233,69,96,0.6) !important;
                    border-color: rgba(233,69,96,0.8) !important;
                    background: rgba(255,255,255,0.22) !important;
                }
                .pill-btn {
                    transition: all 0.18s ease;
                    cursor: pointer;
                    border-radius: 20px;
                    padding: 7px 16px;
                    font-size: 0.83rem;
                    font-weight: 600;
                    color: #fff;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                    white-space: nowrap;
                }
                .pill-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                    opacity: 0.9;
                }
                .hero-bg-slide {
                    position: absolute; inset: 0;
                    background-size: cover;
                    background-position: center;
                    transition: opacity 1s ease-in-out;
                }
                .hero-label-badge {
                    display: inline-block;
                    background: rgba(233,69,96,0.85);
                    color: #fff;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                    padding: 5px 14px;
                    border-radius: 20px;
                    margin-bottom: 14px;
                    animation: fadeSlideUp 0.6s ease forwards;
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .slide-dots { display: flex; justify-content: center; gap: 7px; margin-top: 18px; }
                .slide-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    transition: all 0.3s ease; cursor: pointer;
                    border: none; padding: 0;
                }
                .slide-dot.active { background: #e94560; width: 22px; border-radius: 4px; }
            `}</style>

            <div style={{ position: 'relative', overflow: 'hidden', padding: '56px 0 44px', marginBottom: '40px' }}>
                <div className="hero-bg-slide" style={{ backgroundImage: `url(${HERO_IMAGES[currentSlide]})`, opacity: isTransitioning ? 0 : 1, zIndex: 0 }} />
                <div className="hero-bg-slide" style={{ backgroundImage: `url(${HERO_IMAGES[nextSlide]})`, opacity: isTransitioning ? 1 : 0, zIndex: 0 }} />
                <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(10,10,20,0.72) 0%, rgba(10,10,30,0.80) 60%, rgba(10,10,20,0.88) 100%)' }} />

                <Container style={{ position: 'relative', zIndex: 2 }}>
                    <Row className="justify-content-center text-center">
                        <Col md={10} lg={8}>
                            <div className="hero-label-badge" key={currentSlide}>{HERO_LABELS[currentSlide]}</div>
                            <h1 className="fw-bold mb-2" style={{ color: '#fff', fontSize: '2.6rem', letterSpacing: '-0.5px' }}>
                                Discover the Best <span style={{ color: '#e94560' }}>Restaurants</span> Near You
                            </h1>
                            <p className="mb-4" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem' }}>
                                Find your next favorite culinary experience
                            </p>

                            <Form onSubmit={handleSearch}>
                                <div className="d-flex gap-2 mb-3" style={{
                                    background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '8px',
                                    border: '1.5px solid rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                                }}>
                                    <Form.Control
                                        placeholder="Search by restaurant name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="hero-input border-0 flex-grow-1"
                                        style={{ background: 'transparent', borderRadius: '8px', padding: '11px 18px', fontSize: '1rem' }}
                                    />
                                    <Button type="submit" style={{
                                        background: '#e94560', border: 'none', borderRadius: '8px',
                                        padding: '11px 26px', fontWeight: '600', whiteSpace: 'nowrap',
                                        boxShadow: '0 2px 12px rgba(233,69,96,0.5)',
                                    }}>
                                        <FaSearch className="me-2" />Search
                                    </Button>
                                </div>

                                <Row className="g-2 mb-4">
                                    <Col md={4}>
                                        <Form.Control
                                            placeholder="🍽  Cuisine type (e.g. Italian)"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="hero-input"
                                            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.55)', borderRadius: '10px', padding: '10px 16px', backdropFilter: 'blur(12px)', fontWeight: '500', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Control
                                            placeholder="📍  City or zip code"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="hero-input"
                                            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.55)', borderRadius: '10px', padding: '10px 16px', backdropFilter: 'blur(12px)', fontWeight: '500', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Control
                                            placeholder="🔑  Keyword (e.g. wifi, quiet)"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            className="hero-input"
                                            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.55)', borderRadius: '10px', padding: '10px 16px', backdropFilter: 'blur(12px)', fontWeight: '500', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
                                        />
                                    </Col>
                                </Row>

                                <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                                    {visibleCuisines.map(c => (
                                        <button
                                            key={c.label}
                                            type="button"
                                            className="pill-btn"
                                            onClick={() => handleCuisineClick(c.label)}
                                            style={{
                                                background: selectedCuisines.includes(c.label) ? '#e94560' : 'rgba(255,255,255,0.18)',
                                                border: `1.5px solid ${selectedCuisines.includes(c.label) ? '#e94560' : 'rgba(255,255,255,0.55)'}`,
                                                boxShadow: selectedCuisines.includes(c.label) ? '0 0 14px rgba(233,69,96,0.6)' : 'none',
                                            }}
                                        >
                                            {c.emoji} {c.label}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        className="pill-btn"
                                        onClick={() => setShowAllCuisines(prev => !prev)}
                                        style={{ background: 'rgba(233,69,96,0.22)', border: '1.5px dashed rgba(233,69,96,0.8)', color: '#ffb3be' }}
                                    >
                                        {showAllCuisines ? '✕ Show less' : `+${CUISINES.length - 8} more`}
                                    </button>
                                </div>

                                <div>
                                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                                        <div style={{ height: '1px', width: '24px', background: 'rgba(255,255,255,0.35)' }} />
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase' }}>Keywords</span>
                                        <div style={{ height: '1px', width: '24px', background: 'rgba(255,255,255,0.35)' }} />
                                    </div>
                                    <div className="d-flex flex-wrap justify-content-center gap-2">
                                        {KEYWORDS.map(k => (
                                            <button
                                                key={k.label}
                                                type="button"
                                                className="pill-btn"
                                                onClick={() => handleKeywordClick(k.label)}
                                                style={{
                                                    background: keyword === k.label ? '#0f9b58' : 'rgba(255,255,255,0.18)',
                                                    border: `1.5px solid ${keyword === k.label ? '#0f9b58' : 'rgba(255,255,255,0.55)'}`,
                                                    boxShadow: keyword === k.label ? '0 0 14px rgba(15,155,88,0.5)' : 'none',
                                                }}
                                            >
                                                {k.emoji} {k.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="slide-dots">
                                    {HERO_IMAGES.map((_, i) => (
                                        <button key={i} className={`slide-dot${currentSlide === i ? ' active' : ''}`} onClick={() => setCurrentSlide(i)} aria-label={`Slide ${i + 1}`} />
                                    ))}
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold mb-0">
                            {selectedCuisines.length > 0 ? `${selectedCuisines.join(', ')} Restaurants` : keyword ? `"${keyword}" Results` : 'All Restaurants'}
                        </h3>
                        {hasFilters && (
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {searchTerm && <Badge bg="primary" className="px-2 py-1">Name: {searchTerm}</Badge>}
                                {selectedCuisines.map(c => <Badge key={c} bg="danger" className="px-2 py-1">Cuisine: {c}</Badge>)}
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
                        <Button variant="primary" onClick={handleClear}>Show All Restaurants</Button>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default ExplorePage;