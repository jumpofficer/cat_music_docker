document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const stopButton = document.getElementById('stopButton');
    const rouletteContainer = document.getElementById('rouletteContainer');
    const selectedCatContainer = document.getElementById('selectedCatContainer'); // 新しく追加
    const randomImage = document.getElementById('randomImage');
    const randomAudio = document.getElementById('randomAudio');
    const loadingSpinner = document.getElementById('loadingSpinner'); // スピナー

    const IMAGE_COUNT = 5; // ルーレットに表示する画像の枚数
    const IMAGE_SIZE = 100; // 各ルーレット画像の幅と高さ（CSSと合わせる）
    const CONTAINER_SIZE = 300; // ルーレットコンテナの幅と高さ（CSSと合わせる）

    let allCatImages = []; // 全ての猫の画像URLを格納する配列

    // 初期化関数：全ての猫の画像URLを取得し、ルーレット画像を生成
    const initializeRoulette = async () => {
        try {
            const response = await fetch('/api/get_all_media'); // 全てのメディア情報を取得する新しいAPIエンドポイントを想定
            const data = await response.json();
            allCatImages = data.images; // 例: { "images": ["url1", "url2", ...], "audios": [...] }

            // 取得した画像URLからランダムに5枚選択してルーレットに配置
            const shuffledImages = [...allCatImages].sort(() => 0.5 - Math.random());
            const imagesToShow = shuffledImages.slice(0, IMAGE_COUNT);

            rouletteContainer.innerHTML = ''; // 既存の画像をクリア
            imagesToShow.forEach((imageUrl, index) => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = `猫の画像 ${index + 1}`;
                img.classList.add('roulette-image');

                // 円形に配置するための計算
                const angle = (360 / IMAGE_COUNT) * index; // 各画像の角度
                const radius = (CONTAINER_SIZE / 2) - (IMAGE_SIZE / 2) - 10; // 円の半径 - 画像サイズの半分 - 余白
                const x = radius * Math.cos(angle * Math.PI / 180);
                const y = radius * Math.sin(angle * Math.PI / 180);

                // 画像の中心が円の中心からずれないように調整
                img.style.left = `${(CONTAINER_SIZE / 2) + x - (IMAGE_SIZE / 2)}px`;
                img.style.top = `${(CONTAINER_SIZE / 2) + y - (IMAGE_SIZE / 2)}px`;
                img.style.transform = `rotate(${angle + 90}deg)`; // 画像の向きを調整する場合

                rouletteContainer.appendChild(img);
            });

            // 初期表示ではルーレットコンテナを表示、選択された画像は非表示
            rouletteContainer.style.display = 'flex';
            selectedCatContainer.style.display = 'none';

        } catch (error) {
            console.error('ルーレットの初期化に失敗しました:', error);
            alert('ルーレットの画像を読み込めませんでした。');
        }
    };

    // ページロード時にルーレットを初期化
    initializeRoulette();

    // 再生ボタンクリック時の処理
    playButton.addEventListener('click', async () => {
        // 現在再生中の音楽があれば停止
        if (!randomAudio.paused) {
            randomAudio.pause();
            randomAudio.currentTime = 0;
        }

        // ローディングスピナーや選択済み画像を非表示に
        loadingSpinner.style.display = 'none'; // 今回は使わないので非表示を明示
        selectedCatContainer.style.display = 'none';

        // ルーレットコンテナを表示
        rouletteContainer.style.display = 'flex';
        rouletteContainer.classList.remove('spinning'); // 以前のアニメーションをリセット
        void rouletteContainer.offsetWidth; // 強制的にリフローさせ、アニメーションをリセット

        // ルーレットの画像を再配置（ランダムに表示される画像を常に変えるため）
        await initializeRoulette(); // 非同期処理なのでawaitで待つ

        // ランダムな猫の情報を取得
        let selectedCatData;
        try {
            const response = await fetch('/api/get_random_media'); // 最終的に選ばれる猫の情報を取得
            selectedCatData = await response.json();
        } catch (error) {
            console.error('最終的な猫の情報の取得に失敗しました:', error);
            alert('猫の情報の取得中にエラーが発生しました。');
            return;
        }

        // ルーレットを回転させる
        rouletteContainer.classList.add('spinning');
        console.log('ルーレットが回転開始！');

        // アニメーション終了後に結果を表示
        // CSSアニメーションのduration（5秒）に合わせる
        setTimeout(() => {
            rouletteContainer.classList.remove('spinning');
            rouletteContainer.style.display = 'none'; // ルーレットを非表示に

            // 選択された猫の画像と音楽を表示
            randomImage.src = selectedCatData.image_url;
            randomAudio.src = selectedCatData.audio_url;

            selectedCatContainer.style.display = 'block'; // 選択された画像コンテナを表示

            randomAudio.play()
                .then(() => {
                    console.log('音楽が再生されました。');
                })
                .catch(error => {
                    console.error('音楽の再生に失敗しました:', error);
                    alert('音楽の再生に失敗しました。ブラウザの設定を確認してください。');
                });

            console.log('ルーレット停止！');
        }, 2500); // ルーレットが回る時間
    });

    // ストップボタンのイベントリスナー
    stopButton.addEventListener('click', () => {
        if (!randomAudio.paused) {
            randomAudio.pause();
            randomAudio.currentTime = 0;
            console.log('音楽が停止されました。');
        } else {
            console.log('音楽は再生されていません。');
        }
        // ルーレットの回転を途中で止める機能は、この実装では含んでいません
        // （複雑になるため、必要であれば別途検討）
    });
});