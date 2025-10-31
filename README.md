# Expense Tracker API Documentation

This API allows users to manage personal expenses — including adding, viewing, updating, and deleting expense records.  
All routes are protected with **JWT authentication**, and require a valid token in the `Authorization` header.

---

## 📘 Endpoints

---

### 1. **Create Expense**
**`POST /createExpense`**

#### Description:
Adds a new expense record for the authenticated user.

#### Request Body:
```json
{
  "expense": {
    "category_id": 1,
    "amount": 1200.50,
    "description": "Groceries at supermarket",
    "date": "2025-10-31"
  }
}
```

#### Response:
```json
{
  "message": "expense created",
  "expense": {
    "category_id": 1,
    "amount": 1200.5,
    "description": "Groceries at supermarket",
    "date": "2025-10-31",
    "username": "john_doe",
    "id": 1
  }
}
```

#### Errors:
| Code | Message |
|------|----------|
| 401 | User not found |
| 500 | Internal Server Error. Cannot create expense |

---

### 2. **View Expenses**
**`GET /viewExpenses/`**

#### Description:
Fetches the list of expenses for the authenticated user.  
Supports filtering by **category** and **date range** (past week, month, 3 months, or custom).

#### Query Parameters:
| Parameter | Type | Description | Example |
|------------|------|-------------|----------|
| `category_id` | number | Optional. Filter by category ID | `1` |
| `filter` | string | Optional. One of `week`, `month`, `3months`, `custom` | `month` |
| `start_date` | string (YYYY-MM-DD) | Required only for `custom` filter | `2025-01-01` |
| `end_date` | string (YYYY-MM-DD) | Required only for `custom` filter | `2025-01-31` |

#### Example Request:
```
GET /viewExpenses?filter=month
GET /viewExpenses?category_id=2&filter=custom&start_date=2025-01-01&end_date=2025-02-01
```

#### Example Response:
```json
{
  "totalAmount": 27805.00,
  "expenses": [
    {
      "id": 1,
      "users_id": 1,
      "category_id": 1,
      "amount": "1005.00",
      "description": "Groceries",
      "date": "2025-10-31T00:00:00.000Z",
      "created_at": "2025-10-31T15:49:46.000Z"
    },
    {
      "id": 2,
      "users_id": 1,
      "category_id": 1,
      "amount": "1200.00",
      "description": "Dinner",
      "date": "2025-10-30T00:00:00.000Z",
      "created_at": "2025-10-31T15:52:37.000Z"
    }
  ]
}
```

#### Errors:
| Code | Message |
|------|----------|
| 400 | Invalid filter option |
| 400 | Custom filter requires start date and end date |
| 500 | Internal Server Error. Cannot read expenses |

---

### 3. **Update Expense**
**`POST /updateExpense`**

#### Description:
Updates a specific column of an existing expense record.

#### Request Body:
```json
{
  "expense_id": 5,
  "column_name": "amount",
  "new_val": 2500.75
}
```

#### Response:
```json
{
  "message": "updated"
}
```

#### Errors:
| Code | Message |
|------|----------|
| 500 | Internal Server Error. Error updating table |

> ⚠️ **Warning:**  
> Ensure `column_name` is validated on the server to prevent SQL injection.

---

### 4. **Delete Expense(s)**
**`POST /deleteExpense`**

#### Description:
Deletes one or multiple expense records depending on parameters.

#### Request Body Options:

| Action | `delete_all` | `expense_id` | `cat_id` | Description |
|--------|---------------|---------------|-----------|--------------|
| Delete all expenses for user | `1` | – | – | Deletes all user’s expenses |
| Delete all by category | `2` | – | category_id | Deletes all expenses of a category |
| Delete one expense | – | expense_id | – | Deletes one expense |

#### Example 1 — Delete one expense:
```json
{
  "expense_id": 10
}
```

#### Example 2 — Delete all:
```json
{
  "delete_all": 1
}
```

#### Example 3 — Delete by category:
```json
{
  "delete_all": 2,
  "cat_id": 3
}
```

#### Response:
```json
{
  "message": "expense deleted"
}
```
or
```json
{
  "message": "expenses deleted"
}
```

#### Errors:
| Code | Message |
|------|----------|
| 500 | Internal Server Error. Cannot delete expense. |

---

## 🗂️ Database Tables (Overview)

| Table | Description |
|--------|--------------|
| `users` | Stores user credentials and profile info |
| `categories` | Contains static list of expense categories |
| `expenses` | Stores each expense record linked to a user and category |

---

## 🧩 Example Category IDs

| ID | Category |
|----|-----------|
| 1 | Groceries |
| 2 | Leisure |
| 3 | Electronics |
| 4 | Utilities |
| 5 | Clothing |
| 6 | Health |
| 7 | Others |
