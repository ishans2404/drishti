# EGDrishti Admin Dashboard - Detailed Replication Prompt

## Project Overview
**EGDrishti** is a simple yet functional admin dashboard system designed for managing organizational content (specifically for hospitals/healthcare institutions). The system provides a clean interface for managing various content types including images, videos, audio, news, notices, and organizational information.

**Tech Stack (Current)**: PHP-based backend with HTML/CSS/JavaScript frontend
**Key Feature**: Multi-user admin system with hierarchical access control

---

## 1. Authentication System

### 1.1 Login Page
- **URL**: `https://egdrishti.com/`
- **Page Title**: "Smart Vision Admin Login"
- **Branding**: 
  - Logo/header with "Smart Vision"
  - Subtitle: "Secure & Powerful Admin Dashboard"
  
### 1.2 Login Form Components
- **Username Field**: Text input for organization name (e.g., "Cgsacs Hospital")
- **Password Field**: Password input for account password
- **CAPTCHA Verification**: 
  - Dynamic numeric CAPTCHA displayed (e.g., "6281")
  - User must enter the displayed number in the CAPTCHA input field
  - CAPTCHA refresh icon available
- **Login Button**: Primary action button to submit credentials
- **Session Management**: After successful login, user is redirected to dashboard with active session
- **Logout**: Available in top-right navigation, clears session

---

## 2. Dashboard Layout & Navigation

### 2.1 Main Layout Structure
**Two-column responsive layout:**

#### Left Sidebar (Navigation Panel)
- **Header**: 
  - Organization logo
  - "CGSACS" branding
  - Search bar with "ctrl + /" shortcut hint
  
- **Main Navigation Menu** (Collapsible sections):
  1. **Dashboard** - Main landing page
  2. **User Management Section**:
     - Dashboard (selected by default)
     - Under Users
  3. **Content Management Sections** (each with accordion/expandable structure):
     - Screen Info
     - Header Right Side (Logo/Minister images)
     - Image Slider (Banner management)
     - Notice Board
     - News/Event Master
     - Photo Gallery
     - Video Gallery
     - Audio Master
     - Section Show/Hide (Toggle sections)
     - Template Preview
     - Footer Master

#### Top Navigation Bar
- **Right-aligned elements**:
  - Notification/Menu icon
  - Logout link
  - Current user role badge (e.g., "ADMIN")
  - Organization link (e.g., "( https://egdrishti.com/cgsacs-hospital )")

#### Main Content Area
- **Page Header**: Title/breadcrumb indicating current page
- **Separator/Divider**: Visual divider below page title
- **Content Section**: Specific content based on selected menu item

---

## 3. Page-by-Page Detailed Structure

### 3.1 Dashboard Page
- **URL**: `/user-admin/user_management/dashboard.php`
- **Content**:
  - Heading: "Dashboard"
  - Welcome message: "Welcome to Admin Panel"
  - Decorative graphic/icon
  - Footer text: "Powered By : Global Infotech, Durg"
- **Purpose**: Landing page with system information

### 3.2 Under Users Page
- **URL**: `/user-admin/user_management/under_users.php`
- **Content**:
  - Heading: "Under User Account"
  - List of sub-user accounts in card format
  - Each card displays:
    - User organization name (heading)
    - Username/code (subheading)
  - Example entries: "Testing Code" (coding-ninja), "Durg Hospital" (durghospital)
- **Functionality**: Click on cards to manage specific sub-account details
- **Purpose**: Multi-tenant user management - admin can manage multiple organizational accounts

### 3.3 Screen Info Page
- **URL**: `/user-admin/screen-info/master.php`
- **Content Type**: Single organization information display (table format)
- **Components**:
  - "Screen Information" heading
  - Data table with organizational details:
    - **Name**: Organization name (CGSACS)
    - **Mobile**: Contact number (1234567890)
    - **Screen Slug**: URL-friendly identifier (cgsacs-hospital)
    - **User Name**: Admin username (Cgsacs Hospital)
    - **Password**: Account password (displayed as plain text in this interface)
    - **Screen Heading**: Organization title in regional language (छत्तीसगढ़ राज्य एड्स नियंत्रण समिति)
    - **Screen Logo**: Image/logo of organization (with image preview)
    - **Address**: Full address field
    - **WhatsApp No.**: Contact number
    - **Website Link**: Organization website URL
    - **Email Id**: Organization email (cgsacs@gmail.com)
  - **Update Button**: Top-right of table to save changes
- **Purpose**: Central repository for organizational metadata and branding information

### 3.4 Content Management Pages (Standard Template)
All the following pages follow an identical structure with minor content variations:

#### Common Elements (All Master Pages):
1. **Page Header**: Title (e.g., "Header Right Side Image", "Photo Gallery")
2. **Add Data Button**: Primary button to add new entries
   - Style: Blue/primary colored button with "Add Data" text and plus icon
   - Action: Opens modal/form to add new content

3. **Search & Filter Section**:
   - **Show entries dropdown**: Select number of records per page
     - Options: 25, 50, 100, 200, 400, All
   - **Search box**: Real-time search functionality to filter records

4. **Data Table**:
   - **Columns** (standard across all pages):
     - S.No. (sortable): Sequential number
     - Action: Dropdown button with edit/delete/view options
     - Content column (varies by page type):
       - **Header Right Side**: Image thumbnail
       - **Image Slider**: Banner image
       - **Notice Board**: Notice text/title
       - **News/Event Master**: News title/content
       - **Photo Gallery**: Photo thumbnail
       - **Video Gallery**: Video thumbnail
       - **Audio Master**: Audio file
       - **Footer Master**: Footer content
   - **Status Column**: Enable/Disable toggle (shows image indicator)
   - **Sorting**: Column headers are clickable for ascending/descending sort
   - **Data Display**: Each row shows one record entry

5. **Pagination**:
   - Shows "Showing 1 to X of Y entries"
   - Previous/Next buttons
   - Page number buttons (1, 2, 3, etc.)

### 3.5 Specific Master Pages

#### Header Right Side (Logo/Minister) Master
- **URL**: `/user-admin/screen_logo_or_minister/master.php`
- **Purpose**: Manage header images/logos displayed on public-facing site
- **Content**: Table with 4 entries (images)
- **Status**: All entries show "Enable" status with checkmark icon
- **Action Column**: Dropdown buttons for managing each entry (DO NOT CLICK)

#### Image Slider (Banner) Master
- **URL**: `/user-admin/screen_banner_master/master.php`
- **Purpose**: Manage carousel/slider banner images
- **Content Type**: Image uploads with display order/priority
- **Features**: Similar table structure to Header Right Side

#### Notice Board Master
- **URL**: `/user-admin/screen_notice_board/master.php`
- **Purpose**: Manage notice board announcements
- **Content Type**: Text notices with publish/expire dates
- **Features**: Standard table structure with notice text/titles

#### News/Event Master
- **URL**: `/user-admin/screen_news_master/master.php`
- **Purpose**: Manage news and event announcements
- **Content Type**: News articles with dates and descriptions
- **Features**: Standard table structure with news content

#### Photo Gallery Master
- **URL**: `/user-admin/screen_photo_gallery/master.php`
- **Purpose**: Manage photo gallery collections
- **Content Type**: Photo uploads with descriptions
- **Features**: Image thumbnail preview in table, folder/album organization

#### Video Gallery Master
- **URL**: `/user-admin/screen_video_gallery/master.php`
- **Purpose**: Manage video uploads/embeddings
- **Content Type**: Video files or YouTube/external video links
- **Features**: Video thumbnail/preview in table

#### Audio Master
- **URL**: `/user-admin/screen_for_audio/master.php`
- **Purpose**: Manage audio files and podcasts
- **Content Type**: MP3 or audio file uploads
- **Features**: Audio player integration, standard table structure

#### Section Show/Hide Master
- **URL**: `/user-admin/screen_show_section_master/master.php`
- **Purpose**: Toggle visibility of different sections on the public website
- **Content Type**: Boolean toggle switches for each section
- **Features**: Checkbox-style toggle for Enable/Disable each section
- **Sections Control**: Hide or show photo gallery, video gallery, news section, etc.

#### Template Preview Master
- **URL**: `/user-admin/screen_template_master/master.php`
- **Purpose**: Preview and configure website template/theme
- **Content Type**: Template selection and preview display
- **Features**: Display current template being used, switch between templates

#### Footer Master
- **URL**: `/user-admin/screen_footer_master/master.php`
- **Purpose**: Manage footer content and links
- **Content Type**: Footer text, links, social media information
- **Features**: Standard table structure for footer content items

---

## 4. Common UI/UX Patterns

### 4.1 Color Scheme & Styling
- **Primary Color**: Blue (buttons, active states)
- **Text Color**: Dark gray/black for readability
- **Border Colors**: Light gray for table borders
- **Background**: White with light gray alternating table rows
- **Hover Effects**: Slight color change/shadow on interactive elements

### 4.2 Button Actions (Not to be clicked during exploration)
Each row in master pages has an **Action button** (dropdown) that typically includes:
- **Edit**: Modify the entry
- **Delete**: Remove the entry
- **Disable**: Deactivate without deletion
- **View**: Preview the entry
- **Status Toggle**: Enable/Disable quick action

### 4.3 Form Modal/Dialog
When adding or editing data:
- **Modal overlay** on page
- **Form fields** specific to content type
- **Cancel button**: Close modal without saving
- **Submit/Save button**: Save changes and close modal
- **Required field validation**: Visual indicators for mandatory fields

### 4.4 Status Indicators
- **Enable status**: Green checkmark icon with "Enable" text
- **Disable status**: Red X icon with "Disable" text
- Used in tables to show current state of content items

---

## 5. Navigation Flow

### User Journey (Typical Admin Workflow):
1. **Login** → Enter credentials + CAPTCHA → Dashboard
2. **Dashboard** → View welcome message
3. **Manage Content** → Click menu items → See data table
4. **Add Content** → Click "Add Data" → Fill form → Submit
5. **Edit Content** → Click "Action" → "Edit" → Modify → Save
6. **Delete Content** → Click "Action" → "Delete" → Confirm
7. **Logout** → Click "Logout" → Session ended → Return to login

---

## 6. Data Management Features

### 6.1 CRUD Operations Supported
- **Create**: "Add Data" button for new entries
- **Read**: Display in data tables with search
- **Update**: Edit existing entries via Action dropdown
- **Delete**: Remove entries via Action dropdown

### 6.2 Search & Filter
- Real-time search across displayed records
- Filters by keyword/text matching content

### 6.3 Pagination
- Default entries per page: 25
- Customizable entries per page (25, 50, 100, 200, 400, All)
- Previous/Next/Page number navigation

### 6.4 Sorting
- Click column headers to sort ascending/descending
- Applied to numeric (S.No.) and text columns

---

## 7. Technical Considerations

### 7.1 Backend Architecture (Current)
- PHP-based application
- Multi-tenant support (multiple organizations/sub-accounts)
- Session-based authentication
- CAPTCHA for login security
- Database storing organization info and content

### 7.2 Frontend Components
- Responsive sidebar navigation
- Data tables with sorting/filtering/pagination
- Modal dialogs for forms
- Status indicators/badges
- Image preview support
- Icon usage (menu icons, action icons)

### 7.3 API/Data Structure (Inferred)
Each master page likely has:
- API endpoint for listing: GET `/api/endpoint/list`
- API endpoint for adding: POST `/api/endpoint/create`
- API endpoint for editing: PUT `/api/endpoint/update/{id}`
- API endpoint for deleting: DELETE `/api/endpoint/delete/{id}`
- Search parameter support in list endpoints

---

## 8. Key Features to Replicate

### Must-Have Features:
1. ✅ Multi-user login system with CAPTCHA
2. ✅ Sidebar navigation menu
3. ✅ Organization information management
4. ✅ Master data pages (12 different types)
5. ✅ CRUD operations for all master pages
6. ✅ Search functionality
7. ✅ Pagination with configurable page size
8. ✅ Column sorting
9. ✅ Enable/Disable status toggle
10. ✅ File/Image upload support (for galleries and headers)

### Nice-to-Have Features:
1. 📋 Bulk operations (delete multiple items)
2. 📅 Date range filtering
3. 🔐 Role-based permissions (Admin vs Manager)
4. 📊 Dashboard statistics/analytics
5. 🔔 Activity logging
6. 📧 Email notifications
7. 🌐 Multi-language support (currently has Hindi text)

---

## 9. Content Types Summary

| Module | Purpose | Content Type | Key Fields |
|--------|---------|--------------|-----------|
| Screen Info | Org. metadata | Text/Config | Name, Mobile, Email, Logo, Address |
| Header Right | Logo/Minister | Images | Image, Title, Order |
| Image Slider | Banners | Images | Image, Caption, URL, Order |
| Notice Board | Announcements | Text | Notice, Date, Expiry |
| News/Event | News items | Text/Media | Title, Description, Date, Image |
| Photo Gallery | Photos | Images | Photo, Album, Description |
| Video Gallery | Videos | Video Links | Video URL, Title, Description |
| Audio Master | Audio files | Audio | Audio file, Title, Description |
| Section Toggle | Visibility | Boolean | Section Name, Enabled/Disabled |
| Template | Theme config | Selection | Template Name, Settings |
| Footer | Footer text | Text/Links | Content, Links, Social Media |

---

## 10. Implementation Recommendations

### Technology Stack (Recommended for Replication):
- **Frontend**: React/Vue.js + TypeScript + Tailwind CSS
- **Backend**: Node.js/Express or Python/Django
- **Database**: PostgreSQL or MongoDB
- **Authentication**: JWT tokens + CAPTCHA library
- **File Storage**: AWS S3 or local file system

### Phase 1: Core Components
1. Authentication system with CAPTCHA
2. Dashboard layout and navigation
3. Basic data table component (reusable)

### Phase 2: Content Management
4. All 12 master pages with CRUD
5. File upload functionality
6. Search and filtering

### Phase 3: Enhancement
7. Advanced features (bulk operations, analytics, etc.)
8. Responsive design optimization
9. Performance optimization

---

## 11. UI Components to Build

### Reusable Components:
1. **LoginForm**: Username, Password, CAPTCHA, Submit button
2. **Sidebar**: Navigation menu with collapsible sections
3. **DataTable**: Sortable, searchable, paginated table component
4. **ActionDropdown**: Menu with Edit, Delete, Enable/Disable options
5. **Modal/Dialog**: For forms and confirmations
6. **SearchBox**: Real-time search input
7. **PaginationControl**: Previous/Next/Page number buttons
8. **StatusBadge**: Enable/Disable indicator
9. **ImageUpload**: File upload with preview
10. **NavLink**: Sidebar navigation links

---

## 12. Important Notes

### Do Not Include (User Preference):
- ❌ Click on Update/Delete/Disable buttons during initial exploration
- ❌ Actually add, modify, or delete data entries
- ❌ Perform irreversible data changes

### Website Characteristics:
- **Simplicity**: Very straightforward CRUD interface
- **Purpose-built**: Specifically designed for hospital/organization content management
- **Multi-tenant**: Supports multiple organizations from one deployment
- **Hindi Support**: Includes Hindi language text and content
- **Localized**: Appears to be built for Indian healthcare institutions

---

## 13. Additional Context

### Target Users:
- Hospital administrators
- Organization content managers
- IT support staff

### Use Cases:
- Hospital information management
- Patient notice boards
- News/event announcements
- Photo/video/audio content management
- Website template management
- Footer and branding information

### Public-Facing Components (Inferred):
The admin panel manages content that appears on:
- Hospital website homepage
- Public information sections
- Patient portal sections
- News/announcement boards

---

This comprehensive prompt provides all necessary details to accurately replicate the EGDrishti admin dashboard system with all its functionality, layout patterns, and content management capabilities.
