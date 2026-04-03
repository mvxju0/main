(function (window, document) {
  const app = window.MockApp;
  const data = window.MockData;

  function byId(id) { return document.getElementById(id); }

  function initFront() {
    app.bootstrap("HR/운영관리 대시보드");
    const approvals = app.getApprovals().filter((i) => i.status === "승인 대기").length;
    byId("front-root").innerHTML = `
      <div class="banner"><strong>${app.getRole()}님, 오늘도 안정적인 운영을 시작하세요.</strong><div class="muted" style="color:#e2e8f0">실개발 전 시연용 목업 화면입니다.</div></div>
      <div class="grid">
        <section class="card"><h3>총 직원 수</h3><div class="metric">${data.employees.length}</div><div class="muted">현장 + 사무실 포함</div></section>
        <section class="card"><h3>승인 대기 건수</h3><div class="metric">${approvals}</div><div class="muted">수정 요청 / 가입 요청</div></section>
        <section class="card"><h3>총 매장 수</h3><div class="metric">${data.stores.length}</div><div class="muted">현재 운영중 매장</div></section>
      </div>`;
  }

  function initEmployee() {
    app.bootstrap("직원관리");
    const canPrivate = app.canViewPrivate();
    let rows = [...data.employees];
    function render() {
      const q = byId("emp-search").value.trim();
      const role = byId("emp-role").value;
      const filtered = rows.filter((r) => (!q || r.name.includes(q) || r.store.includes(q)) && (!role || r.role === role));
      byId("emp-body").innerHTML = filtered.map((e, idx) => `
        <tr>
          <td>${e.name}</td><td>${e.role}</td><td>${e.store}</td><td>${e.upperManager}</td><td>${e.joinedAt}</td>
          <td>${canPrivate ? e.phone : app.mask(e.phone)} ${!canPrivate ? '<span class="badge lock">제한</span>' : ''}</td>
          <td>${app.statusBadge(e.status)}</td>
          <td><button class="ghost" data-detail="${idx}">상세</button><button class="primary" data-request="${idx}">수정 요청</button></td>
        </tr>`).join("");
    }
    byId("employee-root").innerHTML = `
      <div class="toolbar">
        <input id="emp-search" placeholder="이름/소속 검색" />
        <select id="emp-role"><option value="">전체 직급</option><option>점장</option><option>팀장</option><option>담당</option><option>SP2</option><option>SP1.5</option><option>SP1</option></select>
      </div>
      <div class="table-wrap"><table><thead><tr><th>이름</th><th>직급</th><th>소속</th><th>상위관리자</th><th>입사일</th><th>연락처</th><th>상태</th><th>액션</th></tr></thead><tbody id="emp-body"></tbody></table></div>
      <section class="card" style="margin-top:12px"><h3>직원 상세/히스토리</h3><div id="emp-detail" class="muted">직원을 선택해 주세요.</div></section>`;
    render();
    byId("emp-search").addEventListener("input", render);
    byId("emp-role").addEventListener("change", render);
    byId("employee-root").addEventListener("click", (ev) => {
      const detail = ev.target.getAttribute("data-detail");
      const req = ev.target.getAttribute("data-request");
      if (detail !== null) {
        const e = data.employees[detail];
        byId("emp-detail").innerHTML = `<div class="kv"><b>사번</b><span>${e.empNo}</span><b>이메일</b><span>${canPrivate ? e.email : app.mask(e.email)}</span><b>주소</b><span>${canPrivate ? e.address : '권한 필요'}</span></div>
          <h4>변경 히스토리</h4><ul>${e.history.map((h) => `<li>${h.date} · ${h.type} · ${h.before} → ${h.after} · 수정자 ${h.editor}</li>`).join("")}</ul>`;
      }
      if (req !== null) {
        const e = data.employees[req];
        app.addApproval({ type: "직원 수정 승인", target: `${e.name}(정보수정)`, requester: app.getRole(), status: "승인 대기", requestedAt: new Date().toISOString().slice(0,10) });
        alert("수정 요청이 등록되었습니다. 승인 허브에서 확인하세요.");
        location.href = "approval.html";
      }
    });
  }

  function initOrg() {
    app.bootstrap("조직관리");
    const teams = {};
    data.stores.forEach((s) => {
      if (!teams[s.director]) teams[s.director] = {};
      if (!teams[s.teamLead]) teams[s.director][s.teamLead] = [];
      teams[s.director][s.teamLead].push(s);
    });
    byId("org-root").innerHTML = `<div class="grid"><section class="card tree"><h3>현장 조직 구조</h3><div class="node">플래너 (SP)</div><ul>${Object.entries(teams).map(([d, leads]) => `<li><span class="node">담당: ${d}</span><ul>${Object.entries(leads).map(([lead, stores])=>`<li><span class="node">팀장: ${lead}</span><ul>${stores.map((s)=>`<li><span class="node">점장: ${s.manager} · ${s.code}</span></li>`).join('')}</ul></li>`).join('')}</ul></li>`).join('')}</ul></section>
    <section class="card"><h3>사무실 조직</h3><p>사무실은 승인/인사/운영지원 기능을 담당합니다.</p><ul>${[...new Set(data.stores.map((s)=>s.director))].map((n)=>`<li>${n}</li>`).join('')}</ul></section></div>`;
  }

  function initOnoff() {
    app.bootstrap("온오프관리");
    function render() {
      const d = byId("onoff-date").value || "2026-04-03";
      const st = byId("onoff-status").value;
      const list = data.onoff.filter((r) => (!st || r.status === st) && r.date === d);
      byId("onoff-body").innerHTML = list.map((r, idx) => `<tr><td>${r.name}</td><td>${r.on}</td><td>${r.off}</td><td>${app.statusBadge(r.status)}</td><td>${r.note}</td><td><button data-ex="${idx}">예외 처리</button></td></tr>`).join("");
      byId("onoff-history").innerHTML = list.slice(0, 8).map((r)=>`<li>${r.editedAt} · ${r.name} · 상태:${r.status} · 수정자:${app.getRole()}</li>`).join("");
    }
    byId("onoff-root").innerHTML = `<div class="toolbar"><input id="onoff-date" type="date" value="2026-04-03"/><select id="onoff-status"><option value="">전체 상태</option><option>ON</option><option>OFF</option><option>오픈지연</option><option>프리데이</option></select></div>
      <div class="table-wrap"><table><thead><tr><th>이름</th><th>ON</th><th>OFF</th><th>상태</th><th>비고</th><th>액션</th></tr></thead><tbody id="onoff-body"></tbody></table></div>
      <section class="card" style="margin-top:12px"><h3>수정 이력</h3><ul id="onoff-history"></ul></section>`;
    render();
    byId("onoff-date").addEventListener("change", render);
    byId("onoff-status").addEventListener("change", render);
    byId("onoff-root").addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-ex")) {
        alert("예외 처리 요청이 등록되었습니다. 담당 승인 후 반영됩니다.");
      }
    });
  }

  function initPos() {
    app.bootstrap("매장");
    byId("pos-root").innerHTML = `<div class="grid">${data.stores.map((s, idx) => `<section class="card"><h3>${s.code} <span class="muted">(${s.name})</span></h3>
      <p>${app.statusBadge(s.status)}</p><p>점장: <b>${s.manager}</b></p><p>팀장: ${s.teamLead} / 담당: ${s.director}</p>
      <p>매장 실적: <b>${s.performance}</b>점</p><p>매장 인원 수: <b>${s.headCount}</b>명</p>
      <button class="primary" data-pos="${idx}">수정 요청</button></section>`).join('')}</div>`;
    byId("pos-root").addEventListener("click", (e) => {
      const idx = e.target.getAttribute("data-pos");
      if (idx !== null) {
        const s = data.stores[idx];
        app.addApproval({ type: "매장 수정 승인", target: `${s.code}(정보수정)`, requester: app.getRole(), status: "승인 대기", requestedAt: new Date().toISOString().slice(0,10) });
        alert("매장 수정 요청이 승인 허브로 전달되었습니다.");
      }
    });
  }

  function initOffice() {
    app.bootstrap("사무실");
    byId("office-root").innerHTML = `<div class="grid"><section class="card"><h3>사무실 인력</h3><ul>${data.officeTasks.map((t)=>`<li>${t.owner} · ${t.team}</li>`).join('')}</ul></section>
      <section class="card"><h3>업무 분장</h3>${data.officeTasks.map((t)=>`<p><b>${t.team}</b> : ${t.task}</p>`).join('')}</section>
      <section class="card"><h3>작업 목록 / 상태</h3><div class="table-wrap"><table><thead><tr><th>팀</th><th>담당자</th><th>작업</th><th>상태</th></tr></thead><tbody>${data.officeTasks.map((t)=>`<tr><td>${t.team}</td><td>${t.owner}</td><td>${t.task}</td><td>${t.status}</td></tr>`).join('')}</tbody></table></div></section></div>`;
  }

  function initApproval() {
    app.bootstrap("가입/승인");
    let items = app.getApprovals();
    let tab = "가입 승인";
    function render() {
      const view = items.filter((i)=>i.type===tab);
      byId("approval-body").innerHTML = view.map((it, idx)=>`<tr><td>${it.type}</td><td>${it.target}</td><td>${it.requester}</td><td>${it.requestedAt}</td><td>${app.statusBadge(it.status)}</td><td><button data-ok="${idx}" class="primary">승인</button><button data-no="${idx}">반려</button></td></tr>`).join('');
    }
    byId("approval-root").innerHTML = `<div class="toolbar"><button class="tab primary" data-tab="가입 승인">가입 승인</button><button class="tab" data-tab="직원 수정 승인">직원 수정 승인</button><button class="tab" data-tab="매장 수정 승인">매장 수정 승인</button></div>
    <div class="table-wrap"><table><thead><tr><th>구분</th><th>대상</th><th>요청자</th><th>요청일</th><th>상태</th><th>처리</th></tr></thead><tbody id="approval-body"></tbody></table></div>`;
    render();
    byId("approval-root").addEventListener("click", (e) => {
      const t = e.target.getAttribute("data-tab");
      if (t) {
        tab = t;
        document.querySelectorAll('.tab').forEach((b)=>b.classList.remove('primary'));
        e.target.classList.add('primary');
        render();
      }
      const ok = e.target.getAttribute("data-ok");
      const no = e.target.getAttribute("data-no");
      if (ok !== null || no !== null) {
        const view = items.filter((i)=>i.type===tab);
        const target = view[ok ?? no];
        if (!target) return;
        target.status = ok !== null ? "승인" : "반려";
        app.setApprovals(items);
        render();
      }
    });
  }

  window.PageInit = { initFront, initEmployee, initOrg, initOnoff, initPos, initOffice, initApproval };
})(window, document);
