# Football Transfer Management System - Frontend

This is the frontend application for the Football Transfer Management System, built with React. It provides a user interface to manage football (soccer) player transfers between clubs, as well as manage players and clubs themselves.

## Features

*   View a list of ongoing and completed transfers.
*   Initiate new player transfers.
*   Update the status of transfers through a defined workflow (e.g., submit, negotiate, approve, complete, cancel).
*   View details of individual transfers, including contract clauses.
*   Manage players: Create, view, edit, and delete player profiles.
*   Manage clubs: Create, view, edit, and delete club profiles.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (LTS version recommended, e.g., v18.x or v20.x)
*   [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)

## Installation

1.  **Navigate to the frontend directory:**
    If you are in the root of the project, run:
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

## Running the Development Server

1.  **Ensure the Backend is Running:**
    This frontend application requires the backend Java Spring Boot application to be running, as it makes API calls to it. By default, the backend is expected to be running on `http://localhost:8080`. Refer to the main project README for instructions on running the backend.

2.  **Start the React development server:**
    Make sure you are in the `frontend` directory.
    Using npm:
    ```bash
    npm start
    ```
    Or using yarn:
    ```bash
    yarn start
    ```
    This will typically open the application in your default web browser at `http://localhost:3000`. If this port is in use, `create-react-app` (or the underlying tool if CRA was not used) will offer to run it on an alternative port.

    The application will automatically reload if you make changes to the code. You will also see any lint errors in the console.

## Available Scripts

In the `frontend` project directory, you can run:

### `npm start` or `yarn start`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test` or `yarn test`

Launches the test runner in interactive watch mode. (Note: No tests have been added in this initial setup).

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.

### `npm run eject` or `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**
If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project. It's generally not recommended unless you have specific customization needs.

## Proxying API Requests in Development

To simplify development and avoid CORS (Cross-Origin Resource Sharing) issues when the frontend (e.g., on port 3000) calls the backend (e.g., on port 8080), this application is configured to proxy API requests.

The `proxy` setting in `frontend/package.json` (e.g., `"proxy": "http://localhost:8080"`) tells the development server to proxy any unrecognized requests to your Spring Boot backend. This means you can make API calls like `fetch('/api/v1/transfers')` directly, and the development server will handle forwarding them to `http://localhost:8080/api/v1/transfers`.

This is a development-only feature. For production, you'll need to configure your production server (e.g., Nginx, Apache) or the Spring Boot application itself to handle requests from the domain where your frontend is hosted (e.g., by configuring CORS on the backend).
