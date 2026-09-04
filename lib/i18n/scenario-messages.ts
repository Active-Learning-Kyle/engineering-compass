// Each option pair has a defensible benefit and an explicit opportunity cost.
// Copy is keyed by immutable scenario/option IDs, not by English wording.
export const scenarioMessages = {
  PS01: {
    prompt: [
      'You have one hour to investigate a frustrating booking system. The observation session and log review overlap, so you can do only one. Where do you start?',
      '你只有一小時調查令人困擾的預約系統。使用者觀察與紀錄查閱時段重疊，只能選一項。你會從哪裏開始？',
    ],
    a: [
      'Observe three users making bookings; gain detail about their difficulties, but leave the wider usage pattern for later.',
      '觀察三位使用者預約，深入了解他們的困難，但把整體使用模式留待之後分析。',
      'You prioritise direct, contextual evidence. A few users can reveal mechanisms but not how widespread they are; later check whether the pattern appears in the logs.',
      '你優先考慮直接、具情境的證據。少量使用者可揭示原因，卻未必反映普遍程度；之後可查看紀錄中是否也有同樣模式。',
    ],
    b: [
      'Review failed bookings and complaints; identify recurring patterns, but leave the users’ immediate experience for later observation.',
      '查閱失敗預約及投訴，找出重複模式，但把使用者當下的體驗留待之後觀察。',
      'You prioritise coverage and recurring patterns. Existing records may miss unreported friction; later observe a case that could explain the pattern.',
      '你優先考慮覆蓋範圍及重複模式。現有紀錄可能遺漏未被反映的困難；之後可觀察一個有助解釋模式的個案。',
    ],
  },
  PS02: {
    prompt: [
      'A key component may arrive late. With one afternoon and one available teammate, which response would you prioritise?',
      '關鍵零件可能延遲送達。你只有一個下午及一位可協助的隊友，會優先採取哪種應對？',
    ],
    a: [
      'Test an available substitute with your teammate; reduce the technical uncertainty now, accepting that the integration plan may need rework.',
      '與隊友測試現有替代零件，先降低技術不確定性，並接受之後可能要重做整合計劃。',
      'You prioritise testing a tangible fallback. That uses time that could protect other work; decide what test result would justify the redesign.',
      '你優先測試具體的後備方案。這會佔用本可用於安排其他工作的時間；可先說明甚麼測試結果足以支持重新設計。',
    ],
    b: [
      'Replan independent tasks with your teammate; protect the current architecture, accepting that the substitute remains untested until the decision deadline.',
      '與隊友重排不依賴該零件的任務，保留現有架構，並接受替代零件要到決策期限才處理。',
      'You prioritise coordination and continuity. The fallback risk remains open; set a decision point early enough to leave time for a substitute test.',
      '你優先考慮協調及工作連續性。後備方案的風險仍未解決；可把決策時點設得足夠早，預留測試替代零件的時間。',
    ],
  },
  PS03: {
    prompt: [
      'A sensor does not fit the enclosure. Both revisions meet safety and performance requirements, but only one team can revise its work before tomorrow. Which would you pursue?',
      '感測器放不進外殼。兩種修改都符合安全及性能要求，但明天前只能由一個團隊修改。你會採取哪一種？',
    ],
    a: [
      'Keep the enclosure and relocate the sensor; preserve the mechanical work, while asking electronics to revise routing and repeat calibration.',
      '保留外殼並移動感測器，保留機械設計成果，但請電子團隊修改走線並重新校準。',
      'You protect the mechanical design and move the change into electronics. Agree on the new routing and calibration workload rather than treating relocation as free.',
      '你保留機械設計，把改動轉移到電子部分。應協定新的走線及校準工作量，而非把移位視為沒有代價。',
    ],
    b: [
      'Keep the sensor location and revise the enclosure; preserve calibration work, while asking mechanics to adjust the model and remake parts.',
      '保留感測器位置並修改外殼，保留校準成果，但請機械團隊調整模型並重製零件。',
      'You protect the sensing arrangement and move the change into mechanics. Agree on manufacturing time and the fit check rather than assuming the new enclosure is straightforward.',
      '你保留感測配置，把改動轉移到機械部分。應協定製作時間及配合檢查，而非假設新外殼很容易完成。',
    ],
  },
  PS04: {
    prompt: [
      'After a wiring change, a robot behaves unpredictably on a safe test stand. You have 30 minutes before a demonstration. Which route would you take first?',
      '接線改動後，機械人在安全測試架上出現不規則動作。距離示範只有 30 分鐘，你會先採取哪條路線？',
    ],
    a: [
      'Restore the documented wiring and retest the baseline; recover a working demonstration, while postponing investigation of the new configuration.',
      '恢復已記錄的接線並重測基準版本，爭取恢復示範，同時延後調查新配置。',
      'You prioritise recovery using a known reference. This limits learning about the new fault today; preserve the changed configuration in notes for later diagnosis.',
      '你優先利用已知參考恢復運作，但今天對新故障的了解會較有限；可記錄改動後的配置，留待之後診斷。',
    ],
    b: [
      'Measure signals in the changed wiring and isolate a cause; learn about the fault, while accepting a narrower demonstration if time runs out.',
      '量度改動接線的訊號並隔離原因，了解故障，同時接受時間不足時縮減示範內容。',
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
      'Compare two handle variants on the same task; learn which performs better, while spending less time exploring why each user struggles.',
      '在相同任務中比較兩款手柄，了解哪款表現較好，但減少深入了解個別困難原因的時間。',
      'You prioritise comparison between alternatives. A preference alone may not explain the mechanism; note one observation to investigate after selecting a direction.',
      '你優先比較替代方案。單看偏好未必能解釋原因；可記下一項觀察，在選定方向後繼續調查。',
    ],
    b: [
      'Study one handle closely during the task; learn where each user struggles, while postponing a direct comparison with an alternative design.',
      '仔細觀察一款手柄的使用過程，了解每位使用者的困難，但延後與替代設計的直接比較。',
      'You prioritise depth within the current design. That may reveal useful causes without establishing a better alternative; turn the observation into a testable revision.',
      '你優先深入了解現有設計。這可能揭示原因，卻尚未證明哪個替代方案較好；可把觀察轉化為可測試的修改。',
    ],
  },
  PS06: {
    prompt: [
      'A prototype has passed one lab test. You have three minutes with a potential user and will state the limits either way. What would you emphasise?',
      '原型通過了一次實驗室測試。你有三分鐘向潛在使用者介紹，兩種方式都會說明限制。你會着重甚麼？',
    ],
    a: [
      'Demonstrate the tested function live; make its operation tangible, while leaving less time to discuss uses outside the tested conditions.',
      '現場示範已測試的功能，讓運作更具體，但減少討論測試條件以外用途的時間。',
      'You prioritise a concrete demonstration of the evidence. Keep the tested conditions visible, and invite later discussion of applications the demonstration does not cover.',
      '你優先具體展示已有證據。應清楚交代測試條件，並邀請對方之後討論示範未涵蓋的應用。',
    ],
    b: [
      'Show the test record and discuss the user’s setting; clarify relevance and unknowns, while leaving out a live demonstration of the function.',
      '展示測試紀錄並討論使用環境，釐清相關性與未知之處，但不現場示範功能。',
      'You prioritise interpretation and context. Without seeing the function, the user may find its operation less concrete; offer a focused demonstration as a follow-up.',
      '你優先解釋證據及使用情境。沒有親眼看見功能，對方可能較難理解運作；可安排之後作針對性示範。',
    ],
  },
  PS07: {
    prompt: [
      'A small user group cannot complete a non-safety-critical task with your prototype. You have one work session before the next trial. Which need would you address first?',
      '一小群使用者無法用原型完成一項不涉及安全的任務。下一次試用前只有一節工作時間，你會先處理哪種需要？',
    ],
    a: [
      'Co-design a temporary workaround with that group; enable participation sooner, while postponing investigation of the underlying design mismatch.',
      '與該群體共同設計暫時替代做法，讓他們較早參與，但延後調查設計不配合的根本原因。',
      'You prioritise immediate access. A workaround can conceal an unresolved need; record its limits and keep the underlying design issue on the next investigation list.',
      '你優先讓使用者及早參與。替代做法可能掩蓋未解決的需要；可記錄限制，並把根本設計問題保留在下一輪調查中。',
    ],
    b: [
      'Observe the failed task and revisit the requirement; clarify the design mismatch, while postponing a usable workaround until after the trial.',
      '觀察失敗的任務並重審要求，釐清設計不配合之處，但把可用的替代做法延至試用後。',
      'You prioritise understanding the excluded need. The group still lacks a working route today; explain the interim limitation and agree how they can contribute to the trial.',
      '你優先了解被遺漏的需要，但該群體暫時仍沒有可行做法；應說明目前限制，並協定他們如何參與試用。',
    ],
  },
  PS08: {
    prompt: [
      'Two designs meet all essential safety and performance requirements. Your fixed budget can fund either a cheaper unit plus an extra feature, or a repairable unit without that feature. Which would you prioritise?',
      '兩個設計都符合必要的安全及性能要求。固定預算只夠較便宜的裝置加一項額外功能，或較易維修的裝置但不加該功能。你會優先選哪個？',
    ],
    a: [
      'Choose the cheaper unit and deliver the extra feature; offer more capability now, accepting harder repairs and possible replacement costs later.',
      '選較便宜的裝置並提供額外功能，先增加功能，同時接受日後較難維修及可能需要更換的成本。',
      'You prioritise capability within the current budget. The decision depends on how valuable the extra feature is relative to future repair demands; make that assumption explicit.',
      '你優先考慮現有預算下的功能。決定取決於額外功能相對未來維修需要的價值；應清楚說明這項假設。',
    ],
    b: [
      'Choose the repairable unit and omit the extra feature; protect future maintenance options, accepting a smaller feature set for current users.',
      '選較易維修的裝置並省去額外功能，保留未來維護選擇，同時接受目前提供較少功能。',
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
      'Work through the blocker together and keep their ownership; build shared understanding, accepting that your own task will finish later.',
      '一起處理障礙，保留對方的負責角色，建立共同理解，同時接受自己的任務會延後完成。',
      'You prioritise support and shared learning. Pairing consumes both people’s time; agree on the smallest useful outcome and make your delayed work visible.',
      '你優先考慮支援與共同學習。結對工作會佔用雙方時間；可協定最小有用成果，並讓團隊知道你的工作會延後。',
    ],
    b: [
      'Agree a small handover and complete that part separately; restore parallel progress, accepting less shared learning about the original blocker.',
      '協定小範圍交接並分開完成該部分，恢復平行進度，同時接受較少一起理解原有障礙的機會。',
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
      'Instrument the connected system and trace a real failure; preserve the operating context, accepting a larger set of interacting variables to interpret.',
      '在連接後的系統加入量測，追查真實故障，保留運作情境，同時接受要分析更多互相影響的變項。',
      'You prioritise realism in the failing system. Interactions may complicate diagnosis; decide which trace would most clearly narrow the next test.',
      '你優先保留故障系統的真實情境。互相影響可能令診斷更複雜；可先決定哪項紀錄最能縮小下一次測試的範圍。',
    ],
    b: [
      'Replace one subsystem with a known test harness; isolate the interface behaviour, accepting that the harness may omit a real operating interaction.',
      '以已知測試工具替代一個子系統，隔離介面表現，同時接受工具可能未涵蓋真實運作中的某種互動。',
      'You prioritise control and isolation. A harness can hide context-dependent faults; identify what it leaves out before generalising the result to the full system.',
      '你優先控制及隔離變項。測試工具可能隱藏依賴情境的故障；把結果推及完整系統前，應找出工具未涵蓋甚麼。',
    ],
  },
  PS11: {
    prompt: [
      'A revised prototype performs worse after three changes. A review is tomorrow, and you have time either to restore the baseline or investigate one change. What comes first?',
      '改了三處後，原型表現變差。明天要評審，你的時間只夠恢復基準版本或調查一項改動。你會先做甚麼？',
    ],
    a: [
      'Restore and verify the baseline for the review; present dependable performance, while postponing what you could learn from the recent changes.',
      '恢復並核實基準版本以供評審，展示穩定表現，同時延後從近期改動中學習的機會。',
      'You prioritise a dependable reference for the review. Keep the changed version and observations so that recovery does not erase the next learning opportunity.',
      '你優先為評審提供可靠的參考。可保留改動版本及觀察，避免恢復基準時抹去下一次學習的機會。',
    ],
    b: [
      'Isolate and test one change before the review; explain a stronger causal finding, while accepting a less complete demonstration of the overall prototype.',
      '評審前隔離並測試一項改動，解釋較清楚的因果發現，同時接受完整原型的示範會較有限。',
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
      'Use an example from their intended use and check their understanding; prioritise practical consequences, while leaving the technical mechanism for follow-up.',
      '用對方預期用途的例子並確認理解，優先說明實際影響，把技術原理留待之後跟進。',
      'You prioritise relevance to the partner’s decisions. The example may not explain other cases; note the boundary beyond which the same explanation may not apply.',
      '你優先讓解釋與對方的決策相關。例子未必能解釋其他情況；可指出哪些範圍不宜直接套用相同解釋。',
    ],
    b: [
      'Use a simple diagram of the mechanism and check their understanding; prioritise a reusable mental model, while leaving application-specific consequences for follow-up.',
      '用簡單原理圖並確認理解，優先建立可延伸的概念模型，把特定應用的影響留待之後跟進。',
      'You prioritise a model that can support later reasoning. The practical consequence may remain abstract; connect the diagram to one real decision in your follow-up.',
      '你優先建立有助日後推理的模型，但實際影響可能仍較抽象；跟進時可把圖解連結至一個真實決定。',
    ],
  },
} as const;
