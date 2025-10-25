# Terraform configuration for GCP infrastructure
# Sets up the core infrastructure for transport-broker application

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.84"
    }
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Variables
variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "sql.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "storage.googleapis.com",
    "firestore.googleapis.com",
    "cloudtrace.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com"
  ])
  
  service = each.value
  disable_on_destroy = false
}

# Artifact Registry for container images
resource "google_artifact_registry_repository" "transport_broker" {
  location      = var.region
  repository_id = "transport-broker"
  description   = "Transport Broker container images"
  format        = "DOCKER"
  
  depends_on = [google_project_service.required_apis]
}

# Cloud SQL instance for PostgreSQL
resource "google_sql_database_instance" "postgres" {
  name             = "transport-broker-db-${var.environment}"
  database_version = "POSTGRES_15"
  region          = var.region
  deletion_protection = false

  settings {
    tier = "db-f1-micro"
    
    backup_configuration {
      enabled = true
      start_time = "03:00"
      point_in_time_recovery_enabled = true
    }
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }
    
    database_flags {
      name  = "log_statement"
      value = "all"
    }
  }
  
  depends_on = [google_project_service.required_apis]
}

# Database
resource "google_sql_database" "database" {
  name     = "transport_broker"
  instance = google_sql_database_instance.postgres.name
}

# Database user
resource "google_sql_user" "database_user" {
  name     = "postgres"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

# Generate random password for database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Store database password in Secret Manager
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password-${var.environment}"
  
  replication {
    automatic = true
  }
  
  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# JWT Secret
resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret-${var.environment}"
  
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = random_password.jwt_secret.result
}

# Cloud Storage bucket for file uploads
resource "google_storage_bucket" "uploads" {
  name     = "${var.project_id}-transport-broker-uploads-${var.environment}"
  location = var.region
  
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
  
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}

# Cloud Run service for API
resource "google_cloud_run_service" "api" {
  name     = "transport-broker-api-${var.environment}"
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/transport-broker/transport-broker-api:latest"
        
        ports {
          container_port = 3001
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "1Gi"
          }
        }
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "DB_HOST"
          value = google_sql_database_instance.postgres.private_ip_address
        }
        
        env {
          name  = "DB_NAME"
          value = google_sql_database.database.name
        }
        
        env {
          name  = "DB_USER"
          value = google_sql_user.database_user.name
        }
        
        env {
          name = "DB_PASSWORD"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_password.secret_id
              key  = "latest"
            }
          }
        }
        
        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.jwt_secret.secret_id
              key  = "latest"
            }
          }
        }
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.required_apis]
}

# Cloud Run service for Frontend
resource "google_cloud_run_service" "app" {
  name     = "transport-broker-app-${var.environment}"
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/transport-broker/transport-broker-app:latest"
        
        ports {
          container_port = 3000
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "1Gi"
          }
        }
        
        env {
          name  = "NEXT_PUBLIC_API_URL"
          value = google_cloud_run_service.api.status[0].url
        }
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.required_apis]
}

# IAM policy to allow unauthenticated access
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "api_noauth" {
  location = google_cloud_run_service.api.location
  project  = google_cloud_run_service.api.project
  service  = google_cloud_run_service.api.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "app_noauth" {
  location = google_cloud_run_service.app.location
  project  = google_cloud_run_service.app.project
  service  = google_cloud_run_service.app.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

# Outputs
output "api_url" {
  description = "URL of the API service"
  value       = google_cloud_run_service.api.status[0].url
}

output "app_url" {
  description = "URL of the frontend application"
  value       = google_cloud_run_service.app.status[0].url
}

output "database_connection_name" {
  description = "Connection name for the database"
  value       = google_sql_database_instance.postgres.connection_name
}

output "storage_bucket" {
  description = "Name of the storage bucket"
  value       = google_storage_bucket.uploads.name
}