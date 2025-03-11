const puppeteer = require("puppeteer");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin, // 표준 입력 (키보드)
  output: process.stdout, // 표준 출력 (콘솔)
});

async function checkAlert(page) {
  // 알림창이 있는 경우 처리
  try {
    page.on("dialog", async (dialog) => {
      console.log(`알림 감지됨: ${dialog.message()}`);
      await dialog.accept(); // 모든 대화 상자를 자동으로 수락/닫기
    });
  } catch (e) {
    console.log("No alert detected");
  }
}

async function clockIn() {
  // 브라우저 시작 (헤드리스 모드)
  const browser = await puppeteer.launch({
    headless: true, // 브라우저 화면을 볼 수 있도록 설정
    defaultViewport: null,
    // args: ["--start-maximized"], // 전체화면
  });

  const page = await browser.newPage();

  async function date(date) {
    const x = 1600;
    const y = 400;
    console.log("날짜 입력 중");
    await page.mouse.click(x, y, { button: "left" });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.keyboard.type(date);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async function start(start) {
    const x = 1600;
    const y = 420;
    console.log("시작 시간 입력 중");
    await page.mouse.click(x, y, { button: "left" });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.keyboard.type(start);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async function end(end) {
    const x = 1600;
    const y = 440;
    console.log("종료 시간 입력 중");
    await page.mouse.click(x, y, { button: "left" });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.keyboard.type(end);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async function detail(detail) {
    const x = 1600;
    const y = 480;
    console.log("내용 입력 중");
    await page.mouse.click(x, y, { button: "left" });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.keyboard.type(detail);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async function save() {
    const x = 700;
    const y = 250;
    console.log("저장 중");
    await page.mouse.click(x, y, { button: "left" });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async function create() {
    const x = 650;
    const y = 250;
    console.log("생성 버튼 클릭 중");
    await page.mouse.click(x, y, { button: "left" });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async function getIdPw() {
    return new Promise((resolve) => {
      rl.question(
        "아이디와 비밀번호를 공백을 기준으로 작성해주세요 ex) ididid pwpwpw\n",
        (input) => {
          const value = input.split(" ");
          resolve({ id: value[0], pw: value[1] });
        }
      );
    });
  }

  // 회사 포털 페이지로 이동
  await page.goto(
    "https://portal.dongyang.ac.kr/login_real.jsp?targetId=DOUMI&RelayState=https://dtis.dongyang.ac.kr/dtc5/"
  );

  await page.setViewport({ width: 1920, height: 1080 });

  const { id, pw } = await getIdPw();
  console.log("힌트가 출력될 때까지 기다려주세요.");

  // 로그인
  await page.waitForSelector("#user_id", { visible: true, timeout: 5000 });
  await page.type("#user_id", id);
  await page.type("#user_password", pw);
  await page.click(".btn_login");

  // 페이지 로딩 대기
  await page.waitForNavigation();
  await checkAlert(page);

  // 출근 버튼 찾기 및 클릭
  try {
    // 근로 페이지 열기
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.mouse.click(400, 500, { button: "left" });
    await page.mouse.click(400, 520, { button: "left" });

    // 조회 버튼 클릭
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await page.mouse.click(1600, 170, { button: "left" });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("값을 입력해주세요\n");
    console.log("ex) 20250101 0900 1200\n");
    console.log(
      "입력이 끝나면 아무 값도 입력하지 않은 상태로 Enter를 한 번 더 눌러주세요\n"
    );

    const arr = [];

    rl.on("line", async (input) => {
      if (!input.trim()) {
        rl.close();
        return;
      }

      const data = input.split(" ");
      const date = data[0];
      const start = data[1];
      const end = data[2];
      const detail = data.slice(3).join(" ").trim();
      arr.push({ date, start, end, detail });
    });

    rl.on("close", async () => {
      for (const data of arr) {
        const detailText = data.detail || "강의실 준비 및 점검";
        console.log(
          `입력중: ${data.date} ${data.start}~${data.end} ${detailText}`
        );
        await create();
        // 날짜 입력
        await date(data.date); // "20250310"

        // 시작 시간 입력
        await start(data.start); // "0900"

        // 종료 시간 입력
        await end(data.end); // "1200"

        // 세부 내용 입력
        await detail(detailText); // "강의실 준비 및 점검"

        // 저장
        await save();
      }

      await browser.close();
    });
  } catch (error) {
    console.error("출근 체크 중 오류 발생:", error);
  }
}

// 함수 실행
clockIn();
