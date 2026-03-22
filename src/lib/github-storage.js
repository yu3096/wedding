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
        'gallery_02.jpg',
        'gallery_16.jpg',
        'gallery_06.jpg', 'gallery_07.jpg',
        'gallery_28.jpg', 'gallery_29.jpg',
        'gallery_08.jpg', 'gallery_09.jpg', 'gallery_10.jpg',
        'gallery_11.jpg', 'gallery_12.jpg', 'gallery_13.jpg', 'gallery_14.jpg', 'gallery_15.jpg',
        'gallery_20.jpg',
        'gallery_21.jpg', 'gallery_22.jpg', 'gallery_23.jpg', 'gallery_24.jpg', 'gallery_25.jpg',
        'gallery_26.jpg', 'gallery_17.jpg', 'gallery_18.jpg', 'gallery_19.jpg',
        'gallery_31.jpg', 'gallery_33.jpg', 'gallery_34.jpg', 'gallery_35.jpg', 'gallery_36.jpg',
        'gallery_03.jpg', 'gallery_04.jpg', 'gallery_05.jpg',
        'gallery_27.jpg',
        'gallery_30.jpg',
    ];

    // 모바일에 최적화된 gallery-sm 폴더 경로를 붙여 배열로 반환
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

    return fileNames.map(fileName => {
        const cleanPath = `gallery-sm/${fileName.replace(/^\/+/, '')}`;
        return encodeURI(`${baseUrl}/${cleanPath}`);
    });
}
