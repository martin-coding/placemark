# placemark

Hapi web app to view information about point of interests.

# Overview

This application allows users to save and manage points of interest (POIs) by adding them to a map. This POI can be private or public. Public POIs can be reviewed by anyone.
This App helps travelers, tourists, and explorers save and organize places they find interesting and share them with others.

# Usage

## API Documentation

To explore the API endpoints, visit `/documentation` in your browser. This will open the Swagger UI, where you can view and interact with all available API routes.

### Example

- Run your server locally and navigate to `http://localhost:PORT/documentation`
- Or access the [deployed](https://placemark-l3cr.onrender.com/documentation) version

This will display a fully interactive Swagger UI, allowing you to test API requests directly from the documentation.

# Installation

## Prerequisites

- Node.js
- npm

## Setup

1. Clone the repository

```bash
git clone https://github.com/martin-coding/placemark.git
cd placemark
```

2. Install dependencies

```bash
npm install --force
```

> [!IMPORTANT]  
> Force is needed because of hapi-swagger depending on joi@"17.x"

3. copy `.env_example` to `.env` and set the variables
4. Start the application

```bash
npm start
```
