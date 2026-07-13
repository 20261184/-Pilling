# 💊 FeFe Pilling - 복약 관리 시스템 (Backend)

## 📅 5월 개발 마일스톤 완료 현황
- [x] 5/26 | medicines 저장/조회 테스트 (완료)
- [x] 5/27 | checked / alarmOn 상태 저장 테스트 (완료)
- [x] 5/28 | medicines 시간, 용량 수정 및 삭제 테스트 (완료)
- [x] 5/29 | API 연동 및 itemSeq 기준 문서 식별자 매핑 (완료)
- [x] 5/30 | Firestore 데이터베이스 컬렉션 구조 문서화 (완료)
- [x] 5/31 | 테스트용 Dummy 데이터 JSON 제작 (완료)

---

## 🗂️ Firebase Firestore 구조 (5/30 문서화)
약 이름 대신 공공 API의 고유 번호(`itemSeq`)를 문서 ID로 사용하여 데이터 중복 및 누락을 방지합니다.

```text
users (Collection)
  └─ {userUid} (Document)
       └─ medicines (Sub-Collection)
            └─ {itemSeq} (Document)  <-- 고유 식별자 (예: 200003092)
                 ├─ itemSeq: "200003092" (String)
                 ├─ name: "타이레놀정500mg" (String)
                 ├─ efficacy: "감기로 인한 발열 및 통증..." (String)
                 ├─ usage: "1회 1~2정씩 1일 3-4회..." (String)
                 ├─ sideEffects: "등록된 주의사항 정보가 없습니다." (String)
                 ├─ dose: "1정" (String)
                 ├─ time: "10:00" (String)
                 ├─ alarmOn: true (Boolean)
                 └─ checked: (Map)
                      └─ "2026-07-12": true (Boolean)