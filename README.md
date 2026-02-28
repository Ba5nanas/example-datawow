# Docker Setup Guide

This guide will help you set up and run the Concert Reservation System using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed (usually comes with Docker)

## Project Structure

```
example/
├── backend/          # NestJS backend API
├── frontend/         # Next.js frontend application
├── docker-compose.yml  # Docker Compose configuration
└── README.md         # This file
```

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd example
```

2. Start the services:
```bash
docker-compose up --build
```

This will start:
- **Frontend**: http://localhost:5001

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=concert_user
DATABASE_PASSWORD=concert_password
DATABASE_NAME=concert_db

# Server
PORT=5001
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://concert-backend-dev:5001
```

## Docker Services

### Backend Service

- **Image**: Built from `backend/Dockerfile`
- **Dependencies**: PostgreSQL database
- **Environment Variables**: Loaded from `.env` file

### Frontend Service

- **Image**: Built from `frontend/Dockerfile`
- **Port**: 5001
- **Dependencies**: Backend API
- **Environment Variables**: Loaded from `.env` file

### Database Service

- **Image**: postgres:15-alpine
- **Port**: 5432
- **Environment Variables**:
  - POSTGRES_USER: concert_user
  - POSTGRES_PASSWORD: concert_password
  - POSTGRES_DB: concert_db
- **Volumes**: Persisted database data

## Accessing the Application

Once the services are running:

1. Open your browser and navigate to: http://localhost:5001
2. You will be redirected to the login page
3. Register a new account or login with existing credentials
4. After login, you can access:
   - **User Dashboard**: View concerts, make reservations
   - **Admin Dashboard**: Manage concerts, view reservation history

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Concerts
- `GET /api/concerts` - Get all concerts
- `GET /api/concerts/:id` - Get concert by ID
- `POST /api/concerts` - Create new concert (Admin only)
- `PATCH /api/concerts/:id` - Update concert (Admin only)
- `DELETE /api/concerts/:id` - Delete concert (Admin only)

### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/:id` - Get reservation by ID
- `POST /api/reservations` - Create reservation
- `PATCH /api/reservations/:id/cancel` - Cancel reservation
- `GET /api/reservations/user/:userId` - Get reservations by user
- `GET /api/reservations/concert/:concertId` - Get reservations by concert

## Running Unit Tests

### Running Backend Unit Tests

To run unit tests for the backend using Docker:

1. First, ensure the backend container is running:
```bash
docker ps
```

2. Execute the test command inside the backend container:
```bash
docker exec -it concert-backend-dev npm run test
```

This will run all unit tests for:
- Users module
- Concerts module
- Reservations module

### Running Backend Unit Tests with Coverage

To run tests with coverage report:
```bash
docker exec -it concert-backend-dev npm run test:cov
```

### Running Backend E2E Tests

To run end-to-end tests:
```bash
docker exec -it concert-backend-dev npm run test:e2e
```

### Running Tests in Watch Mode

To run tests in watch mode (useful during development):
```bash
docker exec -it concert-backend-dev npm run test:watch
```

### Running Tests with Debug Output

To run tests with verbose output:
```bash
docker exec -it concert-backend-dev npm run test -- --verbose
```

## Stopping the Services

To stop all running services:

```bash
docker-compose down
```

## Removing All Data

To remove all containers, networks, and volumes:

```bash
docker-compose down -v
```

⚠️ **Warning**: This will delete all database data!

## Troubleshooting

### Port Already in Use

If you see an error about port 5001 being in use:

1. Check what's using the port:
```bash
lsof -i :5001
```

2. Stop the conflicting service or change the ports in `docker-compose.yml`

### Database Connection Issues

If the backend cannot connect to the database:

1. Check if the database container is running:
```bash
docker ps
```

2. Check database logs:
```bash
docker logs concert-db
```

3. Ensure the database is fully started (wait 10-20 seconds after `docker-compose up`)

### Frontend Cannot Connect to Backend

If the frontend shows connection errors:

1. Check if the backend is running:
```bash
docker ps
```

2. Check backend logs:
```bash
docker logs concert-backend-dev
```

3. Verify the `NEXT_PUBLIC_API_URL` in frontend `.env` file matches the backend service name

### Test Failures

If unit tests fail:

1. Check test logs:
```bash
docker logs concert-backend-dev
```

2. Run tests with verbose output to see detailed error messages:
```bash
docker exec -it concert-backend-dev npm run test -- --verbose
```

3. Ensure all dependencies are installed:
```bash
docker exec -it concert-backend-dev npm install
```

## Development Tips

### Viewing Logs

To view logs from all services:
```bash
docker-compose logs -f
```

To view logs from a specific service:
```bash
docker-compose logs -f concert-backend-dev
docker-compose logs -f concert-frontend
docker-compose logs -f concert-db
```

### Rebuilding Services

To rebuild a service without restarting others:
```bash
docker-compose build concert-backend-dev
docker-compose up -d concert-backend-dev
```

### Accessing Container Shell

To access a running container's shell:
```bash
docker exec -it concert-backend-dev sh
docker exec -it concert-frontend sh
docker exec -it concert-db sh
```

### Hot Reloading Backend Code

For development with hot reloading:

1. Mount your local backend directory to the container (already configured in `docker-compose.dev.yml`)
2. Make changes to your local files
3. The changes will be reflected in the container automatically
4. Restart the backend container if needed:
```bash
docker-compose restart concert-backend-dev
```

## Production Deployment

For production deployment:

1. Update environment variables for production
2. Use `docker-compose.yml` (not `docker-compose.dev.yml`)
3. Set `NODE_ENV=production` in backend `.env`
4. Consider using environment-specific `.env` files
5. Set up proper SSL/TLS certificates
6. Configure a reverse proxy (nginx) for production use

## Security Considerations

1. **Change Default Passwords**: Update database passwords in production
2. **Environment Variables**: Never commit `.env` files to version control
3. **Network Security**: Use Docker networks to isolate services
4. **Volume Permissions**: Ensure proper file permissions for mounted volumes
5. **Regular Updates**: Keep Docker images and dependencies updated

## Support

For issues or questions:
- Check Docker logs for error messages
- Verify all services are running with `docker ps`
- Ensure ports are not blocked by firewall
- Review environment variables in `.env` files
- Run unit tests to verify backend functionality

## License

This project is licensed under the MIT License.
