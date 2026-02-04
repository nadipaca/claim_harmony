# ClaimHarmony - Build Test MVP

A Next.js App Router application with TypeScript, Tailwind CSS, and Prisma connected to Supabase Postgres.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase Postgres
- **ORM**: Prisma
- **Authentication**: bcryptjs for password hashing

## Prerequisites

- Node.js 20+ installed
- A Supabase account and project
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Environment Configuration

The `.env` file has been created with a placeholder. Edit it and add your Supabase database connection string:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?schema=public"
```

**To get your Supabase connection string:**

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **Connection string** section
4. Copy the **URI** format connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password

### 3. Generate Prisma Client

Generate the TypeScript types and Prisma Client from your schema:

```bash
npx prisma generate
```

This creates the `@prisma/client` package with all your models and types.

### 4. Database Migration Commands

**Important**: Prisma migrations will create all database tables automatically. You do NOT need to create any tables manually in Supabase.

Run the following command to create the database schema:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables (User, InsuranceCompany, Claim, ClaimEvent, ClaimDocument)
- Create all enums (Role, ClaimType, ClaimStatus, ClaimEventType)
- Generate the Prisma Client automatically

### 5. Seed Data Commands

Populate the database with initial data:

```bash
npx prisma db seed
```

This will create:

**3 Insurance Companies** (with exact portal URLs):
- **Citizens** → https://www.citizensfla.com/mypolicy
- **Universal** → https://claimpath.universalproperty.com/
- **State Farm** → https://www.statefarm.com/claims

**3 Test Users** (password: `Password123!`):
- `consumer@test.com` (Role: CONSUMER)
- `contractor@test.com` (Role: CONTRACTOR)
- `admin@test.com` (Role: ADMIN)

**2 Example Claims**:
- **CH-000001** (NEW status) - Roof damage, available for contractors to accept
- **CH-000002** (ACCEPTED status) - Water damage, already accepted by contractor

**3 Claim Events** - Tracking claim creation and contractor acceptance

### 6. Development Server Startup

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure Overview

```
claim_harmony/
├── prisma/
│   ├── schema.prisma      # Complete database schema with all models
│   └── seed.ts            # Seed script with insurers and test users
├── src/
│   ├── app/               # Next.js App Router pages
│   └── lib/
│       └── prisma.ts      # Prisma client singleton (hot-reload safe)
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment file template
└── package.json           # Dependencies and Prisma scripts
```

## Database Schema

### Enums

- **Role**: CONSUMER, CONTRACTOR, ADMIN
- **ClaimType**: ROOF, WATER, FIRE, MOLD, OTHER
- **ClaimStatus**: NEW, ACCEPTED
- **ClaimEventType**: CLAIM_CREATED, CONTRACTOR_ACCEPTED, DOCUMENT_UPLOADED

### Models

#### User
Stores consumer, contractor, and admin accounts with authentication:
- `id` (String, CUID)
- `email` (String, unique)
- `name` (String, optional)
- `passwordHash` (String, bcrypt hashed)
- `role` (Role enum)
- `createdAt`, `updatedAt` (DateTime)
- Relations: claims created, claims accepted, events, documents

#### InsuranceCompany
Insurance provider information with portal URLs:
- `id` (String, CUID)
- `key` (String, unique - "citizens", "universal", "statefarm")
- `name` (String)
- `claimsPortalUrl` (String)
- `createdAt` (DateTime)
- Relations: claims

#### Claim
Individual insurance claims with tracking:
- `id` (String, CUID)
- `claimNumber` (String, unique - format: "CH-000001")
- `address` (String)
- `type` (ClaimType enum)
- `description` (String)
- `status` (ClaimStatus enum, default: NEW)
- `consumerId` (String, FK to User)
- `insuranceCompanyId` (String, FK to InsuranceCompany)
- `acceptedByContractorId` (String, optional FK to User)
- `createdAt`, `updatedAt` (DateTime)
- Relations: consumer, insurance company, contractor, events, documents

#### ClaimEvent
Audit trail for claim activities:
- `id` (String, CUID)
- `claimId` (String, FK to Claim, cascade delete)
- `eventType` (ClaimEventType enum)
- `actorRole` (Role enum)
- `actorUserId` (String, optional FK to User)
- `createdAt` (DateTime)
- `meta` (Json, optional metadata)
- Relations: claim, actor user

#### ClaimDocument
Uploaded documents for claims:
- `id` (String, CUID)
- `claimId` (String, FK to Claim, cascade delete)
- `filename` (String)
- `docType` (String, optional - e.g., "inspection", "photo", "invoice")
- `storageUrl` (String, optional)
- `uploadedByUserId` (String, FK to User)
- `uploadedAt` (DateTime)
- Relations: claim, uploaded by user

## Prisma Commands Reference

### Generate Prisma Client
```bash
npm run prisma:generate
# or
npx prisma generate
```

### Run Migrations
```bash
npm run prisma:migrate
# or
npx prisma migrate dev
```

### Seed Database
```bash
npm run prisma:seed
# or
npx prisma db seed
```

### Open Prisma Studio (Database GUI)
```bash
npx prisma studio
```
Opens at http://localhost:5555 - Browse and edit your database visually.

### Reset Database (drops all data)
```bash
npx prisma migrate reset
```
This will drop all tables, re-run migrations, and re-seed the database.

## Test Credentials

After seeding, you can use these credentials for testing:

| Email | Password | Role |
|-------|----------|------|
| consumer@test.com | Password123! | CONSUMER |
| contractor@test.com | Password123! | CONTRACTOR |
| admin@test.com | Password123! | ADMIN |

## Important Notes

### Server-Side Only
**Prisma must only be used in server components, API routes, or server actions.** Never import Prisma in client components.

```typescript
// ✅ Good - Server Component
import { prisma } from '@/lib/prisma'

export default async function Page() {
  const claims = await prisma.claim.findMany()
  return <div>...</div>
}

// ✅ Good - API Route
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany()
  return Response.json(users)
}

// ❌ Bad - Client Component
'use client'
import { prisma } from '@/lib/prisma' // ERROR!
```

### No Manual Table Creation
All database tables are created automatically by Prisma migrations. **Do not create tables manually in Supabase.**

### Hot Reload Safe
The Prisma client singleton in `src/lib/prisma.ts` prevents multiple instances during development hot reloads.

## Troubleshooting

### Migration Errors
If you encounter migration errors, you can reset the database:
```bash
npx prisma migrate reset
```
This will drop all tables and re-run migrations and seeds.

### Connection Issues
- Verify your `DATABASE_URL` is correct in `.env`
- Check that your Supabase project is active
- Ensure your IP is allowed in Supabase, or disable IP restrictions for development
- Go to Supabase → Settings → Database → Connection pooling

### Prisma Client Not Found
If you get "Cannot find module '@prisma/client'", run:
```bash
npx prisma generate
```

### TypeScript Errors in Seed File
If you see errors about missing types (Role, ClaimType, etc.), run:
```bash
npx prisma generate
```
This generates the TypeScript types from your schema.

## Next Steps

1. **Build authentication system** - Use the User model with bcryptjs for password hashing
2. **Create claim submission forms** - For consumers to submit new claims
3. **Build contractor dashboard** - To view and accept available claims
4. **Implement document upload** - Using Supabase Storage or similar
5. **Add claim event tracking** - Throughout the application for audit trails
6. **Create role-based access control** - Based on User.role field

## Registration API Endpoint
Security Features:

✅ Email format validation
✅ Password length validation (minimum 8 characters)
✅ Duplicate email checking
✅ Secure password hashing with bcrypt (10 rounds)
✅ Role validation (CONSUMER, CONTRACTOR, ADMIN)
✅ Development-only logging

## License

MIT


