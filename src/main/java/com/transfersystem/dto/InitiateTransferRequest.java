package com.transfersystem.dto;

import java.util.List;

public class InitiateTransferRequest {

    private Long playerId;
    private Long fromClubId;
    private Long toClubId;
    private List<ContractClauseDto> clauses;

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

    public List<ContractClauseDto> getClauses() {
        return clauses;
    }

    public void setClauses(List<ContractClauseDto> clauses) {
        this.clauses = clauses;
    }
}
