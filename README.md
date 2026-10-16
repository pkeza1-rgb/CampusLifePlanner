# Campus Life Planner

Campus Life Planner is a responsive web application designed to help students organise their academic tasks and campus activities in one place. It provides a simple interface for managing deadlines, tracking time, and staying organised.

## Features

- **Activity management:** Add, edit, and delete activities with a title, due date, duration, and tag.
- **Dashboard:** View activity statistics, total planned time, weekly duration, and your most frequently used tag.
- **Search and sorting:** Search activities using regular expressions, optionally ignore letter case, and sort by title, due date, or duration.
- **Input validation:** Validate activity details, including dates, duration limits, tag formats, and repeated words in titles.
- **Local storage:** Save activities, weekly targets, and display preferences in the browser.
- **Import and export:** Export activities as JSON and import valid JSON data without replacing existing activities.
- **Duration tools:** Set a weekly duration cap, choose how durations are displayed, and convert minutes into hours.
- **Responsive design:** Adapt the interface to desktop, tablet, and mobile screens.
- **Accessibility:** Include semantic page structure, keyboard navigation, visible focus indicators, a skip link, and status messages for users.
- **User-friendly interface:** Use dashboard navigation, interactive controls, and visual feedback to support everyday planning.

## Technologies Used

- HTML5 — page structure and semantic elements.
- CSS3 — responsive layouts, styling, transitions, and accessibility-focused states.
- JavaScript — application logic, DOM manipulation, regular expressions, validation, and event handling.
- Local Storage — persistence of activities and preferences.
- JSON — activity data import and export.

## Getting Started

1. Clone or download this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` in a browser, or run it using the VS Code Live Server extension.
4. Start adding and organising your activities.

No backend server or database is required for the application's local browser functionality.

## Data and Privacy

Activities and preferences are stored in the browser's local storage. Export your activities regularly if you want a separate backup. Imported JSON data must follow the application's expected activity format and validation rules.

## Project Structure

```text
CampusLifePlanner/
├── reports/
│   └── AI_Usage_report
├── scripts/
│   └── main.js
├── styles/
│   └── style.css
├── M1_SPEC.md
├── README.md
├── index.html
├── seed.json
└── tests.html
```

## Project Goal

Campus Life Planner demonstrates the use of HTML, CSS, and JavaScript to build a practical, responsive, and accessible student productivity application.

**Developer:** Paradis Ange Keza

**Repository:** []

**Live Application:** [Add your GitHub Pages URL, if deployed]

