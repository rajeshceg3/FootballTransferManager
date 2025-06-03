package com.transfersystem.dto;

import java.math.BigDecimal;

public class PlayerDTO {
    private Long id;
    private String name;
    private BigDecimal currentMarketValue;
    private Long currentClubId; // To link to Club by ID

    // Constructors
    public PlayerDTO() {
    }

    public PlayerDTO(Long id, String name, BigDecimal currentMarketValue, Long currentClubId) {
        this.id = id;
        this.name = name;
        this.currentMarketValue = currentMarketValue;
        this.currentClubId = currentClubId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getCurrentMarketValue() {
        return currentMarketValue;
    }

    public void setCurrentMarketValue(BigDecimal currentMarketValue) {
        this.currentMarketValue = currentMarketValue;
    }

    public Long getCurrentClubId() {
        return currentClubId;
    }

    public void setCurrentClubId(Long currentClubId) {
        this.currentClubId = currentClubId;
    }
}
