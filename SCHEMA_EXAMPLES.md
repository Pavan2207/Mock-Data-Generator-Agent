# 📝 Schema Examples & Templates

This document contains ready-to-use schema examples for common use cases.

---

## E-Commerce Schemas

### Products Table

**DDL Format:**
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  in_stock BOOLEAN,
  stock_quantity INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**YAML Format:**
```yaml
tableName: products
fields:
  - name: id
    type: INTEGER
    constraints:
      nullable: false
  - name: sku
    type: VARCHAR
    faker: string.alphanumeric
    constraints:
      unique: true
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
  - name: brand
    type: VARCHAR
    faker: company.name
  - name: in_stock
    type: BOOLEAN
    faker: datatype.boolean
  - name: stock_quantity
    type: INTEGER
    constraints:
      min: 0
      max: 1000
  - name: created_at
    type: TIMESTAMP
    faker: date.past
  - name: updated_at
    type: TIMESTAMP
    faker: date.recent
```

### Orders Table

```sql
CREATE TABLE orders (
  order_id UUID PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL,
  total_amount DECIMAL NOT NULL,
  shipping_address TEXT,
  payment_method VARCHAR(50),
  tracking_number VARCHAR(100)
);
```

---

## User Management Schemas

### Users Table (Complete)

**YAML Format:**
```yaml
tableName: users
fields:
  - name: id
    type: UUID
    faker: string.uuid
  - name: username
    type: VARCHAR
    faker: internet.username
    constraints:
      unique: true
  - name: email
    type: VARCHAR
    faker: internet.email
    constraints:
      unique: true
      nullable: false
  - name: password_hash
    type: VARCHAR
    faker: internet.password
  - name: first_name
    type: VARCHAR
    faker: person.firstName
  - name: last_name
    type: VARCHAR
    faker: person.lastName
  - name: date_of_birth
    type: DATE
    faker: date.birthdate
  - name: phone
    type: VARCHAR
    faker: phone.number
  - name: avatar_url
    type: VARCHAR
    faker: image.avatar
  - name: bio
    type: TEXT
    faker: person.bio
  - name: address
    type: TEXT
    faker: location.streetAddress
  - name: city
    type: VARCHAR
    faker: location.city
  - name: state
    type: VARCHAR
    faker: location.state
  - name: country
    type: VARCHAR
    faker: location.country
  - name: postal_code
    type: VARCHAR
    faker: location.zipCode
  - name: is_active
    type: BOOLEAN
    faker: datatype.boolean
  - name: is_verified
    type: BOOLEAN
    faker: datatype.boolean
  - name: role
    type: VARCHAR
    constraints:
      enum: [admin, user, moderator, guest]
  - name: created_at
    type: TIMESTAMP
    faker: date.past
  - name: last_login
    type: TIMESTAMP
    faker: date.recent
```

### User Sessions

```sql
CREATE TABLE user_sessions (
  session_id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);
```

---

## Financial Schemas

### Transactions

**YAML Format:**
```yaml
tableName: transactions
fields:
  - name: transaction_id
    type: UUID
    faker: string.uuid
  - name: account_number
    type: VARCHAR
    faker: finance.accountNumber
  - name: type
    type: VARCHAR
    constraints:
      enum: [deposit, withdrawal, transfer, payment]
  - name: amount
    type: DECIMAL
    faker: finance.amount
  - name: currency
    type: VARCHAR
    faker: finance.currencyCode
  - name: description
    type: TEXT
    faker: lorem.sentence
  - name: reference_number
    type: VARCHAR
    faker: finance.transactionDescription
  - name: status
    type: VARCHAR
    constraints:
      enum: [pending, completed, failed, cancelled]
  - name: timestamp
    type: TIMESTAMP
    faker: date.recent
  - name: balance_after
    type: DECIMAL
    faker: finance.amount
```

### Invoices

```sql
CREATE TABLE invoices (
  invoice_id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL NOT NULL,
  tax_amount DECIMAL,
  total_amount DECIMAL NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_date DATE,
  notes TEXT
);
```

---

## IoT & Sensor Data

### Sensor Readings

**YAML Format:**
```yaml
tableName: sensor_readings
fields:
  - name: reading_id
    type: UUID
    faker: string.uuid
  - name: sensor_id
    type: VARCHAR
    faker: string.alphanumeric
  - name: device_name
    type: VARCHAR
    faker: commerce.productName
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
  - name: pressure
    type: DECIMAL
    constraints:
      min: 950
      max: 1050
  - name: location_lat
    type: DECIMAL
    faker: location.latitude
  - name: location_lng
    type: DECIMAL
    faker: location.longitude
  - name: battery_level
    type: INTEGER
    constraints:
      min: 0
      max: 100
  - name: signal_strength
    type: INTEGER
    constraints:
      min: -100
      max: 0
  - name: status
    type: VARCHAR
    constraints:
      enum: [online, offline, error, maintenance]
```

### Device Logs

```sql
CREATE TABLE device_logs (
  log_id UUID PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  log_level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  error_code VARCHAR(50),
  stack_trace TEXT,
  metadata JSONB
);
```

---

## Social Media & Content

### Posts

**YAML Format:**
```yaml
tableName: posts
fields:
  - name: post_id
    type: UUID
    faker: string.uuid
  - name: user_id
    type: INTEGER
  - name: title
    type: VARCHAR
    faker: lorem.sentence
  - name: content
    type: TEXT
    faker: lorem.paragraphs
  - name: excerpt
    type: TEXT
    faker: lorem.paragraph
  - name: slug
    type: VARCHAR
    faker: lorem.slug
  - name: featured_image
    type: VARCHAR
    faker: image.url
  - name: category
    type: VARCHAR
    constraints:
      enum: [technology, lifestyle, business, entertainment, sports, news]
  - name: tags
    type: JSON
  - name: views_count
    type: INTEGER
    constraints:
      min: 0
      max: 1000000
  - name: likes_count
    type: INTEGER
    constraints:
      min: 0
      max: 100000
  - name: comments_count
    type: INTEGER
    constraints:
      min: 0
      max: 10000
  - name: is_published
    type: BOOLEAN
    faker: datatype.boolean
  - name: published_at
    type: TIMESTAMP
    faker: date.recent
  - name: created_at
    type: TIMESTAMP
    faker: date.past
  - name: updated_at
    type: TIMESTAMP
    faker: date.recent
```

### Comments

```sql
CREATE TABLE comments (
  comment_id UUID PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id INTEGER NOT NULL,
  parent_comment_id UUID,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);
```

---

## Healthcare & Medical

### Patients

**YAML Format:**
```yaml
tableName: patients
fields:
  - name: patient_id
    type: UUID
    faker: string.uuid
  - name: medical_record_number
    type: VARCHAR
    faker: string.alphanumeric
    constraints:
      unique: true
  - name: first_name
    type: VARCHAR
    faker: person.firstName
  - name: last_name
    type: VARCHAR
    faker: person.lastName
  - name: date_of_birth
    type: DATE
    faker: date.birthdate
  - name: gender
    type: VARCHAR
    constraints:
      enum: [male, female, other, prefer_not_to_say]
  - name: blood_type
    type: VARCHAR
    constraints:
      enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
  - name: phone
    type: VARCHAR
    faker: phone.number
  - name: email
    type: VARCHAR
    faker: internet.email
  - name: address
    type: TEXT
    faker: location.streetAddress
  - name: city
    type: VARCHAR
    faker: location.city
  - name: emergency_contact_name
    type: VARCHAR
    faker: person.fullName
  - name: emergency_contact_phone
    type: VARCHAR
    faker: phone.number
  - name: allergies
    type: TEXT
    faker: lorem.words
  - name: chronic_conditions
    type: TEXT
    faker: lorem.words
  - name: insurance_provider
    type: VARCHAR
    faker: company.name
  - name: insurance_number
    type: VARCHAR
    faker: string.alphanumeric
  - name: registration_date
    type: TIMESTAMP
    faker: date.past
```

### Appointments

```sql
CREATE TABLE appointments (
  appointment_id UUID PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id INTEGER NOT NULL,
  appointment_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL,
  appointment_type VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL
);
```

---

## Education & Learning

### Courses

**YAML Format:**
```yaml
tableName: courses
fields:
  - name: course_id
    type: UUID
    faker: string.uuid
  - name: course_code
    type: VARCHAR
    faker: string.alphanumeric
  - name: title
    type: VARCHAR
    faker: lorem.sentence
  - name: description
    type: TEXT
    faker: lorem.paragraphs
  - name: instructor
    type: VARCHAR
    faker: person.fullName
  - name: category
    type: VARCHAR
    constraints:
      enum: [programming, design, business, marketing, data_science, languages]
  - name: level
    type: VARCHAR
    constraints:
      enum: [beginner, intermediate, advanced, expert]
  - name: duration_hours
    type: INTEGER
    constraints:
      min: 1
      max: 500
  - name: price
    type: DECIMAL
    faker: commerce.price
  - name: enrollment_count
    type: INTEGER
    constraints:
      min: 0
      max: 100000
  - name: rating
    type: DECIMAL
    constraints:
      min: 0
      max: 5
  - name: is_published
    type: BOOLEAN
    faker: datatype.boolean
  - name: created_at
    type: TIMESTAMP
    faker: date.past
```

### Students

```sql
CREATE TABLE students (
  student_id UUID PRIMARY KEY,
  student_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  date_of_birth DATE,
  enrollment_date DATE NOT NULL,
  major VARCHAR(100),
  gpa DECIMAL,
  credits_completed INTEGER,
  graduation_year INTEGER
);
```

---

## Logistics & Delivery

### Shipments

**YAML Format:**
```yaml
tableName: shipments
fields:
  - name: shipment_id
    type: UUID
    faker: string.uuid
  - name: tracking_number
    type: VARCHAR
    faker: string.alphanumeric
    constraints:
      unique: true
  - name: order_id
    type: UUID
    faker: string.uuid
  - name: carrier
    type: VARCHAR
    constraints:
      enum: [FedEx, UPS, DHL, USPS, Amazon]
  - name: service_type
    type: VARCHAR
    constraints:
      enum: [standard, express, overnight, international]
  - name: origin_address
    type: TEXT
    faker: location.streetAddress
  - name: origin_city
    type: VARCHAR
    faker: location.city
  - name: origin_country
    type: VARCHAR
    faker: location.country
  - name: destination_address
    type: TEXT
    faker: location.streetAddress
  - name: destination_city
    type: VARCHAR
    faker: location.city
  - name: destination_country
    type: VARCHAR
    faker: location.country
  - name: weight_kg
    type: DECIMAL
    constraints:
      min: 0.1
      max: 1000
  - name: dimensions
    type: VARCHAR
    faker: lorem.words
  - name: status
    type: VARCHAR
    constraints:
      enum: [pending, in_transit, out_for_delivery, delivered, failed, returned]
  - name: shipped_at
    type: TIMESTAMP
    faker: date.recent
  - name: estimated_delivery
    type: TIMESTAMP
    faker: date.soon
  - name: delivered_at
    type: TIMESTAMP
    constraints:
      nullable: true
```

---

## Real Estate

### Properties

```sql
CREATE TABLE properties (
  property_id UUID PRIMARY KEY,
  listing_number VARCHAR(50) UNIQUE NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50),
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  price DECIMAL NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_feet INTEGER,
  lot_size DECIMAL,
  year_built INTEGER,
  description TEXT,
  amenities TEXT,
  status VARCHAR(50) NOT NULL,
  listed_date DATE NOT NULL,
  agent_id INTEGER
);
```

---

## Tips for Using These Templates

1. **Customize Field Names:** Adjust field names to match your specific requirements
2. **Modify Constraints:** Change min/max values, enums, and nullable settings as needed
3. **Add/Remove Fields:** Templates are starting points - feel free to modify
4. **Combine Templates:** Create relationships between tables (e.g., users + orders)
5. **Test with Small Data:** Generate 10-100 rows first to verify the schema
6. **Use Custom Faker Methods:** Explore Faker.js documentation for more specific data types

---

## Faker.js Method Reference

Common faker methods you can use:

### Person
- `person.firstName`
- `person.lastName`
- `person.fullName`
- `person.jobTitle`
- `person.bio`

### Internet
- `internet.email`
- `internet.username`
- `internet.password`
- `internet.url`
- `internet.ipv4`

### Commerce
- `commerce.productName`
- `commerce.price`
- `commerce.department`
- `commerce.productDescription`

### Location
- `location.city`
- `location.country`
- `location.streetAddress`
- `location.latitude`
- `location.longitude`

### Finance
- `finance.amount`
- `finance.accountNumber`
- `finance.currencyCode`
- `finance.transactionDescription`

### Date
- `date.past`
- `date.recent`
- `date.soon`
- `date.future`
- `date.birthdate`

### Company
- `company.name`
- `company.catchPhrase`
- `company.bs`

For complete list: https://fakerjs.dev/api/

---

**Need help?** Check the [README.md](./README.md) or [AI_PROMPTS.md](./AI_PROMPTS.md) for more information!
