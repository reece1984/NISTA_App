# Gateway Success API

Express API backend for Gateway Success action plan management system. Handles all CRUD operations for actions, comments, and history tracking.

## Architecture

This API works **alongside N8N workflows**, not replacing them:
- **N8N**: AI orchestration (document processing, assessments, action plan generation)
- **Express API**: CRUD operations (get/update actions, add comments, etc.)

## Features

- ✅ RESTful API with all CRUD operations
- ✅ PostgreSQL with connection pooling
- ✅ Automatic history tracking via database triggers
- ✅ Threaded comments with @mentions
- ✅ Input validation and error handling
- ✅ Docker-ready for self-hosting
- ✅ snake_case naming convention (matches database)

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (same one N8N uses)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your database connection details
```

3. **Set up database tables:**
```bash
npm run db:setup
```

This creates all required tables and triggers:
- `action_plan_drafts`
- `actions`
- `action_assessments`
- `action_history`
- `action_comments`
- `comment_mentions`

4. **Start the server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

---

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database Configuration
# IMPORTANT: Use the same PostgreSQL database that N8N connects to
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# API Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
# Your frontend URL
CORS_ORIGIN=http://localhost:5173
```

---

## API Endpoints

### Health Check
```
GET /api/health
```
Returns API and database status.

### Actions

**List actions for a project:**
```
GET /api/projects/:projectId/actions
Query params: ?status=in_progress&priority=high&assigned_to=1
```

**Get action details:**
```
GET /api/actions/:id
```
Returns complete action with history and comments.

**Update action:**
```
PATCH /api/actions/:id
Body: {
  "action_status": "in_progress",
  "assigned_to": 1,
  "updated_by": 1
}
```

**Bulk update actions:**
```
PATCH /api/actions/bulk
Body: {
  "action_ids": [1, 2, 3],
  "updates": { "action_status": "completed" },
  "updated_by": 1
}
```

**Get action history:**
```
GET /api/actions/:id/history
```

### Comments

**List comments:**
```
GET /api/actions/:actionId/comments
```
Returns hierarchical comment structure with replies.

**Add comment:**
```
POST /api/actions/:actionId/comments
Body: {
  "user_id": 1,
  "comment_text": "Great progress!",
  "mentions": [2, 3],
  "parent_comment_id": null
}
```

**Update comment:**
```
PATCH /api/comments/:id
Body: {
  "comment_text": "Updated comment",
  "user_id": 1
}
```

**Delete comment:**
```
DELETE /api/comments/:id
Body: { "user_id": 1 }
```

---

## Database Schema

All tables use **snake_case** naming convention:

### Core Tables

**actions** - Main action items
- `id`, `project_id`, `title`, `description`
- `action_status`, `priority`, `assigned_to`
- `due_date`, `completed_at`
- `created_by`, `updated_by`, `created_at`, `updated_at`

**action_history** - Audit trail (auto-populated by trigger)
- `id`, `action_id`, `changed_by`
- `field_changed`, `old_value`, `new_value`, `changed_at`

**action_comments** - Comments with threading
- `id`, `action_id`, `user_id`, `parent_comment_id`
- `comment_text`, `created_at`, `updated_at`

**action_assessments** - Links actions to assessment findings
- `id`, `action_id`, `assessment_id`

**action_plan_drafts** - AI-generated draft action plans
- `id`, `assessment_run_id`, `draft_data`
- `conversation_history`, `draft_status`, `created_by`

**comment_mentions** - @user mentions in comments
- `id`, `comment_id`, `mentioned_user_id`

### Automatic History Tracking

The `action_audit_trigger` automatically logs changes to:
- `action_status`
- `assigned_to`
- `priority`
- `due_date`
- `title`
- `description`

No manual history inserts needed in your code!

---

## Docker Deployment

### Option 1: Docker Compose (Development)

Includes a PostgreSQL database for testing:

```bash
docker-compose up -d
```

Access API at `http://localhost:3000`

### Option 2: Docker Only (Production)

Use with your existing PostgreSQL database:

```bash
# Build image
docker build -t gateway-success-api .

# Run container
docker run -d \
  --name gateway-success-api \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e CORS_ORIGIN="https://your-frontend.com" \
  -e NODE_ENV=production \
  gateway-success-api
```

---

## Testing the API

### Using curl

**Health check:**
```bash
curl http://localhost:3000/api/health
```

**Get actions:**
```bash
curl http://localhost:3000/api/projects/1/actions
```

**Update action:**
```bash
curl -X PATCH http://localhost:3000/api/actions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "action_status": "in_progress",
    "updated_by": 1
  }'
```

**Add comment:**
```bash
curl -X POST http://localhost:3000/api/actions/1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "comment_text": "Started working on this action"
  }'
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation failed)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

---

## Development

### File Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── actions.js      # Action CRUD endpoints
│   │   ├── comments.js     # Comment endpoints
│   │   └── health.js       # Health check
│   ├── db/
│   │   ├── pool.js         # PostgreSQL connection pool
│   │   ├── schema.sql      # Database schema + triggers
│   │   └── setup.js        # Database setup script
│   ├── middleware/
│   │   ├── errorHandler.js # Global error handling
│   │   └── validateRequest.js # Input validation
│   ├── utils/
│   │   └── logger.js       # Logging utility
│   └── server.js           # Express app entry point
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

### Running in Development

```bash
# With hot reload (Node 18+ --watch flag)
npm run dev

# Or use nodemon
npm install -g nodemon
nodemon src/server.js
```

### Logs

The API uses colored console logging:
- 🔵 [INFO] - General information
- 🟢 [SUCCESS] - Successful operations
- 🟡 [WARN] - Warnings
- 🔴 [ERROR] - Errors
- 🟣 [DEBUG] - Debug info (dev only)
- 🔵 [HTTP] - HTTP requests

---

## Integration with Frontend

The frontend should call this API for CRUD operations instead of N8N.

Update `src/services/api.ts` to call these endpoints:

```typescript
// Example: Get actions
const actions = await fetch(`${API_BASE_URL}/api/projects/${projectId}/actions`);

// Example: Update action
await fetch(`${API_BASE_URL}/api/actions/${actionId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action_status: 'completed', updated_by: userId })
});
```

---

## Security Considerations

**Current Setup:**
- No authentication (API is open)
- Relies on network-level security
- Suitable for internal/private networks

**For Production:**
- Add JWT authentication
- Implement rate limiting
- Use HTTPS
- Add API keys
- Implement RBAC (Role-Based Access Control)

---

## Troubleshooting

**Database connection failed:**
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Ensure database exists
- Check firewall/network settings

**CORS errors:**
- Update CORS_ORIGIN in .env
- Verify frontend URL is correct

**Port already in use:**
- Change PORT in .env
- Or kill process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F

  # Linux/Mac
  lsof -i :3000
  kill -9 <PID>
  ```

---

## Production Deployment

### Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production database credentials
- [ ] Enable HTTPS
- [ ] Set up monitoring (PM2, Docker health checks)
- [ ] Configure log aggregation
- [ ] Set up database backups
- [ ] Implement rate limiting
- [ ] Add authentication if needed
- [ ] Review CORS settings
- [ ] Load test the API

### Using PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start src/server.js --name gateway-success-api
pm2 save
pm2 startup
```

---

## Support

For issues or questions:
1. Check the logs: `docker logs gateway-success-api`
2. Verify database connection: `curl http://localhost:3000/api/health`
3. Check environment variables
4. Review the schema: `src/db/schema.sql`

---

## License

MIT
