# StudyWithMe Discord Bot - Product Requirement Document

## 1. 프로젝트 개요

### 1.1 프로젝트 목적

- 주니어 프론트엔드 개발자의 지속적인 학습을 돕는 Discord 챗봇
- 학습 내용에 대한 꼬리질문을 통한 심화 학습 유도
- AI 기반 피드백을 통한 학습 방향성 제시

### 1.2 핵심 가치

- 매일매일의 학습 인증을 통한 꾸준한 성장
- 심화 질문을 통한 개념 이해도 검증
- 맞춤형 피드백을 통한 학습 방향성 제시

## 2. 타겟 사용자

### 2.1 주요 타겟

- 프론트엔드 주니어 개발자
- 개념 선행 학습이 필요한 개발자
- 지속적인 학습이 필요한 개발자

### 2.2 사용자 페인포인트

- 혼자 공부할 때 동기부여 부족
- 학습 내용에 대한 피드백 부재
- 개념 이해도 검증의 어려움

## 3. 핵심 기능

### 3.1 학습 인증 시스템

```typescript
// 명령어 구조
/study topic: string content: string

// 파라미터 검증
topic: {
  required: true,
  minLength: 2,
  maxLength: 50,
  pattern: /^[가-힣a-zA-Z0-9\s\-_.]+$/
}
content: {
  required: true,
  minLength: 10,
  maxLength: 1000,
  validation: "프론트엔드/JavaScript 관련 내용 AI 검증"
}

// 세션 상태
enum SessionStatus {
  WAITING_FIRST_ANSWER = "WAITING_FIRST_ANSWER",
  WAITING_SECOND_ANSWER = "WAITING_SECOND_ANSWER",
  GENERATING_FEEDBACK = "GENERATING_FEEDBACK",
  COMPLETED = "COMPLETED",
  PAUSED = "PAUSED",
  EXPIRED = "EXPIRED"
}

// 세션 타임아웃
const SESSION_TIMEOUTS = {
  FIRST_ANSWER: 30 * 60 * 1000,  // 30분
  SECOND_ANSWER: 30 * 60 * 1000, // 30분
  FEEDBACK_GENERATION: 5 * 60 * 1000 // 5분
}
```

### 3.2 꼬리질문 시스템

- 1차 질문: 학습 내용의 핵심 개념 확인
- 2차 질문: 심화된 개념 이해도 검증
- 질문 생성 원칙
  - 단순 암기가 아닌 이해도 검증
  - 주니어 개발자에게 적절한 난이도
  - 실무 연결 가능한 질문

```typescript
// AI 프롬프트 템플릿
const FIRST_QUESTION_PROMPT = `
당신은 프론트엔드 개발 멘토입니다. 다음 학습 내용에 대한 첫 번째 질문을 생성해주세요.

### 질문 생성 원칙:
1. 개념의 핵심을 확인하는 질문
2. 단순 암기가 아닌 이해도 검증
3. 주니어 개발자에게 적절한 난이도
4. 한 문장으로 명확하게

### 학습 내용:
주제: {topic}
내용: {content}

### 응답 형식:
질문만 반환 (설명 없이)
`;

const SECOND_QUESTION_PROMPT = `
첫 번째 질문과 답변을 바탕으로 두 번째 질문을 생성해주세요.

### 질문 생성 원칙:
1. 첫 번째 답변의 이해도를 바탕으로 난이도 조절
2. 더 깊은 개념 탐구 또는 실무 연결
3. 사고의 확장을 유도
4. 구체적이고 실용적인 질문

### 대화 맥락:
- 주제: {topic}
- 첫 번째 질문: {firstQuestion}
- 첫 번째 답변: {firstAnswer}

### 응답 형식:
질문만 반환
`;
```

### 3.3 피드백 시스템

- 이해도 평가 (5점 척도)
- 잘한 점 2-3가지
- 개선할 점 1-2가지
- 다음 학습 추천 주제
- 격려 메시지

```typescript
const FEEDBACK_PROMPT = `
전체 학습 세션을 바탕으로 종합적인 피드백을 제공해주세요.

### 피드백 구성:
1. 이해도 평가 (5점 척도)
2. 잘한 점 2-3가지
3. 개선할 점 1-2가지
4. 다음 학습 추천 주제
5. 격려 메시지

### 세션 정보:
- 주제: {topic}
- 초기 학습 내용: {initialContent}
- Q1: {firstQuestion}
- A1: {firstAnswer}
- Q2: {secondQuestion}
- A2: {secondAnswer}

### 응답 형식 (JSON):
{
  "overallScore": number,
  "strengths": string[],
  "improvements": string[],
  "nextTopics": string[],
  "encouragement": string,
  "summary": string
}
`;

// 피드백 생성 제한
const FEEDBACK_LIMITS = {
  maxStrengths: 3,
  maxImprovements: 2,
  maxNextTopics: 3,
  maxEncouragementLength: 200,
};
```

## 4. 기술 스택

### 4.1 프론트엔드

- Discord.js
- TypeScript

### 4.2 백엔드

- Node.js
- Express
- MongoDB
- OpenAI API

## 5. 데이터 모델

### 5.1 사용자 (User)

```typescript
interface User {
  id: string;
  discordId: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 학습 세션 (StudySession)

```typescript
interface StudySession {
  id: string;
  userId: string;
  topic: string;
  content: string;
  firstQuestion: string;
  firstAnswer: string;
  secondQuestion: string;
  secondAnswer: string;
  feedback: {
    score: number;
    strengths: string[];
    improvements: string[];
    nextTopics: string[];
  };
  status: "waiting" | "completed";
  createdAt: Date;
  completedAt: Date;
}
```

## 6. 구현 단계

### 6.1 1단계 (1주)

- Discord 봇 기본 설정
- 사용자 인증 시스템
- 기본 명령어 구현

### 6.2 2단계 (1주)

- 학습 인증 시스템
- AI 질문 생성
- 답변 처리

### 6.3 3단계 (1주)

- 피드백 시스템
- 데이터 저장
- 테스트 및 버그 수정

## 7. 성공 지표

- 일일 활성 사용자 수
- 세션 완료율
- 사용자 만족도
- 재사용률

## 8. 제한사항

- 동시 처리 가능한 세션 수: 10개
- 세션 타임아웃: 30분
- 일일 사용자당 최대 세션 수: 3개
- 답변 대기 시간: 30초
- AI 응답 생성 시간: 5초 이내
- 세션 자동 종료 조건:
  - 30분 동안 답변 없음
  - 24시간 동안 미완료 상태
  - 사용자가 "종료" 명령어 입력

## 9. 에러 처리

- 네트워크 오류
  - 자동 재시도 (최대 3회)
  - 사용자에게 재시도 안내
- AI API 타임아웃
  - 5초 초과 시 재시도
  - 3회 실패 시 사용자에게 알림
- 사용자 입력 오류
  - 파라미터 검증 실패 시 상세 안내
  - 최대 길이 초과 시 안내
- 세션 만료
  - 자동 정리 (24시간 후)
  - 사용자에게 만료 알림

## 10. 모니터링

- 세션 생성/완료 수
- AI API 사용량
- 에러 발생률
- 응답 시간
- 세션 완료율
- 사용자 재사용률
- 평균 세션 시간
- AI 응답 생성 시간
