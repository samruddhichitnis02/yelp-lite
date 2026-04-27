import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FaStar, FaCamera } from 'react-icons/fa';


const REVIEW_API = '/api/reviews';

import { useSelector, useDispatch } from 'react-redux';
import { submitReview, uploadReviewPhoto, clearReviewError, selectReviewSubmitting, selectReviewError } from '../store/slices/reviewSlice';

const ReviewModal = ({ show, handleClose, restaurantName, restaurantId, onReviewSubmitted }) => {
    const dispatch = useDispatch();
    const loading = useSelector(selectReviewSubmitting);
    const apiError = useSelector(selectReviewError);

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [comment, setComment] = useState('');
    const [localError, setLocalError] = useState('');
    const [photos, setPhotos] = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const photoInputRef = useRef(null);

    const resetForm = () => {
        setRating(0);
        setHover(null);
        setComment('');
        setPhotos([]);
        setPhotoPreviews([]);
        setLocalError('');
        dispatch(clearReviewError());
    };

    const handlePhotoSelect = (e) => {
        const files = Array.from(e.target.files || []);
        setPhotos((prev) => [...prev, ...files]);
        const previews = files.map((f) => URL.createObjectURL(f));
        setPhotoPreviews((prev) => [...prev, ...previews]);
        e.target.value = '';
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setLocalError('Please select a star rating.');
            return;
        }
        setLocalError('');
        dispatch(clearReviewError());

        try {
            const reviewRes = await dispatch(submitReview({ restaurantId, rating, comment })).unwrap();

            if (photos.length > 0) {
                for (const photo of photos) {
                    await dispatch(uploadReviewPhoto({ reviewId: reviewRes.id, file: photo })).unwrap();
                }
            }

            resetForm();
            handleClose();
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (err) {
            console.error(err);
            // Error is handled in redux state (selectReviewError)
        }
    };

    const handleModalClose = () => {
        resetForm();
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleModalClose} centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold">Review {restaurantName}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {(apiError || localError) && <Alert variant="danger">{apiError || localError}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <div className="text-center mb-4">
                        <h5 className="text-muted mb-3">How was your experience?</h5>
                        <div className="d-flex justify-content-center gap-2">
                            {[...Array(5)].map((_, index) => {
                                const currentRating = index + 1;
                                return (
                                    <FaStar
                                        key={index}
                                        size={40}
                                        style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                        color={currentRating <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
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

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Additional Comments</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="What did you like or dislike? How was the service?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold d-flex align-items-center justify-content-between">
                            <span>Add Photos <span className="text-muted fw-normal">(optional)</span></span>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                type="button"
                                onClick={() => photoInputRef.current?.click()}
                            >
                                <FaCamera className="me-1" /> Add Photos
                            </Button>
                        </Form.Label>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={photoInputRef}
                            style={{ display: 'none' }}
                            onChange={handlePhotoSelect}
                        />

                        {photoPreviews.length > 0 && (
                            <Row xs={3} className="g-2 mt-1">
                                {photoPreviews.map((src, idx) => (
                                    <Col key={idx}>
                                        <div
                                            className="position-relative rounded overflow-hidden"
                                            style={{ height: '80px' }}
                                        >
                                            <img
                                                src={src}
                                                alt=""
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                type="button"
                                                className="position-absolute top-0 end-0 m-1 rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                style={{ width: '20px', height: '20px', fontSize: '12px' }}
                                                onClick={() => removePhoto(idx)}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Form.Group>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-100 rounded-pill fw-bold py-2 mb-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Submitting...
                            </>
                        ) : (
                            'Post Review'
                        )}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ReviewModal;