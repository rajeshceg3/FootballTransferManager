package com.transfersystem.controller;

import com.transfersystem.dto.InitiateTransferRequest;
import com.transfersystem.exception.InsufficientBudgetException;
import com.transfersystem.exception.ResourceNotFoundException;
import com.transfersystem.model.Club;
import com.transfersystem.model.Player;
import com.transfersystem.model.Transfer;
import com.transfersystem.model.TransferStatus;
import com.transfersystem.repository.ClubRepository;
import com.transfersystem.repository.PlayerRepository;
import com.transfersystem.repository.TransferRepository;
import com.transfersystem.service.TransferFeeCalculator;
import com.transfersystem.service.TransferWorkflowEngine;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transfers")
public class TransferController {

    private final TransferRepository transferRepository;
    private final PlayerRepository playerRepository;
    private final ClubRepository clubRepository;
    private final TransferWorkflowEngine transferWorkflowEngine;
    private final TransferFeeCalculator transferFeeCalculator;

    // Define active statuses for transfer check
    private static final List<TransferStatus> ACTIVE_TRANSFER_STATUSES = Arrays.asList(
            TransferStatus.SUBMITTED, TransferStatus.NEGOTIATION, TransferStatus.APPROVED
    );

    public TransferController(TransferRepository transferRepository,
                              PlayerRepository playerRepository,
                              ClubRepository clubRepository,
                              TransferWorkflowEngine transferWorkflowEngine,
                              TransferFeeCalculator transferFeeCalculator) {
        this.transferRepository = transferRepository;
        this.playerRepository = playerRepository;
        this.clubRepository = clubRepository;
        this.transferWorkflowEngine = transferWorkflowEngine;
        this.transferFeeCalculator = transferFeeCalculator;
    }

    @PostMapping
    public ResponseEntity<Transfer> initiateTransfer(@RequestBody InitiateTransferRequest request) {
        // Validate Player
        Player player = playerRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + request.getPlayerId()));

        // Validate FromClub
        Club fromClub = clubRepository.findById(request.getFromClubId())
                .orElseThrow(() -> new ResourceNotFoundException("FromClub not found with ID: " + request.getFromClubId()));

        // Validate ToClub
        Club toClub = clubRepository.findById(request.getToClubId())
                .orElseThrow(() -> new ResourceNotFoundException("ToClub not found with ID: " + request.getToClubId()));

        // Check if player is already in an active transfer
        if (transferRepository.existsByPlayerIdAndStatusIn(player.getId(), ACTIVE_TRANSFER_STATUSES)) {
            throw new IllegalStateException("Player with ID " + player.getId() + " is already in an active transfer. Cannot initiate a new one.");
        }

        // Check ToClub's budget
        BigDecimal estimatedFee = transferFeeCalculator.calculate(player, toClub, request.getClauses());
        if (toClub.getBudget() == null || toClub.getBudget().compareTo(estimatedFee) < 0) {
            throw new InsufficientBudgetException("ToClub (ID: " + toClub.getId() + ") does not have sufficient budget for this transfer. Required: " + estimatedFee + ", Available: " + (toClub.getBudget() == null ? "0" : toClub.getBudget()));
        }

        Transfer newTransfer = new Transfer();
        newTransfer.setPlayerId(player.getId());
        newTransfer.setFromClubId(fromClub.getId());
        newTransfer.setToClubId(toClub.getId());
        newTransfer.setStatus(TransferStatus.DRAFT);
        // Note: Clauses from request.getClauses() are used for fee calculation
        // but not directly stored on the Transfer entity in this version.

        Transfer savedTransfer = transferRepository.save(newTransfer);
        return new ResponseEntity<>(savedTransfer, HttpStatus.CREATED);
    }
}
