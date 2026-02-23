/**
 * 정적 파일이 프로젝트 root(/)를 기준으로 호스팅된다고 가정하고,
 * 로컬/운영(GitHub Pages) 어디서나 동작하도록 상대 경로(형태: /path/to/file)를 반환하는 모듈
 */

/**
 * 단일 파일의 상대 경로를 반환합니다.
 * @param {string} path - 경로 (예: "mobile-img/Hero.jpg")
 * @returns {string} 로컬/배포 동일하게 사용 가능한 상대 경로 (예: "/mobile-img/Hero.jpg")
 */
export function getGithubImageUrl(path) {
    const cleanPath = String(path).replace(/^\/+/, "");
    // BASE_URL은 기본적으로 '/' 이며, vite.config의 base 지정 시 '/wedding/' 등이 됩니다.
    // 따라서 BASE_URL과 파일 경로를 안전하게 조합합니다.
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
    return `${baseUrl}/${cleanPath}`;
}

/**
 * 갤러리 이미지들의 상대 경로 배열을 반환합니다.
 * @returns {Array<string>} 이미지 경로 배열
 */
export function getGithubGalleryImages() {
    // TODO: 여기에 실제 갤러리 이미지 파일명들을 직접 입력해주세요.
    // 예: ['01.jpg', '02.jpg']
    const fileNames = [
        // '01.jpg',
        // '02.jpg',
    ];

    // mobile-img/gallery/ 경로를 붙여 배열로 반환
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

    return fileNames.map(fileName => {
        const cleanPath = `mobile-img/gallery/${fileName.replace(/^\/+/, '')}`;
        return `${baseUrl}/${cleanPath}`;
    });
}
