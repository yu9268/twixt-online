
const params = new URLSearchParams(location.search);
const roomId = params.get("id");
const playerName = params.get("name") || "名無し";
document.getElementById("roomIdText").textContent = `ルームID: ${roomId}`;

const modal = document.getElementById("memberModal");
const list = document.getElementById("memberList");

// ルーム参加
const socket = io();
socket.emit("joinRoom", { roomId, playerName });


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

    socket.emit("tryPlace", { roomId, col: g.col, row: g.row });
});

document.getElementById("resetBtn").onclick = () => {
    const ok = confirm("リセットしますか？");
    if (!ok) return;

    console.log('リセットします');
    socket.emit("reset", { roomId });
}

document.getElementById("undoBtn").onclick = () => {
    console.log('一つ戻る');
    socket.emit("undo", { roomId });
}

document.getElementById("leaveBtn").addEventListener("click", () => {
    const ok = confirm("ルームを退出しますか？");
    if (!ok) return;

    socket.emit("leaveRoom", { roomId });
    window.location.href = "/index.html";
});

document.getElementById("copyRoomIdBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(roomId).then(() => {
        showToast("ルームIDをコピーしました！");
    });
});

document.getElementById("memberListBtn").addEventListener("click", () => {
    modal.classList.remove("hidden");
});

document.getElementById("closeMemberModal").addEventListener("click", () => {
    modal.classList.add("hidden");
});


// 初期化
socket.on("init", ({ board: b, currentPlayer: p, winner: w }) => {
    console.log('サーバからinit受け取り');
    board = b;
    currentPlayer = p;
    winner = w;
    draw();
});

// メンバー更新
socket.on("memberUpdate", (members) => {
    const list = document.getElementById("memberList");
    list.innerHTML = ""; 

    members.forEach(m => {
        const li = document.createElement("li");
        li.textContent = m.name;
        list.appendChild(li);
    });
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

socket.emit("joinRoom", { roomId, name: playerName });

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;

    toast.classList.remove("hidden");

    // 一回 reflow してから show を付与（フェードインのため）
    void toast.offsetWidth;
    toast.classList.add("show");

    // 1.5秒後にフェードアウト
    setTimeout(() => {
        toast.classList.remove("show");

        // フェードアウト終わったら非表示へ
        setTimeout(() => {
            toast.classList.add("hidden");
        }, 400);
    }, 1500);
}
