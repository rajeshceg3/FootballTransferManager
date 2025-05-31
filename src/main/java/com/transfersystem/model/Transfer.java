package com.transfersystem.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
public class Transfer {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @NotNull
    private Long playerId;

    @NotNull
    private Long fromClubId;

    @NotNull
    private Long toClubId;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TransferStatus status;

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public Long getFromClubId() {
        return fromClubId;
    }

    public void setFromClubId(Long fromClubId) {
        this.fromClubId = fromClubId;
    }

    public Long getToClubId() {
        return toClubId;
    }

    public void setToClubId(Long toClubId) {
        this.toClubId = toClubId;
    }

    public TransferStatus getStatus() {
        return status;
    }

    public void setStatus(TransferStatus status) {
        this.status = status;
    }
}
