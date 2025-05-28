let selectedCharacter = null;
let level = 1;
let xp = 0;
let hp = 100;
let maxHp = 100;
let guarding = false;
let playerTurn = true;
let stage = 'intro';
let enemyLevel = 1;
let enemyHP = 100;
let inventory = { senzu: 1, pie: 2, drink: 5 };
let bossAttempted = false;
let gameOver = false;

// Special moves unlock levels
const specialMoves = {
  Warrior: ['Heavy Slash', 'Dizzy Fist', 'Dragon Hammer', 'Headbutt'],
  Mage: ['Fire', 'Blizzard', 'Thunder', 'Wind'],
  Rogue: ['Steal'],
  Legend: ['Kamehameha', 'Dragon Fist', 'Spirit Bomb', 'Kaioken']
};

const specialUnlockLevels = {
  Warrior: [10, 18, 28, 39],
  Mage: [10, 18, 28, 39],
  Rogue: [10],
  Legend: [10, 20, 30, 40]
};

function selectCharacter(name) {
  selectedCharacter = name;
  document.getElementById('start-btn').classList.remove('hidden');

  // Apply background image for the selected character
  document.getElementById('animation-box').className = ''; // Reset previous class
  if (name === 'Mage') {
    document.getElementById('animation-box').classList.add('mage-bg');
  } else if (name === 'Warrior') {
    document.getElementById('animation-box').classList.add('warrior-bg');
  } else if (name === 'Rogue') {
    document.getElementById('animation-box').classList.add('rogue-bg');
  } else if (name === 'Legend') {
    document.getElementById('animation-box').classList.add('goku-bg');
  }
}

function startGame() {
  document.getElementById('character-selection').classList.add('hidden');
  document.getElementById('gameplay').classList.remove('hidden');
  document.getElementById('fight-boss-btn').classList.remove('hidden');
  updateGameText();
  renderMoveset();
}

function renderMoveset() {
  const container = document.getElementById('move-buttons');
  container.innerHTML = '';

  const actions = ['Attack', 'Special', 'Item', 'Guard'];
  actions.forEach(action => {
    const btn = document.createElement('button');
    btn.textContent = action;
    btn.onclick = () => handleAction(action);
    container.appendChild(btn);
  });
}

function handleAction(action) {
  if (!playerTurn) return;

  if (action === 'Special') {
    showSpecialMoves();
  } else if (action === 'Item') {
    showItems();
  } else {
    performMove(action);
  }
}

function showSpecialMoves() {
  const container = document.getElementById('move-buttons');
  container.innerHTML = '';

  const allMoves = specialMoves[selectedCharacter] || [];
  const unlocks = specialUnlockLevels[selectedCharacter] || [];
  let unlocked = allMoves.filter((_, i) => level >= unlocks[i]);

  unlocked.forEach(move => {
    const btn = document.createElement('button');
    btn.textContent = move;
    btn.onclick = () => performMove(move);
    container.appendChild(btn);
  });

  const back = document.createElement('button');
  back.textContent = 'Back';
  back.onclick = renderMoveset;
  container.appendChild(back);
}

function showItems() {
  const container = document.getElementById('move-buttons');
  container.innerHTML = '';

  Object.keys(inventory).forEach(item => {
    const btn = document.createElement('button');
    btn.textContent = `${item} (${inventory[item]})`;
    btn.onclick = () => useItem(item);
    container.appendChild(btn);
  });

  const back = document.createElement('button');
  back.textContent = 'Back';
  back.onclick = renderMoveset;
  container.appendChild(back);
}

function useItem(item) {
  if (inventory[item] > 0) {
    inventory[item]--;
    if (item === 'senzu') hp = maxHp;
    if (item === 'pie') hp = Math.min(maxHp, hp + Math.floor(maxHp * 0.5));
    if (item === 'drink') hp = Math.min(maxHp, hp + Math.floor(maxHp * 0.3));
    document.getElementById('animation-box').textContent = `Used ${item}, healed!`;
  } else {
    document.getElementById('animation-box').textContent = `No ${item} left!`;
  }
  endPlayerTurn();
}

function performMove(move) {
  guarding = false;

  // Change background based on action
  if (move === 'Attack') {
    document.getElementById('animation-box').classList.add('warrior-bg');
    enemyHP -= 15;
    document.getElementById('animation-box').textContent = `${selectedCharacter} attacks!`;
  } else if (move === 'Guard') {
    guarding = true;
    document.getElementById('animation-box').classList.add('rogue-bg');
    document.getElementById('animation-box').textContent = `${selectedCharacter} is guarding!`;
  } else {
    // Special Moves
    document.getElementById('animation-box').classList.add('mage-bg');
    enemyHP -= 25;
    document.getElementById('animation-box').textContent = `${selectedCharacter} used ${move}!`;
  }

  endPlayerTurn();
}

function endPlayerTurn() {
  updateGameText();
  playerTurn = false;
  setTimeout(enemyAttack, 1500);
}

function enemyAttack() {
  if (enemyHP <= 0) {
    winBattle();
    return;
  }

  let damage = Math.floor(Math.random() * 15) + 5;
  if (guarding) damage = Math.floor(damage / 2);

  hp -= damage;
  if (hp < 0) hp = 0;

  document.getElementById('animation-box').textContent = `Enemy attacks! You take ${damage} damage!`;
  updateGameText();

  if (hp <= 0) {
    loseBattle();
  } else {
    playerTurn = true;
    renderMoveset();
  }
}

function winBattle() {
  enemyLevel++;
  enemyHP = 100 + (enemyLevel - 1) * 10;
  gainXP(20);
  document.getElementById('animation-box').textContent = `Enemy defeated! New enemy appears.`;
  playerTurn = true;
  renderMoveset();
  updateGameText();
}

function loseBattle() {
  document.getElementById('gameplay').classList.add('hidden');
  document.getElementById('end-screen').classList.remove('hidden');
  document.getElementById('end-message').textContent = "GAME OVER!";
}

function fightFinalBoss() {
  if (level < 50) {
    document.getElementById('game-text').innerText = "Frieza: You are too weak for me!";
    setTimeout(() => {
      document.getElementById('game-text').innerText += "\nFrieza: You're dead";
      setTimeout(() => loseBattle(), 2000);
    }, 2000);
  } else {
    stage = 'finalBattle';
    enemyHP = 1000;
    document.getElementById('game-text').innerText = "Final Boss Battle: Frieza!";
    document.getElementById('animation-box').classList.add('fieza-bg');
    updateGameText();
  }
}

function gainXP(amount) {
  xp += amount;
  if (xp >= level * 20) {
    xp = 0;
    level++;
    maxHp += 10;
    hp = maxHp;
  }
}

function updateGameText() {
  document.getElementById('game-text').innerText = 
    `Character: ${selectedCharacter}\nHP: ${hp}/${maxHp}\nLevel: ${level}\nEnemy HP: ${enemyHP}`;
}

function restartGame() {
  selectedCharacter = null;
  level = 1;
  xp = 0;
  hp = 100;
  maxHp = 100;
  guarding = false;
  playerTurn = true;
  stage = 'intro';
  enemyLevel = 1;
  enemyHP = 100;
  inventory = { senzu: 1, pie: 2, drink: 5 };
  bossAttempted = false;
  gameOver = false;

  document.getElementById('character-selection').classList.remove('hidden');
  document.getElementById('gameplay').classList.add('hidden');
  document.getElementById('end-screen').classList.add('hidden');
  document.getElementById('legend-btn').classList.add('hidden');
  document.getElementById('start-btn').classList.add('hidden');
  document.getElementById('move-buttons').innerHTML = '';
  document.getElementById('animation-box').innerHTML = '';
  document.getElementById('fight-boss-btn').classList.add('hidden');
}
