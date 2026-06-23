// =====================
// 데이터 관리
// =====================

// localStorage에서 저장된 약 목록 불러오기 (없으면 빈 배열로 시작)
let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

// 현재 medicines 배열을 localStorage에 저장
function save() {
  localStorage.setItem("medicines", JSON.stringify(medicines));
}

// =====================
// 알림 권한 설정
// =====================

// 아직 허용/거부 결정 안 한 경우에만 권한 요청 팝업 표시
if (Notification.permission === "default") {
  Notification.requestPermission();
}

// 1분마다 복용 시간 체크 → 해당 시간이면 브라우저 알림 발송
setInterval(function () {
  const now = new Date();
  // 현재 시간을 "HH:MM" 형식으로 변환
  const currentTime = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  for (let i = 0; i < medicines.length; i++) {
    // 알림 ON 상태이고, 아직 복용 안 했고, 복용 시간과 현재 시간이 일치하면 알림 발송
    if (medicines[i].alarmOn && !medicines[i].checked && medicines[i].time === currentTime) {
      new Notification("💊 복용 시간이에요!", {
        body: medicines[i].name + " " + medicines[i].dose + " 복용할 시간입니다."
      });
    }
  }
}, 60000);

// =====================
// 약 추가
// =====================

// 입력 폼에서 값을 읽어 medicines 배열에 추가하고 화면 갱신
function addMedicine() {
  const name = document.getElementById("name").value;
  const dose = document.getElementById("dose").value;
  const time = document.getElementById("time").value;

  // 빈 값 입력 방지
  if (name === "" || dose === "" || time === "") {
    alert("모든 항목을 입력해주세요!");
    return;
  }

  // 새 약 객체 추가 (alarmOn: 알림 ON, checked: 미복용 상태로 초기화)
  medicines.push({ name, dose, time, alarmOn: true, checked: false });
  save();
  displayList();

  // 입력창 초기화
  document.getElementById("name").value = "";
  document.getElementById("dose").value = "";
  document.getElementById("time").value = "";
}

// =====================
// 목록 렌더링
// =====================

// medicines 배열을 기반으로 화면에 약 목록을 다시 그림
function displayList() {
  const list = document.getElementById("list");
  list.innerHTML = ""; // 기존 목록 초기화

  for (let i = 0; i < medicines.length; i++) {
    const item = document.createElement("li");

    // 복용 체크박스 생성
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = medicines[i].checked;
    checkbox.onchange = function () {
      const now = new Date();
      const [hour, minute] = medicines[i].time.split(":").map(Number);
      const medicineTime = new Date();
      medicineTime.setHours(hour, minute, 0);

      // 복용 시간 이전이면 체크 불가
      if (now < medicineTime) {
        alert("아직 복용 시간이 되지 않았습니다!");
        checkbox.checked = false;
        return;
      }

      // 체크 상태 저장 및 화면 갱신
      medicines[i].checked = checkbox.checked;
      medicines[i].alarmOn = false;
      save();
      displayList();
    };

    // 약 정보 텍스트 (복용 완료 시 취소선 표시)
    const label = document.createElement("span");
    label.textContent = medicines[i].time + " | " + medicines[i].name + " | " + medicines[i].dose;
    if (medicines[i].checked) {
      label.style.textDecoration = "line-through";
      label.style.color = "gray";
    }

    // 알림 ON/OFF 토글 버튼 (🔔 / 🔕)
    const alarmBtn = document.createElement("button");
    alarmBtn.textContent = medicines[i].alarmOn ? "🔔" : "🔕";
    alarmBtn.onclick = function () {
      medicines[i].alarmOn = !medicines[i].alarmOn;
      save();
      displayList();
    };

    // 약 삭제 버튼
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";
    deleteBtn.onclick = function () {
      medicines.splice(i, 1); // 배열에서 해당 항목 제거
      save();
      displayList();
    };

    // 각 요소를 리스트 아이템에 순서대로 추가
    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(document.createTextNode("  "));
    item.appendChild(alarmBtn);
    item.appendChild(document.createTextNode("  "));
    item.appendChild(deleteBtn);
    list.appendChild(item);
  }
}

// 페이지 로드 시 저장된 목록 바로 표시
displayList();