// Each option pair has a defensible benefit and an explicit opportunity cost.
// Copy is keyed by immutable scenario/option IDs, not by English wording.
export const scenarioMessages = {
  PS01: {
    prompt: [
      'You have one hour to investigate a frustrating booking system. User observation and log review overlap, so you can do only one. Where do you start?',
      '你有一小時調查令人困擾的預約系統。使用者觀察與紀錄查閱時段重疊，只能選一項。你會先做哪一項？',
    ],
    a: [
      'Observe three users booking and learn about their difficulties directly.',
      '觀察三位使用者預約，直接了解他們遇到的困難。',
      'You prioritise direct, contextual evidence. A few users can reveal mechanisms but not how widespread they are; later check whether the pattern appears in the logs.',
      '你優先考慮直接、具情境的證據。少量使用者可揭示原因，卻未必反映普遍程度；之後可查看紀錄中是否也有同樣模式。',
    ],
    b: [
      'Review failed bookings and complaints to find recurring patterns.',
      '查閱失敗預約及投訴，找出重複出現的模式。',
      'You prioritise coverage and recurring patterns. Existing records may miss unreported friction; later observe a case that could explain the pattern.',
      '你優先考慮覆蓋範圍及重複模式。現有紀錄可能遺漏未被反映的困難；之後可觀察一個有助解釋模式的個案。',
    ],
  },
  PS02: {
    prompt: [
      'A key component may arrive late. You have one afternoon and one teammate. What would you prioritise?',
      '關鍵零件可能延遲送達。你有一個下午及一位隊友。你會優先做甚麼？',
    ],
    a: [
      'Test an available substitute together and document what changes.',
      '一起測試現有的替代零件，並記錄需要改動的地方。',
      'You prioritise testing a tangible fallback. That uses time that could protect other work; decide what test result would justify the redesign.',
      '你優先測試具體的後備方案。這會佔用本可用於安排其他工作的時間；可先說明甚麼測試結果足以支持重新設計。',
    ],
    b: [
      'Replan the tasks that do not depend on the component.',
      '重排不依賴該零件的任務，讓其他工作繼續進行。',
      'You prioritise coordination and continuity. The fallback risk remains open; set a decision point early enough to leave time for a substitute test.',
      '你優先考慮協調及工作連續性。後備方案的風險仍未解決；可把決策時點設得足夠早，預留測試替代零件的時間。',
    ],
    c: [
      'Build a mock interface so both people can test the surrounding work.',
      '建立模擬介面，讓兩人先測試零件周邊的工作。',
      'You prioritise progress around the missing component. A mock can reveal interface problems, but it cannot verify the real part; define what must be retested when it arrives.',
      '你優先推進零件周邊的工作。模擬介面可揭示連接問題，但不能驗證真實零件；應列明零件到達後必須重測的內容。',
    ],
  },
  PS03: {
    prompt: [
      'A sensor does not fit its enclosure. Both revisions are safe and functional, but only one team can revise its work before tomorrow. Which change would you prioritise?',
      '感測器放不進外殼。兩種修改都安全可行，但明天前只能由一個團隊修改。你會優先改哪一部分？',
    ],
    a: [
      'Keep the enclosure and relocate the sensor.',
      '保留外殼，移動感測器。',
      'You protect the mechanical design and move the change into electronics. Agree on the new routing and calibration workload rather than treating relocation as free.',
      '你保留機械設計，把改動轉移到電子部分。應協定新的走線及校準工作量，而非把移位視為沒有代價。',
    ],
    b: [
      'Keep the sensor location and revise the enclosure.',
      '保留感測器位置，修改外殼。',
      'You protect the sensing arrangement and move the change into mechanics. Agree on manufacturing time and the fit check rather than assuming the new enclosure is straightforward.',
      '你保留感測配置，把改動轉移到機械部分。應協定製作時間及配合檢查，而非假設新外殼很容易完成。',
    ],
  },
  PS04: {
    prompt: [
      'After a wiring change, a robot behaves unpredictably on a safe test stand. A demonstration starts in 30 minutes. What would you do first?',
      '改動接線後，機械人在安全測試架上出現不規則動作。示範將於 30 分鐘後開始。你會先做甚麼？',
    ],
    a: [
      'Restore the documented wiring and retest the baseline.',
      '恢復已記錄的接線，重測基準版本。',
      'You prioritise recovery using a known reference. This limits learning about the new fault today; preserve the changed configuration in notes for later diagnosis.',
      '你優先利用已知參考恢復運作，但今天對新故障的了解會較有限；可記錄改動後的配置，留待之後診斷。',
    ],
    b: [
      'Measure the changed wiring and try to isolate the cause.',
      '量度改動後的接線，嘗試隔離原因。',
      'You prioritise causal understanding before reverting. This may leave less time for recovery; agree on a safe, reduced demonstration if the diagnosis remains open.',
      '你優先了解原因，而非立即還原，但可能剩下較少恢復時間；若仍未找出原因，可預先協定安全、縮減範圍的示範。',
    ],
  },
  PS05: {
    prompt: [
      'Users find a prototype handle awkward. You have two short user sessions and cannot extend them. What would you focus on?',
      '使用者覺得原型手柄不順手。你只有兩節不能延長的短時間使用者測試，會聚焦甚麼？',
    ],
    a: [
      'Compare two handle versions on the same task.',
      '讓兩位使用者在相同任務中比較兩款不同的手柄。',
      'You prioritise comparison between alternatives. A preference alone may not explain the mechanism; note one observation to investigate after selecting a direction.',
      '你優先比較替代方案。單看偏好未必能解釋原因；可記下一項觀察，在選定方向後繼續調查。',
    ],
    b: [
      'Study one handle closely and observe where each user struggles.',
      '仔細觀察一款手柄，了解每位使用者在哪裏遇到困難。',
      'You prioritise depth within the current design. That may reveal useful causes without establishing a better alternative; turn the observation into a testable revision.',
      '你優先深入了解現有設計。這可能揭示原因，卻尚未證明哪個替代方案較好；可把觀察轉化為可測試的修改。',
    ],
    c: [
      'Let each user adjust one feature, then try the task again.',
      '讓每位使用者調整一項特徵，再次嘗試任務。',
      'You prioritise participation in shaping the revision. Different adjustments can reveal preferences, but make comparison less controlled; record why each change was chosen.',
      '你優先讓使用者參與修改。不同調整可揭示偏好，但會降低比較的一致性；應記錄每項改動的選擇原因。',
    ],
  },
  PS06: {
    prompt: [
      'A prototype passed one lab test. You have three minutes with a potential user and will state its limits. What would you emphasise?',
      '原型通過了一次實驗室測試。你有三分鐘向潛在使用者介紹，並會說明限制。你會着重甚麼？',
    ],
    a: [
      'Demonstrate the tested function live and show how it operates.',
      '現場示範已測試的功能，讓使用者看見它如何運作。',
      'You prioritise a concrete demonstration of the evidence. Keep the tested conditions visible, and invite later discussion of applications the demonstration does not cover.',
      '你優先具體展示已有證據。應清楚交代測試條件，並邀請對方之後討論示範未涵蓋的應用。',
    ],
    b: [
      'Show the test record and discuss the user’s setting.',
      '展示測試紀錄，並討論使用者的實際環境。',
      'You prioritise interpretation and context. Without seeing the function, the user may find its operation less concrete; offer a focused demonstration as a follow-up.',
      '你優先解釋證據及使用情境。沒有親眼看見功能，對方可能較難理解運作；可安排之後作針對性示範。',
    ],
    c: [
      'Ask what decision the user needs to make, then present only relevant evidence.',
      '先問使用者需要作甚麼決定，再展示相關證據。',
      'You prioritise relevance to the user’s immediate decision. Tailoring the conversation means covering less of the prototype; note what important evidence still needs a follow-up.',
      '你優先回應使用者當下的決定。針對性介紹會減少原型其他內容的覆蓋；應記下仍需跟進的重要證據。',
    ],
  },
  PS07: {
    prompt: [
      'A small user group cannot complete a non-safety-critical task with your prototype. You have one work session before the next trial. Which need would you address first?',
      '一小群使用者無法用原型完成一項不涉及安全的任務。下一次試用前只有一節工作時間，你會先處理哪種需要？',
    ],
    a: [
      'Co-design a temporary workaround with the group.',
      '與該群體共同設計暫時的替代做法。',
      'You prioritise immediate access. A workaround can conceal an unresolved need; record its limits and keep the underlying design issue on the next investigation list.',
      '你優先讓使用者及早參與。替代做法可能掩蓋未解決的需要；可記錄限制，並把根本設計問題保留在下一輪調查中。',
    ],
    b: [
      'Observe the failed task and revisit the requirement.',
      '觀察失敗的任務，重新檢視要求。',
      'You prioritise understanding the excluded need. The group still lacks a working route today; explain the interim limitation and agree how they can contribute to the trial.',
      '你優先了解被遺漏的需要，但該群體暫時仍沒有可行做法；應說明目前限制，並協定他們如何參與試用。',
    ],
    c: [
      'Simplify the next trial task so the group can participate.',
      '簡化下一次試用任務，讓該群體可以參與。',
      'You prioritise participation within the available session. A simpler task may not test the original requirement; state clearly what the revised trial can and cannot show.',
      '你優先讓該群體在現有時段內參與。簡化任務可能無法測試原有要求；應清楚說明這次試用能及不能反映甚麼。',
    ],
  },
  PS08: {
    prompt: [
      'Both designs meet essential safety and performance needs. Your budget allows either an extra feature or easier repairs. Which would you prioritise?',
      '兩個設計都符合必要的安全及性能要求。預算只夠增加一項功能，或選擇較易維修的裝置。你會優先選哪個？',
    ],
    a: [
      'Choose the cheaper unit and include the extra feature.',
      '選擇較便宜的裝置，加入額外功能。',
      'You prioritise capability within the current budget. The decision depends on how valuable the extra feature is relative to future repair demands; make that assumption explicit.',
      '你優先考慮現有預算下的功能。決定取決於額外功能相對未來維修需要的價值；應清楚說明這項假設。',
    ],
    b: [
      'Choose the repairable unit and omit the extra feature.',
      '選擇較易維修的裝置，不加入額外功能。',
      'You prioritise maintainability over immediate feature breadth. The decision depends on expected use and repair needs; check whether users value that benefit more than the omitted feature.',
      '你優先考慮可維護性，而非眼前的功能廣度。決定取決於預期用途及維修需要；可確認使用者是否更重視這項好處。',
    ],
  },
  PS09: {
    prompt: [
      'A teammate is blocked on an integration task. You have two hours, and they agree that either form of help would work. Which would you choose?',
      '隊友的整合任務受阻。你有兩小時，對方同意兩種支援方式都可行。你會選哪種？',
    ],
    a: [
      'Work through the blocker together while they keep ownership.',
      '一起處理障礙，並讓對方繼續負責該任務。',
      'You prioritise support and shared learning. Pairing consumes both people’s time; agree on the smallest useful outcome and make your delayed work visible.',
      '你優先考慮支援與共同學習。結對工作會佔用雙方時間；可協定最小有用成果，並讓團隊知道你的工作會延後。',
    ],
    b: [
      'Agree a small handover and complete that part separately.',
      '協定小範圍交接，分開完成該部分。',
      'You prioritise distributing work to recover progress. The handover may leave knowledge fragmented; plan a short explanation when the two parts reconnect.',
      '你優先分配工作以恢復進度。交接可能令知識分散；可在重新整合時安排簡短說明。',
    ],
  },
  PS10: {
    prompt: [
      'Two subsystems pass separate tests but fail together. You have one bench session and both tools are ready. Which investigation would you prioritise?',
      '兩個子系統分開測試都通過，連接後卻失效。你只有一節測試時間，兩種工具都已準備好。你會優先做哪種調查？',
    ],
    a: [
      'Measure the connected system and trace a real failure.',
      '量度連接後的系統，追查真實故障。',
      'You prioritise realism in the failing system. Interactions may complicate diagnosis; decide which trace would most clearly narrow the next test.',
      '你優先保留故障系統的真實情境。互相影響可能令診斷更複雜；可先決定哪項紀錄最能縮小下一次測試的範圍。',
    ],
    b: [
      'Replace one subsystem with a test harness to isolate the interface.',
      '以測試工具替代一個子系統，隔離介面表現。',
      'You prioritise control and isolation. A harness can hide context-dependent faults; identify what it leaves out before generalising the result to the full system.',
      '你優先控制及隔離變項。測試工具可能隱藏依賴情境的故障；把結果推及完整系統前，應找出工具未涵蓋甚麼。',
    ],
    c: [
      'Compare time-aligned logs from the separate subsystem tests.',
      '比較兩個子系統分開測試時的同步紀錄。',
      'You prioritise using existing evidence to inspect the interface. Logs may reveal a mismatch without reproducing the live interaction; use the finding to choose the next bench test.',
      '你優先利用現有證據檢查介面。紀錄可能揭示不匹配之處，卻未重現真實互動；應用結果決定下一次測試。',
    ],
  },
  PS11: {
    prompt: [
      'A revised prototype performs worse after three changes. A review is tomorrow, and you have time either to restore the baseline or investigate one change. What comes first?',
      '改了三處後，原型表現變差。明天要評審，你的時間只夠恢復基準版本或調查一項改動。你會先做甚麼？',
    ],
    a: [
      'Restore and verify the baseline for the review.',
      '恢復並核實基準版本，以供評審。',
      'You prioritise a dependable reference for the review. Keep the changed version and observations so that recovery does not erase the next learning opportunity.',
      '你優先為評審提供可靠的參考。可保留改動版本及觀察，避免恢復基準時抹去下一次學習的機會。',
    ],
    b: [
      'Isolate and test one change before the review.',
      '評審前隔離並測試其中一項改動。',
      'You prioritise learning from iteration. A focused result may be more informative but less complete; clearly separate what you tested from what the prototype can currently demonstrate.',
      '你優先從迭代中學習。聚焦的結果可能更有啟發但不夠完整；應清楚區分已測試內容與原型目前能示範的內容。',
    ],
  },
  PS12: {
    prompt: [
      'A nontechnical partner misunderstands a limitation. You have one minute left and will clarify it before ending. Which explanation would you use?',
      '非技術背景的合作夥伴誤解了一項限制。你只剩一分鐘，會在結束前釐清。你會使用哪種解釋方式？',
    ],
    a: [
      'Use an example from their intended use, then check their understanding.',
      '用對方預期用途的例子，再確認理解。',
      'You prioritise relevance to the partner’s decisions. The example may not explain other cases; note the boundary beyond which the same explanation may not apply.',
      '你優先讓解釋與對方的決策相關。例子未必能解釋其他情況；可指出哪些範圍不宜直接套用相同解釋。',
    ],
    b: [
      'Use a simple diagram of the mechanism, then check their understanding.',
      '用簡單原理圖說明機制，再確認理解。',
      'You prioritise a model that can support later reasoning. The practical consequence may remain abstract; connect the diagram to one real decision in your follow-up.',
      '你優先建立有助日後推理的模型，但實際影響可能仍較抽象；跟進時可把圖解連結至一個真實決定。',
    ],
    c: [
      'Ask them to explain their understanding, then correct the key gap.',
      '請對方說明目前的理解，再更正最關鍵的誤解。',
      'You prioritise locating the misunderstanding before explaining. This targets the main gap but leaves less time for a complete explanation; agree on one point to follow up.',
      '你優先找出誤解所在，再作解釋。這能針對主要問題，但完整說明的時間較少；可協定一項之後跟進的重點。',
    ],
  },
} as const;
