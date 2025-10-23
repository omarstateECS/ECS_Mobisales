# Database Seed Scripts

This directory contains seed scripts to populate the database with initial data.

## Regions Seed

The `regions.js` script populates the `regions` table with Cairo, Egypt districts.

### Included Regions

The script includes **30 major Cairo districts**:

1. Nasr City
2. 6th of October
3. Maadi
4. Heliopolis
5. Zamalek
6. Downtown Cairo
7. Garden City
8. Fifth Settlement
9. New Cairo
10. Helwan
11. Shubra
12. Abbassia
13. Dokki
14. Mohandessin
15. Giza
16. Agouza
17. Ain Shams
18. Al Rehab
19. Boulaq
20. Islamic Cairo
21. Old Cairo
22. Coptic Cairo
23. El Manial
24. El Marg
25. El Matareya
26. Zeitoun
27. Roda Island
28. Gezira
29. Fustat
30. Bab al-Louq

### How to Run

1. **First, run the Prisma migration** (if you haven't already):
   ```bash
   npx prisma migrate dev --name add_regions_table
   npx prisma generate
   ```

2. **Run the seed script**:
   ```bash
   node prisma/seeds/regions.js
   ```

### Features

- ✅ **Prevents duplicates** - Won't create regions if they already exist
- ✅ **Timestamps** - Automatically adds `createdAt` and `updatedAt`
- ✅ **Standardized format** - Country: `EG`, City: `Cairo`
- ✅ **Console output** - Shows all created regions with IDs

### Output Example

```
🌍 Starting to seed Cairo regions...
✅ Successfully created 30 Cairo regions!

📍 Created Regions:
   1. Nasr City (Cairo, EG)
   2. 6th of October (Cairo, EG)
   3. Maadi (Cairo, EG)
   ...
   30. Bab al-Louq (Cairo, EG)

🎉 Region seeding completed!
```

### Adding More Regions

To add more regions (other cities or countries), edit the `cairoRegions` array in `regions.js`:

```javascript
const cairoRegions = [
    { country: 'EG', city: 'Cairo', region: 'Your New Region' },
    // Add more regions here
];
```

### Clearing Regions

To re-seed regions, first delete existing ones:

```sql
DELETE FROM regions;
```

Then run the seed script again.
