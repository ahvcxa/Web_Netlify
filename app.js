// LocalStorage key for persisting vocabulary entries
const STORAGE_KEY = "wordbook_entries_v1";

// Starter sample entries shown when LocalStorage is empty
const DEFAULT_WORDS = [
  {
    id: 1,
    english: "consistent",
    turkish: "tutarlı",
    example: "Daily practice keeps your progress consistent.",
    category: "Akademik",
    learned: true,
  },
  {
    id: 2,
    english: "deploy",
    turkish: "yayına almak",
    example: "We will deploy the web app to Netlify today.",
    category: "Yazılım",
    learned: false,
  },
  {
    id: 3,
    english: "curious",
    turkish: "meraklı",
    example: "A curious student asks great questions.",
    category: "Günlük",
    learned: false,
  },
  {
    id: 4,
    english: "deadline",
    turkish: "son teslim tarihi",
    example: "The project deadline is next Monday.",
    category: "İş",
    learned: true,
  },
];

let words = loadWords();

const wordForm = document.getElementById("wordForm");
const englishInput = document.getElementById("englishInput");
const turkishInput = document.getElementById("turkishInput");
const exampleInput = document.getElementById("exampleInput");
const categoryInput = document.getElementById("categoryInput");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const wordTableBody = document.getElementById("wordTableBody");
const emptyState = document.getElementById("emptyState");
const totalCount = document.getElementById("totalCount");
const learnedCount = document.getElementById("learnedCount");
const pendingCount = document.getElementById("pendingCount");

/**
 * Load saved words from LocalStorage or initialize with default starter words.
 */
function loadWords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WORDS));
    return [...DEFAULT_WORDS];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [...DEFAULT_WORDS];
  }
}

/**
 * Save current word list to LocalStorage.
 */
function saveWords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

/**
 * Update summary counters in the top cards.
 */
function updateStats() {
  const learned = words.filter((item) => item.learned).length;
  totalCount.textContent = words.length;
  learnedCount.textContent = learned;
  pendingCount.textContent = words.length - learned;
}

/**
 * Render filtered word rows into the table.
 */
function renderWords() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;

  const filtered = words.filter((item) => {
    const matchesSearch =
      item.english.toLowerCase().includes(query) ||
      item.turkish.toLowerCase().includes(query);

    if (filter === "learned") return matchesSearch && item.learned;
    if (filter === "pending") return matchesSearch && !item.learned;
    return matchesSearch;
  });

  wordTableBody.innerHTML = "";
  emptyState.classList.toggle("d-none", filtered.length > 0);

  filtered.forEach((item) => {
    const row = document.createElement("tr");

    const wordCell = document.createElement("td");
    wordCell.className = item.learned ? "fw-semibold word-learned" : "fw-semibold";
    wordCell.textContent = item.english;

    const meaningCell = document.createElement("td");
    const meaningText = document.createElement("div");
    meaningText.textContent = item.turkish;
    meaningCell.appendChild(meaningText);
    if (item.example) {
      const exampleText = document.createElement("small");
      exampleText.className = "text-muted";
      exampleText.textContent = item.example;
      meaningCell.appendChild(exampleText);
    }

    const categoryCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge text-bg-secondary";
    badge.textContent = item.category;
    categoryCell.appendChild(badge);

    const actionCell = document.createElement("td");
    actionCell.className = "text-end text-nowrap";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = item.learned
      ? "btn btn-sm btn-outline-secondary me-1"
      : "btn btn-sm btn-outline-success me-1";
    toggleBtn.textContent = item.learned ? "Tekrar Et" : "Öğrenildi";
    toggleBtn.addEventListener("click", () => toggleLearned(item.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-sm btn-outline-danger";
    deleteBtn.textContent = "Sil";
    deleteBtn.addEventListener("click", () => deleteWord(item.id));

    actionCell.append(toggleBtn, deleteBtn);
    row.append(wordCell, meaningCell, categoryCell, actionCell);
    wordTableBody.appendChild(row);
  });

  updateStats();
}

function addWord(event) {
  event.preventDefault();
  const english = englishInput.value.trim();
  const turkish = turkishInput.value.trim();
  const example = exampleInput.value.trim();
  const category = categoryInput.value;

  if (!english || !turkish) return;

  words.unshift({
    id: Date.now(),
    english,
    turkish,
    example,
    category,
    learned: false,
  });

  saveWords();
  renderWords();
  wordForm.reset();
}

function toggleLearned(id) {
  words = words.map((item) =>
    item.id === id ? { ...item, learned: !item.learned } : item
  );
  saveWords();
  renderWords();
}

function deleteWord(id) {
  words = words.filter((item) => item.id !== id);
  saveWords();
  renderWords();
}

wordForm.addEventListener("submit", addWord);
searchInput.addEventListener("input", renderWords);
filterSelect.addEventListener("change", renderWords);

renderWords();
