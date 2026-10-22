-- CI/CD 학습 분야 (React와 동등). 시드 코드가 아니라 DB row만.

DELETE p FROM posts p
INNER JOIN categories c ON p.category_id = c.id
WHERE c.field_slug = 'react' AND c.slug = 'cicd';

DELETE FROM posts WHERE field_slug = 'cicd';
DELETE FROM categories WHERE field_slug = 'cicd';
DELETE FROM categories WHERE field_slug = 'react' AND slug = 'cicd';
DELETE FROM field_homes WHERE field_slug = 'cicd';
DELETE FROM study_services WHERE path = 'cicd';

SET @author := (SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1);

INSERT INTO study_services (id, name, short_name, description, path, builtin, created_at, updated_at)
VALUES (
  UUID(),
  'CI/CD',
  'CI',
  '빌드부터 서버 배포까지. Jenkins, GitHub Actions, Windows 운영.',
  'cicd',
  0,
  NOW(3),
  NOW(3)
);

INSERT INTO field_homes (field_slug, title, description, tagline, logo_data_url, created_at, updated_at)
VALUES (
  'cicd',
  'CI/CD',
  '코드가 모이면 빌드하고, 검증된 산출물을 서버에 올리는 흐름을 정리합니다. 왼쪽 목차에서 주제를 고르세요. React 학습과는 별도 분야입니다.',
  '머지부터 재시작까지',
  NULL,
  NOW(3),
  NOW(3)
);

SET @cat_concepts := UUID();
SET @cat_tools := UUID();
SET @cat_deploy := UUID();

INSERT INTO categories (id, slug, label, nav_label, description, field_slug, `order`, builtin, created_at, updated_at) VALUES
(@cat_concepts, 'concepts', '개념', '개념', 'CI와 CD, 파이프라인 단계', 'cicd', 0, 0, NOW(3), NOW(3)),
(@cat_tools, 'tools', '도구', '도구', 'Jenkins와 GitHub Actions', 'cicd', 1, 0, NOW(3), NOW(3)),
(@cat_deploy, 'deploy', '배포', '배포', 'Windows 서버와 시크릿', 'cicd', 2, 0, NOW(3), NOW(3));

INSERT INTO posts (id, slug, title, description, field_slug, difficulty, reading_time, body, published, `order`, category_id, author_id, created_at, updated_at) VALUES
(
  UUID(), 'basics', 'CI와 CD가 하는 일',
  '통합(CI)과 배포(CD)를 사람 기억에 맡기지 않는 이유. 빌드·테스트·릴리스가 한 파이프라인에 붙는 그림.',
  'cicd', 'basic', '9 min',
  '<h2>왜 자동화인가</h2><p><strong>CI (Continuous Integration)</strong>는 코드가 모일 때마다 자동으로 빌드하고 검사하는 일입니다. <strong>CD (Continuous Delivery/Deployment)</strong>는 그 결과물을 스테이징 또는 프로덕션까지 밀어 넣는 일입니다. 둘을 합쳐 CI/CD라고 부릅니다.</p><p>수동 배포의 전형적인 실패는 “내 PC에서는 됐는데”, “어떤 명령인지 기억이 안 나고”, “환경 변수 하나를 빠뜨리는” 형태입니다. 파이프라인은 그 절차를 저장소에 문서로 고정합니다. Jenkinsfile, GitHub Actions YAML이 그 문서입니다.</p><ol><li>개발자가 브랜치에 푸시하거나 main에 머지</li><li>CI 서버가 저장소를 체크아웃</li><li>의존성 설치 → 빌드 → (가능하면) 테스트</li><li>성공한 <strong>아티팩트</strong>를 배포 경로에 복사</li><li>프로세스 재시작 → 헬스 체크</li></ol><ul><li>CI가 없으면: 깨진 빌드가 main에 섞이고, 나중에야 발견</li><li>CD가 없으면: 빌드는 됐는데 서버에는 옛 JAR/옛 .next가 남음</li><li>둘 다 있으면: “머지 = 곧 사용자 화면”에 가까워짐</li></ul><aside data-callout data-variant="info" class="callout callout-info" data-label="참고"><p>Delivery는 “언제든 배포할 수 있는 상태”까지, Deployment는 “실제 서버에 자동으로 올리는 것”까지입니다. 이 사이트의 젠킨스 잡은 후자에 가깝습니다.</p></aside><aside data-callout data-variant="tip" class="callout callout-tip" data-label="팁"><p>React 앱도 예외가 아닙니다. Next.js는 <code>npm run build</code>가 타입·번들을 한 번에 검증합니다. 프론트 CI의 최소 단위가 바로 그 명령입니다.</p></aside><aside data-callout data-variant="warn" class="callout callout-warn" data-label="주의"><p>CI가 초록이라고 제품이 안전한 것은 아닙니다. 시크릿이 로그에 새거나, 헬스 체크 없이 프로세스를 죽이면 배포가 곧 장애입니다.</p></aside>',
  1, 0, @cat_concepts, @author, NOW(3), NOW(3)
),
(
  UUID(), 'pipeline', '파이프라인 단계',
  'Checkout → Build → Stop → Copy → Restart → Health check. 단계가 실패하면 다음으로 넘어가지 않게 만드는 것이 핵심.',
  'cicd', 'basic', '10 min',
  '<h2>실패가 멈추는 단계</h2><p><strong>파이프라인</strong>은 작업을 순서 있는 단계로 나눈 것입니다. 앞 단계가 실패하면 배포 단계가 실행되지 않아야 합니다. “빌드는 깨졌는데 예전 파일만 재시작” 같은 반쪽 배포를 막습니다.</p><ol><li>Checkout: git에서 커밋을 가져온다. 배포되는 내용은 항상 그 커밋</li><li>Install &amp; Build: lockfile 기준으로 의존성을 맞추고 산출물을 만든다</li><li>Stop: 실행 중인 프로세스가 파일을 잠그지 않게 잠시 멈춘다</li><li>Copy: 아티팩트(<code>.next</code>, <code>dist</code>, JAR)만 배포 디렉터리로</li><li>Restart: 프로세스 매니저가 새 파일로 기동</li><li>헬스 체크: HTTP 200이 나올 때까지 기다리고, 안 되면 파이프라인을 실패로</li></ol><pre class="code-fence" data-language="groovy" data-lang-label="Groovy" data-title="단계가 곧 문서"><code class="language-groovy">stages {\n  stage(''Build'') { /* npm run build / gradle build */ }\n  stage(''Copy'')  { /* 산출물만 배포 경로로 */ }\n  stage(''Restart'') {\n    /* 서비스 재시작 후 */\n    /* GET /api/health 가 200일 때만 success */\n  }\n}</code></pre><ul><li>소스 전체를 서버에서 다시 빌드하지 말고, CI가 만든 산출물을 복사하는 편이 재현 가능하다</li><li><code>node_modules</code>를 같이 복사하는 방식은 Windows·네이티브 바인딩에서 흔하다. 이상적이진 않지만 동일 머신 빌드면 동작한다</li><li>.env·비밀번호는 저장소에 두지 않는다. 서버 로컬 파일만 보존한 채 덮어쓰지 않기</li></ul><aside data-callout data-variant="tip" class="callout callout-tip" data-label="팁"><p>헬스 체크 URL은 앱이 실제로 쓰는 포트여야 합니다. 프론트와 API가 나뉘면 둘 다 확인하세요.</p></aside><aside data-callout data-variant="warn" class="callout callout-warn" data-label="주의"><p>Stop 없이 실행 중 JAR/.next를 덮어쓰면 파일 잠금으로 복사가 실패하거나, 프로세스는 옛 코드를 메모리에 유지합니다. 반드시 재시작이 한 세트입니다.</p></aside>',
  1, 1, @cat_concepts, @author, NOW(3), NOW(3)
),
(
  UUID(), 'jenkins', 'Jenkins로 붙이기',
  'Windows 서버에서 Jenkinsfile이 체크아웃·빌드·NSSM 재시작까지 이어지는 흐름.',
  'cicd', 'intermediate', '12 min',
  '<h2>저장소 안의 Jenkinsfile</h2><p><strong>Jenkins</strong>는 CI 서버입니다. 잡은 웹 UI에만 두지 말고 저장소 루트 <code>Jenkinsfile</code>에 둡니다. 파이프라인 변경도 코드 리뷰 대상이 됩니다.</p><p>학습 사이트(study.rjsgud.com) 잡은 Git을 pollSCM으로 수 분마다 보고, Node로 백엔드·프론트를 빌드한 뒤 <code>C:\\deploy\\blog</code>에 복사하고 NSSM 서비스 <code>blog-backend</code> / <code>blog-frontend</code>를 재시작합니다.</p><pre class="code-fence" data-language="groovy" data-lang-label="Groovy" data-title="블로그 잡의 골격"><code class="language-groovy">pipeline {\n  agent any\n  triggers { pollSCM(''H/5 * * * *'') }\n  environment {\n    DEPLOY_ROOT = ''C:\\\\deploy\\\\blog''\n    NEXT_TELEMETRY_DISABLED = ''1''\n  }\n  stages {\n    stage(''Checkout'') { steps { checkout scm } }\n    stage(''Backend Build'') { /* npm install &amp;&amp; npm run build */ }\n    stage(''Frontend Build'') { /* npm install &amp;&amp; npm run build */ }\n    stage(''Stop running app'') { /* nssm stop */ }\n    stage(''Copy to deploy'') { /* robocopy dist/.next */ }\n    stage(''Restart'') { /* nssm restart + health */ }\n  }\n}</code></pre><ul><li><code>checkout scm</code>: 이 잡이 추적하는 브랜치의 그 커밋</li><li>빌드 산출물 확인: <code>dist/main.js</code>, <code>.next</code> 없으면 실패</li><li>서버의 <code>backend/.env</code>는 git에서 오지 않는다. 없으면 잡을 실패시킨다</li></ul><aside data-callout data-variant="info" class="callout callout-info" data-label="참고"><p>포럼 백엔드는 Gradle bootJar 후 app.jar를 교체하는 같은 패턴입니다. 런타임이 Node냐 JVM이냐만 다릅니다.</p></aside><aside data-callout data-variant="tip" class="callout callout-tip" data-label="팁"><p>Jenkins Credentials로 비밀번호를 넣고, 잡 로그에 echo 하지 마세요. withCredentials로 환경 변수에만 잠시 노출하는 방식이 기본입니다.</p></aside><aside data-callout data-variant="warn" class="callout callout-warn" data-label="주의"><p>pollSCM은 간단하지만 푸시 즉시가 아닙니다. webhook을 열 수 있으면 머지 직후 배포가 됩니다. 방화벽 제약이 있는 Windows 홈 서버에서는 poll이 현실적인 타협입니다.</p></aside>',
  1, 0, @cat_tools, @author, NOW(3), NOW(3)
),
(
  UUID(), 'github-actions', 'GitHub Actions',
  '저장소에서 바로 도는 CI. 린트·빌드·PR 검사에 강하고, 실제 서버 배포는 runner나 SSH가 필요.',
  'cicd', 'intermediate', '10 min',
  '<h2>워크플로로 검사하기</h2><p><strong>GitHub Actions</strong>는 커밋/PR 이벤트에 YAML 워크플로를 실행합니다. 클라우드 러너는 리눅스가 기본이라, Windows + NSSM 배포와는 역할이 나뉩니다. 흔한 분업은 “Actions = 검사, Jenkins = 배포”입니다.</p><pre class="code-fence" data-language="yaml" data-lang-label="YAML" data-title="PR마다 Next.js 빌드 검증"><code class="language-yaml">name: CI\non:\n  pull_request:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n          cache: npm\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run build</code></pre><ul><li>PR CI: 깨진 타입·번들이 main에 못 들어오게</li><li>캐시: setup-node의 npm cache로 설치 시간 단축</li><li>Secrets: 저장소 Settings에 두고 secrets.NAME으로만 참조</li></ul><p>Windows 프로덕션에 직접 올리려면 (1) 그 PC를 self-hosted runner로 등록하거나, (2) SSH/WinRM으로 서버 스크립트를 호출하거나, (3) 지금처럼 Jenkins가 pull 하는 방식을 유지합니다.</p><aside data-callout data-variant="info" class="callout callout-info" data-label="참고"><p>Actions 로그는 공개 저장소면 바깥에서도 보입니다. 앱 비밀번호·DB 비번을 echo 하지 마세요.</p></aside><aside data-callout data-variant="tip" class="callout callout-tip" data-label="팁"><p>이미 Jenkins가 배포를 잘 하고 있다면 Actions를 억지로 대체할 필요는 없습니다. PR 빌드만이라도 Actions에 두면 서버에 올리기 전에 실패를 볼 수 있습니다.</p></aside><aside data-callout data-variant="warn" class="callout callout-warn" data-label="주의"><p>self-hosted runner는 그 기계의 권한을 가집니다. 공개 저장소에 붙이면 포크 PR이 러너에서 코드를 실행할 수 있으니, 비공개 저장소나 fork PR 제한을 먼저 보세요.</p></aside>',
  1, 1, @cat_tools, @author, NOW(3), NOW(3)
),
(
  UUID(), 'windows-deploy', 'Windows 서버 배포',
  'NSSM으로 Node/Java를 Windows 서비스로 두고, 배포 경로만 갈아끼운 뒤 재시작하는 운영 패턴.',
  'cicd', 'intermediate', '11 min',
  '<h2>프로세스 매니저와 배포 경로</h2><p>Windows에서 Node나 java -jar를 콘솔에 띄워 두면 로그아웃·재부팅에 꺼집니다. <strong>NSSM</strong>은 그 프로세스를 서비스로 등록해 자동 시작·사망 시 재기동을 맡깁니다. 블루/그린 무중단이라기보다 “항상 켜 두기”에 가깝습니다.</p><p>학습 블로그는 <code>C:\\deploy\\blog</code>가 런타임 루트입니다. Jenkins가 빌드한 <code>.next</code>와 <code>backend\\dist</code>를 여기로 복사하고 서비스를 재시작합니다. 포럼은 <code>C:\\deploy\\forum</code>에 JAR와 Next 산출물이 같은 식으로 놓입니다.</p><pre class="code-fence" data-language="bat" data-lang-label="Batch" data-title="NSSM이 실행 파일과 로그를 고정"><code class="language-bat">nssm set blog-backend Application "C:\\Program Files\\nodejs\\node.exe"\nnssm set blog-backend AppDirectory "C:\\deploy\\blog\\backend"\nnssm set blog-backend AppParameters dist\\main.js\nnssm set blog-backend AppStdout "C:\\deploy\\blog\\backend\\logs\\nssm-backend-stdout.log"\nnssm restart blog-backend</code></pre><ol><li>서비스 중지 — 파일 잠금 해제</li><li>산출물 복사 — 소스가 아니라 dist/.next/jar</li><li>서비스 시작</li><li>헬스 체크 — 예: GET http://127.0.0.1:4000/api/health</li></ol><ul><li>stdout/stderr를 파일로 남기지 않으면 메일 발송 실패·부팅 에러가 증발한다</li><li>관리자 권한 없이 nssm stop 하면 Access Denied — 배포 잡은 충분한 권한의 계정으로</li><li>Nginx는 별도 프로세스인 경우가 많다. 앱만 재시작했다고 리버스 프록시가 따라 재시작되진 않는다</li></ul><aside data-callout data-variant="info" class="callout callout-info" data-label="참고"><p>재부팅 후에도 살아 있으려면 서비스 StartType이 Automatic이어야 합니다. Nginx를 서비스로 안 올리면 OS 재시작 후 수동 기동이 필요합니다.</p></aside><aside data-callout data-variant="warn" class="callout callout-warn" data-label="주의"><p>실행 중인 java가 옛 JAR를 메모리에 들고 있으면, 디스크의 app.jar만 바꿔서는 새 설정이 안 먹습니다. 반드시 프로세스를 재시작하세요.</p></aside>',
  1, 0, @cat_deploy, @author, NOW(3), NOW(3)
),
(
  UUID(), 'secrets', '시크릿과 환경 변수',
  '앱 비밀번호, DB, JWT를 git에 넣지 않는 방법. 서버 파일·Jenkins Credentials·NEXT_PUBLIC 경계.',
  'cicd', 'advanced', '10 min',
  '<h2>어디에 비밀을 두나</h2><p><strong>시크릿</strong>은 저장소에 커밋하지 않습니다. CI는 빌드에 필요한 값만 잠시 주입하고, 런타임 비밀은 서버의 <code>.env</code>처럼 배포가 덮어쓰지 않는 파일에 둡니다.</p><pre class="code-fence" data-language="powershell" data-lang-label="PowerShell" data-title="배포가 .env를 지우지 않게"><code class="language-powershell"># 서버에만 존재하는 backend/.env (gitignored)\nDB_PASSWORD=...\nJWT_SECRET=...\n\n# Jenkins Copy 단계\nif (-not (Test-Path "C:\\deploy\\blog\\backend\\.env")) {\n  throw ".env missing — secrets stay on server, never from git"\n}</code></pre><ul><li>런타임 비밀: 서버 디스크의 .env, Windows 서비스 환경 변수</li><li>CI 전용: Jenkins Credentials, GitHub Actions secrets — 로그에 출력 금지</li><li><code>NEXT_PUBLIC_*</code>: 브라우저 번들에 들어간다. API 키·관리자 비번을 넣지 말 것</li></ul><p>Spring application.properties에 메일 앱 비밀번호를 박아 JAR에 넣으면, git 히스토리와 배포 산출물에 비밀이 복제됩니다. 가능하면 환경 변수로 읽고, 저장소에는 플레이스홀더만 남기세요.</p><aside data-callout data-variant="info" class="callout callout-info" data-label="참고"><p>프론트 빌드 시점에 박히는 값은 나중에 서버 .env만 바꿔서는 안 바뀝니다. Next는 <code>next build</code> 때 <code>NEXT_PUBLIC_*</code>를 굽습니다. 바꾸려면 다시 빌드·배포해야 합니다.</p></aside><aside data-callout data-variant="tip" class="callout callout-tip" data-label="팁"><p>이미 커밋된 비밀은 파일만 지워서는 부족합니다. 히스토리에 남습니다. 비밀번호는 폐기하고 새로 발급하세요.</p></aside><aside data-callout data-variant="warn" class="callout callout-warn" data-label="주의"><p>헬스 체크·에러 메시지에 연결 문자열을 그대로 실어 보내지 마세요. CI 로그와 브라우저 네트워크 탭이 곧 공개 채널입니다.</p></aside>',
  1, 1, @cat_deploy, @author, NOW(3), NOW(3)
);

SELECT 'cicd field' AS what, path, name FROM study_services WHERE path='cicd';
SELECT slug, label, field_slug FROM categories WHERE field_slug='cicd';
SELECT slug, title, field_slug FROM posts WHERE field_slug='cicd' ORDER BY `order`;
