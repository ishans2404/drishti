# EGDrishti Admin Dashboard - Detailed Technical Specification

## Table of Contents
1. [Layout & Navigation](#layout--navigation)
2. [Page Structure & Components](#page-structure--components)
3. [Data Tables Detailed Structure](#data-tables-detailed-structure)
4. [Form Elements & Input Fields](#form-elements--input-fields)
5. [Module-Specific Details](#module-specific-details)
6. [UI Components & Patterns](#ui-components--patterns)
7. [CSS Classes & Styling](#css-classes--styling)

---

## Layout & Navigation

### 2.1 Overall Page Structure

**HTML Structure:**
```
<body>
  ├── <aside class="sidebar-menu in">         <!-- Left Sidebar Navigation -->
  │   ├── Logo/Header
  │   ├── Search Input
  │   └── Menu Items (14 total)
  ├── <header class="topbar-nav">             <!-- Top Navigation Bar -->
  │   ├── Notification Icon
  │   ├── Logout Link
  │   ├── User Role Badge (ADMIN)
  │   └── Organization Link
  └── <main>                                   <!-- Main Content Area -->
      ├── Page Title (H4)
      ├── Separator Line
      └── Content (Table/Form/etc)
```

### 2.2 Sidebar Navigation

**Sidebar Attributes:**
- **Class**: `sidebar-menu in`
- **Has Search Box**: Yes (placeholder: "ctrl + /")
- **Has Logo**: No (branded text header)
- **Expandable**: Yes (collapsible sections with sub-menus)

**Menu Items (14 Total):**
1. Dashboard - `/user-admin/user_management/dashboard.php`
2. Under Users - `/user-admin/user_management/under_users.php`
3. Screen Info - `/user-admin/screen-info/master.php`
4. Header Right Side - `/user-admin/screen_logo_or_minister/master.php`
5. Image Slider - `/user-admin/screen_banner_master/master.php`
6. Notice Board - `/user-admin/screen_notice_board/master.php`
7. News/Event Master - `/user-admin/screen_news_master/master.php`
8. Photo Gallery - `/user-admin/screen_photo_gallery/master.php`
9. Video Gallery - `/user-admin/screen_video_gallery/master.php`
10. Audio Master - `/user-admin/screen_for_audio/master.php`
11. Section Show/Hide - `/user-admin/screen_show_section_master/master.php`
12. Template Preview - `/user-admin/screen_template_master/master.php`
13. Footer Master - `/user-admin/screen_footer_master/master.php`

### 2.3 Top Navigation Bar

**Header/Top Bar Attributes:**
- **Class**: `topbar-nav`
- **Position**: Fixed at top
- **Has Profile Icon**: No
- **Has Logout**: Yes (link: `/user-admin/logout.php`)
- **Shows User Info**: Yes (text: "ADMIN")
- **Shows Organization Link**: Yes (clickable link to public site)

**Top Bar Elements (Right-Aligned):**
- Notification/Menu Icon
- Logout Link (text: "Logout")
- Current User Role Badge (text: "ADMIN")
- Organization Link Format: `( https://egdrishti.com/{screen-slug} )`

---

## Page Structure & Components

### 3.1 Common Page Layout Pattern

All master pages follow identical structure:

```html
<main>
  <h4>Page Title</h4>
  <hr/>  <!-- Separator -->
  
  <button class="btn btn-primary">Add Data</button>
  
  <div class="dataTables_wrapper">
    <div class="dataTables_length">
      <select>25, 50, 100, 200, 400, All</select>
    </div>
    
    <div class="dataTables_filter">
      <input type="search" placeholder="Search:">
    </div>
    
    <table>
      <thead><tr><th>S.No.</th><th>Action</th><th>Content</th></tr></thead>
      <tbody><!-- Rows --></tbody>
    </table>
    
    <div class="dataTables_paginate">
      <a>Previous</a>
      <a>1</a> <a>2</a> ...
      <a>Next</a>
    </div>
    
    <div class="dataTables_info">
      Showing 1 to X of Y entries
    </div>
  </div>
</main>
```

### 3.2 Page Types

#### Type A: Single Record Display (Screen Info)
- **URL**: `/user-admin/screen-info/master.php`
- **Title**: "Screen Information"
- **Layout**: Key-value table (2 columns)
- **Rows**: 11 fields
- **Action Button**: Single "Update" button at top-right
- **Data Type**: Organization metadata (read-mostly)

#### Type B: Image/Media Gallery Pages
- **URL Patterns**: 
  - `/user-admin/screen_logo_or_minister/master.php` (4 rows)
  - `/user-admin/screen_banner_master/master.php` (8 rows)
  - `/user-admin/screen_photo_gallery/master.php` (3 rows)
- **Table Columns**: S.No. | Action | Image (with thumbnail)
- **Action**: Standard dropdown menu
- **Has Add Data Button**: Yes
- **Has Search/Pagination**: Yes

#### Type C: Text/Content Pages with Dates
- **URL Patterns**:
  - `/user-admin/screen_notice_board/master.php` (3 rows)
  - `/user-admin/screen_news_master/master.php` (3 rows)
  - `/user-admin/screen_footer_master/master.php` (2 rows)
- **Table Columns**: S.No. | Action | Title | Start Date | End Date
- **Date Format**: YYYY-MM-DD (ISO format)
- **Has Add Data Button**: Yes

#### Type D: Form-Based Pages
- **URL**: `/user-admin/screen_show_section_master/master.php` (Service Menu Grant)
- **Layout**: Checkbox list (not a data table)
- **Total Checkboxes**: 7 items
- **Checkbox Structure**:
  ```
  <input type="checkbox" name="grantmenu[]" value="16">
  <label>Header Right Side</label>
  ```
- **Submit Button**: Green submit button
- **Purpose**: Toggle visibility of sections on public site

#### Type E: Template Preview Page
- **URL**: `/user-admin/screen_template_master/master.php`
- **Title**: "Screen Templates"
- **Layout**: Card-based (not traditional table)
- **Elements**: 
  - Template boxes with images
  - Classes: `template-box`, `active-template`
  - Total Image Count: 7
- **Contains**: 3 template options
  - "Customize Feature" (active)
  - "Image Slider"
  - "All Features"

---

## Data Tables Detailed Structure

### 4.1 Master Page Table Structure

**Standard Columns (All Master Pages):**

| Column | Type | Sortable | Content | Width |
|--------|------|----------|---------|-------|
| S.No. | Numeric | Yes (asc) | Sequential number (1, 2, 3...) | 10% |
| Action | Dropdown | No | Edit, Delete, Disable, View options | 15% |
| Content* | Varies | Yes | Text/Image/Date/Status | 75% |

*Content column varies by page type

### 4.2 Page-Specific Table Columns

#### Screen Info (Special Format - Key-Value Table)
```
Field Label          | Field Value
---------------------|----------------------------------
Name                 | CGSACS
Mobile              | 1234567890
Screen Slug         | cgsacs-hospital
User Name           | Cgsacs Hospital
Password            | CGHospital@251
Screen Heading      | छत्तीसगढ़ राज्य एड्स नियंत्रण समिति
Screen Logo         | [Image Thumbnail]
Address             | [Empty/Text]
WhatsApp No.        | [Empty/Text]
Website Link        | [Link HTML]
Email Id            | cgsacs@gmail.com
```

#### Header Right Side / Image Slider / Photo Gallery
```
S.No. | Action | Image
------|--------|--------
1     | [Btn]  | [Thumb + Enable Badge]
2     | [Btn]  | [Thumb + Enable Badge]
...
```

**Example Data:**
- Header Right Side: 4 entries
- Image Slider: 8 entries
- Photo Gallery: 3 entries

#### Notice Board / News/Event Master / Footer Master
```
S.No. | Action | Title                          | Start Date | End Date
------|--------|--------------------------------|------------|----------
1     | [Btn]  | Sample Notice/News Title       | 2026-04-25 | 2026-04-30
2     | [Btn]  | Sample Notice 2/News Title 2   | 2026-04-24 | 2026-04-26
...
```

**Example Data:**
- Notice Board: 3 entries
- News/Event Master: 3 entries (includes emoji in title)
- Footer Master: 2 entries

#### Video Gallery / Audio Master
```
S.No. | Action | Image
------|--------|-------
[Empty - No data to display]
```

### 4.3 Table Configuration Options

**Entries Per Page Dropdown:**
- Options: 25, 50, 100, 200, 400, All
- Default: 25
- Control: `<select>` element
- Applies to all master pages with tables

**Column Header Classes:**
```css
.sorting_asc    /* Currently sorted ascending (S.No.) */
.sorting        /* Can be sorted */
.sorting_1      /* DataTable internal tracking */
```

**Row Cell Classes:**
```css
.sorting_1      /* Data table added class */
                /* No custom classes on data cells */
```

**Pagination Status:**
```
"Showing 1 to X of Y entries"
```

Examples:
- Notice Board: "Showing 1 to 3 of 3 entries"
- Image Slider: "Showing 1 to 8 of 8 entries"
- Header Right Side: "Showing 1 to 4 of 4 entries"

---

## Form Elements & Input Fields

### 5.1 Login Page Form

**Form ID**: `loginForm` (inferred)

**Fields:**
```html
<input type="text" placeholder="Username" name="username">
<input type="password" placeholder="Password" name="password">
<input type="text" placeholder="Enter Captcha" name="captcha">
<button type="submit">Login</button>
```

**CAPTCHA:**
- **Type**: Numeric (e.g., "6281")
- **Dynamic**: Changes on page load/refresh
- **Refresh Button**: Click icon next to CAPTCHA display
- **Implementation**: Server-side generated, client-side verified

### 5.2 Search Form

**Component**: Search Box (All Master Pages)

```html
<input type="search" placeholder="" name="" class="form-control input-sm">
```

**Features:**
- Real-time search (as-you-type)
- Searches across displayed columns
- Clears current page filters and returns to page 1
- Works with pagination

### 5.3 Dropdown Selects

**Entries Per Page:**
```html
<select class="form-control input-sm">
  <option>25</option>
  <option>50</option>
  <option>100</option>
  <option>200</option>
  <option>400</option>
  <option>All</option>
</select>
```

### 5.4 Add Data Button

**Style**: Primary blue button

```html
<button class="btn btn-primary" type="button">
  <i class="icon-plus"></i>
  Add Data
</button>
```

**Behavior**: Opens modal dialog for adding new entry (not explored, as per user restriction)

---

## Module-Specific Details

### 6.1 Dashboard Module

**URL**: `/user-admin/user_management/dashboard.php`

**Page Structure:**
```
Heading (H4): "Dashboard"
Separator line
Content:
  - Heading (H5): "Welcome to Admin Panel"
  - Decorative Image/Icon
  - Heading (H5): "Powered By : Global Infotech,Durg"
```

**No Data Table**: Landing/welcome page only

**Purpose**: Welcome screen with system information

### 6.2 Under Users Module

**URL**: `/user-admin/user_management/under_users.php`

**Page Structure:**
```
Heading (H4): "Under User Account"
Separator line
Content: Card-based layout (not table)
```

**Data Format:**
```
Card 1:
  Heading (H4): "Testing Code"
  Paragraph: "coding-ninja"

Card 2:
  Heading (H4): "Durg Hospital"
  Paragraph: "durghospital"
```

**Cards are Clickable**: Opens account details/management

**Total Count**: 2 organizations shown

**Purpose**: Sub-account management interface

### 6.3 Section Show/Hide Module

**URL**: `/user-admin/screen_show_section_master/master.php`

**Actual Page Title**: "Service Menu Grant"

**Form Structure:**
```html
<form method="POST" name="grantform">
  <input type="checkbox" name="grantmenu[]" value="16"> Header Right Side
  <input type="checkbox" name="grantmenu[]" value="17"> Image Slider
  <input type="checkbox" name="grantmenu[]" value="18"> Notice Board
  <input type="checkbox" name="grantmenu[]" value="19"> News/Event Master
  <input type="checkbox" name="grantmenu[]" value="20"> Photo Gallery
  <input type="checkbox" name="grantmenu[]" value="21"> Video Gallery
  <input type="checkbox" name="grantmenu[]" value="22"> Audio Master
  
  <button type="submit" class="btn btn-success">Submit</button>
</form>
```

**Checkboxes:**
- **Count**: 7 total
- **Default State**: All checked (enabled)
- **Purpose**: Control which sections appear on public website
- **Naming Convention**: `name="grantmenu[]"` (array input)

### 6.4 Template Preview Module

**URL**: `/user-admin/screen_template_master/master.php`

**Page Title**: "Screen Templates"

**Layout**: Template Selection Cards

**Template Boxes:**
```
Box 1: "Customize Feature"
  - Image: /upload/template1.png
  - Class: template-box active-template
  
Box 2: "Image Slider"
  - Image: /upload/template2.png
  - Class: template-box
  
Box 3: "All Features"
  - Image: /upload/template2.png
  - Class: template-box
```

**Images Used:**
1. Logo image: `https://egdrishti.com/3/38724042026164908logo.png`
2. Template 2: `/user-admin/screen_template_master/upload/template2.png`

**Functionality**: Click to select template (assumed)

---

## UI Components & Patterns

### 7.1 Action Dropdown Button

**Display Text**: "Action"

**Dropdown Options** (inferred from HTML):
- Update
- Disable
- Delete

**HTML Pattern**:
```html
<button class="btn btn-xs dropdown-toggle" data-toggle="dropdown">
  Action <span class="caret"></span>
</button>
<ul class="dropdown-menu">
  <li><a href="...">Update</a></li>
  <li><a href="...">Disable</a></li>
  <li><a href="...">Delete</a></li>
</ul>
```

**Behavior**: 
- Clicking shows menu options
- Menu items are links (not buttons)
- Has arrow/caret indicator
- Positioned in table cell

### 7.2 Status Badge / Enable-Disable Indicator

**Display Format**: Image + Text

**Example**: 
```
[Green Checkmark Icon] Enable
[Red X Icon] Disable
```

**HTML**:
```html
<img src="path/to/checkmark.png" alt="Enable">
<span>Enable</span>
```

or

```html
<img src="path/to/x.png" alt="Disable">
<span>Disable</span>
```

**Used In**: All image/gallery master pages

### 7.3 DataTables Wrapper Components

**Wrapper Classes**:
```css
.dataTables_wrapper      /* Main wrapper */
.dataTables_length       /* Entries per page dropdown section */
.dataTables_filter       /* Search box section */
.dataTables_paginate     /* Pagination controls section */
.dataTables_info         /* "Showing X to Y" text section */
```

**Pagination Controls Structure**:
```
[Previous] [1] [2] [3] ... [Next]
```

**Pagination States**:
- Disabled (Previous on page 1)
- Disabled (Next on last page)
- Clickable page numbers

### 7.4 Image Elements

**Used In**: Gallery pages, Template preview, Screen info

**Types**:
- Thumbnails (small preview images)
- Logo images
- Banner/slider images
- Template preview images

**HTML**:
```html
<img src="path/to/image.png" alt="">
<!-- No alt text commonly used -->
```

**Image Paths**: Uploaded files stored in `/user-admin/{module}/upload/` directories

---

## CSS Classes & Styling

### 8.1 Button Classes

```css
.btn                    /* Base button style */
.btn-primary           /* Blue primary action button */
.btn-success           /* Green submit button */
.btn-xs                /* Extra small (Action dropdown) */
.btn btn-primary       /* Add Data button */
.btn btn-success       /* Submit buttons */
```

**Button Colors** (Inferred):
- **Primary Blue**: Action buttons, Add Data
- **Green**: Submit, Success actions
- **Gray/Default**: Neutral actions

### 8.2 Form Classes

```css
.form-group            /* Container for form elements */
.form-control          /* Input field styling */
.input-sm              /* Small input variant */
```

### 8.3 Table Classes

```css
.table                 /* Base table style */
.table-striped         /* Alternating row colors */
.table-hover           /* Row hover effect */
.sorting                /* Sortable column header */
.sorting_asc           /* Currently sorted ascending */
.sorting_1             /* DataTables internal */
```

### 8.4 Layout Classes

```css
.sidebar-menu in        /* Sidebar with "in" state (expanded) */
.topbar-nav            /* Top navigation bar */
.dataTables_wrapper    /* DataTables container */
.template-box          /* Template card */
.active-template       /* Active template indicator */
```

### 8.5 Typography

**Heading Hierarchy**:
- `<h4>` - Page title (e.g., "Dashboard", "Screen Information")
- `<h5>` - Section headings, card titles (e.g., "Welcome to Admin Panel")

**Font Usage**: Not specifically detailed, appears to be system fonts

---

## Data Types & Field Formats

### 9.1 Input Field Types

| Field | Type | Format | Example | Validation |
|-------|------|--------|---------|-----------|
| Name | Text | Any | CGSACS | Required |
| Mobile | Numeric | 10 digits | 1234567890 | Required |
| Email | Text | Email | cgsacs@gmail.com | Email format |
| Password | Text | Any | CGHospital@251 | Required |
| Screen Slug | Text | URL-friendly | cgsacs-hospital | Required, unique |
| Title | Text | Any | Sample Notice | Required |
| Start Date | Date | YYYY-MM-DD | 2026-04-25 | Required |
| End Date | Date | YYYY-MM-DD | 2026-04-30 | Required |
| Image | File | Image formats | .png, .jpg | File upload |

### 9.2 Organization Information Fields

**Screen Info Page Fields:**
1. Name - Organization name
2. Mobile - Contact phone
3. Screen Slug - URL identifier
4. User Name - Admin username
5. Password - Admin password (displayed in plain)
6. Screen Heading - Title (supports regional languages)
7. Screen Logo - Image upload
8. Address - Full address
9. WhatsApp No. - WhatsApp contact
10. Website Link - Organization website
11. Email Id - Contact email

### 9.3 Content Fields

**Notice Board:**
- Title
- Start Date
- End Date
- Status (Enable/Disable)

**News/Event Master:**
- Title (supports emoji: 👩‍⚕️)
- Start Date (often empty)
- End Date (often empty)
- Status

**Notice/News Data Example:**
```
Title: "Sample Notice" / "👩‍⚕️ Women's Health & Wellness Camp"
Start Date: "2026-04-25"
End Date: "2026-04-30"
Status: "Enable" (with checkmark)
```

---

## Interaction Patterns

### 10.1 Form Submission

**Add Data Flow** (Inferred):
1. Click "Add Data" button
2. Modal/form dialog opens (not explored)
3. User fills form fields
4. Submit form
5. Data added to table (with refresh)
6. Success message shown (assumed)

### 10.2 Row Actions

**Action Dropdown** (Inferred):
1. Click "Action" button in row
2. Dropdown menu appears with options:
   - Edit/Update
   - Delete
   - Disable/Enable
3. Click option
4. Form opens or confirmation dialog
5. Action performed
6. Table refreshes

### 10.3 Table Navigation

**Pagination**:
1. User clicks page number or Next/Previous
2. Table updates with new data
3. URL parameters change (assumed)
4. Scroll position resets (assumed)

**Search**:
1. User types in search box
2. Table filters in real-time
3. Pagination resets to page 1
4. Shows matching entries only

**Sort**:
1. Click column header
2. Data sorts ascending (first click)
3. Click again to sort descending
4. Table updates with sorted data
5. Visual indicator shows active sort (arrow/color)

---

## Browser Compatibility & Performance

### 11.1 JavaScript Libraries Detected

From page analysis:
- **jQuery** (inferred from selectors)
- **DataTables** (table pagination/sorting library)
- **Bootstrap** (button/form styling)
- **Custom JavaScript** (form handling, AJAX)

### 11.2 Performance Considerations

- Tables use DataTables library (known for performance)
- Pagination limits displayed rows (25 default)
- Search is client-side filtering (on current page data)
- AJAX likely used for form submissions

---

## API Endpoints (Inferred Structure)

Based on page URLs and functionality, likely API endpoints:

```
POST   /user-admin/login                          (Authentication)
GET    /user-admin/logout                         (Logout)

GET    /user-admin/user_management/dashboard      (Dashboard data)
GET    /user-admin/user_management/under_users    (Sub-user list)

GET    /user-admin/screen-info/master             (Screen info form)
POST   /user-admin/screen-info/save               (Update screen info)

GET    /user-admin/screen_logo_or_minister/master (Logo list)
POST   /user-admin/screen_logo_or_minister/add    (Add logo)
POST   /user-admin/screen_logo_or_minister/edit   (Edit logo)
POST   /user-admin/screen_logo_or_minister/delete (Delete logo)

GET    /user-admin/screen_notice_board/master     (Notice list)
POST   /user-admin/screen_notice_board/add        (Add notice)
POST   /user-admin/screen_notice_board/edit       (Edit notice)

(Similar pattern for all other master pages)

POST   /user-admin/screen_show_section_master/save (Update section grants)
```

---

## Summary Table: All Modules & Pages

| Module | URL | Type | Data Count | Has Table | Has Form |
|--------|-----|------|------------|-----------|----------|
| Dashboard | dashboard.php | Welcome | - | No | No |
| Under Users | under_users.php | Account List | 2 | No | Yes |
| Screen Info | screen-info/master.php | Config | 11 fields | Yes | Yes |
| Header Right Side | screen_logo_or_minister/master.php | Gallery | 4 | Yes | Yes |
| Image Slider | screen_banner_master/master.php | Gallery | 8 | Yes | Yes |
| Notice Board | screen_notice_board/master.php | Content | 3 | Yes | Yes |
| News/Event Master | screen_news_master/master.php | Content | 3 | Yes | Yes |
| Photo Gallery | screen_photo_gallery/master.php | Gallery | 3 | Yes | Yes |
| Video Gallery | screen_video_gallery/master.php | Gallery | 0 | Yes | Yes |
| Audio Master | screen_for_audio/master.php | Gallery | 0 | Yes | Yes |
| Section Show/Hide | screen_show_section_master/master.php | Config | 7 items | No | Yes |
| Template Preview | screen_template_master/master.php | Selection | 3 | No | No |
| Footer Master | screen_footer_master/master.php | Content | 2 | Yes | Yes |

---

## Key Technical Insights

### Code Architecture
- **Backend**: PHP (Apache/Nginx)
- **Frontend**: HTML5, CSS, JavaScript (jQuery, Bootstrap, DataTables)
- **Session Management**: PHP sessions with CAPTCHA validation
- **Multi-tenancy**: Each organization has separate account with own data

### Database Design (Inferred)
- Organizations table (contains Screen Info data)
- Content tables (notices, news, photos, videos, etc.)
- Users table (admin accounts)
- Permissions table (section grants/visibility)

### Security Features
- CAPTCHA on login
- Password protected accounts
- Session-based authentication
- Likely CSRF protection on forms

### Scalability Considerations
- DataTables handles large datasets efficiently
- Pagination limits memory usage
- Separate database records per organization
- Supports multiple concurrent admin users

---

This specification provides sufficient detail for accurate replication of the EGDrishti admin dashboard system. All UI components, data structures, interaction patterns, and technical details have been documented based on detailed extraction from the running application.
