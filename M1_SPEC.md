# Campus Life Planner- Project Specification
## 1. Problem Statement

As students, we have to manage many responsibilities such as assignments, campus activities and deadlines among others. Sometimes we get overwhelmed and might fail to plan everything as it should. Failure to organise those activities accordingly might result in chaos (missing deadlines, difficulties in time management). This is where the Campus Life Planner comes in.

The Campus Life Planner is a web application that will provide students with a simple and easy way to record, organise and plan their campus related activities. The information that will be recorded includes: title, due date, tag and duration. The application will also enable searching, sorting, tracking and managing activities in one place.

## 2. Project Goals

The Campus Life Planner aims at:
- Providing assistance to the students in organising their campus activities.
- Allowing students to create, edit and delete activity records.
- Allowing students to search for their records using regular expressions.
- Providing useful statistics about the student's activities and time.
- Saving records to avoid loss of information.
- Allowing students to import and export data using JSON.
- Providing a user friendly and accessible application to students.
- Providing a responsive interface that works on different devices (desktops, tablets, smartphones).

## 3. Data Model

The Campus Life Planner will store each activity as a record. Every
record will have a unique ID so that individual activities can be
identified and managed.

Each record will contain the following fields:

| Field | Type | Description |
|---|---|---|
| id | String | Unique identifier for the record |
| title | String | Name or description of the activity |
| dueDate | String | Date when the activity is due |
| duration | Number | Amount of time required for the activity |
| tag | String | Category or label used to organize the activity |
| createdAt | String | Date and time when the record was created |
| updatedAt | String | Date and time when the record was last updated |

## 4. Main Application Sections

The Campus Life Planner will contain the following main sections:

### About

This section will briefly explain the purpose of the Campus Life
Planner and how students can use it.

### Dashboard / Statistics

This section will display useful information about the user's
activities, including the total number of records, total duration,
most common tag, and activity trends.

### Records

This section will display the student's activities in a table or
card-based layout. Users will be able to sort, search, edit, and delete
records.

### Add / Edit Form

This section will allow users to create new activities and edit
existing activities. The form will collect the title, due date,
duration, and tag.

### Settings

This section will contain application settings and options for
managing stored data, including JSON import and export.

## 5. Wireframe

The application will use a mobile-first layout.

### Mobile Layout

+---------------------------+
| Campus Life Planner       |
| Navigation                |
+---------------------------+
| Dashboard / Statistics    |
+---------------------------+
| Search                    |
+---------------------------+
| Add Activity              |
+---------------------------+
| Activity Records          |
|                           |
| [Activity Card]           |
| [Activity Card]           |
| [Activity Card]           |
+---------------------------+
| Settings                  |
+---------------------------+

### Desktop Layout

+------------------------------------------------------+
| Campus Life Planner              Navigation          |
+------------------------------------------------------+
| Dashboard / Statistics                               |
+------------------------------------------------------+
| Search                                               |
+-------------------------+----------------------------+
| Activity Records        | Add / Edit Activity        |
|                         |                            |
| Record                  | Title                      |
| Record                  | Due Date                   |
| Record                  | Duration                   |
| Record                  | Tag                        |
|                         | [Save]                     |
+-------------------------+----------------------------+
| Settings                                             |
+------------------------------------------------------+

## 6. Accessibility Plan

The Campus Life Planner will be designed to be accessible and easy to
use for different users.

The application will:

- Use semantic HTML elements where appropriate to give the page a clear
  structure.
- Provide labels for all form inputs so users can understand what
  information is required.
- Make sure interactive elements such as buttons and links can be
  accessed using the keyboard.
- Use visible focus states so keyboard users can identify the element
  they are currently using.
- Use sufficient colour contrast between text and backgrounds.
- Avoid using colour as the only way to communicate information.
- Provide meaningful text for buttons and controls.
- Use ARIA where necessary, including an ARIA live region for important
  updates such as statistics or validation messages.
- Make validation messages clear and understandable.
- Ensure the layout remains usable on different screen sizes.
- Use appropriate heading levels to create a logical page structure.

## 7. Technology and Constraints

- The application will be built using vanilla HTML, CSS, and JavaScript.
- The project will not use frontend frameworks. The application will use JavaScript for DOM manipulation, events, validation, searching, statistics, and data management.
- Local storage will be used to persist the user's records in the browser. JSON will be used for importing and exporting planner data.
- The application will follow a mobile-first responsive approach and will be tested on mobile, tablet, and desktop screen sizes.
