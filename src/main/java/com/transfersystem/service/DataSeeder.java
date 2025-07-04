package com.transfersystem.service;

import com.transfersystem.model.Club;
import com.transfersystem.model.Player;
import com.transfersystem.repository.ClubRepository;
import com.transfersystem.repository.PlayerRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

@Service
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final ClubRepository clubRepository;
    private final PlayerRepository playerRepository;

    public DataSeeder(ClubRepository clubRepository, PlayerRepository playerRepository) {
        this.clubRepository = clubRepository;
        this.playerRepository = playerRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting data seeding process...");
        seedClubs();
        seedPlayers();
        logger.info("Data seeding process finished.");
    }

    private void seedClubs() {
        logger.info("Defining club data...");
        List<Club> clubs = new ArrayList<>();

        Club club1 = new Club();
        club1.setName("Real Madrid CF");
        club1.setBudget(new BigDecimal("600000000"));
        clubs.add(club1);
        logger.info("Defined club: {} with budget {}", club1.getName(), club1.getBudget());

        Club club2 = new Club();
        club2.setName("FC Barcelona");
        club2.setBudget(new BigDecimal("550000000"));
        clubs.add(club2);
        logger.info("Defined club: {} with budget {}", club2.getName(), club2.getBudget());

        Club club3 = new Club();
        club3.setName("Manchester United FC");
        club3.setBudget(new BigDecimal("700000000"));
        clubs.add(club3);
        logger.info("Defined club: {} with budget {}", club3.getName(), club3.getBudget());

        Club club4 = new Club();
        club4.setName("Liverpool FC");
        club4.setBudget(new BigDecimal("450000000"));
        clubs.add(club4);
        logger.info("Defined club: {} with budget {}", club4.getName(), club4.getBudget());

        Club club5 = new Club();
        club5.setName("FC Bayern Munich");
        club5.setBudget(new BigDecimal("500000000"));
        clubs.add(club5);
        logger.info("Defined club: {} with budget {}", club5.getName(), club5.getBudget());

        logger.info("Saving clubs to database...");
        int clubsSavedCount = 0;
        for (Club club : clubs) {
            Optional<Club> existingClub = clubRepository.findByName(club.getName());
            if (existingClub.isPresent()) {
                logger.info("Club {} already exists, skipping.", club.getName());
            } else {
                logger.info("Saving club: {}...", club.getName());
                clubRepository.save(club);
                logger.info("Successfully saved club: {}.", club.getName());
                clubsSavedCount++;
            }
        }
        logger.info("{} new clubs saved to database. {} clubs already existed.", clubsSavedCount, clubs.size() - clubsSavedCount);
    }

    private void seedPlayers() {
        logger.info("Defining player data...");
        // Temporary structure to hold player data along with intended club name
        class PlayerDefinition {
            Player player;
            String clubName;

            PlayerDefinition(Player player, String clubName) {
                this.player = player;
                this.clubName = clubName;
            }
        }
        List<PlayerDefinition> playerDefinitions = new ArrayList<>();

        // Players for Real Madrid CF
        Player player1 = new Player();
        player1.setName("Vinícius Júnior");
        player1.setCurrentMarketValue(new BigDecimal("150000000"));
        playerDefinitions.add(new PlayerDefinition(player1, "Real Madrid CF"));
        logger.info("Defined player: {} with market value {} for club {}", player1.getName(), player1.getCurrentMarketValue(), "Real Madrid CF");

        Player player2 = new Player();
        player2.setName("Jude Bellingham");
        player2.setCurrentMarketValue(new BigDecimal("180000000"));
        playerDefinitions.add(new PlayerDefinition(player2, "Real Madrid CF"));
        logger.info("Defined player: {} with market value {} for club {}", player2.getName(), player2.getCurrentMarketValue(), "Real Madrid CF");

        Player player3 = new Player();
        player3.setName("Rodrygo Goes");
        player3.setCurrentMarketValue(new BigDecimal("100000000"));
        playerDefinitions.add(new PlayerDefinition(player3, "Real Madrid CF"));
        logger.info("Defined player: {} with market value {} for club {}", player3.getName(), player3.getCurrentMarketValue(), "Real Madrid CF");

        // Players for FC Barcelona
        Player player4 = new Player();
        player4.setName("Gavi");
        player4.setCurrentMarketValue(new BigDecimal("90000000"));
        playerDefinitions.add(new PlayerDefinition(player4, "FC Barcelona"));
        logger.info("Defined player: {} with market value {} for club {}", player4.getName(), player4.getCurrentMarketValue(), "FC Barcelona");

        Player player5 = new Player();
        player5.setName("Pedri");
        player5.setCurrentMarketValue(new BigDecimal("100000000"));
        playerDefinitions.add(new PlayerDefinition(player5, "FC Barcelona"));
        logger.info("Defined player: {} with market value {} for club {}", player5.getName(), player5.getCurrentMarketValue(), "FC Barcelona");

        Player player6 = new Player();
        player6.setName("Lamine Yamal");
        player6.setCurrentMarketValue(new BigDecimal("75000000"));
        playerDefinitions.add(new PlayerDefinition(player6, "FC Barcelona"));
        logger.info("Defined player: {} with market value {} for club {}", player6.getName(), player6.getCurrentMarketValue(), "FC Barcelona");

        // Players for Manchester United FC
        Player player7 = new Player();
        player7.setName("Marcus Rashford");
        player7.setCurrentMarketValue(new BigDecimal("80000000"));
        playerDefinitions.add(new PlayerDefinition(player7, "Manchester United FC"));
        logger.info("Defined player: {} with market value {} for club {}", player7.getName(), player7.getCurrentMarketValue(), "Manchester United FC");

        Player player8 = new Player();
        player8.setName("Bruno Fernandes");
        player8.setCurrentMarketValue(new BigDecimal("70000000"));
        playerDefinitions.add(new PlayerDefinition(player8, "Manchester United FC"));
        logger.info("Defined player: {} with market value {} for club {}", player8.getName(), player8.getCurrentMarketValue(), "Manchester United FC");

        Player player9 = new Player();
        player9.setName("Rasmus Højlund");
        player9.setCurrentMarketValue(new BigDecimal("65000000"));
        playerDefinitions.add(new PlayerDefinition(player9, "Manchester United FC"));
        logger.info("Defined player: {} with market value {} for club {}", player9.getName(), player9.getCurrentMarketValue(), "Manchester United FC");

        // Players for Liverpool FC
        Player player10 = new Player();
        player10.setName("Mohamed Salah");
        player10.setCurrentMarketValue(new BigDecimal("65000000"));
        playerDefinitions.add(new PlayerDefinition(player10, "Liverpool FC"));
        logger.info("Defined player: {} with market value {} for club {}", player10.getName(), player10.getCurrentMarketValue(), "Liverpool FC");

        Player player11 = new Player();
        player11.setName("Luis Díaz");
        player11.setCurrentMarketValue(new BigDecimal("75000000"));
        playerDefinitions.add(new PlayerDefinition(player11, "Liverpool FC"));
        logger.info("Defined player: {} with market value {} for club {}", player11.getName(), player11.getCurrentMarketValue(), "Liverpool FC");

        Player player12 = new Player();
        player12.setName("Darwin Núñez");
        player12.setCurrentMarketValue(new BigDecimal("70000000"));
        playerDefinitions.add(new PlayerDefinition(player12, "Liverpool FC"));
        logger.info("Defined player: {} with market value {} for club {}", player12.getName(), player12.getCurrentMarketValue(), "Liverpool FC");

        // Players for FC Bayern Munich
        Player player13 = new Player();
        player13.setName("Jamal Musiala");
        player13.setCurrentMarketValue(new BigDecimal("110000000"));
        playerDefinitions.add(new PlayerDefinition(player13, "FC Bayern Munich"));
        logger.info("Defined player: {} with market value {} for club {}", player13.getName(), player13.getCurrentMarketValue(), "FC Bayern Munich");

        Player player14 = new Player();
        player14.setName("Harry Kane");
        player14.setCurrentMarketValue(new BigDecimal("110000000"));
        playerDefinitions.add(new PlayerDefinition(player14, "FC Bayern Munich"));
        logger.info("Defined player: {} with market value {} for club {}", player14.getName(), player14.getCurrentMarketValue(), "FC Bayern Munich");

        Player player15 = new Player();
        player15.setName("Leroy Sané");
        player15.setCurrentMarketValue(new BigDecimal("80000000"));
        playerDefinitions.add(new PlayerDefinition(player15, "FC Bayern Munich"));
        logger.info("Defined player: {} with market value {} for club {}", player15.getName(), player15.getCurrentMarketValue(), "FC Bayern Munich");

        logger.info("Player data definition complete. {} players defined.", playerDefinitions.size());

        logger.info("Fetching clubs from database to map for player association...");
        Map<String, Club> clubsMap = StreamSupport.stream(clubRepository.findAll().spliterator(), false)
                .collect(Collectors.toMap(Club::getName, Function.identity()));
        logger.info("Successfully fetched and mapped {} clubs.", clubsMap.size());

        logger.info("Saving players to database and associating with clubs...");
        int playersSavedCount = 0;
        int playersSkippedCount = 0;

        for (PlayerDefinition def : playerDefinitions) {
            Player player = def.player;
            String clubName = def.clubName;

            Optional<Player> existingPlayer = playerRepository.findByName(player.getName());
            if (existingPlayer.isPresent()) {
                logger.info("Player {} already exists, skipping.", player.getName());
                playersSkippedCount++;
                continue;
            }

            Club currentClub = clubsMap.get(clubName);
            if (currentClub != null) {
                player.setCurrentClub(currentClub);
                logger.info("Saving player: {} for club {}...", player.getName(), currentClub.getName());
                playerRepository.save(player);
                logger.info("Successfully saved player: {} for club {}.", player.getName(), currentClub.getName());
                playersSavedCount++;
            } else {
                logger.warn("Club {} not found for player {}. Player {} will not be saved with a club association at this time.", clubName, player.getName(), player.getName());
                // Decide if player should be saved without a club or skipped.
                // For this example, we'll save the player without a club.
                // If you want to skip, you can add 'playersSkippedCount++' and 'continue;'
                logger.info("Saving player: {} without club association...", player.getName());
                playerRepository.save(player); // Saving player without club
                logger.info("Successfully saved player: {} without a club.", player.getName());
                playersSavedCount++; // Counting as saved, though without full association
            }
        }
        logger.info("Player saving and association process complete. {} new players saved, {} players already existed/skipped.", playersSavedCount, playersSkippedCount);
    }
}
