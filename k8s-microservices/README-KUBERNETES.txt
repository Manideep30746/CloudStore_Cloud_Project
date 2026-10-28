CloudStore microservices Kubernetes quick start (Windows PowerShell)

Prerequisite: Run commands from the extracted project root D:\CloudStore after copying this k8s-microservices folder there. Docker Desktop and Minikube must be running. Root .env must have DB_PASSWORD=your password.

1) Ensure the Compose stack is working first:
   docker compose -f docker-compose.microservices.yml ps

2) Build the service images (the compose build has already done this if images exist):
   docker compose -f docker-compose.microservices.yml build

3) Load images into Minikube:
   minikube image load cloudstore-inventory-service
   minikube image load cloudstore-order-service
   minikube image load cloudstore-user-service
   minikube image load cloudstore-api-gateway

4) Create namespace and secret from root .env:
   kubectl apply -f k8s-microservices\namespace.yaml
   kubectl create secret generic cloudstore-db-secret --from-env-file=.env -n cloudstore-ms

5) Deploy database and wait:
   kubectl apply -f k8s-microservices\postgres.yaml
   kubectl rollout status deployment/cloudstore-db -n cloudstore-ms --timeout=120s

6) Deploy services and gateway:
   kubectl apply -f k8s-microservices\services.yaml
   kubectl apply -f k8s-microservices\gateway.yaml
   kubectl get pods -n cloudstore-ms
   kubectl get services -n cloudstore-ms

7) Important database initialization:
   The Kubernetes database has its own volume and will initially be empty. Create schema and seed products before API testing. Commands:
   kubectl exec -n cloudstore-ms deployment/cloudstore-db -- psql -U postgres -d cloudstore -c "CREATE TABLE products (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, price DECIMAL(10,2) NOT NULL CHECK(price>0), stock INT NOT NULL CHECK(stock>=0));"
   kubectl exec -n cloudstore-ms deployment/cloudstore-db -- psql -U postgres -d cloudstore -c "CREATE TABLE orders (id SERIAL PRIMARY KEY, product_id INT NOT NULL REFERENCES products(id), quantity INT NOT NULL CHECK(quantity>0), total_price DECIMAL(10,2) NOT NULL, status VARCHAR(30) DEFAULT 'PLACED');"
   kubectl exec -n cloudstore-ms deployment/cloudstore-db -- psql -U postgres -d cloudstore -c "CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());"
   kubectl exec -n cloudstore-ms deployment/cloudstore-db -- psql -U postgres -d cloudstore -c "INSERT INTO products(name,price,stock) VALUES ('Laptop',55000,10),('Keyboard',1500,25),('Mouse',800,30);"

8) Test using a port-forward (keep terminal open):
   kubectl port-forward -n cloudstore-ms service/api-gateway 5101:5000
   In another terminal:
   curl.exe http://localhost:5101/
   curl.exe http://localhost:5101/products
   curl.exe http://localhost:5101/orders
   curl.exe http://localhost:5101/users
   curl.exe http://localhost:5101/health

Caveat: this is a demo deployment using a shared PostgreSQL database and a simple user-profile service. It does not implement authentication or fully isolated databases per microservice. Verify all steps before claiming deployment complete.
