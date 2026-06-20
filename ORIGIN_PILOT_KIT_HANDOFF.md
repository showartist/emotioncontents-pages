# ORIGIN PILOT KIT 검증엔진 handoff

## 현재 위치
- 로컬 저장소: `/Users/emotioncontents/emotioncontents-pages`
- 앱 경로: `/Users/emotioncontents/emotioncontents-pages/origin-pilot-kit/`
- 현재 세션에서 실제 수정한 핵심 파일:
  - `origin-pilot-kit/index.html`
  - `origin-pilot-kit/styles.css`
  - `origin-pilot-kit/app.js`
  - `origin-pilot-kit/README.md`

## 이번에 바뀐 핵심
기존의 "정적 5개 생성기" 수준에서 멈추지 않고,
**실제 검증 운영 플로우**까지 되도록 바뀜.

### 새 검증 플로우
1. 운영자가 IP 브리프 입력
2. 앱이 검증 가설 / 실험 설계 / 판단 기준 생성
3. 운영자가 **응답자용 테스트 링크** 생성
4. 외부 응답자가 링크에서 실제 자극을 보고 응답
5. 응답자가 **응답 패키지 문자열 또는 JSON** 생성
6. 운영자가 그 패키지를 앱에 다시 가져와 증거 누적
7. 대시보드가 **GO / ITERATE / PIVOT / STOP / MORE DATA** 판단 갱신

## 현재 주요 기능
- 사주보이즈 샘플 로드
- 공연형 샘플 로드
- 검증 프로젝트 생성
- 검증 가설 탭
- 실험 설계 탭
- **응답자 테스트 탭**
  - 테스트 이름 / 자극 형태 / 설명 / 자극 본문 입력
  - 응답자용 링크 생성
- **응답자 전용 모드(`?run=` 링크)**
  - 자극 노출
  - 설문 입력
  - 응답 패키지 생성
  - 패키지 복사 / 응답 JSON 저장
- **증거 수집 탭**
  - 응답 패키지 문자열 붙여넣기
  - 응답 JSON 불러오기
  - 수동 응답 추가
- 판단 대시보드 계산
- Markdown 저장
- 프로젝트 JSON 내보내기 / 불러오기
- localStorage 자동 저장

## 실제 확인한 동작
로컬 서버에서 브라우저로 실제 확인함.

### 운영자 모드 확인
- URL: `http://127.0.0.1:8015/origin-pilot-kit/`
- 페이지 title 정상: `ORIGIN PILOT KIT · 검증엔진`
- `검증 프로젝트 생성` 정상 동작
- `응답자 링크 생성` 정상 동작
- JS 에러 없음

### 응답자 모드 확인
- 생성된 `?run=` 링크로 응답자 전용 화면 진입 확인
- 응답자 이름/유형/메모 입력 가능 확인
- `응답 패키지 생성` 정상 동작 확인
- 패키지 문자열 생성 확인

### 증거 흡수 확인
- 운영자 모드로 돌아와 패키지 문자열 붙여넣기
- `패키지 가져오기` 정상 동작 확인
- 응답 카드 1개 생성 확인
- 상태 메시지: `응답 패키지를 가져왔습니다.` 확인

## 배포 목표 URL
푸시 후 예상 URL:
- `https://showartist.github.io/emotioncontents-pages/origin-pilot-kit/`

## 기술 구조
- 백엔드 없음
- 외부 API 없음
- GitHub Pages 호환 정적 구조
- 중앙 DB 없음
- 대신 **링크 공유 + 응답 패키지 회수** 방식으로 실제 검증 가능

## 현재 막힌 것
- `git push origin main` 인증 미완료
- GitHub 계정 비밀번호로는 push 불가
- PAT 또는 SSH 필요

## 안티그라비티가 해주면 되는 일
1. `/Users/emotioncontents/emotioncontents-pages` 저장소에서 변경사항 확인
2. 커밋 정리
3. 원격 푸시 인증 처리(PAT 또는 SSH)
4. GitHub Pages 공개 확인
5. 공개 URL에서 운영자 모드 + 응답자 링크 플로우 재검증

## 빠른 확인 명령
```bash
cd /Users/emotioncontents/emotioncontents-pages
python3 -m http.server 8877
```

브라우저 확인:
- 운영자 모드: `http://127.0.0.1:8877/origin-pilot-kit/`
- 응답자 모드: 운영자 화면에서 링크 생성 후 테스트

## 전달 포인트
이 프로젝트는 **AI가 IP 성공을 판정하는 도구**가 아니라,
**원천 IP를 실제 사람에게 물어볼 수 있는 실험 상태로 바꾸고, 그 응답 증거를 쌓아 판단하게 만드는 검증엔진**임.
