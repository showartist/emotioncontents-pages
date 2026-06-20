const STORAGE_KEY = 'origin-pilot-kit-validation-engine-v2';

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

const els = {
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
  respPrototype: document.getElementById('resp-prototype'),
  respParticipant: document.getElementById('resp-participant'),
  respMode: document.getElementById('resp-mode'),
  respNext: document.getElementById('resp-next'),
  respClarity: document.getElementById('resp-clarity'),
  respIntrigue: document.getElementById('resp-intrigue'),
  respDiff: document.getElementById('resp-diff'),
  respPay: document.getElementById('resp-pay'),
  respMemory: document.getElementById('resp-memory'),
  respComment: document.getElementById('resp-comment'),
  importJson: document.getElementById('import-json')
};

let state = loadState() || {
  brief: { ...sampleSaju },
  model: null,
  responses: []
};

hydrateBrief();
renderAll();

bind('load-saju', () => setBrief(sampleSaju, '사주보이즈 샘플을 불러왔습니다.'));
bind('load-performance', () => setBrief(samplePerformance, '공연형 샘플을 불러왔습니다.'));
bind('generate', () => {
  state.brief = getBriefFromInputs();
  state.model = buildValidationModel(state.brief);
  saveState();
  renderAll();
  setStatus('검증엔진이 실행되었습니다. 이제 실제 사용자 응답을 쌓아 판단을 업데이트하세요.');
});
bind('add-response', addResponse);
bind('save-md', downloadMarkdown);
bind('export-json', exportJson);
bind('reset', resetAll);
els.importJson.addEventListener('change', importJson);

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab === button));
    document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${button.dataset.tab}`));
  });
});

Object.values({
  title: els.title,
  format: els.format,
  oneLiner: els.oneLiner,
  audience: els.audience,
  problem: els.problem,
  promise: els.promise,
  emotion: els.emotion,
  businessGoal: els.businessGoal,
  risks: els.risks,
  comparison: els.comparison
}).forEach((input) => input.addEventListener('input', autosaveBrief));

function bind(id, handler) {
  document.getElementById(id).addEventListener('click', handler);
}

function setBrief(brief, statusText) {
  state.brief = { ...brief };
  state.model = buildValidationModel(state.brief);
  state.responses = [];
  hydrateBrief();
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

function autosaveBrief() {
  state.brief = getBriefFromInputs();
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
      source: brief.businessGoal === 'share' ? 'next' : 'pay'
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
        'YES/MAYBE/NO를 별도 기록한다.'
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
        '어느 순간이 부담/진부/과설명으로 느껴졌는지 기록한다.',
        '리스크 문장을 실제 관찰 메모로 바꾼다.'
      ],
      pass: '부정 피드백 비율 35% 미만'
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    typeName,
    primaryQuestion: coreFraming.primaryQuestion,
    positioning: coreFraming.positioning,
    identityAnswer: coreFraming.identityAnswer,
    hypotheses,
    experiments
  };
}

function buildCoreFraming(brief) {
  if (brief.format === 'character') {
    return {
      primaryQuestion: `${brief.title || '이 IP'}는 정보형 서비스가 아니라 관계형 캐릭터 IP로 작동하는가?`,
      positioning: '운세/정보 제공보다 “나를 지켜봐주는 존재”의 관계 설계가 먼저 검증되어야 한다.',
      identityLabel: '관계형 캐릭터/만남',
      identityAnswer: '관계형 캐릭터/만남',
      identityDistractor: '정보형 운세/기능성 앱',
      identityTarget: 60,
      prototype: '짧은 캐릭터 첫 만남 메시지 또는 오디오 파일럿'
    };
  }
  if (brief.format === 'performance') {
    return {
      primaryQuestion: `${brief.title || '이 IP'}는 기술 데모가 아니라 공연적 사건으로 체감되는가?`,
      positioning: '감정 분석기가 아니라 관객의 장면을 사건으로 번역하는지 검증해야 한다.',
      identityLabel: '공연적 사건/개인화 체험',
      identityAnswer: '공연적 사건/개인화 체험',
      identityDistractor: '심리테스트/기술 데모',
      identityTarget: 65,
      prototype: '3분 입장 체험 또는 1인 데모 시퀀스'
    };
  }
  if (brief.format === 'audio') {
    return {
      primaryQuestion: `${brief.title || '이 IP'}는 귀로 들렸을 때 끝까지 따라가고 싶은 서사인가?`,
      positioning: '텍스트 아이디어가 아니라, 청취 지속성을 만드는지 봐야 한다.',
      identityLabel: '듣고 싶은 이야기',
      identityAnswer: '듣고 싶은 이야기',
      identityDistractor: '설정 설명/요약문',
      identityTarget: 60,
      prototype: '3분 오디오 파일럿'
    };
  }
  if (brief.format === 'education') {
    return {
      primaryQuestion: `${brief.title || '이 IP'}는 정보 전달보다 참여 경험으로 기억되는가?`,
      positioning: '학습형 IP는 유익함만이 아니라 참여 후 기억 잔존이 중요하다.',
      identityLabel: '참여형 경험',
      identityAnswer: '참여형 경험',
      identityDistractor: '설명형 교육 콘텐츠',
      identityTarget: 60,
      prototype: '짧은 참여형 미션 또는 인터랙션'
    };
  }
  return {
    primaryQuestion: `${brief.title || '이 IP'}는 한 번 보고 잊히는 결과물이 아니라 다음 행동을 만드는가?`,
    positioning: '첫 인식과 재방문 의향을 동시에 확인해야 한다.',
    identityLabel: '다음 행동을 만드는 IP',
    identityAnswer: '다음 행동을 만드는 IP',
    identityDistractor: '한 번 보고 끝나는 데모',
    identityTarget: 55,
    prototype: '30초~90초 파일럿'
  };
}

function goalLabel(goal) {
  return {
    return: '재방문',
    signup: '사전등록/구독',
    ticket: '공연/이벤트 참여',
    share: '공유/추천'
  }[goal] || '행동 전환';
}

function goalTarget(goal) {
  return {
    return: '재방문 YES 55% 이상',
    signup: '지인에게 남겨도 될 이메일/연락 수집 의향 30% 이상',
    ticket: '직접 보러 가고 싶다는 의향 40% 이상',
    share: '추천/공유 의향 YES 45% 이상'
  }[goal] || '행동 신호 35% 이상';
}

function goalTargetNumber(goal) {
  return {
    return: 55,
    signup: 30,
    ticket: 40,
    share: 45
  }[goal] || 35;
}

function addResponse() {
  if (!state.model) {
    setStatus('먼저 검증엔진을 실행해 가설과 실험을 만든 뒤 응답을 추가하세요.');
    return;
  }

  const response = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    prototype: els.respPrototype.value,
    participant: els.respParticipant.value.trim() || '미기재',
    mode: els.respMode.value,
    next: els.respNext.value,
    clarity: clampNumber(els.respClarity.value, 1, 5),
    intrigue: clampNumber(els.respIntrigue.value, 1, 5),
    differentiation: clampNumber(els.respDiff.value, 1, 5),
    pay: els.respPay.value,
    memory: els.respMemory.value.trim(),
    comment: els.respComment.value.trim()
  };

  state.responses.unshift(response);
  saveState();
  renderAll();
  clearResponseInputs();
  setStatus('응답이 추가되었습니다. 판단 대시보드가 즉시 갱신됩니다.');
}

function clearResponseInputs() {
  els.respParticipant.value = '';
  els.respMode.value = 'relationship';
  els.respNext.value = 'yes';
  els.respClarity.value = '4';
  els.respIntrigue.value = '4';
  els.respDiff.value = '4';
  els.respPay.value = 'maybe';
  els.respMemory.value = '';
  els.respComment.value = '';
}

function renderAll() {
  renderSummary();
  renderHypotheses();
  renderExperiments();
  renderResponses();
  renderDecision();
}

function renderSummary() {
  const brief = state.brief || {};
  const model = state.model;
  if (!model) {
    els.summaryCard.innerHTML = `
      <h3>아직 검증 설계 전</h3>
      <p>입력된 IP를 기반으로 <strong>핵심 질문</strong>, <strong>실험 프로토콜</strong>, <strong>판단 기준</strong>을 생성합니다. 이 단계가 있어야 “예쁘다”가 아니라 “어디를 물어볼지”가 생깁니다.</p>
    `;
    return;
  }

  els.summaryCard.innerHTML = `
    <h3>${escapeHtml(brief.title || '제목 없음')} · 검증 프레임</h3>
    <p>${escapeHtml(model.positioning)}</p>
    <div class="badges">
      <span class="badge info">핵심 질문: ${escapeHtml(model.primaryQuestion)}</span>
      <span class="badge info">형태: ${escapeHtml(model.typeName)}</span>
      <span class="badge info">응답 수: ${state.responses.length}개</span>
    </div>
  `;
}

function renderHypotheses() {
  const model = state.model;
  if (!model) {
    els.hypothesisList.innerHTML = '';
    return;
  }
  const metrics = computeMetrics();
  els.hypothesisList.innerHTML = model.hypotheses.map((item) => {
    const current = currentValueFor(item.source, metrics);
    const status = hypothesisStatus(current, item.threshold, item.source);
    return `
      <article class="hypothesis-card">
        <div class="response-head">
          <h3>${escapeHtml(item.title)}</h3>
          <span class="badge ${status.badge}">${status.label}</span>
        </div>
        <p><strong>질문:</strong> ${escapeHtml(item.question)}</p>
        <p class="muted"><strong>성공기준:</strong> ${escapeHtml(item.successMetric)}</p>
        <p class="muted"><strong>왜 중요하나:</strong> ${escapeHtml(item.why)}</p>
        <div class="badges">
          <span class="badge info">현재값 ${formatMetric(item.source, current)}</span>
          <span class="badge info">판정 기준 ${item.threshold}${item.source === 'clarity' || item.source === 'differentiation' ? '점' : '%'}</span>
        </div>
      </article>
    `;
  }).join('');
}

function renderExperiments() {
  const model = state.model;
  if (!model) {
    els.experimentList.innerHTML = '';
    return;
  }
  els.experimentList.innerHTML = model.experiments.map((exp) => `
    <article class="experiment-card">
      <h3>${escapeHtml(exp.title)}</h3>
      <p><strong>목표:</strong> ${escapeHtml(exp.objective)}</p>
      <p class="muted"><strong>프로토타입:</strong> ${escapeHtml(exp.prototype)}</p>
      <ul class="list">${exp.protocol.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
      <div class="badges"><span class="badge ok">PASS 기준: ${escapeHtml(exp.pass)}</span></div>
    </article>
  `).join('');
}

function renderResponses() {
  if (!state.responses.length) {
    els.responseList.innerHTML = '<div class="response-card"><p>아직 기록된 응답이 없습니다. 최소 5명 이상부터 판단 신뢰도가 생깁니다.</p></div>';
    return;
  }
  els.responseList.innerHTML = state.responses.map((resp) => `
    <article class="response-card">
      <div class="response-head">
        <h3>${escapeHtml(resp.participant)}</h3>
        <span class="response-meta">${formatDate(resp.createdAt)} · ${labelForPrototype(resp.prototype)}</span>
      </div>
      <div class="badges">
        <span class="badge info">인식: ${labelForMode(resp.mode)}</span>
        <span class="badge info">다음 행동: ${labelForNext(resp.next)}</span>
        <span class="badge info">명확성 ${resp.clarity}/5</span>
        <span class="badge info">끌림 ${resp.intrigue}/5</span>
        <span class="badge info">차별감 ${resp.differentiation}/5</span>
      </div>
      ${resp.memory ? `<p><strong>기억난 것:</strong> ${escapeHtml(resp.memory)}</p>` : ''}
      ${resp.comment ? `<p class="muted">${escapeHtml(resp.comment)}</p>` : ''}
    </article>
  `).join('');
}

function renderDecision() {
  const metrics = computeMetrics();
  const verdict = deriveVerdict(metrics, state.model, state.brief);
  if (!state.model) {
    els.decisionBoard.innerHTML = '';
    return;
  }

  els.decisionBoard.innerHTML = `
    <section class="decision-main">
      <h3>현재 판단</h3>
      <div class="decision-label ${verdict.className}">${verdict.label}</div>
      <p>${escapeHtml(verdict.reason)}</p>
      <div class="badges">
        <span class="badge info">핵심 질문: ${escapeHtml(state.model.primaryQuestion)}</span>
        <span class="badge ${verdict.badge}">신뢰도 ${verdict.confidence}%</span>
      </div>
    </section>

    <section class="kpi-grid">
      <div class="kpi"><span>응답 수</span><strong>${metrics.count}</strong></div>
      <div class="kpi"><span>첫 인식 적중률</span><strong>${metrics.identityRate}%</strong></div>
      <div class="kpi"><span>재방문 YES</span><strong>${metrics.nextYesRate}%</strong></div>
      <div class="kpi"><span>차별감</span><strong>${metrics.diffScore}</strong></div>
      <div class="kpi"><span>명확성</span><strong>${metrics.clarityScore}</strong></div>
    </section>

    <article class="decision-card">
      <div class="decision-head">
        <h3>판단 근거</h3>
        <span class="badge info">행동 전환 ${metrics.payRate}%</span>
      </div>
      <ul class="list">
        ${verdict.bullets.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
      </ul>
    </article>

    <article class="decision-card">
      <h3>다음 액션</h3>
      <ul class="list">
        ${verdict.nextActions.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
      </ul>
    </article>
  `;
}

function computeMetrics() {
  const items = state.responses || [];
  if (!items.length) {
    return {
      count: 0,
      identityRate: 0,
      nextYesRate: 0,
      clarityScore: 0,
      intrigueScore: 0,
      diffScore: 0,
      payRate: 0,
      confusionRate: 0,
      relationRate: 0,
      informationRate: 0,
      experienceRate: 0
    };
  }

  const yesCount = items.filter((item) => item.next === 'yes').length;
  const identityMatches = items.filter((item) => {
    if (state.brief.format === 'character') return item.mode === 'relationship';
    if (state.brief.format === 'performance') return item.mode === 'experience';
    if (state.brief.format === 'audio') return item.mode !== 'information';
    if (state.brief.format === 'education') return item.mode === 'experience';
    return item.mode !== 'unclear';
  }).length;
  const relationRate = rate(items.filter((item) => item.mode === 'relationship').length, items.length);
  const experienceRate = rate(items.filter((item) => item.mode === 'experience').length, items.length);
  const informationRate = rate(items.filter((item) => item.mode === 'information').length, items.length);
  const confusionRate = rate(items.filter((item) => item.mode === 'unclear').length, items.length);
  const payPositive = items.filter((item) => item.pay === 'yes').length;

  return {
    count: items.length,
    identityRate: rate(identityMatches, items.length),
    nextYesRate: rate(yesCount, items.length),
    clarityScore: avg(items.map((item) => item.clarity)) * 20,
    intrigueScore: avg(items.map((item) => item.intrigue)) * 20,
    diffScore: avg(items.map((item) => item.differentiation)) * 20,
    payRate: rate(payPositive, items.length),
    confusionRate,
    relationRate,
    informationRate,
    experienceRate
  };
}

function deriveVerdict(metrics, model, brief) {
  if (!model) {
    return { label: 'NOT READY', className: 'more', badge: 'info', confidence: 0, reason: '아직 가설이 생성되지 않았습니다.', bullets: [], nextActions: [] };
  }

  const confidence = Math.round((metrics.identityRate * 0.28) + (metrics.nextYesRate * 0.24) + (metrics.diffScore * 0.18) + (metrics.clarityScore * 0.14) + (metrics.payRate * 0.10) + ((100 - metrics.confusionRate) * 0.06));
  const coreMismatch = (brief.format === 'character' && metrics.informationRate > metrics.relationRate) || (brief.format === 'performance' && metrics.informationRate > metrics.experienceRate);
  const tooEarly = metrics.count < 5;

  let label = 'ITERATE';
  let className = 'iterate';
  let badge = 'warning';
  let reason = '반응은 보이지만, 한 번 더 압축하고 다시 물어봐야 합니다.';

  if (tooEarly) {
    label = 'MORE EVIDENCE';
    className = 'more';
    badge = 'info';
    reason = '응답 수가 아직 적습니다. 최소 5명, 가능하면 10명 이상이 되어야 판단이 안정됩니다.';
  } else if (confidence >= 75 && !coreMismatch && metrics.nextYesRate >= 55 && metrics.confusionRate < 25) {
    label = 'GO';
    className = 'go';
    badge = 'ok';
    reason = '핵심 인식, 재방문 의향, 차별감이 모두 기준선 이상입니다. 다음 단계 파일럿으로 밀어도 됩니다.';
  } else if (coreMismatch || (metrics.identityRate < 45 && metrics.count >= 5)) {
    label = 'PIVOT';
    className = 'pivot';
    badge = 'danger';
    reason = '사람들이 이 IP를 의도와 다르게 받아들이고 있습니다. 메시지 중심을 바꿔야 합니다.';
  } else if (metrics.nextYesRate < 20 && metrics.payRate < 10 && metrics.count >= 8) {
    label = 'STOP';
    className = 'stop';
    badge = 'danger';
    reason = '흥미와 다음 행동이 모두 약합니다. 이 방향을 계속 미는 것보다 문제 정의를 다시 잡는 편이 낫습니다.';
  }

  const bullets = [
    `응답 ${metrics.count}개 기준, 첫 인식 적중률은 ${metrics.identityRate}%입니다.`,
    `재방문 YES 비율은 ${metrics.nextYesRate}%입니다.`,
    `차별감은 ${Math.round(metrics.diffScore) / 20}/5, 명확성은 ${Math.round(metrics.clarityScore) / 20}/5 수준입니다.`,
    `행동 전환 신호(결제/구독/참여 의향)는 ${metrics.payRate}%입니다.`,
    `혼란/애매 응답은 ${metrics.confusionRate}%입니다.`
  ];

  const nextActions = buildNextActions(label, brief, metrics);

  return { label, className, badge, confidence, reason, bullets, nextActions };
}

function buildNextActions(label, brief, metrics) {
  if (label === 'GO') {
    return [
      '지금 반응이 좋았던 프로토타입 1종만 남기고 길이를 늘린 2차 파일럿을 만든다.',
      `행동 목표가 ${goalLabel(brief.businessGoal)}라면, 이제 실제 전환 장치(구독 폼/예매 링크/대기 리스트)를 붙인다.`,
      '응답자 코멘트에서 가장 많이 기억된 표현/오브제를 공식 메시지로 승격한다.'
    ];
  }
  if (label === 'PIVOT') {
    return [
      '사람들이 실제로 받아들인 인식 축을 버리지 말고, 그쪽으로 콘셉트 문장을 다시 쓴다.',
      '설정 설명을 줄이고 첫 만남 장면 하나만 강하게 남기는 버전으로 재실험한다.',
      '형태를 유지할지(오디오/영상/공연), 메시지를 유지할지 중 하나만 남기고 나머지는 갈아엎는다.'
    ];
  }
  if (label === 'STOP') {
    return [
      '이 IP 자체를 더 미는 대신, 반응이 있었던 요소만 분리해 새 가설로 재출발한다.',
      '같은 타깃에게 전혀 다른 약속 문장 2개를 만들어 다시 비교 테스트한다.',
      '문제 정의가 진짜 아픈 문제였는지 인터뷰부터 다시 한다.'
    ];
  }
  if (label === 'MORE EVIDENCE') {
    return [
      '최소 5명, 가능하면 10명까지 같은 질문 구조로 응답을 더 모은다.',
      '응답자 유형을 섞지 말고 핵심 타깃 비율을 높인다.',
      '버전이 여러 개라면 무엇을 봤는지 꼭 기록해 비교 가능하게 만든다.'
    ];
  }
  return [
    '가장 낮은 지표 하나만 골라 다음 실험 목표로 삼는다.',
    '좋아 보였던 설명을 줄이고, 사용자가 기억한 장면을 더 전면으로 올린다.',
    '설문이 아니라 짧은 관찰 메모를 함께 남겨 맥락을 보존한다.'
  ];
}

function currentValueFor(source, metrics) {
  if (source === 'mode') return metrics.identityRate;
  if (source === 'next') return metrics.nextYesRate;
  if (source === 'differentiation') return metrics.diffScore;
  if (source === 'clarity') return metrics.clarityScore;
  if (source === 'pay') return metrics.payRate;
  return 0;
}

function hypothesisStatus(current, threshold, source) {
  const score = source === 'clarity' || source === 'differentiation' ? current : current;
  if (!state.responses.length) return { label: '데이터 없음', badge: 'info' };
  if (score >= threshold) return { label: '통과 가능', badge: 'ok' };
  if (score >= threshold - 10) return { label: '경계선', badge: 'warning' };
  return { label: '재설계 필요', badge: 'danger' };
}

function formatMetric(source, current) {
  if (source === 'clarity' || source === 'differentiation') return `${(current / 20).toFixed(1)}/5`;
  return `${current}%`;
}

function rate(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function clampNumber(value, min, max) {
  const num = Number(value);
  return Math.min(max, Math.max(min, Number.isFinite(num) ? num : min));
}

function labelForMode(mode) {
  return {
    relationship: '관계 / 만남',
    information: '정보 / 기능',
    experience: '경험 / 장면',
    unclear: '애매함'
  }[mode] || mode;
}

function labelForNext(next) {
  return { yes: '다음 행동 있음', maybe: '보통', no: '없음' }[next] || next;
}

function labelForPrototype(type) {
  return { audio: '오디오', video: '영상', character: '캐릭터', performance: '공연/체험' }[type] || type;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function setStatus(message) {
  els.status.innerHTML = message;
}

function exportJson() {
  downloadFile(`${slugify(state.brief.title || 'origin-pilot-kit')}.json`, JSON.stringify(state, null, 2), 'application/json');
}

function importJson(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      state = imported;
      hydrateBrief();
      saveState();
      renderAll();
      setStatus('JSON 상태를 불러왔습니다.');
    } catch (error) {
      setStatus('JSON 불러오기에 실패했습니다. 파일 형식을 확인하세요.');
    }
  };
  reader.readAsText(file, 'utf-8');
  event.target.value = '';
}

function resetAll() {
  if (!confirm('현재 입력과 응답 로그를 초기화할까요?')) return;
  state = { brief: { ...sampleSaju }, model: null, responses: [] };
  hydrateBrief();
  saveState();
  renderAll();
  setStatus('초기화되었습니다.');
}

function downloadMarkdown() {
  const metrics = computeMetrics();
  const verdict = deriveVerdict(metrics, state.model, state.brief);
  const model = state.model || buildValidationModel(state.brief);
  const brief = state.brief;
  const markdown = `# ORIGIN PILOT KIT 검증 리포트\n\n` +
    `- IP 제목: ${brief.title || ''}\n` +
    `- 형태: ${model.typeName}\n` +
    `- 생성 시각: ${formatDate(model.generatedAt || new Date().toISOString())}\n` +
    `- 핵심 질문: ${model.primaryQuestion}\n\n` +
    `## IP 브리프\n` +
    `- 한 줄 설명: ${brief.oneLiner || ''}\n` +
    `- 타깃: ${brief.audience || ''}\n` +
    `- 문제: ${brief.problem || ''}\n` +
    `- 약속: ${brief.promise || ''}\n` +
    `- 핵심 리스크: ${brief.risks || ''}\n\n` +
    `## 검증 가설\n` +
    model.hypotheses.map((h, idx) => `${idx + 1}. **${h.title}**\n   - 질문: ${h.question}\n   - 성공기준: ${h.successMetric}\n`).join('\n') +
    `\n## 실험 설계\n` +
    model.experiments.map((e, idx) => `${idx + 1}. **${e.title}**\n   - 목표: ${e.objective}\n   - 프로토타입: ${e.prototype}\n   - PASS: ${e.pass}\n`).join('\n') +
    `\n## 사용자 반응 요약\n` +
    `- 응답 수: ${metrics.count}\n` +
    `- 첫 인식 적중률: ${metrics.identityRate}%\n` +
    `- 재방문 YES: ${metrics.nextYesRate}%\n` +
    `- 차별감: ${(metrics.diffScore / 20).toFixed(1)}/5\n` +
    `- 명확성: ${(metrics.clarityScore / 20).toFixed(1)}/5\n` +
    `- 행동 전환 신호: ${metrics.payRate}%\n` +
    `- 혼란 응답: ${metrics.confusionRate}%\n\n` +
    `## 현재 판단\n` +
    `**${verdict.label}** — ${verdict.reason}\n\n` +
    `### 다음 액션\n` +
    verdict.nextActions.map((item) => `- ${item}`).join('\n') +
    `\n\n### 원본 응답 로그\n` +
    (state.responses.length ? state.responses.map((r, idx) => `${idx + 1}. ${formatDate(r.createdAt)} / ${r.participant} / ${labelForMode(r.mode)} / ${labelForNext(r.next)} / 기억: ${r.memory || '-'} / 메모: ${r.comment || '-'}`).join('\n') : '- 아직 없음');

  downloadFile(`${slugify(brief.title || 'origin-pilot-kit')}-validation-report.md`, markdown, 'text/markdown;charset=utf-8');
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR');
}

function slugify(value) {
  return String(value || 'origin-pilot-kit').trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-+|-+$/g, '');
}

function escapeHtml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
