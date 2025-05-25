# StudyWithMe Discord Bot - Product Requirement Document

## 📋 프로젝트 개요

### 프로젝트명

**StudyWithMe** (스터디윗미)

### 프로젝트 목적

프론트엔드 주니어 개발자들의 학습 내용에 대한 심화 학습과 종합적 피드백을 제공하는 Discord 챗봇을 통해 개념 선행 학습과 실무 연결 능력을 향상시킨다.

### 타겟 사용자

- **Primary**: 코드잇 프론트엔드 4기 "사기집단" 스터디 멤버 (5명)
- **Secondary**: 취업한 주니어 프론트엔드 개발자
- **기술 레벨**: 개념 선행 학습이 필요한 주니어 수준 (성장을 위해 적절히 도전적인 난이도 선호)

---

## 🎯 핵심 기능 정의

### 1. 학습 인증 & 대화형 검증 시스템

```
플로우: 학습 인증 → 1차 꼬리질문 → 2차 꼬리질문 → 종합 피드백
```

### 2. Discord 명령어 상세 스펙

#### `/study` 명령어

```typescript
// 명령어 구조
/study topic: string content: string

// 예시
/study topic:"React Hooks" content:"useEffect는 컴포넌트가 렌더링될 때마다 실행되는 훅이다"

// 응답 형식
{
  type: "EMBED",
  title: "📚 학습 내용 접수완료!",
  description: "30초 내에 첫 번째 질문을 드릴게요!",
  fields: [
    { name: "주제", value: "React Hooks", inline: true },
    { name: "세션 ID", value: "session_abc123", inline: true }
  ],
  footer: "언제든 그만두고 싶으면 '종료'라고 말해주세요"
}

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
```

#### `/topic` 명령어

```typescript
// 명령어 구조
/topic [difficulty?: "beginner" | "intermediate" | "advanced"]

// 응답 형식
{
  type: "EMBED",
  title: "💡 오늘의 추천 학습 주제",
  description: "아래 주제 중 하나를 선택해서 공부해보세요!",
  fields: [
    { name: "🔥 HOT", value: "JavaScript 클로저의 실제 활용법", inline: false },
    { name: "📚 기초 탄탄", value: "CSS Flexbox vs Grid 완벽 정리", inline: false },
    { name: "🚀 실무 준비", value: "React 상태 관리 패턴 비교", inline: false }
  ]
}

// 주제 추천 로직
const topicCategories = {
  javascript: ["클로저", "비동기", "이벤트루프", "프로토타입", "스코프"],
  react: ["훅", "상태관리", "라이프사이클", "최적화", "패턴"],
  css: ["레이아웃", "애니메이션", "반응형", "전처리기", "모던CSS"],
  tools: ["webpack", "vite", "git", "npm", "typescript"]
}
```

#### `/question` 명령어

```typescript
// 명령어 구조
/question content: string

// 자유 질문 처리 (학습 인증 없이)
// AI가 1회성 답변 제공
// 추가 질문 원하면 다시 명령어 입력 필요
```

#### 숨겨진 명령어 (관리자용)

```typescript
// /admin stats - 사용 통계
// /admin reset [userId] - 사용자 세션 초기화
// /admin shutdown - 봇 긴급 정지
```

### 3. 세션 상태 관리

```typescript
enum SessionStatus {
  WAITING_FIRST_ANSWER = "WAITING_FIRST_ANSWER",
  WAITING_SECOND_ANSWER = "WAITING_SECOND_ANSWER",
  GENERATING_FEEDBACK = "GENERATING_FEEDBACK",
  COMPLETED = "COMPLETED",
  PAUSED = "PAUSED",
  EXPIRED = "EXPIRED",
}

// 세션별 타이머 관리
class SessionTimer {
  private timers: Map<string, NodeJS.Timeout>;

  setAnswerTimeout(sessionId: string, callback: () => void) {
    // 30분 후 자동 일시정지
  }

  setPauseCleanup(sessionId: string, callback: () => void) {
    // 24시간 후 세션 완전 삭제
  }
}
```

---

## 🤖 AI 프롬프트 설계

### 학습 내용 분석 프롬프트

```typescript
const ANALYZE_CONTENT_PROMPT = `
당신은 프론트엔드 개발 멘토입니다. 사용자의 학습 내용을 분석해주세요.

### 분석 기준:
1. 기술적 정확성 (1-5점)
2. 이해도 수준 (BEGINNER/INTERMEDIATE/ADVANCED)  
3. 부족한 부분 식별
4. 실무 연결 가능성

### 학습 내용:
주제: {topic}
내용: {content}

### 응답 형식 (JSON):
{
  "accuracy": number,
  "level": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  "missingConcepts": string[],
  "strengths": string[],
  "suggestedFocus": string
}
`;

const GENERATE_FIRST_QUESTION_PROMPT = `
다음 학습 내용에 대한 첫 번째 꼬리질문을 생성해주세요.

### 질문 생성 원칙:
1. 개념의 핵심을 확인하는 질문
2. 단순 암기가 아닌 이해도 검증
3. 주니어 개발자에게 적절한 난이도
4. 한 문장으로 명확하게

### 사용자 정보:
- 레벨: {estimatedLevel}
- 학습 주제: {topic}
- 학습 내용: {content}
- 분석 결과: {analysis}

### 응답 형식:
질문만 반환 (설명 없이)

### 질문:
`;

const GENERATE_SECOND_QUESTION_PROMPT = `
첫 번째 질문과 답변을 바탕으로 두 번째 꼬리질문을 생성해주세요.

### 질문 생성 원칙:
1. 첫 번째 답변의 이해도를 바탕으로 난이도 조절
2. 더 깊은 개념 탐구 또는 실무 연결
3. 사고의 확장을 유도
4. 구체적이고 실용적인 질문

### 대화 맥락:
- 주제: {topic}
- 첫 번째 질문: {firstQuestion}
- 첫 번째 답변: {firstAnswer}
- 답변 분석: {answerAnalysis}

### 응답 형식:
질문만 반환

### 질문:
`;

const GENERATE_FEEDBACK_PROMPT = `
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
```

### AI 난이도 자동 조절 로직

```typescript
interface AnswerAnalysis {
  confidence: number; // 답변 확신도 (0-1)
  technicalAccuracy: number; // 기술적 정확성 (0-1)
  conceptualDepth: number; // 개념 이해도 (0-1)
  responseLength: number; // 답변 길이
  keywordMatch: number; // 핵심 키워드 매칭률
}

function adjustDifficulty(analysis: AnswerAnalysis): DifficultyAdjustment {
  const overallScore =
    analysis.confidence * 0.3 +
    analysis.technicalAccuracy * 0.4 +
    analysis.conceptualDepth * 0.3;

  if (overallScore >= 0.8) return { action: "INCREASE", amount: 1 };
  if (overallScore <= 0.4) return { action: "DECREASE", amount: 1 };
  return { action: "MAINTAIN", amount: 0 };
}
```

---

## 📊 데이터베이스 설계

### Prisma 스키마

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(cuid())
  discordId         String    @unique
  username          String
  preferredLanguage String    @default("ko")
  notificationEnabled Boolean @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  sessions          StudySession[]

  @@map("users")
}

model StudySession {
  id            String        @id @default(cuid())
  userId        String
  topic         String
  initialContent String
  status        SessionStatus @default(WAITING_FIRST_ANSWER)
  estimatedLevel String       @default("BEGINNER")

  // 질문-답변 데이터 (세션 종료시 삭제됨)
  firstQuestion  String?
  firstAnswer    String?
  secondQuestion String?
  secondAnswer   String?

  // 피드백 (7일 보관)
  finalFeedback  Json?
  overallScore   Float?

  // 타임스탬프
  createdAt     DateTime @default(now())
  expiresAt     DateTime // 7일 후
  completedAt   DateTime?

  // 관계
  user          User     @relation(fields: [userId], references: [discordId])

  @@map("study_sessions")
}

enum SessionStatus {
  WAITING_FIRST_ANSWER
  WAITING_SECOND_ANSWER
  GENERATING_FEEDBACK
  COMPLETED
  PAUSED
  EXPIRED
}

model BotSettings {
  id                String  @id @default("singleton")
  maintenanceMode   Boolean @default(false)
  maxConcurrentSessions Int @default(10)
  rateLimit         Int     @default(10) // per hour

  @@map("bot_settings")
}

model UsageStats {
  id              String   @id @default(cuid())
  date            DateTime @default(now())
  totalSessions   Int      @default(0)
  completedSessions Int    @default(0)
  averageScore    Float?

  @@map("usage_stats")
}
```

### 데이터 생명주기 관리

```typescript
// 자동 정리 작업 (Cron Job)
export async function cleanupExpiredData() {
  const now = new Date();

  // 만료된 세션 삭제
  await prisma.studySession.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  // 30일 이상된 통계 데이터 삭제
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  await prisma.usageStats.deleteMany({
    where: {
      date: {
        lt: thirtyDaysAgo,
      },
    },
  });
}
```

---

## 🏗️ API 엔드포인트 설계

### Next.js API Routes 구조

```
/api
├── discord/
│   ├── commands.ts      # Discord 슬래시 명령어 처리
│   ├── interactions.ts  # 버튼, 선택 메뉴 등 상호작용
│   └── webhooks.ts      # Discord 웹훅 처리
├── ai/
│   ├── analyze.ts       # 학습 내용 분석
│   ├── question.ts      # 질문 생성
│   └── feedback.ts      # 피드백 생성
├── session/
│   ├── create.ts        # 세션 생성
│   ├── update.ts        # 세션 상태 업데이트
│   └── complete.ts      # 세션 완료 처리
└── admin/
    ├── stats.ts         # 사용 통계
    └── manage.ts        # 관리 기능
```

### API 엔드포인트 상세

```typescript
// /api/discord/commands.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, data } = req.body;

  switch (data.name) {
    case "study":
      return handleStudyCommand(req, res);
    case "topic":
      return handleTopicCommand(req, res);
    case "question":
      return handleQuestionCommand(req, res);
    default:
      return res.status(400).json({ error: "Unknown command" });
  }
}

// /api/ai/analyze.ts
interface AnalyzeRequest {
  topic: string;
  content: string;
  userId: string;
}

interface AnalyzeResponse {
  success: boolean;
  analysis: {
    accuracy: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    missingConcepts: string[];
    strengths: string[];
    suggestedFocus: string;
  };
  sessionId?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse>
) {
  const { topic, content, userId } = req.body as AnalyzeRequest;

  try {
    // 입력 검증
    if (!topic || !content || !userId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // AI 분석 수행
    const analysis = await analyzeContent(topic, content);

    // 세션 생성
    const session = await createStudySession({
      userId,
      topic,
      initialContent: content,
      estimatedLevel: analysis.level,
    });

    return res.status(200).json({
      success: true,
      analysis,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
```

---

## 🔧 환경 설정

### 환경 변수 (.env)

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/studywithme"

# Discord
DISCORD_TOKEN="your_discord_bot_token"
DISCORD_CLIENT_ID="your_discord_client_id"
DISCORD_GUILD_ID="your_discord_server_id"

# AI API
OPENAI_API_KEY="your_openai_api_key"
OPENAI_MODEL="gpt-4"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# Rate Limiting
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"

# Monitoring
SENTRY_DSN="your_sentry_dsn"
```

### 설정 관리 (config/index.ts)

```typescript
export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN!,
    clientId: process.env.DISCORD_CLIENT_ID!,
    guildId: process.env.DISCORD_GUILD_ID!,
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || "gpt-4",
    maxTokens: 2000,
    temperature: 0.7,
  },
  session: {
    timeoutMinutes: 30,
    maxConcurrent: 10,
    cleanupIntervalHours: 6,
  },
  rateLimit: {
    maxRequestsPerHour: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

// 환경변수 검증
export function validateConfig() {
  const required = [
    "DISCORD_TOKEN",
    "DISCORD_CLIENT_ID",
    "OPENAI_API_KEY",
    "DATABASE_URL",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
```

---

## 🚨 에러 핸들링 & 로깅

### 에러 타입 정의

```typescript
export enum ErrorCode {
  // 사용자 입력 오류
  INVALID_INPUT = "INVALID_INPUT",
  CONTENT_TOO_SHORT = "CONTENT_TOO_SHORT",
  OFF_TOPIC = "OFF_TOPIC",

  // 시스템 오류
  AI_API_TIMEOUT = "AI_API_TIMEOUT",
  DATABASE_ERROR = "DATABASE_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // 세션 오류
  SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_SESSION_STATE = "INVALID_SESSION_STATE",
}

export class StudyBotError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = "StudyBotError";
  }
}

export const ERROR_MESSAGES = {
  [ErrorCode.CONTENT_TOO_SHORT]: {
    internal: "User input too short",
    user: "조금 더 자세히 설명해주시면 더 좋은 질문을 드릴 수 있어요! 😊",
  },
  [ErrorCode.OFF_TOPIC]: {
    internal: "Content not related to frontend/JS",
    user: "앗, 다른 주제인 것 같아요. 프론트엔드/JavaScript 관련 내용으로 다시 시도해주세요!",
  },
  [ErrorCode.AI_API_TIMEOUT]: {
    internal: "OpenAI API timeout",
    user: "잠시 기술적인 문제가 있어요. 곧 해결될 예정이니 조금만 기다려주세요! 🔧",
  },
} as const;
```

### 로깅 시스템

```typescript
// utils/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// 사용 예시
logger.info("Session created", {
  sessionId: "abc123",
  userId: "user456",
  topic: "React Hooks",
});

logger.error("AI API failed", {
  error: error.message,
  sessionId: "abc123",
  retryCount: 1,
});
```

---

## 📱 Discord 봇 설정

### 봇 권한 설정

```typescript
// Discord Bot에 필요한 권한
const requiredPermissions = [
  "VIEW_CHANNEL",
  "SEND_MESSAGES",
  "EMBED_LINKS",
  "USE_SLASH_COMMANDS",
  "CREATE_PUBLIC_THREADS",
  "SEND_MESSAGES_IN_THREADS",
  "MANAGE_THREADS",
];

// 봇 초기화
import { Client, GatewayIntentBits, REST, Routes } from "discord.js";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 슬래시 명령어 등록
const commands = [
  {
    name: "study",
    description: "학습 내용을 인증하고 질문을 받아보세요",
    options: [
      {
        name: "topic",
        description: "학습 주제 (예: React Hooks)",
        type: 3, // STRING
        required: true,
        max_length: 50,
      },
      {
        name: "content",
        description: "학습한 내용을 자세히 설명해주세요",
        type: 3, // STRING
        required: true,
        max_length: 1000,
      },
    ],
  },
  {
    name: "topic",
    description: "AI가 추천하는 학습 주제를 받아보세요",
    options: [
      {
        name: "difficulty",
        description: "난이도 선택",
        type: 3, // STRING
        required: false,
        choices: [
          { name: "초급", value: "beginner" },
          { name: "중급", value: "intermediate" },
          { name: "고급", value: "advanced" },
        ],
      },
    ],
  },
  {
    name: "question",
    description: "자유롭게 질문하세요",
    options: [
      {
        name: "content",
        description: "궁금한 내용을 질문해주세요",
        type: 3, // STRING
        required: true,
        max_length: 500,
      },
    ],
  },
];
```

---

## 🚀 구현 단계별 가이드

### Phase 1: 기본 인프라 구축 (1주)

#### Day 1-2: 프로젝트 초기 설정

```bash
# 1. Next.js 프로젝트 생성
npx create-next-app@latest studywithme-bot --typescript --tailwind --app

# 2. 필요한 패키지 설치
npm install @prisma/client prisma discord.js openai winston redis ioredis
npm install -D @types/node

# 3. 환경 설정 파일 생성
touch .env.local
touch .env.example

# 4. Git 저장소 초기화
git init
git add .
git commit -m "Initial project setup"
```

#### Day 3-4: 데이터베이스 & Prisma 설정

```bash
# 1. Prisma 초기화
npx prisma init

# 2. 스키마 작성 (위의 schema.prisma 내용 적용)

# 3. 데이터베이스 마이그레이션
npx prisma generate
npx prisma db push

# 4. Prisma Studio로 확인
npx prisma studio
```

#### Day 5-7: Discord 봇 기본 설정

```typescript
// bot/index.ts - 봇 기본 구조
import { Client } from "discord.js";
import { config, validateConfig } from "../config";

validateConfig();

export const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

bot.once("ready", () => {
  console.log(`Logged in as ${bot.user?.tag}!`);
});

bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // 명령어 라우팅
  switch (interaction.commandName) {
    case "study":
      await handleStudyCommand(interaction);
      break;
    case "topic":
      await handleTopicCommand(interaction);
      break;
    case "question":
      await handleQuestionCommand(interaction);
      break;
  }
});

bot.login(config.discord.token);
```

### Phase 2: 핵심 기능 구현 (2주)

#### Week 1: AI 통합 & 기본 플로우

```typescript
// ai/openai.ts - AI 서비스 구현
import OpenAI from "openai";
import { config } from "../config";

const openai = new OpenAI({
  apiKey: config.ai.openaiApiKey,
});

export async function analyzeContent(topic: string, content: string) {
  const prompt = ANALYZE_CONTENT_PROMPT.replace("{topic}", topic).replace(
    "{content}",
    content
  );

  const response = await openai.chat.completions.create({
    model: config.ai.model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: config.ai.maxTokens,
    temperature: config.ai.temperature,
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function generateFirstQuestion(sessionData: SessionData) {
  // 위의 프롬프트 템플릿 사용
  // ...구현
}

export async function generateSecondQuestion(sessionData: SessionData) {
  // 위의 프롬프트 템플릿 사용
  // ...구현
}

export async function generateFinalFeedback(sessionData: SessionData) {
  // 위의 프롬프트 템플릿 사용
  // ...구현
}
```

#### Week 2: 세션 관리 & 상태 처리

```typescript
// services/sessionManager.ts
export class SessionManager {
  private timers = new Map<string, NodeJS.Timeout>();

  async createSession(data: CreateSessionData): Promise<StudySession> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

    const session = await prisma.studySession.create({
      data: {
        ...data,
        expiresAt,
        status: SessionStatus.WAITING_FIRST_ANSWER,
      },
    });

    // 30분 타임아웃 설정
    this.setAnswerTimeout(session.id);

    return session;
  }

  async updateSessionStatus(sessionId: string, status: SessionStatus) {
    return await prisma.studySession.update({
      where: { id: sessionId },
      data: { status, updatedAt: new Date() },
    });
  }

  private setAnswerTimeout(sessionId: string) {
    const timeoutId = setTimeout(async () => {
      await this.pauseSession(sessionId);
      this.timers.delete(sessionId);
    }, config.session.timeoutMinutes * 60 * 1000);

    this.timers.set(sessionId, timeoutId);
  }

  private async pauseSession(sessionId: string) {
    await this.updateSessionStatus(sessionId, SessionStatus.PAUSED);

    // Discord에 일시정지 메시지 전송
    await this.notifySessionPaused(sessionId);
  }

  clearTimer(sessionId: string) {
    const timerId = this.timers.get(sessionId);
    if (timerId) {
      clearTimeout(timerId);
      this.timers.delete(sessionId);
    }
  }
}

export const sessionManager = new SessionManager();
```

### Phase 3: Discord 명령어 핸들러 구현 (1주)

```typescript
// handlers/studyCommand.ts
import { ChatInputCommandInteraction } from "discord.js";
import { analyzeContent, generateFirstQuestion } from "../ai/openai";
import { sessionManager } from "../services/sessionManager";
import { createStudyEmbed } from "../utils/embeds";

export async function handleStudyCommand(
  interaction: ChatInputCommandInteraction
) {
  const topic = interaction.options.getString("topic", true);
  const content = interaction.options.getString("content", true);
  const userId = interaction.user.id;

  try {
    // 1. 입력 검증
    const validation = validateStudyInput(topic, content);
    if (!validation.isValid) {
      return await interaction.reply({
        content: validation.message,
        ephemeral: true,
      });
    }

    // 2. 진행 중인 세션 확인
    const activeSession = await checkActiveSession(userId);
    if (activeSession) {
      return await interaction.reply({
        content:
          "이미 진행 중인 학습 세션이 있습니다. 먼저 완료하거나 종료해주세요.",
        ephemeral: true,
      });
    }

    // 3. 즉시 응답 (30초 내 질문 예고)
    await interaction.reply({
      embeds: [createStudyEmbed(topic)],
      content:
        "📚 학습 내용을 접수했습니다! 30초 내에 첫 번째 질문을 드릴게요.",
    });

    // 4. AI 분석 수행
    const analysis = await analyzeContent(topic, content);

    // 5. 세션 생성
    const session = await sessionManager.createSession({
      userId,
      topic,
      initialContent: content,
      estimatedLevel: analysis.level,
    });

    // 6. 첫 번째 질문 생성 (비동기)
    setTimeout(async () => {
      try {
        const firstQuestion = await generateFirstQuestion({
          topic,
          content,
          analysis,
          estimatedLevel: analysis.level,
        });

        // 세션 업데이트
        await prisma.studySession.update({
          where: { id: session.id },
          data: { firstQuestion },
        });

        // Discord에 질문 전송
        await interaction.followUp({
          content: `🤔 **첫 번째 질문입니다:**\n\n${firstQuestion}\n\n답변을 기다리고 있어요! (30분 내에 답변해주세요)`,
        });
      } catch (error) {
        logger.error("First question generation failed", {
          sessionId: session.id,
          error: error.message,
        });

        await interaction.followUp({
          content: ERROR_MESSAGES[ErrorCode.AI_API_TIMEOUT].user,
        });
      }
    }, 30000); // 30초 후
  } catch (error) {
    logger.error("Study command error", {
      userId,
      topic,
      error: error.message,
    });

    if (interaction.replied) {
      await interaction.followUp({
        content:
          "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content:
          "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        ephemeral: true,
      });
    }
  }
}

function validateStudyInput(topic: string, content: string) {
  if (content.length < 10) {
    return {
      isValid: false,
      message: ERROR_MESSAGES[ErrorCode.CONTENT_TOO_SHORT].user,
    };
  }

  if (content.length > 1000) {
    return {
      isValid: false,
      message: "학습 내용이 너무 깁니다. 1000자 이내로 작성해주세요.",
    };
  }

  // 프론트엔드/JavaScript 관련 키워드 검증 (간단한 예시)
  const frontendKeywords = [
    "javascript",
    "react",
    "vue",
    "css",
    "html",
    "typescript",
    "node",
    "webpack",
    "babel",
    "npm",
    "yarn",
    "git",
  ];

  const hasRelevantKeyword = frontendKeywords.some(
    (keyword) =>
      topic.toLowerCase().includes(keyword) ||
      content.toLowerCase().includes(keyword)
  );

  if (!hasRelevantKeyword) {
    return {
      isValid: false,
      message: ERROR_MESSAGES[ErrorCode.OFF_TOPIC].user,
    };
  }

  return { isValid: true, message: "" };
}
```

### Phase 4: 메시지 응답 처리 (1주)

```typescript
// handlers/messageHandler.ts
import { Message } from "discord.js";
import { generateSecondQuestion, generateFinalFeedback } from "../ai/openai";

export async function handleUserMessage(message: Message) {
  const userId = message.author.id;
  const content = message.content;

  // 봇 자신의 메시지는 무시
  if (message.author.bot) return;

  // 활성 세션 확인
  const activeSession = await getActiveSession(userId);
  if (!activeSession) return;

  // 종료 명령어 처리
  if (
    content.toLowerCase().includes("종료") ||
    content.toLowerCase().includes("그만")
  ) {
    await handleSessionTermination(message, activeSession);
    return;
  }

  try {
    switch (activeSession.status) {
      case SessionStatus.WAITING_FIRST_ANSWER:
        await handleFirstAnswer(message, activeSession);
        break;

      case SessionStatus.WAITING_SECOND_ANSWER:
        await handleSecondAnswer(message, activeSession);
        break;

      default:
        // 예상치 못한 상태
        await message.reply(
          "현재 답변을 받을 수 있는 상태가 아닙니다. `/study` 명령어로 새로 시작해주세요."
        );
    }
  } catch (error) {
    logger.error("Message handling error", {
      userId,
      sessionId: activeSession.id,
      error: error.message,
    });

    await message.reply(
      "답변 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
}

async function handleFirstAnswer(message: Message, session: StudySession) {
  const answer = message.content;

  // 답변 검증
  if (answer.length < 5) {
    await message.reply("조금 더 자세한 답변을 부탁드려요! 🤔");
    return;
  }

  // 세션 상태 업데이트
  await sessionManager.updateSessionStatus(
    session.id,
    SessionStatus.WAITING_SECOND_ANSWER
  );
  await prisma.studySession.update({
    where: { id: session.id },
    data: { firstAnswer: answer },
  });

  // 타이머 재설정
  sessionManager.clearTimer(session.id);

  // 진행 메시지
  await message.reply(
    "답변 감사합니다! 2-3분 후에 두 번째 질문을 드릴게요. 🤖"
  );

  // 두 번째 질문 생성 (2-3분 후)
  setTimeout(async () => {
    try {
      const secondQuestion = await generateSecondQuestion({
        topic: session.topic,
        firstQuestion: session.firstQuestion!,
        firstAnswer: answer,
        estimatedLevel: session.estimatedLevel,
      });

      await prisma.studySession.update({
        where: { id: session.id },
        data: { secondQuestion },
      });

      await message.reply(
        `🎯 **두 번째 질문입니다:**\n\n${secondQuestion}\n\n마지막 답변이에요. 화이팅! 💪`
      );

      // 새로운 타이머 설정
      sessionManager.setAnswerTimeout(session.id);
    } catch (error) {
      logger.error("Second question generation failed", {
        sessionId: session.id,
        error: error.message,
      });

      await message.reply(ERROR_MESSAGES[ErrorCode.AI_API_TIMEOUT].user);
    }
  }, 150000); // 2.5분 후
}

async function handleSecondAnswer(message: Message, session: StudySession) {
  const answer = message.content;

  // 세션 상태 업데이트
  await sessionManager.updateSessionStatus(
    session.id,
    SessionStatus.GENERATING_FEEDBACK
  );
  await prisma.studySession.update({
    where: { id: session.id },
    data: { secondAnswer: answer },
  });

  // 타이머 정리
  sessionManager.clearTimer(session.id);

  // 피드백 생성 중 메시지
  await message.reply("모든 답변 완료! 5분 내에 종합 피드백을 드릴게요. 📊");

  // 종합 피드백 생성
  setTimeout(async () => {
    try {
      const feedback = await generateFinalFeedback({
        topic: session.topic,
        initialContent: session.initialContent,
        firstQuestion: session.firstQuestion!,
        firstAnswer: session.firstAnswer!,
        secondQuestion: session.secondQuestion!,
        secondAnswer: answer,
      });

      // 세션 완료 처리
      await prisma.studySession.update({
        where: { id: session.id },
        data: {
          finalFeedback: feedback,
          overallScore: feedback.overallScore,
          status: SessionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // 피드백 메시지 생성
      const feedbackEmbed = createFeedbackEmbed(feedback, session.topic);
      await message.reply({
        content: "🎉 **학습 세션 완료!**",
        embeds: [feedbackEmbed],
      });
    } catch (error) {
      logger.error("Feedback generation failed", {
        sessionId: session.id,
        error: error.message,
      });

      await message.reply(ERROR_MESSAGES[ErrorCode.AI_API_TIMEOUT].user);
    }
  }, 30000); // 30초 후 (테스트를 위해 5분 → 30초)
}
```

### Phase 5: 유틸리티 & 임베드 (3일)

```typescript
// utils/embeds.ts
import { EmbedBuilder } from "discord.js";

export function createStudyEmbed(topic: string) {
  return new EmbedBuilder()
    .setTitle("📚 학습 내용 접수완료!")
    .setDescription("30초 내에 첫 번째 질문을 드릴게요!")
    .addFields(
      { name: "📖 주제", value: topic, inline: true },
      { name: "⏰ 상태", value: "분석 중...", inline: true }
    )
    .setColor("#4A90E2")
    .setFooter({ text: '언제든 "종료"라고 말하면 세션을 끝낼 수 있어요' })
    .setTimestamp();
}

export function createFeedbackEmbed(feedback: any, topic: string) {
  const scoreEmoji = getScoreEmoji(feedback.overallScore);

  return new EmbedBuilder()
    .setTitle(`${scoreEmoji} 학습 세션 완료 - ${topic}`)
    .setDescription(feedback.summary)
    .addFields(
      {
        name: "📊 종합 점수",
        value: `${feedback.overallScore}/5.0 ${scoreEmoji}`,
        inline: true,
      },
      {
        name: "👍 잘한 점",
        value: feedback.strengths.map((s: string) => `• ${s}`).join("\n"),
        inline: false,
      },
      {
        name: "📈 개선할 점",
        value: feedback.improvements.map((i: string) => `• ${i}`).join("\n"),
        inline: false,
      },
      {
        name: "🎯 다음 추천 주제",
        value: feedback.nextTopics.map((t: string) => `• ${t}`).join("\n"),
        inline: false,
      }
    )
    .setColor(getScoreColor(feedback.overallScore))
    .setFooter({ text: feedback.encouragement })
    .setTimestamp();
}

function getScoreEmoji(score: number): string {
  if (score >= 4.5) return "🏆";
  if (score >= 4.0) return "🎉";
  if (score >= 3.5) return "👏";
  if (score >= 3.0) return "👍";
  if (score >= 2.5) return "📚";
  return "💪";
}

function getScoreColor(score: number): number {
  if (score >= 4.0) return 0x00ff00; // 초록색
  if (score >= 3.0) return 0xffff00; // 노란색
  if (score >= 2.0) return 0xffa500; // 주황색
  return 0xff0000; // 빨간색
}

export function createTopicEmbed(topics: string[], difficulty?: string) {
  const embed = new EmbedBuilder()
    .setTitle("💡 오늘의 추천 학습 주제")
    .setDescription("아래 주제 중 하나를 선택해서 공부해보세요!")
    .setColor("#9B59B6");

  if (difficulty) {
    embed.setAuthor({ name: `난이도: ${difficulty}` });
  }

  topics.forEach((topic, index) => {
    const emoji = ["🔥", "📚", "🚀"][index] || "💡";
    embed.addFields({
      name: `${emoji} 추천 주제 ${index + 1}`,
      value: topic,
      inline: false,
    });
  });

  return embed.setFooter({
    text: "/study 명령어로 학습을 시작해보세요!",
  });
}
```

### Phase 6: 배포 & 모니터링 (3일)

```typescript
// 배포 설정 (vercel.json)
{
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}

// 헬스체크 API (pages/api/health.ts)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 데이터베이스 연결 확인
    await prisma.$queryRaw`SELECT 1`;

    // AI API 연결 확인 (간단한 테스트)
    const testResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    });

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        ai: 'connected',
        discord: client.isReady() ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
}

// 모니터링 대시보드 (pages/api/admin/stats.ts)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 관리자 권한 확인
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const stats = await generateUsageStats();
  res.status(200).json(stats);
}

async function generateUsageStats() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalSessions,
    completedSessions,
    activeUsers,
    averageScore
  ] = await Promise.all([
    prisma.studySession.count({
      where: { createdAt: { gte: weekAgo } }
    }),
    prisma.studySession.count({
      where: {
        status: SessionStatus.COMPLETED,
        createdAt: { gte: weekAgo }
      }
    }),
    prisma.studySession.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { userId: true },
      distinct: ['userId']
    }),
    prisma.studySession.aggregate({
      where: {
        status: SessionStatus.COMPLETED,
        overallScore: { not: null },
        createdAt: { gte: weekAgo }
      },
      _avg: { overallScore: true }
    })
  ]);

  return {
    period: 'last_7_days',
    totalSessions,
    completedSessions,
    completionRate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(1) : 0,
    activeUsers: activeUsers.length,
    averageScore: averageScore._avg.overallScore?.toFixed(2) || 0,
    timestamp: new Date().toISOString()
  };
}
```

---

## 🧪 테스트 계획

### 단위 테스트

```typescript
// __tests__/ai/openai.test.ts
import { analyzeContent, generateFirstQuestion } from "../../ai/openai";

describe("AI Functions", () => {
  test("analyzeContent should return valid analysis", async () => {
    const result = await analyzeContent(
      "React Hooks",
      "useEffect는 컴포넌트가 렌더링될 때마다 실행되는 훅이다"
    );

    expect(result).toHaveProperty("accuracy");
    expect(result).toHaveProperty("level");
    expect(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).toContain(result.level);
  });

  test("generateFirstQuestion should create relevant question", async () => {
    const question = await generateFirstQuestion({
      topic: "JavaScript Closures",
      content: "클로저는 함수와 그 함수가 선언된 렉시컬 환경의 조합이다",
      estimatedLevel: "INTERMEDIATE",
    });

    expect(typeof question).toBe("string");
    expect(question.length).toBeGreaterThan(10);
  });
});
```

### 통합 테스트

```typescript
// __tests__/integration/discord-commands.test.ts
import { handleStudyCommand } from "../../handlers/studyCommand";

describe("Discord Commands Integration", () => {
  test("study command should create session and generate question", async () => {
    const mockInteraction = createMockInteraction({
      commandName: "study",
      options: {
        topic: "React State",
        content: "useState는 함수형 컴포넌트에서 상태를 관리하는 훅이다",
      },
    });

    await handleStudyCommand(mockInteraction);

    expect(mockInteraction.reply).toHaveBeenCalled();
    // 세션이 생성되었는지 확인
    // 30초 후 질문이 생성되는지 확인
  });
});
```

---

## 📋 런칭 체크리스트

### 배포 전 필수 확인사항

- [ ] 모든 환경변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] Discord 봇 권한 설정 완료
- [ ] AI API 키 및 할당량 확인
- [ ] 로깅 시스템 작동 확인
- [ ] 헬스체크 엔드포인트 정상 작동
- [ ] 에러 핸들링 테스트 완료

### 운영 모니터링 항목

- [ ] 일일 세션 생성/완료 수
- [ ] AI API 사용량 및 비용
- [ ] 응답 시간 모니터링
- [ ] 에러 발생률 추적
- [ ] 사용자 피드백 수집

### 사용자 가이드 준비

- [ ] 봇 사용법 가이드 작성
- [ ] 명령어 도움말 완성
- [ ] 문제 해결 FAQ 준비
- [ ] 피드백 수집 채널 구성

---

## 💰 최종 비용 분석

### 월간 운영 비용 상세

```
AI API (OpenAI GPT-4): $11.34
- 5명 × 30일 × 1.5세션 = 225세션/월
- 225세션 × 1,800토큰 = 405,000토큰/월
- 입력 토큰 (243,000): $7.29
- 출력 토큰 (162,000): $4.05

데이터베이스 (Vercel Postgres): $0 (Free Tier)
- 최대 256MB 저장공간
- 월 1GB 대역폭

호스팅 (Vercel): $0 (Free Tier)
- 월 100GB 대역폭
- 함수 실행 100시간

총 월간 비용: $11.34 (약 15,309원)
```

### 확장 시 비용 예측

```
사용자 10명으로 확장 시:
- AI API: $22.68/월 (약 30,618원)
- 여전히 Free Tier 범위 내

사용자 20명으로 확장 시:
- AI API: $45.36/월 (약 61,236원)
- Vercel Pro 필요: $20/월
- 총: $65.36/월 (약 88,236원)
```

---

## 🔮 향후 발전 방향

### 단기 개선사항 (3개월 내)

1. **사용자 맞춤화 강화**

   - 개인별 학습 패턴 분석
   - 약점 영역 집중 질문 생성
   - 성장 추이 시각화

2. **질문 품질 개선**

   - 실제 면접 질문 데이터베이스 구축
   - 난이도별 질문 풀 확장
   - 사용자 피드백 기반 질문 개선

3. **커뮤니티 기능 추가**
   - 우수 답변 공유 기능
   - 주간 학습 랭킹
   - 그룹 스터디 세션

### 중장기 발전 방향 (6개월-1년)

1. **기술 스택 확장**

   - 백엔드 개발 질문 추가
   - 시스템 설계 문제 제공
   - 코딩 테스트 연습 기능

2. **웹 대시보드 개발**

   - 개인 학습 통계 확인
   - 상세 피드백 리포트
   - 학습 계획 수립 도구

3. **오픈소스화**
   - GitHub 공개 저장소
   - 커뮤니티 기여 가이드
   - 플러그인 아키텍처 구축

---

_이 PRD는 실제 구현 과정에서 발견되는 이슈에 따라 지속적으로 업데이트됩니다. 모든 기능은 사용자 피드백을 바탕으로 개선될 예정입니다._
