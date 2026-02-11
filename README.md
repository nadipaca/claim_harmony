# ClaimHarmony - Insurance Claims Management Platform

A complete MVP web application for managing insurance claims across multiple user roles, built for the ClaimHarmony Build Test specification.

## 🎯 Project Overview

ClaimHarmony is a role-based claims management system that connects consumers, contractors, and administrators in a streamlined workflow for handling property insurance claims. The platform includes RBAC (Role-Based Access Control), audit trails, document management, and direct integration with insurance company portals.

## ✅ Build Spec Completion Status

All requirements from the ClaimHarmony Paid Build Test Spec have been implemented:

### Core Features Implemented
- ✅ **RBAC System**: Complete role-based access control for Consumer, Contractor, and Admin roles
- ✅ **Consumer Flow**: Create claims, view claim list, view claim details
- ✅ **Contractor Flow**: View available claims, accept claims, track accepted jobs
- ✅ **Admin Flow**: View all claims, see status and assignments
- ✅ **Timeline/Audit Events**: Activity timeline on claim details showing all events
- ✅ **Document Upload**: Full file upload system with Supabase Storage integration
- ✅ **Insurance Portal Linking**: Config-based portal routing for all three insurers
- ✅ **Data Model**: Extensible schema with insurance_companies table and FK relationships
- ✅ **Responsive Design**: Mobile-first responsive UI across all pages

## 🛠️ Tech Stack

- **Frontend**: Next.js 16.1.6 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 + Custom CSS Design System
- **Database**: Supabase Postgres
- **ORM**: Prisma
- **Authentication**: NextAuth.js with Credentials Provider
- **File Storage**: Supabase Storage
- **Password Hashing**: bcryptjs (10 rounds)

## 📋 Prerequisites

- Node.js 20+ installed
- A Supabase account and project
- npm or yarn package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Storage (for file uploads)
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"
SUPABASE_SERVICE_KEY="your-supabase-service-role-key-here"
```

**To get your Supabase credentials:**

1. Go to https://supabase.com/dashboard
2. Navigate to **Settings** → **Database** for `DATABASE_URL`
3. Navigate to **Settings** → **API** for Supabase keys
4. Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

### 3. Setup Supabase Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Create a new bucket named: `claim-documents`
3. Set bucket to **Public** (or configure RLS policies as needed)

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This creates all tables automatically:
- User (with roles: CONSUMER, CONTRACTOR, ADMIN)
- InsuranceCompany (with portal URLs)
- Claim (with status tracking)
- ClaimEvent (audit trail)
- ClaimDocument (file metadata)

### 5. Seed Test Data

```bash
npx prisma db seed
```

This creates:

**3 Insurance Companies** (with exact portal URLs from spec):
- **Citizens Property Insurance** → https://www.citizensfla.com/mypolicy
- **Universal Property & Casualty** → https://claimpath.universalproperty.com/
- **State Farm** → https://www.statefarm.com/claims

**3 Test Users**:
| Email | Password | Role |
|-------|----------|------|
| consumer@test.com | Password123! | CONSUMER |
| contractor@test.com | Password123! | CONTRACTOR |
| admin@test.com | Password123! | ADMIN |

**2 Sample Claims**:
- **CLM-000001** (NEW status) - Roof damage at 123 Main St, Miami, FL
- **CLM-000002** (ACCEPTED status) - Water damage at 456 Oak Ave, Tampa, FL

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication & RBAC

The application uses NextAuth.js with a custom Credentials Provider for authentication. All routes are protected by role-based middleware.

### Role Access Control

**Consumer** (`consumer@test.com`):
- ✅ Create new claims
- ✅ View their own claims list
- ✅ View claim details
- ✅ Upload documents to their claims
- ❌ Cannot see other consumers' claims
- ❌ Cannot accept claims
- ❌ Cannot access admin views

**Contractor** (`contractor@test.com`):
- ✅ View all available claims (status: NEW)
- ✅ Accept claims (status changes to ACCEPTED)
- ✅ View their active jobs (accepted claims)
- ✅ Upload documents to accepted claims
- ❌ Cannot create new claims
- ❌ Cannot see all claims (admin-only)

**Admin** (`admin@test.com`):
- ✅ View all claims across all consumers
- ✅ See claim status and contractor assignments
- ✅ View full audit trail
- ✅ Access system-wide statistics
- ❌ Cannot create claims (consumer-only)
- ❌ Cannot accept claims (contractor-only)

### RBAC Implementation

Role checks are enforced at multiple levels:

1. **Server-Side Pages**: Using `requireRole()` helper in page components
2. **API Routes**: Middleware validates session and role before processing
3. **Navigation**: Role-specific nav items in ShellFrame component
4. **Database Queries**: Scoped by user ID and role (e.g., consumers only see their claims)

## 🏗️ Core Workflows

### Consumer Flow

1. **Login** at `/login` with consumer credentials
2. **Dashboard** shows priority active claims (most recent 3)
3. **Create Claim** via "New Claim" button:
   - Property address (text input)
   - Claim type (dropdown: Roof / Water / Fire / Mold / Other)
   - Description (textarea)
   - Insurance Company (dropdown: Citizens / Universal / State Farm)
4. **View Claims** - See all personal claims with status indicators
5. **Claim Detail** - Shows:
   - Claim information
   - Selected insurance company with "Open Insurance Claims Portal" button
   - Activity timeline (audit events)
   - Document upload (if status allows)
   - Assigned contractor (if accepted)

### Contractor Flow

1. **Login** at `/login` with contractor credentials
2. **Job Board** with two tabs:
   - **Available** - Shows all NEW claims (not yet accepted)
   - **My Active Jobs** - Shows claims accepted by this contractor
3. **View Claim Detail** - Click "View & Accept" on available claims
4. **Accept Claim** - Click "Accept Claim" button:
   - Status changes from NEW → ACCEPTED
   - Claim moves to "My Active Jobs" tab
   - Consumer sees contractor assignment
   - Timeline event recorded
5. **Upload Documents** - Add inspection photos, estimates, etc.

### Admin Flow

1. **Login** at `/login` with admin credentials
2. **All Claims Dashboard** shows:
   - Total claims count
   - Claims by status (NEW / ACCEPTED)
   - Paginated claims history table
3. **View Any Claim** - Full details including:
   - Consumer information
   - Contractor assignment (if accepted)
   - Complete audit trail
   - All uploaded documents

## 📊 Timeline / Audit Events

Every claim detail page displays an **Activity Timeline** showing chronological events:

### Event Types
- **CLAIM_CREATED** - When consumer submits claim
- **CONTRACTOR_ACCEPTED** - When contractor accepts claim
- **DOCUMENT_UPLOADED** - When file is uploaded

### Event Data
Each event includes:
- Event type (with descriptive label)
- Timestamp (formatted as "X hours/days ago")
- Actor role (CONSUMER / CONTRACTOR / ADMIN)
- Optional metadata (stored as JSON)

Events are displayed in reverse chronological order (newest first) with color-coded indicators.

## 📄 Document Management

### Upload System
- Users can upload files to claims (role-dependent access)
- Files stored in Supabase Storage bucket: `claim-documents`
- Metadata tracked in `ClaimDocument` table

### Document Metadata Stored
- Filename (original name)
- Document type (inspection, estimate, photo, invoice, etc.)
- Storage URL (Supabase bucket path)
- Uploaded by (user ID and role)
- Upload timestamp

### File Size & Type Validation
- Maximum file size: 5MB
- Allowed types: PDF, images (JPG, PNG), documents (DOC, DOCX)
- Client-side and server-side validation

### Access Control
- Consumers: Upload to their own claims
- Contractors: Upload to accepted claims only
- Admins: View all documents (read-only in current implementation)

## 🔗 Insurance Company Portal Linking

The system includes **config-based portal routing** for easy extensibility.

### Implementation

**Data Model**: `InsuranceCompany` table with:
- `id` (primary key)
- `key` (unique identifier: "citizens", "universal", "statefarm")
- `name` (display name)
- `claimsPortalUrl` (exact URL from spec)

**Claim Storage**: Each `Claim` has `insuranceCompanyId` (foreign key)

**Portal URLs** (exact as specified):
```javascript
{
  citizens: "https://www.citizensfla.com/mypolicy",
  universal: "https://claimpath.universalproperty.com/",
  statefarm: "https://www.statefarm.com/claims"
}
```

### User Experience

On the Claim Detail page:
1. Selected insurer name is displayed prominently
2. "Open Insurance Claims Portal" button with external link icon
3. Opens in new tab (`target="_blank"`)
4. Direct navigation to correct carrier portal

### Adding New Insurers

To add new insurance companies:

1. Add to database via Prisma Studio or seed script:
```typescript
await prisma.insuranceCompany.create({
  data: {
    key: "allstate",
    name: "Allstate Insurance",
    claimsPortalUrl: "https://www.allstate.com/claims"
  }
})
```

2. Company automatically appears in claim creation dropdown
3. Portal link auto-routes based on `claimsPortalUrl`

## 📐 Database Schema

### User
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  role         Role     @default(CONSUMER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### InsuranceCompany
```prisma
model InsuranceCompany {
  id               String   @id @default(cuid())
  key              String   @unique
  name             String
  claimsPortalUrl  String
  createdAt        DateTime @default(now())
}
```

### Claim
```prisma
model Claim {
  id                      String            @id @default(cuid())
  claimNumber             String            @unique
  address                 String
  type                    ClaimType
  description             String
  status                  ClaimStatus       @default(NEW)
  consumerId              String
  insuranceCompanyId      String
  acceptedByContractorId  String?
  createdAt               DateTime          @default(now())
  updatedAt               DateTime          @updatedAt
}
```

### ClaimEvent (Audit Trail)
```prisma
model ClaimEvent {
  id          String          @id @default(cuid())
  claimId     String
  eventType   ClaimEventType
  actorRole   Role
  actorUserId String?
  createdAt   DateTime        @default(now())
  meta        Json?
}
```

### ClaimDocument
```prisma
model ClaimDocument {
  id               String   @id @default(cuid())
  claimId          String
  filename         String
  docType          String?
  storageUrl       String?
  uploadedByUserId String
  uploadedAt       DateTime @default(now())
}
```

### Enums
```prisma
enum Role {
  CONSUMER
  CONTRACTOR
  ADMIN
}

enum ClaimType {
  ROOF
  WATER
  FIRE
  MOLD
  OTHER
}

enum ClaimStatus {
  NEW
  ACCEPTED
}

enum ClaimEventType {
  CLAIM_CREATED
  CONTRACTOR_ACCEPTED
  DOCUMENT_UPLOADED
}
```

## 🎨 UI/UX Design

### Design System: "Transparent Guardian"

**Core Brand Colors**:
- Gold (`#D4AF37`) - Logo, badges, status indicators only
- Navy (`#1E3A8A`) - Primary CTAs and actions
- Slate (`#0F172A`) - Typography

**Functional**:
- Ice Flow (`#F8FAFC`) - App background
- White (`#FFFFFF`) - Cards and surfaces
- Soft Fog (`#E2E8F0`) - Borders and dividers

### Responsive Breakpoints
- **Desktop**: > 1024px (full layout)
- **Tablet**: 768px - 1024px (responsive grid)
- **Mobile**: < 768px (stacked layout, hamburger menu)

### Mobile Features
- Collapsible top navigation bar (replaces sidebar on mobile)
- Hamburger menu with smooth transitions
- Center-aligned claim cards
- Touch-friendly button sizes
- Optimized font sizes and spacing

## 📂 Project Structure

```
claim_harmony/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, signup, signout)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── signout/page.tsx
│   ├── admin/                    # Admin role routes
│   │   ├── layout.tsx            # Admin navigation
│   │   └── claims/
│   │       ├── page.tsx          # All claims dashboard
│   │       └── [claimNumber]/page.tsx
│   ├── consumer/                 # Consumer role routes
│   │   ├── layout.tsx            # Consumer navigation
│   │   └── claims/
│   │       ├── page.tsx          # Consumer dashboard
│   │       ├── new/              # New claim form
│   │       └── [claimNumber]/page.tsx
│   ├── contractor/               # Contractor role routes
│   │   ├── layout.tsx            # Contractor navigation
│   │   └── claims/
│   │       ├── page.tsx          # Job board (available + active)
│   │       └── [claimNumber]/page.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth + registration
│   │   ├── claims/               # Claim operations
│   │   └── upload/               # File upload endpoint
│   ├── globals.css               # Design system + responsive classes
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home (redirects based on role)
├── prisma/
│   ├── schema.prisma             # Complete database schema
│   ├── seed.ts                   # Seed script
│   └── migrations/               # Migration history
├── src/
│   ├── components/               # Reusable React components
│   │   ├── shell/                # Navigation shell
│   │   │   └── ShellFrame.tsx    # Responsive sidebar/mobile nav
│   │   ├── claim/                # Claim-related components
│   │   │   ├── ClaimDetailView.tsx
│   │   │   └── ClaimTimeline.tsx
│   │   └── claims/               # Claims list components
│   │       └── ClaimsHistoryTable.tsx
│   └── lib/                      # Utility libraries
│       ├── auth.ts               # NextAuth configuration
│       ├── prisma.ts             # Prisma client singleton
│       ├── rbac.ts               # Role-based access helpers
│       └── supabase.ts           # Supabase storage client
├── public/                       # Static assets
│   ├── logo.svg
│   └── home.svg
├── .env                          # Environment variables (not in git)
├── .env.example                  # Template for env vars
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🧪 Testing the Application

### End-to-End Workflow Test

1. **Consumer Creates Claim**:
   - Login as `consumer@test.com` / `Password123!`
   - Click "New Claim" button
   - Fill form: Address, Type (Roof), Description, Insurer (Citizens)
   - Submit claim
   - Verify claim appears in dashboard with status "NEW"
   - Open claim detail, verify "Open Insurance Claims Portal" button works

2. **Contractor Accepts Claim**:
   - Logout, login as `contractor@test.com` / `Password123!`
   - Go to "Job Board" → "Available" tab
   - See newly created claim
   - Click "View & Accept"
   - Click "Accept Claim" button
   - Verify status changes to "ACCEPTED"
   - Check "My Active Jobs" tab - claim should appear there

3. **Consumer Sees Assignment**:
   - Logout, login as `consumer@test.com` / `Password123!`
   - View claim detail
   - Verify contractor assignment is shown
   - Check timeline - should show "Contractor accepted" event

4. **Admin Views Everything**:
   - Logout, login as `admin@test.com` / `Password123!`
   - See all claims in dashboard
   - View statistics (Total, NEW, ACCEPTED counts)
   - Open any claim, see full details and timeline

5. **Document Upload**:
   - As consumer or contractor (on accepted claim)
   - Click "Upload Document" section
   - Select file (max 5MB, PDF/image)
   - Upload completes
   - Verify document appears in list with filename and timestamp
   - Check timeline - "Document uploaded" event created

6. **Insurance Portal Links**:
   - Open any claim detail
   - Verify insurance company name is displayed
   - Click "Open Insurance Claims Portal"
   - New tab opens with correct portal URL:
     - Citizens → citizensfla.com/mypolicy
     - Universal → claimpath.universalproperty.com
     - State Farm → statefarm.com/claims

## 📝 Prisma Commands Reference

### Generate Prisma Client
```bash
npx prisma generate
```

### Create Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Apply Migrations (Production)
```bash
npx prisma migrate deploy
```

### Seed Database
```bash
npx prisma db seed
```

### Reset Database (⚠️ Drops all data)
```bash
npx prisma migrate reset
```

### Open Prisma Studio (Database GUI)
```bash
npx prisma studio
```
Opens at http://localhost:5555

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Migration Errors
```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

### File Upload 500 Error
Check that these env vars are set in Vercel/production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

Verify Supabase storage bucket `claim-documents` exists and is public.

### Build Errors (Vercel)
Ensure `postinstall` script runs Prisma:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Auth Errors
Generate a new `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

Set `NEXTAUTH_URL` correctly:
- Local: `http://localhost:3000`
- Production: `https://your-domain.vercel.app`

## 🔒 Security Considerations

### Implemented Security Features

✅ **Password Security**:
- bcryptjs with 10 salt rounds
- Minimum 8 characters enforced
- Never stored in plain text

✅ **Session Management**:
- JWT-based sessions with NextAuth
- Secure HTTP-only cookies
- CSRF protection

✅ **Role-Based Access**:
- Server-side role checks on all protected routes
- API middleware validates roles before operations
- Database queries scoped by user and role

✅ **Input Validation**:
- Email format validation
- Duplicate email prevention
- Role enum validation
- File type and size validation

✅ **SQL Injection Prevention**:
- Prisma ORM parameterized queries
- No raw SQL queries

### Production Recommendations

⚠️ **For production deployment**:
- Enable Supabase RLS (Row Level Security) policies
- Set up proper CORS policies
- Use environment-specific secrets
- Enable rate limiting on API routes
- Add input sanitization for user content
- Implement proper error logging (Sentry, etc.)
- Set up monitoring and alerts

## 📊 Acceptance Criteria Checklist

Based on ClaimHarmony Build Test Spec:

- ✅ **Log in as Consumer / Contractor / Admin** - All three roles working
- ✅ **Consumer creates a claim and views it** - Full CRUD implemented
- ✅ **Consumer selects an insurer; claim shows insurer on detail** - FK relationship working
- ✅ **"Open Insurance Claims Portal" opens correct portal in new tab** - Config-based routing
- ✅ **Contractor accepts a claim** - Status updates, events logged
- ✅ **Admin sees all claims + acceptance** - Dashboard with full visibility
- ✅ **Timeline renders events in order** - Chronological audit trail
- ✅ **Code is organized/readable; basic error handling exists** - Clean structure, try/catch blocks
- ✅ **RBAC implementation** - Server-side role enforcement
- ✅ **Data model choices** - Extensible schema with proper relations
- ✅ **Document uploads** - Full Supabase Storage integration
- ✅ **Responsive design** - Mobile-first responsive UI

## 📦 Deployment

### Vercel Deployment

1. **Push to GitHub**:
```bash
git remote add origin https://github.com/yourusername/claim_harmony.git
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Import GitHub repository
   - Vercel auto-detects Next.js

3. **Set Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

4. **Deploy**:
   - Vercel runs `npm run build` automatically
   - Prisma client generated via `postinstall` script
   - Navigate to your production URL

5. **Run Migrations** (one-time):
```bash
npx prisma migrate deploy
```

6. **Seed Production Data** (one-time):
```bash
npx prisma db seed
```

## 📹 Walkthrough Video

A comprehensive walkthrough video demonstrating all features is available at:
[Link to video walkthrough]

**Video Contents** (5-10 minutes):
1. Project overview and tech stack
2. Login and RBAC demonstration
3. Consumer flow: creating and viewing claims
4. Insurance portal link demonstration
5. Contractor flow: viewing and accepting claims
6. Admin dashboard and statistics
7. Timeline/audit events
8. Document upload functionality
9. Code structure overview
10. Database schema explanation

## 📄 License

MIT

---

**Built with ❤️ for ClaimHarmony Build Test Spec**

For questions or issues, please contact the development team.
