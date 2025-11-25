// リンクの方向（ナイトの動き）
const dirs = [
    [1, -2], [2, -1], [2, 1], [1, 2],
    [-1, 2], [-2, 1], [-2, -1], [-1, -2]
];

var Twixt = (function () {
    function Twixt(size) {
        this.size = size;
        this.init();
    }

    const p = Twixt.prototype;

    // 盤面初期化
    p.init = function () {
        this.map = new Array(this.size);
        this.num = 0;
        for (let i = 0; i < this.size; i++) {
            const col = new Array(this.size);
            for (let j = 0; j < this.size; j++) {
                col[j] = {
                    num: 0,
                    color: null,
                    link: [false, false, false, false, false, false, false, false],
                };
            }
            this.map[i] = col;
        }
        this.pp_mode = false;
    };

    // ピンを置く
    p.setPeg = function (x, y, color, countFlag) {
        const i = x.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
        const j = (y | 0);

        if (i < 0 || i >= this.size) return false;
        if (j < 0 || j >= this.size) return false;
        if (color !== "black" && color !== "white") return false;

        // 4隅は禁止
        if (
            (i === 0 && j === 0) ||
            (i === 0 && j === this.size - 1) ||
            (i === this.size - 1 && j === 0) ||
            (i === this.size - 1 && j === this.size - 1)
        ) {
            return false;
        }

        // 既に置いてある
        if (this.map[i][j].color) return false;

        this.map[i][j].color = color;

        if (countFlag) {
            this.num++;
            this.map[i][j].num = this.num;
        }

        // 自分の4方向（右上側）を試す
        this.tryLink(i, j, 0);
        this.tryLink(i, j, 1);
        this.tryLink(i, j, 2);
        this.tryLink(i, j, 3);

        // 相方側からもリンク試行（双方向チェック）
        this.tryLink(i - 1, j + 2, 0);
        this.tryLink(i - 2, j + 1, 1);
        this.tryLink(i - 2, j - 1, 2);
        this.tryLink(i - 1, j - 2, 3);

        return true;
    };

    p.setPPmode = function (mode) {
        this.pp_mode = mode;
    };

    // 線分の CCW 判定（外側のヘルパーでもいい）
    function ccw(ax, ay, bx, by, cx, cy) {
        return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    }

    function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
        const ab_c = ccw(ax, ay, bx, by, cx, cy);
        const ab_d = ccw(ax, ay, bx, by, dx, dy);
        const cd_a = ccw(cx, cy, dx, dy, ax, ay);
        const cd_b = ccw(cx, cy, dx, dy, bx, by);

        // 完全に交差している（端点の共有や同一直線は除外）
        return (ab_c * ab_d < 0) && (cd_a * cd_b < 0);
    }

    // i,j から dir 方向にリンクを張る試行
    p.tryLink = function (i, j, dir) {
        // 盤外はそもそも無視
        if (i < 0 || i >= this.size || j < 0 || j >= this.size) return;

        const cell = this.map[i][j];
        const color = cell && cell.color;
        if (!color) return;

        const dx = dirs[dir][0];
        const dy = dirs[dir][1];

        const ni = i + dx;
        const nj = j + dy;

        if (ni < 0 || ni >= this.size || nj < 0 || nj >= this.size) return;

        const dest = this.map[ni][nj];
        if (!dest || dest.color !== color) return;

        const ax = i,  ay = j;
        const bx = ni, by = nj;

        // 既存リンクとの交差チェック
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const c = this.map[x][y];
                if (!c.color) continue;

                for (let d = 0; d < 8; d++) {
                    if (!c.link[d]) continue;

                    const ex = x;
                    const ey = y;
                    const fx = x + dirs[d][0];
                    const fy = y + dirs[d][1];

                    // 同じ線や端点共有は OK（交差禁止の対象外）
                    const shareEndpoint =
                        (ex === ax && ey === ay) ||
                        (ex === bx && ey === by) ||
                        (fx === ax && fy === ay) ||
                        (fx === bx && fy === by);

                    if (shareEndpoint) continue;

                    if (segmentsIntersect(ax, ay, bx, by, ex, ey, fx, fy)) {
                        // どれか1本でも交差したらこのリンクは禁止
                        return;
                    }
                }
            }
        }

        // 交差なし → 双方向リンクを張る
        const dirOpp = (dir + 4) % 8;
        this.map[i][j].link[dir] = true;
        this.map[ni][nj].link[dirOpp] = true;
    };

    // 勝利判定：白 = 左端 → 右端、 黒 = 上端 → 下端
    p.checkWinner = function () {
        const size = this.size;

        const dfs = (startCol, startRow, color) => {
            const visited = new Set();
            const stack = [[startCol, startRow]];

            while (stack.length > 0) {
                const [col, row] = stack.pop();
                const key = col + "," + row;
                if (visited.has(key)) continue;
                visited.add(key);

                if (color === "white" && col === size - 1) return true;
                if (color === "black" && row === size - 1) return true;

                const cell = this.map[col][row];

                for (let d = 0; d < 8; d++) {
                    if (!cell.link[d]) continue;
                    const nc = col + dirs[d][0];
                    const nr = row + dirs[d][1];
                    if (nc < 0 || nc >= size || nr < 0 || nr >= size) continue;
                    const next = this.map[nc][nr];
                    if (!next || next.color !== color) continue;
                    const k2 = nc + "," + nr;
                    if (!visited.has(k2)) {
                        stack.push([nc, nr]);
                    }
                }
            }
            return false;
        };

        // 白: 左端からスタート
        for (let row = 1; row < size - 1; row++) {
            if (this.map[0][row].color === "white") {
                if (dfs(0, row, "white")) return "white";
            }
        }

        // 黒: 上端からスタート
        for (let col = 1; col < size - 1; col++) {
            if (this.map[col][0].color === "black") {
                if (dfs(col, 0, "black")) return "black";
            }
        }

        return null;
    };

    p.resetGame = function () {
        this.init();
    };

    // 一つ戻る（サーバ側）
    p.undomap = function (moves) {
        this.resetGame();
        for (const m of moves) {
            this.setPeg(m.colLetter, m.rowNumber, m.color, true);
        }
    };

    return Twixt;
})();

module.exports = Twixt;
