package com.transfersystem.dto;

import java.math.BigDecimal;

public class ContractClauseDto {

    private String type;
    private BigDecimal percentage;
    private BigDecimal amount;

    public ContractClauseDto() {
    }

    public ContractClauseDto(String type, BigDecimal percentage, BigDecimal amount) {
        this.type = type;
        this.percentage = percentage;
        this.amount = amount;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
