# 📊 Event Tracking System --- Redis Queue + Node.js + MongoDB

## 🧩 1. Architecture Decision

### Problem

Writing events directly into MongoDB from the main API server causes: -
Slow requests under load - Database write bottlenecks - Unresponsive
server - Difficult horizontal scaling - Worker logic blocking API
performance

### Solution --- Redis Queue + Worker Process

The architecture follows a **receive → queue → process** pattern.

#### 1️⃣ API Server

-   Receives incoming events
-   Pushes them into Redis using `LPUSH`
-   Returns instantly (non-blocking)

#### 2️⃣ Redis Queue

-   Acts as an in-memory buffer
-   Stores events at high throughput
-   Ensures no data loss

#### 3️⃣ Worker Process

-   Uses `BRPOP` to listen to events
-   Processes them one-by-one
-   Stores each event into MongoDB

### Why this architecture?

-   Fast ingestion
-   Zero blocking
-   Easy to scale
-   Clean separation of concerns

### Production Note

For deployment, a managed Redis service (Redis Enterprise Cloud, AWS
ElastiCache, etc.) will be used.\
The current setup is for **development**, but solves the core problem
perfectly.

------------------------------------------------------------------------

## 🗄️ 2. Database Schema

### Event Schema (Mongoose)

``` js
{
  site_id: String,
  event_type: String,
  path: String,
  userid: String,
  timestamp: Date,
  createdAt: Date
}
```

Aggregation is performed **when GET /stats is called**, not during
ingestion.

------------------------------------------------------------------------

## ⚙️ 3. Setup Instructions

### Step 1 --- Install Redis

#### Windows (Portable ZIP)

1.  Download ZIP: https://github.com/tporadowski/redis/releases
2.  Extract and run:

```{=html}
<!-- -->
```
    redis-server.exe

#### macOS

    brew install redis
    redis-server

#### Ubuntu / Linux

    sudo apt update
    sudo apt install redis-server -y
    redis-server

#### Verify Redis is running:

    redis-cli ping
    # PONG

------------------------------------------------------------------------

### Step 2 --- Install Dependencies

    cd backend
    npm install

------------------------------------------------------------------------

### Step 3 --- Add .env File

    MONGO_URI=your_mongodb_connection_string

------------------------------------------------------------------------

### Step 4 --- Start System (API + Worker)

    npm run dev

This runs: - `server.js` --- main API - `workers/processor.js` ---
worker process

------------------------------------------------------------------------

## 📁 Project Structure

    backend/
    │── server.js
    │
    ├── workers/
    │     └── processor.js
    │
    ├── config/
    │     ├── db.js
    │     └── redis.js
    │
    ├── models/
    │     └── event.model.js
    │
    ├── controllers/
    │     ├── eventController.js
    │     └── statsController.js
    │
    ├── routes/
    │     ├── event.route.js
    │     └── stats.route.js
    │
    ├── .env
    ├── .gitignore
    └── package.json

------------------------------------------------------------------------

## 📡 4. API Usage

### 1️⃣ POST /event

Ingests a new event.

**URL**

    http://localhost:3000/event

**Body Example**

``` json
{
  "site_id": "site-001",
  "event_type": "page_view",
  "path": "/blog",
  "userid": "user-115",
  "timestamp": "2025-11-23T16:44:31.123Z"
}
```

**cURL**

``` bash
curl -X POST http://localhost:3000/event -H "Content-Type: application/json" -d '{
  "site_id": "site-001",
  "event_type": "page_view",
  "path": "/blog",
  "userid": "user-115",
  "timestamp": "2025-11-23T16:44:31.123Z"
}'
```

------------------------------------------------------------------------

### 2️⃣ GET /stats

Returns analytics for a site.

**URL Example**

    http://localhost:3000/stats?site_id=site-001&date=2025-11-23

**cURL**

``` bash
curl "http://localhost:3000/stats?site_id=site-001&date=2025-11-23"
```

**Sample Response**

``` json
{
  "success": true,
  "stats": {
    "site_id": "site-001",
    "date": "2025-11-23",
    "total_views": 7,
    "unique_users": 3,
    "top_paths": [
      { "path": "/pricing", "views": 3, "unique_users": 2 },
      { "path": "/contact", "views": 2, "unique_users": 2 },
      { "path": "/blog", "views": 2, "unique_users": 2 }
    ]
  }
}
```

------------------------------------------------------------------------

## ✅ Summary

-   Asynchronous ingestion with Redis\
-   Non-blocking API\
-   Worker processes events reliably\
-   MongoDB stores analytics\
-   Aggregations done at query time\
-   Production-ready architecture
