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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

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

    @GetMapping
    public ResponseEntity<List<Transfer>> getAllTransfers() {
        List<Transfer> transfers = transferRepository.findAllByOrderByInitiationTimestampDesc();
        if (transfers.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(transfers);
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
        if (transferRepository.existsByPlayer_IdAndStatusIn(player.getId(), ACTIVE_TRANSFER_STATUSES)) {
            throw new IllegalStateException("Player with ID " + player.getId() + " is already in an active transfer. Cannot initiate a new one.");
        }

        // Check ToClub's budget
        BigDecimal estimatedFee = transferFeeCalculator.calculate(player, toClub, request.getClauses());
        if (toClub.getBudget() == null || toClub.getBudget().compareTo(estimatedFee) < 0) {
            throw new InsufficientBudgetException("ToClub (ID: " + toClub.getId() + ") does not have sufficient budget for this transfer. Required: " + estimatedFee + ", Available: " + (toClub.getBudget() == null ? "0" : toClub.getBudget()));
        }

        Transfer newTransfer = new Transfer();
        newTransfer.setPlayer(player);
        newTransfer.setFromClub(fromClub);
        newTransfer.setToClub(toClub);
        newTransfer.setStatus(TransferStatus.DRAFT);
        // Note: Clauses from request.getClauses() are used for fee calculation
        // but not directly stored on the Transfer entity in this version.

        Transfer savedTransfer = transferRepository.save(newTransfer);
        return new ResponseEntity<>(savedTransfer, HttpStatus.CREATED);
    }

    @PatchMapping("/{transferId}/submit")
    public ResponseEntity<Transfer> submitTransfer(@PathVariable UUID transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with ID: " + transferId));

        transferWorkflowEngine.submitTransfer(transfer);
        // No need to save again, as submitTransfer is expected to persist the change.
        // However, if submitTransfer doesn't persist, an explicit save would be needed:
        // Transfer updatedTransfer = transferRepository.save(transfer);

        return ResponseEntity.ok(transfer);
    }

    @PatchMapping("/{transferId}/negotiate")
    public ResponseEntity<Transfer> negotiateTransfer(@PathVariable UUID transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with ID: " + transferId));

        transferWorkflowEngine.moveToNegotiation(transfer);
        // No need to save again, as moveToNegotiation is expected to persist the change.

        return ResponseEntity.ok(transfer);
    }

    @PatchMapping("/{transferId}/approve")
    public ResponseEntity<Transfer> approveTransfer(@PathVariable UUID transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with ID: " + transferId));

        transferWorkflowEngine.approveTransfer(transfer);
        // No need to save again, as approveTransfer is expected to persist the change.

        return ResponseEntity.ok(transfer);
    }

    @PatchMapping("/{transferId}/complete")
    @Transactional
    public ResponseEntity<Transfer> completeTransfer(@PathVariable UUID transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with ID: " + transferId));

        // Call workflow engine to update status to COMPLETED (and persist it)
        transferWorkflowEngine.completeTransfer(transfer);

        // Retrieve entities from the transfer object, assuming they are loaded or accessible
        // Note: If Player/Club objects within transfer are not fully loaded due to LAZY fetching
        // and the session is closed (e.g. if this method wasn't @Transactional or transfer was detached),
        // direct access like transfer.getPlayer().getName() could cause LazyInitializationException.
        // However, since we are within a @Transactional method and transfer is managed,
        // these should be accessible, or Hibernate will fetch them.
        Player player = transfer.getPlayer();
        Club toClub = transfer.getToClub();
        Club fromClub = transfer.getFromClub();

        // Validate that related entities are not null, as they are essential for completion
        if (player == null) {
            throw new ResourceNotFoundException("Player associated with transfer ID " + transferId + " not found or is null.");
        }
        if (toClub == null) {
            throw new ResourceNotFoundException("ToClub associated with transfer ID " + transferId + " not found or is null.");
        }
        if (fromClub == null) {
            throw new ResourceNotFoundException("FromClub associated with transfer ID " + transferId + " not found or is null.");
        }

        // Update player's current club
        player.setCurrentClub(toClub);

        // Calculate transfer fee (using empty list for clauses as they are not stored on Transfer)
        BigDecimal transferFee = transferFeeCalculator.calculate(player, toClub, List.of());

        // Update budgets
        if (toClub.getBudget() != null) {
            toClub.setBudget(toClub.getBudget().subtract(transferFee));
        }
        if (fromClub.getBudget() != null) {
            fromClub.setBudget(fromClub.getBudget().add(transferFee));
        }

        // Save updated entities
        playerRepository.save(player);
        clubRepository.save(toClub);
        clubRepository.save(fromClub);

        return ResponseEntity.ok(transfer); // Return the transfer object, now with COMPLETED status
    }

    @PatchMapping("/{transferId}/cancel")
    public ResponseEntity<Transfer> cancelTransfer(@PathVariable UUID transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with ID: " + transferId));

        transferWorkflowEngine.cancelTransfer(transfer);
        // No need to save again, as cancelTransfer is expected to persist the change.

        return ResponseEntity.ok(transfer);
    }

    @GetMapping("/{transferId}")
    public ResponseEntity<Transfer> getTransferById(@PathVariable UUID transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResourceNotFoundException("Transfer not found with ID: " + transferId));
        return ResponseEntity.ok(transfer);
    }
}
