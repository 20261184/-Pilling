# Firebase 사용 가이드

## 1. 데이터 저장 (Set / Add)
- 단일 문서 저장 (ID 지정): setDoc(doc(db, "items", itemId), { 데이터 })
- 자동 ID 생성 저장: addDoc(collection(db, "items"), { 데이터 })

## 2. 데이터 조회 (Get / Query)
- 단일 문서 조회: getDoc(doc(db, "items", itemId))
- 조건부 리스트 조회: query(collection(db, "items"), where("itemPrice", ">=", 10000))