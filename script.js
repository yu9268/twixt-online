// 基本設定
const SIZE = 24;
const CELL = 30;
const OFFSET = 40;
const PEG_RADIUS = 6;
let hover = null; // {row, col} または null

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const game = new Twixt(SIZE); // Twixt.jsのロジック
let currentPlayer = "white"; // white -> blackのターン性


// 座標変換
function getGridPos(x, y) {
    const col = Math.round((x - OFFSET) / CELL);
    const row = Math.round((y - OFFSET) / CELL);
    if (col < 0 || col >= SIZE || row < 0 || row >= SIZE) return null;
    return { row, col };
}


// クリックイベント
canvas.addEventListener("click", (e)=> {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    

    const g = getGridPos(x, y);
    if (!g) return;

    // 表示用: A〜V
    const X = String.fromCharCode("A".charCodeAt(0) + (g.col));
    const Y = g.row; // そのまま1〜22
    console.log("===== クリック情報 =====");
    console.log("Twixt座標:", `${X}${Y}`);
    console.log("Canvas座標:", `x=${x}, y=${y}`);
    console.log("内部座標:", `col=${g.col}, row=${g.row}`);
    console.log("========================");

    // 内側22×22以外は特殊扱い
    // col = 0 または 23 は黒外周
    if (((g.col === 0 || g.col === 23) && currentPlayer === 'black')) {
        console.log("黒はおけません。: col=", g.col, "row=", g.row);
        return;
    }

    // row = 0 または 23 は白外周
    if (((g.row === 0 || g.row === 23) && currentPlayer === 'white')) {
        console.log("白はおけません。： col=", g.col, "row=", g.row);
        return;
    }


    // --- デバッグ表示 ---

    // Twixt.js内部用は旧方式 (col,rowそのまま)
    const X_internal = String.fromCharCode("A".charCodeAt(0) + g.col);
    const Y_internal = ("0" + (g.row)).slice(-2);

    const ok = game.setPeg(X_internal, Y_internal, currentPlayer, true);



    if (ok) {

        const win = checkWin();
        if (win) {
            alert(currentPlayer + "の勝利！");
        }

        currentPlayer = currentPlayer === "white" ? "black" : "white";
    }

    draw();
});

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const g = getGridPos(x, y);

    // 内側 22×22 だけホバー対象
    if (g && g.col >= 1 && g.col <= 22 && g.row >= 1 && g.row <= 22) {
        hover = g;
    } else {
        hover = null;
    }

    draw();
});

function drawHighlight() {
    if (!hover) return;

    const { col, row } = hover;
    const x = OFFSET + CELL * col;
    const y = OFFSET + CELL * row;

    ctx.beginPath();
    ctx.arc(x, y, PEG_RADIUS + 4, 0, Math.PI * 2); // ピンより少し大きい円
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
}



// 描画
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawLabels();      // ラベル
    drawGrid();        // 穴
    drawInnerBorder(); // 22×22枠
    drawLinks();
    drawPegs();
    drawHighlight();
}

function drawGrid() {
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;

    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const x = i * CELL + OFFSET;
            const y = j * CELL + OFFSET;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawPegs() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const cell = game.map[i][j];
            if (!cell.color) continue;

            const x = i * CELL + OFFSET;
            const y = j * CELL + OFFSET;

            ctx.beginPath();
            ctx.fillStyle = cell.color === "white" ? "white" : "black";
            ctx.strokeStyle = cell.color === "white" ? "black" : "black";
            ctx.lineWidth = 2;
            ctx.arc(x, y, PEG_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
}

function drawLinks() {
    const dirs = [
        [1, -2], [2, -1], [2, 1], [1, 2],
        [-1, 2], [-2, 1], [-2, -1], [-1, -2],
    ];

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const cell = game.map[i][j];
            for (let d = 0; d < 8; d++) {
                if (!cell.link[d]) continue;

                const ni = i + dirs[d][0];
                const nj = j + dirs[d][1];

                const x1 = i * CELL + OFFSET;
                const y1 = j * CELL + OFFSET;
                const x2 = ni * CELL + OFFSET;
                const y2 = nj * CELL + OFFSET;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
    }
}

function drawLabels() {
    ctx.fillStyle = "#000";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labelGap = 35; 

    // 22×22 の枠の位置
    const xLeft   = OFFSET + CELL * 1 - CELL / 2;
    const xRight  = OFFSET + CELL * 22 + CELL / 2;
    const yTop    = OFFSET + CELL * 1 - CELL / 2;
    const yBottom = OFFSET + CELL * 22 + CELL / 2;

    // 上ラベル A〜V（1〜22）
    for (let i = 0; i <= 23; i++) {
        const x = OFFSET + CELL * i;
        const y = yTop - labelGap;
        // i=0 のとき 'A' にしたいのでオフセットは 65 にする
        ctx.fillText(String.fromCharCode(65 + i), x, y);
    }

    // 左ラベル 1〜22
    for (let j = 0; j <= 23; j++) {
        const x = xLeft - labelGap;
        const y = OFFSET + CELL * j;
        ctx.fillText(j, x, y);
    }
}


function drawInnerBorder() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    const first = OFFSET + CELL * 1;
    const last  = OFFSET + CELL * 22;

    const left   = first - CELL / 2;
    const right  = last + CELL / 2;
    const top    = first - CELL / 2;
    const bottom = last + CELL / 2;

    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, bottom);
    ctx.lineTo(left, bottom);
    ctx.closePath();
    ctx.stroke();
}

// 勝利条件追加
function checkWin() {
    const starts = []; // 開始店の座標リスト

    // TODO: startsを埋める
    if (currentPlayer === "white") {
        for (let row = 1; row < 23; row++) {
            if (game.map[0][row].color === "white") {
                starts.push({ col: 0, row: row });
            }
        }
    } else {
        for (let col = 1; col < 23; col++){
            if (game.map[col][0].color === "black") {
                starts.push({ col: col, row: 0 });
            }
        }
    }

    const win = dfs(starts, currentPlayer);
    if (win) {
        return currentPlayer;
    }

    starts.forEach(element => {
        console.log("element:", element)
    });
}

function dfs(starts, currentPlayer) {
    console.log("dfs called with starts:", starts, "currentPlayer:", currentPlayer);

    

    return true;
}

// 初回描画
draw();

