const puppeteer = require("puppeteer");

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

async function clockIn(id, pw, dataList) {
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

  // 대학 포털 페이지로 이동
  await page.goto(
    "https://portal.dongyang.ac.kr/login_real.jsp?targetId=DOUMI&RelayState=https://dtis.dongyang.ac.kr/dtc5/"
  );

  await page.setViewport({ width: 1920, height: 1080 });

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

    for (const data of dataList) {
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
  } catch (error) {
    console.error("출근 체크 중 오류 발생:", error);
  }
}

module.exports = { clockIn };
