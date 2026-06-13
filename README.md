# 🚀 DataForge AI - Mock Data Generator Agent

<div align="center">

![DataForge AI](https://img.shields.io/badge/DataForge-AI%20Powered-blueviolet?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)

**AI-Powered Realistic Test Data Generation for Data Engineers**

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Usage](#usage) • [Architecture](#architecture)

</div>

---

## 📋 Overview

DataForge AI is an advanced mock data generation agent designed for data engineers who need realistic, schema-aware test data. Built with cutting-edge AI assistance and modern web technologies, it transforms DDL schemas or YAML definitions into production-ready datasets with intelligent, context-specific data.

### 🎯 Key Highlights

- ✨ **AI-Powered Generation:** Intelligent data creation using Google Gemini AI with context-aware field mapping
- 📊 **Schema-Aware:** Respects constraints, types, relationships, and business logic
- 🎨 **Beautiful UI/UX:** Modern dark theme with glassmorphism, animations, and gradients
- 📦 **Multi-Format Export:** CSV, JSON, and SQL with one click
- 🔌 **Integration Ready:** PostgreSQL (Neon), Google Gemini AI, Discord webhooks
- 📈 **Analytics Dashboard:** Track generation history, trends, and statistics

---

## ✨ Features

### Core Functionality

#### 🏗️ Schema Editor
- **DDL Support:** Parse SQL CREATE TABLE statements
- **YAML Format:** Define schemas in YAML with faker methods
- **Visual Editor:** Build schemas with drag-and-drop interface
- **Real-time Preview:** See your schema structure instantly
- **Constraint Management:** Nullable, unique, min/max, enums

#### 🎲 Smart Data Generation
- **Context-Aware:** Automatically detects field purpose (email, phone, address, etc.)
- **Type-Safe:** Respects data types (VARCHAR, INTEGER, BOOLEAN, TIMESTAMP, etc.)
- **Constraint Enforcement:** Honors min/max values, nullable fields, unique constraints
- **Custom Faker Methods:** Assign specific faker methods per field
- **Bulk Generation:** Create up to 10,000 rows efficiently

#### 💾 Export Options
- **CSV:** Standard comma-separated values
- **JSON:** Pretty-formatted JSON arrays
- **SQL:** INSERT statements with proper escaping
- **Download:** One-click file download

#### 📊 Analytics & History
- **Generation History:** Track all past data generations
- **Usage Statistics:** Total rows, generations, growth metrics
- **Visual Charts:** Line, bar, and pie charts for trends
- **Search & Filter:** Find specific generations quickly

### Advanced Features

#### 🔧 Settings & Configuration
- **Database Setup:** SQLite or PostgreSQL (Docker-ready)
- **AI Models:** Ollama, OpenAI, Anthropic integration
- **API Management:** Public API with key authentication
- **Discord Integration:** Webhook notifications
- **Export Preferences:** Default formats, headers, timestamps

#### 🎨 UI/UX Excellence
- **Dark Theme:** Modern gradient backgrounds
- **Glassmorphism:** Frosted glass effects
- **Animations:** Smooth transitions with Motion
- **Responsive:** Works on all screen sizes
- **Accessibility:** ARIA labels, keyboard navigation

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.0** - Utility-first styling
- **React Router 7** - Data-mode routing
- **Motion (Framer Motion)** - Animations
- **Radix UI** - Accessible components

### Data & Visualization
- **Faker.js** - Realistic data generation
- **Recharts** - Beautiful charts
- **PapaParse** - CSV handling
- **SQL Formatter** - Pretty SQL output
- **JS-YAML** - YAML parsing

### Integrations
- **PostgreSQL** - Production database
- **SQLite** - Lightweight database
- **Google Gemini AI** - Primary AI generation engine (Vercel compatible)
- **Discord Webhooks** - Notifications

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 18+ 
pnpm (recommended) or npm
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dataforge-ai
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start development server**
```bash
pnpm run dev
```

4. **Open your browser**
```
http://localhost:5173
```

---

## 📖 Usage

### Quick Start Guide

#### 1️⃣ Define Your Schema

**Option A: Use DDL**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INTEGER,
  created_at TIMESTAMP
);
```

**Option B: Use YAML**
```yaml
tableName: users
fields:
  - name: id
    type: INTEGER
  - name: name
    type: VARCHAR
    faker: person.fullName
  - name: email
    type: VARCHAR
    faker: internet.email
  - name: age
    type: INTEGER
    constraints:
      min: 18
      max: 80
```

**Option C: Visual Editor**
- Click "Add Field"
- Enter field name and type
- Set constraints (optional)

#### 2️⃣ Generate Data

1. Navigate to **Generate** page
2. Select number of rows (10 - 10,000)
3. Click **Generate Data**
4. Preview results in real-time table

#### 3️⃣ Export

1. Choose format: CSV, JSON, or SQL
2. Click **Export**
3. File downloads automatically

### Advanced Usage

#### Custom Faker Methods

Assign specific faker methods for precise control:

```yaml
fields:
  - name: product_name
    type: VARCHAR
    faker: commerce.productName
  - name: price
    type: DECIMAL
    faker: commerce.price
  - name: company
    type: VARCHAR
    faker: company.name
```

#### Constraints

Control data generation with constraints:

```yaml
fields:
  - name: age
    type: INTEGER
    constraints:
      min: 18
      max: 65
      nullable: false
  - name: status
    type: VARCHAR
    constraints:
      enum: [active, inactive, pending]
```

---

## 🏛️ Architecture

### Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── layouts/
│   │   │   └── RootLayout.tsx      # Main app layout
│   │   └── ui/                      # Radix UI components
│   ├── pages/
│   │   ├── HomePage.tsx             # Dashboard
│   │   ├── SchemaEditorPage.tsx    # Schema editor
│   │   ├── GeneratorPage.tsx       # Data generation
│   │   ├── HistoryPage.tsx         # Generation history
│   │   ├── SettingsPage.tsx        # Configuration
│   │   └── NotFoundPage.tsx        # 404 page
│   ├── lib/
│   │   ├── dataGenerator.ts        # Core generation logic
│   │   └── exportUtils.ts          # Export utilities
│   ├── routes.tsx                   # React Router config
│   └── App.tsx                      # App entry point
├── styles/
│   ├── index.css                    # Global styles
│   ├── theme.css                    # Design tokens
│   └── tailwind.css                 # Tailwind imports
└── AI_PROMPTS.md                    # AI development prompts
```

### Data Flow

```
Schema Input (DDL/YAML/Visual)
    ↓
Schema Parser
    ↓
Data Generator (Faker.js)
    ↓
Generated Dataset
    ↓
Export Formatter (CSV/JSON/SQL)
    ↓
File Download
```

---

## 🎨 Design System

### Color Palette

- **Primary:** Purple (`#8b5cf6`) to Cyan (`#06b6d4`) gradient
- **Background:** Slate 950 (`#020617`) to Slate 900 (`#0f172a`)
- **Text:** White (`#ffffff`) and Slate 400 (`#94a3b8`)
- **Accent:** Green (`#10b981`), Red (`#ef4444`), Blue (`#3b82f6`)

### Typography

- **Headings:** Bold, gradient text
- **Body:** Regular, slate-400
- **Code:** Monospace font

### Components

All UI components use Radix UI primitives with custom Tailwind styling:
- Buttons, Inputs, Cards, Tables
- Dialogs, Dropdowns, Tooltips
- Tabs, Sliders, Switches
- Charts (Recharts)

---

## 🔌 Integrations

### Database Configuration

#### SQLite (Default)
```javascript
// In-browser, no setup required
dbType: "sqlite"
```

#### PostgreSQL (Docker)
```bash
docker run -d \
  --name postgres-mockdata \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mockdata \
  -p 5432:5432 \
  postgres:16
```

```javascript
// Settings configuration
{
  dbType: "postgresql",
  pgHost: "localhost",
  pgPort: "5432",
  pgDatabase: "mockdata",
  pgUser: "postgres",
  pgPassword: "password"
}
```

### AI Models

#### Ollama (Local, Free)
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Run Ollama
ollama serve

# Pull a model
ollama pull llama2
```

```javascript
// Settings configuration
{
  aiProvider: "ollama",
  ollamaUrl: "http://localhost:11434"
}
```

#### OpenAI
```javascript
{
  aiProvider: "openai",
  openaiKey: "sk-..."
}
```

### Discord Notifications

```javascript
{
  discordWebhook: "https://discord.com/api/webhooks/..."
}
```

---

## 📊 Example Schemas

### E-commerce

```yaml
tableName: products
fields:
  - name: id
    type: INTEGER
  - name: name
    type: VARCHAR
    faker: commerce.productName
  - name: description
    type: TEXT
    faker: commerce.productDescription
  - name: price
    type: DECIMAL
    faker: commerce.price
  - name: category
    type: VARCHAR
    faker: commerce.department
  - name: in_stock
    type: BOOLEAN
```

### User Management

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### IoT Sensor Data

```yaml
tableName: sensor_readings
fields:
  - name: sensor_id
    type: UUID
    faker: string.uuid
  - name: timestamp
    type: TIMESTAMP
    faker: date.recent
  - name: temperature
    type: DECIMAL
    constraints:
      min: -20
      max: 50
  - name: humidity
    type: DECIMAL
    constraints:
      min: 0
      max: 100
  - name: location
    type: VARCHAR
    faker: location.city
```

---

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Schema editor (DDL/YAML/Visual)
- [x] Data generation with Faker.js
- [x] Multi-format export (CSV/JSON/SQL)
- [x] Beautiful UI/UX
- [x] History and analytics

### Phase 2: Database Integration 🔄
- [ ] SQLite in-browser with sql.js
- [ ] PostgreSQL connection
- [ ] Schema import from existing databases
- [ ] Direct database seeding

### Phase 3: Advanced AI 🚀
- [ ] MCP tool integration
- [ ] Natural language schema creation
- [ ] Intelligent relationship detection
- [ ] Data quality scoring

### Phase 4: Enterprise Features 💼
- [ ] Team collaboration
- [ ] Version control for schemas
- [ ] API rate limiting
- [ ] Advanced scheduling

---

## 🤝 Contributing

This project was built using AI-assisted development. See [AI_PROMPTS.md](./AI_PROMPTS.md) for detailed prompts used during development.

---

## 📄 License

MIT License - feel free to use this project for your own data engineering needs!

---

## 🙏 Acknowledgments

- **Figma Make AI** - AI-assisted development
- **Faker.js** - Realistic data generation
- **Radix UI** - Accessible components
- **Recharts** - Beautiful charts
- **Tailwind CSS** - Utility-first styling

---

<div align="center">

**Built with ❤️ using AI-Assisted Development**

[Report Bug](https://github.com) • [Request Feature](https://github.com) • [Documentation](./AI_PROMPTS.md)

</div>
