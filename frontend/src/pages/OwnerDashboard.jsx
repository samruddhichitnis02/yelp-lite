import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { FaStar, FaStore, FaEye, FaCommentDots } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const OwnerDashboard = () => {
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/restaurants/owner/dashboard')
            .then(res => {
                setDashboardData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load dashboard:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="fw-bold mb-1">Owner Dashboard</h2>
                    <p className="text-muted mb-0">Manage your businesses and track analytics.</p>
                </div>
                <Button as={Link} to="/add-restaurant" variant="primary" className="fw-bold px-4">
                    <FaStore className="me-2" />
                    Add New Restaurant
                </Button>
            </div>

            {/* Analytics Overview */}
            <Row className="mb-5">
                <Col md={3} sm={6} className="mb-3">
                    <Card className="shadow-sm border-0 border-start border-4 border-primary h-100">
                        <Card.Body>
                            <h6 className="text-muted fw-bold text-uppercase mb-2">Total Restaurants</h6>
                            <div className="d-flex align-items-center">
                                <h2 className="mb-0 fw-bold me-2">
                                    {dashboardData?.restaurants?.length ?? '-'}
                                </h2>
                                <FaStore className="text-primary opacity-50 ms-auto" size={32} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="shadow-sm border-0 border-start border-4 border-success h-100">
                        <Card.Body>
                            <h6 className="text-muted fw-bold text-uppercase mb-2">Total Favourites</h6>
                            <div className="d-flex align-items-center">
                                <h2 className="mb-0 fw-bold me-2">
                                    {dashboardData?.favourites_count ?? '-'}
                                </h2>
                                <FaEye className="text-success opacity-50 ms-auto" size={32} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="shadow-sm border-0 border-start border-4 border-warning h-100">
                        <Card.Body>
                            <h6 className="text-muted fw-bold text-uppercase mb-2">Avg Rating</h6>
                            <div className="d-flex align-items-center">
                                <h2 className="mb-0 fw-bold me-2">
                                    {dashboardData?.avg_rating ?? '-'}
                                </h2>
                                <FaStar className="text-warning opacity-50 ms-auto" size={32} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="shadow-sm border-0 border-start border-4 border-info h-100">
                        <Card.Body>
                            <h6 className="text-muted fw-bold text-uppercase mb-2">Total Reviews</h6>
                            <div className="d-flex align-items-center">
                                <h2 className="mb-0 fw-bold me-2">
                                    {dashboardData?.review_count ?? '-'}
                                </h2>
                                <FaCommentDots className="text-info opacity-50 ms-auto" size={32} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Managed Restaurants List */}
                <Col lg={7} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">My Restaurants</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4 py-3">Restaurant Name</th>
                                        <th className="py-3">Rating</th>
                                        <th className="py-3">Reviews</th>
                                        <th className="py-3">Status</th>
                                        <th className="py-3 text-end px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData?.restaurants?.length > 0 ? (
                                        dashboardData.restaurants.map(r => (
                                            <tr key={r.id}>
                                                <td className="px-4 fw-bold">{r.name}</td>
                                                <td>
                                                    <Badge bg="warning" text="dark">
                                                        <FaStar className="me-1" />
                                                        {r.avg_rating > 0 ? r.avg_rating.toFixed(1) : 'New'}
                                                    </Badge>
                                                </td>
                                                <td>{dashboardData.review_count}</td>
                                                <td><Badge bg="success">Active</Badge></td>
                                                <td className="text-end px-4">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => navigate('/owner/profile')}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => navigate('/owner/profile')}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-4">
                                                No restaurant found. Claim or add one to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Recent Reviews Feed */}
                <Col lg={5} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Recent Reviews</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush">
                                {dashboardData?.recent_reviews?.length > 0 ? (
                                    dashboardData.recent_reviews.map(review => (
                                        <div key={review.id} className="list-group-item p-4">
                                            <div className="d-flex justify-content-between mb-2">
                                                <div>
                                                    <span className="fw-bold d-block">
                                                        {dashboardData.restaurants.find(r =>
                                                            r.id === review.restaurant_id
                                                        )?.name || 'Restaurant'}
                                                    </span>
                                                    <small className="text-muted">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </small>
                                                </div>
                                                <Badge
                                                    bg={review.rating >= 4 ? 'success' : review.rating === 3 ? 'warning' : 'danger'}
                                                    className="align-self-start py-2"
                                                >
                                                    {review.rating} <FaStar />
                                                </Badge>
                                            </div>
                                            <p className="mb-0 mt-2 small text-dark">"{review.comment}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-muted">
                                        No reviews yet.
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OwnerDashboard;