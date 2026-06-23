import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "firebase/firestore";

// 저장 테스트
async function testWrite() {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      uid: "test_user_001",
      email: "test@test.com"
    });
    console.log("저장 성공! ID:", docRef.id);
  } catch (e) {
    console.error("저장 실패:", e);
  }
}

// 조회 테스트
async function testRead() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      console.log("조회 성공!", doc.id, doc.data());
    });
  } catch (e) {
    console.error("조회 실패:", e);
  }
}

testWrite();
testRead();