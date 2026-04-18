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

document.addEventListener('DOMContentLoaded', async () => {
    restoreMixerDrafts();
    await initializeDataLayer();
    initGradeTabs();
    initAppNavigation();
    bindMixedOutputActions();
    bindClearCart();
    bindDraftPersist();
    bindSearchEvents();
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
                    const cols = prompt('단 구성을 선택하세요 (2단/3단/4단)\n2 = 2단 (기본)\n3 = 3단\n4 = 4단', '2');
                    if (!cols) return;
                    const colsNum = Math.min(4, Math.max(2, parseInt(cols) || 2));
                    const qppMap = { 2: 4, 3: 6, 4: 8 };
                    window.open(`engine.html?mode=exam&data=${encodeURIComponent(item.sourceRef)}&title=${encodeURIComponent(item.displayTitle)}&qpp=${qppMap[colsNum]}&cols=${colsNum}`, '_blank');
                } else {
                    window.open(`engine.html?mode=${action}&data=${encodeURIComponent(item.sourceRef)}&title=${encodeURIComponent(item.displayTitle)}&qpp=4`, '_blank');
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
    if (targetId === 'tab-mixer') renderMixerList();
}