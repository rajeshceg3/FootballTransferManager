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

});
