# Yelp Prototype - Restaurant Discovery Platform

A full-stack Yelp-style restaurant discovery and review platform built with React.js, Python FastAPI, and MySQL. Supports two user personas — **Regular Users** and **Restaurant Owners** — with an integrated AI Assistant chatbot for personalized restaurant recommendations.

---

## Tech Stack

**Frontend:**
- React 19 + Vite
- React Bootstrap 5
- React Router DOM
- Axios

**Backend:**
- Python FastAPI
- SQLAlchemy ORM
- MySQL (PyMySQL)
- JWT Authentication (python-jose)
- Bcrypt Password Hashing (passlib)
- LangChain + OpenAI + Tavily (AI Chatbot)

---

## Project Structure
```
yelp-lite/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   ├── models/
│   │   ├── users.py
│   │   ├── owner.py
│   │   ├── restaurants.py
│   │   ├── review.py
│   │   ├── favourite.py
│   │   ├── preference.py
│   │   ├── cuisine_type.py
│   │   ├── dietary_type.py
│   │   ├── ambiance_type.py
│   │   ├── user_cuisine.py
│   │   ├── user_dietary.py
│   │   └── user_ambiance.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── me.py
│   │   ├── restaurants.py
│   │   ├── reviews.py
│   │   ├── favourites.py
│   │   └── chatbot.py
│   ├── schemas/
│   │   ├── users.py
│   │   ├── owner.py
│   │   ├── restaurant.py
│   │   ├── review.py
│   │   ├── favourite.py
│   │   ├── preferences.py
│   │   ├── history.py
│   │   ├── chatbot.py
│   │   └── owner_dashboard.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── deps.py
│   │   ├── chatbot.py
│   │   └── chatbot_service.py
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── RestaurantCard.jsx
│   │   │   ├── ReviewModal.jsx
│   │   │   └── AIAssistantChat.jsx
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── RestaurantDetailsPage.jsx
│   │   │   ├── UserProfilePage.jsx
│   │   │   ├── AddRestaurantPage.jsx
│   │   │   ├── FavouritesPage.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── OwnerProfilePage.jsx
│   │   │   └── ClaimRestaurantPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   └── context/
│   │       └── AuthContext.jsx
│   └── package.json
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- pip
- npm

---

## Environment Setup

### Backend Environment Variables

Create a `.env` file inside the `backend/` folder:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=yelp_lite
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
```

---

## Installation & Running

### 1. Database Setup

Open MySQL Workbench or MySQL CLI and run:
```sql
CREATE DATABASE yelp_lite;
USE yelp_lite;
```

The tables will be created automatically when the backend starts via SQLAlchemy's `Base.metadata.create_all()`.

---

### 2. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload
```

Backend will be running at: `http://localhost:8000`

Swagger API docs available at: `http://localhost:8000/docs`

---

### 3. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run the React dev server
npm run dev
```

Frontend will be running at: `http://localhost:5173`

---

## Features

### User (Reviewer) Features
- Signup / Login / Logout with JWT authentication
- Profile management — name, email, phone, city, state, country, gender, languages, about me, profile picture
- AI Preferences — cuisine preferences, price range, dietary restrictions, ambiance, sort preference
- Restaurant search by name, cuisine, keyword (wifi, outdoor seating etc.), city/zip
- Restaurant details view — name, cuisine, address, description, hours, contact, reviews
- Write, edit, and delete own reviews with 1-5 star rating
- Save restaurants to favourites and remove them
- View history of restaurants added and reviews written
- Add new restaurant listings
- AI Assistant chatbot for personalized recommendations

### Restaurant Owner Features
- Signup / Login / Logout
- Owner dashboard with analytics — total restaurants, favourites count, avg rating, total reviews, recent reviews
- Add new restaurant listing (directly linked to owner account)
- Claim existing unclaimed restaurants
- View and update restaurant profile — name, cuisine, description, location, contact info, hours, amenities, pricing, photo
- View all reviews for owned restaurants (read-only)

---

## API Documentation

Full API documentation is available via:
- **Swagger UI:** `http://localhost:8000/docs`
- **Postman Collection:** Available in the `/postman` folder of this repository

### Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/user/signup` | None | User signup |
| POST | `/auth/user/login` | None | User login |
| POST | `/auth/owner/signup` | None | Owner signup |
| POST | `/auth/owner/login` | None | Owner login |
| GET | `/me/user` | User | Get user profile |
| PUT | `/users/me` | User | Update user profile |
| GET | `/restaurants/search` | None | Search restaurants |
| GET | `/restaurants/{id}` | None | Get restaurant details |
| POST | `/restaurants/` | User | Add restaurant |
| POST | `/reviews/` | User | Write a review |
| PUT | `/reviews/{id}` | User | Edit own review |
| DELETE | `/reviews/{id}` | User | Delete own review |
| POST | `/favourites/` | User | Add to favourites |
| GET | `/favourites/` | User | Get favourites |
| GET | `/restaurants/owner/dashboard` | Owner | Owner dashboard |
| POST | `/restaurants/owner/create` | Owner | Owner adds restaurant |
| POST | `/restaurants/{id}/claim` | Owner | Claim a restaurant |
| POST | `/ai-assistant/chat` | User | AI chatbot |

---

## Default Ports

| Service | Port |
|---------|------|
| React Frontend | 5173 |
| FastAPI Backend | 8000 |
| MySQL Database | 3306 |

---

## Notes

- Do not commit `.env` file — add it to `.gitignore`
- Do not commit `venv` or `__pycache__` folders
- The `uploads/` folder stores profile pictures and restaurant photos locally
- JWT tokens expire after 24 hours (1440 minutes)

---

## Author

Built as part of DS 236 - Distributed Systems Lab 1, SJSU Spring 2026