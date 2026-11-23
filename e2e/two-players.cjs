const { chromium, devices } = require('playwright');
const OUT = process.env.OUT_DIR ?? require('path').join(__dirname, 'screenshots'); require('fs').mkdirSync(OUT, { recursive: true });
const URL = process.env.BASE_URL ?? 'http://localhost:3001';
const ADMIN_PW = process.env.ADMIN_PASSWORD;
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const A = await (await browser.newContext({ viewport: { width: 1280, height: 820 }, colorScheme: 'dark' })).newPage();
  const B = await (await browser.newContext({ ...devices['Pixel 7'] })).newPage();
  for (const [n, p] of [['A', A], ['B', B]]) { p.on('pageerror', (e) => errors.push(`${n}: ${e.message}`)); p.on('console', (m) => m.type() === 'error' && errors.push(`${n} console: ${m.text()}`)); }
  await A.goto(URL); await A.fill('input[autocomplete=nickname]', 'Dilan');
  await A.getByRole('button', { name: /ژووری تایبەت/ }).click();
  const code = (await A.getByTestId('room-code').textContent()).trim();
  // host: set 2 rounds
  await A.getByRole('radio', { name: '٢' }).first().click();
  await B.goto(`${URL}/?room=${code}`); await B.fill('input[autocomplete=nickname]', 'Hêmin');
  await B.getByTestId('join-invite').click(); await B.getByTestId('room-code').waitFor();
  await A.getByTestId('start-game').click();
  await A.waitForTimeout(800);

  const isArtist = async (p) => (await p.locator('.absolute.inset-0 button span[dir=rtl]').count()) > 0;
  let reloaded = false;
  for (let turn = 0; turn < 4; turn++) {
    await A.waitForTimeout(500);
    const artist = (await isArtist(A)) ? A : B; const guesser = artist === A ? B : A;
    const word = (await artist.locator('.absolute.inset-0 button span[dir=rtl]').first().textContent()).trim();
    await artist.locator('.absolute.inset-0 button span[dir=rtl]').first().click();
    await artist.waitForTimeout(400);
    const box = await artist.locator('canvas').boundingBox();
    await artist.mouse.move(box.x + 100, box.y + 100); await artist.mouse.down();
    await artist.mouse.move(box.x + 300, box.y + 250, { steps: 10 }); await artist.mouse.up();
    await artist.waitForTimeout(400);
    if (!reloaded) {
      // reload the guesser mid-turn: state & canvas must be restored
      reloaded = true;
      await guesser.reload();
      await guesser.waitForTimeout(1500);
      const ok = await guesser.locator('canvas').count();
      const nonWhite = await guesser.evaluate(() => { const c = document.querySelector('canvas'); if (!c) return -1; const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for (let i=0;i<d.length;i+=4*53) if (d[i]<200) n++; return n; });
      console.log('after reload: in game =', ok > 0, ', restored canvas pixels =', nonWhite);
      await guesser.screenshot({ path: `${OUT}/11-after-reload.png` });
    }
    const input = guesser.locator('form input[dir=auto]').last();
    // near-miss first (if long enough): drop last letter
    if ([...word].length >= 4) { await input.fill([...word].slice(0, -1).join('')); await input.press('Enter'); await guesser.waitForTimeout(250); }
    await input.fill(word); await input.press('Enter');
    console.log(`turn ${turn + 1}: artist=${artist === A ? 'A' : 'B'} word=${word}`);
    await A.waitForTimeout(7800); // turnEnd
  }
  await A.waitForTimeout(1000);
  await A.screenshot({ path: `${OUT}/12-final-dark-desktop.png` });
  await B.screenshot({ path: `${OUT}/13-final-mobile.png` });
  console.log('final visible:', await B.getByText('ئەنجامی کۆتایی').isVisible());
  // play again -> back to lobby
  await A.getByRole('button', { name: /دووبارە یاری/ }).click();
  await B.waitForTimeout(600);
  console.log('back in lobby:', await B.getByTestId('room-code').isVisible());
  // english UI + settings modal
  await B.getByRole('button', { name: 'ڕێکخستنەکان' }).click();
  await B.getByRole('radio', { name: 'English' }).click();
  await B.getByRole('radio', { name: 'Newroz' }).click();
  await B.waitForTimeout(400);
  await B.screenshot({ path: `${OUT}/14-settings-en.png` });
  if (ADMIN_PW) {
  const ADM = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await ADM.goto(`${URL}/admin`); await ADM.fill('input[type=password]', 'wrong'); await ADM.click('button[type=submit]');
  await ADM.waitForTimeout(400); console.log('wrong pw msg:', await ADM.getByText('Wrong password').isVisible());
  await ADM.fill('input[type=password]', ADMIN_PW); await ADM.click('button[type=submit]');
  await ADM.waitForTimeout(800);
  await ADM.getByRole('button', { name: 'Approve' }).first().click();
  await ADM.waitForTimeout(400);
  await ADM.screenshot({ path: `${OUT}/15-admin-words.png` });
  await ADM.getByRole('radio', { name: 'Statistics' }).click(); await ADM.waitForTimeout(500);
  await ADM.screenshot({ path: `${OUT}/16-admin-stats.png` });
  }
  console.log('ERRORS:', errors.length ? errors : 'none');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
