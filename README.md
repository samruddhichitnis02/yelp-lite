# Yelp Lite — Restaurant Discovery Platform (Redux Edition)

A full-stack, microservices-based Yelp-style restaurant discovery and review platform. Built with **React 19 + Redux Toolkit**, **Python FastAPI**, **MongoDB**, and **Apache Kafka**. Supports two user personas — **Regular Users** and **Restaurant Owners** — with an integrated AI Assistant chatbot for personalized restaurant recommendations.

Deployable via **Docker Compose** (local) or **Kubernetes** (production/AWS).

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Redux Toolkit + React Redux (global state management)
- React Bootstrap 5 + React Icons
- React Router DOM v7
- Axios

**Backend — Microservices (Python FastAPI)**
- `user-service` — user auth, profiles, favourites, history
- `restaurant-service` — restaurant CRUD, photo uploads, AI chatbot
- `review-service` — review CRUD, photo uploads
- `owner-service` — owner auth, dashboard analytics, restaurant claiming
- `review-worker` — Kafka consumer; updates restaurant average ratings on review events
- `restaurant-worker` — Kafka consumer; handles restaurant lifecycle events

**Database**
- MongoDB (one shared `yelp_lab2` database, accessed independently per service)

**Messaging**
- Apache Kafka + Zookeeper (event-driven updates between services)

**AI**
- LangChain + OpenAI GPT-4o-mini (chatbot)
- Tavily (web search for real-time context)

**Infrastructure**
- Docker + Docker Compose (local development)
- Kubernetes manifests (AWS ECR + EKS deployment)
- Nginx (frontend container reverse proxy)
- Apache JMeter (load testing — `Yelp_Lite_Load_Test.jmx`)

---

## Project Structure

```
yelp-lite-yelp-redux/
├── docker-compose.yaml
├── Yelp_Lite_Load_Test.jmx
├── backend/
│   ├── user-service/             # Port 8001 — users, auth, favourites, history
│   │   ├── main.py
│   │   ├── mongodb.py
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── me.py
│   │   │   └── favourites.py
│   │   ├── schemas/
│   │   │   ├── users.py
│   │   │   ├── favourite.py
│   │   │   ├── history.py
│   │   │   └── preferences.py
│   │   └── services/
│   │       ├── auth_service.py
│   │       └── deps.py
│   │
│   ├── restaurant-service/       # Port 8002 — restaurants, photos, AI chatbot
│   │   ├── main.py
│   │   ├── mongodb.py
│   │   ├── kafka_producer.py
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── routers/
│   │   │   ├── restaurants.py
│   │   │   ├── restaurant_photos.py
│   │   │   └── chatbot.py
│   │   ├── schemas/
│   │   │   ├── restaurant.py
│   │   │   ├── restaurant_photos.py
│   │   │   ├── chatbot.py
│   │   │   └── owner_dashboard.py
│   │   └── services/
│   │       ├── auth_service.py
│   │       ├── deps.py
│   │       ├── chatbot_service.py
│   │       └── activity_log_service.py
│   │
│   ├── review-service/           # Port 8003 — reviews, review photos
│   │   ├── main.py
│   │   ├── mongodb.py
│   │   ├── kafka_producer.py
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── routers/
│   │   │   ├── reviews.py
│   │   │   └── review_photos.py
│   │   ├── schemas/
│   │   │   └── review.py
│   │   └── services/
│   │       ├── auth_service.py
│   │       └── deps.py
│   │
│   ├── owner-service/            # Port 8004 — owner auth, dashboard
│   │   ├── main.py
│   │   ├── mongodb.py
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   └── dashboard.py
│   │   ├── schemas/
│   │   │   ├── owner.py
│   │   │   ├── restaurant.py
│   │   │   ├── review.py
│   │   │   └── owner_dashboard.py
│   │   └── services/
│   │       ├── auth_service.py
│   │       └── deps.py
│   │
│   ├── review-worker-service/    # Kafka consumer — avg rating updater
│   │   ├── main.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── restaurant-worker-service/ # Kafka consumer — restaurant event handler
│   │   ├── main.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   └── Scripts/
│       ├── migrate_restaurants_to_mongo.py
│       └── delete_test_restaurants.py
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── store/
│       │   ├── index.js
│       │   └── slices/
│       │       ├── authSlice.js
│       │       ├── restaurantSlice.js
│       │       ├── reviewSlice.js
│       │       └── favouriteSlice.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── RestaurantCard.jsx
│       │   ├── ReviewModal.jsx
│       │   └── AIAssistantChat.jsx
│       ├── pages/
│       │   ├── AuthPage.jsx
│       │   ├── ExplorePage.jsx
│       │   ├── RestaurantDetailsPage.jsx
│       │   ├── UserProfilePage.jsx
│       │   ├── AddRestaurantPage.jsx
│       │   ├── EditRestaurantPage.jsx
│       │   ├── FavouritesPage.jsx
│       │   ├── HistoryPage.jsx
│       │   ├── OwnerDashboard.jsx
│       │   ├── OwnerProfilePage.jsx
│       │   └── ClaimRestaurantPage.jsx
│       ├── services/
│       │   ├── api.js
│       │   └── auth.js
│       └── context/
│           └── AuthContext.jsx
│
└── k8s/
    ├── frontend.yaml
    ├── mongodb.yaml
    ├── kafka.yaml
    ├── user-service.yaml
    ├── restaurant-service.yaml
    ├── review-service.yaml
    ├── owner-service.yaml
    └── workers.yaml
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- MongoDB running **locally on the host machine** at port `27017`
- Node.js 18+ and npm (for local frontend development only)
- Python 3.11+ and pip (for local backend development only)

> **Note:** When using Docker Compose, the services connect to MongoDB on `host.docker.internal:27017`. Make sure MongoDB is running on your host machine before starting the containers.

---

## Environment Variables

Each backend service reads its configuration from environment variables. When running via Docker Compose these are set in `docker-compose.yaml`. For local development, create a `.env` file inside each service folder.

### All backend services

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `SECRET_KEY` | JWT signing secret (min. 32 chars) | `some_very_long_random_string_at_least_32_chars` |

### `restaurant-service` and `review-service` (additional)

| Variable | Description |
|----------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker address | `localhost:9092` |
| `OPENAI_API_KEY` | OpenAI API key (for AI chatbot) |
| `TAVILY_API_KEY` | Tavily API key (for chatbot web search — optional) |

### `review-worker` and `restaurant-worker` (additional)

| Variable | Description |
|----------|-------------|
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker address |

---

## Running with Docker Compose (Recommended)

This is the easiest way to run the full stack locally. Docker Compose starts all services, Kafka, Zookeeper, and the frontend in one command.

**1. Ensure MongoDB is running on your host machine** (port 27017).

**2. Set your API keys** in `docker-compose.yaml` under the `restaurant-service` environment block:
```yaml
environment:
  - OPENAI_API_KEY=your_openai_api_key_here
  - TAVILY_API_KEY=your_tavily_api_key_here
```

**3. Build and start all containers:**
```bash
docker compose up --build
```

**4. Access the app:**

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| User Service API | http://localhost:8001/docs |
| Restaurant Service API | http://localhost:8002/docs |
| Review Service API | http://localhost:8003/docs |
| Owner Service API | http://localhost:8004/docs |
| Kafka | localhost:9092 |

**To stop all containers:**
```bash
docker compose down
```

---

## Running Locally (Without Docker)

If you prefer to run services directly on your machine, follow the steps below. You will need MongoDB and Kafka running locally as well.

### Backend (each service)

```bash
# Example: user-service
cd backend/user-service

# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or create a .env file)
export MONGO_URL=mongodb://localhost:27017
export SECRET_KEY=your_secret_key_here

# Start the service
uvicorn main:app --reload --port 8001
```

Repeat for each service, using the appropriate port:

| Service | Port |
|---------|------|
| user-service | 8001 |
| restaurant-service | 8002 |
| review-service | 8003 |
| owner-service | 8004 |

Kafka worker services are started the same way (no `--port` needed):
```bash
cd backend/review-worker-service
pip install -r requirements.txt
python main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs at: `http://localhost:5173`

---

## Kafka Event Topics

The platform uses Kafka to propagate events between services asynchronously. The following topics are used:

| Topic | Producer | Consumer | Description |
|-------|----------|----------|-------------|
| `review.created` | review-service | review-worker | Triggers average rating recalculation |
| `review.updated` | review-service | review-worker | Triggers average rating recalculation |
| `review.deleted` | review-service | review-worker | Triggers average rating recalculation |
| `restaurant.created` | restaurant-service | restaurant-worker | Logs restaurant creation event |
| `restaurant.updated` | restaurant-service | restaurant-worker | Logs restaurant update event |
| `restaurant.claimed` | restaurant-service | restaurant-worker | Logs restaurant claim event |

---

## Redux State Management

The frontend uses **Redux Toolkit** with four slices managing global application state:

| Slice | Manages |
|-------|---------|
| `auth` | Login/logout for users and owners, JWT token, role |
| `restaurant` | Restaurant listings, search results, selected restaurant |
| `review` | Reviews for the current restaurant |
| `favourite` | User's saved/favourite restaurants |

---

## Features

### User (Reviewer) Features
- Signup, login, logout with JWT authentication
- Profile management — name, email, phone, city, state, country, gender, languages, about me, profile picture
- AI preferences — cuisine preferences, price range, dietary restrictions, ambiance, sort preference
- Restaurant search by name, cuisine, keyword (wifi, outdoor seating, etc.), city/zip
- Restaurant details — name, cuisine, address, description, hours, contact, amenities, reviews
- Write, edit, and delete own reviews with 1–5 star rating and photo uploads
- Save restaurants to favourites and remove them
- View history of restaurants visited and reviews written
- Add and edit restaurant listings
- AI Assistant chatbot for personalized recommendations

### Restaurant Owner Features
- Signup, login, logout
- Owner dashboard — total restaurants, total favourites, average rating, total reviews, recent activity
- Add new restaurant listings linked to the owner account
- Claim existing unclaimed restaurants
- Edit restaurant profile — name, cuisine, description, address, contact info, hours, amenities, pricing, photos
- View all reviews for owned restaurants (read-only)

---

## API Documentation

Each service exposes a **Swagger UI** at `/docs`:

| Service | Swagger URL |
|---------|-------------|
| User Service | http://localhost:8001/docs |
| Restaurant Service | http://localhost:8002/docs |
| Review Service | http://localhost:8003/docs |
| Owner Service | http://localhost:8004/docs |

### Key Endpoints

| Method | Service | Endpoint | Auth | Description |
|--------|---------|----------|------|-------------|
| POST | user | `/auth/signup` | None | User signup |
| POST | user | `/auth/login` | None | User login |
| GET | user | `/me/user` | User | Get own profile |
| PUT | user | `/users/me` | User | Update own profile |
| GET | user | `/favourites/` | User | Get saved restaurants |
| POST | user | `/favourites/` | User | Save a restaurant |
| POST | owner | `/auth/signup` | None | Owner signup |
| POST | owner | `/auth/login` | None | Owner login |
| GET | owner | `/dashboard/` | Owner | Owner analytics dashboard |
| GET | restaurant | `/restaurants/search` | None | Search restaurants |
| GET | restaurant | `/restaurants/{id}` | None | Restaurant details |
| POST | restaurant | `/restaurants/` | User/Owner | Add a restaurant |
| PUT | restaurant | `/restaurants/{id}` | Owner | Edit a restaurant |
| POST | restaurant | `/restaurants/{id}/claim` | Owner | Claim a restaurant |
| POST | restaurant | `/ai-assistant/chat` | Optional | AI chatbot |
| POST | review | `/reviews/` | User | Write a review |
| PUT | review | `/reviews/{id}` | User | Edit own review |
| DELETE | review | `/reviews/{id}` | User | Delete own review |

---

## Kubernetes Deployment (AWS)

Kubernetes manifests are provided in the `k8s/` folder for deploying to AWS EKS. Images are pulled from AWS ECR.

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/kafka.yaml
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/restaurant-service.yaml
kubectl apply -f k8s/review-service.yaml
kubectl apply -f k8s/owner-service.yaml
kubectl apply -f k8s/workers.yaml
kubectl apply -f k8s/frontend.yaml
```

Update the `image:` fields in each YAML to point to your ECR repository before deploying.

---

## Load Testing

A JMeter load test plan is included at the project root:

```
Yelp_Lite_Load_Test.jmx
```

Open it in [Apache JMeter](https://jmeter.apache.org/) to run load tests against the API services.

---

## Notes

- Do not commit `.env` files — they are listed in `.gitignore`
- The `uploads/` volumes store profile pictures and restaurant photos; these are persisted as named Docker volumes (`user_uploads`, `restaurant_uploads`) in Docker Compose
- JWT tokens expire after 24 hours (1440 minutes)
- Kafka topics are auto-created on first publish (`KAFKA_AUTO_CREATE_TOPICS_ENABLE=true`)
- The Kafka worker services include a startup delay (`time.sleep(15)`) to wait for the Kafka broker to become healthy before connecting
- MongoDB runs outside of Docker Compose on the host machine; the services reach it via `host.docker.internal:27017`