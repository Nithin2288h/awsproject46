pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        APP_NAME     = 'project46'
        APP_HOST     = '127.0.0.1'
        FRONTEND_PORT = '3000'
        BACKEND_PORT  = '8081'
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                echo "=== Step 1: Checking out source code from GitHub ==="
                checkout scm
            }
        }

        stage('Validate Project Files and Configuration') {
            steps {
                echo "=== Step 2: Validating required project files and environment ==="
                sh '''
                    set -e
                    echo "Checking essential project files..."
                    test -f docker-compose.yml || { echo "ERROR: docker-compose.yml not found!"; exit 1; }
                    test -f Dockerfile || { echo "ERROR: Root backend Dockerfile not found!"; exit 1; }
                    test -f frontend/Dockerfile || { echo "ERROR: frontend/Dockerfile not found!"; exit 1; }
                    test -f nginx.conf || { echo "ERROR: nginx.conf not found!"; exit 1; }
                    test -f pom.xml || { echo "ERROR: pom.xml not found!"; exit 1; }
                    test -f frontend/package.json || { echo "ERROR: frontend/package.json not found!"; exit 1; }

                    echo "Validating Docker and Docker Compose availability..."
                    docker --version
                    docker compose version || docker-compose --version

                    echo "Checking environment file (.env)..."
                    if [ ! -f .env ]; then
                        if [ -f .env.example ]; then
                            echo "Notice: .env not found. Initializing .env from .env.example."
                            echo "For production, ensure secure credentials are set in .env or via Jenkins credentials."
                            cp .env.example .env
                        else
                            echo "ERROR: Neither .env nor .env.example found!"
                            exit 1
                        fi
                    else
                        echo ".env file is present."
                    fi

                    echo "Validating Docker Compose configuration syntax..."
                    docker compose -f docker-compose.yml config > /dev/null
                    echo "Validation passed successfully."
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "=== Step 3: Building backend and frontend Docker images ==="
                sh '''
                    set -e
                    echo "Building Docker images using docker-compose.yml..."
                    docker compose -f docker-compose.yml build --pull backend frontend
                    echo "Image build completed successfully."
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                echo "=== Step 4: Deploying or updating application with Docker Compose ==="
                sh '''
                    set -e
                    echo "Deploying containers (preserving volumes, updating services)..."
                    # Preserves mysql_data named volume and applies container updates
                    docker compose -f docker-compose.yml up -d --remove-orphans
                    echo "Application containers started in background."
                '''
            }
        }

        stage('Verify Deployment Status') {
            steps {
                echo "=== Step 5: Verifying container health and HTTP connectivity ==="
                sh '''
                    set -e

                    echo "Current container status:"
                    docker compose -f docker-compose.yml ps

                    echo "Waiting for services to become healthy (up to 90s)..."
                    MAX_RETRIES=18
                    COUNT=0
                    ALL_HEALTHY=false

                    while [ $COUNT -lt $MAX_RETRIES ]; do
                        COUNT=$((COUNT + 1))
                        
                        MYSQL_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' project46-mysql 2>/dev/null || echo '"unknown"')
                        API_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' project46-api 2>/dev/null || echo '"unknown"')
                        FRONTEND_RUNNING=$(docker inspect --format='{{.State.Running}}' project46-frontend 2>/dev/null || echo 'false')

                        echo "[Check $COUNT/$MAX_RETRIES] MySQL: $MYSQL_STATUS | Backend API: $API_STATUS | Frontend running: $FRONTEND_RUNNING"

                        if [ "$MYSQL_STATUS" = '"healthy"' ] && [ "$API_STATUS" = '"healthy"' ] && [ "$FRONTEND_RUNNING" = 'true' ]; then
                            ALL_HEALTHY=true
                            break
                        fi

                        sleep 5
                    done

                    if [ "$ALL_HEALTHY" != "true" ]; then
                        echo "ERROR: Containers failed to reach healthy state!"
                        echo "=== DOCKER COMPOSE LOGS (Last 50 lines) ==="
                        docker compose -f docker-compose.yml logs --tail=50
                        exit 1
                    fi

                    echo "Performing HTTP smoke tests..."
                    echo "1. Checking Frontend (Nginx) at http://${APP_HOST}:${FRONTEND_PORT}/..."
                    curl -s -f "http://${APP_HOST}:${FRONTEND_PORT}/" > /dev/null || {
                        echo "ERROR: Frontend did not respond at http://${APP_HOST}:${FRONTEND_PORT}/";
                        docker compose -f docker-compose.yml logs --tail=30 frontend
                        exit 1;
                    }

                    echo "2. Checking Backend REST API via Nginx reverse proxy at http://${APP_HOST}:${FRONTEND_PORT}/api/tasks..."
                    curl -s -f "http://${APP_HOST}:${FRONTEND_PORT}/api/tasks" > /dev/null || {
                        echo "ERROR: API reverse proxy did not respond at http://${APP_HOST}:${FRONTEND_PORT}/api/tasks";
                        docker compose -f docker-compose.yml logs --tail=30 backend
                        exit 1;
                    }

                    echo "3. Checking Backend REST API directly at http://${APP_HOST}:${BACKEND_PORT}/api/tasks..."
                    curl -s -f "http://${APP_HOST}:${BACKEND_PORT}/api/tasks" > /dev/null || {
                        echo "ERROR: Backend API did not respond at http://${APP_HOST}:${BACKEND_PORT}/api/tasks";
                        docker compose -f docker-compose.yml logs --tail=30 backend
                        exit 1;
                    }

                    echo "SUCCESS: All containers are healthy and all HTTP endpoints are verified!"
                '''
            }
        }
    }

    post {
        always {
            echo "Jenkins deployment pipeline execution finished."
        }
        success {
            echo "SUCCESS: Project 46 deployment completed successfully."
        }
        failure {
            echo "FAILURE: Deployment failed. Please inspect the container logs above."
        }
    }
}
