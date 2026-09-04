/** Pilot revision copy. Stable keys are shared by both languages. */
export const refinementMessages = {
  'assessment.exclusiveHint': [
    'Deselect this option to choose specific areas.',
    '取消此選項後，即可選擇具體範疇。',
  ],
  'assessment.behaviour.helper': [
    'Think about recent learning or practical tasks, such as class exercises, labs, group assignments, coding, or making something yourself. You do not need experience from a formal engineering project. You may draw on different experiences for different questions. Answer based on what you actually did, not what you think you should do.',
    '請回想你近期的學習或實作經歷，例如課堂練習、實驗、小組作業、編程或個人製作，不一定是正式工程專案。不同題目可以參考不同經歷。請按實際做過的事回答，不需要猜測自己應該怎樣做。',
  ],
  'scale.behaviour.prompt': [
    'When you encountered this situation, how often did you do this?',
    '遇到以下情況時，你有多常這樣做？',
  ],
  'scale.behaviour.low': ['Never', '從不'],
  'scale.behaviour.high': ['Almost always', '幾乎每次'],
  'scale.behaviour.details.0': ['Never', '從不'],
  'scale.behaviour.details.1': ['Rarely', '很少'],
  'scale.behaviour.details.2': ['Sometimes', '有時'],
  'scale.behaviour.details.3': ['Often', '經常'],
  'scale.behaviour.details.4': ['Almost always', '幾乎每次'],
  'question.B01.prompt': [
    'Before trying to solve a problem, I look at what happens when it occurs.',
    '想辦法解決問題前，我會先查看問題實際發生時的情況。',
  ],
  'question.B02.prompt': [
    'When working with others, I finish my part by the time we agreed.',
    '和別人一起做任務時，我會在約定的時間內完成自己負責的部分。',
  ],
  'question.B03.prompt': [
    'When someone does not understand my idea, I try explaining it in a different way.',
    '向別人解釋想法時，如果對方沒聽懂，我會換一種方式解釋。',
  ],
  'question.B04.prompt': [
    'When there are several ways to do a task, I compare how well they meet what the task needs.',
    '有幾種做法可以選擇時，我會比較它們是否能達到這次任務的要求。',
  ],
  'question.B05.prompt': [
    'Before making the full version, I make a simple version to try out the main idea.',
    '製作完整作品前，我會先做一個簡單版本，試試主要想法是否可行。',
  ],
  'question.B05.helper': [
    'A simple version could be a paper model, a short piece of code, or just one part.',
    '簡單版本可以是一個紙模型、一小段程式，或只做其中一個部分。',
  ],
  'question.B06.prompt': [
    'During a task, I use a method learned in another subject or field to help solve the problem.',
    '做任務時，我會用另一個科目或領域學到的方法，幫助處理眼前的問題。',
  ],
  'question.B07.prompt': [
    'When someone tells me about a problem, I look for a specific example to check what the problem is.',
    '別人告訴我有一個問題時，我會先找具體例子，確認問題是甚麼。',
  ],
  'question.B08.prompt': [
    'Before testing a method, I decide what result would show that it works.',
    '開始測試前，我會先決定看到甚麼結果，才算這個方法有效。',
  ],
  'question.B09.prompt': [
    'Before starting a task, I list the steps I need to take.',
    '開始一項任務前，我會先列出要做的幾個步驟。',
  ],
  'question.B10.prompt': [
    'When explaining why an approach works, I use actual results or information to support what I say.',
    '解釋為甚麼一個做法可行時，我會用實際結果或資料來支持自己的說法。',
  ],
  'question.B11.prompt': [
    'When something I have made does not work as expected, I check a possible cause before changing it.',
    '做出來的東西沒有按預期運作時，我會先檢查可能的原因，再作修改。',
  ],
  'question.B12.prompt': [
    'When people disagree about what to do, I help clarify exactly where their views differ.',
    '大家對做法有不同意見時，我會幫忙弄清楚，大家究竟在哪一點上不同意。',
  ],
  'question.B13.prompt': [
    'When part of a plan might go wrong, I work out how I could respond before it happens.',
    '計劃中有一個環節可能出問題時，我會先想好遇到它可以怎樣應對。',
  ],
  'question.B14.prompt': [
    'When a problem is broad, I identify which part I will work on in this task.',
    '遇到一個很大的問題時，我會先確定其中哪一部分是這次要處理的。',
  ],
  'question.B15.prompt': [
    'When explaining my approach to someone, I also describe what it cannot do.',
    '向別人介紹自己的做法時，我也會說明它有哪些做不到的地方。',
  ],
  'assessment.scenarios.helper': [
    'Both options are reasonable. Given the constraint, choose what you would prioritise first—not the answer that sounds more impressive.',
    '兩個選項都有合理之處。請根據限制，選擇你實際會優先做的事，而非聽起來較厲害的答案。',
  ],
  'assessment.scenarios.note': [
    'These choices explore priorities under constraints. Feedback describes the benefit and cost of each approach; neither option earns points.',
    '這些選擇探索你在限制下的優先考慮。回饋會說明各做法的價值與代價；兩個選項都不會獲得分數。',
  ],
  'home.standard.purpose': [
    'A quick reflection on how you work and your technical experience.',
    '快速了解你的工作方式及技術經驗。',
  ],
  'home.pro.purpose': [
    'Explore engineering trade-offs and evidence from tasks you have actually done.',
    '深入反思工程取捨，以及實際做過的任務證據。',
  ],
  'home.begin': ['Begin {edition}', '開始 {edition}'],
  'assessment.questionCount': [
    'Question {current} of {total}',
    '第 {current} 題，共 {total} 題',
  ],
  'assessment.selectedCount': ['{count} selected', '已選 {count} 項'],
  'assessment.scaleValue': ['{value} of 5', '{value} 分（共 5 分）'],
  'role.preview': ['Preview {name}', '預覽{name}'],
  'role.illustration': ['{name} character illustration', '{name}角色插圖'],
  'result.analysis.leading': [
    'Your highest displayed score is in {first}; the next is in {second}. Read these as current self-reports, not fixed roles or objective ability levels.',
    '你的最高顯示分數是「{first}」，其次是「{second}」。這些反映目前的自述，並非固定角色或客觀能力等級。',
  ],
  'result.analysis.practice': [
    'One area to explore further is {area}. Consider both your opportunities to practise and the experiences behind your answers.',
    '可以進一步探索「{area}」。請同時考慮你獲得的練習機會，以及答案背後的實際經驗。',
  ],
  'result.role.eyebrow': [
    'YOUR LEADING CURRENT ENGINEERING MODES',
    '你目前領先的工程工作方式',
  ],
  'result.role.proEyebrow': [
    'PRO · YOUR LEADING CURRENT ENGINEERING MODES',
    'PRO · 你目前領先的工程工作方式',
  ],
  'result.role.also': [
    'Next-highest current mode(s)',
    '目前分數次高的工作方式',
  ],
  'result.role.sharedNote': [
    'Several modes share your highest displayed score. Consider which contribution fits your next project.',
    '多種工作方式的顯示分數並列最高。可考慮哪種貢獻最適合你的下一個專案。',
  ],
  'result.quick.strengths': ['DIRECTIONS TO EXPLORE', '可探索的方向'],
  'result.role.tied': [
    'Joint leading modes at the displayed score',
    '按顯示分數並列領先的方向',
  ],
  'result.role.balanced': ['A balanced current profile', '目前的能力表現均衡'],
  'result.role.balancedNote': [
    'All six displayed scores are equal. No single role stands out; explore the six modes below.',
    '六項顯示分數相同，沒有單一角色特別突出；可探索下方六種工作方式。',
  ],
  'result.role.disclaimer': [
    'These are directions to explore, not a personality type or professional rank. Small score differences should not decide your team role.',
    '這些是值得探索的方向，並非性格類型或專業職級。細微的分數差異不應決定你的團隊角色。',
  ],
  'result.scope.label': ['CURRENT EXPERIENCE SCOPE', '目前的經驗範圍'],
  'result.scope.note': [
    'An approximate reflection of your reported projects, responsibilities and toolkit experience—not a qualification or seniority level.',
    '根據你自述的專案、責任及技術經驗作概括反思，並非資格或資歷等級。',
  ],
  'result.toolkit.level': [
    'Level {number}/5 · {label}',
    '等級 {number}/5 · {label}',
  ],
  'result.toolkit.selfRating': ['SELF-RATED INDEPENDENCE', '自評獨立程度'],
  'result.evidence.label': ['PRACTICE EVIDENCE', '實作證據'],
  'result.evidence.depth': [
    'Tasks you report completing and checking independently: {count} of {total}',
    '自述曾獨立完成並檢查的任務：{count}／{total}',
  ],
  'result.evidence.participation': [
    'Explained contributions: {count} of {total} tasks',
    '自述能解釋自己貢獻的任務：{count}／{total}',
  ],
  'result.evidence.selfReport': [
    'Based on your descriptions of two specific tasks, not externally verified evidence. These counts do not change your 0–100 rating.',
    '根據你對兩項具體任務的自述，未經外部核實。這些次數不會改變你的 0–100 自評分數。',
  ],
  'result.evidence.incomplete': [
    'Some task reflections are unanswered; no depth summary is shown yet.',
    '部分任務反思尚未作答，暫不顯示經驗深度摘要。',
  ],
  'evidence.consistency.aligned': [
    'Your broad rating and both task descriptions indicate independently checked work within these examples—not expertise across the whole field.',
    '你的整體自評及兩項任務描述均指向能獨立檢查成果；這只適用於這些例子，不代表精通整個領域。',
  ],
  'evidence.consistency.mixed': [
    'Your broad rating is high, while at least one specific task is new or guided. This may reflect uneven experience within the area; consider the examples before revisiting your rating.',
    '你的整體自評較高，但至少一項具體任務仍較新或需要指導。這可能反映領域內的經驗差異；可參照具體例子再檢視自評。',
  ],
  'evidence.consistency.varied': [
    'Use the two task descriptions to put your broad rating in context and choose your next practice.',
    '可根據兩項任務的具體描述理解整體自評，並選擇下一步練習。',
  ],
  'result.quick.strength': ['ONE STRENGTH TO USE', '一項可發揮的優勢'],
  'result.quick.next': ['ONE NEXT STEP', '下一步行動'],
  'result.version': ['Question set: {version}', '題目版本：{version}'],
  'draft.previous': [
    'There is an unfinished draft from an earlier question set on this device. It is preserved separately; start the revised questions for a new profile.',
    '此裝置保留了舊題目版本的未完成草稿。舊草稿會分開保留；請以修訂後的題目開始新的能力概況。',
  ],
  'pro.choice.label': ['Your choice: ', '你的選擇：'],
  'pro.feedback.title': ['The trade-off in your choice', '你選擇中的取捨'],
  'pro.feedback.intro': [
    'Your 12 choices show what you would prioritise under the stated constraints. Each approach has a benefit and a cost; this is not an answer key or an additional score.',
    '你的 12 項選擇呈現了在指定限制下會優先考慮甚麼。每種做法都有價值與代價；這不是標準答案或額外分數。',
  ],
} as const;
