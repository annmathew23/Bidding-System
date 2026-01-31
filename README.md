# Live Bidding Platform
A real-time auction platform where users compete to place bids in the final seconds of an auction.
Built with **Node.js, Socket.io, React, and Docker**.
## Features
- Real-time bidding using Socket.io
- Server-authoritative countdown timer (prevents client-side manipulation)
- Race-condition safe bid handling (only one bid accepted at a time)
- Visual feedback on bid updates (Winning / Outbid states + flash animation)
- Create auction items directly from the UI
- Fully containerized with Docker for easy setup
## Tech Stack
- Backend: Node.js, Express, Socket.io  
- Frontend: React (Vite)  
- Infrastructure: Docker, Docker Compose  
#Running the App (Docker)
### Prerequisite
- Docker Desktop installed and running

## How It Works
Real-Time Bidding & Concurrency

Clients emit a BID_PLACED socket event

The server validates the bid amount and auction end time

Bids are serialized per item to avoid race conditions

The server broadcasts updates via UPDATE_BID

## Time Synchronization

The server sends its current time (serverTimeMs)

Clients compute a time offset and use it for countdown timers

Prevents users from hacking timers via local system time

## Data Storage

Auction items and bids are stored in memory for simplicity

Items are seeded on startup and can be created via the UI

The store layer is isolated and can be replaced with a database (Postgres/Redis) without changing APIs or socket logic

## API Overview
REST

GET /items – Fetch auction items and server time

POST /items – Create a new auction item

Socket Events

BID_PLACED – Client places a bid

UPDATE_BID – Server broadcasts the new highest bid
### Start the app
From the project root:
```bash
docker compose up --build

Once the containers are running:

Frontend: http://localhost:5173

Backend API: http://localhost:3001

Health check: http://localhost:3001/health

Open the frontend URL in your browser to use the app.
