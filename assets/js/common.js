(function (window, document) {
  const navItems = [
    ["front.html", "대시보드"],
    ["employee.html", "직원"],
    ["org.html", "조직"],
    ["onoff.html", "온오프"],
    ["pos.html", "매장"],
    ["office.html", "사무실"],
    ["approval.html", "승인"]
  ];

  function todayKR() {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  }

  function getRole() {
    return localStorage.getItem("mock_role") || "플래너";
  }

  function ensureAuth() {
    if (!location.pathname.endsWith("index.html") && !localStorage.getItem("mock_role")) {
      location.href = "index.html";
    }
  }

  function header(title) {
    const role = getRole();
    return `<header class="top-header"><div><div class="title">${title}</div><div class="sub">${todayKR()} · 권한: ${role}</div></div><button id="logoutBtn">로그아웃</button></header>`;
  }

  function nav() {
    const current = location.pathname.split("/").pop();
    return `<nav class="bottom-nav">${navItems
      .map(([href, label]) => `<a class="${current === href ? "active" : ""}" href="${href}">${label}</a>`)
      .join("")}</nav>`;
  }

  function bootstrap(title) {
    ensureAuth();
    document.body.insertAdjacentHTML("afterbegin", header(title));
    document.body.insertAdjacentHTML("beforeend", nav());
    const btn = document.querySelector("#logoutBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        localStorage.removeItem("mock_role");
        location.href = "index.html";
      });
    }
  }

  function canViewPrivate() {
    const role = getRole();
    return role === "팀장" || role === "담당";
  }

  function mask(str) {
    if (!str) return "-";
    if (str.includes("@")) {
      const [id, domain] = str.split("@");
      return `${id.slice(0, 2)}***@${domain}`;
    }
    return str.replace(/\d(?=\d{2})/g, "*");
  }

  function getApprovals() {
    const raw = localStorage.getItem("mock_approvals");
    if (raw) return JSON.parse(raw);
    localStorage.setItem("mock_approvals", JSON.stringify(window.MockData.approvalsSeed));
    return [...window.MockData.approvalsSeed];
  }

  function setApprovals(items) {
    localStorage.setItem("mock_approvals", JSON.stringify(items));
  }

  function addApproval(item) {
    const items = getApprovals();
    items.unshift(item);
    setApprovals(items);
  }

  function statusBadge(status) {
    const map = { ON: "on", OFF: "off", 오픈지연: "delay", 프리데이: "free", "승인 대기": "pending" };
    const cls = map[status] || "off";
    return `<span class="badge ${cls}">${status}</span>`;
  }

  window.MockApp = {
    bootstrap,
    getRole,
    canViewPrivate,
    mask,
    addApproval,
    getApprovals,
    setApprovals,
    statusBadge,
    todayKR
  };
})(window, document);
