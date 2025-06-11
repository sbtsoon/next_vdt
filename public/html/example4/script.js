// data.js에서 graphData, groupColors 등이 로드된 후 실행되어야 함

// Main Script
let showNodeLabels = document.getElementById("showLabels").checked;
let nodeLabelFontSize = parseInt(
  document.getElementById("labelFontSize").value,
  10
);

// 데이터로부터 고유한 그룹 이름 추출 및 정렬
const uniqueGroupNames = [...new Set(graphData.nodes.map(node => node.group))].sort();

// 그룹 이름을 groupColors 인덱스에 매핑
const groupNameToColorIndex = uniqueGroupNames.reduce((acc, groupName, index) => {
    acc[groupName] = index;
    return acc;
}, {});

// 그룹 필터 드롭다운 메뉴 동적 생성
const groupFilterSelect = document.getElementById("groupFilter");
// 기존 옵션 (All 제외) 삭제 - "All" 옵션은 HTML에 유지하거나 여기서 추가
while (groupFilterSelect.options.length > 1) { // "All" 옵션이 첫 번째라고 가정
    groupFilterSelect.remove(1);
}
// 고유 그룹 이름으로 옵션 추가
uniqueGroupNames.forEach(groupName => {
    const option = new Option(groupName, groupName); // 표시 텍스트와 값 모두 그룹 이름 사용
    groupFilterSelect.add(option);
});


function createTextSprite(
  text,
  {
    fontSize = 64,
    fontFamily = "Arial",
    textColor = "rgba(230,230,230,1)",
    backgroundColor = "rgba(0,0,0,0.4)",
    padding = 8,
    spriteScaleFactor = 0.1,
  } = {}
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = `Bold ${fontSize}px ${fontFamily}`;
  const textMetrics = context.measureText(text);
  const textWidth = textMetrics.width;
  canvas.width = textWidth + padding * 2;
  canvas.height = fontSize + padding * 2;
  if (backgroundColor) {
    context.fillStyle = backgroundColor;
    context.beginPath();
    context.roundRect(0, 0, canvas.width, canvas.height, fontSize * 0.2);
    context.fill();
  }
  context.font = `Bold ${fontSize}px ${fontFamily}`;
  context.fillStyle = textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(
    canvas.width * spriteScaleFactor,
    canvas.height * spriteScaleFactor,
    1.0
  );
  return sprite;
}

const Graph = ForceGraph3D()(document.getElementById("3d-graph"))
  .graphData(graphData)
  .nodeThreeObject((node) => {
    const nodeContainer = new THREE.Group();

    // 수정된 색상 계산 로직: 문자열 그룹 이름을 기반으로 인덱스 사용
    const groupIndex = groupNameToColorIndex[node.group];
    const calculatedFallbackColorValue = groupColors[groupIndex % groupColors.length] || 0xcccccc;

    const nodeRadius = node.radius;
    const fallbackSphereMaterial = new THREE.MeshPhysicalMaterial({
      color: calculatedFallbackColorValue,
      metalness: 0.0,
      roughness: 0.6,
      transmission: 0,
      opacity: 1,
      transparent: false,
      ior: 1.3,
      thickness: nodeRadius * 0.3,
      emissive: 0x000000,
      emissiveIntensity: 0.0,
      specularIntensity: 0.1,
    });
    const fallbackSphere = new THREE.Mesh(
      new THREE.SphereGeometry(nodeRadius, 32, 32),
      fallbackSphereMaterial
    );
    fallbackSphere.visible = false;
    nodeContainer.add(fallbackSphere);
    node.__mainVisual = fallbackSphere;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      node.nodeImg,
      (texture) => {
        const sphereMaterialWithTexture = new THREE.MeshPhysicalMaterial({
          map: texture,
          color: 0xffffff, // 텍스처 본연의 색상을 위해 기본 색상을 흰색으로 설정
          metalness: 0.0,
          roughness: 0.8,
          transmission: 0,
          opacity: 1.0,
          transparent: false,
          ior: 1.0,
          thickness: nodeRadius * 0.1,
          emissive: 0x000000,
          emissiveIntensity: 0.0,
          specularIntensity: 0.1,
          clearcoat: 0.0,
        });
        const sphereMesh = new THREE.Mesh(
          new THREE.SphereGeometry(nodeRadius, 32, 32),
          sphereMaterialWithTexture
        );
        if (nodeContainer.children.includes(node.__mainVisual)) {
          nodeContainer.remove(node.__mainVisual);
        }
        nodeContainer.add(sphereMesh);
        node.__mainVisual = sphereMesh;
        if (fallbackSphere) fallbackSphere.visible = false;
      },
      undefined,
      (error) => {
        console.warn(
          `Could not load node image for ID: ${node.id}, Group: ${node.group}, ImagePath: ${node.nodeImg}. ` +
            `Using fallback. Calculated fallback color: #${calculatedFallbackColorValue.toString(
              16
            )}. Error:`,
          error
        );
        if (fallbackSphere) fallbackSphere.visible = true;
        node.__mainVisual = fallbackSphere;
      }
    );
    if (
      node.__labelSprite &&
      nodeContainer.children.includes(node.__labelSprite)
    ) {
      nodeContainer.remove(node.__labelSprite);
      delete node.__labelSprite;
    }
    if (showNodeLabels) {
      const labelSprite = createTextSprite(node.id, {
        fontSize: nodeLabelFontSize,
      });
      labelSprite.position.set(
        0,
        nodeRadius + labelSprite.scale.y / 2 + 2,
        0
      );
      nodeContainer.add(labelSprite);
      node.__labelSprite = labelSprite;
    }
    node.__threeObj = nodeContainer;
    return nodeContainer;
  })
  .linkWidth((link) => (link.__highlight ? 6 : 1))
  .linkColor((link) => (link.__highlight ? "#ffffff" : "#aaaaaa"))
  .linkDirectionalParticles((link) => (link.__highlight ? 12 : 4))
  .linkDirectionalParticleSpeed(0.01)
  .linkDirectionalParticleColor((link) =>
    link.__highlight ? "#ffffff" : "#cccccc"
  )
  .linkDirectionalParticleWidth((link) => (link.__highlight ? 2 : 1))
  .backgroundColor("#020f10")
  .onNodeClick((node) => {
    const panel = document.getElementById("node-info");
    const desc = node.description || "No description available.";
    const radiusInfo = node.radius
      ? `Radius: ${node.radius.toFixed(2)}<br/>`
      : "";
    // node.group이 이제 문자열이므로 올바르게 표시됨
    panel.innerHTML = `<img src="${node.infoImg}" alt="Info image for ${node.id}" onerror="this.style.display='none'; console.error('Failed to display image in info panel: ${node.infoImg}')" /> <strong>${node.id}</strong><br/>Group: ${node.group}<br/>${radiusInfo}<p>${desc}</p>`;
    const sourceSelect = document.getElementById("sourceNode");
    const targetSelect = document.getElementById("targetNode");
    if (
      !sourceSelect.value ||
      sourceSelect.value === node.id ||
      sourceSelect.value === targetSelect.value
    ) {
      sourceSelect.value = node.id;
    } else {
      targetSelect.value = node.id;
    }
  });

initializeViewControls();

const initialCameraDistance = 300;
const initialLookAt = new THREE.Vector3(0, 0, 0);
Graph.cameraPosition(
  { x: 0, y: 0, z: initialCameraDistance },
  initialLookAt,
  0
);

const scene = Graph.scene();
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight1.position.set(150, 180, 100);
scene.add(directionalLight1);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight2.position.set(-150, -100, -100);
scene.add(directionalLight2);
const hemisphereLight = new THREE.HemisphereLight(
  0xffffff,
  0x333333,
  0.4
);
scene.add(hemisphereLight);

const sourceSelect = document.getElementById("sourceNode");
const targetSelect = document.getElementById("targetNode");
graphData.nodes.forEach((n) => {
  sourceSelect.add(new Option(n.id, n.id));
  targetSelect.add(new Option(n.id, n.id));
});

function setNodeOpacity(node, opacity) {
  if (node.__mainVisual && node.__mainVisual.material) {
    node.__mainVisual.material.opacity = opacity;
    node.__mainVisual.material.transparent = opacity < 1.0;
    node.__mainVisual.visible = opacity > 0.01;
  }
  if (node.__labelSprite && node.__labelSprite.material) {
    node.__labelSprite.material.opacity = opacity;
    node.__labelSprite.visible = opacity > 0.01;
  }
}

document.getElementById("groupFilter").addEventListener("change", (e) => {
  const selectedValues = Array.from(e.target.selectedOptions).map(
    (option) => option.value
  );
  const showAllNodes = selectedValues.includes("all");
  graphData.nodes.forEach((node) => {
    let isVisible;
    if (showAllNodes) {
      isVisible = true;
    } else {
      // node.group이 이미 문자열이므로 String() 변환 불필요
      isVisible =
        selectedValues.length > 0
          ? selectedValues.includes(node.group)
          : false;
    }
    setNodeOpacity(node, isVisible ? 1.0 : 0.0);
  });
  Graph.graphData(graphData); // Force graph update
});

function highlightPath(path) {
  graphData.links.forEach((l) => (l.__highlight = false));
  // Path 하이라이트 시 모든 노드를 일단 보이도록 처리 (필터와 무관하게)
  // 또는 필터 상태를 유지하려면 아래 로직 수정 필요
  graphData.nodes.forEach((n) => {
     // setNodeOpacity(n, 1.0); // 기존 필터 무시하고 모두 표시
     // 필터 상태를 유지하며 경로상의 노드만 보이게 하려면,
     // 현재 필터링 된 노드 목록을 기반으로 경로 노드의 가시성을 결정해야 함.
     // 여기서는 일단 모든 노드를 보이도록 단순화.
     const isNodeInPath = path.includes(n.id);
     const currentFilterSelectedValues = Array.from(document.getElementById("groupFilter").selectedOptions).map(opt => opt.value);
     const showAllByFilter = currentFilterSelectedValues.includes("all");
     let isVisibleByFilter;
     if (showAllByFilter) {
         isVisibleByFilter = true;
     } else {
         isVisibleByFilter = currentFilterSelectedValues.length > 0 ? currentFilterSelectedValues.includes(n.group) : false;
     }

     if (isNodeInPath) {
         setNodeOpacity(n, 1.0); // 경로상 노드는 항상 보이게
     } else {
         setNodeOpacity(n, isVisibleByFilter ? 0.15 : 0.0); // 경로 아닌 노드는 필터 따르되 흐리게, 또는 아예 안보이게(0.0)
     }
  });


  if (!path) {
    // 경로가 없으면 현재 필터 상태를 다시 적용
    document.getElementById("groupFilter").dispatchEvent(new Event("change"));
    Graph.graphData(graphData);
    return;
  }
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i],
      b = path[i + 1];
    // 링크 객체가 source/target 객체를 가질 수 있으므로 id로 비교
    const link = graphData.links.find(
      (l) =>
        ( (typeof l.source === 'object' ? l.source.id : l.source) === a && (typeof l.target === 'object' ? l.target.id : l.target) === b) ||
        ( (typeof l.source === 'object' ? l.source.id : l.source) === b && (typeof l.target === 'object' ? l.target.id : l.target) === a)
    );
    if (link) link.__highlight = true;
  }
  Graph.graphData(graphData);
}

function resetPath() {
  graphData.links.forEach((l) => (l.__highlight = false));
  // 필터 상태를 다시 적용하여 노드 가시성 복원
  document
    .getElementById("groupFilter")
    .dispatchEvent(new Event("change"));
  document.getElementById("node-info").innerHTML =
    "Click a node to see details.";
   // Graph.graphData(graphData)는 groupFilter의 change 이벤트 핸들러에서 호출되므로 중복 호출 불필요
}

document
  .getElementById("highlightPathBtn")
  .addEventListener("click", () => {
    const source = sourceSelect.value;
    const target = targetSelect.value;
    if (!source || !target)
      return alert("Source와 Target을 모두 선택하세요.");
    if (source === target) return alert("서로 다른 노드를 선택하세요.");
    const path = findShortestPath(graphData, source, target);
    if (!path) {
      alert("경로를 찾을 수 없습니다.");
      // 경로 못찾으면 현재 필터 상태 다시 적용
      document.getElementById("groupFilter").dispatchEvent(new Event("change"));
      return;
    }
    highlightPath(path);
  });

document.getElementById("resetBtn").addEventListener("click", resetPath);

const showLabelsCheckbox = document.getElementById("showLabels");
showLabelsCheckbox.addEventListener("change", (event) => {
  showNodeLabels = event.target.checked;
  Graph.nodeThreeObject(Graph.nodeThreeObject()); // Re-render nodes
});

const labelFontSizeInput = document.getElementById("labelFontSize");
labelFontSizeInput.addEventListener("input", (event) => {
  const newSize = parseInt(event.target.value, 10);
  if (
    !isNaN(newSize) &&
    newSize >= parseInt(labelFontSizeInput.min) &&
    newSize <= parseInt(labelFontSizeInput.max)
  ) {
    nodeLabelFontSize = newSize;
    Graph.nodeThreeObject(Graph.nodeThreeObject()); // Re-render nodes
  }
});

document.getElementById("node-info").innerHTML =
  "Click a node to see details.";

function findShortestPath(data, startId, endId) {
  const queue = [[startId]];
  const visited = new Set([startId]);
  while (queue.length > 0) {
    const currentPath = queue.shift();
    const lastNodeInPath = currentPath[currentPath.length - 1];
    if (lastNodeInPath === endId) {
      return currentPath;
    }
    const neighbors = data.links
      .filter((link) => {
        // source/target이 객체일 수 있으므로 id로 비교
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return sourceId === lastNodeInPath || targetId === lastNodeInPath;
      })
      .map((link) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return sourceId === lastNodeInPath ? targetId : sourceId;
      });
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        const newPath = [...currentPath, neighborId];
        queue.push(newPath);
      }
    }
  }
  return null;
}

const controlsPanel = document.getElementById("controls");
const menuToggleButton = document.getElementById("menuToggleButton");
const controlsWidth = 270;
const panelVisibleLeftOffset = 0;

menuToggleButton.innerHTML = "&gt;";
menuToggleButton.style.left = panelVisibleLeftOffset + "px";

menuToggleButton.addEventListener("click", () => {
  controlsPanel.classList.toggle("expanded");
  if (controlsPanel.classList.contains("expanded")) {
    menuToggleButton.innerHTML = "&lt;";
    menuToggleButton.style.left =
      panelVisibleLeftOffset + controlsWidth + "px";
  } else {
    menuToggleButton.innerHTML = "&gt;";
    menuToggleButton.style.left = panelVisibleLeftOffset + "px";
  }
});

// === 뷰 컨트롤 JavaScript 초기화 (줌/팬 로직 수정 및 디버깅 로그) ===
function initializeViewControls() {
  const threeCamera = Graph.camera();
  const threeControls = Graph.controls();

  console.log("Attempting to initialize view controls...");

  if (
    !threeCamera ||
    !threeControls ||
    !(threeControls.target instanceof THREE.Vector3)
  ) {
    console.warn(
      "View controls could not be fully initialized: Camera or Controls (or controls.target is not a Vector3) not available yet. Retrying soon..."
    );
    if (!initializeViewControls.retries)
      initializeViewControls.retries = 0;
    if (initializeViewControls.retries < 15) {
      initializeViewControls.retries++;
      setTimeout(initializeViewControls, 300);
    } else {
      console.error(
        "Max retries for initializing view controls reached. Pan/Zoom buttons may not work."
      );
    }
    return;
  }
  initializeViewControls.retries = 0;

  console.log("Graph.camera() UUID:", threeCamera.uuid);
  console.log("Graph.controls() Type:", threeControls.constructor.name);
  console.log(
    "Graph.controls().target (at init):",
    JSON.stringify(threeControls.target.clone())
  );

  threeControls.enabled = true;

  const zoomFactor = 1.2;
  const panSensitivity = 10;

  document.getElementById("zoomInBtn").addEventListener("click", () => {
    console.log("Zoom In button clicked");
    const camera = Graph.camera();
    const controls = Graph.controls();
    if (camera && controls && controls.target instanceof THREE.Vector3) {
      const currentTarget = controls.target.clone();
      const currentPos = camera.position.clone();
      const currentDistance = currentPos.distanceTo(currentTarget);
      console.log("ZoomIn - currentDistance:", currentDistance);

      if (
        typeof currentDistance === "number" &&
        !isNaN(currentDistance) &&
        currentDistance > 0.1
      ) {
        const newDistance = currentDistance / zoomFactor;
        const direction = new THREE.Vector3()
          .subVectors(currentPos, currentTarget)
          .normalize();
        const newPos = new THREE.Vector3().addVectors(
          currentTarget,
          direction.multiplyScalar(newDistance)
        );

        console.log(
          `ZoomIn: Setting newPos: ${JSON.stringify(
            newPos
          )}, Target: ${JSON.stringify(currentTarget)}`
        );
        Graph.cameraPosition(newPos, currentTarget, 200);
      } else {
        console.warn(
          "ZoomIn: Invalid current camera distance or too close:",
          currentDistance
        );
      }
    } else {
      console.warn(
        "ZoomIn: Camera, controls, or controls.target not ready/valid."
      );
    }
  });

  document.getElementById("zoomOutBtn").addEventListener("click", () => {
    console.log("Zoom Out button clicked");
    const camera = Graph.camera();
    const controls = Graph.controls();
    if (camera && controls && controls.target instanceof THREE.Vector3) {
      const currentTarget = controls.target.clone();
      const currentPos = camera.position.clone();
      const currentDistance = currentPos.distanceTo(currentTarget);
      console.log("ZoomOut - currentDistance:", currentDistance);

      if (
        typeof currentDistance === "number" &&
        !isNaN(currentDistance)
      ) {
        const newDistance = currentDistance * zoomFactor;
        const direction = new THREE.Vector3()
          .subVectors(currentPos, currentTarget)
          .normalize();
        const newPos = new THREE.Vector3().addVectors(
          currentTarget,
          direction.multiplyScalar(newDistance)
        );

        console.log(
          `ZoomOut: Setting newPos: ${JSON.stringify(
            newPos
          )}, Target: ${JSON.stringify(currentTarget)}`
        );
        Graph.cameraPosition(newPos, currentTarget, 200);
      } else {
        console.warn(
          "ZoomOut: Invalid current camera distance:",
          currentDistance
        );
      }
    } else {
      console.warn(
        "ZoomOut: Camera, controls, or controls.target not ready/valid."
      );
    }
  });

  function panGraphView(screenDeltaX, screenDeltaY) {
    console.log(
      `panGraphView called with screenDeltaX: ${screenDeltaX}, screenDeltaY: ${screenDeltaY}`
    );
    const camera = Graph.camera();
    const controls = Graph.controls();

    if (
      !camera ||
      !controls ||
      !(controls.target instanceof THREE.Vector3)
    ) {
      console.warn(
        "Pan attempt failed: camera, controls, or controls.target not ready/valid."
      );
      return;
    }

    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    camera.matrix.extractBasis(right, up, new THREE.Vector3());

    const currentDistance = camera.position.distanceTo(controls.target);
    console.log("panGraphView - currentDistance:", currentDistance);

    const distanceForFactor = Math.max(currentDistance, 50);
    const panFactor = distanceForFactor * 0.0005;
    console.log("panGraphView - panFactor:", panFactor);

    const panOffset = new THREE.Vector3();
    panOffset.addScaledVector(right, -screenDeltaX * panFactor);
    panOffset.addScaledVector(up, screenDeltaY * panFactor);
    console.log("panGraphView - panOffset:", JSON.stringify(panOffset));

    const newCameraPosition = camera.position.clone().add(panOffset);
    const newTargetPosition = controls.target.clone().add(panOffset);
    console.log(
      "panGraphView - newCameraPosition:",
      JSON.stringify(newCameraPosition),
      " - newTargetPosition:",
      JSON.stringify(newTargetPosition)
    );

    Graph.cameraPosition(newCameraPosition, newTargetPosition, 0);
  }

  document.getElementById("panLeftBtn").addEventListener("click", () => {
    console.log("Pan Left button clicked");
    panGraphView(panSensitivity, 0);
  });
  document.getElementById("panRightBtn").addEventListener("click", () => {
    console.log("Pan Right button clicked");
    panGraphView(-panSensitivity, 0);
  });
  document.getElementById("panUpBtn").addEventListener("click", () => {
    console.log("Pan Up button clicked");
    panGraphView(0, -panSensitivity);
  });
  document.getElementById("panDownBtn").addEventListener("click", () => {
    console.log("Pan Down button clicked");
    panGraphView(0, panSensitivity);
  });

  const defaultLookAtConstant = new THREE.Vector3(0, 0, 0);
  let defaultViewDistance = initialCameraDistance;

  document
    .getElementById("resetViewBtn")
    .addEventListener("click", () => {
      console.log("Reset View button clicked");
      Graph.cameraPosition(
        { x: 0, y: 0, z: defaultViewDistance },
        defaultLookAtConstant.clone(),
        800
      );
    });
  document.getElementById("topViewBtn").addEventListener("click", () => {
    console.log("Top View button clicked");
    Graph.cameraPosition(
      { x: 0, y: defaultViewDistance, z: 0.1 }, // y를 거리로, z는 약간의 오프셋
      defaultLookAtConstant.clone(),
      800
    );
  });
  document
    .getElementById("frontViewBtn")
    .addEventListener("click", () => {
      console.log("Front View button clicked");
      Graph.cameraPosition(
        { x: 0, y: 0, z: defaultViewDistance }, // 정면 뷰
        defaultLookAtConstant.clone(),
        800
      );
    });
  console.log("View controls initialized successfully.");
}

// let viewControlsInitialized = false; // 이 변수는 현재 사용되지 않음

// 초기 필터 적용 (페이지 로드 시 "All"이 기본 선택되도록)
document.getElementById("groupFilter").dispatchEvent(new Event("change"));