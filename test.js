import { db } from "./firebase.js";
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// [5/27 테스트용] 오늘 날짜 정의 (복약 체크용 키값)
const userUid = "test_user_001";
const targetDate = "2026-07-12"; 

// =======================================================
// 데이터 누락 방지 및 HTML 정제 함수 (질문자님 원본 + itemSeq/구조 확장)
// =======================================================
function getCleanMedicationData(rawItem) {
  const safeName = rawItem.ITEM_NAME?.trim() || "이름 모를 의약품";
  const rawEfficacy = rawItem.EE_DOC_DATA?.trim() || "등록된 효능 정보가 없습니다.";
  const rawUsage = rawItem.UD_DOC_DATA?.trim() || "등록된 복용법 정보가 없습니다.";
  const rawSideEffects = rawItem.NB_DOC_DATA?.trim() || "등록된 주의사항 정보가 없습니다.";

  const cleanText = (text) => text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

  return {
    itemSeq: rawItem.ITEM_SEQ || "000000000", // [5/29 추가] API 고유 식별자
    name: safeName,
    efficacy: cleanText(rawEfficacy),
    usage: cleanText(rawUsage),
    sideEffects: cleanText(rawSideEffects),
    alarmOn: true,                            // [5/27 추가] 알림 기본값 ON
    checked: {
      [targetDate]: false                     // [5/27 추가] 날짜별 복약 체크 상태 (기본값 false)
    },
    time: "10:00",                            // [5/28 추가] 수정 테스트용 기본 시간
    dose: "1정"                               // [5/28 추가] 수정 테스트용 기본 용량
  };
}

// =======================================================
// 📅 5/26 ~ 5/31 통합 시나리오 실행 함수
// =======================================================
async function runAllTests() {
  console.log("🚀 [체크리스트 전체 검증] 테스트를 시작합니다.\n");
  
  // -----------------------------------------------------
  // 1. [5/26 & 5/29] medicines 저장 테스트 (itemSeq 기준)
  // -----------------------------------------------------
  console.log("--- [5/26 & 5/29] medicines 저장 테스트 ---");
  
  const mockApiData = {
    ITEM_SEQ: "200003092", // API 고유 번호
    ITEM_NAME: "타이레놀정500mg",
    EE_DOC_DATA: "<b>감기로 인한 발열</b> 및 통증<br>두통",
    UD_DOC_DATA: "1회 1~2정씩 1일 3-4회",
    NB_DOC_DATA: "" 
  };

  const cleanData = getCleanMedicationData(mockApiData);

  // 5/29 요구사항 반영: 중복 방지 및 확실한 조회를 위해 'itemSeq'를 문서 ID로 지정
  const docRef = doc(db, "users", userUid, "medicines", cleanData.itemSeq);
  
  try {
    await setDoc(docRef, cleanData);
    console.log(`✅ [성공] itemSeq(${cleanData.itemSeq}) 기준으로 '${cleanData.name}' 저장 확인.`);
  } catch (error) {
    console.error("❌ 저장 실패:", error.message);
    return;
  }

  // -----------------------------------------------------
  // 2. [5/26] medicines 조회 테스트
  // -----------------------------------------------------
  console.log("\n--- [5/26] medicines 조회 테스트 ---");
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("✅ [성공] 저장된 약 데이터를 정상적으로 불러왔습니다.");
      console.log("   데이터 확인:", docSnap.data());
    } else {
      console.log("❌ 실패: 데이터를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("❌ 조회 실패:", error.message);
  }

  // -----------------------------------------------------
  // 3. [5/27] checked & alarmOn 저장 테스트
  // -----------------------------------------------------
  console.log("\n--- [5/27] checked / alarmOn 저장 테스트 ---");
  try {
    // 알림을 OFF로 바꾸고, 오늘 날짜 복약을 true(완료)로 업데이트
    await updateDoc(docRef, {
      alarmOn: false,
      [`checked.${targetDate}`]: true
    });
    
    const updatedSnap = await getDoc(docRef);
    const updatedData = updatedSnap.data();
    console.log(`✅ [성공] 복약 체크 상태 저장 확인 (checked[${targetDate}] = ${updatedData.checked[targetDate]})`);
    console.log(`✅ [성공] 알림 ON/OFF 변경 저장 확인 (alarmOn = ${updatedData.alarmOn})`);
  } catch (error) {
    console.error("❌ 상태 업데이트 실패:", error.message);
  }

  // -----------------------------------------------------
  // 4. [5/28] medicines 수정 테스트 (복약 시간/용량)
  // -----------------------------------------------------
  console.log("\n--- [5/28] medicines 수정 테스트 ---");
  try {
    await updateDoc(docRef, {
      time: "13:30",
      dose: "2정"
    });

    const modifiedSnap = await getDoc(docRef);
    const modifiedData = modifiedSnap.data();
    console.log(`✅ [성공] 복약 시간 수정 확인: ${modifiedData.time}`);
    console.log(`✅ [성공] 복약 용량 수정 확인: ${modifiedData.dose}`);
  } catch (error) {
    console.error("❌ 데이터 수정 실패:", error.message);
  }

  // -----------------------------------------------------
  // 5. [5/28] medicines 삭제 테스트
  // -----------------------------------------------------
  console.log("\n--- [5/28] medicines 삭제 테스트 ---");
  try {
    await deleteDoc(docRef);
    
    const finalSnap = await getDoc(docRef);
    if (!finalSnap.exists()) {
      console.log("✅ [성공] 약 삭제 확인 (데이터베이스에서 삭제 완료)");
    } else {
      console.log("❌ 실패: 데이터가 지워지지 않았습니다.");
    }
  } catch (error) {
    console.error("❌ 데이터 삭제 실패:", error.message);
  }

  console.log("\n🏁 5/26 ~ 5/31 일정을 위한 모든 기능 테스트가 완료되었습니다!");
}

runAllTests();