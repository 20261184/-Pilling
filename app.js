import { db } from "./firebase.js";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Create - 약 추가
async function addMedicineToFirebase(medicine) {
  const docRef = await addDoc(collection(db, "medicines"), medicine);
  return docRef.id;
}

// Read - 약 목록 불러오기
async function getMedicinesFromFirebase() {
  const snapshot = await getDocs(collection(db, "medicines"));
  const result = [];
  snapshot.forEach((docSnap) => {
    result.push({ id: docSnap.id, ...docSnap.data() });
  });
  return result;
}

// Update - 체크 상태 업데이트
async function updateMedicineInFirebase(id, updatedFields) {
  const medicineRef = doc(db, "medicines", id);
  await updateDoc(medicineRef, updatedFields);
}

// Delete - 약 삭제
async function deleteMedicineFromFirebase(id) {
  const medicineRef = doc(db, "medicines", id);
  await deleteDoc(medicineRef);
}

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

// 1분마다 알림 체크 함수 실행
setInterval(checkAlarms, 60000);

/**
 * 현재 시간과 일치하는 복용 시간이 있는지 확인하고,
 * 알림 ON 상태이며 아직 체크 안 한 약이면 브라우저 알림 발송
 */
function checkAlarms() {
  const currentTime = getCurrentTimeString();

  for (let i = 0; i < medicines.length; i++) {
    const m = medicines[i];
    if (m.alarmOn && !m.checked && m.time === currentTime) {
      new Notification("💊 복용 시간이에요!", {
        body: m.name + " " + m.dose + " 복용할 시간입니다."
      });
    }
  }
}

/**
 * 현재 시간을 "HH:MM" 형식의 문자열로 반환
 * 예: 14시 5분 -> "14:05"
 */
function getCurrentTimeString() {
  const now = new Date();
  return now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
}

/**
 * 주어진 복용 시간(time)이 현재 시간보다 이전인지 확인
 * @param {string} time - "HH:MM" 형식의 복용 시간
 * @returns {boolean} 복용 시간이 지났으면 true
 */
function isTimePassed(time) {
  const now = new Date();
  const [hour, minute] = time.split(":").map(Number);
  const medicineTime = new Date();
  medicineTime.setHours(hour, minute, 0);
  return now >= medicineTime;
}

// =====================
// 약 추가
// =====================

/**
 * 입력 폼의 값을 읽어 새로운 약 객체를 medicines 배열에 추가
 * 빈 값이 있으면 경고창을 띄우고 중단
 */
function addMedicine() {
  const name = document.getElementById("name").value;
  const dose = document.getElementById("dose").value;
  const time = document.getElementById("time").value;

  if (name === "" || dose === "" || time === "") {
    alert("모든 항목을 입력해주세요!");
    return;
  }

  // alarmOn: 알림 기본 ON, checked: 미복용 상태로 시작
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

/**
 * medicines 배열 전체를 화면에 다시 그림
 * (목록을 비우고 각 약마다 li 요소를 새로 생성)
 */
function displayList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  for (let i = 0; i < medicines.length; i++) {
    list.appendChild(createMedicineItem(i));
  }
}

/**
 * 약 1개에 해당하는 <li> 요소를 생성
 * 체크박스, 텍스트, 알림 버튼, 삭제 버튼을 조합
 * @param {number} i - medicines 배열에서의 인덱스
 */
function createMedicineItem(i) {
  const item = document.createElement("li");

  const checkbox = createCheckbox(i);
  const label = createLabel(i);
  const alarmBtn = createAlarmBtn(i);
  const deleteBtn = createDeleteBtn(i);

  item.appendChild(checkbox);
  item.appendChild(label);
  item.appendChild(document.createTextNode("  "));
  item.appendChild(alarmBtn);
  item.appendChild(document.createTextNode("  "));
  item.appendChild(deleteBtn);

  return item;
}

/**
 * 복용 체크박스 생성
 * 복용 시간 이전이면 체크 불가, 체크 시 알림 자동 OFF
 */
function createCheckbox(i) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = medicines[i].checked;
  checkbox.onchange = function () {
    if (!isTimePassed(medicines[i].time)) {
      alert("아직 복용 시간이 되지 않았습니다!");
      checkbox.checked = false;
      return;
    }
    medicines[i].checked = checkbox.checked;
    medicines[i].alarmOn = false; // 체크 완료 시 알림 자동 종료
    save();
    displayList();
  };
  return checkbox;
}

/**
 * 약 정보 텍스트(시간 | 이름 | 용량) 생성
 * 복용 완료 시 취소선 표시
 */
function createLabel(i) {
  const m = medicines[i];
  const label = document.createElement("span");
  label.textContent = m.time + " | " + m.name + " | " + m.dose;
  if (m.checked) {
    label.style.textDecoration = "line-through";
    label.style.color = "gray";
  }
  return label;
}

/**
 * 알림 ON/OFF 토글 버튼 생성 (🔔 / 🔕)
 */
function createAlarmBtn(i) {
  const btn = document.createElement("button");
  btn.textContent = medicines[i].alarmOn ? "🔔" : "🔕";
  btn.onclick = function () {
    medicines[i].alarmOn = !medicines[i].alarmOn;
    save();
    displayList();
  };
  return btn;
}

/**
 * 약 삭제 버튼 생성
 */
function createDeleteBtn(i) {
  const btn = document.createElement("button");
  btn.textContent = "삭제";
  btn.onclick = function () {
    medicines.splice(i, 1);
    save();
    displayList();
  };
  return btn;
}

// 페이지 로드 시 저장된 목록 바로 표시
displayList();

window.addMedicine = addMedicine;

async function testFirebaseSave() {
  const testMedicine = {
    name: "테스트약",
    dose: "1정",
    time: "10:00",
    alarmOn: true,
    checked: false
  };

  const id = await addMedicineToFirebase(testMedicine);
  console.log("Firebase에 저장된 문서 ID:", id);

  const all = await getMedicinesFromFirebase();
  console.log("Firebase에서 불러온 전체 데이터:", all);
}

window.testFirebaseSave = testFirebaseSave;

// =====================
// AI 성분 분석
// =====================

const GEMINI_API_KEY = "AQ.Ab8RN6IEKylIMeT5QoNLyl3x5z40Ir4YK-Q7rEsDJsLB9vEF4A";

/**
 * 약 이름을 받아 Gemini AI로 성분 분석 결과 반환
 * @param {string} medicineName - 분석할 약 이름
 * @returns {string} AI 분석 결과
 */
async function analyzeMedicine(medicineName) {
  const prompt = `약 이름: ${medicineName}
다음 항목을 간단하게 알려주세요:
1. 주요 성분
2. 효능
3. 과복용 시 위험
4. 주의사항`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

window.analyzeMedicine = analyzeMedicine;

async function testAI() {
  const resultDiv = document.getElementById("aiResult");
  resultDiv.textContent = "분석 중...";

  const result = await analyzeMedicine("타이레놀");
  resultDiv.textContent = result;
}
window.testAI = testAI;

// =====================
// 위치 서비스 (카카오맵)
// =====================

/**
 * 현재 위치 기반으로 주변 약국을 지도에 표시
 */
function loadMap() {
  if (!window.kakao || !window.kakao.maps) {
    alert("지도 로딩 중입니다. 잠시 후 다시 시도해주세요!");
    return;
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(lat, lng),
      level: 3
    };
    const map = new window.kakao.maps.Map(container, options);

    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng)
    });
    marker.setMap(map);

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch("약국", function (data, status) {
      if (status === window.kakao.maps.services.Status.OK) {
        for (let i = 0; i < data.length; i++) {
          const pharmMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(data[i].y, data[i].x),
            map: map
          });
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;">${data[i].place_name}</div>`
          });
          window.kakao.maps.event.addListener(pharmMarker, "click", function () {
            infowindow.open(map, pharmMarker);
          });
        }
      }
    }, { location: new window.kakao.maps.LatLng(lat, lng) });
  });
}

window.loadMap = loadMap;