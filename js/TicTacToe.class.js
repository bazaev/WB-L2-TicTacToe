/*
	TicTacToe Game Engine
	Author: @bazaev
	https://github.com/bazaev
*/

class TicTacToe {
	// Массив обработчиков
	#on;

	// Состояние по умолчанию
	#state = {
		start: false,
		player: false,
		vs: 0,
		moves: 0,
		board: null,
		winner: null,
		winCombination: null,
		side: true
	};

	// Победные комбинации
	#wins = [
		[0,1,2],
		[3,4,5],
		[6,7,8],
		[0,3,6],
		[1,4,7],
		[2,5,8],
		[0,4,8],
		[2,4,6]
	];

	// Массив событий
	event = [
		"start",
		"stop",
		"clear",
		"end",
		"vs",
		"move",
		"side"
	];

	constructor() {
		// Получаем длину объекта событий
		const eventLength = this.event.length;
		// Создаем массив обработчиков
		this.#on = new Array(eventLength);
		// Преобразовываем массив событий в объект
		this.event = Object.fromEntries(this.event.map((event, index) => [event, index]));
	}

	start() {
		// Очищаем доску
		this.clear();
		// Сбрасываем игрока
		this.#state.player = this.#state.side;
		// Запускаем игру
		this.#state.start = true;
		// Запускаем обработчик событий
		this.on(this.event.start);
		// Если первый игрок выбрал ходить вторым
		// и если второй игрок ИИ, то запускаем его
		if (!this.#state.side && this.#state.vs > 0) {console.log("AI");
			this.#AI();
		}
	}

	stop() {
		// Останавливаем игру
		this.#state.start = false;
		// Запускаем обработчик событий
		this.on(this.event.stop);
	}

	clear() {
		// Создаём доску
		this.#state.board = new Array(9);
		// Сбрасываем счетчик ходов
		this.#state.moves = 0;
		// Сбрасываем победителя
		this.#state.winner = null;
		// Сбрасываем комбинацию победы
		this.#state.winCombination = null;
		// Запускаем обработчик событий
		this.on(this.event.clear);
	}

	move(cell) {

		// Если клетка уже занята
		if (this.#state.board[cell] || !this.#state.start) { return }

		// Получаем номер игрока
		const player = this.player;

		// Запоминаем ход и игрока
		this.#state.board[cell] = player;
		// Задаём элементу ячейки символ для отображения
		// cells[cell].dataset.symbol = geo[this.#state.board[cell] - 1];
		// Передаём ход второму игроку
		this.#state.player = !this.#state.player;
		// Увеличиваем счетчик ходов
		this.#state.moves++;
		// Запускаем обработчик событий
		this.on(this.event.move, {
			moves: this.#state.moves,
			player,
			cell
		});

		// Если ходов больше четырёх - проверяем на победу
		let end = this.#state.moves > 4 && this.#check();

		// Если победили или ничья
		// вызываем обработчики событий
		// иначе ессли ход второго игрока
		// и выбран ИИ - передаём ход ему
		if (end) {
			this.stop();
			this.on(this.event.end, end);
		}else if (!this.#state.player && this.#state.vs > 0) {
			this.#AI();
		}

		return true;
	}

	getState() {
		// Возвращаем состояние
		return this.#state
	}

	setState(state = this.#state) {
		// Устанавливаем новое состояние
		this.#state = state
	}

	setVS(value) {
		// Определяем второго игрока
		this.#state.vs = +value;
		// Если игра идёт и второй игрок ИИ и ход его
		if (this.#state.start && this.#state.vs > 0 && !this.#state.player) {
			// Запускаем его
			this.#AI();
		}
		// Запускаем обработчик событий
		this.on(this.event.vs, this.#state.vs);
	};

	setSide(side) {
		// Устанавливаем сторону
		this.#state.side = side
		// Запускаем обработчик событий
		this.on(this.event.side, this.#state.side);
	}

	on(event, payload) {
		// Если payload это функция
		if (typeof payload === "function") {
			// Если нет обработчиков
			if (!this.#on[event]) {
				// Создаем массив
				this.#on[event] = [];
			}
			// Добавляем обработчик в массив
			return this.#on[event].push(payload)	
			// Если это не функция и есть обработчики
		}else if (this.#on[event]) {
			// Вызываем обработчики
			this.#on[event].forEach(handler => handler(payload));
		}
	}

	get player () {
		// Возвращаем номер текущего игрока
		return this.#state.player ? 1 : 2
	}

	#check() {

		let xo, winner;

		winner = this.#wins.some(combination => {
			// Счётчик совпадений в победной комбинации
			// для первого и второго [x,o] игрока
			xo = [0,0];
			return combination.some((cell, key) => {
				// Если ячейка не пуста
				if (this.#state.board[cell]) {
					// Получаем номер игрока, сделавшего ход
					const player = this.#state.board[cell]-1;
					// Увеличиваем победный счетчик для этого игрока
					xo[player]++;
					// Победил ли игрок?
					const isWinner = xo[player] === 3;
					// Если победил
					if (isWinner) {
						// Обновляем стейт
						this.#state.winCombination = [
							combination[key],
							combination[key - 1],
							combination[key - 2]
						]
					}
					// Возвращаем результат проверки
					return isWinner;
				}

				return false
			});
		});
		
		// Если какой либо игрок победил
		if (winner) {
			// Определяем победителя
			const player = xo[0] > 2;
			// Запоминаем номер победителя
			this.#state.winner = player ? 1 : 2;
			// Возвращаем победителя и комбинацию
			return {
				winner: this.#state.winner,
				winCombination: this.#state.winCombination
			}
		}

		// Если ходов больше нет
		if (this.#state.moves === 9) {
			// Обновляет стейт
			this.#state.winner = 3;
			// Возвращаем 3 как знак ничьи
			return {
				winner: this.#state.winner
			}
		}
	}

	#AI() {
		// Перемешиваем комбинации
		const wins = [...this.#wins]
			.map(value => ({ value, sort: Math.random() }))
			.sort((a, b) => a.sort - b.sort)
			.map(({ value }) => value);
			
		// Доска противник и количество ходов
		const { board, vs, moves } = this.#state;

		// Если сложность ИИ выше лёгкой
		if (vs > 1) {
			let move = NaN;
			// Если сделано ходов больше трёх
			if (moves > 3) {
				wins.some(win => {
					// Если ячейка из победной комбинации пуста
					// а две другие заняты ИИ - выбираем эту ячейку
					if (!board[win[2]] && board[win[0]] === 2 && board[win[1]] === 2) {
						move = win[2]
					}else if (!board[win[0]] && board[win[1]] === 2 && board[win[2]] === 2) {
						move = win[0]
					}else if (!board[win[1]] && board[win[0]] === 2 && board[win[2]] === 2) {
						move = win[1]
					}
					return !isNaN(move)
				})
			}

			// Если уровень ИИ сложный
			if (isNaN(move) && vs > 2) {
				// Если ИИ ходит вторым и это начало игры
				if (moves === 1) {
					// Угловую ли ячейку занял игрок?
					const isAngle = [
						board[0],
						board[2],
						board[6],
						board[8]
					].includes(!this.#state.player ? 1 : 2);

					// Если да, то препятствуем
					// заведомо выигрышной комбинации
					if (isAngle) {
						move = 4
					}
				}

				// Если ход всё ещё не определён
				if (isNaN(move)) {
					wins.some(win => {
						// Если игрок близок к победной комбинации,
						// обороняемся и занимаем оставшуюся ячейку
						if (!board[win[2]] && board[win[0]] === 1 && board[win[1]] === 1) {
							move = win[2]
						}else if (!board[win[0]] && board[win[1]] === 1 && board[win[2]] === 1) {
							move = win[0]
						}else if (!board[win[1]] && board[win[0]] === 1 && board[win[2]] === 1) {
							move = win[1]
						}
						return !isNaN(move)
					})
				}
				
			}

			// Если ход не определён
			if (isNaN(move)) {
				wins.some(win => {
					// Если ИИ на пути к данной победной комбинации,
					// продолжаем атаковать
					if (!board[win[1]] && board[win[0]] === 1) {
						move = win[1]
					}else if (!board[win[2]] && board[win[1]] === 1) {
						move = win[2]
					}else if (!board[win[0]] && board[win[2]] === 1) {
						move = win[0]
					}
					return !isNaN(move)
				})
			}
			// Если ход определён
			if (!isNaN(move)) {
				// Ходим в выбранную ячейку
				this.move(move);
			}else{
				// Иначе ходим случайно
				let cell = Math.floor(Math.random() * 9);
				board[cell] ? this.#AI() : this.move(cell);
			}
		}else{
			// Лёгкий ИИ - случайный ход
			let cell = Math.floor(Math.random() * 9);
			board[cell] ? this.#AI() : this.move(cell);
		}
	}
}

export default TicTacToe;
