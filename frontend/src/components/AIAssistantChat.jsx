import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { FaRobot, FaPaperPlane, FaTimes, FaUser, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AIAssistantChat = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: "Hi there! I'm your Yelp AI Assistant. Tell me what you're craving, and I'll find the perfect spot based on your preferences!",
            restaurants: []
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Build conversation history for the backend (only user/ai turns, no restaurants)
    const buildHistory = (msgs) => {
        return msgs
            .filter(m => m.role === 'user' || m.role === 'ai')
            .map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.text,
            }));
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        const userMessage = { role: 'user', text: userText };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        try {
            const history = buildHistory(messages); // history before this new message
            const res = await api.post('/ai-assistant/chat', {
                message: userText,
                conversation_history: history,
            });

            const { reply, recommendations } = res.data;

            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    text: reply,
                    restaurants: recommendations || [],
                }
            ]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
                    restaurants: [],
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Card className="position-fixed shadow-lg border-0" style={{ bottom: '20px', right: '20px', width: '380px', height: '550px', zIndex: 1050, display: 'flex', flexDirection: 'column', borderRadius: '15px', overflow: 'hidden' }}>

            {/* Header */}
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <FaRobot size={24} className="me-2" />
                    <h5 className="mb-0 fw-bold m-0">AI Assistant</h5>
                </div>
                <Button variant="link" className="text-white p-0" onClick={onClose}><FaTimes size={20} /></Button>
            </div>

            {/* Chat History */}
            <Card.Body className="bg-light overflow-auto p-3" style={{ flexGrow: 1 }}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`d-flex flex-column mb-3 ${msg.role === 'user' ? 'align-items-end' : 'align-items-start'}`}>
                        <div
                            className={`p-3 rounded shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                            style={{ maxWidth: '85%', borderBottomRightRadius: msg.role === 'user' ? 0 : '', borderBottomLeftRadius: msg.role === 'ai' ? 0 : '' }}
                        >
                            <div className="d-flex align-items-center mb-1 opacity-75 small">
                                {msg.role === 'user' ? <><FaUser className="me-1" /> You</> : <><FaRobot className="me-1" /> AI</>}
                            </div>
                            <p className="mb-0 lh-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>

                        {/* Restaurant recommendation cards */}
                        {msg.restaurants && msg.restaurants.length > 0 && (
                            <div className="mt-2 w-100 ps-4">
                                {msg.restaurants.map(r => (
                                    <Card key={r.id} className="mb-2 shadow-sm border-0 border-start border-4 border-primary">
                                        <Card.Body className="p-2">
                                            <div className="d-flex justify-content-between fw-bold">
                                                <Link to={`/restaurant/${r.id}`} className="text-decoration-none">{r.name}</Link>
                                                <Badge bg="danger"><FaStar /> {r.avg_rating?.toFixed(1)}</Badge>
                                            </div>
                                            <small className="text-muted d-block my-1">
                                                {r.price_range && `${r.price_range} • `}
                                                {r.cuisine && `${r.cuisine} • `}
                                                {r.city}
                                            </small>
                                            {r.description && (
                                                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                                                    {r.description.length > 80 ? r.description.slice(0, 80) + '…' : r.description}
                                                </small>
                                            )}
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div className="d-flex align-items-start mb-3">
                        <div className="bg-white p-3 rounded shadow-sm text-muted d-flex align-items-center gap-2" style={{ borderBottomLeftRadius: 0 }}>
                            <Spinner animation="grow" size="sm" variant="primary" />
                            <Spinner animation="grow" size="sm" variant="primary" style={{ animationDelay: '0.2s' }} />
                            <Spinner animation="grow" size="sm" variant="primary" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </Card.Body>

            {/* Input */}
            <div className="p-3 bg-white border-top">
                <Form onSubmit={handleSend}>
                    <InputGroup>
                        <Form.Control
                            placeholder="Ask for a recommendation..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="rounded-pill rounded-end border-end-0 bg-light"
                            disabled={isTyping}
                        />
                        <Button type="submit" variant="primary" className="rounded-pill rounded-start fw-bold px-3" disabled={isTyping}>
                            <FaPaperPlane />
                        </Button>
                    </InputGroup>
                </Form>
                <div className="d-flex flex-wrap gap-1 mt-2">
                    <Badge bg="light" text="dark" className="border user-select-none" style={{ cursor: 'pointer' }} onClick={() => setInput('Find me dinner tonight')}>Find dinner tonight</Badge>
                    <Badge bg="light" text="dark" className="border user-select-none" style={{ cursor: 'pointer' }} onClick={() => setInput('Vegan options near me')}>Vegan options</Badge>
                    <Badge bg="light" text="dark" className="border user-select-none" style={{ cursor: 'pointer' }} onClick={() => setInput('Best rated restaurants')}>Best rated</Badge>
                </div>
            </div>
        </Card>
    );
};

export default AIAssistantChat;