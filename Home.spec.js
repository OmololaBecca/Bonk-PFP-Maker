import { test, expect } from "@playwright/test";

test("All tests", async ({ page }) => {
  //Verify load app and correct title
  await page.goto("https://bonk-tribe.vercel.app/");
  await expect(page).toHaveTitle(/BONK PFP/i);

  await page.click("text=TRY BONK PFP MAKER");
  await expect(page).toHaveURL("https://bonk-tribe.vercel.app/pfp");

  //Select your Bonk Community
  const bonkButton = page.getByRole("button", { name: /bonk/i });
  if (await bonkButton.count()) {
    await bonkButton.first().click();
  }

  //Select Bonk Avatar
  await page.getByRole("button", { name: "Select sample PFP 2" }).click();

  //Add your avatars
  await page.locator('[aria-label*="edit bonk tag" i]').click();
  await page.locator('[aria-label*="Edit Glasses" i]').click();
  await page.locator('[aria-label*="Edit bonk logo" i]').click();

  //Include the desired Bg
  await page.locator('[aria-label*="Bonk Yellow" i]').nth(1).click();

  //Verify preview functionality
  const previewBtn = page.getByRole("button", { name: /^preview$/i });
  await expect(previewBtn).toBeVisible();
  await previewBtn.click();
  await page.pause();

  // Verify download in preview mode

  const downloadBtn = page.getByRole("button", { name: /download/i });

  // Assert it's visible
  await expect(downloadBtn).toBeVisible();

  // Track download file and Download
  const downloadPromise = page.waitForEvent("download");
  await downloadBtn.click();
  const download = await downloadPromise;
  await page.pause();

  // Ensure file actually downloaded
  const path = await download.path();
  console.log("Downloaded file path:", path);

  // expect the file to exist
  expect(path).not.toBeNull();
});
