// chess.js
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.initializeGame();
    }

    initializeBoard() {
        return [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        ];
    }

    initializeGame() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.className = `square ${(i + j) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = i;
                square.dataset.col = j;
                square.textContent = this.board[i][j];
                square.addEventListener('click', (e) => this.handleClick(e));
                boardElement.appendChild(square);
            }
        }
    }

    handleClick(event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const piece = this.board[row][col];

        if (this.selectedPiece) {
            if (this.isValidMove(row, col)) {
                this.makeMove(row, col);
                this.clearSelection();
                this.updateBoard();
                setTimeout(() => this.makeAIMove(), 500);
            } else if (this.isPieceOfCurrentPlayer(piece)) {
                this.selectPiece(row, col);
            }
        } else if (this.isPieceOfCurrentPlayer(piece)) {
            this.selectPiece(row, col);
        }
    }

    isPieceOfCurrentPlayer(piece) {
        return this.currentPlayer === 'white' ? 
            '♔♕♖♗♘♙'.includes(piece) : 
            '♚♛♜♝♞♟'.includes(piece);
    }

    selectPiece(row, col) {
        this.clearSelection();
        this.selectedPiece = { row, col };
        this.possibleMoves = this.calculatePossibleMoves(row, col);
        this.highlightSquares();
    }

    clearSelection() {
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.removeHighlights();
    }

    highlightSquares() {
        const squares = document.querySelectorAll('.square');
        squares[this.selectedPiece.row * 8 + this.selectedPiece.col].classList.add('selected');
        this.possibleMoves.forEach(move => {
            squares[move.row * 8 + move.col].classList.add('possible-move');
        });
    }

    removeHighlights() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'possible-move');
        });
    }

    calculatePossibleMoves(row, col) {
        // This is a simplified version - implement full chess rules here
        const moves = [];
        const piece = this.board[row][col];

        // Pawn movement
        if (piece === '♙' && row > 0) {
            if (this.board[row - 1][col] === ' ') {
                moves.push({ row: row - 1, col: col });
                if (row === 6 && this.board[row - 2][col] === ' ') {
                    moves.push({ row: row - 2, col: col });
                }
            }
            // Capture diagonally
            if (col > 0 && '♚♛♜♝♞♟'.includes(this.board[row - 1][col - 1])) {
                moves.push({ row: row - 1, col: col - 1 });
            }
            if (col < 7 && '♚♛♜♝♞♟'.includes(this.board[row - 1][col + 1])) {
                moves.push({ row: row - 1, col: col + 1 });
            }
        }

        // Add more piece movement rules here

        return moves;
    }

    isValidMove(row, col) {
        return this.possibleMoves.some(move => move.row === row && move.col === col);
    }

    makeMove(row, col) {
        if (this.selectedPiece) {
            this.board[row][col] = this.board[this.selectedPiece.row][this.selectedPiece.col];
            this.board[this.selectedPiece.row][this.selectedPiece.col] = ' ';
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        }
    }

    makeAIMove() {
        // Simple AI: Random legal move
        const pieces = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.isPieceOfCurrentPlayer(this.board[i][j])) {
                    pieces.push({ row: i, col: j });
                }
            }
        }

        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        const moves = this.calculatePossibleMoves(randomPiece.row, randomPiece.col);

        if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            this.selectedPiece = randomPiece;
            this.makeMove(randomMove.row, randomMove.col);
            this.updateBoard();
        }

        this.currentPlayer = 'white';
    }

    updateBoard() {
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            square.textContent = this.board[row][col];
        });
    }
}

// Start the game
const game = new ChessGame();
