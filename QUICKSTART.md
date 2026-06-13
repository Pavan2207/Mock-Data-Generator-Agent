# ⚡ Quick Start Guide

Get up and running with DataForge AI in 5 minutes!

---

## 🎯 In 60 Seconds

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev server
pnpm run dev

# 3. Open browser
# http://localhost:5173
```

**That's it! You're ready to generate data.**

---

## 📝 Your First Data Generation

### Step 1: Open Schema Editor

Click **"Schema Editor"** in the sidebar (or navigate to `/schema`)

### Step 2: Use Example Schema

The editor comes pre-loaded with a sample users table. You can:

- **Use it as-is** - Click "Save Schema"
- **Modify it** - Edit fields directly
- **Start fresh** - Click "Add Field" to build your own

### Step 3: Generate Data

1. Click **"Generate"** in the sidebar (or press `G`)
2. Select number of rows (default: 100)
3. Click **"Generate Data"** button
4. Watch the magic happen! ✨

### Step 4: Export

1. Choose format: CSV, JSON, or SQL
2. Click **"Export"**
3. File downloads automatically

**Congratulations!** You just generated realistic mock data.

---

## 🎨 Example Schemas (Copy & Paste)

### Simple Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP
);
```

**Paste this in the DDL tab → Click "Parse DDL" → Save Schema**

### E-commerce Products

```yaml
tableName: products
fields:
  - name: id
    type: INTEGER
  - name: name
    type: VARCHAR
    faker: commerce.productName
  - name: price
    type: DECIMAL
    faker: commerce.price
  - name: category
    type: VARCHAR
    faker: commerce.department
```

**Paste this in the YAML tab → Click "Parse YAML" → Save Schema**

---

## 🔧 Common Tasks

### Change Row Count

**Quick Presets:**
- Click `100`, `1000`, or `5000` buttons

**Custom Amount:**
- Use the slider or type directly

**Maximum:** 10,000 rows per generation

### Regenerate Data

- Click the **"Regenerate"** button in data preview
- Or change row count and click **"Generate Data"** again

### View History

- Click **"History"** in sidebar
- See all past generations
- Search by name or table
- Download or delete old exports

### Change Settings

- Click **"Settings"** in sidebar
- Configure database, AI, and export preferences
- Click **"Save All Settings"**

---

## 🎓 Learn the Features

### Schema Editor Modes

**1. DDL (SQL)**
```sql
CREATE TABLE tablename (
  field_name TYPE constraints
);
```

**2. YAML**
```yaml
tableName: name
fields:
  - name: field_name
    type: TYPE
    faker: method.name
```

**3. Visual Editor**
- Click fields to edit
- Add/remove with buttons
- Set constraints inline

### Smart Field Detection

DataForge AI automatically detects field purpose:

| Field Name Contains | Generated Data |
|---------------------|----------------|
| email | faker@example.com |
| phone | +1-555-0123 |
| name | John Doe |
| address | 123 Main St |
| city | New York |
| company | Acme Corp |
| price | 29.99 |

**Pro Tip:** Name your fields descriptively for better results!

### Custom Faker Methods

Use any Faker.js method:

```yaml
- name: username
  faker: internet.username

- name: avatar
  faker: image.avatar

- name: job_title
  faker: person.jobTitle

- name: product_name
  faker: commerce.productName
```

[Full Faker.js API →](https://fakerjs.dev/api/)

### Constraints

**Nullable:**
```yaml
constraints:
  nullable: true  # 10% chance of null
```

**Min/Max:**
```yaml
- name: age
  type: INTEGER
  constraints:
    min: 18
    max: 65
```

**Enum:**
```yaml
- name: status
  type: VARCHAR
  constraints:
    enum: [active, inactive, pending]
```

---

## 🚀 Advanced Usage

### Using Templates

Check [SCHEMA_EXAMPLES.md](./SCHEMA_EXAMPLES.md) for 20+ templates:

- E-commerce (Products, Orders)
- User Management
- Financial (Transactions, Invoices)
- IoT Sensor Data
- Social Media
- Healthcare
- Education
- And more!

### Keyboard Shortcuts (Future)

| Shortcut | Action |
|----------|--------|
| `G` | Go to Generate |
| `S` | Go to Schema Editor |
| `H` | Go to History |
| `Cmd/Ctrl + S` | Save Schema |
| `Cmd/Ctrl + E` | Export Data |

### Export Tips

**CSV:**
- Best for spreadsheets (Excel, Google Sheets)
- Import into databases easily
- Human-readable

**JSON:**
- Best for APIs and web apps
- JavaScript-friendly
- Preserves data types

**SQL:**
- Best for direct database import
- Ready to run INSERT statements
- Production-ready

---

## 🔌 Integration Setup (Optional)

### PostgreSQL Database

**Start PostgreSQL:**
DataForge AI is pre-configured to use **Neon.tech**. Simply add your connection details in the Settings page or via Vercel Environment Variables (`PG_HOST`, `PG_USER`, etc.) to enable cloud persistence.

### Discord Notifications

**Get Webhook URL:**
1. Discord Server → Settings → Integrations → Webhooks
2. Create Webhook → Copy URL

**Configure in Settings:**
1. Go to Settings → API & Integrations
2. Paste Discord Webhook URL
3. Save Settings

---

## 💡 Pro Tips

### 1. Save Your Schemas

Click **"Save Schema"** before generating to persist in browser storage.

### 2. Start Small

Test with 10-100 rows first, then scale up to thousands.

### 3. Use Field Names Wisely

```yaml
# Good (auto-detected)
- name: user_email
- name: shipping_address
- name: product_price

# Less ideal (needs faker method)
- name: field1
- name: data
- name: value
```

### 4. Preview Before Export

Review the table preview to ensure data looks correct.

### 5. Check History

Use History page to re-download previous generations.

---

## 🐛 Troubleshooting

### "No schema defined"

**Solution:** Go to Schema Editor → Create or load a schema → Save

### Generated data looks random

**Solution:** Use descriptive field names or assign custom faker methods

### Export not downloading

**Solution:** Check browser pop-up blocker settings

### Settings not saving

**Solution:** Enable localStorage in browser settings

### Build errors after install

**Solution:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📚 Next Steps

### Learn More

- [README.md](./README.md) - Full documentation
- [SCHEMA_EXAMPLES.md](./SCHEMA_EXAMPLES.md) - Template library
- [AI_PROMPTS.md](./AI_PROMPTS.md) - How this was built
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to production

### Explore Features

1. **Analytics Dashboard** - View generation trends
2. **History** - Track all your generations
3. **Settings** - Customize everything
4. **Visual Editor** - Build schemas visually

### Get Help

- Read the docs
- Check examples
- Review AI prompts
- Open an issue

---

## 🎯 Common Use Cases

### 1. Testing Web Apps

Generate user data for login/signup testing:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP
);
```

Generate 100 users → Export JSON → Import to app

### 2. Database Seeding

Create product catalog for e-commerce:

```yaml
tableName: products
fields:
  - name: sku
    faker: string.alphanumeric
  - name: name
    faker: commerce.productName
  - name: price
    faker: commerce.price
```

Generate 1000 products → Export SQL → Run in database

### 3. API Development

Generate test data for API responses:

```yaml
tableName: orders
fields:
  - name: order_id
    faker: string.uuid
  - name: customer_name
    faker: person.fullName
  - name: total
    faker: commerce.price
```

Generate 500 orders → Export JSON → Use in API mocks

### 4. Data Analysis Practice

Create datasets for learning:

```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  amount DECIMAL,
  category VARCHAR(50),
  date TIMESTAMP,
  merchant VARCHAR(100)
);
```

Generate 5000 transactions → Export CSV → Analyze in Excel/Python

---

## 🎊 You're All Set!

You now know enough to:

✅ Create schemas in 3 different formats  
✅ Generate realistic mock data  
✅ Export to CSV, JSON, or SQL  
✅ Use smart field detection  
✅ Apply constraints  
✅ Customize settings  

**Happy data generating!** 🚀

---

**Need more help?** Check the full [README.md](./README.md) or [SCHEMA_EXAMPLES.md](./SCHEMA_EXAMPLES.md)
