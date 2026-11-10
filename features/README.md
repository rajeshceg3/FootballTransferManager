# Feature map - FootballTransferManager

| Feature | Entry point | Proven by |
| --- | --- | --- |
| Player management | `/api/v1/players` | PlayerServiceTest, PlayerControllerTest, boot smoke |
| Club management | `/api/v1/clubs` | ClubControllerTest |
| Transfer workflow (initiate, track, finalize) | `/api/v1/transfers` | TransferControllerTest |

The automated proof lives in `.cursor/skills/verify-football-transfer-manager/`.
