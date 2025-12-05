// flavor_data.js
// テキスト、セリフ、カットイン定義

// 期待度別 表紙セリフ
const FLAVOR_TEXTS = {
    "R": [
        "TAP TO OPEN",
        "良い風が吹いているね",
        "トレーニング日和だ",
        "ゲートイン完了！",
        "まあまあな感じ？"
    ],
    "SR": [
        "おっ、これは…？",
        "期待していいかも！",
        "良い予感がするよ！",
        "気合十分！！"
    ],
    "SSR": [
        "激アツです！！",
        "奇跡が起きる予感…！",
        "最高の結果を君に！",
        "これが…運命の出会い！？"
    ]
};

// 特殊カットイン定義
// key: data.js の specialEffect ID と一致させる
const SPECIAL_CUTINS = {
    "tank_cutin": {
        "charName": "タンクタンクタンク",
        "text": "「……ふふっ」",
        "image": "images\\cutin_tank.png\""
    }
};
