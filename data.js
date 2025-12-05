// data.js
// オリウマサポートカードガチャ データ定義

const RARITY = {
    SSR: { id: "SSR", rate: 0.03, color: "#e8b646", text: "SSR" }, 
    SR:  { id: "SR",  rate: 0.18, color: "#c0c0c0", text: "SR" },
    R:   { id: "R",   rate: 0.79, color: "#cd7f32", text: "R" }
};

const TYPES = {
    SPEED:   { id: "speed",   name: "スピード", icon: "⚡" },
    STAMINA: { id: "stamina", name: "スタミナ", icon: "❤️" },
    POWER:   { id: "power",   name: "パワー",   icon: "💪" },
    GUTS:    { id: "guts",    name: "根性",     icon: "🔥" },
    WISDOM:  { id: "wisdom",  name: "賢さ",     icon: "🎓" },
    FRIEND:  { id: "friend",  name: "友人",     icon: "🧢" },
    GROUP:   { id: "group",   name: "グループ", icon: "🤝" }
};

// カードリスト (自動採番済み)
const CARD_DATA = [
    {
        "id": "ssr_001",
        "rarity": "SSR",
        "type": "SPEED",
        "title": "[疾風の如く]",
        "name": "サイレンススズカ",
        "text": "先頭の景色は、誰にも譲らない。",
        "specialEffect": null
    },
    {
        "id": "ssr_002",
        "rarity": "SSR",
        "type": "POWER",
        "title": "[重戦車]",
        "name": "タンクタンクタンク",
        "text": "いつでも全力前進あるのみっす！",
        "specialEffect": "tank_cutin"
    },
    {
        "id": "sr_001",
        "rarity": "SR",
        "type": "WISDOM",
        "title": "[名トレーナー]",
        "name": "橋本トレーナー",
        "text": "次走は……アイビスSD！",
        "specialEffect": null
    },
    {
        "id": "sr_002",
        "rarity": "SR",
        "type": "STAMINA",
        "title": "[おやつの時間]",
        "name": "スペシャルウィーク(仮)",
        "text": "もう食べられないよぉ…嘘です！",
        "specialEffect": null
    },
    {
        "id": "sr_003",
        "rarity": "SR",
        "type": "GUTS",
        "title": "[不屈の闘志]",
        "name": "テストオリウマA",
        "text": "ここからが本番よ！",
        "specialEffect": null
    },
    {
        "id": "sr_004",
        "rarity": "SR",
        "type": "WISDOM",
        "title": "[お助けマーチャン参上、です]",
        "name": "アストンマーチャン",
        "text": "おや、マーチャンの出番ですか。そうですね。では、お力になりましょう。",
        "image": null,
        "specialEffect": null
    },
    {
        "id": "r_001",
        "rarity": "R",
        "type": "SPEED",
        "title": "[トレセン学園]",
        "name": "モブウマ娘A",
        "text": "今日もトレーニング頑張ろう！",
        "specialEffect": null
    },
    {
        "id": "r_002",
        "rarity": "R",
        "type": "POWER",
        "title": "[トレセン学園]",
        "name": "モブウマ娘B",
        "text": "筋トレこそ正義。",
        "specialEffect": null
    },
    {
        "id": "r_003",
        "rarity": "R",
        "type": "FRIEND",
        "title": "[サポート]",
        "name": "秋川理事長(仮)",
        "text": "豪快！",
        "specialEffect": null
    },
    {
        "id": "r_004",
        "rarity": "R",
        "type": "GROUP",
        "title": "[チーム]",
        "name": "チームスピカ(仮)",
        "text": "みんなで走れば怖くない。",
        "specialEffect": null
    },
    {
        "id": "r_005",
        "rarity": "R",
        "type": "WISDOM",
        "title": "[勉強中]",
        "name": "モブウマ娘C",
        "text": "テスト勉強もしなきゃ…",
        "specialEffect": null
    }
];
