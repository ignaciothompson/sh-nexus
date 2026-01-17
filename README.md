# SH-NEXUS

**SH-NEXUS** is a modular, self-hosted personal cloud suite designed to centralize your digital life. It is built as a monorepo containing multiple integrated applications, all orchestrated via Docker for easy deployment and management.

## 🚀 Overview

The suite consists of several purpose-built applications:

### 1. Nexus Hub (Port 5100)
The central dashboard and command center.
-   **Purpose**: Launchpad for all apps and quick access links.
-   **Features**: Personalized dashboard, widgets, and status monitoring.

### 2. Media Tracker (Port 5101)
A dedicated application for tracking your entertainment.
-   **Purpose**: Keep track of movies, TV shows, and books.
-   **Features**: Watchlists, progress tracking, and media discovery.

### 3. Textbook (Port 5102)
A powerful personal knowledge base and note-taking app.
-   **Purpose**: Second brain for ideas, projects, and documentation.
-   **Features**:
    -   **Notes**: Google Keep-style quick notes with labels and image support.
    -   **Books**: Structured wiki/documentation builder.
    -   **Planner**: Kanban-style project management.

---

## 🛠️ Infrastructure

Each application is containerized and comes with its own dedicated backend (PocketBase) ensuring data isolation and portability.

### Directory Structure
```
c:\sh-nexus
├── apps/                  # Source code for applications
│   ├── hub/               # Nexus Hub source
│   ├── media-tracker/     # Media Tracker source
│   └── textbook/          # Textbook source
├── data/                  # Persistent data volumes
│   ├── hub_pb_data/       # Database for Hub
│   ├── media_pb_data/     # Database for Media Tracker
│   └── textbook_pb_data/  # Database for Textbook
└── docker-compose.yml     # Orchestration configuration
```

## 🏁 Getting Started

### Prerequisites
-   **Docker** and **Docker Compose** installed.

### Installation & Run
1.  Navigate to the project root:
    ```bash
    cd c:\sh-nexus
    ```
2.  Start the entire suite:
    ```bash
    docker compose up -d
    ```
    *(Use `--build` to rebuild images if you've made code changes)*

### Access Points
Once running, access your apps at:
-   **Hub**: [http://localhost:5100](http://localhost:5100)
-   **Media Tracker**: [http://localhost:5101](http://localhost:5101)
-   **Textbook**: [http://localhost:5102](http://localhost:5102)

---

## 🔧 Development

This project follows a monorepo structure. Code for individual applications is located in `apps/<app-name>`. 

-   **Frontend**: Angular (typically)
-   **Backend**: PocketBase (embedded within the Docker container)

To work on a specific app, navigate to its folder and run standard development commands (e.g., `npm start` for Angular CLI), or develop against the running Docker containers.
