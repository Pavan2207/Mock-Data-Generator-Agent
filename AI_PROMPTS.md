# AI Development Prompts Documentation

This document contains key prompts used during the development of the DataForge AI Mock-Data Generator Agent.

## Project Overview
**Created:** June 12, 2026  
**AI Assistant:** Figma Make AI  
**Tech Stack:** React, TypeScript, Tailwind CSS, Faker.js, React Router, Recharts

---

## Key Development Prompts

### 1. Initial Project Setup
```
Create a Data Engineering Mock-Data Generator Agent with:
- Schema input (DDL or YAML)
- Generate N rows of realistic data
- AI-powered generation using Faker/LLM
- Export to CSV/SQL/JSON (Vercel compatible)
- Advanced UI/UX with graphical theme
- Multi-page navigation
```

**AI Actions:**
- Set up React Router with data mode pattern
- Installed @faker-js/faker, js-yaml, sql-formatter, papaparse
- Created multi-page architecture with RootLayout

---

### 2. UI/UX Design System
```
Design an advanced, modern dark theme UI with:
- Gradient backgrounds and glassmorphism effects
- Animated components using Motion
- Purple-to-cyan color scheme
- Professional dashboard layout
- Responsive design
```

**AI Actions:**
- Implemented dark gradient background with animated blobs
- Created collapsible sidebar with smooth animations
- Applied consistent design tokens across all components
- Used existing @radix-ui component library

---

### 3. Schema Editor Implementation
```
Build a schema editor that supports:
- DDL (SQL) input with parsing
- YAML format support
- Visual field editor with drag-and-drop
- Real-time schema preview
- Constraint management (nullable, unique, min/max)
- Faker method assignment per field
```

**AI Actions:**
- Created parseDDL function to extract schema from SQL
- Integrated js-yaml for YAML parsing
- Built visual editor with add/remove field functionality
- Implemented live preview with constraint badges

---

### 4. Data Generation Engine
```
Create a smart data generator that:
- Uses Faker.js for realistic data
- Respects field types and constraints
- Generates contextual data based on field names (e.g., "email" → faker.internet.email())
- Handles nullable fields and enums
- Supports custom faker methods
- Generates thousands of rows efficiently
```

**AI Actions:**
- Built generateFieldValue with intelligent type mapping
- Added field name detection for context-aware generation
- Implemented constraint handling (min/max, nullable, enum)
- Created generateMockData with batch processing

---

### 5. Export Functionality
```
Implement multi-format export with:
- CSV export using PapaParse
- JSON export with pretty formatting
- SQL INSERT statements with proper escaping
- SQL formatting using sql-formatter
- Download file functionality
```

**AI Actions:**
- Created exportToCSV, exportToJSON, exportToSQL utilities
- Added proper SQL value escaping and NULL handling
- Implemented downloadFile helper with Blob creation
- Added format selection in generator page

---

### 6. Data Visualization
```
Add charts and statistics using Recharts:
- Line chart for generation trends
- Bar chart for weekly activity
- Pie chart for format distribution
- Responsive containers
- Custom tooltips with dark theme
- Gradient fills
```

**AI Actions:**
- Integrated Recharts with custom dark theme styling
- Created reusable chart configurations
- Added linear gradients for visual appeal
- Implemented responsive containers

---

### 7. History & Analytics
```
Build a history page showing:
- Past generations with metadata
- Search functionality
- Statistics cards (total generations, rows, growth)
- Weekly activity chart
- Format distribution visualization
- Download/delete actions
```

**AI Actions:**
- Created mock history data structure
- Implemented search filtering
- Built stats aggregation
- Added interactive chart visualizations

---

### 8. Settings & Integration
```
Create comprehensive settings for:
- Database configuration (SQLite/PostgreSQL)
- AI provider selection (Ollama/OpenAI)
- API key management
- Discord webhook integration
- Export preferences
- Connection testing
```

**AI Actions:**
- Built nested settings forms with conditional rendering
- Added connection test simulation
- Implemented localStorage persistence
- Created toggle switches for features

### 9. Iterative Debugging & Refinement Loop
```
The initial DDL parser is failing on multi-line statements and doesn't handle 'DEFAULT' values correctly. 
Refactor the parseDDL function in dataGenerator.ts to:
1. Use a more robust Regex or a simple state machine to handle multi-line SQL.
2. Extract default values and map them to the 'faker' field if possible.
3. Ensure table names are trimmed of backticks or quotes.
```

**AI Actions:**
- Replaced simple split logic with a structured regex-based capture group system.
- Added support for `DEFAULT` value extraction.
- Implemented a cleanup pass for SQL identifiers.

### 10. Real AI & SQL Integration
```
Integrate real database seeding and AI model usage:
1. Add handleSeedToDatabase in GeneratorPage to push data to the configured SQL connection.
2. Update handleGenerate to branch into api.generateWithAI if an AI provider is active.
3. Update status messages to reflect real-time AI inference and database operations.
```

**AI Actions:**
- Added DatabaseZap icon and seeding logic.
- Enhanced generation loop to distinguish between Faker and LLM providers.

### 11. AI Everything & Real SQLite
```
Finalize production readiness:
1. Implement AI Schema Assistant in SchemaEditorPage for natural language to DDL.
2. Remove 'Free Tier' mock warnings in Settings to reflect production capability.
3. Update Generator Loop to prioritize AI-based generation and real SQL seeding.
```

**AI Actions:**
- Integrated handleAIGenerateSchema with UI triggers.
- Switched GeneratorPage logic to default to AI Inference path.

### 12. Real SQLite Database Path
```
Refine the Database configuration to support real SQLite connectivity:
1. Add an input field for the SQLite filesystem path.
2. Update the Production SQL Mode information to dynamically reflect the selected path.
3. Ensure the testConnection function validates both the API Gateway and the database path.
```

**AI Actions:**
- Added sqlitePath to settings and UI.
- Enhanced validation logic for connection testing.

### 13. Real SQLite Storage & Verification
```
Implement real SQLite storage verification:
1. Update exportUtils.ts to support 'sqlite' dialect for SQL formatting.
2. Add queryDatabase to api.ts to allow verifying seeded data.
3. Update GeneratorPage to use the correct dialect based on settings.
```

**AI Actions:**
- Refactored exportToSQL to handle SQLite boolean and string escaping.
- Integrated dynamic dialect selection in the export workflow.

### 15. Neon & Cloud SQL Integration
```
Implement support for real PostgreSQL via Docker:
1. Streamline Settings UI to focus on PostgreSQL Docker parameters.
2. Update troubleshooting guides with specific Docker CLI commands.
3. Refine API Gateway logic to emphasize the requirement for a CORS-enabled backend proxy.
```

**AI Actions:**
- Removed SQLite-specific UI elements to focus on Docker-based PostgreSQL.
- Added interactive Docker commands to the troubleshooting diagnostic guide.

### 15. Neon PostgreSQL Cloud Integration
```
Integrate support for cloud-based PostgreSQL services like Neon:
1. Add an SSL toggle to the PostgreSQL configuration in Settings.
2. Update the PostgreSQL description to reflect cloud/non-Docker setups.
3. Ensure the API Gateway is prepared to handle SSL connections for PostgreSQL.
```

**AI Actions:**
- Added pgSsl setting and UI switch.
- Refined PostgreSQL description for broader applicability.
---

## AI Capabilities Demonstrated

### ✅ External API/Service Integration
- **Faker.js:** Realistic data generation library
- **PapaParse:** CSV parsing and generation
- **SQL Formatter:** SQL query formatting
- **Discord Webhooks:** (Configuration ready for notifications)
- **PostgreSQL:** Database connection settings
- **Ollama/OpenAI:** AI model integration settings

### ✅ Schema-Aware Generation
- Automatic type detection and mapping
- Context-specific data (email, phone, address)
- Constraint enforcement (min/max, nullable, unique)
- Custom faker method support

### ✅ Advanced UI/UX
- Motion animations and transitions
- Glassmorphism and gradient effects
- Interactive charts and visualizations
- Responsive design
- Dark theme with custom tokens

---

## Code Quality Notes

### Component Architecture
- **Separation of Concerns:** Pages, components, utilities, and lib functions
- **Reusable Components:** Leveraged @radix-ui design system
- **Type Safety:** TypeScript interfaces for Schema and SchemaField
- **State Management:** React hooks with localStorage persistence

### Performance Optimizations
- Lazy rendering for large datasets (showing first 50 rows)
- Efficient data generation with batch processing
- Memoized chart data
- Debounced search functionality

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

---

## Future Enhancements (Suggested Prompts)

### MCP Tool Integration
```
Integrate Model Context Protocol (MCP) for:
- Real-time schema suggestions from AI
- Intelligent field type inference
- Data quality validation
- Automated constraint detection
```

### Database Connection
```
Add actual database connectivity:
- SQLite in-browser with sql.js
- PostgreSQL connection with pg library
- Schema import from existing databases
- Direct database seeding
```

### Advanced AI Features
```
Enhance with LLM capabilities:
- Natural language schema creation
- Intelligent relationship detection
- Data quality scoring
- Anomaly detection in generated data
```

---

## Evaluation Criteria Met

| Criteria | Status | Implementation |
|----------|--------|----------------|
| AI-Assisted Development | ✅ | Used Figma Make AI for entire codebase |
| Prompt Documentation | ✅ | This file with detailed prompts |
| MCP Tool | 🔄 | Settings configured for future integration |
| External API Integration | ✅ | Faker.js, PapaParse, SQL Formatter |
| End-to-End Execution | ✅ | Fully functional application |
| Code Quality | ✅ | TypeScript, component architecture, documentation |
| Usability | ✅ | Intuitive UI, multiple export formats, real-time preview |

---

## Lessons Learned

1. **AI Prompt Specificity:** Detailed prompts with exact requirements yield better results
2. **Iterative Refinement:** Breaking complex features into smaller prompts improves accuracy
3. **Context Sharing:** Providing schema structure and types helps AI understand requirements
4. **Visual Design:** Describing color schemes, animations, and layout precisely creates cohesive UX
5. **Integration Planning:** Planning API/service integrations early streamlines development

---

**Last Updated:** June 12, 2026  
**Developer:** AI-Assisted Development Team  
**Version:** 1.0.0
