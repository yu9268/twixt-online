
const socket = io();

let board = null;
let currentPlayer = "white";
let winner = null;

// クリック → サーバへ送信
canvas.addEventListener("click", (e) => {
    if (winner) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const g = getGridPos(x, y);
    if (!g) return;

    socket.emit("tryPlace", { col: g.col, row: g.row });
});

document.getElementById("resetBtn").onclick = () => {
    console.log('リセットします');
    socket.emit("reset");
}

document.getElementById("undoBtn").onclick = () => {
    console.log('一つ戻る');
    socket.emit("undo");
}

// 初期化
socket.on("init", ({ board: b, currentPlayer: p, winner: w }) => {
    console.log('サーバからinit受け取り');
    board = b;
    currentPlayer = p;
    winner = w;
    draw();
});

// 更新（誰かが置いた）
socket.on("place", ({ board: b, currentPlayer: p, winner: w }) => {
    board = b;
    currentPlayer = p;
    winner = w;

    draw();

    if (winner) {
        setTimeout(() => alert(winner + "の勝利！"), 20);
    }
});

socket.on("deny", ({ reason }) => {
    console.log("置けません:", reason);
});

socket.on("connect", () => {
    console.log("connected:", socket.id);
});
