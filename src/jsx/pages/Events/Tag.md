# Minexx Tag Management System - Frontend Integration Guide

## Overview

The Tag Management System tracks how Minexx-issued tags are used across three stages of the mineral supply chain:

1. **Mine Tags** - Production tracking at mine level (Bags table)
2. **Processing Tags** - Blending at comptoir/processing center level (Proc Bags table)
3. **Export Tags** - Final export stage (Drum table)

---

## API Endpoints

### 1. Get Tag KPI Cards
Returns tag usage counts for today, this week, and this month.

**Endpoint:** `GET /tag/kpis`

**Query Parameters:**
- `country` (optional) - Filter by company country (e.g., "DRC", "Rwanda", "Togo")

**Headers:**
- `x-platform` (optional) - Platform identifier ("3ts" or "gold", defaults to "3ts")

**Response:**
```json
{
  "success": true,
  "kpis": {
    "tagsUsedToday": 45,
    "tagsUsedThisWeek": 287,
    "tagsUsedThisMonth": 1203
  }
}
```

**Usage:**
```javascript
// Fetch KPI cards
const fetchKPIs = async (country = null) => {
  const params = new URLSearchParams();
  if (country) params.append('country', country);
  
  const response = await fetch(`/tag/kpis?${params}`, {
    headers: {
      'x-platform': '3ts'
    }
  });
  return response.json();
};
```

---

### 2. Get Company Breakdown
Returns detailed tag usage breakdown by company for a specific time period.

**Endpoint:** `GET /tag/breakdown`

**Query Parameters:**
- `timePeriod` (required) - One of: "today", "week", "month"
- `country` (optional) - Filter by company country

**Headers:**
- `x-platform` (optional) - Platform identifier

**Response:**
```json
{
  "success": true,
  "timePeriod": "today",
  "country": "DRC",
  "companies": [
    {
      "Company Name": "Mining Co A",
      "Company Country": "DRC",
      "Tags at Mine": 10,
      "Tags at Comptoir": 5,
      "Tags Exported": 2,
      "Tags Used (Total)": 17
    },
    {
      "Company Name": "Mining Co B",
      "Company Country": "DRC",
      "Tags at Mine": 15,
      "Tags at Comptoir": 8,
      "Tags Exported": 3,
      "Tags Used (Total)": 26
    }
  ]
}
```

**Usage:**
```javascript
// Fetch company breakdown
const fetchCompanyBreakdown = async (timePeriod, country = null) => {
  const params = new URLSearchParams({
    timePeriod: timePeriod
  });
  if (country) params.append('country', country);
  
  const response = await fetch(`/tag/breakdown?${params}`, {
    headers: {
      'x-platform': '3ts'
    }
  });
  return response.json();
};
```

---

### 3. Get Complete Dashboard Data
Returns comprehensive tag data with KPIs and all company breakdowns for all time periods.

**Endpoint:** `GET /tag/dashboard`

**Query Parameters:**
- `country` (optional) - Filter by company country

**Headers:**
- `x-platform` (optional) - Platform identifier

**Response:**
```json
{
  "success": true,
  "kpis": {
    "today": {
      "total": 45,
      "byStage": {
        "mine": 20,
        "processing": 15,
        "export": 10
      }
    },
    "week": {
      "total": 287,
      "byStage": {
        "mine": 120,
        "processing": 100,
        "export": 67
      }
    },
    "month": {
      "total": 1203,
      "byStage": {
        "mine": 550,
        "processing": 400,
        "export": 253
      }
    }
  },
  "breakdown": {
    "today": [
      {
        "Company Name": "Mining Co A",
        "Company Country": "DRC",
        "Tags at Mine": 8,
        "Tags at Comptoir": 4,
        "Tags Exported": 2,
        "Tags Used (Total)": 14
      }
    ],
    "week": [...],
    "month": [...]
  },
  "country": "All"
}
```

**Usage:**
```javascript
// Fetch complete dashboard
const fetchDashboard = async (country = null) => {
  const params = new URLSearchParams();
  if (country) params.append('country', country);
  
  const response = await fetch(`/tag/dashboard?${params}`, {
    headers: {
      'x-platform': '3ts'
    }
  });
  return response.json();
};
```

---

## Frontend Implementation Examples

### React Hook Example

```jsx
import { useState, useEffect } from 'react';

const TagDashboard = ({ selectedCountry }) => {
  const [kpis, setKpis] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboard = await fetch(`/tag/dashboard${selectedCountry ? `?country=${selectedCountry}` : ''}`, {
          headers: { 'x-platform': '3ts' }
        }).then(r => r.json());
        
        setKpis(dashboard.kpis);
        setBreakdown(dashboard.breakdown);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCountry]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="tag-dashboard">
      {/* KPI Cards */}
      <div className="kpi-cards">
        <Card title="Tags Used Today" count={kpis.today.total} />
        <Card title="Tags Used This Week" count={kpis.week.total} />
        <Card title="Tags Used This Month" count={kpis.month.total} />
      </div>

      {/* Company Breakdown Table */}
      <div className="breakdown-table">
        <CompanyTable data={breakdown.today} />
      </div>
    </div>
  );
};

export default TagDashboard;
```

### KPI Card Component

```jsx
const KPICard = ({ title, count, timePeriod, onCardClick, country }) => {
  return (
    <div 
      className="kpi-card"
      onClick={() => onCardClick(timePeriod, country)}
      style={{ cursor: 'pointer' }}
    >
      <h3>{title}</h3>
      <p className="count">{count}</p>
      <span className="unit">tags</span>
    </div>
  );
};
```

### Company Breakdown Table Component

```jsx
const CompanyBreakdownTable = ({ data, timePeriod, country }) => {
  return (
    <div className="breakdown-section">
      <h2>Company Breakdown - {timePeriod}</h2>
      {country && <p className="filter-info">Filtered by: {country}</p>}
      
      <table className="breakdown-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Company Country</th>
            <th>Tags at Mine</th>
            <th>Tags at Comptoir</th>
            <th>Tags Exported</th>
            <th>Tags Used (Total)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((company, idx) => (
            <tr key={idx}>
              <td>{company['Company Name']}</td>
              <td>{company['Company Country']}</td>
              <td>{company['Tags at Mine']}</td>
              <td>{company['Tags at Comptoir']}</td>
              <td>{company['Tags Exported']}</td>
              <td className="total">{company['Tags Used (Total)']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Full Dashboard with Drill-Down

```jsx
import React, { useState, useEffect } from 'react';

const FullTagDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [breakdownData, setBreakdownData] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);

  // Load initial dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCountry) params.append('country', selectedCountry);
        
        const response = await fetch(`/tag/dashboard?${params}`, {
          headers: { 'x-platform': '3ts' }
        });
        const data = await response.json();
        setDashboardData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setLoading(false);
      }
    };

    loadDashboard();
  }, [selectedCountry]);

  // Handle KPI card click - load breakdown data
  const handleKPIClick = async (timePeriod) => {
    try {
      const params = new URLSearchParams({ timePeriod });
      if (selectedCountry) params.append('country', selectedCountry);
      
      const response = await fetch(`/tag/breakdown?${params}`, {
        headers: { 'x-platform': '3ts' }
      });
      const data = await response.json();
      setBreakdownData(data);
      setSelectedPeriod(timePeriod);
      setShowBreakdown(true);
    } catch (err) {
      console.error('Error loading breakdown:', err);
    }
  };

  if (loading) return <div className="loading">Loading tag dashboard...</div>;
  if (!dashboardData) return <div className="error">Failed to load dashboard</div>;

  const { kpis, breakdown, country } = dashboardData;

  return (
    <div className="tag-dashboard-container">
      <h1>Minexx Tag Tracking Dashboard</h1>

      {/* Country Filter */}
      <div className="filter-section">
        <label htmlFor="country-select">Filter by Country:</label>
        <select 
          id="country-select"
          value={selectedCountry || ''}
          onChange={(e) => setSelectedCountry(e.target.value || null)}
        >
          <option value="">All Countries</option>
          <option value="DRC">DRC</option>
          <option value="Rwanda">Rwanda</option>
          <option value="Togo">Togo</option>
          <option value="Libya">Libya</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-section">
        <h2>Quick Summary</h2>
        <div className="kpi-grid">
          <div 
            className="kpi-card clickable"
            onClick={() => handleKPIClick('today')}
          >
            <h3>Tags Used Today</h3>
            <p className="kpi-number">{kpis.today.total}</p>
            <div className="kpi-breakdown">
              <span>Mine: {kpis.today.byStage.mine}</span>
              <span>Comptoir: {kpis.today.byStage.processing}</span>
              <span>Export: {kpis.today.byStage.export}</span>
            </div>
          </div>

          <div 
            className="kpi-card clickable"
            onClick={() => handleKPIClick('week')}
          >
            <h3>Tags Used This Week</h3>
            <p className="kpi-number">{kpis.week.total}</p>
            <div className="kpi-breakdown">
              <span>Mine: {kpis.week.byStage.mine}</span>
              <span>Comptoir: {kpis.week.byStage.processing}</span>
              <span>Export: {kpis.week.byStage.export}</span>
            </div>
          </div>

          <div 
            className="kpi-card clickable"
            onClick={() => handleKPIClick('month')}
          >
            <h3>Tags Used This Month</h3>
            <p className="kpi-number">{kpis.month.total}</p>
            <div className="kpi-breakdown">
              <span>Mine: {kpis.month.byStage.mine}</span>
              <span>Comptoir: {kpis.month.byStage.processing}</span>
              <span>Export: {kpis.month.byStage.export}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Table (shown on KPI click) */}
      {showBreakdown && breakdownData && (
        <div className="breakdown-section">
          <div className="breakdown-header">
            <h2>Company Breakdown - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}</h2>
            <button onClick={() => setShowBreakdown(false)} className="close-btn">×</button>
          </div>
          
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Country</th>
                <th>Tags at Mine</th>
                <th>Tags at Comptoir</th>
                <th>Tags Exported</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {breakdownData.companies.map((company, idx) => (
                <tr key={idx}>
                  <td>{company['Company Name']}</td>
                  <td>{company['Company Country']}</td>
                  <td>{company['Tags at Mine']}</td>
                  <td>{company['Tags at Comptoir']}</td>
                  <td>{company['Tags Exported']}</td>
                  <td className="total-cell">{company['Tags Used (Total)']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FullTagDashboard;
```

### CSS Styling Example

```css
.tag-dashboard-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.filter-section {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-section select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.kpi-section h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.kpi-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.kpi-card.clickable {
  cursor: pointer;
}

.kpi-card.clickable:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: translateY(-2px);
  border-color: #007bff;
}

.kpi-card h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #666;
  font-weight: 600;
}

.kpi-number {
  font-size: 36px;
  font-weight: bold;
  color: #007bff;
  margin: 10px 0;
}

.kpi-breakdown {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.breakdown-section {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.breakdown-table {
  width: 100%;
  border-collapse: collapse;
}

.breakdown-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.breakdown-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.breakdown-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  color: #666;
}

.breakdown-table tbody tr:hover {
  background-color: #f8f9fa;
}

.total-cell {
  font-weight: 600;
  color: #007bff;
}
```

---

## Data Flow

```
Frontend
  ↓
[Select Country / Period]
  ↓
API Call
  ↓
Backend Service (Tag.js)
  ↓
Query Bags, Proc Bags, Drum tables
JOIN with Company table
  ↓
Return aggregated data
  ↓
Display KPI Cards
  ↓
User clicks KPI Card
  ↓
Fetch Breakdown
  ↓
Display Company Breakdown Table
```

---

## Important Notes

### Date Formats Supported
The system automatically handles multiple date formats:
- `2026-05-20 00:00:00` (DateTime format)
- `2026-05-20` (Date format)
- `11/26/2024` (MM/DD/YYYY format)
- `26/11/2024` (DD/MM/YYYY format)

### Country Filtering
- Use partial matches (e.g., "DRC", "Rwanda", "Togo")
- Case-insensitive matching
- Leave empty for all countries

### Pagination / Large Results
Current implementation returns all results. For large datasets:
- Consider implementing pagination
- Use database LIMIT/OFFSET

### Performance Tips
1. Cache KPI data for 5-10 minutes if data doesn't change frequently
2. Lazy-load breakdown tables (only load when user clicks KPI card)
3. Implement debouncing on country filter changes

---

## Error Handling

```javascript
const handleAPIError = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred'
    };
  }
  return response.json();
};

// Usage
const fetchDashboard = async (country = null) => {
  try {
    const params = new URLSearchParams();
    if (country) params.append('country', country);
    
    const response = await fetch(`/tag/dashboard?${params}`, {
      headers: { 'x-platform': '3ts' }
    });
    
    return await handleAPIError(response);
  } catch (err) {
    console.error('Fetch error:', err);
    return {
      success: false,
      message: 'Network error'
    };
  }
};
```

---

## Testing the API

### Using cURL

```bash
# Get KPI cards
curl -X GET "http://localhost:5000/tag/kpis?country=DRC" \
  -H "x-platform: 3ts"

# Get company breakdown
curl -X GET "http://localhost:5000/tag/breakdown?timePeriod=today&country=DRC" \
  -H "x-platform: 3ts"

# Get full dashboard
curl -X GET "http://localhost:5000/tag/dashboard?country=DRC" \
  -H "x-platform: 3ts"
```

### Using Postman
1. Create new requests in Postman collection
2. Set URL to one of the endpoints
3. Add header: `x-platform: 3ts`
4. Add query params as needed
5. Send and verify response

---

## FAQ

**Q: What does "Tags Used Today" count?**
A: All unique tags from Mine, Processing, and Export stages where the date is today.

**Q: How are companies matched?**
A: The Company Name field in Bags/Proc Bags/Drum tables stores the UniqueID which is joined with the Company table to get CompanyName and CompanyCountry.

**Q: What if a company has no data for a stage?**
A: That stage shows 0 tags for that company in the breakdown.

**Q: Can I export the breakdown data?**
A: The current API returns JSON. You can implement CSV export in the frontend using a library like `csv-export-js` or `papaparse`.

---

## Support

For issues or questions about the API:
1. Check response status and error messages
2. Verify query parameters are correct
3. Ensure correct platform header is sent
4. Check server logs for backend errors
