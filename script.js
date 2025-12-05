// script.js

// --- グローバル変数 ---
let userInventory = {}; 
let userStats = {
    totalPulls: 0,
    compRate: 0,
    firstCompDate: null
};

let currentResults = [];
let currentCardIndex = 0; 
let gachaState = {
    maxRarity: 'R', 
    specialCutin: null 
};

// ★修正: flavor_data.js で定義済みの変数を参照するため、ここでの再宣言(const)を削除しました
// データが存在しない場合のフォールバックは使用箇所で行うか、flavor_data.jsの読み込みを必須とします。

window.onload = function() {
    loadData();
    updateUI();
    setupEventListeners();
};

function setupEventListeners() {
    document.getElementById('btn-compendium').onclick = () => showScreen('compendium-screen');
    document.getElementById('btn-options').onclick = () => showScreen('options-screen');
    document.getElementById('btn-home-from-result').onclick = () => showScreen('home-screen');
    document.getElementById('btn-home-from-compendium').onclick = () => showScreen('home-screen');
    document.getElementById('btn-home-from-options').onclick = () => showScreen('home-screen');

    document.getElementById('btn-draw-10').onclick = startGacha;
    document.getElementById('btn-retry').onclick = startGacha;
    
    document.getElementById('gacha-cover').onclick = openGachaBook;    
    document.getElementById('deck-container').onclick = handleDeckClick; 
    
    document.getElementById('single-card-wrapper').onclick = returnToDeck; 
    document.getElementById('btn-next-card').onclick = returnToDeck;       
    document.getElementById('btn-skip-to-result').onclick = showResults;

    document.getElementById('btn-copy').onclick = copyExportData;
    document.getElementById('btn-import').onclick = importData;
    document.getElementById('btn-clear').onclick = clearData;
    
    // フィルターの即時反映
    document.getElementById('chk-ssr').onchange = renderCompendium;
    document.getElementById('chk-sr').onchange = renderCompendium;
    document.getElementById('chk-r').onchange = renderCompendium;

    document.querySelector('.close-modal').onclick = () => {
        document.getElementById('card-modal').style.display = "none";
    };
    window.onclick = (event) => {
        if (event.target == document.getElementById('card-modal')) {
            document.getElementById('card-modal').style.display = "none";
        }
    };
}

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
    currentCardIndex = 0;
    
    gachaState.maxRarity = 'R';
    gachaState.specialCutin = null;
    
    for (let i = 0; i < 10; i++) {
        const cardData = drawOneCard();
        
        if (cardData.rarity === 'SSR') gachaState.maxRarity = 'SSR';
        else if (cardData.rarity === 'SR' && gachaState.maxRarity !== 'SSR') gachaState.maxRarity = 'SR';

        // グローバルの SPECIAL_CUTINS を参照
        if (cardData.specialEffect && typeof SPECIAL_CUTINS !== 'undefined' && SPECIAL_CUTINS[cardData.specialEffect] && gachaState.specialCutin === null) {
            if (Math.random() < CONFIG.CUTIN_CHANCE) {
                const cutinDef = SPECIAL_CUTINS[cardData.specialEffect];
                gachaState.specialCutin = {
                    charName: cutinDef.charName || cardData.name,
                    text: cutinDef.text,
                    image: cutinDef.image
                };
            }
        }
        
        let isPromotion = false;
        let displayRarity = cardData.rarity;
        
        const rand = Math.random();
        if (cardData.rarity === 'SSR') {
            if (rand < CONFIG.PROMOTION.SSR.APPEAR_AS_R) { displayRarity = 'R'; isPromotion = true; }
            else if (rand < CONFIG.PROMOTION.SSR.APPEAR_AS_R + CONFIG.PROMOTION.SSR.APPEAR_AS_SR) { displayRarity = 'SR'; isPromotion = true; }
        } else if (cardData.rarity === 'SR') {
            if (rand < CONFIG.PROMOTION.SR.APPEAR_AS_R) { displayRarity = 'R'; isPromotion = true; }
        }

        currentResults.push({
            data: cardData,
            realRarity: cardData.rarity,
            displayRarity: displayRarity,
            isPromotion: isPromotion,
            isRevealed: false
        });
    }

    userStats.totalPulls += 10;
    currentResults.forEach(item => {
        const id = item.data.id;
        if (!userInventory[id]) userInventory[id] = 0;
        userInventory[id]++;
    });
    saveData();
    setupCover();
    showScreen('gacha-screen');
    resetGachaAnimation();
}

function drawOneCard() {
    const rand = Math.random();
    let selectedRarity = "R";
    
    if (rand < CONFIG.RATES.SSR) selectedRarity = "SSR";
    else if (rand < CONFIG.RATES.SSR + CONFIG.RATES.SR) selectedRarity = "SR";
    
    const pool = CARD_DATA.filter(c => c.rarity === selectedRarity);
    if (pool.length === 0) return CARD_DATA[0];
    const cardIndex = Math.floor(Math.random() * pool.length);
    return pool[cardIndex];
}

// --- 演出 ---
function setupCover() {
    const textArea = document.getElementById('cover-text-area');
    textArea.className = 'cover-text';
    textArea.classList.add(`expect-${gachaState.maxRarity}`);
    
    // グローバルの FLAVOR_TEXTS を参照
    const flavorSource = (typeof FLAVOR_TEXTS !== 'undefined') ? FLAVOR_TEXTS : { R:[], SR:[], SSR:[] };
    const lines = flavorSource[gachaState.maxRarity];
    const line = lines && lines.length > 0 ? lines[Math.floor(Math.random() * lines.length)] : "TAP TO OPEN";
    textArea.innerText = line;
}

function resetGachaAnimation() {
    document.getElementById('gacha-cover').style.display = 'flex';
    document.getElementById('gacha-deck-view').style.display = 'none';
    document.getElementById('gacha-single-view').style.display = 'none';
    document.getElementById('promotion-flash').classList.remove('flash-active');
    document.getElementById('cutin-overlay').style.display = 'none';
}

function openGachaBook() {
    if (gachaState.specialCutin) {
        const cutin = document.getElementById('cutin-overlay');
        document.getElementById('cutin-text').innerText = gachaState.specialCutin.text;
        document.getElementById('cutin-char').innerText = gachaState.specialCutin.charName;
        const cutinImg = document.getElementById('cutin-img');
        if (gachaState.specialCutin.image) {
            cutinImg.src = gachaState.specialCutin.image;
            cutinImg.style.display = 'block';
        } else {
            cutinImg.style.display = 'none';
        }
        cutin.style.display = 'flex';
        setTimeout(() => {
            cutin.style.display = 'none';
            document.getElementById('gacha-cover').style.display = 'none';
            document.getElementById('gacha-deck-view').style.display = 'flex';
            renderDeck();
        }, 2000);
    } else {
        document.getElementById('gacha-cover').style.display = 'none';
        document.getElementById('gacha-deck-view').style.display = 'flex';
        renderDeck();
    }
}

function renderDeck() {
    const container = document.getElementById('deck-container');
    container.innerHTML = '';
    const cardWidth = 240;
    const tabWidth = cardWidth / 10;

    for (let i = currentCardIndex; i < 10; i++) {
        const item = currentResults[i];
        const el = document.createElement('div');
        el.className = `deck-card rarity-${item.displayRarity}`;
        if (i === currentCardIndex) el.classList.add('is-top');
        el.style.zIndex = 10 - i;
        const offsetIndex = i - currentCardIndex;
        el.style.transform = `translate(${offsetIndex * 5}px, 0px)`;
        const sticky = document.createElement('div');
        sticky.className = `sticky-note sticky-${item.displayRarity}`;
        sticky.style.width = `${tabWidth - 2}px`;
        sticky.style.left = `${i * tabWidth}px`; 
        el.appendChild(sticky);
        container.appendChild(el);
    }
}

function handleDeckClick() {
    if (currentCardIndex >= 10) { showResults(); return; }
    const item = currentResults[currentCardIndex];
    const container = document.getElementById('deck-container');
    const topCardEl = container.children[0]; 
    const flash = document.getElementById('promotion-flash');
    flash.classList.remove('flash-active');
    if (item.isPromotion) {
        void flash.offsetWidth; 
        flash.classList.add('flash-active');
        topCardEl.className = `deck-card is-top rarity-${item.realRarity}`;
        const sticky = topCardEl.querySelector('.sticky-note');
        sticky.className = `sticky-note sticky-${item.realRarity}`;
        setTimeout(() => { flash.classList.remove('flash-active'); openSingleView(item); }, 500);
    } else {
        openSingleView(item);
    }
}

function openSingleView(item) {
    document.getElementById('gacha-deck-view').style.display = 'none';
    document.getElementById('gacha-single-view').style.display = 'flex';
    const wrapper = document.getElementById('single-card-wrapper');
    wrapper.innerHTML = ''; 
    const el = createFullCardElement(item.data);
    wrapper.appendChild(el);
    item.isRevealed = true;
}

function returnToDeck() {
    currentCardIndex++;
    if (currentCardIndex >= 10) showResults();
    else {
        document.getElementById('gacha-single-view').style.display = 'none';
        document.getElementById('gacha-deck-view').style.display = 'flex';
        renderDeck();
    }
}

function createFullCardElement(cardData) {
    const el = document.createElement('div');
    el.className = 'gacha-card';
    el.setAttribute('data-rarity', cardData.rarity);
    const typeInfo = TYPES[cardData.type] || {name: "??", icon: "?"};
    el.innerHTML = `
        <div class="card-type-icon">${typeInfo.icon}</div>
        <div class="card-rarity-label">${cardData.rarity}</div>
        <div class="card-title">${cardData.title || ''}</div>
        <div class="card-name">${cardData.name}</div>
        <div class="card-flavor">${cardData.text}</div>
    `;
    return el;
}

function showResults() {
    showScreen('result-screen');
    const grid = document.getElementById('result-grid');
    grid.innerHTML = '';
    currentResults.forEach(item => {
        const el = createFullCardElement(item.data); 
        el.onclick = () => showCardDetail(item.data);
        grid.appendChild(el);
    });
}

// --- カードアルバム（名鑑）機能 ---
function renderCompendium() {
    const grid = document.getElementById('compendium-grid');
    grid.innerHTML = '';
    
    // 1. 全カードをレア度>ID順にソートしてコピー
    const rarityVal = { "SSR": 3, "SR": 2, "R": 1 };
    
    const sortedCards = [...CARD_DATA].sort((a, b) => {
        const rA = rarityVal[a.rarity] || 0;
        const rB = rarityVal[b.rarity] || 0;
        if (rA !== rB) return rB - rA; 
        return a.id.localeCompare(b.id);
    });

    // 2. フィルタリング状態取得
    const showSSR = document.getElementById('chk-ssr').checked;
    const showSR  = document.getElementById('chk-sr').checked;
    const showR   = document.getElementById('chk-r').checked;

    // 3. 集計用
    let stats = {
        SSR: { total: 0, acquired: 0 },
        SR:  { total: 0, acquired: 0 },
        R:   { total: 0, acquired: 0 },
        All: { total: 0, acquired: 0 }
    };

    sortedCards.forEach(card => {
        const r = card.rarity;
        const count = userInventory[card.id] || 0;
        const isAcquired = count > 0;
        
        // 集計
        if (stats[r]) {
            stats[r].total++;
            if (isAcquired) stats[r].acquired++;
        }
        stats.All.total++;
        if (isAcquired) stats.All.acquired++;

        // 表示フィルターチェック
        if (r === 'SSR' && !showSSR) return;
        if (r === 'SR' && !showSR) return;
        if (r === 'R' && !showR) return;

        // アイテム生成
        const div = document.createElement('div');
        div.className = `comp-item ${isAcquired ? 'acquired' : 'not-acquired'}`;
        div.onclick = () => { if (isAcquired) showCardDetail(card); };

        // 中身: タイトル + キャラ名
        if (isAcquired) {
            div.innerHTML = `
                <div class="comp-title">${card.title || ''}</div>
                <div class="comp-name">${card.name}</div>
            `;
        } else {
            div.innerHTML = `<div class="comp-name">???</div>`;
        }
        
        grid.appendChild(div);
    });

    // 4. 集計表示更新
    const calcRate = (acq, tot) => tot === 0 ? 0 : Math.floor((acq / tot) * 100);
    
    document.getElementById('compendium-stats').innerHTML = `
        <div style="font-weight:bold; margin-bottom:5px;">コンプリート率: ${calcRate(stats.All.acquired, stats.All.total)}% (${stats.All.acquired}/${stats.All.total})</div>
        <div class="stat-row">
            <div class="stat-item stat-SSR">SSR: <span>${calcRate(stats.SSR.acquired, stats.SSR.total)}% (${stats.SSR.acquired}/${stats.SSR.total})</span></div>
            <div class="stat-item stat-SR">SR: <span>${calcRate(stats.SR.acquired, stats.SR.total)}% (${stats.SR.acquired}/${stats.SR.total})</span></div>
            <div class="stat-item stat-R">R: <span>${calcRate(stats.R.acquired, stats.R.total)}% (${stats.R.acquired}/${stats.R.total})</span></div>
        </div>
    `;
}

function showCardDetail(card) {
    const modal = document.getElementById('card-modal');
    const typeInfo = TYPES[card.type] || {name: "??", icon: "?"};
    document.getElementById('modal-rarity').innerText = card.rarity;
    document.getElementById('modal-type').innerText = `${typeInfo.icon} ${typeInfo.name}`;
    document.getElementById('modal-title').innerText = card.title || '';
    document.getElementById('modal-name').innerText = card.name;
    document.getElementById('modal-text').innerText = card.text;
    document.getElementById('modal-count').innerText = userInventory[card.id] || 0;
    modal.style.display = "block";
}

const STORAGE_KEY = 'oriuma_gacha_v1';
function saveData() {
    const data = { inventory: userInventory, stats: userStats };
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
        } catch (e) { console.error("Save data corrupted", e); }
    }
}
function updateUI() { document.getElementById('total-pulls').innerText = userStats.totalPulls; }
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
        } else { throw new Error("Missing required fields"); }
    } catch (e) {
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