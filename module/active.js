const regex = /^(0[1-9]|1[0-9]|2[0-4])(0[0-9]|[1-5][0-9])$/;

function log(text) {
  const logElement = document.getElementById("log");
  const logEntry = document.createElement("div");
  logEntry.innerHTML = `<p>${new Date().toLocaleString()}: ${text}</p>`;
  logElement.appendChild(logEntry);
}

function updateTime(event) {
  const target = event.target;
  const parent = target.parentElement;
  const start = parent.querySelector(".start_time").value;
  const end = parent.querySelector(".end_time").value;

  if (!regex.test(target.value)) {
    alert("시간 형식이 올바르지 않습니다.");
    target.value = "";
    return;
  }

  const startHour = Number(start.substring(0, 2));
  const startMinute = Number(start.substring(2, 4));
  const starts = startHour * 60 + startMinute; // 시작 단위: 분

  const endHour = Number(end.substring(0, 2));
  const endMinute = Number(end.substring(2, 4));
  const ends = endHour * 60 + endMinute; // 종료 단위: 분

  const current = ends - starts;
  const minute = current % 60;
  const hour = Math.floor((current - minute) / 60);

  const timeP = parent.querySelector("p");
  timeP.innerText = `${hour}H ${minute}M`;
  if (hour < 0 || minute < 0 || current > 480) {
    timeP.style.color = "red";
  } else {
    timeP.style.color = "black";
  }
}

document.getElementById("add_input").addEventListener("click", () => {
  const li = document.createElement("li");
  li.innerHTML = `
              <button class="copy" onClick="copy(event)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-copy"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                />
              </svg>
            </button>
            <input type="number" placeholder="20250101" />
            <input
              type="text"
              class="start_time"
              onChange="updateTime(event)"
              placeholder="0900"
            />
            <input
              type="text"
              class="end_time"
              onChange="updateTime(event)"
              placeholder="1200"
            />
            <p>0H 0M</p>
    `;

  document
    .getElementById("time_table")
    .insertBefore(li, document.getElementById("add_input"));
});

function copy(e) {
  const target = e.target;
  const li = target.closest("li");
  const ul = li.closest("ul");

  const copyed = li.cloneNode(true);

  ul.insertBefore(copyed, document.getElementById("add_input"));
}

document.getElementById("submit").addEventListener("click", async () => {
  log(`출근 체크 시작`);
  const id = document.getElementById("id").value;
  const pw = document.getElementById("pw").value;
  const logElement = document.getElementById("log");

  if (!id || !pw) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  const timeEntries = [];
  const timeTable = document.getElementById("time_table");
  const entries = timeTable.querySelectorAll("li");

  entries.forEach((entry) => {
    const date = entry.querySelector("input[type='number']").value;
    const startTime = entry.querySelector(".start_time").value;
    const endTime = entry.querySelector(".end_time").value;

    if (date && startTime && endTime) {
      timeEntries.push({
        date,
        start: startTime,
        end: endTime,
        detail: "강의실 준비 및 점검",
      });
    }
  });

  if (timeEntries.length === 0) {
    alert("최소 하나의 시간 항목을 입력해주세요.");
    return;
  }

  try {
    await window.electronAPI.clockIn(id, pw, timeEntries);
    log(`입력된 항목 수: ${timeEntries.length}`);

    // 입력 필드 초기화
    document.getElementById("id").value = "";
    document.getElementById("pw").value = "";
    entries.forEach((entry) => {
      entry.querySelector("input[type='number']").value = "";
      entry.querySelector(".start_time").value = "";
      entry.querySelector(".end_time").value = "";
      entry.querySelector("p").textContent = "0H 0M";
    });
  } catch (error) {
    alert("출근 체크 중 오류가 발생했습니다: " + error.message);
  }
});
