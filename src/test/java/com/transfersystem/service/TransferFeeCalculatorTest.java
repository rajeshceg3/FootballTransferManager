package com.transfersystem.service;

import com.transfersystem.model.Club;
import com.transfersystem.model.ContractClause;
import com.transfersystem.model.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TransferFeeCalculatorTest {

    private TransferFeeCalculator transferFeeCalculator;
    private Player player;
    private Club buyerClub;

    @BeforeEach
    void setUp() {
        transferFeeCalculator = new TransferFeeCalculator();
        player = new Player();
        player.setId(1L);
        player.setName("Test Player");

        buyerClub = new Club();
        buyerClub.setId(1L);
        buyerClub.setName("Buyer Club");
    }

    @Test
    void calculate_withPlayerMarketValue_noClauses() {
        player.setCurrentMarketValue(new BigDecimal("5000000"));
        BigDecimal expectedFee = new BigDecimal("5000000");
        BigDecimal actualFee = transferFeeCalculator.calculate(player, buyerClub, null);
        assertEquals(0, expectedFee.compareTo(actualFee));
    }

    @Test
    void calculate_withNullPlayerMarketValue_noClauses() {
        player.setCurrentMarketValue(null);
        // Uses default base fee of 1,000,000
        BigDecimal expectedFee = new BigDecimal("1000000");
        BigDecimal actualFee = transferFeeCalculator.calculate(player, buyerClub, new ArrayList<>());
        assertEquals(0, expectedFee.compareTo(actualFee));
    }

    @Test
    void calculate_withSellOnClause() {
        player.setCurrentMarketValue(new BigDecimal("10000000")); // Base fee
        List<ContractClause> clauses = new ArrayList<>();
        // Sell-on clause of 10% of base fee (1,000,000)
        clauses.add(new ContractClause("SELL_ON", new BigDecimal("10"), null));
        // Total = 10,000,000 (base) + 1,000,000 (sell-on)
        BigDecimal expectedFee = new BigDecimal("11000000");
        BigDecimal actualFee = transferFeeCalculator.calculate(player, buyerClub, clauses);
        assertEquals(0, expectedFee.compareTo(actualFee));
    }

    @Test
    void calculate_withAmountClause() {
        player.setCurrentMarketValue(new BigDecimal("5000000")); // Base fee
        List<ContractClause> clauses = new ArrayList<>();
        // Amount clause of 500,000
        clauses.add(new ContractClause("BONUS", null, new BigDecimal("500000")));
        // Total = 5,000,000 (base) + 500,000 (amount)
        BigDecimal expectedFee = new BigDecimal("5500000");
        BigDecimal actualFee = transferFeeCalculator.calculate(player, buyerClub, clauses);
        assertEquals(0, expectedFee.compareTo(actualFee));
    }

    @Test
    void calculate_withMixedClauses() {
        player.setCurrentMarketValue(new BigDecimal("20000000")); // Base fee
        List<ContractClause> clauses = new ArrayList<>();
        // Sell-on clause of 5% of base fee (1,000,000)
        clauses.add(new ContractClause("SELL_ON", new BigDecimal("5"), null));
        // Amount clause of 250,000
        clauses.add(new ContractClause("LOYALTY_BONUS", null, new BigDecimal("250000")));
        // Total = 20,000,000 (base) + 1,000,000 (sell-on) + 250,000 (amount)
        BigDecimal expectedFee = new BigDecimal("21250000");
        BigDecimal actualFee = transferFeeCalculator.calculate(player, buyerClub, clauses);
        assertEquals(0, expectedFee.compareTo(actualFee));
    }

    @Test
    void calculate_withNullClausePercentageAndAmount() {
        player.setCurrentMarketValue(new BigDecimal("5000000"));
        List<ContractClause> clauses = new ArrayList<>();
        clauses.add(new ContractClause("SELL_ON", null, null)); // Invalid sell_on
        clauses.add(new ContractClause("RANDOM_TYPE", null, null)); // No amount
        BigDecimal expectedFee = new BigDecimal("5000000"); // Should only be base_fee
        BigDecimal actualFee = transferFeeCalculator.calculate(player, buyerClub, clauses);
        assertEquals(0, expectedFee.compareTo(actualFee));
    }

    @Test
    void calculate_withEmptyClausesList() {
        player.setCurrentMarketValue(new BigDecimal("3000000"));
        BigDecimal expectedFee = new BigDecimal("3000000");
        BigDecimal actualFee = transferFeeCalculator.calculate(player, buyerClub, new ArrayList<>());
        assertEquals(0, expectedFee.compareTo(actualFee));
    }
}
