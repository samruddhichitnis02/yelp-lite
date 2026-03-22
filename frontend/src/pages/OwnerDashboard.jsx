import React from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { FaChartLine, FaStar, FaStore, FaEye, FaCommentDots } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
    // Mock Data
    const ownerStats = {
        totalRestaurants: 2,
        totalViews: 14502,
        avgRating: 4.6,
        totalReviews: 324
    };

    const restaurants = [
        { id: 1, name: 'Pasta Paradise', rating: 4.8, reviews: 156, status: 'Active' },
        { id: 2, name: 'Burger Joint', rating: 4.2, reviews: 168, status: 'Active' }
    ];

    const recentReviews = [
        { id: 101, restaurant: 'Pasta Paradise', user: 'Sarah M.', rating: 5, date: 'Oct 12, 2025', text: 'Absolutely amazing pasta!' },
        { id: 102, restaurant: 'Burger Joint', user: 'Mike T.', rating: 3, date: 'Oct 10, 2025', text: 'Good burgers, but fries were cold.' },
        { id: 103, restaurant: 'Pasta Paradise', user: 'Emily R.', rating: 5, date: 'Oct 08, 2025', text: 'The tiramisu is to die for. Highly recommend.' }
    ];

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
                                <h2 className="mb-0 fw-bold me-2">{ownerStats.totalRestaurants}</h2>
                                <FaStore className="text-primary opacity-50 ms-auto" size={32} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3} sm={6} className="mb-3">
                    <Card className="shadow-sm border-0 border-start border-4 border-success h-100">
                        <Card.Body>
                            <h6 className="text-muted fw-bold text-uppercase mb-2">Total Views</h6>
                            <div className="d-flex align-items-center">
                                <h2 className="mb-0 fw-bold me-2">{ownerStats.totalViews.toLocaleString()}</h2>
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
                                <h2 className="mb-0 fw-bold me-2">{ownerStats.avgRating}</h2>
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
                                <h2 className="mb-0 fw-bold me-2">{ownerStats.totalReviews}</h2>
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
                                    {restaurants.map(r => (
                                        <tr key={r.id}>
                                            <td className="px-4 fw-bold">{r.name}</td>
                                            <td><Badge bg="warning" text="dark"><FaStar className="me-1" />{r.rating}</Badge></td>
                                            <td>{r.reviews}</td>
                                            <td><Badge bg="success">{r.status}</Badge></td>
                                            <td className="text-end px-4">
                                                <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                                                <Button as={Link} to={`/restaurant/${r.id}`} variant="outline-secondary" size="sm">View</Button>
                                            </td>
                                        </tr>
                                    ))}
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
                            <Button variant="link" size="sm" className="text-decoration-none">View All</Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="list-group list-group-flush">
                                {recentReviews.map(review => (
                                    <div key={review.id} className="list-group-item p-4">
                                        <div className="d-flex justify-content-between mb-2">
                                            <div>
                                                <span className="fw-bold d-block">{review.restaurant}</span>
                                                <small className="text-muted">By {review.user} on {review.date}</small>
                                            </div>
                                            <Badge bg={review.rating >= 4 ? 'success' : review.rating === 3 ? 'warning' : 'danger'} className="align-self-start py-2">
                                                {review.rating} <FaStar />
                                            </Badge>
                                        </div>
                                        <p className="mb-0 mt-2 small text-dark">"{review.text}"</p>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OwnerDashboard;
