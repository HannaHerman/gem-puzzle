import create from './create.js';
import { get } from './storage.js';
import { set } from './storage.js';

const container = create('main', 'container');
const hideClass = 'hidden';

export default class Game {
  constructor() {
    this.movesCounter = 0;
    this.size = 0;
    this.soundOn = true;
    this.counter = 0;
    this.empty = {
      top: '0',
      left: '0'
    };
    this.startDate = 0;
    this.initTime = true;
    this.countTime;
  }

  init() {
    this.wraper = create('div', 'wraper', '', container);
    this.menu = create('div', 'main-menu', [
      create('h2', 'main-menu__title', 'Choose field size'),
      create('div', 'main-menu__field-size', [
        create('button', 'field-size-option btn', '3x3', null, ['code', 3]),
        create('button', 'field-size-option btn', '4x4', null, ['code', 4]),
        create('button', 'field-size-option btn', '5x5', null, ['code', 5]),
        create('button', 'field-size-option btn', '6x6', null, ['code', 6]),
        create('button', 'field-size-option btn', '7x7', null, ['code', 7]),
        create('button', 'field-size-option btn', '8x8', null, ['code', 8]),
      ]),
      create('button', 'main-menu__records btn', 'records', null, ['value', 'records']),
      create('button', 'main-menu__previous btn', 'previous game', null, ['value', 'previous']),
    ], container);
    
    document.body.prepend(container);

    const menuButtons = document.querySelectorAll('.btn');

    for (let index = 0; index < menuButtons.length; index++) {
      let button = menuButtons[index];
      button.addEventListener('click', this.handleMenu);
    }

    return this;
  }

  handleMenu = (e) => {
    this.btnSound(this.soundOn);

    if(e.target.dataset.code) {
      this.size = e.target.dataset.code;
      this.counter = 0;
      this.generateLayout(this.size);
    }

    if(e.target.value === 'previous') {
      this.getSavedGame();
    }

    if(e.target.value === 'records') {
      this.generateRecords();
    }
  }

  handleGame = (e) => {
    this.moveSound(this.soundOn);

    let cellTop = parseInt(e.target.style.top, 10);
    let cellLeft = parseInt(e.target.style.left, 10);
    let el = e.target;

    this.move(cellTop, cellLeft, el);
    
    this.movesContainer.value = this.counter;
    
    const allCells = document.querySelectorAll('.cell');

    if (this.isWin(allCells)) {
      this.startStop();
      this.generateGameEnd();
    };
  }

  handleCommands = (e) => {
    this.btnSound(this.soundOn);
    let targetValue = e.target.closest('.command').value;
    let targetEl = e.target.closest('.command');
    if(targetValue === 'sound') {
      let targetIcon = document.querySelector('.sound-icon');
      if (this.soundOn) {
        this.soundOn = false;
        targetIcon.innerHTML = 'volume_off';
      } else {
        this.soundOn = true;
        targetIcon.innerHTML = 'volume_up';
      }
    }
    if (targetValue === 'restart') {
      this.resultContainer.remove();
      this.field.remove();
      this.commandsContainer.remove();
      this.counter = 0;
      this.generateLayout(this.size);
    }
    if (targetValue === 'main') {
      this.resultContainer.remove();
      this.field.remove();
      this.commandsContainer.remove();
      this.wraper.classList.remove(hideClass);
      this.menu.classList.remove(hideClass);
    }
    if (targetValue === 'save') {
      this.saveGame();
    }
    if (targetValue === 'restart-end') {
      this.endGameContainer.remove();
      this.counter = 0;
      this.generateLayout(this.size);
    }
    if (targetValue === 'main-end') {
      this.endGameContainer.remove();
      this.wraper.classList.remove(hideClass);
      this.menu.classList.remove(hideClass);
    }
    if (targetValue === 'save-end') {
      this.saveRecord();
      targetEl.setAttribute('disabled', 'disabled');
    }
  }

  generateLayout(size, savedGame = null) {
    this.wraper.classList.add(hideClass);
    this.menu.classList.add(hideClass);

    this.resultContainer = create('div', 'result-container', '', container);
    this.timeContainer = create('input', 'time-container results', '', this.resultContainer, ['value', '0:00:00'], ['disabled', 'disabled']);
    this.movesContainer = create('input', 'moves-container results', '', this.resultContainer, ['value', this.counter], ['disabled', 'disabled']);

    this.startDate = new Date().getTime();
    this.initTime = true;
    this.startStop();

    this.field = create('div', 'field', '', container);
    
    this.commandsContainer = create('div', 'commands-container', [
      create('button', 'sound command', [create('i', 'material-icons sound-icon', 'volume_up')], null, ['value', 'sound'], ['title', 'on/off sound']),
      create('button', 'restart command', [create('i', 'material-icons', 'autorenew')], null, ['value', 'restart'], ['title', 'restart the game']),
      create('button', 'save-game command', [create('i', 'material-icons', 'save')], null, ['value', 'save'], ['title', 'save the game']),
      create('button', 'to-main-menu command', [create('i', 'material-icons', 'menu')], null, ['value', 'main'], ['title', 'back to main menu'])
    ], container);

    const targetIcon = document.querySelector('.sound-icon');

    if (!this.soundOn) {
      targetIcon.innerHTML = 'volume_off';
    }

    const commandsButtons = document.querySelectorAll('.command');

    for (let j = 0; j < commandsButtons.length; j++) {
      let button = commandsButtons[j];
      button.addEventListener('click', this.handleCommands);
    }

    let cellSize = 100;

    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;
    
    if ((size > 5 && (windowWidth < 700 || windowHeight < 710)) || size > 6) {
      cellSize = 50;
    }
    
    this.field.style.height = `${size * cellSize}px`;
    this.field.style.width = `${size * cellSize}px`;

    const cellsNumber = Math.pow(size, 2) - 1;


    if (savedGame) {
      let genArr = savedGame;

      for (let m = 0; m < genArr.length; m++) {
        const cellContainer = create('div', 'cell', '', this.field);

        const left = genArr[m].left;
        const top = genArr[m].top;

        cellContainer.style.left = `${left}px`;
        cellContainer.style.top = `${top}px`;
        cellContainer.style.height = `${cellSize}px`;
        cellContainer.style.width = `${cellSize}px`;

        if (m < cellsNumber) {
          let position = genArr[m].order;
          cellContainer.innerHTML = position;
          cellContainer.style.backgroundImage = `url(./assets/img/${size}x${size}/${size}_${genArr[m].order}.jpg)`;
          cellContainer.dataset.order = genArr[m].order;
          cellContainer.addEventListener('click', this.handleGame);
        }
      }    
    } else {
      const generationArr = this.generateRandom(cellsNumber);
      
      this.empty.top = this.empty.left = (size - 1) * cellSize;

      for (let i = 0; i < cellsNumber; i++) {
        const cellContainer = create('div', 'cell', '', this.field);
        const left = i % size;
        const top = (i - left) / size;
       

        cellContainer.style.left = `${left*cellSize}px`;
        cellContainer.style.top = `${top*cellSize}px`;
        cellContainer.style.height = `${cellSize}px`;
        cellContainer.style.width = `${cellSize}px`;

        if (i < cellsNumber) {
          let randPosition = generationArr[i];
          cellContainer.innerHTML = randPosition;
          cellContainer.style.backgroundImage = `url(./assets/img/${size}x${size}/${size}_${generationArr[i]}.jpg)`;
          cellContainer.dataset.order = generationArr[i];
          cellContainer.addEventListener('click', this.handleGame);
        }
      }
    }
  }

  move(cellTop, cellLeft, el) {
    const topDiff = Math.abs(this.empty.top - cellTop);
    const leftDiff = Math.abs(this.empty.left - cellLeft);

    let cellSize = 100;

    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;
    
    if ((this.size > 5 && (windowWidth < 700 || windowHeight < 710)) || this.size > 6) {
      cellSize = 50;
    }

    if (leftDiff + topDiff > cellSize) {
      return
    }

    const emptyLeft = this.empty.left;
    const emptyTop = this.empty.top;

    this.empty.top = cellTop;
    this.empty.left = cellLeft;
    el.style.left = `${emptyLeft}px`;
    el.style.top = `${emptyTop}px`;
    this.counter++;
  }

  isWin(allCells) {
    
    let matchCounter = 0;

    let cellSize = 100;

    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;

    if ((this.size > 5 && (windowWidth < 700 || windowHeight < 710)) || this.size > 6) {
      cellSize = 50;
    }
   
    for (let k = 0; k < allCells.length; k++) {
      let cellTop = parseInt(allCells[k].style.top, 10);
      let cellLeft = parseInt(allCells[k].style.left, 10);
      let cellOrder = parseInt(allCells[k].dataset.order);
      let cellPosition = cellTop / cellSize * this.size + cellLeft / cellSize + 1;
      if (cellOrder === cellPosition) {
        matchCounter++;
      }
    }

    const cellsNumber = Math.pow(this.size, 2) - 1;
    
    if (matchCounter === cellsNumber) {
      return true;
    } else {
      return false;
    }
  }

  moveSound(soundOn) {
    const soundMove = new Audio('./assets/sound/move-sound.mp3');
    if(soundOn) {
      soundMove.play();
    } 
  }

  btnSound(soundOn) {
    const soundBtn = new Audio('./assets/sound/btn-sound.mp3');
    if(soundOn) {
      soundBtn.play();
    } 
  }

  startTime(startDate) {
    let hours = 0, minutes = 0, seconds = 0, milliseconds = 0;

    let currentDate = new Date().getTime();
    let difference = currentDate - startDate;

    if (difference > 999) {
      milliseconds = difference % 1000;
      seconds = parseInt(difference / 1000);
    } else {
      milliseconds = difference;
    }

    if (seconds > 0) {
      minutes = parseInt(seconds / 60);
      seconds = seconds % 60;
    }
    
    if (minutes > 0) {
      hours = parseInt(minutes / 60);
      minutes = minutes % 60;
    }
    
    let strMinutes = minutes < 10 ? '0' + minutes : minutes;
    let strSeconds = seconds < 10 ? '0' + seconds : seconds;

    let resStr = hours + ':' + strMinutes + ':' + strSeconds;
    
    let timeForm = document.querySelector('.time-container');
    
    if(timeForm) {
      timeForm.value = resStr;
    }
  }

  startStop() {
    if (this.initTime) {
      this.startDate = new Date();
      this.countTime = setInterval( () => {
        this.startTime(this.startDate)
      }, 1000);
      this.initTime = false;
    } else {
      this.initTime = true;
      clearInterval(this.countTime);
    }
  }

  saveGame() {
    const allElements = document.querySelectorAll('.cell');

    let gameToSave = [this.size, this.counter, this.empty];

    for (let n = 0; n < allElements.length; n++) {
      let topToSave = parseInt(allElements[n].style.top, 10);
      let leftToSave = parseInt(allElements[n].style.left, 10);
      let order = allElements[n].dataset.order;
      gameToSave.push({
        top: topToSave,
        left: leftToSave,
        order: order
      })
    }

    set('savedGame', gameToSave);
  }

  getSavedGame() {
    let savedGame = get('savedGame');
    if (savedGame) {
      this.size = savedGame[0];
      this.counter = savedGame[1];
      this.empty = savedGame[2];
      
      savedGame.splice(0, 3);

      this.generateLayout(this.size, savedGame);
    }
  }

  generateRandom(cellsNumber) {
  let generationArr = [];

    while (cellsNumber > generationArr.length) {
      let number = Math.floor(Math.random()*cellsNumber + 1);
      if (!(generationArr.includes(number))) {
        generationArr.push(number);
      }
    }

    let resultSequence = 0;

    for (let i = 0; i <= generationArr.length - 1; i += 1) {
      for (let j = i + 1; j <= generationArr.length - 1; j += 1) {
        if (generationArr[i] > generationArr[j]) {
          resultSequence += 1;
        }
      }
    }
    if (resultSequence % 2 === 0) {
      return generationArr;
    } else {
      return this.generateRandom(cellsNumber);
    }
  }
  generateGameEnd() {
    let time = this.timeContainer.value;
    let moves = this.counter;

    this.resultContainer.remove();
    this.field.remove();
    this.commandsContainer.remove();

    this.endGameContainer = create('div', 'end-game', [
      create('h2', 'end-moves-title', 'Spent moves:'),
      create('input', 'end-moves', '', null, ['value', moves], ['disabled', 'disabled']),
      create('h2', 'end-time-title', 'Spent time:'),
      create('input', 'end-time', '', null, ['value', time], ['disabled', 'disabled']),
      create('input', 'end-name', ''),
    ], container);

    this.endCommands = create('div', 'end-commands', [
      create('button', 'restart command end-command', [create('i', 'material-icons', 'autorenew')], null, ['value', 'restart-end'], ['title', 'restart the game']),
      create('button', 'to-main-menu command end-command', [create('i', 'material-icons', 'menu')], null, ['value', 'main-end'], ['title', 'back to main menu']),
      create('button', 'save-name command end-command', [create('i', 'material-icons', 'save')], null, ['value', 'save-end'], ['title', 'save name'])
    ], this.endGameContainer);

    const commandsButtons = document.querySelectorAll('.command');

    for (let j = 0; j < commandsButtons.length; j++) {
      let button = commandsButtons[j];
      button.addEventListener('click', this.handleCommands);
    }
  }

  saveRecord() {
    let spentMoves = this.counter;

    let recordName = document.querySelector('.end-name').value;

    let savedRecords = get('records');

    if (savedRecords) {
      for (let g = 0; g < savedRecords.length; g++) {
        if (savedRecords[g].moves >= spentMoves && savedRecords.length === 10) {
          savedRecords.splice(g, 0, {
            moves: spentMoves,
            name: recordName
          });
          savedRecords.splice(10, 1);
          break
        } else if (savedRecords[g].moves >= spentMoves && savedRecords.length < 10) {
          savedRecords.splice(g, 0, {
            moves: spentMoves,
            name: recordName
          });
          break
        } else if (savedRecords[g].moves < spentMoves && savedRecords.length < 10) {
          if (g === savedRecords.length - 1) {
            savedRecords.push({
            moves: spentMoves,
            name: recordName
            });
          }
        }
      }
    } else if (savedRecords === null) {
      savedRecords = [{
        moves: spentMoves,
        name: recordName
      }];
    }

    set('records', savedRecords);
  }

  generateRecords() {
    this.wraper.classList.add(hideClass);
    this.menu.classList.add(hideClass);

    this.recordsContainer = create('div', 'records-container', '', container);

    let savedRecords = get('records');

    if (savedRecords) {
      for (let y = 0; y < savedRecords.length; y++) {
        create('div', 'records-line', [
          create('p', 'records-item', `${y + 1}. ${savedRecords[y].name}`),
          create('p', 'records-item', savedRecords[y].moves.toString())
        ], this.recordsContainer);
      }
    } else {
      create('p', 'records-item', `No saved records`, this.recordsContainer)
    }
    
    const recordsButton = create('button', 'records-btn', 'main menu', this.recordsContainer);

    recordsButton.addEventListener('click', () => {
      this.btnSound(this.soundOn);
      this.recordsContainer.remove();
      this.wraper.classList.remove(hideClass);
      this.menu.classList.remove(hideClass);
    })
    
  }
}
