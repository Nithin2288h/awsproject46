# awsproject46

Automated CI/CD deployment of a full-stack Task Manager application on AWS EC2 using Docker Compose and Jenkins.

## Tech Stack
- **Frontend**: React 19, Vite 8, SPA served by Nginx
- **Backend**: Java 23, Spring Boot 3.5.6, Spring Data JPA, REST API
- **Database**: MySQL 8.0 with persistent Docker volume (`mysql_data`)
- **Reverse Proxy**: Nginx routing `/` to the React frontend and `/api/` to the Spring Boot backend
- **CI/CD**: Jenkins Declarative Pipeline (`Jenkinsfile`) running Docker Compose

## Service Architecture & Ports
| Service | Container Port | Host Port | Description |
| :--- | :--- | :--- | :--- |
| **frontend** | `80` | `3000` | React web application & Nginx reverse proxy |
| **backend** | `8080` | `8081` | Spring Boot REST API |
| **mysql** | `3306` | `127.0.0.1:3307` | MySQL database (restricted to localhost) |

## Quick Start (Docker Compose)
1. Copy the environment configuration template:
   ```bash
   cp .env.example .env
   ```
2. Build and run all services:
   ```bash
   docker compose up -d --build
   ```
3. Open your browser:
   - Frontend & App: `http://localhost:3000`
   - Backend API: `http://localhost:3000/api/tasks`

## Jenkins CI/CD Pipeline Stages
1. **Checkout Source Code**: Fetches latest code from GitHub.
2. **Validate Project Files & Configuration**: Checks for required Docker and configuration files, verifies `.env` presence.
3. **Build Docker Images**: Builds backend and frontend images.
4. **Deploy Application**: Starts containers using `docker compose up -d --remove-orphans` while keeping database volumes intact.
5. **Verify Deployment Status**: Validates container health and executes HTTP smoke tests on endpoints.
