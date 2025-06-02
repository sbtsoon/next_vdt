// Data
const defaultNodeImage = "images/grapes.jpg";
const defaultInfoImage = "images/grapes2.jpg";

let graphData = {
  nodes: [
    {
      id: "매출이익",
      group: "상위계정", // 문자열 그룹 이름
      nodeImg: "images/dollar02.jpg",
      infoImg: "images/profit-info01.jpg",
      description: "매출액에서 매출원가를 뺀 금액으로, 제품이나 서비스를 팔아서 남긴 기본적인 이익입니다.",
      radius: 6,
    },
    {
      id: "매출액",
      group: "상위계정", // 문자열 그룹 이름
      nodeImg: "images/blue01.jpg",
      infoImg: "images/revenue-info01.jpg",
      description: "매출액은 기업이 일정 기간 동안 제품이나 서비스를 판매하여 벌어들인 총수익입니다.",
      radius: 6,
    },
    {
      id: "매출원가",
      group: "상위계정", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg", // 실제로는 다른 이미지 사용 가능
      infoImg: "images/COGS-infor01.jpg",
      description: "매출원가는 제품이나 서비스를 판매하기 위해 직접 투입된 원재료비, 인건비 등 직접 비용의 총합입니다.",
      radius: 6,
    },
    {
      id: "당기제품제조원가",
      group: "계정과목", // 문자열 그룹 이름
      nodeImg: "images/account01.jpg",
      infoImg: "images/manufacture-infor01.jpg",
      description: "당기제품제조원가는 당기 중에 제조된 모든 제품의 총 제조원가로, 직접재료비, 직접노무비, 제조간접비의 합계입니다.",
      radius: 6,
    },
    {
      id: "기말재고",
      group: "계정과목", // 문자열 그룹 이름
      nodeImg: "images/orange01.jpg",
      infoImg: "images/stock01.jpg",
      description: "기말재고는 회계 기간 말에 아직 판매되지 않고 남아 있는 상품이나 제품 등의 재고 자산을 의미합니다.",
      radius: 6,
    },
    {
      id: "기초재고",
      group: "계정과목",    // 다양한 그룹에 속할 수 있음
      nodeImg: "images/blue01.jpg",
      infoImg: "images/stock01.jpg",
      description: "기초재고는 회계 기간 시작 시점에 보유하고 있던 상품이나 제품 등의 재고 자산을 의미합니다.",
      radius: 6,
    },
    {
      id: "제품군(100s)",
      group: "컨테이너", // 문자열 그룹 이름
      nodeImg: "images/yellow01.jpg",
      infoImg: "images/group-info01.jpg",
      description: "100 시리즈의 완제품 그룹",
      radius: 6,
    },
    {
      id: "제품군(200s)",
      group: "컨테이너", // 문자열 그룹 이름
      nodeImg: "images/yellow01.jpg",
      infoImg: "images/group-info01.jpg",
      description: "200 시리즈의 완제품 그룹",
      radius: 6,
    },
    {
      id: "FERT101",
      group: "완제품", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/fert100s-info01.jpg",
      description: "샤토 마고 Château Margaux, 프랑스 보르도: 보르도의 대표적인 프리미엄 와인으로, 우아하고 섬세한 향과 구조감이 특징입니다. 까베르네 소비뇽을 주축으로 하며, 숙성 잠재력이 매우 높습니다",
      radius: 6,
    },
    {
      id: "FERT102",
      group: "완제품(Red Wine)", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/fert100s-info01.jpg",
      description: "샤토 라피트 로쉴드 (Château Lafite Rothschild, 프랑스 보르도): 세계에서 가장 명성 높은 와인 중 하나로, 복합적이고 깊이 있는 풍미를 자랑합니다. 뛰어난 균형감과 장기 숙성 가능성으로 유명합니다.",
      radius: 6,
    },
    {
      id: "FERT103",
      group: "완제품(Red Wine)", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/fert100s-info01.jpg",
      description: "로마네 콩티 (Romanée-Conti, 프랑스 부르고뉴): 부르고뉴의 전설적인 피노 누아 와인으로, 세계에서 가장 비싼 와인 중 하나입니다. 향미가 섬세하고 우아하며, 희소성과 명성으로 수집가들의 로망입니다.",
      radius: 6,
    },
    {
      id: "FERT104",
      group: "완제품(Red Wine)", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/fert100s-info01.jpg",
      description: "사시카이아 (Sassicaia, 이탈리아 토스카나): 이탈리아 슈퍼투스칸 와인의 대표로, 프랑스 품종인 까베르네 소비뇽을 중심으로 만듭니다. 강건한 구조와 세련된 탄닌, 풍부한 과일 향이 조화를 이룹니다.",
      radius: 6,
    },
    {
      id: "FERT105",
      group: "완제품(Red Wine)", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/fert100s-info01.jpg",
      description: "베가 시실리아 우니코 (Vega Sicilia Único, 스페인 리베라 델 두에로): 스페인 최고급 와인 중 하나로, 템프라니요와 까베르네 소비뇽의 블렌딩입니다. 수십 년 숙성에도 견디는 깊은 맛과 향이 특징입니다.",
      radius: 6,
    },
    {
      id: "FERT106",
      group: "완제품(Red Wine)", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/fert100s-info01.jpg",
      description: "오퍼스 원 (Opus One, 미국 나파밸리): 로버트 몬다비와 샤토 무통 로쉴드의 합작으로 탄생한 고급 레드 와인입니다. 부드러운 질감과 풍부한 과일, 초콜릿, 오크의 풍미가 어우러진 미국 와인의 상징입니다.",
      radius: 6,
    },
    {
      id: "FERT201",
      group: "완제품(White Wine)", // 문자열 그룹 이름
      nodeImg: "images/whitewine01.jpg",
      infoImg: "images/fert200s-info01.jpg",
      description: "샤블리 (Chablis, 프랑스 부르고뉴): 샤르도네 품종으로 만든 드라이 화이트 와인으로, 미네랄리티와 산도가 뛰어납니다.",
      radius: 6,
    },
    {
      id: "FERT202",
      group: "완제품(White Wine)", // 문자열 그룹 이름
      nodeImg: "images/whitewine01.jpg",
      infoImg: "images/fert200s-info01.jpg",
      description: "퓰리 퓌메 (Pouilly-Fumé, 프랑스 루아르 밸리): 소비뇽 블랑으로 만든 와인으로, 풀향과 함께 약간의 훈연(푸메) 뉘앙스를 갖고 있습니다. 청량하고 상큼한 산미가 돋보이며 해산물과 잘 어울립니다.",
      radius: 6,
    },
    {
      id: "FERT203",
      group: "완제품(White Wine)", // 문자열 그룹 이름
      nodeImg: "images/whitewine01.jpg",
      infoImg: "images/fert200s-info01.jpg",
      description: "리슬링 (Riesling, 독일 모젤 등): 독일을 대표하는 품종으로, 드라이부터 스위트까지 다양한 스타일이 있습니다. 풍부한 과일향과 생생한 산도, 숙성에 따른 석유향이 매력 포인트입니다.",
      radius: 6,
    },
    {
      id: "당기제조비용",
      group: "계정과목",    // 다양한 그룹에 속할 수 있음
      nodeImg: "images/blue01.jpg",
      infoImg: "images/manufacture-info01.jpg",
      description: "당기제조비용은 기업이 일정 기간 동안 제품을 생산하기 위해 실제로 지출한 원재료비, 노무비, 제조간접비 등을 모두 합한 비용입니다.",
      radius: 6,
    },
    {
      id: "재공품",
      group: "계정과목",    // 다양한 그룹에 속할 수 있음
      nodeImg: "images/orange01.jpg",
      infoImg: "images/manufacture-info01.jpg",
      description: "재공품은 제조 공정 중에 있으며 아직 완성되지 않은 제품을 말합니다.",
      radius: 6,
    },
    {
      id: "액티비티배부",
      group: "계정과목",    // 다양한 그룹에 속할 수 있음
      nodeImg: "images/orange01.jpg",
      infoImg: "images/manufacture-info01.jpg",
      description: "액티비티 배부는 활동 기준 원가계산(Activity-Based Costing, ABC)에서 각 활동(Activity)에 소요된 비용을 원가 대상(제품, 서비스 등)에 활동 사용량에 따라 배분하는 방식입니다.",
      radius: 6,
    },
    {
      id: "액티비티단수차",
      group: "계정과목",    // 다양한 그룹에 속할 수 있음
      nodeImg: "images/orange01.jpg",
      infoImg: "images/manufacture-info01.jpg",
      description: "액티비티 단수차는 실제 활동수와 예정(표준) 활동수의 차이로 인해 발생하는 원가 차이를 의미하며, 활동 기준 원가계산에서 원가 통제를 위한 분석 요소로 사용됩니다.",
      radius: 6,
    },
    {
      id: "원재료비",
      group: "계정과목",    // 다양한 그룹에 속할 수 있음
      nodeImg: "images/green01.jpg",
      infoImg: "images/expenses-info01.jpg",
      description: "원재료비는 제품을 만들기 위해 직접적으로 사용하는 주요 재료의 구입 및 소비에 들어간 비용입니다.",
      radius: 6,
    },
    {
      id: "부재료비",
      group: "계정과목",    // 다양한 그룹에 속할 수 있음
      nodeImg: "images/green01.jpg",
      infoImg: "images/expenses-info01.jpg",
      description: "부재료비는 제품을 제조할 때 직접 재료 외에 보조적으로 사용되는 재료에 대한 비용으로, 일반적으로 제품 단가에는 직접 반영되지 않지만 제조 과정에 필요한 비용입니다.",
      radius: 6,
    },
    {
      id: "가공비",
      group: "계정과목",    // 다양한 그룹에 속할 수 있음
      nodeImg: "images/green01.jpg",
      infoImg: "images/expenses-info01.jpg",
      description: "가공비는 원재료를 제품으로 가공하는 과정에서 발생하는 노무비와 제조간접비를 합한 비용을 말합니다.",
      radius: 6,
    },
    {
      id: "ROH0001",
      group: "원재료(Grapes)", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/grapes.jpg",
      description: "베가 시실리아 우니코 (Vega Sicilia Único, 스페인 리베라 델 두에로): 스페인 최고급 와인 중 하나로, 템프라니요와 까베르네 소비뇽의 블렌딩입니다. 수십 년 숙성에도 견디는 깊은 맛과 향이 특징입니다.",
      radius: 6,
    },
    {
      id: "ROH0002",
      group: "원재료(Grapes)", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/grapes.jpg",
      description: "베가 시실리아 우니코 (Vega Sicilia Único, 스페인 리베라 델 두에로): 스페인 최고급 와인 중 하나로, 템프라니요와 까베르네 소비뇽의 블렌딩입니다. 수십 년 숙성에도 견디는 깊은 맛과 향이 특징입니다.",
      radius: 6,
    },
    {
      id: "ROH0003",
      group: "원재료(Grapes)", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/grapes.jpg",
      description: "베가 시실리아 우니코 (Vega Sicilia Único, 스페인 리베라 델 두에로): 스페인 최고급 와인 중 하나로, 템프라니요와 까베르네 소비뇽의 블렌딩입니다. 수십 년 숙성에도 견디는 깊은 맛과 향이 특징입니다.",
      radius: 6,
    },
    {
      id: "ROH2001",
      group: "부제료", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/grapes2.jpg",
      description: "이산화황(SO₂): 살균 및 산화 방지를 위해 사용",
      radius: 6,
    },
    {
      id: "ROH2002",
      group: "부제료", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/grapes2.jpg",
      description: "당분(설탕): 알코올 도수 조절 또는 발효 촉진용",
      radius: 6,
    },
    {
      id: "ROH2003",
      group: "부제료", // 문자열 그룹 이름
      nodeImg: "images/redwine01.jpg",
      infoImg: "images/grapes2.jpg",
      description: "정제제(벤토나이트 등): 와인을 맑게 하기 위한 여과 및 침전용",
      radius: 6,
    },
  ],
  links: [
    { source: "ROH0001", target: "원재료비" },
    { source: "ROH0002", target: "원재료비" },
    { source: "ROH0003", target: "원재료비" },
    { source: "ROH2001", target: "부재료비" },
    { source: "ROH2002", target: "부재료비" },
    { source: "ROH2003", target: "부재료비" },
    { source: "원재료비", target: "당기제조비용" },
    { source: "부재료비", target: "당기제조비용" },
    { source: "가공비", target: "당기제조비용" }, // 추가 링크 예시
    { source: "당기제조비용", target: "당기제품제조원가" },
    { source: "재공품", target: "당기제품제조원가" },
    { source: "액티비티배부", target: "당기제품제조원가" },
    { source: "액티비티단수차", target: "당기제품제조원가" },
    { source: "당기제품제조원가", target: "매출원가" },
    { source: "ROH2003", target: "부재료비" },
    { source: "당기제품제조원가", target: "매출원가" },
    { source: "기말재고", target: "매출원가" },
    { source: "기초재고", target: "매출원가" },
    { source: "매출원가", target: "매출이익" },
    { source: "매출액", target: "매출이익" },
    { source: "제품군(100s)", target: "매출액" },
    { source: "제품군(200s)", target: "매출액" },
    { source: "FERT101", target: "제품군(100s)" },
    { source: "FERT102", target: "제품군(100s)" },
    { source: "FERT103", target: "제품군(100s)" },
    { source: "FERT104", target: "제품군(100s)" },
    { source: "FERT105", target: "제품군(100s)" },
    { source: "FERT106", target: "제품군(100s)" },
    { source: "FERT201", target: "제품군(200s)" },
    { source: "FERT202", target: "제품군(200s)" },
    { source: "FERT203", target: "제품군(200s)" },
  ],
};

const groupColors = [ // 색상 배열은 그대로 사용, 그룹 이름과 매핑하여 순서대로 적용
  0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd, 0x8c564b, 0xe377c2, 0x7f7f7f, 0xbcbd22, 0x17becf
];