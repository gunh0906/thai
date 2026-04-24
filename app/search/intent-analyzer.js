export function createIntentAnalyzer({
  SEARCH_OBJECT_RULES,
  SEARCH_ACTION_RULES,
  unique,
  normalizeText,
  matchesSearchRule,
  resolveIntentPhrase,
}) {
  const SPECIFIC_BILLING_RULE_IDS = [
    "dormFeeBilling",
    "utilityBillBilling",
    "electricBillBilling",
    "waterBillBilling",
    "maintenanceBilling",
  ];
  const SPECIFIC_SERVICE_RULE_IDS = [
    "bankService",
    "transferService",
    "postOffice",
    "beautySalon",
    "barberShop",
    "reservationService",
    "parcelLocker",
    "pickupDesk",
    "pickupCode",
    "parcelPickup",
    "parcelTracking",
    "deliveryComplete",
    "exchangeService",
    "returnService",
    "refundService",
    "cancellationService",
    "deliveryDelay",
    "misdelivery",
    "damagedDelivery",
    "lostDelivery",
    "doorstepDelivery",
    "simCard",
    "phoneTopUp",
  ];
  const SPECIFIC_WORKSITE_RULE_IDS = [
    "teamLeaderWork",
    "moldRoomFacility",
    "moldTooling",
    "moldChangeService",
    "moldRepairService",
    "moldCleaningService",
    "injectionMachine",
    "pressMachine",
    "corePart",
    "cavityPart",
    "firstSampleCheck",
    "meetingRoomFacility",
    "reportWork",
    "reportDocumentWork",
    "approvalWork",
    "handoverWork",
    "lateArrivalWork",
    "annualLeaveWork",
    "leaveFormWork",
    "resignationLetterWork",
    "businessTripWork",
    "warehouseFacility",
    "breakRoomFacility",
    "officeFacility",
    "lockerRoomFacility",
    "workwear",
    "workbenchFacility",
    "loadingAreaFacility",
    "partSupply",
    "tooling",
    "glovesGear",
    "safetyVestGear",
    "earplugsGear",
    "safetyGlassesGear",
    "safetyBeltGear",
    "barcodeScanner",
    "workLabel",
    "workChecklist",
    "materialSupply",
    "palletItem",
    "forkliftVehicle",
    "productionLine",
    "emergencyStopButton",
    "defectItem",
  ];
  const GENERIC_WORK_OBJECT_RULE_IDS = ["factoryWork", "workTask", "machine", "hr", "time", "workHours", "problem"];

  function buildIntentHints(query, patternTexts) {
    let objectRules = SEARCH_OBJECT_RULES.filter((rule) => matchesSearchRule(rule, patternTexts));
    const normalizedQuery = normalizeText(query);
    const hasExplicitPriceQuery = /얼마|가격|요금|비용|비싸|깎|깍|할인/.test(normalizedQuery);
    const directSpecificBillingRuleIds = objectRules
      .filter(
        (rule) =>
          SPECIFIC_BILLING_RULE_IDS.includes(rule.id) &&
          (rule.patterns || []).some((pattern) => pattern.test(normalizedQuery))
      )
      .map((rule) => rule.id);
    const directSpecificServiceRuleIds = objectRules
      .filter(
        (rule) =>
          SPECIFIC_SERVICE_RULE_IDS.includes(rule.id) &&
          (rule.patterns || []).some((pattern) => pattern.test(normalizedQuery))
      )
      .map((rule) => rule.id);
    const directSpecificWorksiteRuleIds = objectRules
      .filter(
        (rule) =>
          SPECIFIC_WORKSITE_RULE_IDS.includes(rule.id) &&
          (rule.patterns || []).some((pattern) => pattern.test(normalizedQuery))
      )
      .map((rule) => rule.id);
    if (directSpecificBillingRuleIds.length) {
      objectRules = objectRules.filter(
        (rule) => !SPECIFIC_BILLING_RULE_IDS.includes(rule.id) || directSpecificBillingRuleIds.includes(rule.id)
      );
    }
    if (directSpecificServiceRuleIds.length) {
      objectRules = objectRules.filter(
        (rule) => !SPECIFIC_SERVICE_RULE_IDS.includes(rule.id) || directSpecificServiceRuleIds.includes(rule.id)
      );
    }
    if (directSpecificWorksiteRuleIds.length) {
      objectRules = objectRules.filter((rule) => !GENERIC_WORK_OBJECT_RULE_IDS.includes(rule.id));
      objectRules = objectRules.filter(
        (rule) => !SPECIFIC_WORKSITE_RULE_IDS.includes(rule.id) || directSpecificWorksiteRuleIds.includes(rule.id)
      );
    }
    if (objectRules.some((rule) => rule.id === "education")) {
      objectRules = objectRules.filter((rule) => !["workTask", "machine", "factoryWork", "problem"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "machineNoise")) {
      objectRules = objectRules.filter((rule) => !["noise", "problem"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "computer")) {
      objectRules = objectRules.filter((rule) => !["machine", "problem"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "factoryWork")) {
      objectRules = objectRules.filter((rule) => rule.id !== "machine");
    }
    if (objectRules.some((rule) => rule.id === "internetIssue")) {
      objectRules = objectRules.filter((rule) => rule.id !== "problem");
    }
    if (objectRules.some((rule) => rule.id === "wetTissue")) {
      objectRules = objectRules.filter((rule) => !["water", "tissue"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "gift")) {
      objectRules = objectRules.filter((rule) => !["water", "juice", "fruit"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "plant")) {
      objectRules = objectRules.filter((rule) => rule.id !== "water");
    }
    if (objectRules.some((rule) => rule.id === "smokingAction")) {
      objectRules = objectRules.filter((rule) => rule.id !== "smoking");
    }
    if (objectRules.some((rule) => rule.id === "giftBag")) {
      objectRules = objectRules.filter((rule) => rule.id !== "gift");
    }
    if (objectRules.some((rule) => rule.id === "trashCan")) {
      objectRules = objectRules.filter((rule) => rule.id !== "tissue");
    }
    if (objectRules.some((rule) => rule.id === "powerBank")) {
      objectRules = objectRules.filter((rule) => rule.id !== "computer");
    }
    if (objectRules.some((rule) => ["bankService", "transferService"].includes(rule.id))) {
      objectRules = objectRules.filter((rule) => !["stock", "hr"].includes(rule.id));
    }
    if (objectRules.some((rule) => SPECIFIC_WORKSITE_RULE_IDS.includes(rule.id))) {
      objectRules = objectRules.filter((rule) => !GENERIC_WORK_OBJECT_RULE_IDS.includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "moldRoomFacility")) {
      objectRules = objectRules.filter(
        (rule) => !["moldTooling", "moldChangeService", "moldRepairService", "moldCleaningService"].includes(rule.id)
      );
    }
    if (objectRules.some((rule) => rule.id === "moldCleaningService")) {
      objectRules = objectRules.filter((rule) => !["cleanliness", "problem"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "moldRepairService")) {
      objectRules = objectRules.filter((rule) => rule.id !== "problem");
    }
    if (objectRules.some((rule) => rule.id === "reportWork")) {
      objectRules = objectRules.filter((rule) => !["reportDocumentWork", "tool"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "reportDocumentWork")) {
      objectRules = objectRules.filter((rule) => !["reportWork", "tool"].includes(rule.id));
    }
    if (objectRules.some((rule) => ["productionLine", "emergencyStopButton"].includes(rule.id))) {
      objectRules = objectRules.filter((rule) => rule.id !== "machine");
    }
    if (objectRules.some((rule) => rule.id === "officeFacility")) {
      objectRules = objectRules.filter((rule) => rule.id !== "hr");
    }
    if (
      objectRules.some((rule) =>
        [
          "parcelLocker",
          "pickupDesk",
          "pickupCode",
          "parcelPickup",
          "parcelTracking",
          "deliveryComplete",
          "deliveryDelay",
          "misdelivery",
          "damagedDelivery",
          "lostDelivery",
          "doorstepDelivery",
        ].includes(rule.id)
      )
    ) {
      objectRules = objectRules.filter((rule) => rule.id !== "postOffice");
    }
    if (objectRules.some((rule) => ["parcelLocker", "pickupDesk", "pickupCode"].includes(rule.id))) {
      objectRules = objectRules.filter((rule) => rule.id !== "parcelPickup");
    }
    if (objectRules.some((rule) => rule.id === "deliveryComplete")) {
      objectRules = objectRules.filter((rule) => !["completion", "parcelTracking", "deliveryDelay"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "deliveryDelay")) {
      objectRules = objectRules.filter((rule) => rule.id !== "parcelTracking");
    }
    if (objectRules.some((rule) => rule.id === "misdelivery")) {
      objectRules = objectRules.filter((rule) => !["lostDelivery", "parcelTracking", "policeStation"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "damagedDelivery")) {
      objectRules = objectRules.filter((rule) => !["problem", "lostDelivery", "parcelTracking", "policeStation"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "lostDelivery")) {
      objectRules = objectRules.filter((rule) => !["parcelTracking", "deliveryDelay", "policeStation"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "cancellationService")) {
      objectRules = objectRules.filter((rule) => rule.id !== "reservationService");
    }
    if (objectRules.some((rule) => rule.id === "doorstepDelivery")) {
      objectRules = objectRules.filter((rule) => rule.id !== "completion");
    }
    if (!hasExplicitPriceQuery && objectRules.some((rule) => ["ticketOffice", "exchangeOffice"].includes(rule.id))) {
      objectRules = objectRules.filter((rule) => rule.id !== "price");
    }
    if (objectRules.some((rule) => ["washingMachine", "dryer", "laundryShop"].includes(rule.id))) {
      objectRules = objectRules.filter((rule) => rule.id !== "laundry");
    }
    if (objectRules.some((rule) => SPECIFIC_BILLING_RULE_IDS.includes(rule.id))) {
      objectRules = objectRules.filter((rule) => !["dormitory", "price"].includes(rule.id));
    }
    if (objectRules.some((rule) => rule.id === "message" || rule.id === "phoneCall")) {
      objectRules = objectRules.filter((rule) => rule.id !== "phone");
    }
    if (objectRules.some((rule) => ["phoneTopUp", "simCard"].includes(rule.id))) {
      objectRules = objectRules.filter((rule) => rule.id !== "phone");
    }
    let actionRules = SEARCH_ACTION_RULES.filter((rule) => matchesSearchRule(rule, patternTexts));
    const hasWhereAction = actionRules.some((rule) => rule.id === "where");
    if (hasWhereAction && objectRules.some((rule) => ["ticketOffice", "exchangeOffice"].includes(rule.id))) {
      actionRules = actionRules.filter((rule) => rule.id !== "buy");
    }
    if (objectRules.some((rule) => SPECIFIC_BILLING_RULE_IDS.includes(rule.id))) {
      actionRules = actionRules.filter((rule) => rule.id !== "buy");
    }
    if (
      objectRules.some((rule) =>
        ["pickupCode", "parcelPickup", "parcelTracking", "deliveryComplete", "deliveryDelay", "misdelivery", "damagedDelivery", "lostDelivery"].includes(rule.id)
      )
    ) {
      actionRules = actionRules.filter((rule) => !["where", "go", "buy"].includes(rule.id));
    }
    if (objectRules.some((rule) => ["exchangeService", "returnService", "refundService", "cancellationService"].includes(rule.id))) {
      actionRules = actionRules.filter((rule) => !["where", "go"].includes(rule.id));
    }
    if (objectRules.some((rule) => ["reportWork", "reportDocumentWork"].includes(rule.id))) {
      actionRules = actionRules.filter((rule) => rule.id !== "bring");
    }
    if (objectRules.some((rule) => rule.id === "doorstepDelivery")) {
      actionRules = actionRules.filter((rule) => !["where", "go", "buy"].includes(rule.id));
    }
    const nonGenericActionRules = actionRules.filter((rule) => !["request", "exist"].includes(rule.id));
    const actionTermRules = actionRules.filter((rule) => {
      if (rule.id === "request" || rule.id === "exist") {
        return !nonGenericActionRules.length;
      }
      return true;
    });
    const objectLabels = unique(
      objectRules
        .flatMap((rule) => (rule.display && rule.display.length ? rule.display : rule.terms || []))
        .map((item) => normalizeText(item))
        .filter(Boolean)
    ).slice(0, 3);
    const phrases = [];

    objectRules.forEach((rule) => {
      (rule.phrases || []).forEach((phrase) => {
        if (phrase.includes("{object}") && objectLabels.length) {
          objectLabels.forEach((label) => phrases.push(resolveIntentPhrase(phrase, label)));
          return;
        }
        phrases.push(resolveIntentPhrase(phrase));
      });
    });

    actionRules.forEach((rule) => {
      (rule.phrases || []).forEach((phrase) => {
        if (phrase.includes("{object}") && objectLabels.length) {
          objectLabels.forEach((label) => phrases.push(resolveIntentPhrase(phrase, label)));
          return;
        }
        if (!phrase.includes("{object}")) {
          phrases.push(resolveIntentPhrase(phrase));
        }
      });
    });

    if (objectLabels.length) {
      const actionIds = new Set(actionRules.map((rule) => rule.id));
      if (actionIds.has("where")) {
        objectLabels.forEach((label) => {
          phrases.push(resolveIntentPhrase("{object} 어디예요?", label));
          phrases.push(resolveIntentPhrase("{object} 어디에요?", label));
        });
      }
      if (actionIds.has("go")) {
        objectLabels.forEach((label) => {
          phrases.push(resolveIntentPhrase("{object} 가고 싶어요", label));
          phrases.push(resolveIntentPhrase("{object} 가야 해요", label));
          phrases.push(resolveIntentPhrase("{object} 가요", label));
        });
      }
      if (actionIds.has("bring")) {
        objectLabels.forEach((label) => {
          phrases.push(resolveIntentPhrase("{object} 가져와 주세요", label));
          phrases.push(resolveIntentPhrase("{object} 가져다 주세요", label));
        });
      }
      if (actionIds.has("change")) {
        objectLabels.forEach((label) => phrases.push(resolveIntentPhrase("{object} 바꿔 주세요", label)));
      }
      if (actionIds.has("show")) {
        objectLabels.forEach((label) => phrases.push(resolveIntentPhrase("{object} 보여주세요", label)));
      }
      if (actionIds.has("request")) {
        objectLabels.forEach((label) => phrases.push(resolveIntentPhrase("{object} 주세요", label)));
      }
      if (objectRules.some((rule) => rule.id === "meal") && (actionIds.has("go") || actionIds.has("eat"))) {
        phrases.push("점심 먹으러 가자", "점심 먹으러 갈래요?", "밥 먹으러 가자");
      }
    }

    const actionIds = new Set(actionRules.map((rule) => rule.id));
    if (!objectLabels.length && actionIds.has("where")) {
      phrases.push("어디예요?", "어디에요?", "어디에 있어요?");
      if (actionIds.has("go")) {
        phrases.push("어디 가요?", "어디 가세요?", "어디로 가요?", "어디로 가세요?");
      }
    }

    return {
      objectIds: unique(objectRules.map((rule) => rule.id)),
      actionIds: unique(actionRules.map((rule) => rule.id)),
      objectTerms: unique(
        objectRules.flatMap((rule) =>
          rule.focusTerms && rule.focusTerms.length ? rule.focusTerms : rule.display?.length ? rule.display : (rule.terms || []).slice(0, 1)
        )
      ),
      actionTerms: unique(
        actionTermRules.flatMap((rule) => (rule.focusTerms && rule.focusTerms.length ? rule.focusTerms : (rule.terms || []).slice(0, 3)))
      ),
      primaryTerms: unique([
        ...objectRules.flatMap((rule) => rule.terms || []),
        ...actionRules.flatMap((rule) => rule.terms || []),
      ]),
      relatedTerms: unique([
        ...objectRules.flatMap((rule) => rule.related || []),
        ...actionRules.flatMap((rule) => rule.related || []),
        ...phrases,
      ]),
      templateTerms: unique(phrases),
      displayTerms: unique([
        ...objectRules.flatMap((rule) => rule.display || []),
        ...actionRules.flatMap((rule) => rule.display || []),
      ]),
      tags: unique([
        ...objectRules.flatMap((rule) => rule.tags || []),
        ...actionRules.flatMap((rule) => rule.tags || []),
      ]),
      preferredTags: unique([
        ...objectRules.flatMap((rule) => rule.preferTags || []),
        ...actionRules.flatMap((rule) => rule.preferTags || []),
      ]),
      avoidTags: unique([
        ...objectRules.flatMap((rule) => rule.avoidTags || []),
        ...actionRules.flatMap((rule) => rule.avoidTags || []),
      ]),
      blockedTerms: unique([
        ...objectRules.flatMap((rule) => rule.blockedTerms || []),
        ...actionRules.flatMap((rule) => rule.blockedTerms || []),
      ]),
    };
  }

  return { buildIntentHints };
}
