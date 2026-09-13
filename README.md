# Ivy Homes Internship Assignment

A full-stack MERN application that interfaces with the Ivy Homes API. It implements a fully functioning property portal complete with authentication, listings, rentals, projects, saved properties, and an analytics dashboard.

## Setup and Running Locally

This project requires Node.js and npm. It uses a small Express backend proxy to keep the API key secure and handle complex data aggregations for the insights dashboard.

### 1. Start the Server
The backend server runs on port 5000.
```bash
cd server
npm install
npm run dev
```

### 2. Start the Client
The frontend is a Vite React app running on port 5173.
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Environment Variables
The `.env` file is already created in the `server` directory with the following variables:
- `API_KEY=IVY26-29EB9C01EE82`
- `BASE_URL=https://solve.ivy.homes`
- `PORT=5000`

## How I found the Documentation Lies
I started by writing a few PowerShell scripts to query every endpoint systematically. I quickly realized:
1. **Authentication**: The documented query parameter `?api_key=` didn't work. The API required an `X-API-Key` header. The login response contained an undocumented `refresh_token` and an expiry of 15 minutes instead of 24 hours. I implemented a robust Axios interceptor to handle auto-refreshing.
2. **Pagination**: The documented `page` parameter was silently ignored. Inspecting the raw response data showed that `offset` and `limit` were the actual parameters being used, with a hard cap of 50 results per page instead of 200. I wrote a `fetchAll` utility to traverse all 3,400 records.
3. **Paths**: Almost all singular/plural paths were wrong. `/v1/listing/{id}` is actually `/v1/listings/{id}`. `/v1/favourites` is actually `/v1/saved`. `/v1/analytics/summary` didn't exist at all, meaning I had to build the insights dashboard myself by aggregating raw data.
4. **Data anomalies**: The prompt said "a seller can write anything." I found negative prices, impossible floors (e.g. floor 26 on an 11-floor building), and areas where carpet > super built-up. More interestingly, I noticed extreme outliers in price/sqft. By analyzing these, I realized that all listings scraped from `magichomes` under 200 "sqft" were actually provided in square meters! Similarly, project prices were documented as rupees but were actually floating point numbers representing Crores (e.g., 1.66 = 1.66 Cr).

## What turned out to be fine
1. **Rate limiting**: I ran mass data collection scripts fetching thousands of records, and the API was completely stable as promised.
2. **Dates and Timestamps**: Despite my suspicions, the timestamps were correctly formatted in ISO 8601 UTC with the `Z` suffix. While there were listings with future dates (e.g. 2027), this is a common occurrence in user-submitted data (typos or intentional bumping) rather than an API schema lie.
3. **Locations**: Latitude and longitude values were generally within expected ranges for the Gurgaon region.

## What I'd do with another two days
1. **Advanced Filtering**: Implement multi-select for localities and a visual slider for price ranges.
2. **Map View**: Integrate Mapbox or Google Maps to show all listings visually, using the lat/lon coordinates to cluster properties.
3. **Server-side caching**: The Insights dashboard currently fetches ~5000 total records from the Ivy API across 3 endpoints to compute the answers. With more time, I would implement Redis or simple in-memory caching to only fetch this data once every few hours.
