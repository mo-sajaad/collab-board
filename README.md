# Kanban Task Manager — Full-Stack Trello Clone

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

A full-stack, responsive web application for real-time task management, project planning, and team collaboration built with React, Node.js, Express, and PostgreSQL. 

Designed to simulate modern production tools like Trello and Linear, it features intuitive drag-and-drop workflow columns, dynamic member management, and granular role-based permissions.

---

## 🚀 Key Features

## 🚀 Key Features

* **Interactive Kanban Board:** Drag-and-drop tasks seamlessly across columns (`To Do`, `In Progress`, `Done`) powered by `@dnd-kit`.
* **Real-Time WebSockets Sync:** Instant bi-directional communication powered by Socket.io — board updates, column movements, and task modifications broadcast immediately across active user sessions.
* **Task Filtering & Search:** Real-time debounced keyword search and criteria filtering across active board cards, with quick view options under active development.
* **Dynamic Member Management:** Invite team members to boards via instant email lookup and manage roles with strict ownership controls.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
* **Framework:** React 18 (Vite)
* **Real-Time Client:** `socket.io-client`
* **Routing:** React Router v6
* **Drag and Drop:** `@dnd-kit` (Core, Sortable, Utilities)
* **Styling:** Tailwind CSS, React Icons

### **Backend**
* **Runtime:** Node.js, Express.js
* **Real-Time Engine:** Socket.io
* **Database:** PostgreSQL (`pg` pool integration)
* **Authentication:** JSON Web Tokens (JWT) & `bcrypt` password hashing

---

## 🗄️ Database Schema & Architecture Highlights

The PostgreSQL database is fully normalized to ensure strict data integrity and query efficiency. 

```mermaid
erDiagram
    USERS {
        int user_id PK
        string username UK
        string email UK
        string password_hash
        timestamp created_at
    }
    BOARDS {
        int board_id PK
        string name
        string description
        int owner_id FK
        timestamp created_at
    }
    BOARD_MEMBERS {
        int id PK
        int board_id FK
        int user_id FK
        string role
    }
    TASKS {
        int task_id PK
        string title
        timestamp due_date
        timestamp created_at
        timestamp updated_at
        string description
        task_status status
        int priority
        double position
        int creator_id FK
        int assignee_id FK
        int board_id FK
    }

    USERS ||--o{ BOARDS : "owns"
    USERS ||--o{ BOARD_MEMBERS : "belongs to"
    BOARDS ||--o{ BOARD_MEMBERS : "has"
    BOARDS ||--o{ TASKS : "contains"
    USERS ||--o{ TASKS : "creates / executes"

```

### Table Relationships
* `users` — Stores user credentials, uniquely indexed emails, and account profiles.
* `boards` — Stores board metadata linked to an `owner_id` foreign key referencing `users(user_id)`.
* `board_members` — Junction table managing permissions using a composite primary key `(board_id, user_id)`.
* `tasks` — Tracks task state, column order (`position`), and contains distinct foreign keys for `board_id`, `creator_id`, and `assignee_id`.

---

## 🔌 REST API Endpoints

| Category | Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Register a new user account |
| | `POST` | `/api/auth/login` | Public | Authenticate user & return active JWT |
| **Boards** | `GET` | `/api/boards` | Authenticated | Fetch all boards the user belongs to or owns |
| | `GET` | `/api/boards/:id` | Board Member | Fetch deep details for a single board |
| | `DELETE` | `/api/boards/:id` | Board Owner | Permanently delete a board |
| **Members**| `GET` | `/api/boards/:id/members` | Board Member | Fetch active board members |
| | `POST` | `/api/boards/:id/members` | Board Owner | Invite a new member via email lookup |
| | `DELETE` | `/api/boards/:id/members/:userId` | Board Owner | Remove a member from the board |
| **Tasks** | `GET` | `/api/boards/:id/tasks` | Board Member | Fetch all tasks linked to a board |
| | `POST` | `/api/tasks` | Board Member | Instantiate a new task card |
| | `PUT` | `/api/tasks/:id` | Board Member | Update task textual details, positions, or status |
| | `DELETE` | `/api/tasks/:id` | Board Member | Permanently delete a task card |

---

## ⚙️ Local Setup & Installation

### **Prerequisites**
* **Node.js** (v18 or higher)
* **PostgreSQL** instance running locally or securely hosted

### **1. Clone the Project**
```bash
git clone https://github.com/your-username/kanban-task-manager.git
cd kanban-task-manager
```

### **2. Setup Backend Engine**
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` configuration file inside the `backend/` root directory:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/trello_db
JWT_SECRET=your_jwt_secret_key
```

Run your database schema migrations, then spin up the development engine:
```bash
# Run database setup scripts/migrations here if applicable
npm run dev
```

### **3. Setup Frontend Application**
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env` configuration file inside the `frontend/` root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the Vite development web server:
```bash
npm run dev
```

---

## 🎯 Key Engineering Decisions

* **State Encapsulation over Prop Drilling:** Designed highly modular layout structures (e.g., `BoardMembersModal`) to encapsulate their own data fetching routines and isolate state derivation based on authentication contexts.
* **REST API Precision:** Standardised strict HTTP response codes (`403 Forbidden` for unauthorized role actions versus `404 Not Found` for missing resources) to ensure clear, diagnostic client-side error reporting.
* **Event Propagation Handling:** Solved nested click and drag handle event conflicts inside `@dnd-kit` item cards using custom `e.stopPropagation()` hooks to prevent active task selection modals from interrupting card movement handlers.
* **WebSocket Event Architecture:** Isolated Socket.io event emissions to board-specific rooms (`board:{boardId}`) to ensure socket traffic is scoped strictly to active members viewing the relevant board.

---

## 🔮 Future Enhancements Roadmap

- [x] **Real-time Synchronization:** Implement WebSockets via Socket.io for immediate multi-user board mutations and card reflections.
- [ ] **Advanced Search & Filter:**
  - [x] Debounced keyword search
  - [ ] "Assigned to Me" query filter switch
- [ ] **Auth Hardening:** Transition token lifecycle storage from `localStorage` over to secure, encrypted `HttpOnly` cookies.