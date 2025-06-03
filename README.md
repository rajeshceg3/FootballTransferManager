# Football Player Transfer Management System

## Overview
The Football Player Transfer Management System is a backend application designed to manage the process of player transfers between football clubs. It aims to provide a robust platform for initiating, tracking, and finalizing player transfers, including handling transfer fees, contract clauses, and workflow states. This system will serve as the core engine for managing the complexities of player movements in the football world.

## Technologies Used
- Java 17
- Spring Boot 3.2.0
  - Spring Web
  - Spring Data JPA
- H2 Database (for local development/testing)
- Maven

## Prerequisites
- JDK 17 or later (Download from [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or [OpenJDK](https://openjdk.java.net/projects/jdk/17/))
- Maven 3.6+ (Download from [Apache Maven](https://maven.apache.org/download.cgi))

## How to Clone
```bash
git clone https://github.com/your-username/football-transfer-system.git
cd football-transfer-system
```
*(Replace `https://github.com/your-username/football-transfer-system.git` with the actual repository URL)*

## How to Run Locally
1.  Ensure you have JDK 17 and Maven installed and configured correctly.
2.  Navigate to the project's root directory (where `pom.xml` is located).
3.  Run the application using Maven:
    ```bash
    mvn spring-boot:run
    ```
4.  The application will start, and by default, it will be accessible at `http://localhost:8080`.

## How to Run Tests
To execute the unit and integration tests for the application:
1.  Navigate to the project's root directory.
2.  Run the following Maven command:
    ```bash
    mvn test
    ```
    Test results will be displayed in the console, and detailed reports can be found in the `target/surefire-reports` directory.

## Available API Endpoints

### Initiate Transfer
-   **Endpoint**: `POST /api/v1/transfers`
-   **Description**: Initiates a new player transfer request. It creates a transfer record in a `DRAFT` state.
-   **Request Body Example**:
    ```json
    {
        "playerId": 1,
        "fromClubId": 101,
        "toClubId": 102,
        "clauses": [
            {
                "type": "SELL_ON",
                "percentage": 15.00
            },
            {
                "type": "SIGNING_BONUS",
                "amount": 50000.00
            }
        ]
    }
    ```
    *(Note: `clauses` are currently used for fee calculation if applicable but not directly stored as a list within the `Transfer` entity itself in the initial version. The DTO `ContractClauseDto` is used for request payload).*

### Get Transfer Details
-   **Endpoint**: `GET /api/v1/transfers/{transferId}`
-   **Description**: Retrieves the details of a specific transfer.
-   **Path Variable**:
    -   `transferId` (UUID): The unique identifier of the transfer.

### Submit Transfer for Review
-   **Endpoint**: `PATCH /api/v1/transfers/{transferId}/submit`
-   **Description**: Moves a transfer from `DRAFT` to `SUBMITTED` status.
-   **Path Variable**:
    -   `transferId` (UUID): The unique identifier of the transfer.

### Move Transfer to Negotiation
-   **Endpoint**: `PATCH /api/v1/transfers/{transferId}/negotiate`
-   **Description**: Moves a transfer from `SUBMITTED` to `NEGOTIATION` status.
-   **Path Variable**:
    -   `transferId` (UUID): The unique identifier of the transfer.

### Approve Transfer
-   **Endpoint**: `PATCH /api/v1/transfers/{transferId}/approve`
-   **Description**: Moves a transfer from `NEGOTIATION` to `APPROVED` status.
-   **Path Variable**:
    -   `transferId` (UUID): The unique identifier of the transfer.

### Complete Transfer
-   **Endpoint**: `PATCH /api/v1/transfers/{transferId}/complete`
-   **Description**: Moves a transfer from `APPROVED` to `COMPLETED` status. This also updates the player's current club and adjusts club budgets based on the transfer fee.
-   **Path Variable**:
    -   `transferId` (UUID): The unique identifier of the transfer.

### Cancel Transfer
-   **Endpoint**: `PATCH /api/v1/transfers/{transferId}/cancel`
-   **Description**: Moves a transfer to `CANCELED` status from an active state (e.g., `DRAFT`, `SUBMITTED`, `NEGOTIATION`, `APPROVED`).
-   **Path Variable**:
    -   `transferId` (UUID): The unique identifier of the transfer.

### Player Management

#### Create Player
-   **Endpoint**: `POST /api/v1/players`
-   **Description**: Creates a new player.
-   **Request Body Example**:
    ```json
    {
        "name": "John Doe",
        "currentMarketValue": 1000000.00,
        "currentClubId": 1
    }
    ```
    *(Note: `currentClubId` is optional. If provided, the player will be associated with the existing club with that ID.)*

#### Get All Players
-   **Endpoint**: `GET /api/v1/players`
-   **Description**: Retrieves a list of all players.

#### Get Player by ID
-   **Endpoint**: `GET /api/v1/players/{playerId}`
-   **Description**: Retrieves a specific player by their ID.
-   **Path Variable**:
    -   `playerId` (Long): The unique identifier of the player.

#### Update Player
-   **Endpoint**: `PUT /api/v1/players/{playerId}`
-   **Description**: Updates an existing player's details.
-   **Path Variable**:
    -   `playerId` (Long): The unique identifier of the player.
-   **Request Body Example**:
    ```json
    {
        "name": "John Doe Updated",
        "currentMarketValue": 1200000.00,
        "currentClubId": 2
    }
    ```

#### Delete Player
-   **Endpoint**: `DELETE /api/v1/players/{playerId}`
-   **Description**: Deletes a player by their ID.
-   **Path Variable**:
    -   `playerId` (Long): The unique identifier of the player.


### Club Management

#### Create Club
-   **Endpoint**: `POST /api/v1/clubs`
-   **Description**: Creates a new club.
-   **Request Body Example**:
    ```json
    {
        "name": "FC Example",
        "budget": 50000000.00
    }
    ```

#### Get All Clubs
-   **Endpoint**: `GET /api/v1/clubs`
-   **Description**: Retrieves a list of all clubs.

#### Get Club by ID
-   **Endpoint**: `GET /api/v1/clubs/{clubId}`
-   **Description**: Retrieves a specific club by its ID.
-   **Path Variable**:
    -   `clubId` (Long): The unique identifier of the club.

#### Update Club
-   **Endpoint**: `PUT /api/v1/clubs/{clubId}`
-   **Description**: Updates an existing club's details.
-   **Path Variable**:
    -   `clubId` (Long): The unique identifier of the club.
-   **Request Body Example**:
    ```json
    {
        "name": "FC Example United",
        "budget": 55000000.00
    }
    ```

#### Delete Club
-   **Endpoint**: `DELETE /api/v1/clubs/{clubId}`
-   **Description**: Deletes a club by its ID.
-   **Path Variable**:
    -   `clubId` (Long): The unique identifier of the club.

## Project Structure
The project follows a standard layered architecture commonly used in Spring Boot applications:
-   `com.transfersystem.controller`: Contains REST API controllers that handle incoming HTTP requests and delegate to services.
    -   `GlobalExceptionHandler.java`: Handles exceptions globally and maps them to appropriate HTTP responses.
-   `com.transfersystem.dto`: Data Transfer Objects used for request and response payloads to shape data for the API.
-   `com.transfersystem.model`: JPA entities representing the data model (e.g., `Player`, `Club`, `Transfer`) and enums like `TransferStatus`.
-   `com.transfersystem.repository`: Spring Data JPA repositories for database interactions.
-   `com.transfersystem.service`: Contains business logic and services (e.g., `TransferWorkflowEngine`, `TransferFeeCalculator`).

This structure helps in separating concerns and maintaining a clean codebase.