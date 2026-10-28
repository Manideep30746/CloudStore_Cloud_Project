# CloudStore Microservices (starter implementation)

This is a separate implementation path; it does not overwrite the existing `backend/` or `docker-compose.yml`.

## Services
- API Gateway: port 5000; routes frontend API calls to the services.
- Inventory Service: products and stock.
- Order Service: order history and transactional order placement/stock reduction.
- User Service: simple user records (name/email; no authentication/password handling).
- PostgreSQL: shared database for this project prototype.

## Requirements
Docker Desktop running; root `.env` file contains `DB_PASSWORD=your_local_password`.

## Start (separate test database/volume)
```powershell
docker compose -f docker-compose.microservices.yml up -d --build
```
The gateway is exposed on host port 5001, and the new database on host port 5435, to avoid collisions with the existing CloudStore stack.

Check:
```powershell
curl.exe http://localhost:5001/
curl.exe http://localhost:5001/products
curl.exe http://localhost:5001/orders
curl.exe http://localhost:5001/users
```
Create a user:
```powershell
curl.exe -X POST http://localhost:5001/users -H "Content-Type: application/json" -d "{\"name\":\"Demo User\",\"email\":\"demo@example.com\"}"
```

The SQL init script runs only when the microservices PostgreSQL volume is initialized for the first time. Do not delete the existing CloudStore data volume.

## Kubernetes
Do not apply the current single-backend manifests as if they deploy these services. Kubernetes manifests for this new microservices stack must be created and tested separately before claiming the microservices run on Kubernetes.
