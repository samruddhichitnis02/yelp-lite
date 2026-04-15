import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const USER_API = 'http://localhost:8001';

const FavouritesPage = () => {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const token = localStorage.getItem('auth_token');

                const res = await axios.get(`${USER_API}/favourites`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setFavourites(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load favourites');
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4">My Favourites</h2>

            {favourites.length > 0 ? (
                <Row>
                    {favourites.map((fav) => (
                        <Col key={fav.id} md={4} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{fav.restaurant_id}</Card.Title>
                                    <Card.Text>
                                        Restaurant ID: {fav.restaurant_id}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <p>No favourites yet.</p>
            )}
        </Container>
    );
};

export default FavouritesPage;