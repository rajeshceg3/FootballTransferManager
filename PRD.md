# Product Requirements Document: Football Player Transfer Management System

## 1. Introduction

This document outlines the requirements for the Football Player Transfer Management System. This system will facilitate the process of managing football player transfers between clubs, including tracking transfer statuses, fees, and contract clauses.

## 2. Executive Summary

The Football Player Transfer Management System is a backend application designed to streamline and manage the complex process of player transfers in the football world. It will provide functionalities for initiating transfers, managing their lifecycle through various stages (e.g., negotiation, approval, completion), calculating transfer fees based on player valuation and contract clauses, and ensuring data integrity throughout the process. The system aims to be a reliable and efficient platform for clubs and administrative bodies involved in player transfers.

## 3. Goals

-   To provide a centralized system for managing football player transfers.
-   To automate the tracking of transfer statuses and workflows.
-   To accurately calculate transfer fees, considering player market value and contractual clauses.
-   To ensure data consistency and reliability for all stakeholders.
-   To offer a scalable and maintainable solution.

## 4. Target Users

-   Club Representatives
-   Player Agents
-   League Administrators

## 5. Functional Requirements

### 5.1. Core Entities

The system will manage the following core entities:

-   **Player**:
    -   Attributes: `id` (Long, PK), `name` (String, NotNull), `currentMarketValue` (BigDecimal), `currentClubId` (Long, FK to Club)
    -   Represents a football player.
-   **Club**:
    -   Attributes: `id` (Long, PK), `name` (String, NotNull)
    -   Represents a football club.
-   **Transfer**:
    -   Attributes: `id` (UUID, PK), `playerId` (Long, FK to Player, NotNull), `fromClubId` (Long, FK to Club, NotNull), `toClubId` (Long, FK to Club, NotNull), `status` (Enum: `DRAFT`, `SUBMITTED`, `NEGOTIATION`, `APPROVED`, `COMPLETED`, NotNull).
    -   Represents a transfer request/process.
-   **ContractClause**:
    -   Attributes: `type` (String, e.g., "SELL_ON", "BUYOUT_CLAUSE", "PERFORMANCE_BONUS"), `percentage` (BigDecimal, nullable), `amount` (BigDecimal, nullable).
    -   This is not an entity to be stored directly in its own table via JPA for this version. Instead, it will be part of request DTOs and used by the `TransferFeeCalculator`. For simplicity in the initial version, a `Transfer` will not directly hold a list of `ContractClause` entities.

### 5.2. System Services

-   **TransferWorkflowEngine**:
    -   Manages the state transitions of a `Transfer` (e.g., DRAFT -> SUBMITTED, SUBMITTED -> NEGOTIATION, NEGOTIATION -> APPROVED, APPROVED -> COMPLETED).
    -   Throws `IllegalStateException` if an invalid transition is attempted.
-   **TransferFeeCalculator**:
    -   Calculates the total transfer fee for a player.
    -   Input: `Player`, `Club` (buyer), `List<ContractClause>`.
    -   Logic (Basic Version):
        -   Starts with a `baseFee` (e.g., `player.getCurrentMarketValue()` or a default if null).
        -   Iterates through `clauses`:
            -   If clause `type` is "SELL_ON" and `percentage` is present, adds `baseFee * percentage / 100` to total.
            -   If `amount` is present in a clause, adds it to total.
        -   Returns `BigDecimal` total fee.

### 5.3. API Endpoints

#### 5.3.1. Initiate Transfer

-   **Endpoint**: `POST /api/v1/transfers`
-   **Request Body DTO (`InitiateTransferRequest`)**:
    ```java
    public class InitiateTransferRequest {
        private Long playerId;
        private Long fromClubId;
        private Long toClubId;
        private List<ContractClauseDto> clauses; // Clauses relevant to this potential transfer
    }

    public class ContractClauseDto { // For request/response, not a JPA entity
        private String type;
        private BigDecimal percentage;
        private BigDecimal amount;
    }
    ```
-   **Functionality**:
    1.  Validates that `Player`, `fromClub`, and `toClub` exist.
    2.  Creates a new `Transfer` entity.
    3.  Sets its `playerId`, `fromClubId`, `toClubId`.
    4.  Sets initial status to `DRAFT`.
    5.  Saves the `Transfer`.
    6.  Returns the created `Transfer` object (HTTP 201).
    *(Clauses from the request are not directly stored on the Transfer entity in this version but would be available for other services like fee calculation if needed immediately or in subsequent calls).*

#### 5.3.2. Update Transfer Status (Example: Submit)

-   **Endpoint**: `PATCH /api/v1/transfers/{transferId}/submit`
-   **Functionality**:
    1.  Finds the `Transfer` by `transferId`.
    2.  Uses `TransferWorkflowEngine` to change status from `DRAFT` to `SUBMITTED`.
    3.  Returns the updated `Transfer`.
    *(Similar PATCH endpoints for `negotiate`, `approve`, `complete`)*

#### 5.3.3. Get Transfer Details

-   **Endpoint**: `GET /api/v1/transfers/{transferId}`
-   **Functionality**:
    1.  Retrieves and returns the `Transfer` by `transferId`.

#### 5.3.4. Calculate Transfer Fee (Illustrative, might not be a direct POST endpoint for calculation itself initially)

-   While the `TransferFeeCalculator` service exists, exposing it directly via a "calculate-only" endpoint might not be the primary flow. Fee calculation would typically be part of a broader business process (e.g., when a transfer reaches a certain stage or as part of generating a transfer agreement document).
-   However, for testing or specific use cases, an endpoint could be:
    -   **Endpoint**: `POST /api/v1/transfers/calculate-fee`
    -   **Request Body**: Could be similar to `InitiateTransferRequest` or a dedicated DTO containing `playerId`, `buyerClubId`, and `clauses`.
    -   **Response**: `BigDecimal` (the calculated fee).

## 6. Non-Functional Requirements

-   **Performance**: APIs should respond within 500ms under normal load.
-   **Scalability**: The system should be designed to handle an increasing number of users and transfers.
-   **Reliability**: The system should be highly available with minimal downtime.
-   **Security**: Sensitive data should be protected; proper authentication and authorization mechanisms (to be detailed in a future version).
-   **Maintainability**: Code should be well-documented, tested, and follow best practices.

## 7. Data Model (JPA Entities - Simplified)

```java
// Player.java
@Entity
public class Player {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    private String name;
    private BigDecimal currentMarketValue;
    private Long currentClubId; // In a real system, this would be @ManyToOne Club currentClub;
    // getters, setters
}

// Club.java
@Entity
public class Club {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    private String name;
    // getters, setters
}

// Transfer.java
@Entity
public class Transfer {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id; // Using UUID for transfer IDs

    @NotNull
    private Long playerId; // @ManyToOne Player player;
    @NotNull
    private Long fromClubId; // @ManyToOne Club fromClub;
    @NotNull
    private Long toClubId; // @ManyToOne Club toClub;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TransferStatus status;
    // getters, setters
}

// TransferStatus.java (Enum)
public enum TransferStatus {
    DRAFT, SUBMITTED, NEGOTIATION, APPROVED, COMPLETED
}
```
*(Note: For simplicity, direct `@ManyToOne` relationships are represented as `Long` foreign key IDs in the entities for this iteration. Full relational mapping can be an enhancement.)*

## 8. Future Considerations / Enhancements

-   Full relational mapping for entities (`@ManyToOne`, `@OneToMany`).
-   Direct storage of `ContractClause` entities linked to a `Transfer` if complex queries on clauses are needed.
-   User authentication and authorization (e.g., Spring Security).
-   Integration with external financial systems.
-   Audit logging for all state changes and critical operations.
-   Asynchronous processing for long-running tasks (e.g., notifications).
-   More sophisticated fee calculation rules.
-   Internationalization.

## 9. Out of Scope (for initial version)

-   User Interface (UI).
-   Direct communication/notification system between clubs/agents.
-   Document management for transfer contracts.
-   Advanced analytics and reporting.
-   Player scouting and talent identification features.
```
