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
        
        // 히어로 통계 데이터 업데이트 (요청 반영)
        const examStatEl = document.getElementById('stat-total-exam');
        const schoolStatEl = document.getElementById('stat-total-school');
        
        if (examStatEl) {
            examStatEl.innerText = window.unifiedIndex.length.toLocaleString() + '+';
        }
        if (schoolStatEl) {
            const uniqueSchools = new Set(window.unifiedIndex.map(i => i.school).filter(Boolean)).size;
            schoolStatEl.innerText = uniqueSchools.toLocaleString() + '+';
        }

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
            year: item.year ? String(item.year) : '',
            semester: item.semester ? String(item.semester) : '',
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
    const sels = {
        grade: document.getElementById('filter-grade'),
        subject: document.getElementById('filter-subject'),
        school: document.getElementById('filter-school'),
        year: document.getElementById('filter-year'),
        semester: document.getElementById('filter-semester'),
        examtype: document.getElementById('filter-examtype')
    };

    if (!sels.grade) return;

    Object.keys(sels).forEach(key => {
        const labels = {
            grade: '학년', subject: '과목', school: '학교', 
            year: '연도', semester: '학기', examtype: '시험'
        };
        sels[key].innerHTML = `<option value="">모든 ${labels[key]}</option>`;
    });

    const sets = { grade: new Set(), subject: new Set(), school: new Set(), year: new Set(), semester: new Set(), examtype: new Set() };

    window.unifiedIndex.forEach(item => {
        if (item.grade) sets.grade.add(item.grade);
        if (item.subject) sets.subject.add(item.subject);
        if (item.school) sets.school.add(item.school);
        if (item.year) sets.year.add(item.year);
        if (item.semester) sets.semester.add(item.semester);
        if (item.examType) sets.examtype.add(item.examType);
    });

    Object.keys(sets).forEach(key => {
        Array.from(sets[key]).sort().forEach(val => {
            let text = val;
            if (key === 'semester') text = val + '학기';
            if (key === 'examtype') text = val === 'mid' ? '중간' : (val === 'final' ? '기말' : val);
            sels[key].appendChild(new Option(text, val));
        });
    });
}

function bindSearchEvents() {
    const filters = ['filter-grade', 'filter-subject', 'filter-school', 'filter-year', 'filter-semester', 'filter-examtype'];
    filters.forEach(id => document.getElementById(id)?.addEventListener('change', renderExamGrid));
    
    const kInp = document.getElementById('search-keyword');
    kInp?.addEventListener('input', renderExamGrid);
    kInp?.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    
    document.getElementById('btn-reset-filter')?.addEventListener('click', resetSearchFilters);
}

function renderExamGrid() {
    const grid = document.getElementById('exam-grid'), countSpan = document.getElementById('search-count');
    if (!grid) return;

    const f = {
        g: document.getElementById('filter-grade')?.value || '',
        s: document.getElementById('filter-subject')?.value || '',
        sch: document.getElementById('filter-school')?.value || '',
        y: document.getElementById('filter-year')?.value || '',
        sem: document.getElementById('filter-semester')?.value || '',
        et: document.getElementById('filter-examtype')?.value || '',
        k: document.getElementById('search-keyword')?.value.toLowerCase() || ''
    };

    const filtered = window.unifiedIndex.filter(item =>
        (!f.g || item.grade === f.g) &&
        (!f.s || item.subject === f.s) &&
        (!f.sch || item.school === f.sch) &&
        (!f.y || item.year === f.y) &&
        (!f.sem || item.semester === f.sem) &&
        (!f.et || item.examType === f.et) &&
        (item.displayTitle.toLowerCase().includes(f.k) || item.school.toLowerCase().includes(f.k))
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
    const filters = ['filter-grade', 'filter-subject', 'filter-school', 'filter-year', 'filter-semester', 'filter-examtype'];
    filters.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const kInp = document.getElementById('search-keyword');
    if (kInp) kInp.value = '';
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