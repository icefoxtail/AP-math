function esc(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, m => map[m]);
}

function fmtExamType(semester, examType) {
    const s = semester ? `${semester}학기 ` : '';
    const t = examType === 'mid' ? '중간' : examType === 'final' ? '기말' : (examType || '');
    return (s + t).trim();
}

window.unifiedIndex = [];
let _selectedGrade = '';
let _pendingEngineItem = null;

document.addEventListener('DOMContentLoaded', async () => {
    restoreMixerDrafts();
    await initializeDataLayer();
    initGradeTabs();
    initAppNavigation();
    bindMixedOutputActions();
    bindClearCart();
    bindDraftPersist();
    bindSearchEvents();
    initQppModal();
    initMixer();
});

async function initializeDataLayer() {
    const grid = document.getElementById('exam-grid');
    if (grid) grid.innerHTML = '<div class="status-box loading">기출 데이터를 불러오는 중입니다...</div>';

    try {
        window.unifiedIndex = fetchEngineDB();

        const examEl = document.getElementById('stat-total-exam');
        const schoolEl = document.getElementById('stat-total-school');
        const yearEl = document.getElementById('stat-total-year');
        if (examEl) examEl.innerText = window.unifiedIndex.length;
        if (schoolEl) schoolEl.innerText = new Set(window.unifiedIndex.map(i => i.school).filter(Boolean)).size;
        if (yearEl) yearEl.innerText = new Set(window.unifiedIndex.map(i => i.year).filter(Boolean)).size;

        initFilterOptions();
        renderExamGrid();
        updateGlobalCartCount();
        renderMixerList();
    } catch (error) {
        console.error('데이터 초기화 실패:', error);
        if (grid) grid.innerHTML = '<div class="status-box error">데이터를 불러오지 못했습니다. 페이지를 새로고침해 주세요.</div>';
    }
}

function fetchEngineDB() {
    const rawExams = window.mainDB?.exams;
    if (!Array.isArray(rawExams)) return [];

    return rawExams.map(item => {
        const fileName = item.file || '';
        const safePath = fileName.startsWith('data/exams/') ? fileName : 'data/exams/' + fileName;
        const safeId = fileName.replace(/\.js$/, '') || `eng_${Math.random().toString(36).slice(2, 11)}`;
        const courseName = window.AppSchema ? window.AppSchema.getCourseName(item.grade, item.subject) : '';
        return {
            type: 'engine',
            sourceRef: safePath,
            sourceId: safeId,
            displayTitle: `${item.school || ''} ${item.grade || ''} ${item.subject || ''}`.trim() || '제목 없음',
            school: item.school || '',
            subject: item.subject || '',
            grade: item.grade || '',
            year: item.year ? String(item.year) : '',
            semester: item.semester ? String(item.semester) : '',
            examType: item.examType || '',
            courseName: courseName,
            sortKey: `${item.year}_${item.grade}_${item.school}_${item.subject}`
        };
    });
}

function initGradeTabs() {
    document.querySelectorAll('.gtab').forEach(tab => {
        tab.addEventListener('click', e => {
            document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            _selectedGrade = e.currentTarget.getAttribute('data-grade');
            renderExamGrid();
        });
    });
}

function getSearchCart() {
    try {
        const data = localStorage.getItem('searchCart') || sessionStorage.getItem('searchCart');
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

function saveSearchCart(cart) {
    const validIds = new Set(window.unifiedIndex.map(i => i.sourceId));
    const clean = Array.isArray(cart)
        ? cart.filter(item => item && item.sourceId && validIds.has(item.sourceId))
        : [];
    const cartString = JSON.stringify(clean);
    localStorage.setItem('searchCart', cartString);
    sessionStorage.setItem('searchCart', cartString);
    updateMixerActionState();
}

function updateGlobalCartCount() {
    const el = document.getElementById('global-cart-count');
    if (el) el.innerText = getSearchCart().length;
}

function updateMixerActionState() {
    const cart = getSearchCart();
    const engineCount = cart.filter(i => i && i.type === 'engine').length;
    const clearBtn = document.getElementById('btn-clear-cart');
    if (clearBtn) clearBtn.disabled = cart.length === 0;
    ['btn-generate-exam', 'btn-generate-solution', 'btn-generate-answer'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = engineCount === 0;
    });
}

function removeFromCart(sourceId) {
    const cart = getSearchCart().filter(item => item && item.sourceId !== sourceId);
    saveSearchCart(cart);
    updateGlobalCartCount();
    renderMixerList();
    if (document.getElementById('tab-search')?.classList.contains('active')) renderExamGrid();
}

function initFilterOptions() {
    const subjectSel = document.getElementById('filter-subject');
    const yearSel = document.getElementById('filter-year');
    const examtypeSel = document.getElementById('filter-examtype');
    if (!subjectSel || !yearSel || !examtypeSel) return;

    subjectSel.innerHTML = '<option value="">모든 과목</option>';
    yearSel.innerHTML = '<option value="">모든 연도</option>';
    examtypeSel.innerHTML = '<option value="">모든 시험</option>';

    const subjects = new Set(), years = new Set(), examtypes = new Set();
    window.unifiedIndex.forEach(item => {
        if (item.subject) subjects.add(item.subject);
        if (item.year) years.add(item.year);
        if (item.examType) examtypes.add(item.examType);
    });

    Array.from(subjects).sort().forEach(v => subjectSel.appendChild(new Option(v, v)));
    Array.from(years).sort((a, b) => b - a).forEach(v => yearSel.appendChild(new Option(v + '년', v)));
    Array.from(examtypes).sort().forEach(v => {
        const text = v === 'mid' ? '중간' : v === 'final' ? '기말' : v;
        examtypeSel.appendChild(new Option(text, v));
    });
}

function bindSearchEvents() {
    ['filter-subject', 'filter-year', 'filter-examtype'].forEach(id =>
        document.getElementById(id)?.addEventListener('change', renderExamGrid)
    );
    const kInp = document.getElementById('search-keyword');
    kInp?.addEventListener('input', renderExamGrid);
    kInp?.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    document.getElementById('btn-reset-filter')?.addEventListener('click', resetSearchFilters);
}

function resetSearchFilters() {
    ['filter-subject', 'filter-year', 'filter-examtype'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const k = document.getElementById('search-keyword');
    if (k) k.value = '';
    _selectedGrade = '';
    document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
    document.querySelector('.gtab[data-grade=""]')?.classList.add('active');
    renderExamGrid();
}

function renderExamGrid() {
    const grid = document.getElementById('exam-grid');
    const countSpan = document.getElementById('search-count');
    if (!grid) return;

    const fS = document.getElementById('filter-subject')?.value || '';
    const fY = document.getElementById('filter-year')?.value || '';
    const fET = document.getElementById('filter-examtype')?.value || '';
    const fK = document.getElementById('search-keyword')?.value.toLowerCase() || '';

    const filtered = window.unifiedIndex.filter(item =>
        (!_selectedGrade || item.grade === _selectedGrade) &&
        (!fS || item.subject === fS) &&
        (!fY || item.year === fY) &&
        (!fET || item.examType === fET) &&
        (!fK || item.displayTitle.toLowerCase().includes(fK) || item.school.toLowerCase().includes(fK))
    );

    if (countSpan) countSpan.textContent = `${filtered.length}건`;
    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="status-box empty">조건에 맞는 기출이 없습니다.</div>';
        return;
    }

    const cart = getSearchCart();
    filtered.forEach(item => {
        const inCart = cart.some(c => c.sourceId === item.sourceId);
        const examLabel = fmtExamType(item.semester, item.examType);
        const card = document.createElement('div');
        card.className = 'exam-card';
        card.innerHTML = `
            <div class="card-top"></div>
            <div class="card-body">
                <div class="card-grade-label">${esc(item.grade)} · ${esc(item.year)}년</div>
                <div class="card-school">${esc(item.school)}</div>
                <div class="card-sub">${esc(item.subject)}${examLabel ? ' · ' + esc(examLabel) : ''}</div>
                <div class="card-chips">
                    <span class="chip blue">엔진기출</span>
                    ${item.courseName ? `<span class="chip">${esc(item.courseName)}</span>` : ''}
                </div>
            </div>
            <div class="card-actions">
                <button class="action-btn" data-action="exam" data-id="${esc(item.sourceId)}">시험</button>
                <button class="action-btn" data-action="sol" data-id="${esc(item.sourceId)}">해설</button>
                <button class="action-btn" data-action="ans" data-id="${esc(item.sourceId)}">정답</button>
                <button class="action-btn cart-btn ${inCart ? 'in-cart' : ''}" data-action="cart" data-id="${esc(item.sourceId)}">${inCart ? '제거' : '담기'}</button>
            </div>
        `;
        grid.appendChild(card);
    });

    grid.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.currentTarget.getAttribute('data-id');
            const action = e.currentTarget.getAttribute('data-action');
            const item = window.unifiedIndex.find(i => i.sourceId === id);
            if (!item) return;

            if (action === 'cart') {
                const currentCart = getSearchCart();
                const idx = currentCart.findIndex(c => c.sourceId === id);
                if (idx > -1) currentCart.splice(idx, 1);
                else currentCart.push(item);
                saveSearchCart(currentCart);
                updateGlobalCartCount();
                const isAdded = currentCart.some(c => c.sourceId === id);
                e.currentTarget.textContent = isAdded ? '제거' : '담기';
                e.currentTarget.classList.toggle('in-cart', isAdded);
            } else {
                if (action === 'exam') {
                    showQppModal(item);
                } else {
                    window.open(`engine.html?mode=${action}&data=${encodeURIComponent(item.sourceRef)}&title=${encodeURIComponent(item.displayTitle)}&qpp=4&cols=2`, '_blank');
                }
            }
        });
    });
}

function renderMixerList() {
    const container = document.getElementById('mixer-list');
    const countSpan = document.getElementById('mixer-count');
    if (!container || !countSpan) return;

    const cart = getSearchCart();
    const engineItems = cart.filter(i => i && i.type === 'engine');

    if (cart.length === 0) {
        countSpan.textContent = '선택 없음';
        container.innerHTML = '<div class="status-box empty">검색 탭에서 문항을 담아주세요.</div>';
        updateMixerActionState();
        return;
    }

    countSpan.textContent = `${cart.length}건 선택 · 출제 가능 ${engineItems.length}건`;
    container.innerHTML = '';

    cart.forEach(item => {
        if (!item) return;
        const examLabel = fmtExamType(item.semester, item.examType);
        const row = document.createElement('div');
        row.className = 'mixer-item';
        row.innerHTML = `
            <div class="item-desc">
                <div class="item-main">${esc(item.school)} <span class="item-grade">${esc(item.grade)}</span></div>
                <div class="item-sub">${esc(item.subject)}${examLabel ? ' · ' + esc(examLabel) : ''}</div>
            </div>
            <button class="btn-remove" data-id="${esc(item.sourceId)}">✕</button>
        `;
        container.appendChild(row);
    });

    container.querySelectorAll('.btn-remove').forEach(btn =>
        btn.addEventListener('click', e => removeFromCart(e.currentTarget.getAttribute('data-id')))
    );
    updateMixerActionState();
}

function buildMixedOutputPayload() {
    const cart = getSearchCart();
    const uniqueEngines = [];
    const seenIds = new Set();
    cart.forEach(item => {
        if (item && item.type === 'engine' && !seenIds.has(item.sourceId)) {
            seenIds.add(item.sourceId);
            uniqueEngines.push(item);
        }
    });

    if (uniqueEngines.length === 0) { alert('출제할 엔진 문항이 없습니다.'); return null; }

    const title = document.getElementById('exam-title')?.value.trim() || '통합 기출 시험지';
    const qppVal = document.getElementById('select-qpp')?.value || '2';
    const colsMap = { '1': {qpp:2,cols:1}, '2': {qpp:4,cols:2}, '3': {qpp:6,cols:3} };
    const mapped = colsMap[qppVal] || {qpp:4,cols:2};
    
    const mixedQuestions = uniqueEngines.map(item => ({ sourceRef: item.sourceRef, sourceId: item.sourceId }));
    const mixedMeta = { title, count: mixedQuestions.length, qpp: mapped.qpp, cols: mapped.cols, generatedAt: new Date().toISOString() };

    const qData = JSON.stringify(mixedQuestions);
    const mData = JSON.stringify(mixedMeta);
    localStorage.setItem('mixedQuestions', qData); sessionStorage.setItem('mixedQuestions', qData);
    localStorage.setItem('mixedMeta', mData); sessionStorage.setItem('mixedMeta', mData);
    return { qpp: mapped.qpp, cols: mapped.cols };
}

function openMixedEngine(mode) {
    const payload = buildMixedOutputPayload();
    if (payload) window.open(`engine.html?mode=${mode}&data=mixed&qpp=${payload.qpp}&cols=${payload.cols}`, '_blank');
}

function bindMixedOutputActions() {
    document.getElementById('btn-generate-exam')?.addEventListener('click', () => openMixedEngine('exam'));
    document.getElementById('btn-generate-solution')?.addEventListener('click', () => openMixedEngine('sol'));
    document.getElementById('btn-generate-answer')?.addEventListener('click', () => openMixedEngine('ans'));
}

function bindClearCart() {
    document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
        if (!confirm('비우시겠습니까?')) return;
        saveSearchCart([]); updateGlobalCartCount(); renderMixerList();
        if (document.getElementById('tab-search')?.classList.contains('active')) renderExamGrid();
    });
}

function bindDraftPersist() {
    document.getElementById('exam-title')?.addEventListener('input', e => localStorage.setItem('mixerDraftTitle', e.target.value));
    document.getElementById('select-qpp')?.addEventListener('change', e => localStorage.setItem('mixerDraftQpp', e.target.value));
}

function restoreMixerDrafts() {
    const savedTitle = localStorage.getItem('mixerDraftTitle');
    const savedQpp = localStorage.getItem('mixerDraftQpp');
    const titleInp = document.getElementById('exam-title');
    const qppSel = document.getElementById('select-qpp');
    if (titleInp && savedTitle !== null) titleInp.value = savedTitle;
    if (qppSel && savedQpp !== null) qppSel.value = savedQpp;
    updateMixerActionState();
}

function initAppNavigation() {
    document.getElementById('btn-go-mixer')?.addEventListener('click', () => {
        switchTab('tab-mixer');
    });
    document.getElementById('btn-back-search')?.addEventListener('click', () => {
        switchTab('tab-search');
    });
}

function switchTab(targetId) {
    document.querySelectorAll('.app-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(targetId)?.classList.add('active');
    if (targetId === 'tab-mixer') mxRenderCart();
}

function showQppModal(item) {
    _pendingEngineItem = item;
    const modal = document.getElementById('qpp-modal');
    if (modal) modal.style.display = 'flex';
}

function initQppModal() {
    document.querySelectorAll('.qpp-opt').forEach(btn => {
        btn.addEventListener('click', e => {
            const qpp = parseInt(e.currentTarget.getAttribute('data-qpp'));
            document.getElementById('qpp-modal').style.display = 'none';
            const item = _pendingEngineItem;
            if (!item) return;
            window.open(`engine.html?mode=exam&data=${encodeURIComponent(item.sourceRef)}&title=${encodeURIComponent(item.displayTitle)}&qpp=${qpp}&cols=2`, '_blank');
        });
    });
    document.getElementById('qpp-cancel')?.addEventListener('click', () => {
        document.getElementById('qpp-modal').style.display = 'none';
    });
}

// ═══════════════════════════════════════════════
// 믹서 3패널 — 상태 변수
// ═══════════════════════════════════════════════
let mxDb = { exams: [] };
let mxCart = [];
let mxCurrentExamMeta = null;
let mxCurrentExamFile = null;
let mxCurrentQuestions = [];
let mxDisplayQuestions = [];
let mxSelectedExamFiles = new Set();
let mxMergedPool = [];
let mxLastSelectedPoolKey = '';
let mxSelectedPoolLoading = false;
let mxSelectedPoolRequestSeq = 0;
let mxLoadedExamQuestionMap = {};

// ═══════════════════════════════════════════════
// 믹서 초기화
// ═══════════════════════════════════════════════
function initMixer() {
    mxDb = { exams: window.mainDB?.exams || [] };
    mxPopulateFilters();
    mxRenderExamList();
    mxBindEvents();
    mxRenderCart();
}

function mxPopulateFilters() {
    const grades = [...new Set(mxDb.exams.map(e => e.grade).filter(Boolean))].sort();
    const years = [...new Set(mxDb.exams.map(e => e.year).filter(Boolean))].sort((a, b) => b - a);

    const gradeSel = document.getElementById('mx-grade');
    const yearSel = document.getElementById('mx-year');
    if (!gradeSel || !yearSel) return;

    grades.forEach(g => gradeSel.appendChild(new Option(g, g)));
    years.forEach(y => yearSel.appendChild(new Option(y + '년', y)));
}

function mxBindEvents() {
    document.getElementById('mx-search')?.addEventListener('input', mxRenderExamList);
    document.getElementById('mx-grade')?.addEventListener('change', mxRenderExamList);
    document.getElementById('mx-year')?.addEventListener('change', mxRenderExamList);
    document.getElementById('mx-exam')?.addEventListener('change', mxRenderExamList);
    document.getElementById('mx-btn-select-all')?.addEventListener('click', mxSelectFilteredExams);
    document.getElementById('mx-btn-deselect')?.addEventListener('click', mxClearSelectedExams);
    document.getElementById('mx-btn-load-pool')?.addEventListener('click', mxLoadSelectedExamPool);
    document.getElementById('mx-btn-load-pool2')?.addEventListener('click', mxAddAllDisplayToCart);
    document.getElementById('mx-source-mode')?.addEventListener('change', mxOnSourceModeChange);
    document.getElementById('mx-q-standard-filter')?.addEventListener('change', mxRenderQuestionList);
    document.getElementById('mx-btn-auto-replace')?.addEventListener('click', mxRunAutoReplace);
    document.getElementById('mx-btn-auto-append')?.addEventListener('click', mxRunAutoAppend);
    document.getElementById('mx-btn-exam')?.addEventListener('click', () => mxOpenMixed('exam'));
    document.getElementById('mx-btn-sol')?.addEventListener('click', () => mxOpenMixed('sol'));
    document.getElementById('mx-btn-ans')?.addEventListener('click', () => mxOpenMixed('ans'));
    document.getElementById('mx-btn-reset-cart')?.addEventListener('click', mxResetCart);
}

// ═══════════════════════════════════════════════
// 시험지 목록
// ═══════════════════════════════════════════════
function mxGetFilteredExams() {
    const keyword = (document.getElementById('mx-search')?.value || '').trim().toLowerCase();
    const grade = document.getElementById('mx-grade')?.value || '';
    const year = document.getElementById('mx-year')?.value || '';
    const exam = document.getElementById('mx-exam')?.value || '';

    return mxDb.exams.filter(ex => {
        const typeStr = ex.semester && ex.examType
            ? `${ex.semester}학기${ex.examType === 'mid' ? '중간' : ex.examType === 'final' ? '기말' : ex.examType}`
            : '';
        const searchText = [ex.school, ex.subject, ex.grade, String(ex.year || ''), typeStr].join(' ').toLowerCase();
        return (!keyword || searchText.includes(keyword)) &&
               (!grade || ex.grade === grade) &&
               (!year || String(ex.year) === String(year)) &&
               (!exam || typeStr === exam);
    });
}

function mxRenderExamList() {
    const container = document.getElementById('mx-exam-list');
    if (!container) return;
    const filtered = mxGetFilteredExams();
    container.innerHTML = '';

    if (!filtered.length) {
        container.innerHTML = '<div class="mx-empty">일치하는 시험지가 없습니다.</div>';
        return;
    }

    filtered.forEach(ex => {
        const isActive = mxCurrentExamFile === ex.file;
        const isSelected = mxSelectedExamFiles.has(ex.file);
        const label = mxBuildExamLabel(ex);

        const item = document.createElement('div');
        item.className = `mx-exam-item ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`;
        item.innerHTML = `
            <input class="mx-exam-check" type="checkbox" ${isSelected ? 'checked' : ''}>
            <div class="mx-exam-main">
                <div class="mx-exam-grade">${label}</div>
                <div class="mx-exam-title">${esc(ex.school || '')} ${esc(ex.subject || '')}</div>
                <div class="mx-exam-tags">
                    ${isActive ? '<span class="mx-exam-tag active">현재 미리보기</span>' : ''}
                    ${isSelected ? '<span class="mx-exam-tag selected">출제 source</span>' : ''}
                </div>
            </div>
        `;

        item.querySelector('.mx-exam-check').addEventListener('click', ev => {
            ev.stopPropagation();
            mxToggleExamSelection(ex);
        });
        item.addEventListener('click', () => mxLoadExamQuestions(ex));
        container.appendChild(item);
    });
}

function mxBuildExamLabel(ex) {
    const typeLabel = ex.examType === 'mid' ? '중간' : ex.examType === 'final' ? '기말' : (ex.examType || '');
    return `${ex.year || ''}년 ${ex.grade || ''} ${ex.semester || ''}학기 ${typeLabel}`.trim();
}

function mxToggleExamSelection(ex) {
    if (mxSelectedExamFiles.has(ex.file)) {
        mxSelectedExamFiles.delete(ex.file);
    } else {
        mxSelectedExamFiles.add(ex.file);
    }
    mxRenderExamList();
    mxUpdateSelectedExamUI();
}

function mxSelectFilteredExams() {
    mxGetFilteredExams().forEach(ex => mxSelectedExamFiles.add(ex.file));
    mxRenderExamList();
    mxUpdateSelectedExamUI();
}

function mxClearSelectedExams() {
    mxSelectedExamFiles = new Set();
    mxMergedPool = [];
    mxLastSelectedPoolKey = '';
    mxDisplayQuestions = mxCurrentQuestions;
    mxRenderExamList();
    mxRenderQuestionList();
    mxUpdateSelectedExamUI();
}

function mxUpdateSelectedExamUI() {
    const countEl = document.getElementById('selected-exam-count');
    const metaEl = document.getElementById('selected-exam-meta');
    if (countEl) countEl.innerText = mxSelectedExamFiles.size;
    if (metaEl) {
        if (mxSelectedPoolLoading) metaEl.innerText = 'pool 생성 중';
        else if (mxSelectedExamFiles.size > 0 && mxMergedPool.length > 0) metaEl.innerText = `pool ${mxMergedPool.length}문항`;
        else if (mxSelectedExamFiles.size > 0) metaEl.innerText = 'pool 미구성';
        else metaEl.innerText = '';
    }
}

// ═══════════════════════════════════════════════
// 문항 로드
// ═══════════════════════════════════════════════
async function mxLoadExamScriptData(examMeta) {
    return new Promise((resolve, reject) => {
        delete window.questionBank;
        const s = document.createElement('script');
        s.src = 'data/exams/' + examMeta.file + '?v=' + Date.now();
        s.onload = () => {
            try {
                const qb = window.questionBank;
                const loaded = Array.isArray(qb) ? qb.map(q => ({ ...q })) : [];
                const title = `${examMeta.school || ''} ${examMeta.subject || ''}`.trim();
                const annotated = mxAnnotateQuestions(examMeta, loaded).map((q, idx) => ({
                    ...q,
                    _sourceFile: examMeta.file,
                    _sourceTitle: title,
                    _sourceExamLabel: mxBuildExamLabel(examMeta),
                    _originalIndex: idx
                }));
                delete window.questionBank;
                s.remove();
                resolve(annotated);
            } catch (err) {
                delete window.questionBank;
                s.remove();
                reject(err);
            }
        };
        s.onerror = () => { delete window.questionBank; s.remove(); reject(new Error('로드 실패')); };
        document.body.appendChild(s);
    });
}

async function mxEnsureExamLoaded(examMeta) {
    if (!examMeta?.file) return [];
    if (mxLoadedExamQuestionMap[examMeta.file]) return mxLoadedExamQuestionMap[examMeta.file];
    const loaded = await mxLoadExamScriptData(examMeta);
    mxLoadedExamQuestionMap[examMeta.file] = loaded;
    return loaded;
}

async function mxLoadExamQuestions(examMeta) {
    mxCurrentExamMeta = { ...examMeta };
    mxCurrentExamFile = examMeta.file;
    mxCurrentQuestions = [];
    mxRenderExamList();

    const container = document.getElementById('mx-question-list');
    if (container) container.innerHTML = '<div class="mx-empty">로딩 중...</div>';

    try {
        mxCurrentQuestions = await mxEnsureExamLoaded(examMeta);
        if ((document.getElementById('mx-source-mode')?.value || 'activeExam') === 'activeExam') {
            mxDisplayQuestions = mxCurrentQuestions;
        }
        mxPopulateStandardUnitFilter();
        mxPopulateAutoRangeSelects();
        mxRenderQuestionList();
    } catch (err) {
        mxCurrentQuestions = [];
        mxDisplayQuestions = [];
        if (container) container.innerHTML = '<div class="mx-empty">문항을 불러오지 못했습니다.</div>';
    }
}

async function mxLoadSelectedExamPool() {
    const files = [...mxSelectedExamFiles].sort();
    if (!files.length) {
        alert('선택한 시험지가 없습니다.');
        return;
    }

    mxSelectedPoolLoading = true;
    mxMergedPool = [];
    mxUpdateSelectedExamUI();
    mxRenderAutoSummary(`선택 시험지 ${files.length}개 pool 생성 중...`);

    const results = await Promise.allSettled(
        files.map(async file => {
            const meta = mxDb.exams.find(e => e.file === file);
            if (!meta) return [];
            return await mxEnsureExamLoaded(meta);
        })
    );

    const pool = [];
    results.forEach(r => { if (r.status === 'fulfilled' && Array.isArray(r.value)) pool.push(...r.value); });
    mxMergedPool = mxDedupePool(pool);
    mxDisplayQuestions = mxMergedPool;
    mxSelectedPoolLoading = false;
    mxLastSelectedPoolKey = files.join('||');
    document.getElementById('mx-source-mode').value = 'selectedExams';
    mxPopulateStandardUnitFilter();
    mxPopulateAutoRangeSelects();
    mxRenderQuestionList();
    mxUpdateSelectedExamUI();
    mxRenderAutoSummary(`pool ${mxMergedPool.length}문항 로드 완료`);
}

function mxDedupePool(pool) {
    const seen = new Set();
    return pool.filter((q, idx) => {
        const key = `${q._sourceFile || ''}::${q._originalIndex ?? idx}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function mxOnSourceModeChange() {
    const mode = document.getElementById('mx-source-mode')?.value || 'activeExam';
    mxDisplayQuestions = mode === 'selectedExams' ? mxMergedPool : mxCurrentQuestions;
    mxPopulateStandardUnitFilter();
    mxPopulateAutoRangeSelects();
    mxRenderQuestionList();
}

// ═══════════════════════════════════════════════
// 단원 분류 (schema.js 활용)
// ═══════════════════════════════════════════════
function mxAnnotateQuestions(examMeta, questions) {
    return (questions || []).map((q, idx) => ({
        ...q,
        ...mxInferStandardUnit(examMeta, q),
        _sourceGrade: examMeta?.grade || '',
        _sourceSubject: examMeta?.subject || '',
        _runtimeIndex: idx
    }));
}

function mxInferStandardUnit(examMeta, question) {
    const schemaKey = window.AppSchema?.detectCourseKey(examMeta?.grade, examMeta?.subject);
    const schema = schemaKey ? window.STANDARD_UNIT_SCHEMA?.[schemaKey] : null;
    const rawCategory = String(question.category || '').trim();
    const rawContent = String(question.content || question.question || '').trim();

    if (!schema) {
        return {
            standardTrack: 'UNKNOWN',
            standardCourse: examMeta?.subject || examMeta?.grade || '미분류',
            standardUnitKey: `RAW-${rawCategory || 'unclassified'}`,
            standardUnitName: rawCategory || '미분류',
            standardUnitOrder: 999
        };
    }

    let best = null, bestScore = 0;
    schema.units.forEach((unit, idx) => {
        (unit.patterns || []).forEach(pattern => {
            const pn = pattern.replace(/\s+/g, '').toLowerCase();
            const cn = rawCategory.replace(/\s+/g, '').toLowerCase();
            const qn = rawContent.replace(/\s+/g, '').toLowerCase().slice(0, 100);
            const sc = cn.includes(pn) ? 1000 + pn.length : qn.includes(pn) ? 400 + pn.length : 0;
            if (sc > bestScore) { bestScore = sc; best = { unit, idx }; }
        });
    });

    if (!best) {
        return {
            standardTrack: schema.track,
            standardCourse: schema.courseName,
            standardUnitKey: `UNCLASSIFIED-${schema.courseName}`,
            standardUnitName: rawCategory || '미분류',
            standardUnitOrder: 999
        };
    }

    return {
        standardTrack: schema.track,
        standardCourse: schema.courseName,
        standardUnitKey: best.unit.key,
        standardUnitName: best.unit.name,
        standardUnitOrder: best.unit.order ?? (best.idx + 1)
    };
}

function mxGetPoolUnits(pool) {
    const map = {};
    pool.forEach(q => {
        if (!q.standardUnitKey || q.standardUnitKey.startsWith('UNCLASSIFIED') || q.standardUnitKey.startsWith('RAW')) return;
        if (!map[q.standardUnitKey]) map[q.standardUnitKey] = { key: q.standardUnitKey, name: q.standardUnitName, order: q.standardUnitOrder };
    });
    return Object.values(map).sort((a, b) => a.order - b.order);
}

function mxPopulateStandardUnitFilter() {
    const sel = document.getElementById('mx-q-standard-filter');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">표준단원 전체</option>';
    mxGetPoolUnits(mxDisplayQuestions).forEach(u => sel.appendChild(new Option(u.name, u.key)));
    sel.value = current;
}

function mxPopulateAutoRangeSelects() {
    const units = mxGetPoolUnits(mxDisplayQuestions);
    ['mx-auto-start-unit', 'mx-auto-end-unit'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const cur = sel.value;
        sel.innerHTML = id.includes('start') ? '<option value="">시작 단원</option>' : '<option value="">끝 단원</option>';
        units.forEach(u => sel.appendChild(new Option(u.name, u.key)));
        if (cur) sel.value = cur;
    });
}

// ═══════════════════════════════════════════════
// 문항 목록 렌더링
// ═══════════════════════════════════════════════
function mxRenderQuestionList() {
    const container = document.getElementById('mx-question-list');
    const countEl = document.getElementById('mx-q-count-info');
    if (!container) return;

    const filterKey = document.getElementById('mx-q-standard-filter')?.value || '';
    const filtered = filterKey
        ? mxDisplayQuestions.filter(q => q.standardUnitKey === filterKey)
        : mxDisplayQuestions;

    if (countEl) countEl.innerText = `${filtered.length}문항`;

    if (!filtered.length) {
        container.innerHTML = '<div class="mx-empty">시험지를 선택해주세요.</div>';
        return;
    }

    // 단원별 그룹
    const groups = {};
    filtered.forEach((q, idx) => {
        const unitName = q.standardUnitName || q.category || '미분류';
        if (!groups[unitName]) groups[unitName] = [];
        groups[unitName].push({ q, idx });
    });

    container.innerHTML = '';
    Object.entries(groups).forEach(([unitName, items]) => {
        const title = document.createElement('div');
        title.className = 'mx-q-group-title';
        title.textContent = `${unitName} (${items.length}문항)`;
        container.appendChild(title);

        items.forEach(({ q, idx }) => {
            const isAdded = mxIsQuestionAdded(q, idx);
            const item = document.createElement('div');
            item.className = 'mx-q-item';

            const circled = ['①','②','③','④','⑤'];
            const hasChoices = Array.isArray(q.choices) && q.choices.length > 0 && q.choices[0] !== '주관식';
            const choicesHTML = hasChoices
                ? `<div class="mx-q-choices">${q.choices.map((c, ci) => {
                    const text = typeof c === 'object' ? (c.text || c.content || '') : String(c);
                    return `<div class="q-choice">${circled[ci] || (ci+1)+')'} ${text}</div>`;
                }).join('')}</div>`
                : '';

            item.innerHTML = `
                <div class="mx-q-meta">
                    <span>${q._sourceTitle || ''}</span>
                    ${q.standardUnitName ? `<span>${q.standardUnitName}</span>` : ''}
                    ${q.level ? `<span>난이도: ${q.level}</span>` : ''}
                </div>
                <div class="mx-q-body">${q.content || q.question || ''}</div>
                ${choicesHTML}
            `;

            const btn = document.createElement('button');
            btn.className = `mx-btn-add ${isAdded ? 'added' : ''}`;
            btn.textContent = isAdded ? '담겼음' : '+ 담기';
            btn.disabled = isAdded;
            btn.addEventListener('click', () => mxAddQuestionFromPool(q, idx));
            item.appendChild(btn);
            container.appendChild(item);
        });
    });

    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([container]);
}

function mxIsQuestionAdded(q, idx) {
    const key = `${q._sourceFile || ''}::${q._originalIndex ?? idx}`;
    return mxCart.some((c, ci) => `${c._sourceFile || ''}::${c._originalIndex ?? ci}` === key);
}

function mxAddQuestionFromPool(q, idx) {
    if (mxIsQuestionAdded(q, idx)) return;
    mxCart.push({ ...q, _pickedMode: 'manual' });
    mxRenderCart();
    mxRenderQuestionList();
}

function mxAddAllDisplayToCart() {
    const filterKey = document.getElementById('mx-q-standard-filter')?.value || '';
    const filtered = filterKey ? mxDisplayQuestions.filter(q => q.standardUnitKey === filterKey) : mxDisplayQuestions;
    filtered.forEach((q, idx) => {
        if (!mxIsQuestionAdded(q, idx)) mxCart.push({ ...q, _pickedMode: 'manual' });
    });
    mxRenderCart();
    mxRenderQuestionList();
}

// ═══════════════════════════════════════════════
// 자동 추출
// ═══════════════════════════════════════════════
function mxRunAutoReplace() {
    const targetCount = parseInt(document.getElementById('mx-auto-count')?.value || '24', 10);
    try {
        const result = mxBuildAutoSelection(targetCount, false);
        mxCart = result.picked;
        mxRenderCart();
        mxRenderQuestionList();
        mxRenderAutoSummary(`자동 교체 완료 · ${targetCount}문항 · ${result.summaryRows.join(' · ')}`);
    } catch (err) { alert(err.message); }
}

function mxRunAutoAppend() {
    const targetCount = parseInt(document.getElementById('mx-auto-count')?.value || '24', 10);
    try {
        const result = mxBuildAutoSelection(targetCount, true);
        mxCart.push(...result.picked);
        mxRenderCart();
        mxRenderQuestionList();
        mxRenderAutoSummary(`자동 추가 완료 · ${result.picked.length}문항 추가 · 총 ${mxCart.length}문항`);
    } catch (err) { alert(err.message); }
}

function mxBuildAutoSelection(targetCount, appendMode) {
    if (!mxDisplayQuestions.length) throw new Error('먼저 문항 source를 불러와 주세요.');

    const startKey = document.getElementById('mx-auto-start-unit')?.value || '';
    const endKey = document.getElementById('mx-auto-end-unit')?.value || '';
    const levelMode = document.getElementById('mx-auto-level')?.value || 'all';

    if (!startKey || !endKey) throw new Error('시작 단원과 끝 단원을 모두 선택해주세요.');

    const units = mxGetPoolUnits(mxDisplayQuestions);
    const sIdx = units.findIndex(u => u.key === startKey);
    const eIdx = units.findIndex(u => u.key === endKey);
    if (sIdx === -1 || eIdx === -1) throw new Error('선택한 단원 범위를 확인해주세요.');

    const selectedUnits = units.slice(Math.min(sIdx, eIdx), Math.max(sIdx, eIdx) + 1);
    const desiredCount = appendMode ? targetCount - mxCart.length : targetCount;
    if (desiredCount <= 0) throw new Error(`이미 ${mxCart.length}문항이 담겨 있습니다.`);

    const existingKeys = new Set(appendMode ? mxCart.map((c, i) => `${c._sourceFile || ''}::${c._originalIndex ?? i}`) : []);
    const selectedSet = new Set(selectedUnits.map(u => u.key));

    let pool = mxDisplayQuestions.filter((q, idx) => {
        const key = `${q._sourceFile || ''}::${q._originalIndex ?? idx}`;
        if (!selectedSet.has(q.standardUnitKey)) return false;
        if (existingKeys.has(key)) return false;
        if (levelMode !== 'all' && levelMode !== 'balanced') {
            const lvl = String(q.level || '').includes('하') ? '하' : String(q.level || '').includes('상') ? '상' : String(q.level || '').includes('중') ? '중' : '기타';
            if (lvl !== levelMode) return false;
        }
        return true;
    });

    if (pool.length < desiredCount) throw new Error(`자동추출 가능 문항이 부족합니다. (${pool.length}문항 / 필요 ${desiredCount}문항)`);

    // 단원별 균등 배분
    const poolByUnit = {};
    selectedUnits.forEach(u => { poolByUnit[u.key] = []; });
    pool.forEach(q => { if (poolByUnit[q.standardUnitKey]) poolByUnit[q.standardUnitKey].push(q); });

    const counts = {};
    selectedUnits.forEach(u => { counts[u.key] = 0; });
    let remaining = desiredCount;
    const availUnits = selectedUnits.filter(u => poolByUnit[u.key]?.length > 0);
    availUnits.forEach(u => { if (remaining > 0) { counts[u.key] = 1; remaining--; } });
    while (remaining > 0) {
        const cands = availUnits.filter(u => counts[u.key] < poolByUnit[u.key].length);
        if (!cands.length) break;
        cands.sort((a, b) => counts[a.key] - counts[b.key]);
        counts[cands[0].key]++;
        remaining--;
    }

    const picked = [];
    selectedUnits.forEach(u => {
        const n = counts[u.key] || 0;
        if (!n) return;
        const shuffled = [...poolByUnit[u.key]].sort(() => Math.random() - 0.5);
        shuffled.slice(0, n).forEach(q => picked.push({ ...q, _pickedMode: 'auto' }));
    });

    const summaryRows = selectedUnits.filter(u => counts[u.key] > 0).map(u => `${u.name} ${counts[u.key]}문항`);
    return { picked, summaryRows };
}

function mxRenderAutoSummary(text) {
    const box = document.getElementById('mx-auto-summary');
    if (box) box.innerHTML = text;
}

// ═══════════════════════════════════════════════
// 바구니
// ═══════════════════════════════════════════════
function mxRenderCart() {
    const container = document.getElementById('mx-cart-list');
    const totalEl = document.getElementById('mx-cart-total');
    const totalTopEl = document.getElementById('mx-cart-total-top');
    const noteEl = document.getElementById('mx-cart-meta-note');

    if (totalEl) totalEl.innerText = mxCart.length;
    if (totalTopEl) totalTopEl.innerText = `${mxCart.length}문항`;
    if (noteEl) {
        const auto = mxCart.filter(q => q._pickedMode === 'auto').length;
        noteEl.innerText = `수동 ${mxCart.length - auto}문항 · 자동 ${auto}문항`;
    }
    if (!container) return;

    if (!mxCart.length) {
        container.innerHTML = '<div class="mx-empty">담긴 문항이 없습니다.</div>';
        return;
    }

    container.innerHTML = '';
    mxCart.forEach((c, idx) => {
        const row = document.createElement('div');
        row.className = 'mx-cart-item';
        row.innerHTML = `
            <div class="mx-cart-info">
                <div class="mx-cart-title">${c._sourceTitle || '출처 미상'} [${(c._originalIndex ?? idx) + 1}번] · ${c.standardUnitName || c.category || '미분류'} · ${c._pickedMode === 'auto' ? '자동' : '수동'}</div>
                <div class="mx-cart-body">${c.content || c.question || ''}</div>
            </div>
        `;

        const ctrl = document.createElement('div');
        ctrl.className = 'mx-cart-ctrl';
        const up = document.createElement('button');
        up.className = 'mx-btn-small'; up.textContent = '↑';
        up.addEventListener('click', () => { if (idx > 0) { [mxCart[idx-1], mxCart[idx]] = [mxCart[idx], mxCart[idx-1]]; mxRenderCart(); } });
        const down = document.createElement('button');
        down.className = 'mx-btn-small'; down.textContent = '↓';
        down.addEventListener('click', () => { if (idx < mxCart.length-1) { [mxCart[idx+1], mxCart[idx]] = [mxCart[idx], mxCart[idx+1]]; mxRenderCart(); } });
        const remove = document.createElement('button');
        remove.className = 'mx-btn-small remove'; remove.textContent = '✕';
        remove.addEventListener('click', () => { mxCart.splice(idx, 1); mxRenderCart(); mxRenderQuestionList(); });
        ctrl.appendChild(up); ctrl.appendChild(down); ctrl.appendChild(remove);
        row.appendChild(ctrl);
        container.appendChild(row);
    });

    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([container]);
}

function mxResetCart() {
    if (!mxCart.length) return;
    if (!confirm('선택한 문항을 모두 비우시겠습니까?')) return;
    mxCart = [];
    mxRenderCart();
    mxRenderQuestionList();
    mxRenderAutoSummary('자동출제 대기 중');
}

// ═══════════════════════════════════════════════
// 출력
// ═══════════════════════════════════════════════
function mxOpenMixed(mode) {
    if (!mxCart.length) { alert('문항을 담아주세요.'); return; }

    const qpp = parseInt(document.getElementById('mx-print-qpp')?.value || '4', 10);
    const titleMode = document.getElementById('mx-print-title-mode')?.value || 'auto';
    const customTitle = (document.getElementById('mx-custom-title')?.value || '').trim();

    let title = customTitle;
    if (!title) {
        if (titleMode === 'daily') title = `일일평가 (${mxCart.length}문항)`;
        else if (titleMode === 'weekly') title = `주간평가 (${mxCart.length}문항)`;
        else if (titleMode === 'exam') title = `시험지 (${mxCart.length}문항)`;
        else title = `믹서 출제 (${mxCart.length}문항)`;
    }

    const payload = JSON.stringify(mxCart);
    const meta = JSON.stringify({ title, count: mxCart.length, qpp, cols: 2, generatedAt: new Date().toISOString() });

    localStorage.setItem('mixedQuestions', payload);
    localStorage.setItem('mixedMeta', meta);
    sessionStorage.setItem('mixedQuestions', payload);
    sessionStorage.setItem('mixedMeta', meta);

    window.open(`engine.html?mode=${mode}&data=mixed&qpp=${qpp}&cols=2`, '_blank');
}
