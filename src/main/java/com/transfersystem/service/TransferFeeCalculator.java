package com.transfersystem.service;

import com.transfersystem.model.Club;
import com.transfersystem.model.ContractClause;
import com.transfersystem.model.Player;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransferFeeCalculator {

    private static final BigDecimal DEFAULT_BASE_FEE = new BigDecimal("1000000");

    public BigDecimal calculate(Player player, Club buyer, List<ContractClause> clauses) {
        BigDecimal totalFee = BigDecimal.ZERO;

        BigDecimal baseFee = player.getCurrentMarketValue();
        if (baseFee == null) {
            baseFee = DEFAULT_BASE_FEE;
        }
        totalFee = totalFee.add(baseFee); // Add base fee to total initially

        if (clauses != null && !clauses.isEmpty()) {
            for (ContractClause clause : clauses) {
                if ("SELL_ON".equalsIgnoreCase(clause.getType()) && clause.getPercentage() != null) {
                    BigDecimal sellOnFee = baseFee.multiply(clause.getPercentage()).divide(new BigDecimal("100"));
                    totalFee = totalFee.add(sellOnFee);
                } else if (clause.getAmount() != null) {
                    totalFee = totalFee.add(clause.getAmount());
                }
            }
        }

        return totalFee;
    }
}
