import { test, expect } from '@playwright/test';

// テスト用のダミーデータ
const VALID_DATA = {
  name: '山田 太郎',
  age: '30',
  email: 'test@example.com',
  plan: '一般参加', // '一般参加' または '会員'
  participants: '2',
};

// テストの開始前に、テスト対象のページにアクセスする
test.beforeEach(async ({ page }) => {
  // ローカルのHTMLファイルを開く
  // ※ file:// のパス指定はプロジェクトのルートディレクトリから実行することを想定
  await page.goto('file://' + process.cwd() + '/index.html');
});

// 正常系のテストケース
test.describe('正常系: フォーム登録', () => {
  test('有効なデータを入力して登録すると、完了ページに正しい情報が表示される', async ({ page }) => {
    // 1. 各フォーム項目に有効なデータを入力する
    await page.locator('#name').fill(VALID_DATA.name);
    await page.locator('#age').fill(VALID_DATA.age);
    await page.locator('#email').fill(VALID_DATA.email);
    await page.getByLabel(VALID_DATA.plan).check();
    await page.locator('#participants').fill(VALID_DATA.participants);

    // 2. 合計金額が正しく計算されていることを確認
    // 一般参加 (5000円) * 2名 = 10,000円
    await expect(page.locator('#total-price')).toHaveText('10,000円');

    // 3. 「登録する」ボタンをクリック
    await page.locator('button[type="submit"]').click();

    // 4. 完了ページ (complete.html) に遷移したことを確認
    await expect(page).toHaveURL(/.*complete\.html/);
    await expect(page).toHaveTitle('登録完了 | テスト設計練習用サイト');

    // 5. 完了ページに表示された登録内容が正しいことを確認
    await expect(page.locator('#display-name')).toHaveText(VALID_DATA.name);
    await expect(page.locator('#display-age')).toHaveText(`${VALID_DATA.age}歳`);
    await expect(page.locator('#display-email')).toHaveText(VALID_DATA.email);
    await expect(page.locator('#display-plan')).toHaveText(VALID_DATA.plan);
    await expect(page.locator('#display-participants')).toHaveText(`${VALID_DATA.participants}名`);
    await expect(page.locator('#display-price')).toHaveText('10,000円');
  });

  test('参加人数が5名以上の場合、10%割引が適用される', async ({ page }) => {
    // 参加人数を5名にして入力
    await page.locator('#name').fill(VALID_DATA.name);
    await page.locator('#age').fill(VALID_DATA.age);
    await page.locator('#email').fill(VALID_DATA.email);
    await page.getByLabel('会員').check(); // 会員プランを選択
    await page.locator('#participants').fill('5');

    // 合計金額を確認 (会員4,000円 * 5名 * 0.9 = 18,000円)
    await expect(page.locator('#total-price')).toHaveText('18,000円');
  });
});

// 異常系のテストケース
test.describe('異常系: バリデーションチェック', () => {
  test('必須項目を空のまま登録しようとすると、エラーメッセージが表示される', async ({ page }) => {
    // 何も入力せずに登録ボタンをクリック
    await page.locator('button[type="submit"]').click();

    // 各エラーメッセージが表示されていることを確認
    await expect(page.locator('#name-error')).toHaveText('氏名は1文字以上50文字以下で入力してください。');
    await expect(page.locator('#age-error')).toHaveText('年齢は18歳以上99歳以下の整数で入力してください。');
    await expect(page.locator('#email-error')).toHaveText('有効なメールアドレスを入力してください。');
    await expect(page.locator('#plan-error')).toHaveText('参加プランを選択してください。');

    // ページが遷移していないことを確認
    await expect(page).toHaveURL(/.*index\.html/);
  });

  test('年齢が範囲外の場合、エラーメッセージが表示される', async ({ page }) => {
    // 17歳を入力
    await page.locator('#age').fill('17');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#age-error')).toHaveText('年齢は18歳以上99歳以下の整数で入力してください。');

    // 100歳を入力
    await page.locator('#age').fill('100');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#age-error')).toHaveText('年齢は18歳以上99歳以下の整数で入力してください。');
  });
});

// イベントステータスのテストケース
test.describe('イベントステータスの制御', () => {
  test('「満員にする」ボタンを押すと、フォームがブロックされる', async ({ page }) => {
    // 「満員にする」ボタンをクリック
    await page.locator('#btn-set-full').click();

    // ステータス表示とブロッカーメッセージが正しいことを確認
    await expect(page.locator('#event-status-text')).toHaveText('満員 (Full)');
    await expect(page.locator('#blocker-message')).toHaveText('満員のため、登録を締め切りました。');
    
    // 登録ボタンが無効になっていることを確認
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

    test('「中止にする」ボタンを押すと、フォームがブロックされる', async ({ page }) => {
    // 「中止にする」ボタンをクリック
    await page.locator('#btn-set-cancelled').click();

    // ステータス表示とブロッカーメッセージが正しいことを確認
    await expect(page.locator('#event-status-text')).toHaveText('開催中止 (Cancelled)');
    await expect(page.locator('#blocker-message')).toHaveText('このイベントは中止になりました。');
    
    // 登録ボタンが無効になっていることを確認
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });
});