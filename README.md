# GARAM — Visual Designer Portfolio

React + Vite + Tailwind CSS로 제작한 비주얼 디자이너 포트폴리오 사이트입니다.
정적 프론트엔드와 Netlify Functions 백엔드로 구성되며, 모든 콘텐츠(프로젝트, 릴, 소개, 연락처)는
GitHub 저장소를 데이터 스토어(Git-as-CMS)로 사용해 관리합니다.

## 기술 스택

- **Frontend**: React 19, React Router, Vite, Tailwind CSS
- **Animation / UI**: motion, lucide-react
- **Backend**: Netlify Functions (서버리스)
- **Data Store**: GitHub 저장소 (Netlify Functions가 GitHub API로 읽기/쓰기)
- **Hosting**: Netlify (정적 프론트엔드 + Functions)

## 데이터 저장 방식

별도의 데이터베이스를 사용하지 않습니다. 프로젝트 데이터와 업로드한 이미지는
Netlify Functions를 통해 GitHub 저장소에 자동으로 커밋되어 저장됩니다.
저장소가 곧 콘텐츠 백업이며, 사이트는 이 데이터를 API로 불러와 렌더링합니다.

## 로컬 개발

**사전 요구사항:** Node.js, Netlify CLI (devDependency로 포함되어 있어 `npm install` 시 설치됨)

1. 의존성 설치:
   ```bash
   npm install
   ```
2. `.env.example`을 참고해 프로젝트 루트에 `.env` 파일을 만들고 필요한 환경 변수를 채웁니다.
   (`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `ADMIN_PASSWORD`, `AUTH_SECRET`)
3. 개발 서버 실행:
   ```bash
   npm run dev
   ```
   `npm run dev`는 `netlify dev`를 실행하여 Vite 프론트엔드와 Netlify Functions를 함께 구동합니다.

## 배포 (Netlify)

1. Netlify에서 이 GitHub 저장소를 연결합니다.
2. Netlify 대시보드의 **Site settings → Environment variables**에 `.env.example`의 변수들을 모두 등록합니다.
3. 빌드 명령은 `vite build`, 게시 디렉터리는 `dist`이며, Functions는 자동으로 배포됩니다.

## 관리자 패널 (Admin)

사이트의 **Admin** 링크를 통해 로그인하면(비밀번호: `ADMIN_PASSWORD`) 관리자 패널에 접근할 수 있습니다.
패널에서 다음을 관리할 수 있습니다.

- 프로젝트(Projects)
- 릴(Reel)
- 소개(About)
- 연락처(Contact)

관리자 패널에서 수정한 데이터와 업로드한 이미지는 연결된 GitHub 저장소에 자동으로 커밋됩니다.
