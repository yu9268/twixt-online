// hover カーソル
let hover = null;

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

function getGridPos(x, y) {
    const col = Math.round((x - OFFSET) / CELL);
    const row = Math.round((y - OFFSET) / CELL);
    if (col < 0 || col >= SIZE || row < 0 || row >= SIZE) return null;
    return { col, row };
}

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const g = getGridPos(x, y);

    if (g && g.col >= 1 && g.col <= 22 && g.row >= 1 && g.row <= 22) {
        hover = g;
    } else {
        hover = null;
    }

    draw();
});

function draw() {
    if (!board) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLabels();
    drawGrid();
    drawInnerBorder();
    drawLinks();
    drawPegs();
    drawHighlight();
}

function drawGrid() {
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;

    for (let col = 0; col < SIZE; col++) {
        for (let row = 0; row < SIZE; row++) {
            const x = OFFSET + CELL * col;
            const y = OFFSET + CELL * row;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}


function drawPegs() {
    for (let col = 0; col < SIZE; col++) {
        for (let row = 0; row < SIZE; row++) {
            const cell = board[col][row];
            if (!cell.color) continue;

            const x = col * CELL + OFFSET;
            const y = row * CELL + OFFSET;

            ctx.beginPath();
            ctx.fillStyle = cell.color === "white" ? "white" : "black";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.arc(x, y, PEG_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
}

function drawLinks() {
    if (!board) return;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    for (let col = 0; col < SIZE; col++) {
        for (let row = 0; row < SIZE; row++) {
            const cell = board[col][row];
            // ペグが置いてないマスからは線を引かない
            if (!cell || !cell.color) continue;

            for (let d = 0; d < 8; d++) {
                if (!cell.link[d]) continue;

                const [dx, dy] = dirs[d];
                const nc = col + dx;
                const nr = row + dy;

                // 盤外なら無視
                if (nc < 0 || nc >= SIZE || nr < 0 || nr >= SIZE) continue;

                const other = board[nc][nr];
                // 相手マスにも「同じ色のペグ」がある場合だけ線
                if (!other || other.color !== cell.color) continue;

                // 同じ線を2回描かないため、「(col,row) < (nc,nr) のときだけ」描く
                if (nc < col || (nc === col && nr < row)) continue;

                const x1 = col * CELL + OFFSET;
                const y1 = row * CELL + OFFSET;
                const x2 = nc * CELL + OFFSET;
                const y2 = nr * CELL + OFFSET;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
    }
}

function drawLabels() {
    const labelGap = 35;
    ctx.fillStyle = "#000";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";

    const yTop = OFFSET - labelGap;
    const xLeft = OFFSET - labelGap;

    for (let i = 0; i < SIZE; i++) {
        const x = OFFSET + CELL * i;
        ctx.fillText(String.fromCharCode(65 + i), x, yTop);
    }

    for (let j = 0; j < SIZE; j++) {
        const y = OFFSET + CELL * j;
        ctx.fillText(j, xLeft, y);
    }
}

function drawInnerBorder() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    const first = OFFSET + CELL * 1;
    const last = OFFSET + CELL * 22;

    ctx.strokeRect(
        first - CELL / 2,
        first - CELL / 2,
        (22 * CELL),
        (22 * CELL)
    );
}

function drawHighlight() {
    if (!hover) return;

    const { col, row } = hover;
    const x = OFFSET + CELL * col;
    const y = OFFSET + CELL * row;

    ctx.beginPath();
    ctx.arc(x, y, PEG_RADIUS + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
}