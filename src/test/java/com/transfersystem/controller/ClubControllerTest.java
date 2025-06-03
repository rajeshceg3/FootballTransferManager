package com.transfersystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transfersystem.dto.ClubDTO;
import com.transfersystem.service.ClubService;
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

@WebMvcTest(ClubController.class)
class ClubControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClubService clubService;

    @Autowired
    private ObjectMapper objectMapper;

    private ClubDTO clubDTO;

    @BeforeEach
    void setUp() {
        clubDTO = new ClubDTO();
        clubDTO.setId(1L);
        clubDTO.setName("Test Club");
        clubDTO.setBudget(new BigDecimal("1000000"));
    }

    @Test
    void createClub() throws Exception {
        when(clubService.createClub(any(ClubDTO.class))).thenReturn(clubDTO);

        mockMvc.perform(post("/api/v1/clubs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(clubDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(clubDTO.getName()));
    }

    @Test
    void getAllClubs() throws Exception {
        when(clubService.getAllClubs()).thenReturn(Collections.singletonList(clubDTO));

        mockMvc.perform(get("/api/v1/clubs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value(clubDTO.getName()));
    }

    @Test
    void getClubById() throws Exception {
        when(clubService.getClubById(1L)).thenReturn(clubDTO);

        mockMvc.perform(get("/api/v1/clubs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(clubDTO.getName()));
    }

    @Test
    void updateClub() throws Exception {
        ClubDTO updatedClubDTO = new ClubDTO(1L, "Updated Club", new BigDecimal("1200000"));
        when(clubService.updateClub(eq(1L), any(ClubDTO.class))).thenReturn(updatedClubDTO);

        mockMvc.perform(put("/api/v1/clubs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedClubDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Club"));
    }

    @Test
    void deleteClub() throws Exception {
        doNothing().when(clubService).deleteClub(1L);

        mockMvc.perform(delete("/api/v1/clubs/1"))
                .andExpect(status().isNoContent());
    }
}
