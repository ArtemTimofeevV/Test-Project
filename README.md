# Telegram Report Bot

This is a Telegram bot designed for users to create and submit reports, and for administrators to view and manage these reports.

## Features

### For Users:
- **Registration**: New users can register by providing their name and date of birth.
- **Create Reports**: Users can create reports with a title, description, pros, cons, and a task period (start and end date).
- **Confirmation and Editing**: Before a report is saved, users can review it and choose to edit any field if needed.

### For Administrators:
- **Admin Registration**: Administrators can register using a secret access key.
- **View Reports**: Admins have multiple ways to view reports:
    - **By Tag**: View all reports from a specific user by selecting their Telegram @username.
    - **By Name**: View all reports from a specific user by selecting their last name and then their first name.
    - **By Date**: View all reports that fall within a specific date range.
    - **All Reports**: View all reports from all users, sorted by creation date.
- **Easy Navigation**: A `/back` button is available in all admin menus to easily return to the main menu.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Database Setup:**
    - Make sure you have a PostgreSQL server running.
    - Create a new database.
    - Execute the `database.sql` file to create the necessary tables (`users` and `reports`).

4.  **Environment Variables:**
    - Create a `.env` file in the root of the project (`BotTelegram/`).
    - Add the following environment variables to the `.env` file:

    ```
    BOT_API_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
    ADMIN_ACCESS_KEY=YOUR_SECRET_ADMIN_KEY
    DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
    ```

    - **`BOT_API_TOKEN`**: Your Telegram bot token from BotFather.
    - **`ADMIN_ACCESS_KEY`**: A secret key of your choice for administrator registration.
    - **`DATABASE_URL`**: The connection string for your PostgreSQL database.

## Usage

1.  **Build the project:**
    ```bash
    npm run build
    ```

2.  **Start the bot:**
    ```bash
    npm start
    ```

3.  **Interact with the bot on Telegram:**
    - Find your bot on Telegram and send the `/start` command to begin.

## Project Structure

```
BotTelegram/
├── dist/                 # Compiled JavaScript files
├── node_modules/         # Node.js modules
├── src/                  # TypeScript source code
│   ├── main.ts           # Main application logic
│   ├── config.ts         # Configuration loader
│   └── db.ts             # Database connection setup
├── .env                  # Environment variables (needs to be created)
├── database.sql          # Database schema
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript compiler options
```
