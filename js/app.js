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

document.addEventListener('DOMContentLoaded', async () => {
    restoreMixerDrafts();
    await initializeDataLayer();
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
        let safeId = fileName.replace(/\.js$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        if (!safeId) safeId = `eng_${Math.random().toString(36).slice(2, 11)}`;
        return {
            type: 'engine',
            sourceRef: safePath,
            sourceId: safeId,
            displayTitle: `${item.school || ''} ${item.grade || ''} ${item.subject || ''}`.trim() || '제목 없음',
            school: item.school || '',
            subject: item.subject || '',
            grade: item.grade || '',
            year: parseInt(item.year) || 0,
            semester: item.semester || '',
            examType: item.examType || '',
            sortKey: `${item.year}_${item.grade}_${item.school}_${item.subject}`
        };
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
    const clean = Array.isArray(cart) ? cart.filter(item => item && item.sourceId) : [];
    const cartString = JSON.stringify(clean);
    localStorage.setItem('searchCart', cartString);
    sessionStorage.setItem('searchCart', cartString);
    updateMixerActionState();
}

function updateGlobalCartCount() {
    const countEl = document.getElementById('global-cart-count');
    if (countEl) countEl.innerText = getSearchCart().length;
}

function updateMixerActionState() {
    const cart = getSearchCart();
    const engineCount = cart.filter(item => item && item.type === 'engine').length;

    const clearBtn = document.getElementById('btn-clear-cart');
    if (clearBtn) clearBtn.disabled = cart.length === 0;

    ['btn-generate-exam', 'btn-generate-solution', 'btn-generate-answer'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = engineCount === 0;
    });
}

function bindDraftPersist() {
    const titleInp = document.getElementById('exam-title');
    const qppSel = document.getElementById('select-qpp');
    titleInp?.addEventListener('input', e => localStorage.setItem('mixerDraftTitle', e.target.value));
    qppSel?.addEventListener('change', e => localStorage.setItem('mixerDraftQpp', e.target.value));
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

function removeFromCart(sourceId) {
    const cart = getSearchCart().filter(item => item && item.sourceId !== sourceId);
    saveSearchCart(cart);
    updateGlobalCartCount();
    renderMixerList();
    if (document.getElementById('tab-search')?.classList.contains('active')) renderExamGrid();
}

function initFilterOptions() {
    const gSel = document.getElementById('filter-grade'), sSel = document.getElementById('filter-subject');
    if (!gSel || !sSel) return;

    gSel.innerHTML = '<option value="">모든 학년</option>';
    sSel.innerHTML = '<option value="">모든 과목</option>';

    const gradeSet = new Set(), subjectSet = new Set();
    window.unifiedIndex.forEach(item => {
        if (item.grade) gradeSet.add(item.grade);
        if (item.subject) subjectSet.add(item.subject);
    });

    Array.from(gradeSet).sort().forEach(g => gSel.appendChild(new Option(g, g)));
    Array.from(subjectSet).sort().forEach(s => sSel.appendChild(new Option(s, s)));
}

function bindSearchEvents() {
    const gSel = document.getElementById('filter-grade');
    const sSel = document.getElementById('filter-subject');
    const kInp = document.getElementById('search-keyword');
    const btnReset = document.getElementById('btn-reset-filter');

    gSel?.addEventListener('change', renderExamGrid);
    sSel?.addEventListener('change', renderExamGrid);
    kInp?.addEventListener('input', renderExamGrid);
    kInp?.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    btnReset?.addEventListener('click', resetSearchFilters);
}

function renderExamGrid() {
    const grid = document.getElementById('exam-grid'), countSpan = document.getElementById('search-count');
    if (!grid) return;

    const fG = document.getElementById('filter-grade')?.value || '';
    const fS = document.getElementById('filter-subject')?.value || '';
    const fK = document.getElementById('search-keyword')?.value.toLowerCase() || '';

    const filtered = window.unifiedIndex.filter(item =>
        (!fG || item.grade === fG) &&
        (!fS || item.subject === fS) &&
        (item.displayTitle.toLowerCase().includes(fK) || item.school.toLowerCase().includes(fK))
    );

    if (countSpan) countSpan.textContent = `검색 결과: ${filtered.length}건`;
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
            <div class="card-header"><span class="badge engine">엔진</span><span class="year-label">${esc(item.year)}년</span></div>
            <div class="card-body">
                <div class="card-school">${esc(item.school)}</div>
                <div class="card-meta">
                    <span class="meta-chip">${esc(item.grade)}</span>
                    <span class="meta-chip">${esc(item.subject)}</span>
                    ${examLabel ? `<span class="meta-chip accent">${esc(examLabel)}</span>` : ''}
                </div>
            </div>
            <div class="card-footer"><button class="cart-toggle-btn ${inCart ? 'in-cart' : ''}" data-id="${esc(item.sourceId)}">${inCart ? '제거' : '담기'}</button></div>
        `;
        grid.appendChild(card);
    });

    grid.querySelectorAll('.cart-toggle-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.target.getAttribute('data-id'), item = window.unifiedIndex.find(i => i.sourceId === id);
            if (!item) return;
            const currentCart = getSearchCart(), idx = currentCart.findIndex(c => c.sourceId === id);
            if (idx > -1) currentCart.splice(idx, 1); else currentCart.push(item);
            saveSearchCart(currentCart);
            updateGlobalCartCount();
            const isAdded = currentCart.some(c => c.sourceId === id);
            e.target.textContent = isAdded ? '제거' : '담기';
            e.target.classList.toggle('in-cart', isAdded);
        });
    });
}

function renderMixerList() {
    const container = document.getElementById('mixer-list'), countSpan = document.getElementById('mixer-count');
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
        const examLabel = fmtExamType(item.semester, item.examType), row = document.createElement('div');
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

    container.querySelectorAll('.btn-remove').forEach(btn => btn.addEventListener('click', e => removeFromCart(e.target.getAttribute('data-id'))));
    updateMixerActionState();
}

function buildMixedOutputPayload() {
    const cart = getSearchCart();
    const uniqueEngines = [];
    const seenIds = new Set();
    cart.forEach(item => { if (item && item.type === 'engine' && !seenIds.has(item.sourceId)) { seenIds.add(item.sourceId); uniqueEngines.push(item); } });

    if (uniqueEngines.length === 0) { alert('출제할 엔진 문항이 없습니다.'); return null; }
    const title = document.getElementById('exam-title')?.value.trim() || '통합 기출 시험지', qpp = document.getElementById('select-qpp')?.value || '2';
    const mixedQuestions = uniqueEngines.map(item => ({ sourceRef: item.sourceRef, sourceId: item.sourceId }));
    const mixedMeta = { title, count: mixedQuestions.length, qpp, generatedAt: new Date().toISOString() };

    localStorage.setItem('mixedQuestions', JSON.stringify(mixedQuestions)); sessionStorage.setItem('mixedQuestions', JSON.stringify(mixedQuestions));
    localStorage.setItem('mixedMeta', JSON.stringify(mixedMeta)); sessionStorage.setItem('mixedMeta', JSON.stringify(mixedMeta));
    return { qpp };
}

function openMixedEngine(mode) {
    const payload = buildMixedOutputPayload();
    if (payload) window.open(`engine.html?mode=${mode}&data=mixed&qpp=${payload.qpp}`, '_blank');
}

function bindMixedOutputActions() {
    document.getElementById('btn-generate-exam')?.addEventListener('click', () => openMixedEngine('exam'));
    document.getElementById('btn-generate-solution')?.addEventListener('click', () => openMixedEngine('sol'));
    document.getElementById('btn-generate-answer')?.addEventListener('click', () => openMixedEngine('ans'));
}

function bindClearCart() {
    document.getElementById('btn-clear-cart')?.addEventListener('click', () => {
        if (confirm('비우시겠습니까?')) { saveSearchCart([]); updateGlobalCartCount(); renderMixerList(); if (document.getElementById('tab-search')?.classList.contains('active')) renderExamGrid(); }
    });
}

function resetSearchFilters() {
    const g = document.getElementById('filter-grade'), s = document.getElementById('filter-subject'), k = document.getElementById('search-keyword');
    if (g) g.value = ''; if (s) s.value = ''; if (k) k.value = '';
    renderExamGrid();
}

function initAppNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = e.currentTarget.getAttribute('data-tab');
            document.querySelectorAll('.app-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.getElementById(target)?.classList.add('active');
            e.currentTarget.classList.add('active');
            if (target === 'tab-mixer') renderMixerList();
        });
    });
}
