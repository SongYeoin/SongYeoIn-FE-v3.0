/**
 * JWT 디코딩 함수
 * @param {string} token - JWT 토큰
 * @returns {object|null} 디코딩된 JSON 페이로드
 */
export const parseJwt = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1]; // JWT의 Payload 추출
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Base64 URL 디코딩
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(jsonPayload); // JSON 형태로 변환
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};