import {
  questions,
  behaviourScale,
  technicalScale,
  interestOptions,
  growthOptions,
} from '../assessment/questions';
import { competencies } from '../assessment/competencies';
import { toolkit } from '../assessment/toolkit';
import { engineeringModes, growthStages } from '../assessment/profile';
import { studyYears } from '../assessment/years';
import { growthActions } from '../assessment/growth-actions';
import { proChecks } from '../assessment/pro';
import { proScenarioTranslations, evidenceTranslations } from './pro-zh';

export type Locale = 'en' | 'zh-Hant';
export const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
export const zhHant: Record<string, string> = {};
function add(english: string, chinese: string) {
  zhHant[normalize(english).toLowerCase()] = chinese;
}
function rows(english: string[], chinese: string[]) {
  if (english.length !== chinese.length)
    throw new Error('Translation row count mismatch');
  english.forEach((text, index) => add(text, chinese[index]));
}

rows(
  questions.map((q) => q.prompt),
  [
    '提出解決方案前，我會先了解實際發生的情況。',
    '在團隊專案中，我會承擔自己的職責，交付讓隊友可以信賴的成果。',
    '我會因應不同聽眾的需要，調整介紹工程問題及解決方案的方式。',
    '選定方案前，我會根據專案要求比較不同的解決方法。',
    '我會及早製作原型，讓測試所得仍有機會影響設計。',
    '我會整合來自不同技術背景的隊友所提出的相關想法與方法。',
    '我會運用證據，確認一個工程問題是否值得解決。',
    '我會設計測試，以回答特定問題或檢驗明確的成功準則。',
    '我會把想法轉化為可執行的計劃，訂立清晰的里程碑及分工。',
    '我會以相關證據支持解決方案中的重要主張。',
    '當原型失敗時，我會先找出可能的原因，再決定如何修改。',
    '當團隊意見不一致時，我會協助釐清問題，推動大家作出可行的決定。',
    '開始工作前，我會找出可能影響方案安全性、可行性或負責任使用的重要風險。',
    '我會把廣泛的關注事項轉化為團隊可以着手處理的具體工程問題。',
    '我會如實說明方案的重要限制及取捨。',
    '你能多獨立地使用合適工具，組裝、調整及排查基本機械系統的故障？',
    '你能多獨立地把量度數據或草圖轉化為可編輯的三維模型，並兼顧配合與製造要求？',
    '你能多獨立地利用三維打印、激光切割等工序，準備並製作零件？',
    '你能多獨立地利用麵包板或焊接方式搭建基本電子電路，並進行量度及故障排查？',
    '你能多獨立地編寫程式，並除錯以實現指定功能？',
    '你能多獨立地使用 Raspberry Pi、Arduino、ESP32 或類似平台，讀取輸入並控制輸出？',
    '你能多獨立地連接和校準感測器，並可靠地收集或傳輸數據？',
    '你能多獨立地應用或調整人工智能或電腦視覺流程，並評估其輸出是否有用？',
    '你能多獨立地把各個子系統連接起來，建立可靠的端到端或自動化系統？',
    '你完成過多少個涉及製作、測試、分析或整合解決方案的工程專案？',
    '你在工程專案中承擔過的最高責任程度是甚麼？',
    '接下來，你最想探索哪些類型的工程工作？',
    '接下來，你最想提升哪些能力？',
    '原型的感測器讀數突然變得不穩定。你最可能先做甚麼？',
    '團隊偏好現有設計，但公平的測試顯示它未達到一項重要成功準則。你最可能怎樣做？',
  ],
);

const optionTranslations: Record<string, string[]> = {
  C01: ['尚未完成任何專案', '一個', '兩個', '三至四個', '五個或以上'],
  C02: [
    '觀察或跟隨示範',
    '在密切、逐步指導下完成指定任務',
    '負責熟悉的任務，偶爾需要協助或覆核',
    '獨立負責一個子系統、測試或主要成果',
    '協調介面，或整合不同成員或子系統的工作',
  ],
  J01: [
    '同時調整裝置的幾個部分，看看讀數有否改善。',
    '先重新啟動系統或更換感測器，之後才檢查其他部分。',
    '重複同一測試，確認不穩定情況是否持續。',
    '檢查裝置設定、預期範圍、連接及校準，每次只改動一個可能原因。',
    '設計簡短的診斷測試，比較證據與預期表現，逐一隔離變項並記錄結論。',
  ],
  J02: [
    '因為時間表已定，保留現有設計，並把結果視為異常。',
    '稍作調整後反覆測試，直到設計達到準則。',
    '繼續採用現有設計，但報告它未達到這項準則。',
    '檢視測試質素和準則，然後修改設計，或明確說明取捨的理由。',
    '核實證據、比較可行替代方案、記錄決定，並清楚傳達限制。',
  ],
};
for (const q of questions)
  if ('options' in q && optionTranslations[q.id])
    rows(
      q.options.map((o) => o.label),
      optionTranslations[q.id],
    );
rows(
  interestOptions.map((o) => o.label),
  [
    '建築環境與基礎設施',
    '機械人與自動化',
    '機械與產品設計',
    '電子與聯網裝置',
    '軟件與數碼系統',
    '數據、人工智能與電腦視覺',
    '能源與可持續發展',
    '健康、無障礙與輔助科技',
    '營運、物流與複雜系統',
    '其他／尚未確定',
  ],
);
rows(
  growthOptions.map((o) => o.label),
  [
    '識別與界定問題',
    '把提案轉化為可行計劃',
    '跨角色與跨學科協作',
    '搭建系統與排查故障',
    '製作原型、測試與迭代',
    '介紹與推介工程方案',
    '機械組裝與機構',
    'CAD 與三維建模',
    '數碼製造',
    '電子技術',
    '程式編寫',
    '實體運算',
    '感測器、數據與物聯網',
    '人工智能／電腦視覺',
    '系統整合與自動化',
    '學習不熟悉的工程工具與方法',
    '尚未確定',
  ],
);

const competencyZh = [
  ['問題識別', '問題識別', '先調查並界定挑戰，再着手解決。'],
  ['提案與規劃', '規劃', '把有潛力的方向轉化為可行的前進路線。'],
  ['跨學科協作', '協作', '協調職責、觀點與決策。'],
  ['實作技能', '實作', '你目前在各技術領域的接觸廣度、經驗及獨立程度。'],
  ['設計思維與原型製作', '設計', '透過證據製作原型、測試、診斷及改進。'],
  ['工程方案推介', '表達', '清楚傳達價值、證據、限制與取捨。'],
];
Object.values(competencies).forEach((c, i) =>
  rows([c.label, c.short, c.description], competencyZh[i]),
);
const toolkitZh = [
  [
    '機械組裝與機構',
    '機械',
    '組裝、對位、調整與機構檢查。',
    '手工具組裝',
    '對位與配合',
    '機構檢查',
    '故障排查',
  ],
  [
    'CAD 與三維建模',
    'CAD',
    '建立兼顧配合及製造要求的可編輯模型。',
    '草圖轉模型',
    '參數化編輯',
    '配合與公差',
    '可製造性設計',
  ],
  [
    '數碼製造',
    '製造',
    '利用數碼工序準備並製作零件。',
    '檔案準備',
    '工序設定',
    '材料與參數選擇',
    '零件製作',
  ],
  [
    '電子技術',
    '電子技術',
    '搭建、量度、焊接及排查電路故障。',
    '麵包板與接線',
    '電路量度',
    '焊接',
    '電路故障排查',
  ],
  [
    '程式編寫',
    '程式編寫',
    '閱讀、修改、編寫程式及除錯。',
    '閱讀與修改程式',
    '編寫指定功能',
    '邏輯除錯',
    '輸出測試',
  ],
  [
    '實體運算',
    '實體運算',
    '使用嵌入式平台讀取輸入並控制輸出。',
    '微控制器與單板電腦',
    '數碼與模擬輸入／輸出',
    '輸入感測',
    '輸出控制',
  ],
  [
    '感測器、數據與物聯網',
    '感測器與物聯網',
    '校準感測器，並收集或傳輸有用的數據。',
    '感測器校準',
    '數據收集',
    '數據質素檢查',
    '傳輸與物聯網',
  ],
  [
    '人工智能／電腦視覺',
    'AI／電腦視覺',
    '應用模型或視覺流程，並評估其輸出。',
    '輸入準備',
    '模型或視覺流程',
    '輸出評估',
    '限制與可靠性',
  ],
  [
    '系統整合與自動化',
    '整合',
    '連接子系統，實現可靠的端到端運作。',
    '介面定義',
    '子系統連接',
    '端到端測試',
    '自動化可靠性',
  ],
];
Object.values(toolkit).forEach((c, i) =>
  rows([c.label, c.short, c.description, ...c.skills], toolkitZh[i]),
);
const modesZh = [
  [
    '問題定義者',
    '決定解決甚麼之前，你會仔細了解實際情況。',
    '在團隊中，你尤其擅長釐清真正需要、蒐集證據，並把廣泛的關注轉化為可着手解決的問題。',
  ],
  [
    '專案領航者',
    '你能把有潛力的方向轉化為大家可以實際跟隨的路線。',
    '在團隊中，你尤其擅長把有潛力的方向轉化為清晰的要求、里程碑、分工及可行計劃。',
  ],
  [
    '團隊連結者',
    '你能讓不同的人、想法及技術貢獻有效配合。',
    '在團隊中，你尤其擅長連結不同專業、釐清分工，並協助大家處理分歧及相互依賴的工作。',
  ],
  [
    '實作建構者',
    '當想法變成可以組裝、測試及改進的實物時，你學得特別快。',
    '在團隊中，你尤其擅長把討論轉化為可運作的原型、排查故障，並讓大家看清實際限制。',
  ],
  [
    '原型探索者',
    '你運用原型與測試，找出下一步應該改進的地方。',
    '在團隊中，你尤其擅長製作早期原型、設計有效測試，並把證據轉化為有針對性的改進。',
  ],
  [
    '方案傳達者',
    '你能讓聽眾理解工程方案，感受到它的可信度與切身價值。',
    '在團隊中，你尤其擅長清楚說明問題及價值、以證據支持主張，並如實傳達限制。',
  ],
];
Object.values(engineeringModes).forEach((c, i) =>
  rows([c.name, c.shortDescription, c.contribution], modesZh[i]),
);
Object.values(growthStages).forEach((c, i) =>
  rows(
    [c.name, c.description],
    [
      ['探索中', '在指導下嘗試不熟悉的工程任務。'],
      ['建構中', '在一些支援下負責熟悉的任務。'],
      ['實踐中', '獨立負責子系統、測試或成果。'],
      ['整合中', '連結不同成員、介面或子系統的工作。'],
    ][i],
  ),
);
studyYears.forEach((c, i) =>
  rows(
    [c.label, c.note],
    [
      ['一年級', '開始修讀工程本科。'],
      ['二年級', '累積學科知識及專案經驗。'],
      ['三年級', '承擔更深入的技術及團隊責任。'],
      ['四年級', '透過進階專案整合經驗。'],
    ][i],
  ),
);
rows(Object.values(growthActions), [
  '訪問一位受問題影響的人，再根據一項觀察及一項限制重新寫出問題陳述。',
  '把小型成果拆分為里程碑，找出風險最高的假設，並與隊友檢視計劃。',
  '與另一學科的隊友協定各介面的負責人，再確認雙方都理解交接安排。',
  '搭建一個小型可運作系統，記錄故障現象、可能原因、測試及改動。',
  '製作低成本原型來回答一個問題。觀察別人使用，再根據證據修改一項功能。',
  '用兩分鐘介紹方案，加入一項證據及一項限制，然後詢問哪些地方不夠清楚。',
  '組裝簡單機構，檢查配合與對位，並記錄一項調整如何影響運動。',
  '用可編輯尺寸建立兩個配合零件的模型，檢查間隙，並請別人覆核其可製造性。',
  '以獲准使用的工序製作小型試件，先比較實際尺寸與模型，再製作完整零件。',
  '在指導下搭建低電壓電路，比較量度值與預測後，再修改設計。',
  '編寫輸入及輸出清晰的小程式，加入一般及邊界情況測試，並排查不符合預期的結果。',
  '在微控制器上把輸入連接至輸出，先分別測試，再整合成一項功能。',
  '對照參考值重複收集感測器讀數，檢查變化，並記錄缺失或不可靠的數據。',
  '以未用於訓練的例子評估小型模型，分析錯誤，並記錄哪些情況下不宜信賴其預測。',
  '依照協定的介面連接兩個子系統，測試正常運作、輸入缺失及故障後的恢復。',
  '選用一項不熟悉的工具完成小任務，先跟隨範例，再改動一處重做，並解釋所學。',
  '嘗試一個不熟悉的專案角色，累積新證據後再回顧這份反思。',
]);

proChecks
  .filter((q) => q.phase === 'proScenarios')
  .forEach((q, i) => {
    rows(
      [q.prompt, ...q.options.flatMap((o) => [o.label, o.feedback])],
      proScenarioTranslations[i],
    );
  });
proChecks
  .filter((q) => q.phase === 'proEvidence')
  .forEach((q, i) => {
    const [task, evidence] = evidenceTranslations[i];
    add(q.prompt, `回想你曾經${task}的經驗。以下哪項描述最符合你的情況？`);
    add(q.helper!, `可以回想${evidence}等證據。毋須上載任何資料。`);
    rows(
      q.options.map((o) => o.feedback),
      [
        `先在支援下完成一項任務，並保留${evidence}。`,
        `重做任務中的一小部分、解釋步驟，並與有經驗的人一起檢視${evidence}。`,
        `主動負責下一次檢查，並記錄${evidence}。`,
        `向隊友解釋${evidence}，再測試一個不熟悉的情況，延伸已有經驗。`,
      ],
    );
  });

// Exact source-text keys keep stable question IDs, answer values and scoring untouched.
export function addUiTranslations(pairs: Record<string, string>) {
  Object.entries(pairs).forEach(([en, zh]) => add(en, zh));
}
// The scale strings are also checked by the catalog coverage tests.
export const scales = [behaviourScale, technicalScale];
