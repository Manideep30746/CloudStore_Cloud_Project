# CloudStore – Kubernetes-Based Inventory and Order Management System

## Project Overview
CloudStore is a web-based inventory and order management application built using Node.js, Express.js, PostgreSQL, HTML, CSS, Docker, and Kubernetes.

## Features
- View available products and stock quantities
- Add products through the backend API
- Place orders and calculate order totals
- Automatically reduce product stock after an order
- Store product and order information in PostgreSQL
- Containerize the application using Docker
- Deploy the backend and database using Kubernetes

## Technologies
- Backend: Node.js and Express.js
- Database: PostgreSQL
- Frontend: HTML, CSS, JavaScript
- Containerization: Docker and Docker Compose
- Orchestration: Kubernetes and Minikube

## Repository Structure
- `backend/` – API source code and Dockerfile
- `frontend/` – Web interface
- `k8s/` – Kubernetes Deployment and Service manifests
- `docker-compose.yml` – Local container orchestration

## Run Using Docker Compose

1. Install Docker Desktop and ensure it is running.
2. Create a root `.env` file containing `DB_PASSWORD=your_local_password`.
3. Start the application:

   ```bash
   docker compose up -d --build
   ```

4. Initialize the database tables and sample data if the database is new. Refer to the project setup instructions before running the API.
5. Test the API at `http://localhost:5000/`.

## Run Using Kubernetes

1. Install Docker Desktop, kubectl, and Minikube.
2. Start the cluster:

   ```bash
   minikube start --driver=docker
   ```

3. Build or load the backend image and create the database Secret.
4. Apply the PostgreSQL and backend manifests in `k8s/`.
5. Initialize the database schema and sample products.
6. Access the backend with:

   ```bash
   kubectl port-forward service/cloudstore-backend 5001:5000
   ```

7. Test `http://localhost:5001/` and `http://localhost:5001/products`.

## Security
Do not commit `.env` files, database passwords, or access tokens to the repository.

## Current Implementation Status
The backend API, PostgreSQL integration, Docker Compose configuration, and Kubernetes deployment have been tested locally. Additional CI/CD automation and monitoring may be added as future enhancements.