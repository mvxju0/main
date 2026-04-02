// 더블 오어 스탑 - 핵심 상수
const TOTAL_COIN_KEY = "dos_total_coin";
const STATS_KEY = "dos_stats_v1";
const LOG_KEY = "dos_logs_v1";

const INITIAL_TOTAL_COIN = 100;
const ENTRY_FEE = 10;
const BASE_REWARD = 10;
const MAX_LOG_COUNT = 5;

// DOM 참조
const totalCoinEl = document.getElementById("totalCoin");
const roundCoinEl = document.getElementById("roundCoin");
const roundCountEl = document.getElementById("roundCount");
const statusBoxEl = document.getElementById("statusBox");
const coinWarningEl = document.getElementById("coinWarning");

const startBtn = document.getElementById("startBtn");
const doubleBtn = document.getElementById("doubleBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

const resultCardEl = document.getElementById("resultCard");
const resultTitleEl = document.getElementById("resultTitle");
const resultSubEl = document.getElementById("resultSub");

const logListEl = document.getElementById("logList");
const statPlaysEl = document.getElementById("statPlays");
const statSuccessEl = document.getElementById("statSuccess");
const statFailEl = document.getElementById("statFail");
const statBestEl = document.getElementById("statBest");

// 상태값
let totalCoin = loadTotalCoin();
let stats = loadStats();
let logs = loadLogs();

let isPlaying = false;
let isResolving = false;
let roundCoin = 0;
let roundCount = 0;
let peakRoundCoin = 0;

function loadTotalCoin() {
  const stored = Number(localStorage.getItem(TOTAL_COIN_KEY));
  if (Number.isNaN(stored)) {
    localStorage.setItem(TOTAL_COIN_KEY, String(INITIAL_TOTAL_COIN));
    return INITIAL_TOTAL_COIN;
  }
  return stored;
}

function saveTotalCoin() {
  localStorage.setItem(TOTAL_COIN_KEY, String(totalCoin));
}

function loadStats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STATS_KEY));
    if (!parsed) throw new Error("empty");
    return {
      plays: Number(parsed.plays) || 0,
      successDoubles: Number(parsed.successDoubles) || 0,
      failedDoubles: Number(parsed.failedDoubles) || 0,
      bestCoin: Number(parsed.bestCoin) || 0,
    };
  } catch {
    return { plays: 0, successDoubles: 0, failedDoubles: 0, bestCoin: 0 };
  }
}

function saveStats() {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function loadLogs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOG_KEY));
    if (!Array.isArray(parsed)) throw new Error("invalid");
    return parsed.slice(0, MAX_LOG_COUNT);
  } catch {
    return [];
  }
}

function saveLogs() {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOG_COUNT)));
}

function addLog(message) {
  logs.unshift(message);
  logs = logs.slice(0, MAX_LOG_COUNT);
  saveLogs();
  renderLogs();
}

function animateValue(el) {
  el.classList.remove("pop");
  // reflow로 애니메이션 재실행
  void el.offsetWidth;
  el.classList.add("pop");
}

function setStatus(message) {
  statusBoxEl.textContent = message;
}

function setResultView(type, title, subText) {
  resultCardEl.classList.remove("revealing", "success", "fail");
  if (type) resultCardEl.classList.add(type);
  resultTitleEl.textContent = title;
  resultSubEl.textContent = subText;
}

function updateBestCoin(candidate) {
  if (candidate > stats.bestCoin) {
    stats.bestCoin = candidate;
    saveStats();
  }
}

function renderStats() {
  statPlaysEl.textContent = String(stats.plays);
  statSuccessEl.textContent = String(stats.successDoubles);
  statFailEl.textContent = String(stats.failedDoubles);
  statBestEl.textContent = String(stats.bestCoin);
}

function renderLogs() {
  logListEl.innerHTML = "";

  if (logs.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "아직 로그가 없어. 첫 판을 시작해봐!";
    logListEl.appendChild(emptyItem);
    return;
  }

  logs.forEach((log) => {
    const li = document.createElement("li");
    li.textContent = log;
    logListEl.appendChild(li);
  });
}

function updateButtons() {
  const notEnoughCoin = totalCoin < ENTRY_FEE;
  startBtn.disabled = isPlaying || isResolving || notEnoughCoin;
  doubleBtn.disabled = !isPlaying || isResolving;
  stopBtn.disabled = !isPlaying || isResolving;

  coinWarningEl.textContent = notEnoughCoin
    ? "코인이 부족합니다"
    : "";
}

function renderGameState() {
  totalCoinEl.textContent = String(totalCoin);
  roundCoinEl.textContent = String(roundCoin);
  roundCountEl.textContent = String(roundCount);

  animateValue(totalCoinEl);
  animateValue(roundCoinEl);

  updateButtons();
  renderStats();
}

function endRound() {
  isPlaying = false;
  isResolving = false;
  roundCoin = 0;
  roundCount = 0;
  peakRoundCoin = 0;
  saveTotalCoin();
  renderGameState();
}

function startGame() {
  if (startBtn.disabled) return;

  totalCoin -= ENTRY_FEE;
  roundCoin = BASE_REWARD;
  roundCount = 0;
  peakRoundCoin = roundCoin;
  isPlaying = true;
  isResolving = false;

  stats.plays += 1;
  saveStats();
  saveTotalCoin();

  setStatus("기본 보상 10코인을 획득했어");
  setResultView(null, "ROUND START", "더블 또는 스탑을 선택해");

  addLog("게임 시작 - 입장 비용 10코인 차감");
  addLog("기본 보상 10코인 지급");

  renderGameState();
}

function stopGame() {
  if (stopBtn.disabled) return;

  totalCoin += roundCoin;
  updateBestCoin(peakRoundCoin);
  addLog(`스탑 선택: ${roundCoin}코인 확정`);

  setStatus("스탑! 코인을 확정했어");
  setResultView("success", "STOP CONFIRMED", `${roundCoin}코인을 보유 코인에 합산했어`);

  endRound();
}

function resolveDouble() {
  if (doubleBtn.disabled) return;

  isResolving = true;
  updateButtons();

  setStatus("결과 확인 중...");
  setResultView("revealing", "결과 확인 중...", "카드를 뒤집는 중이야");

  const beforeCoin = roundCoin;
  const beforeRound = roundCount;
  const delay = 1000 + Math.floor(Math.random() * 501); // 1.0~1.5초

  window.setTimeout(() => {
    const isSuccess = Math.random() < 0.5; // 정확히 50% 확률

    if (isSuccess) {
      roundCount += 1;
      roundCoin *= 2;
      peakRoundCoin = Math.max(peakRoundCoin, roundCoin);
      stats.successDoubles += 1;
      saveStats();

      addLog(`${roundCount}라운드 더블 성공: ${beforeCoin} → ${roundCoin}`);
      setStatus("더블 성공! 계속 갈 수 있어");
      setResultView("success", "DOUBLE SUCCESS", `${beforeCoin} → ${roundCoin}`);

      isResolving = false;
      saveTotalCoin();
      renderGameState();
      return;
    }

    stats.failedDoubles += 1;
    saveStats();

    updateBestCoin(peakRoundCoin);
    addLog(`${beforeRound + 1}라운드 더블 실패: ${beforeCoin} → 0`);
    setStatus("실패! 이번 판 코인을 모두 잃었어");
    setResultView("fail", "FAILED", "BURST! 이번 판 누적 코인이 0이 됐어");

    endRound();
  }, delay);
}

function resetCoinsAndData() {
  localStorage.removeItem(TOTAL_COIN_KEY);
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(LOG_KEY);

  totalCoin = INITIAL_TOTAL_COIN;
  stats = { plays: 0, successDoubles: 0, failedDoubles: 0, bestCoin: 0 };
  logs = [];

  isPlaying = false;
  isResolving = false;
  roundCoin = 0;
  roundCount = 0;
  peakRoundCoin = 0;

  saveTotalCoin();
  saveStats();
  saveLogs();

  setStatus("게임을 시작해봐");
  setResultView(null, "RESET DONE", "코인과 통계를 초기화했어");
  addLog("코인 초기화 - 기본 코인 100으로 재설정");

  renderGameState();
}

function handleKeyboard(event) {
  const key = event.key.toLowerCase();

  if (key === "enter" && !startBtn.disabled) {
    startGame();
  } else if (key === "d" && !doubleBtn.disabled) {
    resolveDouble();
  } else if (key === "s" && !stopBtn.disabled) {
    stopGame();
  }
}

function initialize() {
  setStatus("게임을 시작해봐");
  setResultView(null, "READY", "더블 버튼으로 도전을 시작해봐");

  renderLogs();
  renderGameState();

  startBtn.addEventListener("click", startGame);
  doubleBtn.addEventListener("click", resolveDouble);
  stopBtn.addEventListener("click", stopGame);
  resetBtn.addEventListener("click", resetCoinsAndData);
  window.addEventListener("keydown", handleKeyboard);
}

initialize();
