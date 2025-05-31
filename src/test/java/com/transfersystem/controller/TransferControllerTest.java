package com.transfersystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transfersystem.dto.ContractClauseDto;
import com.transfersystem.dto.InitiateTransferRequest;
import com.transfersystem.model.Club;
import com.transfersystem.model.Player;
import com.transfersystem.model.Transfer;
import com.transfersystem.model.TransferStatus;
import com.transfersystem.repository.ClubRepository;
import com.transfersystem.repository.PlayerRepository;
import com.transfersystem.repository.TransferRepository;
import com.transfersystem.service.TransferWorkflowEngine;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
    private TransferWorkflowEngine transferWorkflowEngine; // Though not directly used in initiateTransfer

    @Test
    void initiateTransfer_validRequest_shouldReturnCreated() throws Exception {
        Long playerId = 1L;
        Long fromClubId = 10L;
        Long toClubId = 20L;

        InitiateTransferRequest request = new InitiateTransferRequest();
        request.setPlayerId(playerId);
        request.setFromClubId(fromClubId);
        request.setToClubId(toClubId);
        List<ContractClauseDto> clauses = new ArrayList<>();
        clauses.add(new ContractClauseDto("SELL_ON", BigDecimal.TEN, null));
        request.setClauses(clauses);

        when(playerRepository.existsById(playerId)).thenReturn(true);
        when(clubRepository.existsById(fromClubId)).thenReturn(true);
        when(clubRepository.existsById(toClubId)).thenReturn(true);

        Transfer savedTransfer = new Transfer();
        savedTransfer.setId(UUID.randomUUID());
        savedTransfer.setPlayerId(playerId);
        savedTransfer.setFromClubId(fromClubId);
        savedTransfer.setToClubId(toClubId);
        savedTransfer.setStatus(TransferStatus.DRAFT);

        when(transferRepository.save(any(Transfer.class))).thenReturn(savedTransfer);

        mockMvc.perform(post("/api/v1/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(savedTransfer.getId().toString()))
                .andExpect(jsonPath("$.playerId").value(playerId))
                .andExpect(jsonPath("$.fromClubId").value(fromClubId))
                .andExpect(jsonPath("$.toClubId").value(toClubId))
                .andExpect(jsonPath("$.status").value(TransferStatus.DRAFT.toString()));
    }

    @Test
    void initiateTransfer_playerNotFound_shouldReturnBadRequest() throws Exception {
        InitiateTransferRequest request = new InitiateTransferRequest();
        request.setPlayerId(1L);
        request.setFromClubId(10L);
        request.setToClubId(20L);

        when(playerRepository.existsById(1L)).thenReturn(false); // Player does not exist

        mockMvc.perform(post("/api/v1/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()) // Assuming IllegalArgumentException maps to 400
                .andExpect(MockMvcResultMatchers.content().string("Player not found with ID: 1"));

    }

    @Test
    void initiateTransfer_fromClubNotFound_shouldReturnBadRequest() throws Exception {
        InitiateTransferRequest request = new InitiateTransferRequest();
        request.setPlayerId(1L);
        request.setFromClubId(10L);
        request.setToClubId(20L);

        when(playerRepository.existsById(1L)).thenReturn(true);
        when(clubRepository.existsById(10L)).thenReturn(false); // FromClub does not exist

        mockMvc.perform(post("/api/v1/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(MockMvcResultMatchers.content().string("Originating club not found with ID: 10"));
    }

    @Test
    void initiateTransfer_toClubNotFound_shouldReturnBadRequest() throws Exception {
        InitiateTransferRequest request = new InitiateTransferRequest();
        request.setPlayerId(1L);
        request.setFromClubId(10L);
        request.setToClubId(20L);

        when(playerRepository.existsById(1L)).thenReturn(true);
        when(clubRepository.existsById(10L)).thenReturn(true);
        when(clubRepository.existsById(20L)).thenReturn(false); // ToClub does not exist

        mockMvc.perform(post("/api/v1/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(MockMvcResultMatchers.content().string("Destination club not found with ID: 20"));
    }
}
