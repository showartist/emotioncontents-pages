const STORAGE_KEY = 'origin-pilot-kit-validation-engine-v3';
const RESPONSE_PREFIX = 'RESP1:';

const sampleSaju = {
  title: '사주보이즈',
  format: 'character',
  oneLiner: '사주 기반 K-pop 수호 캐릭터가 매일 짧은 메시지로 사용자를 지켜봐주는 관계형 IP',
  audience: '18~35세 여성, K-pop 팬덤, 위로/자기확인 콘텐츠 소비자',
  problem: '기존 운세 앱은 정보는 주지만, 나를 기억하고 관계를 지속하는 존재감은 약하다.',
  promise: '사용자는 오늘의 운세를 받는 것이 아니라, 자신을 지켜봐주는 캐릭터와 짧지만 반복 가능한 관계를 경험한다.',
  emotion: '보호받는 느낌, 기대, 사적인 연결감',
  businessGoal: 'return',
  risks: '운세 앱처럼 보이면 진부해질 수 있다. 12명 세계관은 큰데 캐릭터 관계는 얕아질 수 있다.',
  comparison: '운세 앱, 캐릭터 챗봇, 오디오 드라마'
};

const samplePerformance = {
  title: '마음이 지나가는 방',
  format: 'performance',
  oneLiner: '관객의 짧은 기억과 말하지 못한 문장을 받아 빛·소리·오브제·마술적 리빌로 번역하는 3분 공연형 경험 엔진',
  audience: '소극장 관객, 축제/전시 방문객, 참여형 공연을 기획하는 기관',
  problem: '관객 참여형 공연은 많지만, 관객 개인의 기억이 공연 경험 안으로 들어오는 구조는 여전히 운영 난도가 높다.',
  promise: 'AI는 관객의 감정을 판정하지 않고, 관객의 장면을 공연 큐와 마지막 문장으로 바꾸어 개인화된 입장 경험을 만든다.',
  emotion: '자기 장면을 만난 느낌, 조용한 여운',
  businessGoal: 'ticket',
  risks: '치유/심리상담처럼 오해되면 위험하다. 기술 데모처럼 보이면 공연적 사건성이 약해진다.',
  comparison: '포토존 이벤트, 심리테스트형 체험, 인터랙티브 전시'
};

const params = new URLSearchParams(window.location.search);
const runParam = params.get('run');

if (runParam) {
  initRespondentMode(runParam);
} else {
  initAdminMode();
}

function initAdminMode() {
  const els = getAdminEls();
  let state = loadState() || createDefaultState();

  hydrateBrief();
  hydrateRunBuilder();
  renderAll();
  bindEvents();

  function bindEvents() {
    bind('load-saju', () => setBrief(sampleSaju, '사주보이즈 샘플을 불러왔습니다.'));
    bind('load-performance', () => setBrief(samplePerformance, '공연형 샘플을 불러왔습니다.'));
    bind('generate', () => {
      state.brief = getBriefFromInputs();
      state.model = buildValidationModel(state.brief);
      state.projectId = state.projectId || makeId('project');
      hydrateRunBuilder(true);
      saveState();
      renderAll();
      setStatus('검증 프로젝트가 생성되었습니다. 이제 응답자용 링크를 만들어 실제 사람에게 테스트하세요.');
    });
    bind('add-response', addManualResponse);
    bind('save-md', downloadMarkdown);
    bind('export-json', exportJson);
    bind('reset', resetAll);
    bind('build-run-link', buildRunLink);
    bind('copy-run-link', copyRunLink);
    bind('open-run-link', openRunLink);
    bind('import-package', importPackageFromTextarea);
    els.importJson.addEventListener('change', importProjectJson);
    els.importResponseJson.addEventListener('change', importResponseJson);

    document.querySelectorAll('.tab').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab === button));
        document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${button.dataset.tab}`));
      });
    });

    [
      els.title, els.format, els.oneLiner, els.audience, els.problem, els.promise,
      els.emotion, els.businessGoal, els.risks, els.comparison
    ].forEach((input) => input.addEventListener('input', autosaveBrief));

    [els.runName, els.runPrototype, els.runSummary, els.runStimulus].forEach((input) => input.addEventListener('input', autosaveRunDraft));
  }

  function setBrief(brief, statusText) {
    state = {
      ...state,
      brief: { ...brief },
      model: buildValidationModel(brief),
      responses: [],
      runDraft: createRunDraft(brief),
      latestRunLink: ''
    };
    hydrateBrief();
    hydrateRunBuilder();
    saveState();
    renderAll();
    setStatus(statusText);
  }

  function hydrateBrief() {
    const brief = state.brief || {};
    els.title.value = brief.title || '';
    els.format.value = brief.format || 'character';
    els.oneLiner.value = brief.oneLiner || '';
    els.audience.value = brief.audience || '';
    els.problem.value = brief.problem || '';
    els.promise.value = brief.promise || '';
    els.emotion.value = brief.emotion || '';
    els.businessGoal.value = brief.businessGoal || 'return';
    els.risks.value = brief.risks || '';
    els.comparison.value = brief.comparison || '';
  }

  function hydrateRunBuilder(resetIfEmpty = false) {
    if (!state.runDraft || resetIfEmpty) {
      state.runDraft = createRunDraft(state.brief);
    }
    els.runName.value = state.runDraft.name || '';
    els.runPrototype.value = state.runDraft.prototype || 'character';
    els.runSummary.value = state.runDraft.summary || '';
    els.runStimulus.value = state.runDraft.stimulus || '';
    els.runLink.value = state.latestRunLink || '';
  }

  function autosaveBrief() {
    state.brief = getBriefFromInputs();
    saveState();
  }

  function autosaveRunDraft() {
    state.runDraft = getRunDraftFromInputs();
    saveState();
  }

  function getBriefFromInputs() {
    return {
      title: els.title.value.trim(),
      format: els.format.value,
      oneLiner: els.oneLiner.value.trim(),
      audience: els.audience.value.trim(),
      problem: els.problem.value.trim(),
      promise: els.promise.value.trim(),
      emotion: els.emotion.value.trim(),
      businessGoal: els.businessGoal.value,
      risks: els.risks.value.trim(),
      comparison: els.comparison.value.trim()
    };
  }

  function getRunDraftFromInputs() {
    return {
      name: els.runName.value.trim(),
      prototype: els.runPrototype.value,
      summary: els.runSummary.value.trim(),
      stimulus: els.runStimulus.value.trim()
    };
  }

  function buildRunLink() {
    if (!state.model) {
      state.brief = getBriefFromInputs();
      state.model = buildValidationModel(state.brief);
    }
    state.runDraft = getRunDraftFromInputs();
    const payload = {
      projectId: state.projectId || makeId('project'),
      title: state.brief.title || 'Untitled Project',
      runName: state.runDraft.name || `${state.brief.title || '프로젝트'} 테스트`,
      prototype: state.runDraft.prototype,
      summary: state.runDraft.summary,
      stimulus: state.runDraft.stimulus,
      businessGoal: state.brief.businessGoal,
      identityAnswer: state.model.coreFraming.identityAnswer,
      identityDistractor: state.model.coreFraming.identityDistractor,
      generatedAt: new Date().toISOString()
    };
    const encoded = encodePayload(payload);
    const url = `${window.location.origin}${window.location.pathname}?run=${encodeURIComponent(encoded)}`;
    state.projectId = payload.projectId;
    state.latestRunLink = url;
    els.runLink.value = url;
    saveState();
    setStatus('응답자용 테스트 링크를 생성했습니다. 외부 사용자에게 이 링크를 보내세요.');
  }

  async function copyRunLink() {
    if (!els.runLink.value.trim()) {
      buildRunLink();
    }
    try {
      await navigator.clipboard.writeText(els.runLink.value.trim());
      setStatus('응답자 링크를 클립보드에 복사했습니다.');
    } catch {
      setStatus('브라우저에서 자동 복사를 막았습니다. 링크를 수동으로 복사하세요.');
    }
  }

  function openRunLink() {
    if (!els.runLink.value.trim()) {
      buildRunLink();
    }
    window.open(els.runLink.value.trim(), '_blank', 'noopener');
  }

  function addManualResponse() {
    const response = readManualResponse();
    state.responses.unshift(response);
    saveState();
    renderAll();
    setStatus('수동 응답을 추가했습니다.');
    clearManualResponseForm();
  }

  function readManualResponse() {
    return normalizeResponse({
      projectId: state.projectId || makeId('project'),
      responseId: makeId('resp'),
      source: 'manual-entry',
      runName: state.runDraft?.name || '수동 기록',
      prototype: els.respPrototype.value,
      participant: els.respParticipant.value.trim() || '미상',
      mode: els.respMode.value,
      next: els.respNext.value,
      clarity: clampNumber(els.respClarity.value, 1, 5),
      intrigue: clampNumber(els.respIntrigue.value, 1, 5),
      differentiation: clampNumber(els.respDiff.value, 1, 5),
      pay: els.respPay.value,
      memory: els.respMemory.value.trim(),
      comment: els.respComment.value.trim(),
      createdAt: new Date().toISOString()
    });
  }

  function clearManualResponseForm() {
    els.respParticipant.value = '';
    els.respMode.value = 'relationship';
    els.respNext.value = 'yes';
    els.respClarity.value = 4;
    els.respIntrigue.value = 4;
    els.respDiff.value = 4;
    els.respPay.value = 'maybe';
    els.respMemory.value = '';
    els.respComment.value = '';
  }

  function importPackageFromTextarea() {
    const raw = els.packageInput.value.trim();
    if (!raw) {
      setStatus('응답 패키지 문자열이 비어 있습니다.');
      return;
    }
    try {
      const parsed = decodeResponsePackage(raw);
      ingestResponse(parsed, '응답 패키지를 가져왔습니다.');
      els.packageInput.value = '';
    } catch (error) {
      setStatus(`패키지 해석 실패: ${error.message}`);
    }
  }

  function importResponseJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        ingestResponse(parsed, '응답 JSON을 가져왔습니다.');
      } catch (error) {
        setStatus(`응답 JSON 해석 실패: ${error.message}`);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function ingestResponse(parsed, successMessage) {
    const response = normalizeResponse(parsed);
    const exists = state.responses.some((item) => item.responseId === response.responseId);
    if (exists) {
      setStatus('이미 가져온 응답 패키지입니다.');
      return;
    }
    state.responses.unshift(response);
    saveState();
    renderAll();
    setStatus(successMessage);
  }

  function downloadMarkdown() {
    const content = buildMarkdownReport(state);
    downloadFile(`${slugify(state.brief.title || 'origin-pilot-kit')}-validation-report.md`, content, 'text/markdown');
    setStatus('Markdown 리포트를 저장했습니다.');
  }

  function exportJson() {
    downloadFile(`${slugify(state.brief.title || 'origin-pilot-kit')}-project.json`, JSON.stringify(state, null, 2), 'application/json');
    setStatus('프로젝트 JSON을 저장했습니다.');
  }

  function importProjectJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = JSON.parse(reader.result);
        state.responses = Array.isArray(state.responses) ? state.responses.map(normalizeResponse) : [];
        state.model = state.model || buildValidationModel(state.brief || sampleSaju);
        state.runDraft = state.runDraft || createRunDraft(state.brief || sampleSaju);
        hydrateBrief();
        hydrateRunBuilder();
        saveState();
        renderAll();
        setStatus('프로젝트 JSON을 불러왔습니다.');
      } catch (error) {
        setStatus(`프로젝트 JSON 해석 실패: ${error.message}`);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function resetAll() {
    if (!window.confirm('정말 초기화할까요? 현재 브라우저에 저장된 프로젝트/응답이 지워집니다.')) return;
    state = createDefaultState();
    saveState();
    hydrateBrief();
    hydrateRunBuilder(true);
    clearManualResponseForm();
    renderAll();
    setStatus('프로젝트를 초기화했습니다.');
  }

  function renderAll() {
    if (!state.model) {
      state.model = buildValidationModel(state.brief || sampleSaju);
    }
    renderSummary();
    renderHypotheses();
    renderExperiments();
    renderResponses();
    renderDecision();
  }

  function renderSummary() {
    const brief = state.brief || {};
    const model = state.model;
    const evidence = summarizeEvidence(state.responses, brief.businessGoal, model.coreFraming);
    els.summaryCard.innerHTML = `
      <h3>${escapeHtml(brief.title || 'Untitled Project')}</h3>
      <p>${escapeHtml(brief.oneLiner || '한 줄 설명이 아직 없습니다.')}</p>
      <div class="badges">
        <span class="badge info">형태 · ${escapeHtml(model.typeName)}</span>
        <span class="badge info">타깃 · ${escapeHtml(brief.audience || '미입력')}</span>
        <span class="badge info">핵심 질문 · ${escapeHtml(model.primaryQuestion)}</span>
        <span class="badge ${decisionBadgeClass(evidence.verdict)}">현재 판단 · ${escapeHtml(evidence.verdictLabel)}</span>
      </div>
    `;
  }

  function renderHypotheses() {
    els.hypothesisList.innerHTML = state.model.hypotheses.map((hypothesis) => {
      const value = computeHypothesisValue(hypothesis, state.responses, state.brief.businessGoal, state.model.coreFraming);
      const pass = value >= hypothesis.threshold;
      return `
        <article class="hypothesis-card">
          <div class="response-head">
            <h3>${escapeHtml(hypothesis.title)}</h3>
            <span class="badge ${pass ? 'ok' : 'warning'}">현재 ${value.toFixed(1)} / 기준 ${hypothesis.threshold}</span>
          </div>
          <p><strong>질문:</strong> ${escapeHtml(hypothesis.question)}</p>
          <p><strong>성공기준:</strong> ${escapeHtml(hypothesis.successMetric)}</p>
          <p><strong>왜 중요한가:</strong> ${escapeHtml(hypothesis.why)}</p>
        </article>
      `;
    }).join('');
  }

  function renderExperiments() {
    els.experimentList.innerHTML = state.model.experiments.map((experiment) => `
      <article class="experiment-card">
        <h3>${escapeHtml(experiment.title)}</h3>
        <p><strong>프로토타입:</strong> ${escapeHtml(experiment.prototype)}</p>
        <p><strong>목적:</strong> ${escapeHtml(experiment.objective)}</p>
        <ol class="list">${experiment.protocol.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
        <p><strong>통과 기준:</strong> ${escapeHtml(experiment.pass)}</p>
      </article>
    `).join('');
  }

  function renderResponses() {
    if (!state.responses.length) {
      els.responseList.innerHTML = `<div class="response-card"><p>아직 응답이 없습니다. 응답자 링크를 생성해 외부 테스트를 진행하거나 수동으로 기록하세요.</p></div>`;
      return;
    }
    els.responseList.innerHTML = state.responses.map((response) => `
      <article class="response-card">
        <div class="response-head">
          <h3>${escapeHtml(response.participant || '익명 응답')}</h3>
          <div class="badges">
            <span class="badge info">${escapeHtml(prototypeLabel(response.prototype))}</span>
            <span class="badge info">${escapeHtml(modeLabel(response.mode))}</span>
            <span class="badge ${response.next === 'yes' ? 'ok' : response.next === 'maybe' ? 'warning' : 'danger'}">다음 행동 ${escapeHtml(nextLabel(response.next))}</span>
          </div>
        </div>
        <p class="response-meta">${escapeHtml(response.runName || '미지정 테스트')} · ${escapeHtml(formatDate(response.createdAt))} · ${escapeHtml(response.source)}</p>
        <p><strong>명확성:</strong> ${response.clarity}/5 · <strong>끌림:</strong> ${response.intrigue}/5 · <strong>차별감:</strong> ${response.differentiation}/5 · <strong>비용/구독 의향:</strong> ${escapeHtml(payLabel(response.pay))}</p>
        <p><strong>가장 기억난 것:</strong> ${escapeHtml(response.memory || '-')}</p>
        <p><strong>메모:</strong> ${escapeHtml(response.comment || '-')}</p>
      </article>
    `).join('');
  }

  function renderDecision() {
    const evidence = summarizeEvidence(state.responses, state.brief.businessGoal, state.model.coreFraming);
    els.decisionBoard.innerHTML = `
      <section class="decision-main">
        <h3>현재 판단</h3>
        <div class="decision-label ${evidence.verdictClass}">${escapeHtml(evidence.verdictLabel)}</div>
        <p>${escapeHtml(evidence.summary)}</p>
      </section>
      <section class="kpi-grid">
        <div class="kpi"><span>핵심 인식 적중률</span><strong>${evidence.identityRate}%</strong></div>
        <div class="kpi"><span>다음 행동 YES</span><strong>${evidence.nextYesRate}%</strong></div>
        <div class="kpi"><span>차별감 평균</span><strong>${evidence.diffAvg}</strong></div>
        <div class="kpi"><span>명확성 평균</span><strong>${evidence.clarityAvg}</strong></div>
        <div class="kpi"><span>행동 전환 신호</span><strong>${evidence.actionRate}%</strong></div>
      </section>
      <article class="decision-card">
        <h3>다음 액션</h3>
        <ol class="list">${evidence.nextActions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
      </article>
      <article class="decision-card">
        <h3>검증 근거 요약</h3>
        <ol class="list">${evidence.evidenceNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>
      </article>
    `;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      parsed.responses = Array.isArray(parsed.responses) ? parsed.responses.map(normalizeResponse) : [];
      return parsed;
    } catch {
      return null;
    }
  }

  function setStatus(message) {
    els.status.innerHTML = escapeHtml(message);
  }
}

function initRespondentMode(runToken) {
  document.getElementById('admin-app').classList.add('hidden');
  document.getElementById('respondent-app').classList.remove('hidden');
  const els = getRespondentEls();
  let run;
  try {
    run = decodePayload(runToken);
  } catch (error) {
    els.respondentTitle.textContent = '테스트 링크 오류';
    els.respondentSummary.textContent = `링크를 해석하지 못했습니다: ${error.message}`;
    els.respondentStimulus.textContent = '운영자에게 새 링크를 요청하세요.';
    return;
  }

  els.respondentTitle.textContent = run.runName || `${run.title} 테스트`;
  els.respondentSummary.textContent = run.summary || `${run.title} 검증 세션입니다.`;
  els.respondentPrototypeBadge.textContent = `자극 형태 · ${prototypeLabel(run.prototype)} / 기대 인식 · ${run.identityAnswer}`;
  els.respondentStimulus.textContent = run.stimulus || '자극 본문이 비어 있습니다.';
  els.respondentStatus.textContent = '응답을 입력한 뒤 패키지를 생성하세요.';

  bindRespondentEvents();

  function bindRespondentEvents() {
    bind('r-build-package', buildRespondentPackage);
    bind('r-copy-package', copyRespondentPackage);
    bind('r-download-json', downloadRespondentJson);
  }

  function buildRespondentPackage() {
    const response = normalizeResponse({
      projectId: run.projectId,
      responseId: makeId('resp'),
      source: 'respondent-link',
      runName: run.runName,
      prototype: run.prototype,
      participant: els.rName.value.trim() || '익명 응답자',
      participantType: els.rParticipantType.value.trim(),
      mode: els.rMode.value,
      next: els.rNext.value,
      clarity: clampNumber(els.rClarity.value, 1, 5),
      intrigue: clampNumber(els.rIntrigue.value, 1, 5),
      differentiation: clampNumber(els.rDiff.value, 1, 5),
      pay: els.rPay.value,
      memory: els.rMemory.value.trim(),
      comment: els.rComment.value.trim(),
      createdAt: new Date().toISOString()
    });
    const encoded = encodePayload(response);
    els.rPackage.value = `${RESPONSE_PREFIX}${encoded}`;
    els.respondentStatus.textContent = '응답 패키지를 생성했습니다. 복사해서 운영자에게 보내거나 JSON으로 저장하세요.';
  }

  async function copyRespondentPackage() {
    if (!els.rPackage.value.trim()) buildRespondentPackage();
    try {
      await navigator.clipboard.writeText(els.rPackage.value.trim());
      els.respondentStatus.textContent = '응답 패키지를 복사했습니다.';
    } catch {
      els.respondentStatus.textContent = '자동 복사가 막혀 있습니다. 패키지를 직접 복사하세요.';
    }
  }

  function downloadRespondentJson() {
    const response = els.rPackage.value.trim() ? decodeResponsePackage(els.rPackage.value.trim()) : null;
    if (!response) {
      buildRespondentPackage();
    }
    const parsed = decodeResponsePackage(els.rPackage.value.trim());
    downloadFile(`${slugify(run.title || 'response')}-${slugify(parsed.participant || 'participant')}.json`, JSON.stringify(parsed, null, 2), 'application/json');
    els.respondentStatus.textContent = '응답 JSON을 저장했습니다.';
  }
}

function createDefaultState() {
  return {
    projectId: makeId('project'),
    brief: { ...sampleSaju },
    model: buildValidationModel(sampleSaju),
    runDraft: createRunDraft(sampleSaju),
    latestRunLink: '',
    responses: []
  };
}

function createRunDraft(brief) {
  const framing = buildCoreFraming(brief || sampleSaju);
  return {
    name: `${brief?.title || '프로젝트'} 1차 ${framing.prototype} 테스트`,
    prototype: framing.prototypeKey,
    summary: `${brief?.title || '이 IP'}의 첫 인상을 테스트합니다. 이것이 ${framing.identityDistractor}이 아니라 ${framing.identityAnswer}로 인식되는지 답해주세요.`,
    stimulus: defaultStimulus(brief || sampleSaju)
  };
}

function buildValidationModel(brief) {
  const typeName = {
    character: '관계형 캐릭터',
    audio: '오디오 파일럿',
    performance: '공연형 체험',
    video: '영상/숏폼',
    education: '교육/워크숍'
  }[brief.format] || 'IP';

  const coreFraming = buildCoreFraming(brief);
  const hypotheses = [
    {
      id: 'h1',
      title: '핵심 인식 가설',
      question: `${brief.title || '이 IP'}가 ${coreFraming.identityLabel}으로 인식되는가?`,
      successMetric: `${coreFraming.identityTarget}% 이상이 “${coreFraming.identityAnswer}”로 응답`,
      why: '첫 인식이 틀리면 이후 모든 확장 경로가 어긋난다.',
      threshold: coreFraming.identityTarget,
      source: 'mode'
    },
    {
      id: 'h2',
      title: '다시 돌아올 이유 가설',
      question: '첫 체험 후 다음 회차/다음 메시지/다음 체험 의향이 생기는가?',
      successMetric: 'YES 비율 55% 이상',
      why: '초기 팬덤/관객 관계는 재방문 의향에서 시작된다.',
      threshold: 55,
      source: 'next'
    },
    {
      id: 'h3',
      title: '차별성 가설',
      question: '기존 대체재와 다른 고유한 존재감이 느껴지는가?',
      successMetric: '차별감 평균 3.8/5 이상',
      why: '새 IP는 예쁜 결과물보다 다른 이유가 먼저 보여야 한다.',
      threshold: 76,
      source: 'differentiation'
    },
    {
      id: 'h4',
      title: '명확성 가설',
      question: '무엇을 주는 IP인지 설명 없이도 이해되는가?',
      successMetric: '명확성 평균 3.6/5 이상',
      why: '혼란도가 높으면 피벗 전이라도 콘셉트 압축이 필요하다.',
      threshold: 72,
      source: 'clarity'
    },
    {
      id: 'h5',
      title: '행동 전환 가설',
      question: `${goalLabel(brief.businessGoal)}으로 이어질 행동 신호가 생기는가?`,
      successMetric: `${goalTarget(brief.businessGoal)}% 이상`,
      why: '좋아 보이는 것과 실제 행동으로 이어지는 것은 다르다.',
      threshold: goalTargetNumber(brief.businessGoal),
      source: brief.businessGoal === 'return' ? 'next' : 'pay'
    }
  ];

  const experiments = [
    {
      title: '실험 1 · 첫 인식 판별',
      prototype: coreFraming.prototype,
      objective: `${brief.title || '이 IP'}가 사용자의 머릿속에서 ${coreFraming.identityAnswer}로 먼저 꽂히는지 확인`,
      protocol: [
        `30~90초 길이의 ${coreFraming.prototype} 1종을 보여준다.`,
        '설명은 최소화하고 첫 만남 자체를 체험시킨다.',
        `직후 “이건 ${coreFraming.identityDistractor}인가, ${coreFraming.identityAnswer}인가?”를 묻는다.`
      ],
      pass: `${coreFraming.identityTarget}% 이상이 ${coreFraming.identityAnswer} 선택`
    },
    {
      title: '실험 2 · 재방문 의향',
      prototype: '후킹이 있는 첫 회차 / 첫 체험',
      objective: '다음 행동이 생기는지 확인',
      protocol: [
        '마지막에 다음 회차를 열어두는 한 문장 또는 미해결 선택을 둔다.',
        '체험 직후 “내일 또 보고 싶은가 / 다음 편을 듣고 싶은가”를 3지선다로 받는다.',
        'YES / MAYBE / NO를 분리 기록한다.'
      ],
      pass: 'YES 55% 이상'
    },
    {
      title: '실험 3 · 차별성 진단',
      prototype: '비교형 질문지',
      objective: '대체재와 다른 이유를 언어로 회수',
      protocol: [
        `비교대상: ${brief.comparison || '기존 대체재'}`,
        '“이건 무엇과 가장 비슷했는가?”와 “어디가 달랐는가?”를 함께 묻는다.',
        '차별 포인트가 기능인지, 분위기인지, 관계성인지 분류한다.'
      ],
      pass: '차별감 평균 3.8/5 이상'
    },
    {
      title: '실험 4 · 리스크 압축 테스트',
      prototype: '두 버전 비교',
      objective: `가장 큰 리스크(${brief.risks || '리스크 미입력'})가 실제로 감지되는지 확인`,
      protocol: [
        '강한 버전과 줄인 버전 두 개 중 하나씩 보여준다.',
        '어느 순간이 부담 / 진부 / 과설명으로 느껴졌는지 기록한다.',
        '리스크 문장을 실제 관찰 메모로 바꾼다.'
      ],
      pass: '부정 피드백 비율 35% 미만'
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    typeName,
    primaryQuestion: coreFraming.primaryQuestion,
    coreFraming,
    hypotheses,
    experiments
  };
}

function buildCoreFraming(brief) {
  const formatMap = {
    character: {
      identityLabel: '관계형 캐릭터 / 만남',
      identityAnswer: '관계형 캐릭터 / 만남',
      identityDistractor: '운세 / 정보 서비스',
      identityTarget: 65,
      prototype: '첫 메시지 / 오디오 / 숏폼',
      prototypeKey: 'character',
      primaryQuestion: '이 IP는 정보가 아니라 관계로 받아들여지는가?'
    },
    audio: {
      identityLabel: '계속 듣고 싶은 오디오 서사',
      identityAnswer: '오디오 서사 / 다음 편이 궁금한 경험',
      identityDistractor: '설명형 정보 콘텐츠',
      identityTarget: 60,
      prototype: '3분 오디오 파일럿',
      prototypeKey: 'audio',
      primaryQuestion: '이 오디오가 설명보다 서사로 들리는가?'
    },
    performance: {
      identityLabel: '개인화된 공연형 경험',
      identityAnswer: '공연형 경험 / 장면',
      identityDistractor: '심리테스트 / 기술 데모',
      identityTarget: 60,
      prototype: '3분 체험 시퀀스',
      prototypeKey: 'performance',
      primaryQuestion: '이 체험은 테스트가 아니라 공연적 사건으로 인식되는가?'
    },
    video: {
      identityLabel: '보게 되는 캐릭터/영상 경험',
      identityAnswer: '영상 / 캐릭터 경험',
      identityDistractor: '광고 / 기능 설명',
      identityTarget: 60,
      prototype: '30초 영상 티저',
      prototypeKey: 'video',
      primaryQuestion: '이 영상은 정보 전달보다 IP 경험으로 받아들여지는가?'
    },
    education: {
      identityLabel: '참여형 학습 경험',
      identityAnswer: '참여형 학습 / 워크숍',
      identityDistractor: '강의 / 정보 안내',
      identityTarget: 60,
      prototype: '10분 워크숍 데모',
      prototypeKey: 'education',
      primaryQuestion: '이 콘텐츠는 설명이 아니라 참여형 학습 경험으로 인식되는가?'
    }
  };
  return formatMap[brief.format] || formatMap.character;
}

function summarizeEvidence(responses, businessGoal, coreFraming) {
  const total = responses.length;
  const safeTotal = total || 1;
  const relationshipHits = responses.filter((item) => modeMatchesIdentity(item.mode, coreFraming)).length;
  const nextYes = responses.filter((item) => item.next === 'yes').length;
  const clarityAvgRaw = avg(responses.map((item) => item.clarity));
  const intrigueAvgRaw = avg(responses.map((item) => item.intrigue));
  const diffAvgRaw = avg(responses.map((item) => item.differentiation));
  const actionPositive = responses.filter((item) => actionSignalPositive(item, businessGoal)).length;

  const identityRate = pct(relationshipHits, safeTotal);
  const nextYesRate = pct(nextYes, safeTotal);
  const clarityAvg = clarityAvgRaw ? clarityAvgRaw.toFixed(1) : '0.0';
  const intrigueAvg = intrigueAvgRaw ? intrigueAvgRaw.toFixed(1) : '0.0';
  const diffAvg = diffAvgRaw ? diffAvgRaw.toFixed(1) : '0.0';
  const actionRate = pct(actionPositive, safeTotal);

  let verdict = 'more';
  let verdictLabel = 'MORE DATA';
  let summary = '아직 응답이 부족합니다. 최소 5명 이상에게 실제 테스트를 돌려 판단하세요.';
  let nextActions = [
    '응답자 링크를 만들어 최소 5명에게 먼저 돌리세요.',
    `핵심 인식 질문이 “${coreFraming.identityDistractor}이 아니라 ${coreFraming.identityAnswer}인가?”로 남아 있는지 확인하세요.`
  ];

  if (total >= 5) {
    const strong = identityRate >= coreFraming.identityTarget && nextYesRate >= 55 && Number(diffAvg) >= 3.8 && Number(clarityAvg) >= 3.6;
    const partial = identityRate >= coreFraming.identityTarget || nextYesRate >= 55 || Number(diffAvg) >= 3.8;
    const weakIdentity = identityRate < 40;
    const weakEngagement = nextYesRate < 30;

    if (strong) {
      verdict = 'go';
      verdictLabel = 'GO';
      summary = '핵심 인식, 재방문, 차별성, 명확성 지표가 동시에 기준을 넘었습니다. 다음 단계 프로토타입으로 확장할 수 있습니다.';
      nextActions = [
        '같은 정체성을 유지한 채 2차 프로토타입(연속 회차/실제 티켓/실제 구독 흐름)으로 넘어가세요.',
        '가장 반응이 좋았던 자극 문장/장면을 보존하고, 약한 설명 요소는 제거하세요.'
      ];
    } else if (weakIdentity || weakEngagement) {
      verdict = weakIdentity ? 'pivot' : 'iterate';
      verdictLabel = weakIdentity ? 'PIVOT' : 'ITERATE';
      summary = weakIdentity
        ? `사람들이 이 IP를 아직 ${coreFraming.identityAnswer}로 보지 않습니다. 정체성 프레이밍을 바꿔야 합니다.`
        : '호기심은 있으나 재방문/행동 전환이 약합니다. 후킹 설계가 필요합니다.';
      nextActions = weakIdentity
        ? [
            `${coreFraming.identityDistractor}처럼 읽히는 표현을 줄이고, ${coreFraming.identityAnswer}를 직접 체험시키는 자극으로 바꾸세요.`,
            '설명형 카피보다 첫 만남 장면, 첫 대사, 첫 오브제를 다시 설계하세요.'
          ]
        : [
            '마지막 문장이나 다음 행동 유도 장면을 더 강하게 만드세요.',
            '사용자가 왜 다시 와야 하는지 한 문장으로 분명히 남기세요.'
          ];
    } else if (partial) {
      verdict = 'iterate';
      verdictLabel = 'ITERATE';
      summary = '가능성은 보이지만 아직 확신 수준의 증거는 아닙니다. 강한 요소는 살리고 약한 축을 보강해야 합니다.';
      nextActions = [
        '반응이 좋은 포인트를 남기고 설명이 길거나 흐린 부분을 압축하세요.',
        '다음 실험은 한 변수만 바꾼 두 버전 비교로 가는 것이 좋습니다.'
      ];
    } else {
      verdict = 'stop';
      verdictLabel = 'STOP';
      summary = '지금 버전은 핵심 인식과 행동 전환 모두 약합니다. 같은 형태로 밀어붙이기보다 방향 재정의가 필요합니다.';
      nextActions = [
        '지금 프로토타입을 잠시 멈추고 문제정의와 첫 경험 설계를 다시 쓰세요.',
        '정체성, 타깃, 비교대상 중 하나를 크게 바꾼 새 실험으로 전환하세요.'
      ];
    }
  }

  return {
    total,
    identityRate,
    nextYesRate,
    diffAvg,
    clarityAvg,
    intrigueAvg: intrigueAvgRaw ? intrigueAvgRaw.toFixed(1) : '0.0',
    actionRate,
    verdict,
    verdictLabel,
    verdictClass: verdict,
    summary,
    nextActions,
    evidenceNotes: [
      `총 응답 수: ${total}명`,
      `핵심 인식 적중: ${identityRate}%`,
      `다음 행동 YES: ${nextYesRate}%`,
      `차별감 평균: ${diffAvg}/5`,
      `명확성 평균: ${clarityAvg}/5`,
      `행동 전환 신호: ${actionRate}%`
    ]
  };
}

function computeHypothesisValue(hypothesis, responses, businessGoal, coreFraming) {
  const total = responses.length || 1;
  switch (hypothesis.source) {
    case 'mode':
      return pct(responses.filter((item) => modeMatchesIdentity(item.mode, coreFraming)).length, total);
    case 'next':
      return pct(responses.filter((item) => item.next === 'yes').length, total);
    case 'differentiation':
      return avg(responses.map((item) => item.differentiation)) * 20;
    case 'clarity':
      return avg(responses.map((item) => item.clarity)) * 20;
    case 'pay':
      return pct(responses.filter((item) => actionSignalPositive(item, businessGoal)).length, total);
    default:
      return 0;
  }
}

function normalizeResponse(response) {
  return {
    projectId: response.projectId || '',
    responseId: response.responseId || makeId('resp'),
    source: response.source || 'imported',
    runName: response.runName || '미지정 테스트',
    prototype: response.prototype || 'character',
    participant: response.participant || response.name || '익명 응답자',
    participantType: response.participantType || '',
    mode: response.mode || 'unclear',
    next: response.next || 'maybe',
    clarity: clampNumber(response.clarity ?? 3, 1, 5),
    intrigue: clampNumber(response.intrigue ?? 3, 1, 5),
    differentiation: clampNumber(response.differentiation ?? response.diff ?? 3, 1, 5),
    pay: response.pay || 'maybe',
    memory: response.memory || '',
    comment: response.comment || '',
    createdAt: response.createdAt || new Date().toISOString()
  };
}

function getAdminEls() {
  return {
    title: document.getElementById('title'),
    format: document.getElementById('format'),
    oneLiner: document.getElementById('oneLiner'),
    audience: document.getElementById('audience'),
    problem: document.getElementById('problem'),
    promise: document.getElementById('promise'),
    emotion: document.getElementById('emotion'),
    businessGoal: document.getElementById('businessGoal'),
    risks: document.getElementById('risks'),
    comparison: document.getElementById('comparison'),
    status: document.getElementById('status'),
    summaryCard: document.getElementById('summary-card'),
    hypothesisList: document.getElementById('hypothesis-list'),
    experimentList: document.getElementById('experiment-list'),
    responseList: document.getElementById('response-list'),
    decisionBoard: document.getElementById('decision-board'),
    importJson: document.getElementById('import-json'),
    importResponseJson: document.getElementById('import-response-json'),
    packageInput: document.getElementById('package-input'),
    runName: document.getElementById('run-name'),
    runPrototype: document.getElementById('run-prototype'),
    runSummary: document.getElementById('run-summary'),
    runStimulus: document.getElementById('run-stimulus'),
    runLink: document.getElementById('run-link'),
    respPrototype: document.getElementById('resp-prototype'),
    respParticipant: document.getElementById('resp-participant'),
    respMode: document.getElementById('resp-mode'),
    respNext: document.getElementById('resp-next'),
    respClarity: document.getElementById('resp-clarity'),
    respIntrigue: document.getElementById('resp-intrigue'),
    respDiff: document.getElementById('resp-diff'),
    respPay: document.getElementById('resp-pay'),
    respMemory: document.getElementById('resp-memory'),
    respComment: document.getElementById('resp-comment')
  };
}

function getRespondentEls() {
  return {
    respondentTitle: document.getElementById('respondent-title'),
    respondentSummary: document.getElementById('respondent-summary'),
    respondentPrototypeBadge: document.getElementById('respondent-prototype-badge'),
    respondentStimulus: document.getElementById('respondent-stimulus'),
    respondentStatus: document.getElementById('respondent-status'),
    rName: document.getElementById('r-name'),
    rParticipantType: document.getElementById('r-participant-type'),
    rMode: document.getElementById('r-mode'),
    rNext: document.getElementById('r-next'),
    rClarity: document.getElementById('r-clarity'),
    rIntrigue: document.getElementById('r-intrigue'),
    rDiff: document.getElementById('r-diff'),
    rPay: document.getElementById('r-pay'),
    rMemory: document.getElementById('r-memory'),
    rComment: document.getElementById('r-comment'),
    rPackage: document.getElementById('r-package')
  };
}

function defaultStimulus(brief) {
  if (brief.format === 'performance') {
    return `[입장 전 3분 체험]\n당신이 아직 말하지 못한 문장 하나를 떠올려 주세요.\n이제 화면의 빛, 소리, 오브제 중 하나를 고르세요.\n당신이 고른 장면은 해석이 아니라 하나의 방이 됩니다.`;
  }
  if (brief.format === 'audio') {
    return `[첫 회차 오디오 오프닝]\n나는 네가 오늘 피한 선택을 이미 알고 있어. 맞히러 온 게 아니라, 네가 그 문 앞에서 혼자가 아니라는 걸 알려주러 왔어.`;
  }
  return `[첫 만남 메시지]\n오늘 네가 피한 선택을 나는 알고 있어. 맞히러 온 게 아니라, 네 편이 되러 왔어. 내일도 네가 이 문장을 기억한다면, 그건 예언이 아니라 우리가 다시 만날 이유야.`;
}

function modeMatchesIdentity(mode, coreFraming) {
  if (coreFraming.prototypeKey === 'character') return mode === 'relationship';
  if (coreFraming.prototypeKey === 'performance') return mode === 'experience';
  if (coreFraming.prototypeKey === 'audio' || coreFraming.prototypeKey === 'video') return mode === 'experience' || mode === 'relationship';
  return mode !== 'information';
}

function actionSignalPositive(item, businessGoal) {
  if (businessGoal === 'return') return item.next === 'yes';
  return item.pay === 'yes';
}

function goalLabel(goal) {
  return {
    return: '다시 돌아오게 만들기',
    signup: '사전등록 / 구독 전환',
    ticket: '공연 / 이벤트 참여 의향',
    share: '공유 / 추천'
  }[goal] || '다음 행동';
}

function goalTarget(goal) {
  return {
    return: '55',
    signup: '35',
    ticket: '35',
    share: '40'
  }[goal] || '35';
}

function goalTargetNumber(goal) {
  return Number(goalTarget(goal));
}

function prototypeLabel(value) {
  return {
    audio: '오디오',
    video: '영상',
    character: '캐릭터 메시지',
    performance: '공연/체험',
    education: '교육/워크숍'
  }[value] || value;
}

function modeLabel(value) {
  return {
    relationship: '관계 / 만남',
    information: '정보 / 기능',
    experience: '경험 / 장면',
    unclear: '잘 모르겠음'
  }[value] || value;
}

function nextLabel(value) {
  return {
    yes: '있음',
    maybe: '보통',
    no: '없음'
  }[value] || value;
}

function payLabel(value) {
  return {
    yes: '있음',
    maybe: '모름',
    no: '없음'
  }[value] || value;
}

function decisionBadgeClass(verdict) {
  return {
    go: 'ok',
    iterate: 'warning',
    pivot: 'danger',
    stop: 'danger',
    more: 'info'
  }[verdict] || 'info';
}

function bind(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', handler);
}

function encodePayload(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodePayload(encoded) {
  return JSON.parse(decodeURIComponent(escape(atob(encoded))));
}

function decodeResponsePackage(raw) {
  const trimmed = raw.trim();
  const payload = trimmed.startsWith(RESPONSE_PREFIX) ? trimmed.slice(RESPONSE_PREFIX.length) : trimmed;
  return decodePayload(payload);
}

function buildMarkdownReport(state) {
  const evidence = summarizeEvidence(state.responses, state.brief.businessGoal, state.model.coreFraming);
  return `# ${state.brief.title || 'ORIGIN PILOT KIT'}\n\n## 한 줄 설명\n${state.brief.oneLiner || '-'}\n\n## 핵심 질문\n${state.model.primaryQuestion}\n\n## 현재 판단\n- verdict: ${evidence.verdictLabel}\n- 핵심 인식 적중률: ${evidence.identityRate}%\n- 다음 행동 YES: ${evidence.nextYesRate}%\n- 차별감 평균: ${evidence.diffAvg}/5\n- 명확성 평균: ${evidence.clarityAvg}/5\n- 행동 전환 신호: ${evidence.actionRate}%\n\n## 검증 가설\n${state.model.hypotheses.map((item) => `- ${item.title}: ${item.question} / 기준 ${item.successMetric}`).join('\n')}\n\n## 실험 설계\n${state.model.experiments.map((item) => `### ${item.title}\n- prototype: ${item.prototype}\n- objective: ${item.objective}\n- pass: ${item.pass}\n${item.protocol.map((step) => `  - ${step}`).join('\n')}`).join('\n\n')}\n\n## 응답 요약\n${state.responses.map((item) => `- ${item.participant} / ${prototypeLabel(item.prototype)} / ${modeLabel(item.mode)} / 다음행동 ${nextLabel(item.next)} / 차별감 ${item.differentiation}/5 / 명확성 ${item.clarity}/5 / 메모: ${item.comment || '-'}`).join('\n') || '- 아직 없음'}\n\n## 다음 액션\n${evidence.nextActions.map((item) => `- ${item}`).join('\n')}`;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function avg(list) {
  if (!list.length) return 0;
  return list.reduce((sum, value) => sum + Number(value || 0), 0) / list.length;
}

function pct(part, whole) {
  return Math.round((part / whole) * 100);
}

function clampNumber(value, min, max) {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('ko-KR');
  } catch {
    return iso;
  }
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
