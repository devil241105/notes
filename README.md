# Task Manager

## Endpoints


### 1. Create a New Task
- **URL:** `/add-task`
- **Method:** `POST`
- **Body Parameters:**
  - `title`: string
  - `description`: string
  - `status`: string (`Pending`, `In Progress`, `Done`)
- **Response:** 
  - `{ message: "Task created successfully", taskId: <id> }`
    

### 2. Get All Tasks
- **URL:** `/tasks`
- **Method:** `GET`
- **Query Parameters (optional):**
  - `status`: string (e.g., `Pending`, `In Progress`, `Done`)
  - `sort`: string (e.g., `title`, `created_at`, etc.)
  - `order`: string (`asc`, `desc`)
- **Response:** 
  - `[ { id, title, description, status, created_at } ]`
    

### 3. Get Task by ID
- **URL:** `/task/:id`
- **Method:** `GET`
- **Response:** 
  - `{ id, title, description, status, created_at }`
  

### 4. Update a Task
- **URL:** `/task/:id`
- **Method:** `POST`
- **Body Parameters:**
  - `title`: string (optional)
  - `description`: string (optional)
  - `status`: string (optional)
- **Response:** 
  - `{ message: "Task updated successfully" }`


### 5. Delete a Task
- **URL:** `/task/:id/delete`
- **Method:** `POST`
- **Response:** 
  - `{ message: "Task deleted successfully" }`


### 6. Update Task Status
- **URL:** `/task/:id/update-status`
- **Method:** `POST`
- **Body Parameters:**
  - `status`: string (`Pending`, `In Progress`, `Done`)
- **Response:** 
  - `{ message: "Task status updated successfully" }`
