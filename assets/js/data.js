(function (window) {
  const STORE_BASE = [
    ["가홈", "가경동_삼거리점", "운영중", "이승헌", "박근우"],
    ["강서", "가경동_하나병원점", "운영중", "이승헌", "박근우"],
    ["가터", "가경동_터미널점", "운영중", "이승헌", "박근우"],
    ["가아", "가경동_아이파크점", "운영중", "이승헌", "박근우"],
    ["율칸", "주성동_대원칸타빌점", "운영중", "정연우", "박근우"],
    ["율롯", "율량동_롯데슈퍼점", "운영중", "정연우", "박근우"],
    ["사창", "사창동_국민은행점", "운영중", "정연우", "박근우"],
    ["두진", "사창동_두진하트리움점", "운영중", "정연우", "박근우"],
    ["중흥", "용암동_중흥마을점", "운영중", "정연우", "박근우"],
    ["시장", "사창동_사창시장점", "운영중", "정연우", "박근우"],
    ["복대", "복대동_복대시장점", "운영중", "원준기", "박근우"],
    ["강터", "강서동_터미널점", "운영중", "원준기", "박근우"],
    ["청대", "우암동_청대점", "운영중", "원준기", "박근우"],
    ["송절", "송절동_테크노폴리스점", "운영중", "원준기", "박근우"],
    ["비하", "비하동_자이아파트점", "운영중", "원준기", "박근우"],
    ["가경", "가경동_롯데마트점", "운영중", "원준기", "박근우"],
    ["금광", "금천동_금천광장점", "운영중", "김민석", "박근우"],
    ["용암", "용암동_농협사거리점", "운영중", "김민석", "박근우"],
    ["산남", "산남동_우리은행점", "운영중", "김민석", "박근우"],
    ["동남", "용암동_동남신협점", "운영중", "김민석", "박근우"],
    ["분평", "분평동_주민센터점", "운영중", "김민석", "박근우"],
    ["우암", "우암동_사거리점", "운영중", "이명건", "박근우"],
    ["용롯", "용암동_롯데마트점", "운영중", "이명건", "박근우"],
    ["금천", "금천동_국민은행점", "운영중", "담당직속", "박근우"],
    ["지웰", "복대동_지웰시티몰점", "운영중", "담당직속", "박근우"],
    ["충주", "칠금동_충주터미널점", "운영중", "조다해", "유종호"],
    ["연수", "연수동_유원아파트점", "운영중", "조다해", "유종호"],
    ["용산", "용산동_충주여고점", "운영중", "조다해", "유종호"],
    ["호암", "호암동_풍경채점", "운영중", "조다해", "유종호"],
    ["증평", "증평읍_증평우체국점", "운영중", "고준", "유종호"],
    ["만수", "오송읍_만수리점", "운영중", "고준", "유종호"]
  ];

  const MANAGERS = {
    가홈: "김민성", 강서: "이선재", 가터: "전다영", 가아: "강민호", 율칸: "김수만", 율롯: "강석주", 사창: "차명호", 두진: "조민제", 중흥: "윤종우", 시장: "김시원", 복대: "정미정", 강터: "유현우", 청대: "최준희", 송절: "홍인기", 비하: "유지연", 가경: "정인태", 금광: "김사랑", 용암: "김민서", 산남: "김민지", 동남: "이승효", 분평: "김재환", 우암: "김성호", 용롯: "이가은", 금천: "김택민", 지웰: "김지하", 충주: "정희찬", 연수: "김요한", 용산: "이정혁", 호암: "권지수", 증평: "최혁준", 만수: "임민우"
  };

  const SP_GRADES = ["SP2", "SP1.5", "SP1"];

  function hashNum(seed) {
    return seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  }

  function pad(num, len) {
    return String(num).padStart(len, "0");
  }

  function makeStores() {
    return STORE_BASE.map((row, idx) => {
      const [code, name, status, teamLead, director] = row;
      const seed = hashNum(code + name);
      return {
        id: `S${pad(idx + 1, 3)}`,
        code,
        name,
        status,
        teamLead,
        director,
        manager: MANAGERS[code],
        performance: 78 + (seed % 20),
        headCount: 4 + (seed % 5)
      };
    });
  }

  function makeProfile(name, idx, role, store, upperManager) {
    const month = (idx % 12) + 1;
    const day = (idx % 27) + 1;
    return {
      empNo: `E${new Date().getFullYear() - 4}${pad(idx + 1, 4)}`,
      name,
      role,
      store,
      upperManager,
      phone: `010-${pad(1200 + idx * 7, 4)}-${pad(2300 + idx * 13, 4)}`,
      email: `${name.replace(/\s/g, "").toLowerCase()}@mockhr.co.kr`,
      joinedAt: `${2020 + (idx % 5)}-${pad(month, 2)}-${pad(day, 2)}`,
      address: `충북 청주시 mock로 ${10 + idx}길 ${idx % 25 + 1}`,
      status: idx % 14 === 0 ? "승인 대기" : "활성"
    };
  }

  function makeHistory(person, idx) {
    return [
      { type: "매장이동", editor: "박근우", before: "가홈", after: person.store, date: `2025-0${(idx % 8) + 1}-12` },
      { type: "소속변경", editor: "유종호", before: "현장조직", after: "현장조직", date: `2025-1${idx % 2}-04` },
      { type: "직급변경", editor: "정연우", before: "SP1", after: person.role.includes("SP") ? person.role : "점장", date: `2026-02-${pad((idx % 25) + 1, 2)}` }
    ];
  }

  function makeEmployees(stores) {
    const members = [];
    stores.forEach((store, idx) => {
      const manager = makeProfile(store.manager, idx, "점장", store.code, store.teamLead);
      manager.history = makeHistory(manager, idx);
      members.push(manager);

      const spCount = 2 + (idx % 2);
      for (let i = 0; i < spCount; i++) {
        const n = idx * 3 + i;
        const spName = `${store.code}SP${i + 1}`;
        const grade = SP_GRADES[n % SP_GRADES.length];
        const sp = makeProfile(spName, 100 + n, grade, store.code, store.manager);
        sp.history = makeHistory(sp, 100 + n);
        members.push(sp);
      }
    });

    const officeNames = ["박근우", "유종호", "정연우", "원준기", "김민석", "이명건", "조다해", "고준", "담당직속"];
    officeNames.forEach((name, idx) => {
      const p = makeProfile(name, 400 + idx, "담당", "사무실", "팀장");
      p.history = makeHistory(p, 400 + idx);
      members.push(p);
    });

    return members;
  }

  function makeOnOffRows(employees) {
    const states = ["ON", "OFF", "오픈지연", "프리데이"];
    return employees.slice(0, 60).map((e, idx) => ({
      date: "2026-04-03",
      name: e.name,
      on: idx % 4 === 1 ? "-" : `0${7 + (idx % 3)}:3${idx % 6}`,
      off: idx % 4 === 0 ? `1${8 + (idx % 2)}:1${idx % 6}` : "-",
      status: states[idx % 4],
      note: idx % 7 === 0 ? "예외 승인 필요" : "정상",
      editedAt: `2026-04-${pad((idx % 28) + 1, 2)}`
    }));
  }

  const stores = makeStores();
  const employees = makeEmployees(stores);
  const onoff = makeOnOffRows(employees);

  const officeTasks = [
    { team: "인사운영", owner: "박근우", task: "직원 수정 요청 검토", status: "진행중" },
    { team: "운영지원", owner: "유종호", task: "매장 실적 취합", status: "완료" },
    { team: "교육", owner: "정연우", task: "신규 점장 온보딩", status: "대기" },
    { team: "승인", owner: "원준기", task: "가입 승인 검토", status: "진행중" }
  ];

  const approvalsSeed = [
    { type: "가입 승인", target: "신규 사용자_김OO", requester: "시스템", status: "승인 대기", requestedAt: "2026-04-02" },
    { type: "직원 수정 승인", target: "김민성(연락처)", requester: "점장", status: "승인 대기", requestedAt: "2026-04-03" },
    { type: "매장 수정 승인", target: "가홈(매장명)", requester: "팀장", status: "승인 대기", requestedAt: "2026-04-01" }
  ];

  window.MockData = { stores, employees, onoff, officeTasks, approvalsSeed, spGrades: SP_GRADES };
})(window);
