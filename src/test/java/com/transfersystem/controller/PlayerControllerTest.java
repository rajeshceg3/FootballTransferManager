package com.transfersystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transfersystem.dto.PlayerDTO;
import com.transfersystem.service.PlayerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PlayerController.class)
class PlayerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlayerService playerService;

    @Autowired
    private ObjectMapper objectMapper;

    private PlayerDTO playerDTO;

    @BeforeEach
    void setUp() {
        playerDTO = new PlayerDTO();
        playerDTO.setId(1L);
        playerDTO.setName("Test Player");
        playerDTO.setCurrentMarketValue(new BigDecimal("500000"));
        playerDTO.setCurrentClubId(10L);
    }

    @Test
    void createPlayer() throws Exception {
        when(playerService.createPlayer(any(PlayerDTO.class))).thenReturn(playerDTO);

        mockMvc.perform(post("/api/v1/players")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(playerDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(playerDTO.getName()));
    }

    @Test
    void getAllPlayers() throws Exception {
        when(playerService.getAllPlayers()).thenReturn(Collections.singletonList(playerDTO));

        mockMvc.perform(get("/api/v1/players"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value(playerDTO.getName()));
    }

    @Test
    void getPlayerById() throws Exception {
        when(playerService.getPlayerById(1L)).thenReturn(playerDTO);

        mockMvc.perform(get("/api/v1/players/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(playerDTO.getName()));
    }

    @Test
    void updatePlayer() throws Exception {
        PlayerDTO updatedPlayerDTO = new PlayerDTO(1L, "Updated Player", new BigDecimal("550000"), 11L);
        when(playerService.updatePlayer(eq(1L), any(PlayerDTO.class))).thenReturn(updatedPlayerDTO);

        mockMvc.perform(put("/api/v1/players/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPlayerDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Player"));
    }

    @Test
    void deletePlayer() throws Exception {
        doNothing().when(playerService).deletePlayer(1L);

        mockMvc.perform(delete("/api/v1/players/1"))
                .andExpect(status().isNoContent());
    }
}
