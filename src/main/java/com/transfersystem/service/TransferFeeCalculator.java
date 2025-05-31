package com.transfersystem.service;

import com.transfersystem.dto.ContractClauseDto;
import com.transfersystem.model.Club;
import com.transfersystem.model.Player;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransferFeeCalculator {

    private static final BigDecimal DEFAULT_BASE_FEE = new BigDecimal("1000000");

    public BigDecimal calculate(Player player, Club buyer, List<ContractClauseDto> clauses) {
        BigDecimal totalFee = BigDecimal.ZERO;

        BigDecimal baseFee = player.getCurrentMarketValue();
        if (baseFee == null) {
            baseFee = DEFAULT_BASE_FEE;
        }
        totalFee = totalFee.add(baseFee); // Add base fee to total initially

        if (clauses != null && !clauses.isEmpty()) {
            for (ContractClauseDto clauseDto : clauses) {
                if ("SELL_ON".equalsIgnoreCase(clauseDto.getType()) && clauseDto.getPercentage() != null) {
                    BigDecimal sellOnFee = baseFee.multiply(clauseDto.getPercentage()).divide(new BigDecimal("100"));
                    totalFee = totalFee.add(sellOnFee);
                } else if (clauseDto.getAmount() != null) {
                    totalFee = totalFee.add(clauseDto.getAmount());
                }
            }
        }

        return totalFee;
    }
}
