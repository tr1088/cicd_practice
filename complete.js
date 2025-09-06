document.addEventListener('DOMContentLoaded', () => {
    // URLからキー情報を取得
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');

    // 取得したキーを使ってlocalStorageからデータを取得
    const registrationDataJSON = key ? localStorage.getItem(key) : null;

    if (registrationDataJSON) {
        // JSON文字列をオブジェクトに変換
        const data = JSON.parse(registrationDataJSON);

        // データをHTML要素に表示
        document.getElementById('display-name').textContent = data.name;
        document.getElementById('display-age').textContent = `${data.age}歳`;
        document.getElementById('display-email').textContent = data.email;
        document.getElementById('display-plan').textContent = data.planName;
        document.getElementById('display-participants').textContent = `${data.participants}名`;
        document.getElementById('display-price').textContent = data.price;

        // 一度表示したら不要なデータを消去する（リロード時に再表示されないように）
        // localStorage.removeItem('registrationData'); 
        // ↑必要であればコメントアウトを解除

    } else {
        // データがない場合（直接URLにアクセスした場合など）
        const container = document.querySelector('.completion-container');
        container.innerHTML = '<h2>データが見つかりません</h2><p>登録フォームから正しい手順で登録を行ってください。</p><a href="index.html" class="back-link">登録画面に戻る</a>';
    }
});