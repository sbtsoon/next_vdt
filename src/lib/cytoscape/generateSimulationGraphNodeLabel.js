import { parseNeo4jInt } from "@/helpers/parseNeo4jIntHelper";

export function generateSimulationGraphNodeLabel(cy, nodeRef) {
  return function tpl(data) {
    const ref = nodeRef.current?.[data.id] || {};
    if (ref.isDisplay === false) return "";

    const node = cy.getElementById(data.id);

    const initialAmount = Math.round(parseNeo4jInt(data.amount) / 1_000_000); // TODO: 백만원 단위
    if (ref.initialAmount === undefined) {
      ref.initialAmount = initialAmount;
    }
    const amountValue = ref.amount === undefined ? initialAmount : ref.amount;
    ref.amount = amountValue;
    if (!ref.percentage) {
      ref.percentage = 0;
    }
    const percentageValue = ref.percentage;
    const disabled = ref.disabled ? "disabled" : "";

    const expanded = ref.expanded === true;
    const toggleSymbol = expanded
      ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                     </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                     </svg>`;

    const allChildNodes = node.predecessors("node");
    const isLeaf = allChildNodes.length === 0;

    const excludedNames = [
      "액티비티수차합",
      "액티비티단가합",
      "생산입고",
      "공정출고",
      "비용계획합",
    ];

    if (!ref.historyData) {
      ref.historyData = [];
    }
    const scaledHistoryData = ref.scaledHistoryData
      ? ref.scaledHistoryData
      : [];

    return `
                        <div
                            class="cy-node-label-html"
                            data-node-id="${data.id}"
                            onmouseover="showInput('${data.id}');"
                            onmouseout="hideInput('${data.id}');"
                        >
                            ${
                              isLeaf
                                ? ""
                                : `<div
                                    class="toggle-symbol"
                                    onclick="handleToggleClick('${data.id}')">
                                    ${toggleSymbol}
                                  </div>`
                            }
        
                            <div class="node-header-container">
                                <div class="node-header-info">
                                    <div class="node-name text-xl text-gray-300">${
                                      data.name
                                    }</div>
                                    ${
                                      !excludedNames.includes(data.name)
                                        ? `<div class="percentage text-xl ${
                                            percentageValue > 0
                                              ? "text-green-500"
                                              : percentageValue < 0
                                              ? "text-red-500"
                                              : "text-gray-400"
                                          }">${percentageValue}%</div>`
                                        : ""
                                    }
                                </div>
                                <div class="text-sm text-gray-400">Unit: 백만원</div>
                            </div>
        
                            <div class="text-2xl">₩ ${amountValue.toLocaleString(
                              "ko-KR"
                            )}</div>
        
                                    ${
                                      excludedNames.includes(data.name)
                                        ? ""
                                        : `
                                                <div class="node-content-container mt-1.5 border-t border-gray-600 p-2">
                                                    <div class="amt-container"">
                                                        <div class="old-amt-container">
                                                            <div class="text-sm text-gray-400">Old Amt:</div>
                                                            <div class="amt-value text-gray-200">₩ ${initialAmount.toLocaleString(
                                                              "ko-KR"
                                                            )}</div>
                                                        </div>
                                                        <div class="chg-amt-container">
                                                            <div  class="text-sm text-gray-400">Chg Amt:</div>
                                                            <div  class="amt-value text-gray-200">₩ ${(
                                                              amountValue -
                                                              initialAmount
                                                            ).toLocaleString(
                                                              "ko-KR"
                                                            )}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                      <div  class="text-sm text-gray-400">Last 10 records</div>
                                                        <div class="history-graph">
                                                            <div class="positive-history-data-container">
                                                                ${scaledHistoryData
                                                                  .map(
                                                                    (h, i) => {
                                                                      const height =
                                                                        h > 0
                                                                          ? h
                                                                          : 0;
                                                                      return `<div
                                                                            class="history-bar ${
                                                                              h >=
                                                                              0
                                                                                ? "bar-positive"
                                                                                : "bar-empty"
                                                                            }"
                                                                            style="height: ${height}px;"
                                                                            onmousedown="event.stopPropagation();
                                                                            clickHistoryData('${
                                                                              data.id
                                                                            }', ${i}, event);"></div>`;
                                                                    }
                                                                  )
                                                                  .join("")}
                                                            </div>
                                                            <div class="history-graph-divider"></div>
                                                            <div class="negative-history-data-container">
                                                                ${scaledHistoryData
                                                                  .map(
                                                                    (h, i) => {                                                                      
                                                                      const height =
                                                                        h < 0
                                                                          ? -h
                                                                          : 0;
                                                                      return `<div
                                                                            class="history-bar ${
                                                                              h <
                                                                              0
                                                                                ? "bar-negative"
                                                                                : "bar-empty"
                                                                            }"
                                                                            style="height: ${height}px;"
                                                                            onmousedown="event.stopPropagation();
                                                                            clickHistoryData('${
                                                                              data.id
                                                                            }', ${i}, event);"></div>`;
                                                                    }
                                                                  )
                                                                  .join("")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="range-input-container bg-blue-light-950/10">
                                                    <div class="range-input-display-box">
                                                        <div class="keep-button-container">
                                                            <button class="keep-button">KEEP</button>
                                                        </div>
                                                        <input
                                                          class="range-input"
                                                          type="range"
                                                          ${disabled}
                                                          value="${percentageValue}"
                                                          min="-15"
                                                          max="15"
                                                          oninput="
                                                            const percentageDivs = this.closest('.cy-node-label-html')?.querySelectorAll('.percentage');
                                                            if (percentageDivs) {
                                                              percentageDivs.forEach(div => {
                                                              div.textContent = this.value + '%';
                                                          })}"
                                                          onmouseup="
                                                            handleInputChange('${
                                                              data.id
                                                            }', ${initialAmount}, this.value);
                                                            forceReRenderNode('${
                                                              data.id
                                                            }');
                                                            updateParentNodes('${
                                                              data.id
                                                            }');
                                                          "
                                                          onmousedown="event.stopPropagation();"
                                                          onmousemove="event.stopPropagation();"
                                                        />
                                                        <div class="percentage">${percentageValue}%</div>
                                                    </div>
                                                </div>
                                            `
                                    }
                        </div>
                        `;
  };
}
