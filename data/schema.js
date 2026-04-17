// data/schema.js — 표준 단원 스키마
window.STANDARD_UNIT_SCHEMA = {
    MIDDLE1: {
        track: 'MIDDLE', courseName: '중1 수학', unitType: 'middle_unit',
        units: [
            { key: 'M1-01', name: '소인수분해', order: 1, patterns: ['소인수분해', '최대공약수', '최소공배수'] },
            { key: 'M1-02', name: '정수와 유리수', order: 2, patterns: ['정수', '유리수', '절댓값'] },
            { key: 'M1-03', name: '문자와 식', order: 3, patterns: ['문자와 식', '일차식', '다항식'] },
            { key: 'M1-04', name: '일차방정식', order: 4, patterns: ['일차방정식'] },
            { key: 'M1-05', name: '좌표와 그래프', order: 5, patterns: ['좌표', '그래프', '정비례', '반비례'] },
            { key: 'M1-06', name: '기본 도형', order: 6, patterns: ['기본 도형', '점', '선', '면', '각'] },
            { key: 'M1-07', name: '평면도형과 입체도형', order: 7, patterns: ['평면도형', '입체도형', '다각형', '원'] },
            { key: 'M1-08', name: '통계', order: 8, patterns: ['줄기와 잎', '도수분포', '히스토그램', '상대도수'] }
        ]
    },
    MIDDLE2: {
        track: 'MIDDLE', courseName: '중2 수학', unitType: 'middle_unit',
        units: [
            { key: 'M2-01', name: '유리수와 순환소수', order: 1, patterns: ['유리수', '순환소수'] },
            { key: 'M2-02', name: '식의 계산', order: 2, patterns: ['식의 계산', '단항식', '다항식의 덧셈', '다항식의 뺄셈'] },
            { key: 'M2-03', name: '일차부등식', order: 3, patterns: ['일차부등식'] },
            { key: 'M2-04', name: '연립일차방정식', order: 4, patterns: ['연립일차방정식'] },
            { key: 'M2-05', name: '일차함수', order: 5, patterns: ['일차함수'] },
            { key: 'M2-06', name: '삼각형과 사각형의 성질', order: 6, patterns: ['삼각형의 성질', '사각형의 성질', '평행사변형'] },
            { key: 'M2-07', name: '닮음과 도형의 활용', order: 7, patterns: ['닮음', '닮은 도형'] },
            { key: 'M2-08', name: '확률', order: 8, patterns: ['확률'] }
        ]
    },
    MIDDLE3: {
        track: 'MIDDLE', courseName: '중3 수학', unitType: 'middle_unit',
        units: [
            { key: 'M3-01', name: '제곱근과 실수', order: 1, patterns: ['제곱근', '근호', '실수', '무리수'] },
            { key: 'M3-02', name: '다항식의 곱셈', order: 2, patterns: ['다항식의 곱셈'] },
            { key: 'M3-03', name: '인수분해', order: 3, patterns: ['인수분해'] },
            { key: 'M3-04', name: '이차방정식', order: 4, patterns: ['이차방정식'] },
            { key: 'M3-05', name: '이차함수', order: 5, patterns: ['이차함수'] },
            { key: 'M3-06', name: '피타고라스 정리', order: 6, patterns: ['피타고라스'] },
            { key: 'M3-07', name: '삼각비', order: 7, patterns: ['삼각비'] },
            { key: 'M3-08', name: '원의 성질', order: 8, patterns: ['원의 성질', '원주각', '접선과 현'] },
            { key: 'M3-09', name: '통계', order: 9, patterns: ['통계', '산점도', '상관관계'] }
        ]
    },
    H15_SANG: {
        track: 'H15', courseName: '수학(상)', unitType: 'small_unit',
        units: [
            { key: 'H15-SA-01', name: '다항식의 연산', order: 1, patterns: ['다항식의 연산', '다항식의 계산'] },
            { key: 'H15-SA-02', name: '항등식과 나머지정리', order: 2, patterns: ['항등식', '나머지정리'] },
            { key: 'H15-SA-03', name: '인수분해', order: 3, patterns: ['인수분해'] },
            { key: 'H15-SA-04', name: '복소수', order: 4, patterns: ['복소수'] },
            { key: 'H15-SA-05', name: '이차방정식', order: 5, patterns: ['이차방정식'] },
            { key: 'H15-SA-06', name: '이차방정식의 근과 계수', order: 6, patterns: ['근과 계수'] },
            { key: 'H15-SA-07', name: '여러 가지 방정식', order: 7, patterns: ['여러 가지 방정식', '삼차방정식'] },
            { key: 'H15-SA-08', name: '여러 가지 부등식', order: 8, patterns: ['부등식', '절댓값 부등식'] },
            { key: 'H15-SA-09', name: '평면좌표', order: 9, patterns: ['평면좌표'] },
            { key: 'H15-SA-10', name: '직선의 방정식', order: 10, patterns: ['직선의 방정식'] },
            { key: 'H15-SA-11', name: '원의 방정식', order: 11, patterns: ['원의 방정식'] },
            { key: 'H15-SA-12', name: '도형의 이동', order: 12, patterns: ['도형의 이동'] }
        ]
    },
    H15_HA: {
        track: 'H15', courseName: '수학(하)', unitType: 'small_unit',
        units: [
            { key: 'H15-SB-01', name: '집합', order: 1, patterns: ['집합'] },
            { key: 'H15-SB-02', name: '명제', order: 2, patterns: ['명제'] },
            { key: 'H15-SB-03', name: '함수', order: 3, patterns: ['함수'] },
            { key: 'H15-SB-04', name: '유리함수', order: 4, patterns: ['유리함수'] },
            { key: 'H15-SB-05', name: '무리함수', order: 5, patterns: ['무리함수'] },
            { key: 'H15-SB-06', name: '경우의 수', order: 6, patterns: ['경우의 수'] },
            { key: 'H15-SB-07', name: '순열', order: 7, patterns: ['순열'] },
            { key: 'H15-SB-08', name: '조합', order: 8, patterns: ['조합'] }
        ]
    },
    H15_MATH1: {
        track: 'H15', courseName: '수학Ⅰ', unitType: 'small_unit',
        units: [
            { key: 'H15-C-01', name: '지수의 뜻과 성질', order: 1, patterns: ['지수의 뜻', '거듭제곱근', '유리수 지수', '실수 지수'] },
            { key: 'H15-C-02', name: '로그의 뜻과 성질', order: 2, patterns: ['로그의 뜻', '로그의 성질', '상용로그'] },
            { key: 'H15-C-03', name: '지수함수', order: 3, patterns: ['지수함수'] },
            { key: 'H15-C-04', name: '로그함수', order: 4, patterns: ['로그함수'] },
            { key: 'H15-C-05', name: '삼각함수의 뜻과 값', order: 5, patterns: ['일반각', '호도법', '삼각함수의 정의', '삼각함수의 뜻'] },
            { key: 'H15-C-06', name: '삼각함수의 그래프', order: 6, patterns: ['삼각함수의 그래프'] },
            { key: 'H15-C-07', name: '삼각방정식과 삼각부등식', order: 7, patterns: ['삼각방정식', '삼각부등식'] },
            { key: 'H15-C-08', name: '등차수열', order: 8, patterns: ['등차수열'] },
            { key: 'H15-C-09', name: '등비수열', order: 9, patterns: ['등비수열'] },
            { key: 'H15-C-10', name: '수열의 합', order: 10, patterns: ['수열의 합'] },
            { key: 'H15-C-11', name: '수학적 귀납법', order: 11, patterns: ['수학적 귀납법'] }
        ]
    },
    H15_MATH2: {
        track: 'H15', courseName: '수학Ⅱ', unitType: 'small_unit',
        units: [
            { key: 'H15-D-01', name: '함수의 극한', order: 1, patterns: ['함수의 극한'] },
            { key: 'H15-D-02', name: '함수의 연속', order: 2, patterns: ['함수의 연속'] },
            { key: 'H15-D-03', name: '미분계수', order: 3, patterns: ['미분계수'] },
            { key: 'H15-D-04', name: '도함수', order: 4, patterns: ['도함수'] },
            { key: 'H15-D-05', name: '접선의 방정식', order: 5, patterns: ['접선의 방정식'] },
            { key: 'H15-D-06', name: '도함수의 활용', order: 6, patterns: ['도함수의 활용', '미분의 활용'] },
            { key: 'H15-D-07', name: '부정적분', order: 7, patterns: ['부정적분'] },
            { key: 'H15-D-08', name: '정적분', order: 8, patterns: ['정적분'] },
            { key: 'H15-D-09', name: '적분의 활용', order: 9, patterns: ['적분의 활용'] }
        ]
    },
    H15_CALC: {
        track: 'H15', courseName: '미적분', unitType: 'small_unit',
        units: [
            { key: 'H15-E-01', name: '수열의 극한', order: 1, patterns: ['수열의 극한'] },
            { key: 'H15-E-02', name: '급수', order: 2, patterns: ['급수'] },
            { key: 'H15-E-03', name: '지수함수의 미분', order: 3, patterns: ['지수함수의 미분'] },
            { key: 'H15-E-04', name: '로그함수의 미분', order: 4, patterns: ['로그함수의 미분'] },
            { key: 'H15-E-05', name: '삼각함수의 미분', order: 5, patterns: ['삼각함수의 미분'] },
            { key: 'H15-E-06', name: '여러 가지 미분법', order: 6, patterns: ['여러 가지 미분법'] },
            { key: 'H15-E-07', name: '도함수의 활용', order: 7, patterns: ['도함수의 활용', '미분의 활용'] },
            { key: 'H15-E-08', name: '여러 가지 적분법', order: 8, patterns: ['여러 가지 적분법'] },
            { key: 'H15-E-09', name: '정적분의 활용', order: 9, patterns: ['정적분의 활용'] }
        ]
    },
    H22_COMMON1: {
        track: 'H22', courseName: '공통수학1', unitType: 'small_unit',
        units: [
            { key: 'H22-A-01', name: '다항식의 연산', order: 1, patterns: ['다항식의 연산'] },
            { key: 'H22-A-02', name: '항등식과 나머지정리', order: 2, patterns: ['항등식', '나머지정리'] },
            { key: 'H22-A-03', name: '인수분해', order: 3, patterns: ['인수분해'] },
            { key: 'H22-A-04', name: '복소수', order: 4, patterns: ['복소수'] },
            { key: 'H22-A-05', name: '방정식', order: 5, patterns: ['방정식'] },
            { key: 'H22-A-06', name: '부등식', order: 6, patterns: ['부등식'] },
            { key: 'H22-A-07', name: '경우의 수', order: 7, patterns: ['경우의 수'] },
            { key: 'H22-A-08', name: '순열과 조합', order: 8, patterns: ['순열', '조합'] },
            { key: 'H22-A-09', name: '행렬', order: 9, patterns: ['행렬'] }
        ]
    },
    H22_COMMON2: {
        track: 'H22', courseName: '공통수학2', unitType: 'small_unit',
        units: [
            { key: 'H22-B-01', name: '평면좌표와 도형', order: 1, patterns: ['평면좌표', '도형의 방정식'] },
            { key: 'H22-B-02', name: '직선의 방정식', order: 2, patterns: ['직선의 방정식'] },
            { key: 'H22-B-03', name: '원의 방정식', order: 3, patterns: ['원의 방정식'] },
            { key: 'H22-B-04', name: '도형의 이동', order: 4, patterns: ['도형의 이동'] },
            { key: 'H22-B-05', name: '집합', order: 5, patterns: ['집합'] },
            { key: 'H22-B-06', name: '명제', order: 6, patterns: ['명제'] },
            { key: 'H22-B-07', name: '함수', order: 7, patterns: ['함수'] },
            { key: 'H22-B-08', name: '함수의 그래프 해석', order: 8, patterns: ['함수의 그래프'] }
        ]
    },
    H22_ALG: {
        track: 'H22', courseName: '대수', unitType: 'small_unit',
        units: [
            { key: 'H22-C-01', name: '지수의 뜻과 성질', order: 1, patterns: ['지수의 뜻', '거듭제곱근', '유리수 지수', '실수 지수'] },
            { key: 'H22-C-02', name: '지수법칙', order: 2, patterns: ['지수법칙', '지수의 계산'] },
            { key: 'H22-C-03', name: '지수함수', order: 3, patterns: ['지수함수'] },
            { key: 'H22-C-04', name: '로그의 뜻', order: 4, patterns: ['로그의 뜻', '상용로그'] },
            { key: 'H22-C-05', name: '로그의 성질', order: 5, patterns: ['로그의 성질', '로그의 계산'] },
            { key: 'H22-C-06', name: '로그함수', order: 6, patterns: ['로그함수'] },
            { key: 'H22-C-07', name: '지수·로그 방정식', order: 7, patterns: ['지수방정식', '로그방정식'] },
            { key: 'H22-C-08', name: '지수·로그 부등식', order: 8, patterns: ['지수부등식', '로그부등식'] },
            { key: 'H22-C-09', name: '삼각함수의 뜻과 값', order: 9, patterns: ['일반각', '호도법', '삼각함수의 정의'] },
            { key: 'H22-C-10', name: '삼각함수의 그래프', order: 10, patterns: ['삼각함수의 그래프'] },
            { key: 'H22-C-11', name: '삼각방정식과 삼각부등식', order: 11, patterns: ['삼각방정식', '삼각부등식'] },
            { key: 'H22-C-12', name: '수열의 뜻', order: 12, patterns: ['수열의 뜻'] },
            { key: 'H22-C-13', name: '등차수열', order: 13, patterns: ['등차수열'] },
            { key: 'H22-C-14', name: '등비수열', order: 14, patterns: ['등비수열'] },
            { key: 'H22-C-15', name: '수열의 합', order: 15, patterns: ['수열의 합'] },
            { key: 'H22-C-16', name: '수학적 귀납법', order: 16, patterns: ['수학적 귀납법'] }
        ]
    },
    H22_CALC1: {
        track: 'H22', courseName: '미적분Ⅰ', unitType: 'small_unit',
        units: [
            { key: 'H22-D-01', name: '함수의 극한', order: 1, patterns: ['함수의 극한'] },
            { key: 'H22-D-02', name: '함수의 연속', order: 2, patterns: ['함수의 연속'] },
            { key: 'H22-D-03', name: '미분계수', order: 3, patterns: ['미분계수'] },
            { key: 'H22-D-04', name: '도함수', order: 4, patterns: ['도함수'] },
            { key: 'H22-D-05', name: '접선의 방정식', order: 5, patterns: ['접선의 방정식'] },
            { key: 'H22-D-06', name: '미분의 활용', order: 6, patterns: ['미분의 활용'] },
            { key: 'H22-D-07', name: '부정적분의 기초', order: 7, patterns: ['부정적분'] },
            { key: 'H22-D-08', name: '정적분의 기초', order: 8, patterns: ['정적분'] }
        ]
    },
    H22_CALC2: {
        track: 'H22', courseName: '미적분Ⅱ', unitType: 'small_unit',
        units: [
            { key: 'H22-F-01', name: '수열의 극한과 급수', order: 1, patterns: ['수열의 극한', '급수'] },
            { key: 'H22-F-02', name: '여러 가지 미분법', order: 2, patterns: ['여러 가지 미분법'] },
            { key: 'H22-F-03', name: '도함수의 활용', order: 3, patterns: ['도함수의 활용'] },
            { key: 'H22-F-04', name: '여러 가지 적분법', order: 4, patterns: ['여러 가지 적분법'] },
            { key: 'H22-F-05', name: '정적분의 활용', order: 5, patterns: ['정적분의 활용'] }
        ]
    },
    STAT: {
        track: 'COMMON', courseName: '확률과 통계', unitType: 'small_unit',
        units: [
            { key: 'STAT-01', name: '경우의 수', order: 1, patterns: ['경우의 수'] },
            { key: 'STAT-02', name: '순열과 조합', order: 2, patterns: ['순열', '조합', '이항정리'] },
            { key: 'STAT-03', name: '확률', order: 3, patterns: ['확률'] },
            { key: 'STAT-04', name: '조건부확률', order: 4, patterns: ['조건부확률', '독립시행'] },
            { key: 'STAT-05', name: '확률분포', order: 5, patterns: ['확률분포', '정규분포', '이항분포'] },
            { key: 'STAT-06', name: '통계적 추정', order: 6, patterns: ['통계적 추정', '표본', '신뢰구간'] }
        ]
    },
    GEOM: {
        track: 'COMMON', courseName: '기하', unitType: 'small_unit',
        units: [
            { key: 'GEOM-01', name: '포물선', order: 1, patterns: ['포물선'] },
            { key: 'GEOM-02', name: '타원', order: 2, patterns: ['타원'] },
            { key: 'GEOM-03', name: '쌍곡선', order: 3, patterns: ['쌍곡선'] },
            { key: 'GEOM-04', name: '벡터의 연산', order: 4, patterns: ['벡터의 연산', '벡터'] },
            { key: 'GEOM-05', name: '벡터의 내적', order: 5, patterns: ['벡터의 내적'] },
            { key: 'GEOM-06', name: '공간도형', order: 6, patterns: ['공간도형'] },
            { key: 'GEOM-07', name: '공간좌표', order: 7, patterns: ['공간좌표'] }
        ]
    }
};

function normalizeText(value) {
    return String(value || '')
        .replace(/[ⅰⅠ]/g, 'i').replace(/[ⅱⅡ]/g, 'ii')
        .replace(/\s+/g, '').toLowerCase();
}

function detectCourseKey(grade, subject) {
    const g = String(grade || '');
    const s = normalizeText(subject || '');

    if (g === '중1') return 'MIDDLE1';
    if (g === '중2') return 'MIDDLE2';
    if (g === '중3') return 'MIDDLE3';
    if (s.includes('공통수학1')) return 'H22_COMMON1';
    if (s.includes('공통수학2')) return 'H22_COMMON2';
    if (s === '대수' || s.includes('대수')) return 'H22_ALG';
    if (s.includes('미적분ii')) return 'H22_CALC2';
    if (s.includes('미적분i')) return 'H22_CALC1';
    if (s.includes('수학ii') || s.includes('수학2')) return 'H15_MATH2';
    if (s.includes('수학i') || s.includes('수학1')) return 'H15_MATH1';
    if (s.includes('수학(상)') || s.includes('수학상')) return 'H15_SANG';
    if (s.includes('수학(하)') || s.includes('수학하')) return 'H15_HA';
    if (s.includes('확률과통계') || s.includes('확통')) return 'STAT';
    if (s.includes('기하')) return 'GEOM';
    if (s === '미적분' || s.includes('미적분')) return 'H15_CALC';
    return null;
}

function getCourseName(grade, subject) {
    const key = detectCourseKey(grade, subject);
    return key ? (window.STANDARD_UNIT_SCHEMA[key]?.courseName || '') : '';
}

window.AppSchema = { detectCourseKey, getCourseName, normalizeText };
