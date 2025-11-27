// 6桁ランダムID生成
function generateRoomId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ルーム作成
document.getElementById("createRoomBtn").addEventListener("click", () => {
    const name = document.getElementById("createName").value.trim();
    const roomId = generateRoomId();

    // 名前はクエリにつけて渡す（任意）
    const url = `/room.html?id=${roomId}&name=${encodeURIComponent(name)}`;
    window.location.href = url;
});

// ルーム参加
document.getElementById("joinRoomBtn").addEventListener("click", () => {
    const roomId = document.getElementById("joinRoomId").value.trim();
    const name = document.getElementById("joinName").value.trim();

    if (!roomId) {
        alert("ルームIDを入力してください。");
        return;
    }

    const url = `/room.html?id=${roomId}&name=${encodeURIComponent(name)}`;
    window.location.href = url;
});
