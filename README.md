# Study With Me Discord Bot

학습 인증과 피드백을 제공하는 Discord 봇입니다.

## 기능

- 학습 세션 시작 및 관리
- AI 기반 학습 내용 확인 질문
- 학습 피드백 제공

## 시작하기

### 필수 조건

- Node.js 18 이상
- Discord Bot Token
- OpenAI API Key
- MongoDB 데이터베이스

### 설치

1. 저장소를 클론합니다:

```bash
git clone [repository-url]
cd study-with-me
```

2. 의존성을 설치합니다:

```bash
npm install
```

3. 환경 변수를 설정합니다:

```bash
cp .env.example .env
```

`.env` 파일을 열어 필요한 값들을 입력합니다.

4. Discord 슬래시 명령어를 등록합니다:

```bash
npm run deploy-commands
```

5. 봇을 실행합니다:

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm run build
npm start
```

## 사용 방법

1. `/study` 명령어를 사용하여 학습 세션을 시작합니다:

   - `topic`: 학습할 주제
   - `duration`: 학습 시간 (분)

2. 학습이 완료되면 AI가 학습 내용을 확인하는 질문을 합니다.

3. 질문에 답변하면 AI가 피드백을 제공합니다.

## 라이선스

MIT
