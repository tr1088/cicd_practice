const { test, expect } = require('@playwright/test');

// テストのタイトル
test('ページのタイトルが正しく、ボタンをクリックするとメッセージが変わるか', async ({ page }) => {
  // ローカルのHTMLファイルを開く
  // ※GitHub Actionsで実行する際は、このパスの指定が重要になります。
  await page.goto('file://' + process.cwd() + '/index.html');

  // 1. ページのタイトルが正しいかチェック
  await expect(page).toHaveTitle('自動テストとデプロイの練習');

  // 2. ボタンをクリックする前のメッセージを確認
  const message = page.locator('#message');
  await expect(message).toHaveText('ボタンを押してください。');

  // 3. ボタンをクリックする
  await page.locator('#actionButton').click();

  // 4. ボタンをクリックした後のメッセージを確認
  await expect(message).toHaveText('デプロイ成功！🎉');
});