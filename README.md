# SGD to PHP Rates

Shows Singapore dollar to Philippine Peso (and vice-versa) conversion rate based on current market rate.

Also displays current rates from some of the most used Peso remittance centers.
![image](https://user-images.githubusercontent.com/25724464/218394270-1d38c568-02a2-45c2-88f8-8d21dc828738.png)

### Built with
Frontend
- [NextJS](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)

Backend
- Python
- [FastAPI](https://fastapi.tiangolo.com)
- [MongoDB](https://www.mongodb.com)

## Live site
https://www.sgdtopeso.com

## Running locally

### Prerequisites
- Python 3.x
- Node.js 18+
- MongoDB (local or remote connection string)

### Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt
playwright install chromium    # Required for web scrapers

# Configure environment variables in backend/.env
#   DATABASE_URL=<your mongodb connection string>
#   DATABASE_NAME=exchangeRateDB
#   API_USER=<basic auth username>
#   API_PASSWORD=<basic auth password>
#   SCRAPE_TIMEOUT=60000

# Run the server
uvicorn main:app --reload      # http://localhost:8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables in frontend/.env
#   REVALIDATE_SECONDS=60
#   NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the dev server
npm run dev                    # http://localhost:3000
```
