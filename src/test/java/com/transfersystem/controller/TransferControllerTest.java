package com.transfersystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransferController.class)
public class TransferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransferRepository transferRepository;

    @MockBean
    private PlayerRepository playerRepository;

    @MockBean
    private ClubRepository clubRepository;

    @MockBean
    private TransferWorkflowEngine transferWorkflowEngine;

    @MockBean
    private TransferFeeCalculator transferFeeCalculator;

    private Transfer sampleTransfer;
    private Player samplePlayer;
    private Club fromClub;
    private Club toClub;
    private UUID transferId;
    private UUID playerId;
    private UUID fromClubId;
    private UUID toClubId;

    @BeforeEach
    void setUp() {
        transferId = UUID.randomUUID();
        playerId = UUID.randomUUID();
        fromClubId = UUID.randomUUID();
        toClubId = UUID.randomUUID();

        samplePlayer = new Player();
        samplePlayer.setId(playerId);
        samplePlayer.setName("Test Player");
        samplePlayer.setCurrentClubId(fromClubId);
        samplePlayer.setMarketValue(new BigDecimal("500000")); // Added for fee calculation

        fromClub = new Club();
        fromClub.setId(fromClubId);
        fromClub.setName("From Club");
        fromClub.setBudget(new BigDecimal("1000000"));

        toClub = new Club();
        toClub.setId(toClubId);
        toClub.setName("To Club");
        toClub.setBudget(new BigDecimal("2000000"));

        sampleTransfer = new Transfer();
        sampleTransfer.setId(transferId);
        sampleTransfer.setPlayerId(playerId);
        sampleTransfer.setFromClubId(fromClubId);
        sampleTransfer.setToClubId(toClubId);
        sampleTransfer.setStatus(TransferStatus.DRAFT); // Default status
    }

    // --- Test GetTransferDetails ---
    @Test
    void getTransferById_whenTransferExists_shouldReturnTransferAndOk() throws Exception {
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));

        mockMvc.perform(get("/api/v1/transfers/{transferId}", transferId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(transferId.toString()))
                .andExpect(jsonPath("$.playerId").value(playerId.toString()))
                .andExpect(jsonPath("$.status").value(sampleTransfer.getStatus().toString()));
    }

    @Test
    void getTransferById_whenTransferNotFound_shouldReturnNotFound() throws Exception {
        when(transferRepository.findById(transferId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/transfers/{transferId}", transferId))
                .andExpect(status().isNotFound());
    }

    // --- Test SubmitTransfer ---
    @Test
    void submitTransfer_whenTransferExistsAndDraft_shouldReturnSubmittedAndOk() throws Exception {
        sampleTransfer.setStatus(TransferStatus.DRAFT);
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        // Mock workflow engine to change status
        doAnswer(invocation -> {
            Transfer t = invocation.getArgument(0);
            t.setStatus(TransferStatus.SUBMITTED);
            return null; // void method
        }).when(transferWorkflowEngine).submitTransfer(any(Transfer.class));

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/submit", transferId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(transferId.toString()))
                .andExpect(jsonPath("$.status").value(TransferStatus.SUBMITTED.toString()));

        verify(transferWorkflowEngine).submitTransfer(sampleTransfer);
    }

    @Test
    void submitTransfer_whenTransferNotFound_shouldReturnNotFound() throws Exception {
        when(transferRepository.findById(transferId)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/submit", transferId))
                .andExpect(status().isNotFound());
    }

    @Test
    void submitTransfer_whenWorkflowEngineThrowsIllegalState_shouldReturnConflict() throws Exception {
        sampleTransfer.setStatus(TransferStatus.COMPLETED); // An invalid state to submit
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doThrow(new IllegalStateException("Cannot submit a completed transfer"))
                .when(transferWorkflowEngine).submitTransfer(any(Transfer.class));

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/submit", transferId))
                .andExpect(status().isConflict()); // Or 400, depending on GlobalExceptionHandler
    }


    // --- Test MoveToNegotiation ---
    @Test
    void moveToNegotiation_whenTransferSubmitted_shouldReturnNegotiationAndOk() throws Exception {
        sampleTransfer.setStatus(TransferStatus.SUBMITTED);
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doAnswer(invocation -> {
            Transfer t = invocation.getArgument(0);
            t.setStatus(TransferStatus.NEGOTIATION);
            return null;
        }).when(transferWorkflowEngine).moveToNegotiation(any(Transfer.class));

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/negotiate", transferId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(TransferStatus.NEGOTIATION.toString()));
        verify(transferWorkflowEngine).moveToNegotiation(sampleTransfer);
    }

    @Test
    void moveToNegotiation_whenTransferNotFound_shouldReturnNotFound() throws Exception {
        when(transferRepository.findById(transferId)).thenReturn(Optional.empty());
        mockMvc.perform(patch("/api/v1/transfers/{transferId}/negotiate", transferId))
                .andExpect(status().isNotFound());
    }

    @Test
    void moveToNegotiation_whenWorkflowEngineThrowsIllegalState_shouldReturnConflict() throws Exception {
        sampleTransfer.setStatus(TransferStatus.DRAFT); // Invalid state for negotiation
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doThrow(new IllegalStateException("Cannot move DRAFT to negotiation"))
                .when(transferWorkflowEngine).moveToNegotiation(any(Transfer.class));

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/negotiate", transferId))
                .andExpect(status().isConflict());
    }

    // --- Test ApproveTransfer ---
    @Test
    void approveTransfer_whenTransferInNegotiation_shouldReturnApprovedAndOk() throws Exception {
        sampleTransfer.setStatus(TransferStatus.NEGOTIATION);
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doAnswer(invocation -> {
            Transfer t = invocation.getArgument(0);
            t.setStatus(TransferStatus.APPROVED);
            return null;
        }).when(transferWorkflowEngine).approveTransfer(any(Transfer.class));

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/approve", transferId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(TransferStatus.APPROVED.toString()));
        verify(transferWorkflowEngine).approveTransfer(sampleTransfer);
    }

    @Test
    void approveTransfer_whenTransferNotFound_shouldReturnNotFound() throws Exception {
        when(transferRepository.findById(transferId)).thenReturn(Optional.empty());
        mockMvc.perform(patch("/api/v1/transfers/{transferId}/approve", transferId))
                .andExpect(status().isNotFound());
    }

    @Test
    void approveTransfer_whenWorkflowEngineThrowsIllegalState_shouldReturnConflict() throws Exception {
        sampleTransfer.setStatus(TransferStatus.SUBMITTED); // Invalid state for approval
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doThrow(new IllegalStateException("Cannot approve SUBMITTED transfer directly"))
                .when(transferWorkflowEngine).approveTransfer(any(Transfer.class));

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/approve", transferId))
                .andExpect(status().isConflict());
    }

    // --- Test CancelTransfer ---
    @Test
    void cancelTransfer_whenTransferIsCancellable_shouldReturnCanceledAndOk() throws Exception {
        sampleTransfer.setStatus(TransferStatus.SUBMITTED); // A cancellable state
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doAnswer(invocation -> {
            Transfer t = invocation.getArgument(0);
            t.setStatus(TransferStatus.CANCELED);
            return null;
        }).when(transferWorkflowEngine).cancelTransfer(any(Transfer.class));

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/cancel", transferId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(TransferStatus.CANCELED.toString()));
        verify(transferWorkflowEngine).cancelTransfer(sampleTransfer);
    }

    @Test
    void cancelTransfer_whenTransferNotFound_shouldReturnNotFound() throws Exception {
        when(transferRepository.findById(transferId)).thenReturn(Optional.empty());
        mockMvc.perform(patch("/api/v1/transfers/{transferId}/cancel", transferId))
                .andExpect(status().isNotFound());
    }

    @Test
    void cancelTransfer_whenWorkflowEngineThrowsIllegalState_shouldReturnConflict() throws Exception {
        sampleTransfer.setStatus(TransferStatus.COMPLETED); // Non-cancellable state
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doThrow(new IllegalStateException("Cannot cancel a COMPLETED transfer"))
                .when(transferWorkflowEngine).cancelTransfer(any(Transfer.class));

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/cancel", transferId))
                .andExpect(status().isConflict());
    }

    // --- Test CompleteTransfer ---
    @Test
    void completeTransfer_whenTransferApproved_shouldCompleteAndUpdateEntitiesAndOk() throws Exception {
        sampleTransfer.setStatus(TransferStatus.APPROVED);
        BigDecimal calculatedFee = new BigDecimal("50000");

        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doAnswer(invocation -> {
            Transfer t = invocation.getArgument(0);
            t.setStatus(TransferStatus.COMPLETED);
            return null;
        }).when(transferWorkflowEngine).completeTransfer(any(Transfer.class));

        when(playerRepository.findById(playerId)).thenReturn(Optional.of(samplePlayer));
        when(clubRepository.findById(toClubId)).thenReturn(Optional.of(toClub));
        when(clubRepository.findById(fromClubId)).thenReturn(Optional.of(fromClub));
        when(transferFeeCalculator.calculate(samplePlayer, toClub, List.of())).thenReturn(calculatedFee);

        // Initial budgets
        BigDecimal initialToClubBudget = toClub.getBudget();
        BigDecimal initialFromClubBudget = fromClub.getBudget();

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/complete", transferId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(transferId.toString()))
                .andExpect(jsonPath("$.status").value(TransferStatus.COMPLETED.toString()));

        verify(transferWorkflowEngine).completeTransfer(sampleTransfer);
        verify(playerRepository).findById(playerId);
        verify(clubRepository).findById(toClubId);
        verify(clubRepository).findById(fromClubId);
        verify(transferFeeCalculator).calculate(samplePlayer, toClub, List.of());

        // Verify player's club updated
        verify(samplePlayer).setCurrentClubId(toClubId);
        verify(playerRepository).save(samplePlayer);

        // Verify club budgets updated
        verify(toClub).setBudget(initialToClubBudget.subtract(calculatedFee));
        verify(fromClub).setBudget(initialFromClubBudget.add(calculatedFee));
        verify(clubRepository).save(toClub);
        verify(clubRepository).save(fromClub);
    }

    @Test
    void completeTransfer_whenTransferNotFound_shouldReturnNotFound() throws Exception {
        when(transferRepository.findById(transferId)).thenReturn(Optional.empty());
        mockMvc.perform(patch("/api/v1/transfers/{transferId}/complete", transferId))
                .andExpect(status().isNotFound());
    }

    @Test
    void completeTransfer_whenPlayerNotFoundDuringUpdate_shouldReturnNotFound() throws Exception {
        sampleTransfer.setStatus(TransferStatus.APPROVED);
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doNothing().when(transferWorkflowEngine).completeTransfer(any(Transfer.class)); // Simulate status update

        when(playerRepository.findById(playerId)).thenReturn(Optional.empty()); // Player not found

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/complete", transferId))
                .andExpect(status().isNotFound()); // Expect 404 due to ResourceNotFoundException for player
    }

    @Test
    void completeTransfer_whenToClubNotFoundDuringUpdate_shouldReturnNotFound() throws Exception {
        sampleTransfer.setStatus(TransferStatus.APPROVED);
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doNothing().when(transferWorkflowEngine).completeTransfer(any(Transfer.class));
        when(playerRepository.findById(playerId)).thenReturn(Optional.of(samplePlayer));
        when(clubRepository.findById(toClubId)).thenReturn(Optional.empty()); // ToClub not found

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/complete", transferId))
                .andExpect(status().isNotFound());
    }

    @Test
    void completeTransfer_whenFromClubNotFoundDuringUpdate_shouldReturnNotFound() throws Exception {
        sampleTransfer.setStatus(TransferStatus.APPROVED);
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doNothing().when(transferWorkflowEngine).completeTransfer(any(Transfer.class));
        when(playerRepository.findById(playerId)).thenReturn(Optional.of(samplePlayer));
        when(clubRepository.findById(toClubId)).thenReturn(Optional.of(toClub));
        when(clubRepository.findById(fromClubId)).thenReturn(Optional.empty()); // FromClub not found

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/complete", transferId))
                .andExpect(status().isNotFound());
    }

    @Test
    void completeTransfer_whenWorkflowEngineThrowsIllegalState_shouldReturnConflict() throws Exception {
        sampleTransfer.setStatus(TransferStatus.DRAFT); // Invalid state for completion
        when(transferRepository.findById(transferId)).thenReturn(Optional.of(sampleTransfer));
        doThrow(new IllegalStateException("Cannot complete a DRAFT transfer"))
                .when(transferWorkflowEngine).completeTransfer(any(Transfer.class));

        mockMvc.perform(patch("/api/v1/transfers/{transferId}/complete", transferId))
                .andExpect(status().isConflict());
    }
}
