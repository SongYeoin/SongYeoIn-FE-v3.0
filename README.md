# React 프로젝트 설정 가이드

## 버전 정보
- **Node.js**: v20.18.0
- **NPM**: 10.8.2

## 프로젝트 클론 후 프로젝트 위치에서 의존성 설치
npm install

---

## IntelliJ IDEA 설정

### 1. 프로젝트 열기
- `File` -> `Open` -> 클론한 'songyeoin-frontend' 폴더 선택

### 2. 플러그인 설치
- JavaScript and TypeScript
- ESLint
- Prettier

### 3. JavaScript 설정
- `File` -> `Settings` -> `Languages & Frameworks` -> `JavaScript`
    - JavaScript language version: ECMAScript 6+ 선택

### 4. 코드 스타일 설정
- `File` -> `Settings` -> `Editor` -> `Code Style` -> `JavaScript`
    - Tab size: 2
    - Indent: 2
    - Continuation indent: 2

### 5. 자동 임포트 설정
- `File` -> `Settings` -> `Editor` -> `General` -> `Auto Import`
    - Add unambiguous imports on the fly: 체크
    - Optimize imports on the fly: 체크

### 6. ESLint 설정
- `File` -> `Settings` -> `Languages & Frameworks` -> `JavaScript` -> `Code Quality Tools` -> `ESLint`
    - Automatic ESLint configuration: 체크
    - Run eslint --fix on save: 체크

### 7. tailwind 설정 (터미널)
- npm install -D tailwindcss postcss autoprefixer
- npx tailwindcss init -p
- 'tailwind.config.js' 파일이 생성
```js
// tailwind.config.js 📂

module.exports = {
  // 템플릿 파일의 경로 설정 👀
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
- Tailwind 지시문 CSS에 추가하기
```js
/* index.css 📂 */

@tailwind base;
@tailwind components;
@tailwind utilities;
```
- index.js 파일에 아래 코드 추가
```js
import './index.css';
```
- css 적용 안되면 캐시 지우기
```js
Remove-Item -Recurse -Force node_modules\.cache
npm start
```

## 프로젝트 실행 전 확인사항

### 1. package.json 버전 정보 확인
```json
{
  "engines": {
    "node": ">=20.18.0",
    "npm": ">=10.8.2"
  }
}
```
### 2. 프로젝트 실행
npm start
