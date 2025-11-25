const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Twixt = require("./twixt-server");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const SIZE = 24;
const game = new Twixt(SIZE);

let currentPlayer = "white";
let winner = null;
let moves = [];

io.on("connection", (socket) => {
    console.log("player connected:", socket.id);

    socket.on("reset", () => {
        game.resetGame();
        currentPlayer = "white";
        winner = null;
        moves = [];

        io.emit("init", {
            board: game.map,
            currentPlayer,
            winner,
        })
    });

    // 一つ戻るボタンをクライアントから受け取る
    socket.on("undo", () => {
        moves.pop();
        game.undomap(moves);
        
        currentPlayer = (currentPlayer === "white") ? "black" : "white";
        winner = null;

        io.emit("init", { board: game.map, currentPlayer, winner });
    });

    // 接続したプレイヤーに今の状態を送る
    socket.emit("init", {
        board: game.map,
        currentPlayer,
        winner,
    });

    // クライアント側から受け取る
    socket.on("tryPlace", ({ col, row }) => {
        if (winner) {
            socket.emit("deny", { reason: "game_over" });
            return;
        }

        if (col < 0 || col >= SIZE || row < 0 || row >= SIZE) {
            socket.emit("deny", { reason: "out_of_bounds" });
            return;
        }

        const color = currentPlayer;

        // サーバ側でも端に置けないようにする
        if (
            (color === "black" && (col === 0 || col === SIZE - 1)) ||
            (color === "white" && (row === 0 || row === SIZE - 1))
        ) {
            socket.emit("deny", { reason: "invalid_edge" });
        return;
        }

        const X = String.fromCharCode("A".charCodeAt(0) + col);
        const Y = ("0" + row).slice(-2);

        const ok = game.setPeg(X, Y, color, true);
        if (!ok) {
            socket.emit("deny", {reason: "illegal_move"});
            return;
        }

        moves.push({
            col,
            row,
            colLetter: X,
            rowNumber: Y,
            color: color
        });

        const winColor = game.checkWinner();
        if (winColor) {
            winner = winColor;
        }

        if (!winner) {
            currentPlayer = currentPlayer === "white" ? "black" : "white";
        }

        // 盤面更新
        io.emit("place", {
            board: game.map,
            currentPlayer,
            winner,
        });
    });
});

server.listen(3000, () => {
    console.log("listening on *:3000");
});