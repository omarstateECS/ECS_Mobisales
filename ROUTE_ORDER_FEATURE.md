# Route Order & Duplicate Prevention Feature

## Overview
Enhanced the Plan Routes feature with:
1. **Visual Route Order Display** - Beautiful UI showing the exact order of visits with animated arrows
2. **Duplicate Prevention** - Prevents creating duplicate pending visits for the same salesman
3. **Order Management** - Drag-and-drop style reordering with up/down buttons

## Database Changes

### Schema Updates
Added `order` field to the Visit model:

```prisma
model Visit {
  id         Int         @id @default(autoincrement())
  custId     Int
  salesId    Int
  order      Int         @default(0)  // NEW: Visit order in route
  startTime  DateTime?
  endTime    DateTime?
  cancelTime DateTime?
  status     VisitStatus @default(WAIT)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  customer   Customer    @relation(fields: [custId], references: [id])
  salesman   Salesman    @relation(fields: [salesId], references: [id])

  @@index([salesId, order])  // NEW: Index for efficient ordering
  @@map("visits")
}
```

### Migration
Run the migration:
```bash
cd /Users/omarstate/Documents/GitHub/ECS_Mobisales
npx prisma migrate dev
```

Or apply manually:
```sql
ALTER TABLE "visits" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "visits_salesId_order_idx" ON "visits"("salesId", "order");
```

## Backend Changes

### visitService.js - bulkCreateVisits()

**Duplicate Prevention Logic:**
```javascript
// Check for existing visits with status WAIT for this salesman
const existingVisits = await prisma.visit.findMany({
    where: {
        salesId: parseInt(salesmanId),
        custId: {
            in: customerIds.map(id => parseInt(id))
        },
        status: 'WAIT'
    }
});

const existingCustomerIds = existingVisits.map(v => v.custId);
const newCustomerIds = customerIds.filter(id => !existingCustomerIds.includes(parseInt(id)));

if (newCustomerIds.length === 0) {
    throw new Error('All selected customers already have pending visits for this salesman');
}
```

**Order Assignment:**
```javascript
// Create visits with order based on selection sequence
const visitData = newCustomerIds.map((custId, index) => ({
    custId: parseInt(custId),
    salesId: parseInt(salesmanId),
    order: index + 1, // Order starts from 1
    status: 'WAIT',
    startTime: null,
    endTime: null,
    cancelTime: null
}));
```

**Enhanced Response:**
```javascript
return {
    count: result.count,
    salesmanId: parseInt(salesmanId),
    customerIds: newCustomerIds.map(id => parseInt(id)),
    skipped: existingCustomerIds.length,
    skippedCustomerIds: existingCustomerIds
};
```

## Frontend Changes

### PlanRoutesPage.js

#### New State Management
```javascript
const [selectedCustomers, setSelectedCustomers] = useState([]); // Array maintains order
```

#### Order Management Functions

**Toggle Selection (Maintains Order):**
```javascript
const toggleCustomerSelection = (customerId) => {
  setSelectedCustomers(prev => {
    if (prev.includes(customerId)) {
      return prev.filter(id => id !== customerId);
    } else {
      return [...prev, customerId]; // Add to end
    }
  });
};
```

**Move Up/Down:**
```javascript
const moveCustomerUp = (index) => {
  if (index === 0) return;
  setSelectedCustomers(prev => {
    const newOrder = [...prev];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    return newOrder;
  });
};

const moveCustomerDown = (index) => {
  if (index === selectedCustomers.length - 1) return;
  setSelectedCustomers(prev => {
    const newOrder = [...prev];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    return newOrder;
  });
};
```

**Remove from Route:**
```javascript
const removeCustomerFromRoute = (customerId) => {
  setSelectedCustomers(prev => prev.filter(id => id !== customerId));
};
```

### Visual Route Order Component

**Features:**
- 🎯 **Numbered stops** with gradient badges (1, 2, 3...)
- ⬇️ **Animated arrows** between stops (bouncing animation)
- ↕️ **Reorder buttons** (appear on hover)
- 🗑️ **Remove button** for each stop
- 📊 **Route summary** with estimated time
- 🎨 **Beautiful gradient background** (purple to blue)

**Component Structure:**
```jsx
{selectedCustomers.length > 0 && (
  <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 ...">
    <h3>Route Order ({selectedCustomers.length} stops)</h3>
    
    {selectedCustomers.map((customerId, index) => (
      <div key={customerId}>
        {/* Stop Card with Number Badge */}
        <div className="flex items-center space-x-4 ...">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
            {index + 1}
          </div>
          
          {/* Customer Info */}
          <div className="flex-1">
            <p>{customer.name}</p>
            <p>{customer.address}</p>
          </div>
          
          {/* Reorder Buttons (hover to show) */}
          <div className="opacity-0 group-hover:opacity-100">
            <button onClick={() => moveCustomerUp(index)}>↑</button>
            <button onClick={() => moveCustomerDown(index)}>↓</button>
          </div>
          
          {/* Remove Button */}
          <button onClick={() => removeCustomerFromRoute(customerId)}>
            <Trash2 />
          </button>
        </div>
        
        {/* Animated Arrow */}
        {index < selectedCustomers.length - 1 && (
          <ArrowDown className="animate-bounce" />
        )}
      </div>
    ))}
    
    {/* Route Summary */}
    <div className="mt-4 p-4 ...">
      <p>Estimated Time: ~{selectedCustomers.length * 30} minutes</p>
    </div>
  </div>
)}
```

## User Experience

### How It Works

1. **Select Customers in Order:**
   - Click customers in the order you want them visited
   - Each click adds the customer to the end of the route

2. **View Route Order:**
   - Route visualization appears automatically
   - Shows numbered stops (1, 2, 3...)
   - Animated arrows show the flow

3. **Reorder Stops:**
   - Hover over a stop to see reorder buttons
   - Click ↑ to move up, ↓ to move down
   - Order updates instantly

4. **Remove Stops:**
   - Click the trash icon to remove a stop
   - Remaining stops maintain their relative order

5. **Create Visits:**
   - Click "Create X Visits" button
   - System creates visits with the specified order
   - Duplicates are automatically skipped

### Duplicate Prevention

**Scenario 1: All New Visits**
```
Selected: 5 customers
Result: "Successfully created 5 visits"
```

**Scenario 2: Some Duplicates**
```
Selected: 5 customers (2 already have pending visits)
Result: "Successfully created 3 visits (2 duplicates skipped)"
```

**Scenario 3: All Duplicates**
```
Selected: 5 customers (all have pending visits)
Result: Error - "All selected customers already have pending visits for this salesman"
```

## API Response Example

```json
{
  "success": true,
  "message": "Successfully created 3 visits",
  "data": {
    "count": 3,
    "salesmanId": 1000007,
    "customerIds": [5, 8, 12],
    "skipped": 2,
    "skippedCustomerIds": [3, 7]
  }
}
```

## Mobile App Integration

The mobile app will receive visits with the `order` field and can:
1. Display visits sorted by order
2. Navigate through visits in sequence
3. Show progress (e.g., "Stop 2 of 5")
4. Optimize navigation based on order

**Query visits by order:**
```javascript
const visits = await prisma.visit.findMany({
  where: {
    salesId: salesmanId,
    status: 'WAIT'
  },
  orderBy: {
    order: 'asc'
  },
  include: {
    customer: true
  }
});
```

## Visual Design

### Color Scheme
- **Route Container**: Purple-blue gradient background
- **Stop Numbers**: Purple-to-blue gradient badges
- **Arrows**: Purple with bounce animation
- **Hover Effects**: Border changes to purple
- **Remove Button**: Red accent

### Animations
- **Arrows**: Bounce animation (Tailwind's `animate-bounce`)
- **Hover**: Smooth opacity transitions
- **Reorder**: Instant visual feedback

### Responsive Design
- Works on all screen sizes
- Touch-friendly buttons
- Scrollable route list

## Testing

### Test Scenario 1: Create New Route
1. Select salesman "Ibrahim Meshref"
2. Click customers in order: Customer A → B → C
3. Verify route shows: 1→A, 2→B, 3→C with arrows
4. Click "Create 3 Visits"
5. Verify success message

### Test Scenario 2: Reorder Route
1. Create route: A → B → C
2. Hover over B, click ↑
3. Verify new order: B → A → C
4. Create visits
5. Verify database has correct order

### Test Scenario 3: Duplicate Prevention
1. Create visits for customers A, B, C
2. Try to create visits for A, B, D
3. Verify message: "Created 1 visit (2 duplicates skipped)"
4. Only D should be created

### Test Scenario 4: Remove from Route
1. Create route: A → B → C → D
2. Click remove on B
3. Verify new route: A → C → D (numbers update: 1, 2, 3)

## Benefits

✅ **Visual Clarity** - See exact route order before creating
✅ **No Duplicates** - Prevents wasted visits
✅ **Easy Reordering** - Drag-and-drop style interface
✅ **Mobile Ready** - Order field ready for mobile app
✅ **Beautiful UI** - Modern, gradient design
✅ **Instant Feedback** - Real-time updates
✅ **Error Prevention** - Clear messages about duplicates

## Future Enhancements

1. **Drag-and-Drop**: Full drag-and-drop reordering
2. **Map View**: Show route on Google Maps
3. **Route Optimization**: Auto-optimize based on distance
4. **Time Slots**: Assign specific time windows
5. **Route Templates**: Save common routes
6. **Distance Calculation**: Show actual distances between stops
