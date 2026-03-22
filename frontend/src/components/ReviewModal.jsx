import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import api from '../services/api';

const ReviewModal = ({ show, handleClose, restaurantName, restaurantId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await api.post('/reviews/', {
                restaurant_id: restaurantId,
                rating,
                comment,
            });
            setRating(0);
            setComment('');
            handleClose();
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setRating(0);
        setComment('');
        setError('');
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleModalClose} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Review {restaurantName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <div className="text-center mb-4">
                        <h5 className="text-muted mb-3">How was your experience?</h5>
                        <div className="d-flex justify-content-center gap-2">
                            {[...Array(5)].map((star, index) => {
                                const currentRating = index + 1;
                                return (
                                    <FaStar
                                        key={index}
                                        size={40}
                                        style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                        color={currentRating <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                        onClick={() => setRating(currentRating)}
                                        onMouseEnter={() => setHover(currentRating)}
                                        onMouseLeave={() => setHover(null)}
                                    />
                                );
                            })}
                        </div>
                        {rating > 0 && (
                            <p className="mt-2 text-primary fw-bold">
                                {['Terrible', 'Poor', 'Average', 'Good', 'Excellent'][rating - 1]}
                            </p>
                        )}
                    </div>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Additional Comments</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="What did you like or dislike? How was the service?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </Form.Group>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-100 rounded-pill fw-bold py-2 mb-2"
                        disabled={loading}
                    >
                        {loading
                            ? <><Spinner size="sm" animation="border" className="me-2" />Submitting...</>
                            : 'Post Review'
                        }
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ReviewModal;