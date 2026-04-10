import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, InputGroup, Badge, Spinner } from 'react-bootstrap';
import { FaRobot, FaPaperPlane, FaTimes, FaUser, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Lightweight markdown renderer — handles bold, numbered lists, bullet lists
const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Skip empty lines
        if (line.trim() === '') {
            i++;
            continue;
        }

        // Numbered list: lines starting with "1.", "2.", etc.
        if (/^\d+\.\s/.test(line.trim())) {
            const listItems = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                listItems.push(lines[i].replace(/^\d+\.\s/, '').trim());
                i++;
            }
            elements.push(
                <ol key={i} style={{ paddingLeft: '1.2rem', marginBottom: '0.5rem' }}>
                    {listItems.map((item, j) => (
                        <li key={j} style={{ marginBottom: '4px' }}>{inlineFormat(item)}</li>
                    ))}
                </ol>
            );
            continue;
        }

        // Bullet list: lines starting with "- " or "* "
        if (/^[-*]\s/.test(line.trim())) {
            const listItems = [];
            while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
                listItems.push(lines[i].replace(/^[-*]\s/, '').trim());
                i++;
            }
            elements.push(
                <ul key={i} style={{ paddingLeft: '1.2rem', marginBottom: '0.5rem' }}>
                    {listItems.map((item, j) => (
                        <li key={j} style={{ marginBottom: '4px' }}>{inlineFormat(item)}</li>
                    ))}
                </ul>
            );
            continue;
        }

        // Normal paragraph
        elements.push(
            <p key={i} style={{ marginBottom: '0.4rem' }}>{inlineFormat(line)}</p>
        );
        i++;
    }

    return elements;
};

// Handle inline **bold** and *italic* formatting
const inlineFormat = (text) => {
    const parts = [];
    // Split on **bold** and *italic*
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let last = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) {
            parts.push(text.slice(last, match.index));
        }
        const raw = match[0];
        if (raw.startsWith('**')) {
            parts.push(<strong key={match.index}>{raw.slice(2, -2)}</strong>);
        } else {
            parts.push(<em key={match.index}>{raw.slice(1, -1)}</em>);
        }
        last = match.index + raw.length;
    }

    if (last < text.length) {
        parts.push(text.slice(last));
    }

    return parts.length > 0 ? parts : text;
};

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

    useEffect(() => {
        if (isOpen) {
            setMessages([
                {
                    role: 'ai',
                    text: "Hi there! I'm your Yelp AI Assistant. Tell me what you're craving, and I'll find the perfect spot based on your preferences!",
                    restaurants: []
                }
            ]);
        }
    }, [isOpen]);

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
            const history = buildHistory(messages);
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
        <Card className="position-fixed shadow-lg border-0" style={{ bottom: '20px', right: '20px', width: '400px', height: '580px', zIndex: 1050, display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden' }}>

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
                            className={`p-3 rounded-3 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                            style={{
                                maxWidth: '88%',
                                borderBottomRightRadius: msg.role === 'user' ? '4px' : '',
                                borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '',
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                            }}
                        >
                            <div className="d-flex align-items-center mb-2 opacity-75" style={{ fontSize: '0.75rem' }}>
                                {msg.role === 'user'
                                    ? <><FaUser className="me-1" /> You</>
                                    : <><FaRobot className="me-1" /> AI Assistant</>
                                }
                            </div>

                            {/* Render plain text for user, markdown for AI */}
                            {msg.role === 'user'
                                ? <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                : <div style={{ marginBottom: 0 }}>{renderMarkdown(msg.text)}</div>
                            }
                        </div>

                        {/* Restaurant recommendation cards */}
                        {msg.restaurants && msg.restaurants.length > 0 && (
                            <div className="mt-2 w-100" style={{ paddingLeft: '8px' }}>
                                {msg.restaurants.map(r => (
                                    <Card key={r.id} className="mb-2 shadow-sm border-0" style={{ borderLeft: '3px solid #0d6efd', borderRadius: '10px' }}>
                                        <Card.Body className="p-2 px-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <Link to={`/restaurant/${r.id}`} className="text-decoration-none fw-bold" style={{ fontSize: '0.88rem' }}>{r.name}</Link>
                                                <Badge bg="danger" style={{ fontSize: '0.72rem' }}>
                                                    <FaStar className="me-1" />{r.avg_rating?.toFixed(1)}
                                                </Badge>
                                            </div>
                                            <small className="text-muted d-block my-1" style={{ fontSize: '0.75rem' }}>
                                                {[r.price_range, r.cuisine, r.city].filter(Boolean).join(' • ')}
                                            </small>
                                            {r.description && (
                                                <small className="text-muted d-block" style={{ fontSize: '0.73rem', lineHeight: '1.3' }}>
                                                    {r.description.length > 90 ? r.description.slice(0, 90) + '…' : r.description}
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
                        <div className="bg-white p-3 rounded-3 shadow-sm text-muted d-flex align-items-center gap-2" style={{ borderBottomLeftRadius: '4px' }}>
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