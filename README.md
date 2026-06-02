# Mealio

Mealio is a lunch menu web app that collects menus from nearby restaurants and displays them in one place.
The app includes a React frontend, an ASP.NET Core backend API, JSON-based menu storage, and a Python scraper for updating menu data.

## Features

* View nearby restaurants
* View each restaurant's weekly or static menu
* See today's available lunch options directly on the homepage
* Open an interactive restaurant map
* Get walking directions through Google Maps
* Update menu JSON files using the Python web scraper
* Run locally with or without Docker

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* React Leaflet / Leaflet

### Backend

* ASP.NET Core
* C#
* JSON file-based menu storage
* xUnit tests
* Playwright test

### Scraper

* Python
* requests
* BeautifulSoup4
* pypdf

## Project Structure

```txt
Mealio/
├── Mealio.Server/
│   ├── Controllers/
│   ├── Contracts/
│   ├── Data/
│   │   └── Menus/
│   ├── Dtos/
│   ├── Services/
│   └── Program.cs
│
├── mealio.client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── vite.config.ts
│
├── Mealio.Tests/
│
├── Scraper/
│   ├── webscraping.py
│   └── requirements.txt
│
└── docker-compose.yml
```

## Prerequisites

Make sure you have the following installed:

* [.NET SDK](https://dotnet.microsoft.com/download)
* [Node.js](https://nodejs.org/)
* [Python](https://www.python.org/downloads/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) optional, for Docker-based development

## Running Locally Without Docker

You need two terminals: one for the backend and one for the frontend.

### 1. Start the backend

From the project root:

```powershell
cd Mealio.Server
dotnet run
```

The backend runs the menu API.

### 2. Start the frontend

Open a second terminal from the project root:

```powershell
cd mealio.client
npm install
npm run dev
```

The frontend uses Vite's proxy to forward API requests to the backend.

## Running With Docker

### Install Docker for Windows

Download and install Docker Desktop:

```txt
https://www.docker.com/products/docker-desktop
```

During installation, enable the WSL 2 backend if prompted.

Verify Docker is installed:

```powershell
docker --version
docker compose version
```

### Start the app with Docker

From the project root:

```powershell
docker compose up --build
```

### What to expect

* The backend and frontend services start automatically
* The frontend development server runs with hot reload
* The backend API runs and is available to the frontend

### View logs

If something goes wrong:

```powershell
docker compose logs
```

Or for a specific service:

```powershell
docker compose logs backend
docker compose logs frontend
```

### Stop Docker containers

```powershell
docker compose down
```

## Menu API

The backend exposes one generic menu endpoint:

```txt
GET /api/menu/{restaurantId}
```

Examples:

```txt
/api/menu/nordrest
/api/menu/edison
/api/menu/bryggan
/api/menu/laziza
/api/menu/smaka-pa-kina
/api/menu/inspira
/api/menu/salads-and-smoothies
/api/menu/bricks-eatery
/api/menu/sony-eatery
```

The backend maps restaurant IDs to JSON files in:

```txt
Mealio.Server/Data/Menus/
```

For example:

```txt
/api/menu/bricks-eatery
```

loads:

```txt
Mealio.Server/Data/Menus/menu_bricks_eatery.json
```

Restaurant IDs use dashes in URLs, while JSON files use underscores.

## Menu JSON Format

Weekly menus use this format:

```json
{
  "week": "V23",
  "days": {
    "Måndag": [
      {
        "category": "Green",
        "price": "115:-",
        "dish": "Vegetarisk pasta"
      }
    ],
    "Tisdag": [],
    "Onsdag": [],
    "Torsdag": [],
    "Fredag": []
  }
}
```

Some fields are optional. For restaurants without categories or prices, they can be omitted:

```json
{
  "week": "V23",
  "days": {
    "Måndag": [
      {
        "price": "119:-",
        "dish": "Timjanstekt kycklingbröst med kokt potatis"
      }
    ]
  }
}
```

Static menus use this format:

```json
{
  "week": "static",
  "isStatic": true,
  "items": [
    {
      "category": "Buffé",
      "price": "145:-",
      "dish": "Libanesisk lunchbuffé, varm & kall meze, sallader och röror"
    }
  ]
}
```

## Updating Menus With the Scraper

The Python scraper is located in:

```txt
Scraper/webscraping.py
```

The scraper requirements are located in:

```txt
Scraper/requirements.txt
```

### Install scraper dependencies

From the `Scraper` folder:

```powershell
cd Scraper
pip install -r requirements.txt
```

### Run a scraper

Use this format:

```powershell
python webscraping.py <output_name> <url>
```

Example:

```powershell
python webscraping.py bricks_eatery "https://brickseatery.se/lunch/#lunch"
```

This saves the file as:

```txt
Mealio.Server/Data/Menus/menu_bricks_eatery.json
```

Important: use underscores in the scraper output name when the backend JSON file should use underscores.

Examples:

```powershell
python webscraping.py nordrest "NORDREST_URL"
python webscraping.py bryggan "BRYGGAN_URL"
python webscraping.py smaka_pa_kina "SMAKA_PA_KINA_URL"
python webscraping.py sony_eatery "SONY_EATERY_URL"
```

## Automated Menu Updates

The intended production workflow is:

1. The Python scraper runs every Monday at 07:00.
2. The scraper fetches the latest restaurant menus and writes updated JSON files to:

```txt
Mealio.Server/Data/Menus/
```

3. The backend menu cache expires at 08:00.
4. The first API request after 08:00 reloads and deserializes the updated JSON files.
5. Users see the latest menus in the frontend.

The backend does not run the scraper itself. The scraper should be scheduled separately, for example with:

* Windows Task Scheduler
* cron on Linux
* a scheduled job on the deployment platform
* GitHub Actions, if the updated JSON files should be committed back to the repository

The scraper should run before the backend cache refresh time. For example:

```txt
07:00 - Python scraper updates menu JSON files
08:00 - Backend cache expires
08:00+ - First user/API request reloads the fresh JSON files
```

If the scraper runs after the backend has already cached menus for the day, users may continue seeing old menu data until the next cache expiry or until the server restarts.

## Running Tests

From the project root:

```powershell
dotnet test
```

## Frontend Build

From the frontend folder:

```powershell
cd mealio.client
npm run build
```

## Backend Build

From the project root:

```powershell
dotnet build
```

## Common Issues

### Vite proxy errors / `ECONNREFUSED`

If you see errors like:

```txt
[vite] http proxy error: /api/menu/nordrest
ECONNREFUSED
```

the backend is probably not running.

Start the backend:

```powershell
cd Mealio.Server
dotnet run
```

Then refresh the frontend.

### Backend works, but frontend cannot load menus

Check that the backend is running on:

```txt
http://localhost:5031
```

Then check `mealio.client/vite.config.ts` and make sure the proxy target points to:

```txt
http://localhost:5031
```

### JSON file not found

If `/api/menu/bricks-eatery` returns 404, make sure the file exists as:

```txt
Mealio.Server/Data/Menus/menu_bricks_eatery.json
```

Not:

```txt
menu_bricks-eatery.json
```

### Images not showing after deployment

File paths are case-sensitive on many deployment platforms.

Make sure paths in `restaurants.ts` match the exact file names in `mealio.client/public`.

Example:

```ts
image: "/bryggan.jpg"
```

must match:

```txt
public/bryggan.jpg
```

## Development Notes

* Restaurant metadata is stored in `mealio.client/src/data/restaurants.ts`
* Menu data is stored as JSON in `Mealio.Server/Data/Menus`
* The frontend calls the backend through `getMenu(restaurantId)`
* Static menus use `isStatic: true` and `items`
* Weekly menus use `days`
* The backend caches menu files and reloads them after the configured cache expiry time
* In production, the scraper is intended to run every Monday at 07:00
* The backend cache is intended to expire at 08:00, so the first request after 08:00 reloads the fresh JSON files
* The backend does not run the scraper itself; the scraper must be scheduled separately

## Suggested Workflow

1. Run the scraper to update menu JSON files
2. Start the backend
3. Start the frontend
4. Verify menus in the browser
5. Run tests
6. Commit changes

```powershell
dotnet test
cd mealio.client
npm run build
```

## License

This project is for learning and portfolio purposes.
