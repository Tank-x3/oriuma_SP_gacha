// script.js

// --- グローバル変数 ---
let userInventory = {}; // id -> count
let userStats = {
    totalPulls: 0,
    compRate: 0,
    firstCompDate: null
};

// ガチャ進行管理用
let currentResults = [];
let currentCardIndex = 0; // 今何枚目を見ているか

// --- 初期化 ---
window.onload = function() {
    loadData();
    updateUI();
    setupEventListeners();
};

// --- イベントリスナー設定 ---
function setupEventListeners() {
    // 画面遷移系
    document.getElementById('btn-compendium').onclick = () => showScreen('compendium-screen');
    document.getElementById('btn-options').onclick = () => showScreen('options-screen');
    document.getElementById('btn-home-from-result').onclick = () => showScreen('home-screen');
    document.getElementById('btn-home-from-compendium').onclick = () => showScreen('home-screen');
    document.getElementById('btn-home-from-options').onclick = () => showScreen('home-screen');

    // ガチャ実行系
    document.getElementById('btn-draw-10').onclick = startGacha;
    document.getElementById('btn-retry').onclick = startGacha;
    
    // ガチャ演出系 (フェーズ進行)
    document.getElementById('gacha-cover').onclick = openGachaBook;    // 表紙 -> 山札
    document.getElementById('deck-container').onclick = drawNextCard;  // 山札 -> 1枚表示
    document.getElementById('single-card-wrapper').onclick = drawNextCard; // 1枚表示 -> 次のカード
    document.getElementById('btn-next-card').onclick = drawNextCard;       // ボタンでも次へ

    document.getElementById('btn-skip').onclick = showResults;

    // データ管理系
    document.getElementById('btn-copy').onclick = copyExportData;
    document.getElementById('btn-import').onclick = importData;
    document.getElementById('btn-clear').onclick = clearData;

    // モーダル
    document.querySelector('.close-modal').onclick = () => {
        document.getElementById('card-modal').style.display = "none";
    };
    window.onclick = (event) => {
        if (event.target == document.getElementById('card-modal')) {
            document.getElementById('card-modal').style.display = "none";
        }
    };
}

// --- 画面遷移管理 ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'compendium-screen') renderCompendium();
    if (screenId === 'options-screen') prepareExportData();
    if (screenId === 'home-screen') updateUI();
}

// --- ガチャロジック ---
function startGacha() {
    currentResults = [];
    currentCardIndex = 0; // リセット
    
    // 10回抽選
    for (let i = 0; i < 10; i++) {
        currentResults.push(drawOneCard());
    }

    // 履歴更新と保存
    userStats.totalPulls += 10;
    currentResults.forEach(card => {
        if (!userInventory[card.id]) {
            userInventory[card.id] = 0;
        }
        userInventory[card.id]++;
    });
    saveData();

    // 画面切り替え：ホーム -> ガチャ演出(表紙)
    showScreen('gacha-screen');
    resetGachaAnimation();
}

function drawOneCard() {
    const rand = Math.random();
    let selectedRarity = "R";

    if (rand < RARITY.SSR.rate) {
        selectedRarity = "SSR";
    } else if (rand < RARITY.SSR.rate + RARITY.SR.rate) {
        selectedRarity = "SR";
    }

    const pool = CARD_DATA.filter(c => c.rarity === selectedRarity);
    if (pool.length === 0) return CARD_DATA[0];

    const cardIndex = Math.floor(Math.random() * pool.length);
    return pool[cardIndex];
}

// --- ガチャ演出制御 ---

// Phase 1: 表紙を表示してリセット
function resetGachaAnimation() {
    document.getElementById('gacha-cover').style.display = 'flex';
    document.getElementById('gacha-deck-view').style.display = 'none';
    document.getElementById('gacha-single-view').style.display = 'none';
}

// Phase 2: 山札（デッキ）を表示
function openGachaBook() {
    document.getElementById('gacha-cover').style.display = 'none';
    document.getElementById('gacha-deck-view').style.display = 'flex';
    renderDeck();
}

// 山札を描画（重なりと付箋）
function renderDeck() {
    const container = document.getElementById('deck-container');
    container.innerHTML = '';

    // カードの横幅（CSSと合わせる）
    const cardWidth = 240;
    // 付箋の幅を計算（カード幅 ÷ 10枚）
    const tabWidth = cardWidth / 10;

    for (let i = 0; i < 10; i++) {
        const card = currentResults[i];
        const el = document.createElement('div');
        el.className = 'deck-card';
        
        // 重なり順: 手前(0)が一番上
        el.style.zIndex = 10 - i;

        // 【修正点】カード本体はずらさず、ほぼ同じ位置に重ねる
        // （少しだけずらすと「厚み」が出て本っぽくなります）
        el.style.transform = `translate(${i * 2}px, ${i * 2}px)`;

        // 付箋 (Sticky Note)
        const sticky = document.createElement('div');
        sticky.className = `sticky-note sticky-${card.rarity}`;
        
        // 【重要】付箋の位置を計算して横に並べる
        // 0枚目は左端、1枚目はその隣...というように配置
        sticky.style.width = `${tabWidth - 2}px`; // 隣とくっつきすぎないよう-2px
        sticky.style.left = `${i * tabWidth}px`; 
        
        el.appendChild(sticky);
        container.appendChild(el);
    }
}

// Phase 3: 1枚めくる
function drawNextCard() {
    // もし全てのカードを見終わっていたら結果画面へ
    if (currentCardIndex >= 10) {
        showResults();
        return;
    }

    // 画面切り替え：山札 -> シングル表示
    document.getElementById('gacha-deck-view').style.display = 'none';
    document.getElementById('gacha-single-view').style.display = 'flex';

    const card = currentResults[currentCardIndex];
    const wrapper = document.getElementById('single-card-wrapper');
    wrapper.innerHTML = ''; // クリア

    // カード生成
    const el = createFullCardElement(card);
    wrapper.appendChild(el);

    // 次のカードへ進める準備
    currentCardIndex++;
}

// 大きなカードのHTML生成
function createFullCardElement(card) {
    const el = document.createElement('div');
    el.className = 'gacha-card';
    el.setAttribute('data-rarity', card.rarity);
    
    const typeInfo = TYPES[card.type] || {name: "??", icon: "?"};

    el.innerHTML = `
        <div class="card-type-icon">${typeInfo.icon}</div>
        <div class="card-rarity-label">${card.rarity}</div>
        <div class="card-title">${card.title}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-flavor">${card.text}</div>
    `;
    return el;
}

// Phase 4: 結果一覧
function showResults() {
    showScreen('result-screen');
    const grid = document.getElementById('result-grid');
    grid.innerHTML = '';

    currentResults.forEach(card => {
        const el = createFullCardElement(card); // 同じ構造を使う
        el.onclick = () => showCardDetail(card); // クリックでモーダル詳細
        grid.appendChild(el);
    });
}

// --- 名鑑 & 詳細表示 ---
function renderCompendium() {
    const grid = document.getElementById('compendium-grid');
    grid.innerHTML = '';
    let acquiredCount = 0;
    
    CARD_DATA.forEach(card => {
        const count = userInventory[card.id] || 0;
        const isAcquired = count > 0;
        if (isAcquired) acquiredCount++;

        const div = document.createElement('div');
        div.className = `comp-item ${isAcquired ? 'acquired' : 'not-acquired'}`;
        div.innerText = isAcquired ? card.name : "???";
        div.onclick = () => {
            if (isAcquired) showCardDetail(card);
        };
        grid.appendChild(div);
    });

    const total = CARD_DATA.length;
    const rate = Math.floor((acquiredCount / total) * 100);
    document.getElementById('comp-rate').innerText = `${rate}%`;
    document.getElementById('comp-count').innerText = acquiredCount;
    document.getElementById('total-types').innerText = total;
}

function showCardDetail(card) {
    const modal = document.getElementById('card-modal');
    const typeInfo = TYPES[card.type] || {name: "??", icon: "?"};

    document.getElementById('modal-rarity').innerText = card.rarity;
    document.getElementById('modal-type').innerText = `${typeInfo.icon} ${typeInfo.name}`;
    document.getElementById('modal-title').innerText = card.title;
    document.getElementById('modal-name').innerText = card.name;
    document.getElementById('modal-text').innerText = card.text;
    document.getElementById('modal-count').innerText = userInventory[card.id] || 0;

    modal.style.display = "block";
}

// --- データ保存・読み込み ---
const STORAGE_KEY = 'oriuma_gacha_v1';

function saveData() {
    const data = {
        inventory: userInventory,
        stats: userStats
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateUI();
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            userInventory = parsed.inventory || {};
            userStats = parsed.stats || { totalPulls: 0, compRate: 0 };
        } catch (e) {
            console.error("Save data corrupted", e);
        }
    }
}

function updateUI() {
    document.getElementById('total-pulls').innerText = userStats.totalPulls;
}

function prepareExportData() {
    const data = { inventory: userInventory, stats: userStats };
    document.getElementById('export-area').value = JSON.stringify(data);
}

function copyExportData() {
    const textArea = document.getElementById('export-area');
    textArea.select();
    document.execCommand('copy');
    alert("コピーしました！");
}

function importData() {
    const input = document.getElementById('import-area').value;
    try {
        const parsed = JSON.parse(input);
        if (parsed.inventory && parsed.stats) {
            userInventory = parsed.inventory;
            userStats = parsed.stats;
            saveData();
            alert("データを復元しました。");
            showScreen('home-screen');
        } else {
            throw new Error("Missing required fields");
        }
    } catch (e) {
        // ユーザー向けのエラーメッセージに差し替え
        alert("データ形式が正しくありません。\nコピーしたテキストが正しいか確認してください。");
        console.error("Import Error:", e);
    }
}

function clearData() {
    if (confirm("本当にデータを全て消去しますか？")) {
        localStorage.removeItem(STORAGE_KEY);
        userInventory = {};
        userStats = { totalPulls: 0, compRate: 0 };
        updateUI();
        alert("データをリセットしました。");
        showScreen('home-screen');
    }
}