const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Twixt = require("./twixt-server");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* -----------------------------
    ルームごとの状態管理
    rooms = {
        "123456": {
            game: Twixtインスタンス,
            currentPlayer: "white",
            winner: null,
            moves: [],
            members: [ { id, name }, ... ]
        }
    }
----------------------------- */
const rooms = {};
const SIZE = 24;


/* =======================
    ソケット接続
======================= */
io.on("connection", (socket) => {
    console.log("player connected:", socket.id);

    /* -----------------------------
        ルームに参加
    ----------------------------- */
    socket.on("joinRoom", ({ roomId, name }) => {

        // ルームが存在しない → 作成
        if (!rooms[roomId]) {
            rooms[roomId] = {
                game: new Twixt(SIZE),
                currentPlayer: "white",
                winner: null,
                moves: [],
                members: []
            };
        }

        // すでに同じ socket.id が登録されている場合は削除（二重登録防止）
        rooms[roomId].members = rooms[roomId].members.filter(
            m => m.id !== socket.id
        );
        
        // メンバー登録
        rooms[roomId].members.push({
            id: socket.id,
            name: name || "名無し"
        });

        socket.join(roomId);

        // メンバー更新通知
        io.to(roomId).emit("memberUpdate", rooms[roomId].members);


        // 入室者に現状を送る
        socket.emit("init", {
            board: rooms[roomId].game.map,
            currentPlayer: rooms[roomId].currentPlayer,
            winner: rooms[roomId].winner,
        });
    });


    /* -----------------------------
        リセット（部屋専用）
    ----------------------------- */
    socket.on("reset", ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;

        room.game.resetGame();
        room.currentPlayer = "white";
        room.winner = null;
        room.moves = [];

        io.to(roomId).emit("init", {
            board: room.game.map,
            currentPlayer: room.currentPlayer,
            winner: room.winner,
        });
    });


    /* -----------------------------
        Undo（1つ戻る）
    ----------------------------- */
    socket.on("undo", ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;

        room.moves.pop();
        room.game.undomap(room.moves);

        room.currentPlayer = (room.currentPlayer === "white" ? "black" : "white");
        room.winner = null;

        io.to(roomId).emit("init", {
            board: room.game.map,
            currentPlayer: room.currentPlayer,
            winner: room.winner
        });
    });


    /* -----------------------------
        石を置く
    ----------------------------- */
    socket.on("tryPlace", ({ roomId, col, row }) => {
        const room = rooms[roomId];
        if (!room) return;

        let g = room.game;
        if (room.winner) {
            socket.emit("deny", { reason: "game_over" });
            return;
        }

        if (col < 0 || col >= SIZE || row < 0 || row >= SIZE) {
            socket.emit("deny", { reason: "out_of_bounds" });
            return;
        }

        const color = room.currentPlayer;

        // 色ごとの置けない端
        if (
            (color === "black" && (col === 0 || col === SIZE - 1)) ||
            (color === "white" && (row === 0 || row === SIZE - 1))
        ) {
            socket.emit("deny", { reason: "invalid_edge" });
            return;
        }

        // Twixt 文字 -> 数字変換
        const X = String.fromCharCode("A".charCodeAt(0) + col);
        const Y = ("0" + row).slice(-2);

        const ok = g.setPeg(X, Y, color, true);
        if (!ok) {
            socket.emit("deny", { reason: "illegal_move" });
            return;
        }

        room.moves.push({ col, row, colLetter: X, rowNumber: Y, color });

        const winColor = g.checkWinner();
        if (winColor) {
            room.winner = winColor;
        }

        if (!room.winner) {
            room.currentPlayer = (room.currentPlayer === "white" ? "black" : "white");
        }

        io.to(roomId).emit("place", {
            board: room.game.map,
            currentPlayer: room.currentPlayer,
            winner: room.winner,
        });
    });


    /* -----------------------------
        退出
    ----------------------------- */
    socket.on("leaveRoom", ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;

        socket.leave(roomId);

        room.members = room.members.filter(m => m.id !== socket.id);

        io.to(roomId).emit("memberUpdate", room.members);
    });


    /* -----------------------------
        切断時（バックボタンなど）
    ----------------------------- */
    socket.on("disconnect", () => {
        console.log("player disconnected:", socket.id);

        // すべての部屋から削除
        for (let roomId in rooms) {
            const room = rooms[roomId];
            const before = room.members.length;

            room.members = room.members.filter(m => m.id !== socket.id);

            // メンバーが減っていたら更新
            if (room.members.length !== before) {
                io.to(roomId).emit("memberUpdate", room.members);
            }
        }
    });

});


/* =======================
    サーバ起動
======================= */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("listening on *:" + PORT);
});
