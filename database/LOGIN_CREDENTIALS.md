# SMC Portal — Login Credentials & Database Setup

---

## Problem tha: "hospital.users doesn't exist"

Ye error isliye aaya kyunki phpMyAdmin me **hospital** database selected tha.
Hamara database `smc_db` hai.

---

## Database Setup — 2 Cases

### Case A: Fresh Setup (pehli baar)
`FRESH_SETUP.sql` use karo — ye sab kuch create karta hai

### Case B: Tables already hain, sirf users add karne hain
`all_users_setup.sql` use karo

---

## phpMyAdmin Steps (FRESH_SETUP.sql)

```
1. phpMyAdmin open karo → http://localhost/phpmyadmin

2. LEFT SIDEBAR me koi bhi database SELECT MAT KARO
   (ya "No database selected" state me raho)

3. Top navigation me "SQL" tab click karo

4. FRESH_SETUP.sql ka poora content copy karo aur paste karo

5. "Go" button click karo

6. Green success message aayega
   Last me ek table dikhega — 8 users show honge
```

---

## phpMyAdmin Steps (all_users_setup.sql — existing DB)

```
1. phpMyAdmin open karo

2. LEFT SIDEBAR me "smc_db" click karo (select karo)

3. Top me "SQL" tab click karo

4. all_users_setup.sql ka content paste karo

5. "Go" click karo
```

---

## All Login Credentials

**Default Password (sabhi ka):** `password123`

| Role | Email | Password | Dashboard Access |
|------|-------|----------|-----------------|
| **admin** | `admin@municipal.gov` | `password123` | Full system — staff, complaints, bills, audit |
| **dc** | `dc@gov.in` | `password123` | DC Command Center — district oversight |
| **collector** | `collector@gov.in` | `password123` | Collector Dashboard — district complaints |
| **department_head** | `head@municipal.gov` | `password123` | Department management |
| **po** | `po@municipal.gov` | `password123` | Ward complaints — forward to departments |
| **staff** | `staff@municipal.gov` | `password123` | My tasks, assigned complaints |
| **auditor** | `auditor@municipal.gov` | `password123` | Audit logs, bills review |
| **public** | `citizen@email.com` | `password123` | Citizen portal |

---

## Login URL

```
http://localhost:3000/login
```

1. "Staff Portal" button click karo
2. Apna role card select karo (8 cards dikhenge)
3. Email + password enter karo → Dashboard

---

## .env me DATABASE_URL

```
DATABASE_URL="mysql://root@localhost:3306/smc_db"
```

Agar password hai MySQL ka:
```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/smc_db"
```

---

## Complaint Transfer Flow

```
Citizen submits
      ↓
PO / Ward Officer (verify & forward)
      ↓
Department Head (assign to staff)
      ↓
Staff Member (work & update)
      ↓
Department Head (review & resolve)
      ↓
Collector / DC (escalate if needed)
      ↓
RESOLVED ✓
```
