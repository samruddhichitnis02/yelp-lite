import React from 'react';
import { clearAuthData } from '../services/auth';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaYelp } from 'react-icons/fa';

const AppNavbar = () => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('auth_role') || 'user';

    const handleLogout = () => {
        clearAuthData();
        navigate('/');
    };

    return (
        <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    <FaYelp size={24} className="me-2" /> Yelp Prototype
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {userRole !== 'owner' && (
                            <Nav.Link as={Link} to="/">Explore</Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        {!isAuthenticated ? (
                            <div className="d-flex gap-2 align-items-center">
                                <Button variant="outline-dark" as={Link} to="/auth?mode=login" size="sm">Log In</Button>
                                <Button variant="primary" as={Link} to="/auth?mode=signup">Sign Up</Button>
                            </div>
                        ) : (
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-custom-components">
                                    {userRole === 'user' ? 'My Profile' : 'Owner Dashboard'}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {userRole === 'user' ? (
                                        <>
                                            <Dropdown.Item as={Link} to="/profile">Profile & Preferences</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/favourites">My Favourites</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/history">History</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/add-restaurant">Add Restaurant</Dropdown.Item>
                                        </>
                                    ) : (
                                        <>
                                            <Dropdown.Item as={Link} to="/owner/dashboard">Owner Dashboard</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/owner/profile">Restaurant Profile</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/owner/claim">Claim a Restaurant</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/add-restaurant">Add Restaurant Listing</Dropdown.Item>
                                        </>
                                    )}
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;