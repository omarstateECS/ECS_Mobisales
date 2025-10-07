# Plan Routes Feature Documentation

## Overview
The "Plan Routes" feature allows administrators to assign sales representatives to multiple customers, automatically creating visit records for route planning.

## Components Created/Modified

### 1. Frontend Components

#### **PlanRoutesPage.js** (NEW)
Location: `/client/src/components/PlanRoutesPage.js`

**Features:**
- Select a sales representative from available salesmen
- Search and filter customers by name, address, or phone
- Multi-select customers for visit assignment
- Bulk actions: Select All / Clear All
- Real-time feedback with success/error messages
- Beautiful UI with gradient styling matching the app theme

**Key Functions:**
- `fetchSalesmen()` - Loads all available sales representatives
- `fetchCustomers()` - Loads all customers (up to 1000)
- `toggleCustomerSelection()` - Handles individual customer selection
- `handleCreateVisits()` - Calls the bulk create API endpoint

### 2. Backend Services

#### **visitService.js** (MODIFIED)
Location: `/services/visitService.js`

**New Method Added:**
```javascript
async bulkCreateVisits(salesmanId, customerIds)
```

**Features:**
- Validates salesman exists
- Validates all customers exist
- Creates multiple visit records in a single transaction
- Uses `createMany` for efficient bulk insert
- Skips duplicates automatically
- Returns count of created visits

### 3. Backend Controllers

#### **visitController.js** (MODIFIED)
Location: `/controllers/visitController.js`

**New Method Added:**
```javascript
async bulkCreate(req, res)
```

**Features:**
- Validates required fields (salesmanId, customerIds)
- Validates customerIds is a non-empty array
- Handles errors gracefully
- Returns success response with count

### 4. Backend Routes

#### **visit.js** (MODIFIED)
Location: `/routes/visit.js`

**New Route Added:**
```javascript
POST /api/visits/bulk-create
```

**Request Body:**
```json
{
  "salesmanId": 1000007,
  "customerIds": [2, 3, 4, 5, 6]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully created 5 visits",
  "data": {
    "count": 5,
    "salesmanId": 1000007,
    "customerIds": [2, 3, 4, 5, 6]
  }
}
```

### 5. Navigation Integration

#### **App.js** (MODIFIED)
- Added PlanRoutesPage import
- Added 'plan-routes' case in navigation switch
- Integrated with existing routing system

#### **Sidebar.js** (MODIFIED)
- Added MapPin icon import
- Added "Plan Routes" menu item under Salesmen section
- Positioned between "Add New Salesman" and "Salesman Analytics"

#### **components/index.js** (MODIFIED)
- Exported PlanRoutesPage for easier imports

## Database Schema

The feature uses the existing `visits` table with the following structure:

```prisma
model Visit {
  id          Int          @id @default(autoincrement())
  custId      Int
  salesId     Int
  startTime   DateTime?
  endTime     DateTime?
  cancelTime  DateTime?
  status      VisitStatus  @default(WAIT)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  customer    Customer     @relation(fields: [custId], references: [id])
  salesman    Salesman     @relation(fields: [salesId], references: [id])
}

enum VisitStatus {
  WAIT
  START
  END
  CANCEL
}
```

## Usage Flow

1. **Navigate to Plan Routes**
   - Open sidebar → Salesmen → Plan Routes

2. **Select Sales Representative**
   - Click on a salesman card to select them
   - Selected salesman is highlighted in blue

3. **Select Customers**
   - Use search bar to filter customers
   - Click individual customers to select/deselect
   - Use "Select All" to select all filtered customers
   - Use "Clear All" to deselect all customers

4. **Create Visits**
   - Click "Create X Visits" button
   - System validates and creates visit records
   - Success message shows number of visits created
   - Form resets automatically

## API Endpoints

### Bulk Create Visits
**Endpoint:** `POST /api/visits/bulk-create`

**Headers:**
```
Content-Type: application/json
```

**Request:**
```json
{
  "salesmanId": 1000007,
  "customerIds": [2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Successfully created 9 visits",
  "data": {
    "count": 9,
    "salesmanId": 1000007,
    "customerIds": [2, 3, 4, 5, 6, 7, 8, 9, 10]
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "salesmanId is required"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Salesman not found"
}
```

## Features & Benefits

✅ **Efficient Route Planning**
- Assign multiple customers to a salesman in one action
- No need to create visits one by one

✅ **User-Friendly Interface**
- Visual selection with checkmarks
- Search and filter capabilities
- Real-time feedback

✅ **Data Validation**
- Validates salesman exists
- Validates all customers exist
- Prevents duplicate visits

✅ **Performance Optimized**
- Bulk insert using Prisma's `createMany`
- Single database transaction
- Efficient data loading

✅ **Error Handling**
- Graceful error messages
- Non-blocking operations
- User-friendly notifications

## Testing

To test the feature:

1. **Start the backend server:**
   ```bash
   cd /Users/omarstate/Documents/GitHub/ECS_Mobisales
   node index.js
   ```

2. **Start the frontend:**
   ```bash
   cd client
   npm start
   ```

3. **Test the flow:**
   - Navigate to Salesmen → Plan Routes
   - Select a salesman (e.g., Ibrahim Meshref - ID: 1000007)
   - Search for customers
   - Select multiple customers
   - Click "Create X Visits"
   - Verify success message

4. **Verify in database:**
   ```sql
   SELECT * FROM visits WHERE "salesId" = 1000007 ORDER BY "createdAt" DESC;
   ```

## Future Enhancements

Potential improvements for future versions:

1. **Date Selection**
   - Allow scheduling visits for specific dates
   - Calendar view for route planning

2. **Route Optimization**
   - Suggest optimal visit order based on location
   - Integration with Google Maps for route visualization

3. **Visit Templates**
   - Save common route configurations
   - Quick assign from templates

4. **Bulk Edit**
   - Modify multiple visits at once
   - Reassign visits to different salesmen

5. **Analytics**
   - View visit completion rates
   - Track salesman performance by route

## Notes

- All visits are created with status `WAIT` by default
- Start time, end time, and cancel time are initially `null`
- The mobile app will update these fields when the salesman performs the visits
- The `skipDuplicates` option prevents errors if a visit already exists for a customer-salesman pair
