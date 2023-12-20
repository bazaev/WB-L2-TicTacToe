import XOEngine from "./TicTacToe.class.js";
import $ from "./elements.js";

class TicTacToe extends XOEngine {
	constructor() {
		super();
		// Загружаем состояние
		const state = this.#loadState();

		// Инициализируем состояние
		this.setState(state);
		// Инициализируем элементы
		this.#init(state);
		// Инициализируем обработчики
		this.#initEvents();
		// Инициализируем внутренние обработчики
		this.#initInnerEvents();
	}

	#init(state) {
		// Инициализируем элементы
		if (state) {
			if (state.start) {
				this.#startHandler()
			}
			if (state.start || state.winner) {
				$.start.innerText = "Заново";
			}
			if (state.winner) {
				this.#winnerHandler(state);
			}else{
				$.winner.style.visibility = "hidden";
			}
			if (state.moves) {
				this.#setMoves(state.moves);
			}
			if (state.vs) {
				$.vs.elements[state.vs].checked = true;
			}
			if (state.side !== undefined) {
				$.side.elements[state.side ? 0 : 1].checked = true;
			}
			if (state.board) {
				state.board.forEach((player, cell) => {
					if (player) {
						this.#moveHandler(cell, player);
					}
				})
			}
		}else{
			$.winner.style.visibility = "hidden";
		}
	}

	#initEvents() {
		// Инициализируем обработчики
		[].forEach.call($.cols, ($col, key) => {
			$col.addEventListener("click", () => {
				this.move(key);
			})				
		})
	
		$.start.addEventListener("click", this.start.bind(this))
	
		$.clear.addEventListener("click", () => {
			// Очищаем доску
			this.clear();
			// Сбрасываем селекторы
			$.vs.elements[0].click();
			$.side.elements[0].click();
		});
	
		$.vs.addEventListener("change", ({ target }) => this.setVS(target.value));
	
		$.side.addEventListener("change", this.#sideHandler.bind(this));

		// Сохраняем состояние перед выгрузкой страницы
		globalThis.addEventListener("beforeunload", this.#saveState.bind(this));
	}

	// Инициализируем внутренние (игровые) обработчики
	#initInnerEvents() {
		this.on(this.event.start, this.#startHandler);

		this.on(this.event.stop, this.#stopHandler);
	
		this.on(this.event.move, ({ moves, player, cell }) => {
			this.#moveHandler(cell, player);
			this.#setMoves(moves);
		});
	
		this.on(this.event.clear, this.#clearHandler.bind(this));
	
		this.on(this.event.end, this.#winnerHandler);
	}

	// Сохраняем состояние
	#saveState() {
		const state = this.getState();
		localStorage.setItem("xo", JSON.stringify(state));
	}

	// Загружаем состояние
	#loadState() {
		const state = localStorage.getItem("xo");
		return state && JSON.parse(state);
	}

	// Обработчик селектора стороны (X/O)
	#sideHandler({ target }) {
		return this.setSide(target.value !== "1")
	}

	// Обработчик старта игры
	#startHandler() {
		$.xo.classList.add("play");
		$.start.innerText = "Заново";
	}

	// Обработчик остановки игры
	#stopHandler() {
		$.xo.classList.remove("play");
	}

	// Обработчик сброса игры
	#clearHandler() {
		// Очищаем все ячейки
		[].forEach.call($.cols, $col => {
			$col.removeAttribute("data-symbol");
			$col.classList.remove("win");
		});
		// Меняем текст кнопки старта
		$.start.innerText = "Начать";
		// Сбрасываем счетчик ходов
		$.moves.textContent = 0;
		// Скрываем блок победителя
		$.winner.style.visibility = "hidden";
		// Останавливаем игру
		this.stop();
	}

	// Обработчик победы
	#winnerHandler({ winner, winCombination }) {
		// Выводим победителя
		$.player.innerText = winner === 1 ? "X" : winner === 2 ? "O" : "Ничья";
		// Показываем блок победителя
		$.winner.style.visibility = "";
		// Добавляем стили для выигравшей комбинации
		if (winCombination) {
			winCombination.forEach(col => {
				$.cols[col].classList.add("win");
			})
		}
	}

	// Обработчик хода
	#moveHandler(cell, player) {
		$.cols[cell].dataset.symbol = side ? player === 1 ? "X" : "O" : player === 1 ? "O" : "X";
	}

	// Визуальное изменение счетчика ходов
	#setMoves(moves) {
		$.moves.textContent = moves;
	}
}

export default TicTacToe;
