import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

const ReviewModal = ({ show, handleClose, restaurantName }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a star rating");
            return;
        }
        // In actual implementation, send rating + comment to backend
        alert(`Review submitted for rating: ${rating}`);
        setRating(0);
        setComment('');
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Review {restaurantName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                        {rating > 0 && <p className="mt-2 text-primary fw-bold">{['Terrible', 'Poor', 'Average', 'Good', 'Excellent'][rating - 1]}</p>}
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

                    <Button type="submit" variant="primary" className="w-100 rounded-pill fw-bold py-2 mb-2">
                        Post Review
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ReviewModal;
