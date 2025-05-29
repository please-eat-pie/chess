class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.kings = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
        this.castlingRights = {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
        };
        this.lastMove = null;
        this.pieceImages = this.initializePieceImages();
        this.setupBoard();
        this.addEventListeners();
    }

    initializePieceImages() {
        return {
            'white': {
                'king': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wK.svg',
                'queen': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wQ.svg',
                'rook': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wR.svg',
                'bishop': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wB.svg',
                'knight': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wN.svg',
                'pawn': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wP.svg'
            },
            'black': {
                'king': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bK.svg',
                'queen': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bQ.svg',
                'rook': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bR.svg',
                'bishop': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bB.svg',
                'knight': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bN.svg',
                'pawn': 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bP.svg'
            }
        };
    }

    initializeBoard() {
        return [
            ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
            ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
            ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
        ];
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const pieceType = piece[1];
        const color = piece[0] === 'w' ? 'white' : 'black';
        let moves = [];

        switch (pieceType) {
            case 'p':
                moves = this.getPawnMoves(row, col, color);
                break;
            case 'r':
                moves = this.getRookMoves(row, col, color);
                break;
            case 'n':
                moves = this.getKnightMoves(row, col, color);
                break;
            case 'b':
                moves = this.getBishopMoves(row, col, color);
                break;
            case 'q':
                moves = this.getQueenMoves(row, col, color);
                break;
            case 'k':
                moves = this.getKingMoves(row, col, color);
                break;
        }

        // Filter out moves that would put or leave the king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, color));
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (this.isInBounds(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col: col });
            
            // Double move from starting position
            if (row === startRow && !this.board[row + (2 * direction)][col]) {
                moves.push({ row: row + (2 * direction), col: col });
            }
        }

        // Captures
        for (let colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            const newRow = row + direction;
            
            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (targetPiece && this.isOpponentPiece(targetPiece, color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (let [dx, dy] of directions) {
            let newRow = row + dx;
            let newCol = col + dy;

            while (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.isOpponentPiece(targetPiece, color)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dx;
                newCol += dy;
            }
        }

        return moves;
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const offsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (let [dx, dy] of offsets) {
            const newRow = row + dx;
            const newCol = col + dy;

            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || this.isOpponentPiece(targetPiece, color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (let [dx, dy] of directions) {
            let newRow = row + dx;
            let newCol = col + dy;

            while (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.isOpponentPiece(targetPiece, color)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dx;
                newCol += dy;
            }
        }

        return moves;
    }

    getQueenMoves(row, col, color) {
        return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)];
    }

    getKingMoves(row, col, color) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;

            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || this.isOpponentPiece(targetPiece, color)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        // Add castling moves
        if (this.canCastle(color, 'kingSide')) {
            moves.push({ row: row, col: col + 2, castling: 'kingSide' });
        }
        if (this.canCastle(color, 'queenSide')) {
            moves.push({ row: row, col: col - 2, castling: 'queenSide' });
        }

        return moves;
    }

    canCastle(color, side) {
        if (!this.castlingRights[color][side]) return false;
        if (this.isInCheck(color)) return false;

        const row = color === 'white' ? 7 : 0;
        const kingCol = 4;
        
        if (side === 'kingSide') {
            return !this.board[row][5] && !this.board[row][6] &&
                   this.board[row][7]?.[1] === 'r' &&
                   !this.isSquareAttacked(row, 5, color) &&
                   !this.isSquareAttacked(row, 6, color);
        } else {
            return !this.board[row][3] && !this.board[row][2] && !this.board[row][1] &&
                   this.board[row][0]?.[1] === 'r' &&
                   !this.isSquareAttacked(row, 3, color) &&
                   !this.isSquareAttacked(row, 2, color);
        }
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    isOpponentPiece(piece, color) {
        return piece && ((color === 'white' && piece[0] === 'b') || 
                        (color === 'black' && piece[0] === 'w'));
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Make temporary move
        const tempBoard = this.board.map(row => [...row]);
        const piece = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = '';
        tempBoard[toRow][toCol] = piece;

        // Find king position
        let kingRow = this.kings[color].row;
        let kingCol = this.kings[color].col;
        if (piece[1] === 'k') {
            kingRow = toRow;
            kingCol = toCol;
        }

        // Check if king is attacked
        return this.isSquareAttacked(kingRow, kingCol, color, tempBoard);
    }

    isSquareAttacked(row, col, defendingColor, boardState = this.board) {
        const attackingColor = defendingColor === 'white' ? 'black' : 'white';

        // Check for attacking pieces
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece && piece[0] === attackingColor[0]) {
                    const moves = this.getValidMoves(r, c);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isInCheck(color) {
        return this.isSquareAttacked(
            this.kings[color].row,
            this.kings[color].col,
            color
        );
    }

    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;

        // Check if any piece can make a legal move
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece[0] === color[0]) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return false;
                }
            }
        }
        return true;
    }

    isStalemate(color) {
        if (this.isInCheck(color)) return false;

        // Check if any piece can make a legal move
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece[0] === color[0]) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return false;
                }
            }
        }
        return true;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        // Update board
        this.board[fromRow][fromCol] = '';
        this.board[toRow][toCol] = piece;

        // Handle captures
        if (capturedPiece) {
            const capturedColor = capturedPiece[0] === 'w' ? 'white' : 'black';
            this.capturedPieces[capturedColor].push(capturedPiece);
        }

        // Update king position if king moved
        if (piece[1] === 'k') {
            const color = piece[0] === 'w' ? 'white' : 'black';
            this.kings[color] = { row: toRow, col: toCol };
            this.castlingRights[color].kingSide = false;
            this.castlingRights[color].queenSide = false;
        }

        // Update castling rights if rook moved
        if (piece[1] === 'r') {
            const color = piece[0] === 'w' ? 'white' : 'black';
            if (fromRow === (color === 'white' ? 7 : 0)) {
                if (fromCol === 0) this.castlingRights[color].queenSide = false;
                if (fromCol === 7) this.castlingRights[color].kingSide = false;
            }
        }

        // Handle castling
        if (piece[1] === 'k' && Math.abs(toCol - fromCol) === 2) {
            const rookFromCol = toCol > fromCol ? 7 : 0;
            const rookToCol = toCol > fromCol ? toCol - 1 : toCol + 1;
            const rookPiece = this.board[fromRow][rookFromCol];
            this.board[fromRow][rookFromCol] = '';
            this.board[fromRow][rookToCol] = rookPiece;
        }

        this.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
        this.moveHistory.push({
            piece,
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            captured: capturedPiece
        });

        this.updateBoard();
    }

    makeAIMove() {
        const moves = this.getAllValidMoves('black');
        if (moves.length === 0) return;

        // Simple AI: Prioritize captures and checks
        moves.forEach(move => {
            move.score = 0;
            if (this.board[move.to.row][move.to.col]) {
                move.score += 10; // Capture
            }
            if (this.wouldBeInCheck(move.from.row, move.from.col, move.to.row, move.to.col, 'white')) {
                move.score += 5; // Check
            }
        });

        moves.sort((a, b) => b.score - a.score);
        const bestMove = moves[0];

        this.makeMove(bestMove.from.row, bestMove.from.col, bestMove.to.row, bestMove.to.col);
        this.currentPlayer = 'white';
        this.updateStatus();
    }

    getAllValidMoves(color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece[0] === (color === 'white' ? 'w' : 'b')) {
                    const validMoves = this.getValidMoves(row, col);
                    validMoves.forEach(move => {
                        moves.push({
                            from: { row, col },
                            to: { row: move.row, col: move.col }
                        });
                    });
                }
            }
        }
        return moves;
    }

    updateBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                // Highlight last move
                if (this.lastMove && 
                    ((row === this.lastMove.from.row && col === this.lastMove.from.col) ||
                     (row === this.lastMove.to.row && col === this.lastMove.to.col))) {
                    square.classList.add('highlight-last-move');
                }

                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('img');
                    pieceElement.className = 'piece';
                    pieceElement.src = this.getPieceImage(piece);
                    pieceElement.draggable = true;
                    pieceElement.dataset.piece = piece;
                    square.appendChild(pieceElement);
                }

                boardElement.appendChild(square);
            }
        }

        this.updateCapturedPieces();
        this.updateMoveHistory();
    }

    updateCapturedPieces() {
        const whiteCaptured = document.getElementById('captured-white');
        const blackCaptured = document.getElementById('captured-black');

        whiteCaptured.innerHTML = this.capturedPieces.white.map(piece => 
            `<img src="${this.getPieceImage(piece)}" class="piece" style="width: 30px; height: 30px;">`
        ).join('');

        blackCaptured.innerHTML = this.capturedPieces.black.map(piece => 
            `<img src="${this.getPieceImage(piece)}" class="piece" style="width: 30px; height: 30px;">`
        ).join('');
    }

    updateMoveHistory() {
        const historyElement = document.getElementById('move-history');
        historyElement.innerHTML = this.moveHistory.map((move, index) => {
            const from = `${String.fromCharCode(97 + move.from.col)}${8 - move.from.row}`;
            const to = `${String.fromCharCode(97 + move.to.col)}${8 - move.to.row}`;
            return `${Math.floor(index/2 + 1)}. ${move.piece[1].toUpperCase()}${from}-${to}${move.captured ? 'x' : ''}`;
        }).join('<br>');
    }

    updateStatus() {
        const statusElement = document.getElementById('status');
        if (this.isCheckmate(this.currentPlayer)) {
            statusElement.textContent = `Checkmate! ${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
        } else if (this.isStalemate(this.currentPlayer)) {
            statusElement.textContent = 'Stalemate! Game is drawn.';
        } else if (this.isInCheck(this.currentPlayer)) {
            statusElement.textContent = `${this.currentPlayer}'s turn - CHECK!`;
        } else {
            statusElement.textContent = `${this.currentPlayer}'s turn`;
        }
    }

    getPieceImage(piece) {
        if (!piece) return null;
        const color = piece[0] === 'w' ? 'white' : 'black';
        const pieceType = {
            'k': 'king',
            'q': 'queen',
            'r': 'rook',
            'b': 'bishop',
            'n': 'knight',
            'p': 'pawn'
        }[piece[1]];
        return this.pieceImages[color][pieceType];
    }

    addEventListeners() {
        const board = document.getElementById('chessboard');

        board.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('piece')) {
                const square = e.target.parentElement;
                const row = parseInt(square.dataset.row);
                const col = parseInt(square.dataset.col);
                const piece = this.board[row][col];
                
                if (piece[0] === (this.currentPlayer === 'white' ? 'w' : 'b')) {
                    this.selectedPiece = { row, col };
                    this.showValidMoves(row, col);
                } else {
                    e.preventDefault();
                }
            }
        });

        board.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        board.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetSquare = e.target.closest('.square');
            if (targetSquare && this.selectedPiece) {
                const newRow = parseInt(targetSquare.dataset.row);
                const newCol = parseInt(targetSquare.dataset.col);
                
                const validMoves = this.getValidMoves(this.selectedPiece.row, this.selectedPiece.col);
                if (validMoves.some(move => move.row === newRow && move.col === newCol)) {
                    this.makeMove(this.selectedPiece.row, this.selectedPiece.col, newRow, newCol);
                    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
                    this.updateStatus();

                    if (this.currentPlayer === 'black') {
                        setTimeout(() => {
                            this.makeAIMove();
                            this.updateStatus();
                        }, 500);
                    }
                }
            }
            this.selectedPiece = null;
            this.clearHighlights();
        });

        board.addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (!square) return;

            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.board[row][col];

            if (this.selectedPiece) {
                if (row === this.selectedPiece.row && col === this.selectedPiece.col) {
                    this.selectedPiece = null;
                    this.clearHighlights();
                } else {
                    const validMoves = this.getValidMoves(this.selectedPiece.row, this.selectedPiece.col);
                    if (validMoves.some(move => move.row === row && move.col === col)) {
                        this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
                        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
                        this.updateStatus();

                        if (this.currentPlayer === 'black') {
                            setTimeout(() => {
                                this.makeAIMove();
                                this.updateStatus();
                            }, 500);
                        }
                    }
                    this.selectedPiece = null;
                    this.clearHighlights();
                }
            } else if (piece && piece[0] === (this.currentPlayer === 'white' ? 'w' : 'b')) {
                this.selectedPiece = { row, col };
                this.showValidMoves(row, col);
            }
        });
    }

    showValidMoves(row, col) {
        this.clearHighlights();
        const validMoves = this.getValidMoves(row, col);
        validMoves.forEach(move => {
            const square = document.querySelector(
                `.square[data-row="${move.row}"][data-col="${move.col}"]`
            );
            if (square) {
                if (this.board[move.row][move.col]) {
                    square.classList.add('highlight-capture');
                } else {
                    square.classList.add('highlight-move');
                }
            }
        });
    }

    clearHighlights() {
        document.querySelectorAll('.highlight-move, .highlight-capture').forEach(square => {
            square.classList.remove('highlight-move', 'highlight-capture');
        });
    }
}

// Start the game
const game = new ChessGame();
