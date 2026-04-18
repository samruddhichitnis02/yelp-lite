import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, ProgressBar } from 'react-bootstrap';
import {
    FaStar,
    FaStore,
    FaHeart,
    FaCommentDots,
    FaChartLine,
    FaPlus,
    FaEdit,
    FaEye,
    FaChartBar,
    FaSyncAlt,
    FaTrash,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OWNER_API = 'http://localhost:8004';
const RESTAURANT_API = 'http://localhost:8002';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Extracted so the Refresh button can also call it
    const fetchDashboard = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');

            const res = await axios.get(`${OWNER_API}/owner/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = res.data;

            const restaurants = (data.restaurants || []).map((restaurant) => ({
                ...restaurant,
                review_count: restaurant.review_count || 0,
                avg_rating: restaurant.avg_rating || 0,
            }));

            const rating_distribution = [5, 4, 3, 2, 1].map((stars) => ({
                stars,
                count: (data.recent_reviews || []).filter((r) => r.rating === stars).length,
            }));

            const positive = (data.recent_reviews || []).filter((r) => r.rating >= 4).length;
            const neutral = (data.recent_reviews || []).filter((r) => r.rating === 3).length;
            const negative = (data.recent_reviews || []).filter((r) => r.rating <= 2).length;

            let sentimentLabel = 'Mixed';
            if (positive > negative) sentimentLabel = 'Positive';
            if (negative > positive) sentimentLabel = 'Negative';
            if (positive === 0 && neutral === 0 && negative === 0) sentimentLabel = 'No Data';

            setDashboardData({
                restaurants,
                review_count: data.review_count || 0,
                favourites_count: data.favourites_count || 0,
                avg_rating: data.avg_rating || 0,
                // Sum view_count fresh from the API response every time
                total_views: restaurants.reduce((sum, r) => sum + (r.view_count || 0), 0),
                recent_reviews: data.recent_reviews || [],
                rating_distribution,
                sentiment_summary: {
                    label: sentimentLabel,
                    score: 0,
                    positive,
                    neutral,
                    negative,
                },
            });
        } catch (err) {
            console.error('Failed to load dashboard:', err);
            setDashboardData({
                restaurants: [],
                review_count: 0,
                favourites_count: 0,
                avg_rating: 0,
                total_views: 0,
                recent_reviews: [],
                rating_distribution: [
                    { stars: 5, count: 0 },
                    { stars: 4, count: 0 },
                    { stars: 3, count: 0 },
                    { stars: 2, count: 0 },
                    { stars: 1, count: 0 },
                ],
                sentiment_summary: {
                    label: 'No Data',
                    score: 0,
                    positive: 0,
                    neutral: 0,
                    negative: 0,
                },
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleDelete = async (restaurantId, restaurantName) => {
        if (!window.confirm(`Are you sure you want to delete "${restaurantName}"? This will also remove all its reviews and favourites.`)) {
            return;
        }
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${RESTAURANT_API}/restaurants/${restaurantId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDashboard(true);
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to delete restaurant');
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" style={{ color: '#e94560' }} />
            </div>
        );
    }

    const sentiment = dashboardData?.sentiment_summary || {
        label: 'No Data',
        score: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
    };

    const totalDistributionReviews =
        (dashboardData?.rating_distribution || []).reduce((sum, item) => sum + item.count, 0);

    const totalSentiment = sentiment.positive + sentiment.neutral + sentiment.negative;

    const sentimentColor =
        sentiment.label === 'Positive'
            ? '#10b981'
            : sentiment.label === 'Negative'
              ? '#e94560'
              : sentiment.label === 'No Data'
                ? '#94a3b8'
                : '#3b82f6';

    const stats = [
        {
            label: 'Total Restaurants',
            value: dashboardData?.restaurants?.length ?? 0,
            icon: <FaStore size={22} />,
            color: '#6366f1',
            bg: 'rgba(99,102,241,0.08)',
        },
        {
            label: 'Total Views',
            value: dashboardData?.total_views ?? 0,
            icon: <FaEye size={22} />,
            color: '#0ea5e9',
            bg: 'rgba(14,165,233,0.08)',
        },
        {
            label: 'Total Favourites',
            value: dashboardData?.favourites_count ?? 0,
            icon: <FaHeart size={22} />,
            color: '#e94560',
            bg: 'rgba(233,69,96,0.08)',
        },
        {
            label: 'Avg Rating',
            value: dashboardData?.avg_rating ? Number(dashboardData.avg_rating).toFixed(1) : '0.0',
            icon: <FaStar size={22} />,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.08)',
        },
        {
            label: 'Total Reviews',
            value: dashboardData?.review_count ?? 0,
            icon: <FaCommentDots size={22} />,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.08)',
        },
    ];

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <style>{`
                .dash-stat-card {
                    border: none;
                    border-radius: 16px;
                    transition: transform 0.18s, box-shadow 0.18s;
                    cursor: default;
                }
                .dash-stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 28px rgba(0,0,0,0.10) !important;
                }
                .restaurant-row {
                    transition: background 0.15s;
                }
                .restaurant-row:hover {
                    background: #f8fafc;
                }
                .review-item {
                    border-left: 3px solid transparent;
                    transition: border-color 0.15s, background 0.15s;
                }
                .review-item:hover {
                    background: #f8fafc;
                    border-left-color: #e94560;
                }
                .action-btn {
                    border-radius: 8px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    padding: 5px 12px;
                    transition: all 0.15s;
                }
                .refresh-btn {
                    border-radius: 10px;
                    font-weight: 600;
                    background: rgba(255,255,255,0.1);
                    border: 1.5px solid rgba(255,255,255,0.25);
                    color: #fff;
                    transition: background 0.15s;
                }
                .refresh-btn:hover {
                    background: rgba(255,255,255,0.2) !important;
                    border-color: rgba(255,255,255,0.4) !important;
                    color: #fff !important;
                }
            `}</style>

            <div
                style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    padding: '36px 0 32px',
                    marginBottom: '32px',
                }}
            >
                <Container>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <FaChartLine style={{ color: '#e94560' }} />
                                <span
                                    style={{
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        letterSpacing: '1.5px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Owner Dashboard
                                </span>
                            </div>
                            <h2 style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '1.9rem' }}>
                                Welcome back 👋
                            </h2>
                            <p
                                style={{
                                    color: 'rgba(255,255,255,0.55)',
                                    margin: 0,
                                    marginTop: 4,
                                    fontSize: '0.92rem',
                                }}
                            >
                                Here&apos;s what&apos;s happening with your restaurants today.
                            </p>
                        </div>

                        <div className="d-flex gap-2 flex-wrap">
                            {/* ── Refresh button: re-fetches live view counts from the DB ── */}
                            <Button
                                className="refresh-btn"
                                onClick={() => fetchDashboard(true)}
                                disabled={refreshing}
                            >
                                {refreshing ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-2" />
                                        Refreshing...
                                    </>
                                ) : (
                                    <>
                                        <FaSyncAlt className="me-2" /> Refresh
                                    </>
                                )}
                            </Button>

                            <Button
                                as={Link}
                                to="/owner/claim"
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1.5px solid rgba(255,255,255,0.25)',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                }}
                            >
                                Claim Restaurant
                            </Button>
                            <Button
                                as={Link}
                                to="/add-restaurant"
                                style={{
                                    background: '#e94560',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 14px rgba(233,69,96,0.4)',
                                }}
                            >
                                <FaPlus className="me-2" /> Add Restaurant
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <Row className="mb-4">
                    {stats.map((s, i) => (
                        <Col key={i} lg={stats.length === 5 ? 2 : 3} md={4} sm={6} className="mb-3">
                            <Card className="dash-stat-card shadow-sm h-100" style={{ background: '#fff' }}>
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div
                                            style={{
                                                background: s.bg,
                                                color: s.color,
                                                width: 44,
                                                height: 44,
                                                borderRadius: 12,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {s.icon}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '2rem',
                                            fontWeight: 800,
                                            color: '#1e293b',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {s.value}
                                    </div>
                                    <div
                                        style={{
                                            color: '#64748b',
                                            fontSize: '0.82rem',
                                            fontWeight: 600,
                                            marginTop: 6,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                        }}
                                    >
                                        {s.label}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row>
                    <Col lg={7} className="mb-4">
                        <Card className="shadow-sm h-100" style={{ border: 'none', borderRadius: 16 }}>
                            <Card.Header
                                style={{
                                    background: '#fff',
                                    borderBottom: '1px solid #f1f5f9',
                                    borderRadius: '16px 16px 0 0',
                                    padding: '18px 24px',
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 style={{ fontWeight: 700, margin: 0, color: '#1e293b' }}>My Restaurants</h5>
                                        <small style={{ color: '#94a3b8' }}>{dashboardData?.restaurants?.length ?? 0} total</small>
                                    </div>
                                    <Button
                                        as={Link}
                                        to="/add-restaurant"
                                        size="sm"
                                        style={{
                                            background: '#e94560',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        <FaPlus className="me-1" /> Add New
                                    </Button>
                                </div>
                            </Card.Header>

                            <Card.Body className="p-0">
                                {dashboardData?.restaurants?.length > 0 ? (
                                    dashboardData.restaurants.map((r, idx) => (
                                        <div
                                            key={r.id}
                                            className="restaurant-row d-flex align-items-center justify-content-between px-4 py-3"
                                            style={{
                                                borderBottom:
                                                    idx < dashboardData.restaurants.length - 1 ? '1px solid #f1f5f9' : 'none',
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <div
                                                    style={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: 10,
                                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#fff',
                                                        fontWeight: 800,
                                                        fontSize: '1rem',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {r.name?.charAt(0)?.toUpperCase() || 'R'}
                                                </div>

                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>{r.name}</div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                                                        {r.cuisine || 'Cuisine N/A'} • {r.city || 'City N/A'}
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                                        <Badge bg="warning" text="dark">
                                                            <FaStar className="me-1" /> {r.avg_rating > 0 ? Number(r.avg_rating).toFixed(1) : 'New'}
                                                        </Badge>
                                                        <Badge bg="info">
                                                            <FaCommentDots className="me-1" /> {r.review_count || 0} reviews
                                                        </Badge>
                                                        <Badge bg="secondary">
                                                            <FaEye className="me-1" /> {r.view_count || 0} views
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-1">
                                                <Button
                                                    size="sm"
                                                    className="action-btn"
                                                    style={{
                                                        background: 'rgba(99,102,241,0.08)',
                                                        border: 'none',
                                                        color: '#6366f1',
                                                    }}
                                                    onClick={() => navigate('/owner/profile')}
                                                >
                                                    <FaEdit className="me-1" /> Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="action-btn"
                                                    style={{
                                                        background: 'rgba(16,185,129,0.08)',
                                                        border: 'none',
                                                        color: '#10b981',
                                                    }}
                                                    onClick={() => navigate(`/restaurant/${r.id}`)}
                                                >
                                                    <FaEye className="me-1" /> View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="action-btn"
                                                    style={{
                                                        background: 'rgba(239,68,68,0.08)',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                    }}
                                                    onClick={() => handleDelete(r.id, r.name)}
                                                >
                                                    <FaTrash className="me-1" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-5">
                                        <FaStore size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
                                        <p style={{ color: '#94a3b8', marginBottom: 12 }}>No restaurants yet</p>
                                        <Button
                                            as={Link}
                                            to="/add-restaurant"
                                            size="sm"
                                            style={{ background: '#e94560', border: 'none', borderRadius: 8 }}
                                        >
                                            Add Your First Restaurant
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={5} className="mb-4">
                        <Card className="shadow-sm h-100" style={{ border: 'none', borderRadius: 16 }}>
                            <Card.Header
                                style={{
                                    background: '#fff',
                                    borderBottom: '1px solid #f1f5f9',
                                    borderRadius: '16px 16px 0 0',
                                    padding: '18px 24px',
                                }}
                            >
                                <h5 style={{ fontWeight: 700, margin: 0, color: '#1e293b' }}>
                                    Overall Public Sentiment
                                </h5>
                            </Card.Header>

                            <Card.Body>
                                <div className="d-flex justify-content-end align-items-center mb-4">
                                    <Badge
                                        style={{
                                            background: sentimentColor,
                                            fontSize: '0.9rem',
                                            padding: '8px 14px',
                                            borderRadius: 10,
                                        }}
                                    >
                                        {sentiment.label}
                                    </Badge>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{ fontWeight: 600 }}>Positive</span>
                                        <span>{sentiment.positive}</span>
                                    </div>
                                    <ProgressBar now={sentiment.positive} max={Math.max(1, totalSentiment)} />
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{ fontWeight: 600 }}>Neutral</span>
                                        <span>{sentiment.neutral}</span>
                                    </div>
                                    <ProgressBar now={sentiment.neutral} max={Math.max(1, totalSentiment)} />
                                </div>

                                <div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span style={{ fontWeight: 600 }}>Negative</span>
                                        <span>{sentiment.negative}</span>
                                    </div>
                                    <ProgressBar now={sentiment.negative} max={Math.max(1, totalSentiment)} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col lg={6} className="mb-4">
                        <Card className="shadow-sm h-100" style={{ border: 'none', borderRadius: 16 }}>
                            <Card.Header
                                style={{
                                    background: '#fff',
                                    borderBottom: '1px solid #f1f5f9',
                                    borderRadius: '16px 16px 0 0',
                                    padding: '18px 24px',
                                }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <FaChartBar />
                                    <h5 style={{ fontWeight: 700, margin: 0, color: '#1e293b' }}>
                                        Ratings Distribution
                                    </h5>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {(dashboardData?.rating_distribution || []).map((item) => {
                                    const percentage = totalDistributionReviews
                                        ? (item.count / totalDistributionReviews) * 100
                                        : 0;

                                    return (
                                        <div key={item.stars} className="mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <span style={{ fontWeight: 600 }}>{item.stars} Stars</span>
                                                <span style={{ color: '#64748b' }}>{item.count}</span>
                                            </div>
                                            <ProgressBar now={percentage} />
                                        </div>
                                    );
                                })}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={6} className="mb-4">
                        <Card className="shadow-sm h-100" style={{ border: 'none', borderRadius: 16 }}>
                            <Card.Header
                                style={{
                                    background: '#fff',
                                    borderBottom: '1px solid #f1f5f9',
                                    borderRadius: '16px 16px 0 0',
                                    padding: '18px 24px',
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 style={{ fontWeight: 700, margin: 0, color: '#1e293b' }}>Recent Reviews</h5>
                                        <small style={{ color: '#94a3b8' }}>{dashboardData?.review_count ?? 0} total</small>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {dashboardData?.recent_reviews?.length > 0 ? (
                                    dashboardData.recent_reviews.map((review) => {
                                        const restaurantName =
                                            dashboardData.restaurants.find((r) => r.id === review.restaurant_id)?.name ||
                                            'Restaurant';
                                        const ratingColor =
                                            review.rating >= 4 ? '#10b981' : review.rating === 3 ? '#f59e0b' : '#e94560';

                                        return (
                                            <div
                                                key={review.id}
                                                className="review-item px-4 py-3"
                                                style={{ borderBottom: '1px solid #f1f5f9' }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <span
                                                            style={{
                                                                fontWeight: 700,
                                                                color: '#1e293b',
                                                                fontSize: '0.88rem',
                                                            }}
                                                        >
                                                            {restaurantName}
                                                        </span>
                                                        <div
                                                            style={{
                                                                color: '#94a3b8',
                                                                fontSize: '0.75rem',
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            background: `${ratingColor}18`,
                                                            color: ratingColor,
                                                            borderRadius: 8,
                                                            padding: '3px 10px',
                                                            fontWeight: 700,
                                                            fontSize: '0.82rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                        }}
                                                    >
                                                        <FaStar size={10} /> {review.rating}
                                                    </div>
                                                </div>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: '#475569',
                                                        fontSize: '0.85rem',
                                                        fontStyle: 'italic',
                                                    }}
                                                >
                                                    "{review.comment || 'No comment provided.'}"
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-5">
                                        <FaCommentDots size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
                                        <p style={{ color: '#94a3b8', margin: 0 }}>No reviews yet</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default OwnerDashboard;