document.addEventListener('DOMContentLoaded', () => {
    // 要素を取得する
    const form = document.getElementById('registration-form');
    const planRadios = document.querySelectorAll('input[name="plan"]');
    const participantsInput = document.getElementById('participants');
    const totalPriceEl = document.getElementById('total-price');
    
    // イベントステータスを制御するための要素
    const statusText = document.getElementById('event-status-text');
    const formBlocker = document.getElementById('form-blocker');
    const blockerMessage = document.getElementById('blocker-message');
    const submitBtn = document.getElementById('submit-btn');

     // イベントステータスに応じてフォームの有効/無効を切り替える
    const updateFormState = (status) => {
        statusText.classList.remove('full', 'cancelled');
        if (status === 'Open') {
            statusText.textContent = '募集中 (Open)';
            formBlocker.classList.remove('active');
            submitBtn.disabled = false;
        } else {
            formBlocker.classList.add('active');
            submitBtn.disabled = true;
            if (status === 'Full') {
                statusText.textContent = '満員 (Full)';
                statusText.classList.add('full');
                blockerMessage.textContent = '満員のため、登録を締め切りました。';
            } else if (status === 'Cancelled') {
                statusText.textContent = '開催中止 (Cancelled)';
                statusText.classList.add('cancelled');
                blockerMessage.textContent = 'このイベントは中止になりました。';
            }
        }
    };

    // 各ボタンがクリックされたら、ステータスを更新する
    document.getElementById('btn-set-full').addEventListener('click', () => updateFormState('Full'));
    document.getElementById('btn-set-cancelled').addEventListener('click', () => updateFormState('Cancelled'));
    document.getElementById('btn-reset-status').addEventListener('click', () => updateFormState('Open'));

    // 選択されたプランと人数に応じて合計金額を計算・表示する
    const calculatePrice = () => {
        const selectedPlan = document.querySelector('input[name="plan"]:checked');
        const planPrice = selectedPlan ? parseInt(selectedPlan.value, 10) : 0;
        const participants = parseInt(participantsInput.value, 10);
        if (isNaN(participants) || participants < 1 || planPrice === 0) {
            totalPriceEl.textContent = '0円';
            return;
        }
        let totalPrice = planPrice * participants;
        // 5名以上の場合は10%割引を適用
        if (participants >= 5) {
            totalPrice *= 0.90;
        }
        totalPriceEl.textContent = `${Math.floor(totalPrice).toLocaleString()}円`;
    };
    // プラン選択や人数入力が変更されるたびに、金額を再計算する
    planRadios.forEach(radio => radio.addEventListener('change', calculatePrice));
    participantsInput.addEventListener('input', calculatePrice);
    
    // 「登録する」ボタンがクリックされたときの処理
    form.addEventListener('submit', (e) => {
        // デフォルトの送信動作（ページリロード）を防ぐ
        e.preventDefault();
        // 前回のエラーメッセージをリセット
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        let isValid = true;
        
        // 入力値のバリデーション
        const nameInput = document.getElementById('name');
        if (nameInput.value.length < 1 || nameInput.value.length > 50) {
            document.getElementById('name-error').textContent = '氏名は1文字以上50文字以下で入力してください。';
            isValid = false;
        }
        const ageInput = document.getElementById('age');
        const age = parseInt(ageInput.value, 10);
        if (isNaN(age) || age < 18 || age > 99) {
            document.getElementById('age-error').textContent = '年齢は18歳以上99歳以下の整数で入力してください。';
            isValid = false;
        }
        const emailInput = document.getElementById('email');
        // メールアドレスの形式をチェックするための正規表現
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.match(emailRegex)) {
            document.getElementById('email-error').textContent = '有効なメールアドレスを入力してください。';
            isValid = false;
        }
        const selectedPlanRadio = document.querySelector('input[name="plan"]:checked');
        if (!selectedPlanRadio) {
            document.getElementById('plan-error').textContent = '参加プランを選択してください。';
            isValid = false;
        }
        const participantsVal = parseInt(participantsInput.value, 10);
        if (isNaN(participantsVal) || participantsVal < 1 || participantsVal > 10) {
             document.getElementById('participants-error').textContent = '参加人数は1人以上10人以下の整数で入力してください。';
            isValid = false;
        }
        
        // 全てのバリデーションを通過した場合のみ、次の処理へ進む
        if (isValid) {
            // 登録データをオブジェクトにまとめる
            const registrationData = {
                name: nameInput.value,
                age: ageInput.value,
                email: emailInput.value,
                planName: selectedPlanRadio.dataset.planName,
                participants: participantsInput.value,
                price: totalPriceEl.textContent
            };

            // localStorageにデータを保存
            // 現在の日時を取得
            const now = new Date();

            // 各要素を取得し、必要に応じて0を補完（ゼロパディング）
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

            // yyyymmddhhmmss形式の文字列を作成
            const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
            const uniqueKey = `registrationData-${timestamp}`;

            // 作成したユニークなキーでlocalStorageにデータを保存
            localStorage.setItem(uniqueKey, JSON.stringify(registrationData));

            // 登録完了ページに、どのキーで保存したかを伝えながら遷移
            window.location.href = `complete.html?key=${uniqueKey}`;
        }
    });

    // ページ表示時の初期化処理
    calculatePrice();
    updateFormState('Open');
});