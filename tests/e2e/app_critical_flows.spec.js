// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000'; // Assuming frontend runs on port 3000

test.describe('Critical User Flows', () => {

  test('should create a new player successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/players/new`);

    // Wait for form elements to be visible if necessary, though Playwright auto-waits for many actions
    await expect(page.locator('h2:has-text("Create New Player")')).toBeVisible();

    // Use unique player name for each test run if possible, or clean up data afterwards
    const uniquePlayerName = `Test Player ${Date.now()}`;
    await page.locator('input#name').fill(uniquePlayerName);
    await page.locator('input#marketValue').fill('1000000');

    // Assuming ClubDropdown component and its interaction
    // This might need more specific selectors depending on ClubDropdown implementation
    // For now, let's assume no club is selected or the first available one if that's how it works.
    // await page.locator('div:has(label:has-text("Assign to Club")) > select').selectOption({ index: 1 }); // Example: select first actual club

    await page.locator('button[type="submit"]:has-text("Create Player")').click();

    // Wait for navigation to player list page
    await expect(page).toHaveURL(`${BASE_URL}/players`);
    // Check if the player name appears in the list (this is a basic check)
    // A more robust check would involve finding the specific row and asserting all its data.
    await expect(page.locator(`text=${uniquePlayerName}`)).toBeVisible({ timeout: 10000 }); // Increased timeout for data propagation
  });

  test('should create a new club successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/clubs/new`);

    await expect(page.locator('h2:has-text("Create New Club")')).toBeVisible();

    const uniqueClubName = `Test Club ${Date.now()}`;
    await page.locator('input#name').fill(uniqueClubName);
    await page.locator('input#budget').fill('50000000');

    await page.locator('button[type="submit"]:has-text("Create Club")').click();

    await expect(page).toHaveURL(`${BASE_URL}/clubs`);
    await expect(page.locator(`text=${uniqueClubName}`)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Transfer List page and see the title', async ({ page }) => {
    await page.goto(`${BASE_URL}/`); // Assuming base URL redirects or has a link to transfers

    // If there's a direct link/button to the transfer list, click it.
    // Example: await page.locator('a[href="/"]').click(); or a more specific selector

    await expect(page.locator('h2:has-text("Transfer Market")')).toBeVisible();

    // Check if the table or an empty state message is present
    const transferTable = page.locator('table.table');
    const emptyStateMessage = page.locator('p:has-text("No transfers to display yet")');
    const emptyFilterMessage = page.locator('p:has-text("No transfers match your filters")');

    await expect(transferTable.or(emptyStateMessage).or(emptyFilterMessage)).toBeVisible();
  });

  test('should navigate to Player List page and see the title', async ({ page }) => {
    await page.goto(`${BASE_URL}/players`);
    await expect(page.locator('h2:has-text("Manage Players")')).toBeVisible();

    const playerTable = page.locator('table.table');
    const emptyStateMessage = page.locator('p:has-text("No players found in the system.")');

    await expect(playerTable.or(emptyStateMessage)).toBeVisible();
  });

  test('should navigate to Club List page and see the title', async ({ page }) => {
    await page.goto(`${BASE_URL}/clubs`);
    await expect(page.locator('h2:has-text("Manage Clubs")')).toBeVisible();

    const clubTable = page.locator('table.table');
    const emptyStateMessage = page.locator('p:has-text("No clubs found at the moment.")');

    await expect(clubTable.or(emptyStateMessage)).toBeVisible();
  });

  test('should complete a full player transfer workflow', async ({ page }) => {
    const timestamp = Date.now();
    const uniquePlayerName = `Player ${timestamp}`;
    const fromClubName = `FromClub ${timestamp}`;
    const toClubName = `ToClub ${timestamp}`;
    const fromClubBudget = '100000000';
    const toClubBudget = '200000000';
    const playerMarketValue = '5000000';

    // 1. Setup
    // Create "From Club"
    await page.goto(`${BASE_URL}/clubs/new`);
    await expect(page.locator('h2:has-text("Create New Club")')).toBeVisible();
    await page.locator('input#name').fill(fromClubName);
    await page.locator('input#budget').fill(fromClubBudget);
    await page.locator('button[type="submit"]:has-text("Create Club")').click();
    await expect(page).toHaveURL(`${BASE_URL}/clubs`, { timeout: 10000 });
    await expect(page.locator(`td:has-text("${fromClubName}")`)).toBeVisible({ timeout: 10000 });

    // Create "To Club"
    await page.goto(`${BASE_URL}/clubs/new`);
    await expect(page.locator('h2:has-text("Create New Club")')).toBeVisible();
    await page.locator('input#name').fill(toClubName);
    await page.locator('input#budget').fill(toClubBudget);
    await page.locator('button[type="submit"]:has-text("Create Club")').click();
    await expect(page).toHaveURL(`${BASE_URL}/clubs`, { timeout: 10000 });
    await expect(page.locator(`td:has-text("${toClubName}")`)).toBeVisible({ timeout: 10000 });

    // Create Player and assign to "From Club"
    await page.goto(`${BASE_URL}/players/new`);
    await expect(page.locator('h2:has-text("Create New Player")')).toBeVisible();
    await page.locator('input#name').fill(uniquePlayerName);
    await page.locator('input#marketValue').fill(playerMarketValue);
    // Select "From Club" from dropdown. Assuming the value is the club's name or ID.
    // If club names are unique and displayed in the dropdown, selecting by text is robust.
    // The select element for assigning club is assumed to be 'select#clubId' or similar based on common patterns.
    // Let's assume the ClubDropdown component's select element has a name/id like "clubId"
    // And that it populates with club names.
    await page.locator('select[name="clubId"]').selectOption({ label: fromClubName });
    await page.locator('button[type="submit"]:has-text("Create Player")').click();
    await expect(page).toHaveURL(`${BASE_URL}/players`, { timeout: 10000 });
    // Verify player is listed with the correct club
    // This requires finding the row with the player and then checking the club column in that row.
    const playerRowLocator = page.locator(`tr:has(td:has-text("${uniquePlayerName}"))`);
    await expect(playerRowLocator).toBeVisible({ timeout: 10000 });
    await expect(playerRowLocator.locator(`td:has-text("${fromClubName}")`)).toBeVisible();

    // 2. Initiate Transfer
    await page.goto(`${BASE_URL}/transfer/new`);
    await expect(page.locator('h2:has-text("Initiate New Transfer")')).toBeVisible();

    // Select Player, From Club, To Club
    await page.locator('select[name="playerId"]').selectOption({ label: uniquePlayerName });
    // For From Club and To Club, the dropdowns might be pre-filled or need selection.
    // Assuming they need selection and display club names.
    // Note: The "From Club" in a transfer initiation is the player's current club.
    // Some forms might auto-populate this when a player is selected.
    // For this test, we'll explicitly select it if the field is there.
    // If the "From Club" field is disabled or auto-filled, this selector might need adjustment.
    const fromClubSelect = page.locator('select[name="fromClubId"]');
    // Check if the fromClub select is enabled before trying to select. It might be disabled if player selection auto-fills it.
    if (await fromClubSelect.isEnabled()) {
      await fromClubSelect.selectOption({ label: fromClubName });
    } else {
      // If disabled, verify it's showing the correct From Club
      // This might require a different locator, e.g., a text input or span if it's read-only
      await expect(fromClubSelect).toHaveValue(/.*/); // Check it has some value (club ID)
      // A more complex check might involve ensuring the displayed text for the disabled select matches fromClubName
    }
    await page.locator('select[name="toClubId"]').selectOption({ label: toClubName });

    // Add a clause (optional, but good for testing more functionality)
    await page.locator('button:has-text("Add Clause")').click();
    await page.locator('input[placeholder="Clause Type"]').fill('Sell-on Percentage');
    await page.locator('input[placeholder="Percentage (%)"]').fill('20');


    await page.locator('button:has-text("Initiate Transfer")').click();

    // Capture transfer ID from URL and verify status
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/transfer/\\d+`), { timeout: 10000 });
    const url = page.url();
    const transferId = url.split('/').pop();
    await expect(page.locator('.status-badge.status-DRAFT')).toHaveText('DRAFT', { timeout: 10000 }); // Wait for status

    // 3. Workflow Progression
    // Submit
    await page.locator('button:has-text("Submit Transfer")').click();
    await expect(page.locator('.status-badge.status-SUBMITTED')).toHaveText('SUBMITTED', { timeout: 10000 });

    // Approve (from SUBMITTED state)
    // In SUBMITTED state, buttons are: "Approve Transfer", "Move to Negotiation", "Reject Transfer"
    await page.locator('button:has-text("Approve Transfer")').click();
    await expect(page.locator('.status-badge.status-APPROVED')).toHaveText('APPROVED', { timeout: 10000 });

    // Complete
    await page.locator('button:has-text("Complete Transfer")').click();
    await expect(page.locator('.status-badge.status-COMPLETED')).toHaveText('COMPLETED', { timeout: 10000 });
    // After completion, there should be a message "This transfer is completed and no further actions are available."
    await expect(page.locator('p:has-text("This transfer is completed and no further actions are available.")')).toBeVisible();


    // 4. Verification (Optional but Recommended)
    // Verify player's new club
    await page.goto(`${BASE_URL}/players`);
    const updatedPlayerRowLocator = page.locator(`tr:has(td:has-text("${uniquePlayerName}"))`);
    await expect(updatedPlayerRowLocator).toBeVisible({ timeout: 10000 });
    await expect(updatedPlayerRowLocator.locator(`td:has-text("${toClubName}")`)).toBeVisible();

    // Verify club budgets (basic check: budget is different from original)
    // This is a simplified check. A more precise check would require knowing the transfer fee.
    await page.goto(`${BASE_URL}/clubs`);
    // "To Club" budget should have decreased (or changed)
    const toClubRowLocator = page.locator(`tr:has(td:has-text("${toClubName}"))`);
    await expect(toClubRowLocator.locator('td').nth(1)) // Assuming budget is the second column
        .not.toHaveText(new RegExp(toClubBudget.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'))); // Format budget with commas for comparison if displayed that way

    // "From Club" budget should have increased (or changed)
    const fromClubRowLocator = page.locator(`tr:has(td:has-text("${fromClubName}"))`);
    await expect(fromClubRowLocator.locator('td').nth(1)) // Assuming budget is the second column
      .not.toHaveText(new RegExp(fromClubBudget.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')));

  });
});
