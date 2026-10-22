import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  onSnapshot,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

import { app, db, auth, authReady } from './firebase-config.js';



const $ = id => document.getElementById(id);

const dbstate = {
  app: null,
  db: null,
  uid: null,
  ref: null,
  unsub: null,
  room: null,
  nick: 'Игрок',
  mode: 'coop',
  solo: true,
  puzzle: null,
  values: {},
  dir: 'across',
  word: null,
  roomData: null,
  puzzleVersion: 0,
  checked: new Set(),
  wrong: new Set(),
  start: Date.now(),
  elapsed: 0,
  paused: false,
  timer: null,
  historySaved: false
};

const D = {
  design: [
    ['КОМПОЗИЦИЯ', 'Организация элементов в единую визуальную структуру.'],
    ['КОНТРАСТ', 'Различие элементов по цвету, размеру или форме.'],
    ['ШРИФТ', 'Графическое начертание букв и знаков.'],
    ['ПАЛИТРА', 'Набор цветов, используемых в работе.'],
    ['МАКЕТ', 'Схема будущего изделия или страницы.'],
    ['ВЕКТОР', 'Графика, описываемая математическими кривыми.'],
    ['ПИКСЕЛЬ', 'Минимальный элемент растрового изображения.'],
    ['ДИЗАЙН', 'Проектирование внешнего вида и свойств объекта.'],
    ['ИНТЕРФЕЙС', 'Средство взаимодействия человека с программой.'],
    ['АНИМАЦИЯ', 'Создание иллюзии движения.'],
    ['КОД', 'Инструкции на языке программирования.'],
    ['СЕТКА', 'Система направляющих для размещения элементов.']
  ],
  nature: [
    ['РОМАШКА', 'Цветок с белыми лепестками и жёлтой серединой.'],
    ['ПАПОРОТНИК', 'Растение, размножающееся спорами.'],
    ['БЕРЁЗА', 'Дерево с белой корой.'],
    ['ОКЕАН', 'Огромное водное пространство между материками.'],
    ['ВУЛКАН', 'Из него может извергаться лава.'],
    ['ЛИСТ', 'Орган растения, участвующий в фотосинтезе.'],
    ['КОРЕНЬ', 'Часть растения, обычно находящаяся в почве.'],
    ['БАБОЧКА', 'Насекомое с большими крыльями.'],
    ['ГРОЗА', 'Явление с молнией и громом.'],
    ['РАДУГА', 'Цветная дуга в небе после дождя.'],
    ['ЛЕС', 'Большая территория, покрытая деревьями.'],
    ['СНЕГ', 'Осадки в виде ледяных кристаллов.']
  ],
  space: [
    ['ГАЛАКТИКА', 'Большая система звёзд, газа и пыли.'],
    ['КОМЕТА', 'Небесное тело, которое может иметь хвост.'],
    ['ОРБИТА', 'Траектория движения тела вокруг другого.'],
    ['ПЛАНЕТА', 'Небесное тело, вращающееся вокруг звезды.'],
    ['КОСМОС', 'Пространство за пределами земной атмосферы.'],
    ['СПУТНИК', 'Тело, обращающееся вокруг планеты.'],
    ['ЗВЕЗДА', 'Небесное тело, излучающее собственный свет.'],
    ['НЕПТУН', 'Восьмая планета Солнечной системы.'],
    ['МАРС', 'Четвёртая планета от Солнца.'],
    ['РАКЕТА', 'Летательный аппарат с реактивным двигателем.'],
    ['ЛУНА', 'Естественный спутник Земли.'],
    ['ТУМАННОСТЬ', 'Облако газа и пыли в космосе.']
  ],
  culture: [
    ['МУЗЕЙ', 'Как называется учреждение, где собирают, хранят и выставляют произведения искусства и исторические предметы?'],
    ['РОМАН', 'Большое повествовательное произведение.'],
    ['СИМФОНИЯ', 'Музыкальное произведение для оркестра.'],
    ['СКУЛЬПТУРА', 'Объёмное произведение искусства.'],
    ['ТЕАТР', 'Место сценических постановок.'],
    ['ПОЭЗИЯ', 'Литературное творчество в стихах.'],
    ['КАРТИНА', 'Произведение живописи.'],
    ['МЕЛОДИЯ', 'Последовательность музыкальных звуков.'],
    ['АРХИВ', 'Собрание документов на хранении.'],
    ['БАЛЕТ', 'Сценическое искусство танца под музыку.'],
    ['ХУДОЖНИК', 'Создатель произведений изобразительного искусства.'],
    ['МОЗАИКА', 'Изображение из небольших цветных фрагментов.']
  ],
  music: [
    ['МЕЛОДИЯ', 'Как называется последовательность музыкальных звуков, образующая узнаваемую музыкальную мысль?'],
    ['РИТМ', 'Как называется чередование и длительность звуков и пауз в музыке?'],
    ['ТЕМБР', 'Как называется окраска звука, по которой различают голоса и инструменты?'],
    ['ОКТАВА', 'Как называется интервал между двумя звуками, один из которых вдвое выше по частоте другого?'],
    ['АККОРД', 'Как называется одновременное звучание нескольких разных по высоте нот?'],
    ['НОТА', 'Как называется условный знак для обозначения музыкального звука?'],
    ['ХОР', 'Как называется коллектив певцов, исполняющий произведения вместе?'],
    ['ДУЭТ', 'Как называется музыкальное исполнение двумя артистами?'],
    ['БАРАБАН', 'Как называется ударный инструмент с мембраной, по которой ударяют палочками или руками?'],
    ['ГИТАРА', 'Как называется струнный инструмент, на котором обычно играют пальцами или медиатором?'],
    ['ОПЕРА', 'Как называется музыкально-сценическое произведение, в котором персонажи поют под сопровождение оркестра?'],
    ['КОМПОЗИТОР', 'Как называется человек, который сочиняет музыку?']
  ],
  food: [
    ['ПЕЛЬМЕНИ', 'Как называются небольшие изделия из пресного теста с мясной начинкой, которые обычно варят в воде?'],
    ['ОМЛЕТ', 'Блюдо из взбитых яиц.'],
    ['КОРИЦА', 'Ароматная пряность из коры дерева.'],
    ['ЛИМОН', 'Жёлтый цитрусовый плод с кислым вкусом.'],
    ['МАРМЕЛАД', 'Сладость из фруктового сока или пюре.'],
    ['ПИРОГ', 'Как называется выпечка из теста с начинкой, которую готовят в духовке?'],
    ['САЛАТ', 'Как называется холодное блюдо из нарезанных овощей, часто заправленное маслом или соусом?'],
    ['КАША', 'Блюдо из крупы, сваренной в жидкости.'],
    ['МЁД', 'Сладкий продукт, который производят пчёлы.'],
    ['СЫР', 'Как называется молочный продукт, который получают свёртыванием молока и созреванием сырной массы?'],
    ['ЯГОДА', 'Небольшой сочный плод.'],
    ['ПАСТА', 'Как называется итальянское блюдо, в котором отварные макароны подают с соусом?']
  ]
};

D.mixed = [
  ...D.design.slice(0, 4),
  ...D.nature.slice(0, 3),
  ...D.space.slice(0, 3),
  ...D.culture.slice(0, 2),
  ...D.food.slice(0, 2)
];

const norm = s => String(s).toLocaleUpperCase('ru-RU').replace(/Ё/g, 'Е').replace(/[^А-Я]/g, '');
const shuffle = a => [...a].sort(() => Math.random() - .5);
const mode = () =>
  document.querySelector('input[name="createMode"]:checked')?.value ||
  document.querySelector('input[name="mode"]:checked')?.value ||
  'coop';
let selectedSettings = null;
const settings = () => ({ ...((selectedSettings) || { topic: 'mixed', difficulty: 'medium' }) });
const nick = () => {
  let n = $('nickname').value.trim().replace(/[<>]/g, '').slice(0, 18);
  if (n.length < 2) throw Error('Введи никнейм не короче 2 символов.');
  return n;
};
const codegen = () => Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

function msg(id, s, err = false) {
  $(id).textContent = s;
  $(id).classList.toggle('error', err);
}

function toast(s) {
  $('toast').textContent = s;
  $('toast').classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => $('toast').classList.remove('show'), 2500);
}

function can(g, w, r, c, d) {
  let H = g.length, W = g[0].length,
      er = r + (d === 'down' ? w.length - 1 : 0),
      ec = c + (d === 'across' ? w.length - 1 : 0);
  if (r < 0 || c < 0 || er >= H || ec >= W) return false;
  let br = r - (d === 'down' ? 1 : 0),
      bc = c - (d === 'across' ? 1 : 0),
      ar = er + (d === 'down' ? 1 : 0),
      ac = ec + (d === 'across' ? 1 : 0);
  if (br >= 0 && bc >= 0 && g[br][bc]) return false;
  if (ar < H && ac < W && g[ar][ac]) return false;
  let crosses = 0;
  for (let i = 0; i < w.length; i++) {
    let rr = r + (d === 'down' ? i : 0),
        cc = c + (d === 'across' ? i : 0),
        x = g[rr][cc];
    if (x && x.letter !== w[i]) return false;
    if (x) crosses++;
    else if (d === 'across' && ((rr > 0 && g[rr - 1][cc]) || (rr < H - 1 && g[rr + 1][cc]))) return false;
    else if (d === 'down' && ((cc > 0 && g[rr][cc - 1]) || (cc < W - 1 && g[rr][cc + 1]))) return false;
  }
  return crosses > 0;
}

function generate(topic, diff, custom = null) {
  let count = { easy: 6, medium: 9, hard: 12 }[diff] || 9;
  let list = shuffle((custom || D[topic] || D.mixed).filter(x => norm(x[0]).length >= 3))
    .slice(0, count)
    .map(([a, clue]) => ({ answer: norm(a), clue }));
  let size = 19,
      g = Array.from({ length: size }, () => Array(size).fill(null)),
      words = [];
  if (!list.length) throw Error('Для темы нет слов.');
  let first = list.shift(),
      r = 9,
      c = Math.floor((size - first.answer.length) / 2);
  for (let i = 0; i < first.answer.length; i++) g[r][c + i] = { letter: first.answer[i] };
  words.push({ ...first, row: r, col: c, dir: 'across' });
  for (let item of list) {
    let opts = [];
    for (let i = 0; i < item.answer.length; i++)
      for (let old of words)
        for (let j = 0; j < old.answer.length; j++) {
          if (item.answer[i] !== old.answer[j]) continue;
          let d = old.dir === 'across' ? 'down' : 'across',
              rr = old.row + (old.dir === 'down' ? j : 0) - (d === 'down' ? i : 0),
              cc = old.col + (old.dir === 'across' ? j : 0) - (d === 'across' ? i : 0);
          if (can(g, item.answer, rr, cc, d)) opts.push({ row: rr, col: cc, dir: d });
        }
    if (!opts.length) continue;
    let p = opts[Math.floor(Math.random() * opts.length)],
        idx = words.length;
    for (let i = 0; i < item.answer.length; i++) {
      let rr = p.row + (p.dir === 'down' ? i : 0),
          cc = p.col + (p.dir === 'across' ? i : 0);
      if (!g[rr][cc]) g[rr][cc] = { letter: item.answer[i] };
    }
    words.push({ ...item, ...p });
  }
  if (words.length < 4) return generateFallback(topic, diff, custom);
  let minR = 99, minC = 99, maxR = 0, maxC = 0;
  g.forEach((row, ri) => row.forEach((x, ci) => {
    if (x) {
      minR = Math.min(minR, ri);
      minC = Math.min(minC, ci);
      maxR = Math.max(maxR, ri);
      maxC = Math.max(maxC, ci);
    }
  }));
  g = g.slice(minR, maxR + 1).map(row => row.slice(minC, maxC + 1));
  words.forEach((w, i) => {
    w.row -= minR;
    w.col -= minC;
    w.id = 'w' + i;
    w.cells = Array.from({ length: w.answer.length }, (_, k) =>
      `${w.row + (w.dir === 'down' ? k : 0)},${w.col + (w.dir === 'across' ? k : 0)}`);
  });
  let num = 1;
  for (let rr = 0; rr < g.length; rr++)
    for (let cc = 0; cc < g[0].length; cc++) {
      if (g[rr][cc] && words.some(w => w.row === rr && w.col === cc)) g[rr][cc].number = num++;
    }
  words.forEach(w => w.number = g[w.row][w.col].number);
  return { grid: g, words, rows: g.length, cols: g[0].length };
}

function generateFallback(topic, diff, custom) {
  let list = shuffle(custom || D[topic] || D.mixed).slice(0, 8),
      size = 21,
      g = Array.from({ length: size }, () => Array(size).fill(null)),
      words = [];
  let a = list[0], r = 10, c = 4;
  for (let i = 0; i < norm(a[0]).length; i++) g[r][c + i] = { letter: norm(a[0])[i] };
  words.push({ answer: norm(a[0]), clue: a[1], row: r, col: c, dir: 'across' });
  for (let [raw, clue] of list.slice(1)) {
    let w = norm(raw), found = false;
    for (let i = 0; i < w.length && !found; i++)
      for (let j = 0; j < words[0].answer.length && !found; j++)
        if (w[i] === words[0].answer[j]) {
          let rr = r - i, cc = c + j;
          if (can(g, w, rr, cc, 'down')) {
            for (let k = 0; k < w.length; k++) g[rr + k][cc] = { letter: w[k] };
            words.push({ answer: w, clue, row: rr, col: cc, dir: 'down' });
            found = true;
          }
        }
  }
  let minR = 21, minC = 21, maxR = 0, maxC = 0;
  g.forEach((row, ri) => row.forEach((x, ci) => {
    if (x) {
      minR = Math.min(minR, ri);
      minC = Math.min(minC, ci);
      maxR = Math.max(maxR, ri);
      maxC = Math.max(maxC, ci);
    }
  }));
  g = g.slice(minR, maxR + 1).map(row => row.slice(minC, maxC + 1));
  words.forEach((w, i) => {
    w.row -= minR;
    w.col -= minC;
    w.id = 'w' + i;
    w.cells = Array.from({ length: w.answer.length }, (_, k) =>
      `${w.row + (w.dir === 'down' ? k : 0)},${w.col + (w.dir === 'across' ? k : 0)}`);
  });
  let n = 1;
  for (let rr = 0; rr < g.length; rr++)
    for (let cc = 0; cc < g[0].length; cc++)
      if (g[rr][cc] && words.some(w => w.row === rr && w.col === cc)) g[rr][cc].number = n++;
  words.forEach(w => w.number = g[w.row][w.col].number);
  return { grid: g, words, rows: g.length, cols: g[0].length };
}

function empty(p) {
  let v = {};
  p.grid.forEach((row, r) => row.forEach((x, c) => {
    if (x) v[`${r},${c}`] = '';
  }));
  return v;
}


function packPuzzle(p) {
  return {
    ...p,
    grid: p.grid.flat()
  };
}

function unpackPuzzle(p) {
  return {
    ...p,
    grid: Array.from(
      { length: p.rows },
      (_, r) => p.grid.slice(r * p.cols, (r + 1) * p.cols)
    )
  };
}


function currentWord() {
  return dbstate.puzzle?.words.find(w => w.id === dbstate.word);
}

function letters(w, v = dbstate.values) {
  return w.cells.map(k => v[k] || '').join('');
}

function startPuzzle(p, room = null, gameMode = 'coop', solo = true) {
  dbstate.puzzle = p;
  dbstate.room = room;
  dbstate.mode = gameMode;
  dbstate.solo = solo;
  dbstate.values = empty(p);
  dbstate.checked = new Set();
  dbstate.wrong = new Set();
  dbstate.word = p.words[0]?.id;
  dbstate.dir = 'across';
  dbstate.start = Date.now();
  dbstate.elapsed = 0;
  dbstate.paused = false;
  dbstate.historySaved = false;
  $('lobby').classList.add('hidden');
  $('game').classList.remove('hidden');
  $('roomLabel').textContent = room ? `КОМНАТА ${room}` : 'ОДИНОЧНАЯ ИГРА';
  $('gameTitle').textContent = gameMode === 'coop'
    ? 'Командный кроссворд'
    : gameMode === 'competitive'
      ? 'Кроссворд на скорость'
      : 'Своя партия';
  const gameSettings = room && dbstate.roomData?.settings ? dbstate.roomData.settings : settings();
  $('subtitle').textContent = `${topicNames?.[gameSettings.topic] || gameSettings.topic} · ${diffNames?.[gameSettings.difficulty] || gameSettings.difficulty}`;
  $('codeLabel').textContent = room || 'СОЛО';
  $('sync').textContent = solo ? 'Локальная игра' : 'Синхронизация Firebase';
  $('wordCount').textContent = `${p.words.length} слов`;
  $('gameMsg').textContent = '';
  render();
  clearInterval(dbstate.timer);
  dbstate.timer = setInterval(() => {
    if (!dbstate.paused) {
      let s = dbstate.elapsed + Math.floor((Date.now() - dbstate.start) / 1000);
      $('timer').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    }
  }, 1000);
}

function render() {
  let board = $('board'), p = dbstate.puzzle,
      w = currentWord(),
      active = new Set(w?.cells || []);
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${p.cols},var(--cell))`;
  p.grid.forEach((row, r) => row.forEach((cell, c) => {
    let key = `${r},${c}`,
        b = document.createElement('div');
    b.className = 'cell' + (!cell ? ' block' : '');
    if (!cell) {
      board.append(b);
      return;
    }
    if (active.has(key)) b.classList.add('active-word');
    if (w?.cells[0] === key) b.classList.add('selected');
    if (dbstate.checked.has(key)) b.classList.add('correct-cell');
    if (dbstate.wrong.has(key)) b.classList.add('wrong-cell');
    if (cell.number) {
      let n = document.createElement('span');
      n.className = 'num';
      n.textContent = cell.number;
      b.append(n);
    }
    let inp = document.createElement('input');
    inp.maxLength = 1;
    inp.value = dbstate.values[key] || '';
    inp.readOnly = dbstate.checked.has(key);
    inp.setAttribute('aria-label', `Клетка ${r + 1}, ${c + 1}`);
    inp.addEventListener('focus', () => focusCell(key));
    inp.addEventListener('input', e => {
      if (dbstate.checked.has(key)) {
        e.target.value = dbstate.values[key] || '';
        return;
      }
      dbstate.values[key] = norm(e.target.value).slice(-1);
      dbstate.puzzle.words
        .filter(x => x.cells.includes(key))
        .forEach(x => x.cells.forEach(k => dbstate.wrong.delete(k)));
      e.target.value = dbstate.values[key];
      syncAnswers();
      stats();
      if (e.target.value) {
        let ww = currentWord(),
            i = ww?.cells.indexOf(key) ?? -1;
        if (ww && i >= 0) {
          let next = ww.cells.slice(i + 1).find(k => !dbstate.checked.has(k));
          if (next) document.querySelector(`[data-key="${next}"]`)?.focus();
        }
      }
    });
    inp.dataset.key = key;
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value) {
        let ww = currentWord(),
            i = ww?.cells.indexOf(key) ?? -1;
        if (i > 0) {
          e.preventDefault();
          document.querySelector(`[data-key="${ww.cells[i - 1]}"]`)?.focus();
        }
      }
    });
    b.append(inp);
    b.addEventListener('click', () => focusCell(key));
    board.append(b);
  }));
  renderClues();
  stats();
  renderPlayers();
}

function focusCell(key) {
  let candidates = dbstate.puzzle.words.filter(w => w.cells.includes(key));
  let w = candidates.find(w => w.id === dbstate.word && w.dir === dbstate.dir)
    || candidates.find(w => w.dir === dbstate.dir)
    || candidates[0];
  if (w) {
    dbstate.word = w.id;
    dbstate.dir = w.dir;
    render();
    document.querySelector(`[data-key="${key}"]`)?.focus({ preventScroll: true });
  }
}

function renderClues() {
  let list = $('clues');
  list.innerHTML = '';
  dbstate.puzzle.words
    .filter(w => w.dir === dbstate.dir)
    .forEach(w => {
      let b = document.createElement('button');
      b.className = 'clue' + (w.id === dbstate.word ? ' active' : '');
      let n = document.createElement('strong');
      n.textContent = w.number;
      let s = document.createElement('span');
      s.textContent = w.clue;
      let small = document.createElement('small');
      small.textContent = `${w.answer.length} букв`;
      s.append(small);
      b.append(n, s);
      b.onclick = () => {
        dbstate.word = w.id;
        dbstate.dir = w.dir;
        render();
        let k = w.cells.find(k => !dbstate.values[k]) || w.cells[0];
        document.querySelector(`[data-key="${k}"]`)?.focus();
      };
      list.append(b);
    });
  document.querySelectorAll('[data-dir]').forEach(b =>
    b.classList.toggle('active', b.dataset.dir === dbstate.dir));
}

function stats() {
  let keys = Object.keys(dbstate.values),
      filled = keys.filter(k => dbstate.values[k]).length,
      solved = dbstate.puzzle.words.filter(w => letters(w) === w.answer).length;
  $('progress').textContent = `${Math.round(filled / Math.max(keys.length, 1) * 100)}%`;
  $('score').textContent = solved * 100;
}

function renderPlayers() {
  let list = $('playerList');
  list.innerHTML = '';
  let players = dbstate.roomData?.players || {};
  if (dbstate.solo || !Object.keys(players).length) {
    list.innerHTML = `<div class="player"><span class="avatar">${dbstate.nick[0]?.toUpperCase() || 'И'}</span><span class="player-name">${dbstate.nick} · ты</span><b class="player-score">0 очк.</b></div>`;
    $('playersCount').textContent = '1';
    return;
  }
  let entries = Object.entries(players);
  $('playersCount').textContent = entries.length;
  entries
    .sort((a, b) => (b[1].score || 0) - (a[1].score || 0))
    .forEach(([uid, p]) => {
      let el = document.createElement('div');
      el.className = 'player';
      el.innerHTML = `<span class="avatar"></span><span class="player-name"></span><b class="player-score"></b>`;
      el.children[0].textContent = (p.nickname || '?')[0].toUpperCase();
      el.children[1].textContent = (p.nickname || 'Игрок') + (uid === dbstate.uid ? ' · ты' : '');
      el.children[2].textContent = `${p.score || 0} очк.`;
      list.append(el);
    });
}

async function syncAnswers() {
  if (dbstate.solo || !dbstate.ref) return;
  try {
    if (dbstate.mode === 'coop')
      await updateDoc(dbstate.ref, { answers: dbstate.values, updatedAt: serverTimestamp() });
    else
      await updateDoc(dbstate.ref, {
        [`playerAnswers.${dbstate.uid}`]: dbstate.values,
        updatedAt: serverTimestamp()
      });
  } catch (e) {
    console.warn(e);
  }
}

function attach() {
  dbstate.unsub?.();
  dbstate.unsub = onSnapshot(dbstate.ref, s => {
    if (!s.exists()) {
      toast('Комната закрыта.');
      leave();
      return;
    }
    let d = s.data();
    dbstate.roomData = d;
    if (d.puzzle && d.puzzleVersion !== dbstate.puzzleVersion) {
  dbstate.puzzleVersion = d.puzzleVersion;
  dbstate.puzzle = {
    ...unpackPuzzle(d.puzzle),
    version: d.puzzleVersion
  };
  dbstate.values = empty(dbstate.puzzle);
  dbstate.word = dbstate.puzzle.words[0]?.id;
}
    if (dbstate.mode === 'coop' && d.answers)
      dbstate.values = { ...empty(dbstate.puzzle), ...d.answers };
    if (dbstate.mode === 'competitive' && d.playerAnswers?.[dbstate.uid])
      dbstate.values = { ...empty(dbstate.puzzle), ...d.playerAnswers[dbstate.uid] };
    $('sync').textContent = 'Синхронизация активна';
    render();
  }, e => {
    console.error(e);
    toast('Ошибка синхронизации');
  });
}

async function init() {
  dbstate.app = app;
  dbstate.db = db;

  try {
    const cred = await authReady;
    dbstate.uid = cred.user.uid;

    $('connection').textContent = 'Firebase подключён';
  } catch (e) {
    $('connection').textContent = 'Ошибка Firebase Auth';
    console.error('Ошибка Firebase:', e);

    msg(
      'lobbyMsg',
      'Не удалось подключиться к Firebase. Проверь настройки Authentication.',
      true
    );
  }
}


async function create() {
  let name = nick();
  if (!dbstate.db) throw Error('Настрой Firebase для онлайн-игры. Одиночный режим уже доступен.');
  let set = settings(),
      p = generate(set.topic, set.difficulty),
      id = codegen(),
      ref = doc(dbstate.db, 'rooms', id);
  while ((await getDoc(ref)).exists()) {
    id = codegen();
    ref = doc(dbstate.db, 'rooms', id);
  }
  let m = mode();
  await setDoc(ref, {
    hostUid: dbstate.uid,
    hostName: name,
    players: {
      [dbstate.uid]: { nickname: name, score: 0, joinedAt: Date.now() }
    },
    mode: m,
    settings: set,
    puzzle: packPuzzle(p),
    answers: empty(p),
    playerAnswers: {},
    status: 'playing',
    puzzleVersion: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  sessionStorage.setItem('neon-game-nick', name);
  sessionStorage.setItem('neon-game-code', id);
  sessionStorage.setItem('neon-game-kind', 'room');
  sessionStorage.removeItem('neon-game-settings');
  location.href = 'game.html?room=' + encodeURIComponent(id);
  return;
}

async function join() {
  let name = nick(),
      id = $('code').value.trim().toUpperCase();
  if (!dbstate.db) throw Error('Настрой Firebase для онлайн-игры.');
  if (!/^[A-HJ-NP-Z2-9]{8}$/.test(id)) throw Error('Введи корректный 8-значный код.');
  let ref = doc(dbstate.db, 'rooms', id);
  await runTransaction(dbstate.db, async tx => {
    let s = await tx.get(ref);
    if (!s.exists()) throw Error('Комната не найдена. Проверь код.');
    let d = s.data(),
        players = { ...d.players };
    if (!players[dbstate.uid] && Object.keys(players).length >= 8)
      throw Error('В комнате уже 8 игроков.');
    players[dbstate.uid] = {
      nickname: name,
      score: players[dbstate.uid]?.score || 0,
      joinedAt: Date.now()
    };
    tx.update(ref, { players, updatedAt: serverTimestamp() });
  });
  let snap = await getDoc(ref),
      d = snap.data();
  dbstate.nick = name;
  dbstate.ref = ref;
  dbstate.roomData = d;
  dbstate.puzzleVersion = d.puzzleVersion || 1;
  const puzzle = unpackPuzzle(d.puzzle);

startPuzzle(puzzle, id, d.mode, false);
  if (d.mode === 'coop') {
  dbstate.values = { ...empty(puzzle), ...(d.answers || {}) };
} else {
  dbstate.values = {
    ...empty(puzzle),
    ...(d.playerAnswers?.[dbstate.uid] || {})
  };
}
  attach();
  render();
}

function check() {
  let solved = 0;
  dbstate.checked = new Set();
  dbstate.wrong = new Set();
  dbstate.puzzle.words.forEach(w => {
    let answer = letters(w);
    if (answer === w.answer) {
      solved++;
      w.cells.forEach(k => dbstate.checked.add(k));
    } else if (answer.length === w.answer.length && answer.trim()) {
      w.cells.forEach(k => dbstate.wrong.add(k));
    }
  });
  render();
  msg('gameMsg', solved === dbstate.puzzle.words.length
    ? `Победа! Все слова найдены. ${solved * 100} очков.`
    : `Найдено слов: ${solved} из ${dbstate.puzzle.words.length}.`);
  if (!dbstate.solo && dbstate.ref && dbstate.uid) {
    runTransaction(dbstate.db, async tx => {
      let snap = await tx.get(dbstate.ref);
      if (!snap.exists()) return;
      let data = snap.data(),
          players = { ...data.players };
      if (players[dbstate.uid])
        players[dbstate.uid] = { ...players[dbstate.uid], score: solved * 100 };
      tx.update(dbstate.ref, { players, updatedAt: serverTimestamp() });
    }).catch(console.warn);
  }
  if (solved === dbstate.puzzle.words.length) {
    toast('Кроссворд решён!');
    saveHistory();
  }
}

async function newPuzzle() {
  let set = dbstate.roomData?.settings || settings(),
      p = generate(set.topic, set.difficulty);
  if (dbstate.solo) {
    startPuzzle(p, null, 'solo', true);
    return;
  }
  if (dbstate.roomData?.hostUid !== dbstate.uid)
    throw Error('Новый кроссворд может создать только автор комнаты.');
  await updateDoc(dbstate.ref, {
    puzzle: packPuzzle(p),
    answers: empty(p),
    playerAnswers: {},
    puzzleVersion: (dbstate.roomData.puzzleVersion || 1) + 1,
    updatedAt: serverTimestamp()
  });
  toast('Новый кроссворд готов');
}

function reveal() {
  let w = currentWord();
  if (!w) return;
  let i = w.cells.findIndex(k => dbstate.values[k] !== w.answer[w.cells.indexOf(k)]);
  if (i < 0) {
    toast('Слово уже заполнено верно');
    return;
  }
  dbstate.values[w.cells[i]] = w.answer[i];
  render();
  syncAnswers();
}

function leave() {
  dbstate.unsub?.();
  dbstate.unsub = null;
  clearInterval(dbstate.timer);
  if (document.body.classList.contains('game-page')) {
    location.href = 'index.html';
    return;
  }
  dbstate.ref = null;
  dbstate.room = null;
  dbstate.roomData = null;
  $('game').classList.add('hidden');
  $('lobby').classList.remove('hidden');
}

const topicNames = {
  mixed: 'Микс тем',
  design: 'Дизайн и IT',
  nature: 'Природа',
  space: 'Космос',
  culture: 'Культура',
  food: 'Еда',
  music: 'Музыка'
};

const diffNames = { easy: 'Лёгкая', medium: 'Средняя', hard: 'Сложная' };

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem('neon-crossword-history') || '[]');
  } catch {
    return [];
  }
}

function saveHistory() {
  if (dbstate.historySaved || !dbstate.puzzle) return;
  dbstate.historySaved = true;
  let elapsed = dbstate.elapsed + Math.floor((Date.now() - dbstate.start) / 1000);
  if (dbstate.paused) elapsed = dbstate.elapsed;
  let item = {
    id: Date.now(),
    topic: (dbstate.roomData?.settings || settings()).topic,
    difficulty: (dbstate.roomData?.settings || settings()).difficulty,
    words: dbstate.puzzle.words.length,
    score: dbstate.puzzle.words.length * 100,
    seconds: elapsed,
    completedAt: new Date().toISOString(),
    mode: dbstate.solo
      ? 'Одиночная игра'
      : dbstate.mode === 'competitive'
        ? 'Соревнование'
        : 'Кооператив'
  };
  let history = readHistory();
  history.unshift(item);
  try {
    localStorage.setItem('neon-crossword-history', JSON.stringify(history.slice(0, 50)));
  } catch {}
  renderHistory();
}

function renderHistory() {
  let box = $('historyList');
  if (!box) return;
  let history = readHistory();
  box.innerHTML = '';
  if (!history.length) {
    box.innerHTML = '<p class="history-empty">Здесь появятся кроссворды, которые вы прошл полностью.</p>';
    return;
  }
  history.forEach(item => {
    let row = document.createElement('article');
    row.className = 'history-item';
    let title = document.createElement('strong');
    title.textContent = `${topicNames[item.topic] || 'Кроссворд'} · ${diffNames[item.difficulty] || ''}`;
    let meta = document.createElement('span');
    let date = new Date(item.completedAt);
    meta.textContent = `${date.toLocaleDateString('ru-RU')} · ${item.mode} · ${item.words} слов`;
    let score = document.createElement('b');
    score.textContent = `${Math.floor(item.seconds / 60).toString().padStart(2, '0')}:${(item.seconds % 60).toString().padStart(2, '0')} · ${item.score} очк.`;
    row.append(title, meta, score);
    box.append(row);
  });
}

function renderPreviews() {
  const topic = $('libraryTopic').value,
        diff = $('libraryDifficulty').value,
        grid = $('previewGrid');
  grid.innerHTML = '';
  let items = [];
  Object.keys(topicNames)
    .filter(t => topic === 'all' || t === topic)
    .forEach(t =>
      ['easy', 'medium', 'hard']
        .filter(d => diff === 'all' || d === diff)
        .forEach(d => {
          let pool = D[t] || D.mixed;
          let clue = pool[(d === 'easy' ? 1 : d === 'medium' ? 3 : 7) % pool.length][1];
          items.push({ topic: t, diff: d, clue, count: { easy: 6, medium: 9, hard: 12 }[d] });
        }));
  items.forEach((it, i) => {
    let card = document.createElement('button');
    card.className = 'preview-card';
    card.innerHTML = `<span class="preview-art art-${it.topic}"><b>0${i + 1}</b><i>✳</i></span><span class="preview-meta">${topicNames[it.topic]} · ${diffNames[it.diff]}</span><strong>${it.count} слов для разгадки</strong><span class="preview-clue"></span><span class="preview-cta">Выбрать кроссворд ↗</span>`;
    card.querySelector('.preview-clue').textContent = 'Пример вопроса: ' + it.clue;
    card.onclick = () => {
      selectedSettings = { topic: it.topic, difficulty: it.diff };
      document.querySelectorAll('.preview-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      $('selectedPuzzle').textContent = `Выбрано: ${topicNames[it.topic]} · ${diffNames[it.diff]} — ${it.count} слов. Пример вопроса: ${it.clue}`;
      $('lobbyMsg').textContent = '';
    };
    grid.append(card);
  });
}

$('libraryTopic').onchange = renderPreviews;
$('libraryDifficulty').onchange = renderPreviews;
renderPreviews();

const createModal = $('createModal');

function openCreateModal() {
  $('createTopic').value = selectedSettings?.topic || 'mixed';
  $('createDifficulty').value = selectedSettings?.difficulty || 'medium';
  $('createMsg').textContent = '';
  $('createMsg').classList.remove('error');

  createModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCreateModal() {
  createModal.classList.add('hidden');
  document.body.style.overflow = '';
}

// Верхняя кнопка открывает настройки новой комнаты.
if (createModal) {
  const confirmCreate = $('confirmCreate');

  $('openCreate').onclick = openCreateModal;

  $('closeCreate').onclick = closeCreateModal;
  $('cancelCreate').onclick = closeCreateModal;

  createModal.querySelector('[data-close-modal]').onclick = closeCreateModal;

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !createModal.classList.contains('hidden')) {
      closeCreateModal();
    }
  });

  confirmCreate.onclick = async () => {
    confirmCreate.disabled = true;
    confirmCreate.textContent = 'Создаём комнату…';

    try {
      selectedSettings = {
        topic: $('createTopic').value,
        difficulty: $('createDifficulty').value
      };

      await create();
    } catch (e) {
      msg('createMsg', e.message || 'Не удалось создать комнату.', true);
    } finally {
      confirmCreate.disabled = false;
      confirmCreate.textContent = 'Создать комнату →';
    }
  };
}

// Нижняя кнопка создаёт комнату по выбранной теме и сложности.
$('create').onclick = async () => {
  if (!selectedSettings) {
    msg('lobbyMsg', 'Сначала выбери кроссворд в каталоге.', true);
    $('puzzleLibrary').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const button = $('create');
  button.disabled = true;

  try {
    await create();
  } catch (e) {
    msg('lobbyMsg', e.message || 'Не удалось создать комнату.', true);
  } finally {
    button.disabled = false;
  }
};


$('join').onclick = async () => {
  const button = $('join');
  button.disabled = true;
  button.textContent = 'Подключение…';

  try {
    const name = nick();
    const id = $('code').value.trim().toUpperCase();

    if (!id) {
      throw Error('Введи код комнаты.');
    }

    if (!/^[A-HJ-NP-Z2-9]{8}$/.test(id)) {
      throw Error('Код должен содержать 8 допустимых символов.');
    }

    if (!dbstate.uid || !dbstate.db) {
      throw Error('Firebase ещё не подключён. Проверь настройки.');
    }

    sessionStorage.setItem('neon-game-nick', name);
    sessionStorage.setItem('neon-game-code', id);
    sessionStorage.setItem('neon-game-kind', 'room');

    location.href = 'game.html?room=' + encodeURIComponent(id);
  } catch (e) {
    msg('lobbyMsg', e.message || 'Не удалось подключиться.', true);
  } finally {
    button.disabled = false;
    button.textContent = 'Войти';
  }
};

$('solo').onclick = () => {
  try {
    if (!selectedSettings) throw Error('Сначала выбери конкретный кроссворд в каталоге.');
    const name = $('nickname').value.trim() || 'Игрок';
    sessionStorage.setItem('neon-game-nick', name);
    sessionStorage.setItem('neon-game-kind', 'solo');
    sessionStorage.setItem('neon-game-settings', JSON.stringify(selectedSettings));
    location.href = 'game.html?solo=1';
  } catch (e) {
    msg('lobbyMsg', e.message, true);
  }
};

$('check').onclick = check;
$('new').onclick = () => newPuzzle().catch(e => toast(e.message));
$('reveal').onclick = reveal;
$('leave').onclick = leave;

$('pause').onclick = () => {
  if (!dbstate.paused) {
    dbstate.elapsed += Math.floor((Date.now() - dbstate.start) / 1000);
    dbstate.paused = true;
    $('pause').textContent = 'Продолжить таймер ▶';
  } else {
    dbstate.start = Date.now();
    dbstate.paused = false;
    $('pause').textContent = 'Пауза таймера Ⅱ';
  }
};

$('copy').onclick = async () => {
  if (!dbstate.room) return toast('Это одиночная игра');
  try {
    await navigator.clipboard.writeText(dbstate.room);
    toast('Код скопирован');
  } catch {
    toast(`Код комнаты: ${dbstate.room}`);
  }
};

document.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => {
  dbstate.dir = b.dataset.dir;
  let w = dbstate.puzzle.words.find(w => w.dir === dbstate.dir);
  if (w) dbstate.word = w.id;
  render();
});

$('code').oninput = e => e.target.value = e.target.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, '');

document.addEventListener('visibilitychange', () => {
  if (document.hidden && !dbstate.paused) {
    dbstate.elapsed += Math.floor((Date.now() - dbstate.start) / 1000);
    dbstate.start = Date.now();
    dbstate.paused = true;
    $('pause').textContent = 'Продолжить таймер ▶';
  }
});

renderHistory();
await init();

if (document.body.classList.contains('game-page')) {
  const params = new URLSearchParams(location.search);
  const savedNick = sessionStorage.getItem('neon-game-nick') || 'Игрок';
  $('nickname').value = savedNick;
  const room = params.get('room') || sessionStorage.getItem('neon-game-code');
  if (room) {
    $('code').value = room;
    try {
      await join();
    } catch (e) {
      msg('gameMsg', e.message, true);
    }
  } else {
    try {
      selectedSettings = JSON.parse(sessionStorage.getItem('neon-game-settings') || '{"topic":"mixed","difficulty":"medium"}');
      dbstate.nick = savedNick;
      startPuzzle(generate(settings().topic, settings().difficulty), null, 'solo', true);
    } catch (e) {
      msg('gameMsg', e.message, true);
    }
  }
}