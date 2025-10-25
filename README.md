# Transport Broker 🚛

A full-stack web application that connects transport customers with carriers, similar to AirTasker but focused on Transport & Logistics.

## 🎯 Purpose

The platform allows customers to post freight or delivery jobs, carriers to quote or bid, and both parties to manage transport bookings end-to-end through a single, mobile-friendly web app.

## ✨ Core MVP Features

- **User Roles**: Customer, Carrier, Admin
- **Authentication**: Email / Google sign-in via Firebase Auth (JWT-based)
- **Job Management**: Customers create jobs with pickup/drop-off locations, time windows, weight, pallet count, and description
- **Bidding System**: Carriers browse open jobs, submit bids/quotes, accept jobs
- **Job Tracking**: Status flow — Open → Accepted → In Transit → Delivered → Completed
- **File Uploads**: Proof of delivery (POD) and photos via Google Cloud Storage signed URLs
- **Real-time Messaging**: In-app chat per job using Socket.io
- **Rating System**: Mutual feedback on completion
- **Payment Processing**: Stripe Connect marketplace with held funds and payouts to carriers
- **Notifications**: Email + SMS for job events
- **Admin Panel**: Manage users, jobs, and disputes

## 🛠 Tech Stack

### Frontend
- **Next.js** (JavaScript only, no TypeScript) with App Router
- **Bootstrap 5** for responsive styling
- **Firebase Auth** for user authentication
- **Socket.io Client** for real-time features

### Backend
- **Fastify** Node.js API with JSON Schema validation
- **JWT Middleware** for authentication
- **Kysely** PostgreSQL ORM for type-safe database queries
- **Socket.io** for real-time messaging

### Database & Storage
- **Cloud SQL (PostgreSQL)** for main data storage
- **Google Cloud Storage** for documents and images
- **Redis** for caching and sessions

### Deployment & Infrastructure
- **Google Cloud Run** for both frontend and backend
- **Cloud Build** for CI/CD pipeline
- **Artifact Registry** for container images
- **Cloud Armor** for security
- **Terraform** for infrastructure as code

### Monitoring & Secrets
- **Secret Manager** for sensitive configuration
- **Cloud Logging** + Error Reporting + Trace
- **Cloud Monitoring** for application metrics

## 📁 Project Structure

```
transport-broker/
├── app/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable React components
│   │   └── lib/          # Utility functions and configs
│   ├── Dockerfile
│   └── package.json
├── api/                    # Fastify backend API
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── lib/          # Business logic and utilities
│   │   └── schemas/      # JSON Schema validation
│   ├── scripts/          # Migration and seed scripts
│   ├── Dockerfile
│   └── package.json
├── sql/                    # Database migrations and schema
│   └── migrations/
├── infra/                  # Terraform infrastructure code
├── cloudbuild/            # Cloud Build CI/CD configurations
├── .vscode/               # VS Code workspace settings
├── docker-compose.yml     # Local development setup
└── package.json           # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **PostgreSQL** (for local development)
- **Google Cloud SDK** (for deployment)
- **Firebase Project** (for authentication)

### 1. Clone and Install

```bash
git clone <repository-url>
cd transport-broker
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transport_broker
DB_USER=postgres
DB_PASSWORD=password

# Firebase (required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 3. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password and Google providers
3. Generate a service account key for admin access
4. Update your `.env.local` with the credentials

### 4. Local Development with Docker

Start all services (database, frontend, backend):

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on `localhost:5432`
- **Redis** on `localhost:6379`
- **API** on `localhost:3001`
- **Frontend** on `localhost:3000`

### 5. Database Setup

Run migrations to create the database schema:

```bash
cd api
npm run migrate
```

### 6. Manual Development Setup (Alternative)

If you prefer running services manually:

```bash
# Terminal 1: Start PostgreSQL and Redis
docker-compose up db redis

# Terminal 2: Start API
cd api
npm run dev

# Terminal 3: Start Frontend
cd app
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 🔧 Development Workflow

### Available Scripts

```bash
# Root level
npm run dev          # Start both frontend and backend
npm run build        # Build both applications
npm run test         # Run all tests

# Frontend (app/)
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server

# Backend (api/)
npm run dev          # Start Fastify dev server with watch
npm run start        # Start production server
npm run migrate      # Run database migrations
npm run test         # Run API tests
```

### Code Quality

The project uses:
- **JSDoc** with `@ts-check` for type checking in JavaScript
- **ESLint** for code linting
- **Prettier** for code formatting (VS Code integration)

## 🏗 Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and profiles
- **jobs** - Transport job postings
- **bids** - Carrier bids on jobs
- **messages** - In-app messaging
- **ratings** - User feedback system
- **files** - Document storage references
- **notifications** - User notifications

See `sql/migrations/001_initial_schema.sql` for the complete schema.

## 🔐 Authentication Flow

1. Users sign up/login via Firebase Auth (email/password or Google)
2. Frontend receives Firebase ID token
3. Backend validates token using Firebase Admin SDK
4. User record created/updated in PostgreSQL
5. Subsequent API requests use JWT token in Authorization header

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login/verify user
- `POST /api/auth/logout` - Logout

### Jobs
- `GET /api/jobs` - List jobs with filtering
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create new job (customers only)
- `PUT /api/jobs/:id` - Update job
- `POST /api/jobs/:id/bids` - Submit bid (carriers only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/jobs` - Get user's jobs

## 🚀 Production Deployment

### Google Cloud Platform Setup

1. **Create GCP Project**
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable sql.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

3. **Deploy Infrastructure**
   ```bash
   cd infra
   terraform init
   terraform plan -var="project_id=your-project-id"
   terraform apply
   ```

4. **Set up Cloud Build**
   ```bash
   gcloud builds submit --config cloudbuild/cloudbuild.yaml
   ```

### CI/CD Pipeline

The project includes automated deployment via Cloud Build:

1. **Triggers** on GitHub commits to main branch
2. **Builds** Docker images for frontend and backend
3. **Pushes** images to Artifact Registry
4. **Deploys** to Cloud Run
5. **Runs** database migrations

## 🔍 Monitoring

- **Application Logs**: Cloud Logging
- **Error Tracking**: Cloud Error Reporting
- **Performance**: Cloud Trace
- **Metrics**: Cloud Monitoring
- **Health Checks**: Built-in endpoint at `/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Future Roadmap

- [ ] Address autocomplete with Google Maps API
- [ ] Real-time job tracking with GPS
- [ ] Push notifications for mobile
- [ ] Carrier KYC verification system
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app development

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation at `/api/docs` (when running)

---

**Transport Broker** - Connecting the logistics industry, one delivery at a time. 🚛📦

/app        → Next.js app (Bootstrap UI)
/api        → Node.js backend API (Fastify)
/sql        → DB migrations
/infra      → gcloud scripts for GCP setup
/cloudbuild → Cloud Build YAML configs


Development goals

Scaffold the repo with working “Job Create” / “List Jobs” endpoints and pages.

Include a Dockerfile for each service.

Provide example environment variables and a sample Cloud Build pipeline.

Use JSDoc + @ts-check for typing in JavaScript files (no .ts files).

Keep everything mobile-responsive using Bootstrap grid classes.

Prepare for future features: address autocomplete, map tracking, push notifications, and carrier KYC checks.

The result should be a deploy-ready, modular MVP foundation that can scale into a production-grade freight marketplace.
Keep generated code simple, clear, and idiomatic ES Modules with comments explaining each setup step.