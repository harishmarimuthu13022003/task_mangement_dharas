# Team Task Board

A robust, multi-tenant task management web application built with a Node.js/Express.js backend (using Prisma ORM & PostgreSQL) and a React/Vite/Tailwind CSS frontend. It enforces workspace-level security, hierarchical parent-child task validation, and provides premium theme control (dark and light mode).

---

## Tech Stack

### Backend
- **Node.js & Express.js** - Server architecture & routing
- **PostgreSQL & Prisma ORM** - Relational database & database client
- **JWT & bcrypt** - Secure stateless authentication & password hashing
- **dotenv** - Environmental variable management
- **express-validator** - Strong request validator middleware
- **cors** - Cross-origin resource sharing

### Frontend
- **React (Vite)** - Fast component scaffolding and bundling
- **React Router v6** - Route definitions & protected views
- **Axios** - Standardized HTTP client with token injection interceptors
- **React Hook Form** - Stateful form validations
- **Context API** - Global user authentication provider
- **Tailwind CSS** - Modern custom aesthetics with light/dark classes
- **Lucide Icons** - Modern SVG developer icons

---

## Folder Structure

```text
team-task-board/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema models
│   │   └── seed.js             # Mock database seeder script
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Prisma client initializer
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT validation middleware
│   │   │   └── errorHandler.js # Global error handler formatter
│   │   ├── repositories/
│   │   │   ├── userRepository.js
│   │   │   ├── workspaceRepository.js
│   │   │   └── taskRepository.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── index.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── taskService.js
│   │   ├── utils/
│   │   │   ├── errors.js       # Standardized custom error classes
│   │   │   └── jwt.js          # Token signing/verification utils
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   └── taskValidator.js
│   │   ├── app.js              # Express app definition
│   │   └── server.js           # Server listen & lifecycle entrypoint
│   ├── .env                    # Backend environmental configs
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Layout.jsx      # Navigation layout with logout/profile
│   │   │   ├── ThemeToggle.jsx # Persisted light/dark mode switch
│   │   │   └── TaskModal.jsx   # Form modal for task creation/updates
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global user session store
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx   # Stats, filters, and tasks board
│   │   │   └── TaskDetails.jsx # Task properties & subtask inspector
│   │   ├── services/
│   │   │   └── api.js          # Axios client instance with interceptors
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css           # Global custom scrollbars/animations
│   │   └── main.jsx
│   ├── .env                    # Frontend environmental configs
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── package.json
├── README.md
└── task.md                     # Development tracking checklist
```

---

## Environment Variables

### Backend (`backend/.env`)
Create a file named `.env` in the `backend` folder:
```env
PORT=5000
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database_name>?schema=public"
JWT_SECRET="your_secure_secret_key"
```

### Frontend (`frontend/.env`)
Create a file named `.env` in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000
```

---

## Installation & Setup

### 1. Database Setup & Migration
Before running the backend, ensure your PostgreSQL server is active, and configure `DATABASE_URL` in `backend/.env`.

Inside the `backend/` directory, execute:
```bash
# Install NPM packages
npm install

# Run database schema migrations
npx prisma migrate dev --name init

# Populate database with default workspaces, users, and tasks
npx prisma db seed
```

### 2. Default Seeded User Credentials
Once seeded, you can log in to the frontend using any of the following accounts:

| User | Email | Password | Role / Details |
| :--- | :--- | :--- | :--- |
| **John Doe** | `john@example.com` | `password123` | Engineering Dev Workspace Member |
| **Jane Smith** | `jane@example.com` | `password123` | Engineering Dev Workspace Member |
| **Bob Johnson** | `bob@example.com` | `password123` | Engineering Dev Workspace Member |

### 3. Database Inspection & Management Commands (Backend)
- **Launch Prisma Studio (Database GUI)**:
  ```bash
  npx prisma studio
  ```
  *(Opens an interactive GUI at `http://localhost:5555` to view/edit database records)*

- **Re-seed Database**:
  ```bash
  npx prisma db seed
  ```
  *(Clears existing database records and inserts fresh default data)*

- **Reset Database Completely**:
  ```bash
  npx prisma migrate reset
  ```

---

## Run Application

### 1. Run Backend API
In the `backend/` directory:
```bash
# Starts development hot-reloading server on port 5000
npm run dev
```

### 2. Setup & Run Frontend Client
In a new terminal window, change directory to `frontend/`:
```bash
# Install packages
npm install

# Start Vite React hot development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## API Endpoints

### Authentication Endpoints
| Route | Method | Protected | Parameters | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/auth/register` | `POST` | No | `name`, `email`, `password`, `workspaceName` | Creates a workspace, registers the user, and signs them to it. |
| `/auth/login` | `POST` | No | `email`, `password` | Verifies password and returns User data alongside a JWT. |
| `/auth/users` | `GET` | Yes | *None* | Lists all team members (users) inside the logged-in user's workspace. |

### Task Endpoints
| Route | Method | Protected | Parameters / Query Params | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/tasks` | `POST` | Yes | `title`, `description`, `status`, `assigneeId`, `dueDate`, `parentTaskId` | Creates a new task bound to the user's workspace. |
| `/tasks` | `GET` | Yes | `?page`, `?limit`, `?status`, `?assignee`, `?sort`, `?search` | Lists paginated, sorted, searched tasks in the workspace. |
| `/tasks/stats` | `GET` | Yes | *None* | Returns workspace task statistics counts (Total, TODO, In Progress, Done). |
| `/tasks/:id` | `GET` | Yes | `id` (path) | Retrieves single task information with parent details and nested subtasks. |
| `/tasks/:id` | `PUT` | Yes | `id` (path), task update attributes | Modifies task fields (checks subtask completeness if status -> DONE). |
| `/tasks/:id` | `DELETE` | Yes | `id` (path) | Deletes a task. Child tasks are deleted recursively. |

---

## Key Assumptions & Business Logic

1. **One User, One Workspace on Signup**:
   Registration is treated as workspace initiation. A transaction registers the new Workspace first, and then links the creating User to it.
2. **Strict Workspace Isolation (Multi-Tenancy)**:
   The token payload encapsulates `workspaceId`. The task service passes this parameter down to all repository queries, ensuring that a user can never access, modify, link, or delete tasks belonging to another workspace.
3. **Subtask Completeness Block**:
   Before updating a task to `DONE`, the task service queries the database to verify if any associated subtask is open (status != `DONE`). If open items are found, a `400 Bad Request` error is returned with: `"Cannot mark task as Done while subtasks are still open."`
4. **Cascade Deletion**:
   If a parent task is deleted, all its nested child tasks are cascade deleted to maintain data integrity and prevent orphan records.

---

## Known Limitations & Future Improvements

- **PostgreSQL Dependency**: Requires a running PostgreSQL service. Cannot fallback to memory/SQLite without modifying the database adapter in Prisma.
- **Stateless Expiry**: Tokens are currently single-use stateless entities.
- **Future Enhancements**:
  - Implement refresh token database rotations for prolonged logins.
  - Implement a drag-and-drop Kanban Board layout.
  - Integrate WebSockets for real-time multiplayer updates within a workspace.
  - Track activity logs for collaborative task audits.
