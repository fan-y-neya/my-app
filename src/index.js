import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className={"square" + (props.isWin ? " highlight" : "")}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  static SIZE = 3

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isWin={this.props.winLine.includes(i)}
      />
    );
  }

  render() {
    return (
      <div>
        {(() => {
          const dom = [];
          for (let i = 0; i < Board.SIZE; i++) {
            const square = [];
            for (let j = 0; j < Board.SIZE; j++) {
              square.push(this.renderSquare(i * Board.SIZE + j))
            }
            dom.push(<div className="board-row">{square}</div>);
          }
          return dom;
        })()}
      </div>
    );
  }
}

class Game extends React.Component {
  static SQUARE_NUM = Board.SIZE ** 2;
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(Game.SQUARE_NUM).fill(null),
        col: null,
        row: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      isAsc: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        col: (i % Board.SIZE) + 1,
        row: Math.floor(i / Board.SIZE) + 1,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  sortMoves() {
    this.setState({
      isAsc: !this.state.isAsc,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const winLine = calculateWinLine(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + " (" + step.col + "," + step.row + ")":
        'Go to game start';
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={this.state.stepNumber === move ? "selected-move" : ""}
          >{desc}</button>
        </li>
      )
    })

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber === Game.SQUARE_NUM) {
      status = 'Draw!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winLine={winLine}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button
            onClick={() => this.sortMoves()}
          >⇅</button>
          {(()=> {
            if (this.state.isAsc) {
              return <ol>{moves}</ol>
            } else {
              return <ol reversed>{moves.reverse()}</ol>
            }
          })()}
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const line = calculateWinLine(squares);
  if (line.length > 0) {
    return squares[line[0]];
  }

  return null;
}

function calculateWinLine(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return [];
}
