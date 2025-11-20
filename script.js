//----------------------------------------------------TOGGLE BETWEEN PAGES--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

'use strict';

// Calculator Switching Logic
let activeCalculatorId = 'kitchen-calculator'; // default
function switchCalculator(toId) {
  document.querySelectorAll('.calculator-section').forEach(section => {
    section.style.display = section.id === toId ? 'block' : 'none';
  });
  activeCalculatorId = toId;
}
function getActiveCalculatorId() {
  return activeCalculatorId;
}
function showCalculator(type) {
  switchCalculator(`${type}-calculator`);
  // ✅ Optional: update nav button styling
  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-button[onclick*="${type}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  console.log('Active Calculator:', CalculatorUtils.getActiveCalculatorId());
}

//GET ACTIVE CALCULATOR PAGE
const CalculatorUtils = (() => {
  function getActiveCalculatorIdWrapper() {
    return getActiveCalculatorId(); // uses the global tracker
  }

  function getActiveCalculatorSection() {
    const id = getActiveCalculatorIdWrapper();
    return id ? document.getElementById(id) : null;
  }
  
  function showGlobalWarning(message) {
    const calculatorId = getActiveCalculatorId();
    const warningId = calculatorId ? `${calculatorId}-warning` : 'calculator-warning';
    const warning = document.getElementById(warningId);
    if (warning) {
      warning.textContent = message;
      warning.style.display = 'block';
    }
  }
  function clearGlobalWarning() {
    const calculatorId = getActiveCalculatorId();
    const warningId = calculatorId ? `${calculatorId}-warning` : 'calculator-warning';
    const warning = document.getElementById(warningId);
    if (warning) {
      warning.textContent = '';
      warning.style.display = 'none';
    }
  }
  function showSectionError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const activeSection = getActiveCalculatorSection();
    if (!field || !activeSection || !activeSection.contains(field)) return;
    field.classList.add('error-field');
    const errorMsg = document.createElement('div');
    errorMsg.className = 'section-error';
    errorMsg.textContent = message;
    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('section-error')) {
      field.parentNode.insertBefore(errorMsg, field.nextSibling);
    }
  }
  function clearSectionErrors() {
    const activeSection = getActiveCalculatorSection();
    if (!activeSection) return;
    activeSection.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
    activeSection.querySelectorAll('.section-error').forEach(el => el.remove());
  }
  
  
  // ✅ Export public methods
  return {
    getActiveCalculatorId: getActiveCalculatorIdWrapper,
    getActiveCalculatorSection,
    showGlobalWarning,
    clearGlobalWarning,
    showSectionError,
    clearSectionErrors
  };
})();

// ----------------------- FORMAT PRICE RESULTS ---------------------------

function formatShortCurrency(value) {
  if (value >= 1000) {
    const short = Math.ceil(value / 100) / 10; // round up to 1 decimal place
    return `${short.toFixed(1)}K`;
  }
  return value.toFixed(2);
}

//---------------------------------------------------------KITCHEN CODE-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

//UPDATE FINISH AND HANDLE TYPE BASED ON OVERALL ANSWER
// Sync Finish Level from Overall Settings
  document.getElementById('overall-finish').addEventListener('change', function () {
    const value = this.value;
    const finishFields = [
      'base-finish',
      'wall-finish',
      'column-finish',
      'stack-finish',
      'shelf-finish',
      'appliance-finish',
      'island-finish'
    ];
    finishFields.forEach(id => {
      const field = document.getElementById(id);
      if (field) field.value = value;
    });
  });

  // Sync Handles or Profiles from Overall Settings
  document.getElementById('overall-style').addEventListener('change', function () {
    const value = this.value;
    const styleFields = [
      'base-style',
      'wall-style',
      'column-style',
      'stack-style',
      'appliance-style',
      'island-style'
    ];
    styleFields.forEach(id => {
      const field = document.getElementById(id);
      if (field) field.value = value;
    });
  });



//RESET BUTTONS LOGIC
//Reset all Inputs
function resetAllInputs(scopeId, priceId) {
  const container = document.getElementById(scopeId);

  // ✅ Reset all inputs and selects
  const inputs = container.querySelectorAll('input, select');
  inputs.forEach(input => {
    if (input.id === 'dealer-type') return; // Skip kitchen SALE GROUP
    if (input.id === 'floor-dealer-type') return; // Skip floor SALE GROUP
    if (input.type === 'checkbox' || input.type === 'radio') {
      input.checked = false;
    } else {
      input.value = '';
    }
  });

  // ✅ Reset all breakdown values
  container.querySelectorAll('.breakdown-row span:last-child').forEach(span => {
    span.textContent = '$0.00';
  });

  // ✅ Reset total price
  const priceOutput = document.getElementById(priceId);
  if (priceOutput) priceOutput.textContent = '$0.00';

  // ✅ Hide finish wrappers if present
  const standardFinish = container.querySelector('#standard-finish-wrapper');
  const patinaFinish = container.querySelector('#patina-finish-wrapper');
  if (standardFinish) standardFinish.style.display = 'none';
  if (patinaFinish) patinaFinish.style.display = 'none';

  // ✅ Clear warnings
  CalculatorUtils.clearGlobalWarning();
  CalculatorUtils.clearSectionErrors();
  if (typeof clearFloorError === 'function') clearFloorError();
  if (typeof clearFloorFieldErrors === 'function') clearFloorFieldErrors();
}

function resetFinishLevels(scopeId, priceId) {
  const container = document.getElementById(scopeId);
  const finishFields = container.querySelectorAll('[id$="-finish"]');
  finishFields.forEach(field => field.value = '');

  container.querySelectorAll('.breakdown-row span:last-child').forEach(span => {
    span.textContent = '$0.00';
  });

  document.getElementById(priceId).textContent = '$0.00';

  CalculatorUtils.clearGlobalWarning();
  CalculatorUtils.clearSectionErrors();
}

function resetLinearInches(scopeId, priceId) {
  const container = document.getElementById(scopeId);

  // ✅ Define field patterns per calculator type
  const fieldPatterns = {
    'floor-calculator': ['floor-sqft'],
    'kitchen-calculator': ['inches', 'panels', 'panel'],
    // Add more calculators here as needed
    // 'bath-calculator': ['depth', 'height'],
    // 'closet-calculator': ['hanger', 'shelf']
  };

  // ✅ Determine which patterns to use
  const patterns = fieldPatterns[scopeId] || [];

  // ✅ Build selector string
  const selector = patterns.map(p => `input[id*="${p}"]`).join(', ');
  const linearFields = selector ? container.querySelectorAll(selector) : [];

  // ✅ Reset matching fields
  linearFields.forEach(field => field.value = '');

  // ✅ Reset breakdown values
  container.querySelectorAll('.breakdown-row span:last-child').forEach(span => {
    span.textContent = '$0.00';
  });

  // ✅ Reset total price
  const priceOutput = document.getElementById(priceId);
  if (priceOutput) priceOutput.textContent = '$0.00';

  // ✅ Clear warnings
  CalculatorUtils.clearGlobalWarning();
  CalculatorUtils.clearSectionErrors();
  if (typeof clearFloorError === 'function') clearFloorError();
  if (typeof clearFloorFieldErrors === 'function') clearFloorFieldErrors();
}

//CALCULATOR LOGIC
// Pricing data for Handles
const pricingHandles = {
  base: [15.93, 16.51, 17.34, 18.83, 22.23, 25.18, 29.66, 32.55, 34.98, 38.79, 51.56],
  islandBase: [15.93, 16.51, 17.34, 18.83, 22.23, 25.18, 29.66, 32.55, 34.98, 38.79, 51.56],
  baseCorner: [402.42, 421.43, 444.89, 495.15, 606.35, 699.64, 853.09, 953.72, 1030.56, 1164.11, 1574.20],
  dishwasher: [108.45, 123.36, 139.29, 203.22, 259.79, 340.67, 408.47, 498.54, 538.78, 608.83, 823.28], // price per unit
  columns: [20.57, 21.71, 23.31, 26.72, 33.31, 37.78, 43.57, 56.21, 60.97, 68.32, 91.62],
  columnCorner: [534.35, 587.16, 662.67, 866.07, 1149.73, 1375.84, 1607.46, 2151.10, 2529.34, 2847.02, 3865.85],
  stack: [7.753, 8.188, 8.656, 9.705, 12.688, 14.404, 17.533, 19.392, 20.961, 23.680, 31.957],
  wall: [10.378, 11.055, 11.894, 14.030, 17.796, 21.054, 24.650, 28.464, 30.770, 34.762, 46.954],
  leMansBase: [568.20, 568.45, 571.75, 567.03, 582.68, 573.95, 581.62, 555.55, 541.51, 523.30, 624.72],
  leMansColumn: [1159.81, 1832.01, 1838.00, 1852.93, 1878.44, 1896.66, 1905.71, 1679.07, 1607.83, 1826.32, 2454.32], 
  };

// Pricing data for Profiles
const pricingProfiles = {
  base: [16.37, 16.96, 17.79, 19.27, 22.70, 25.62, 30.11, 33.01, 35.47, 39.33, 52.25],
  islandBase: [16.37, 16.96, 17.79, 19.27, 22.70, 25.62, 30.11, 33.01, 35.47, 39.33, 52.25],
  baseCorner: [415.76, 435.11, 458.35, 509.05, 620.58, 712.87, 866.88, 967.85, 1045.68, 1181.23, 1597.32],
  dishwasher: [239.85, 257.12, 272.51, 327.61, 397.22, 476.85, 566.80, 655.55, 708.45, 800.50, 1082.25], // price per unit
  columns: [21.62, 22.79, 24.42, 27.89, 34.61, 39.15, 45.09, 57.81, 62.69, 70.27, 94.25],
  columnCorner: [538.40, 591.35, 666.86, 870.26, 1153.99, 1380.03, 1611.58, 2346.61, 2534.72, 2853.09, 3873.60],
  stack: [8.003, 8.438, 8.906, 9.955, 12.938, 14.654, 17.783, 19.642, 21.211, 23.930, 32.207],
  wall: [11.200, 11.805, 12.748, 14.869, 18.683, 21.909, 25.513, 29.351, 31.714, 35.834, 48.494],
  leMansBase: [568.74, 568.78, 572.31, 567.01, 582.58, 574.60, 581.72, 555.44, 540.65, 520.94, 617.86],
  leMansColumn: [1828.26, 1832.82, 1838.81, 1853.74, 1879.17, 1897.47, 1906.42, 1488.89, 1607.95, 1826.74, 2455.40],
  };

// Shared pricing
const shelfPrices = [10.000, 10.000, 10.000, 12.500, 12.500, 15.000, 15.000, 15.000, 17.500, 17.500, 17.500];
//nst dishwasherPanels = [4.766, 5.418, 6.048, 8.878, 11.418, 15.748, 18.917, 22.376, 24.191, 27.335, 36.939];
const fridgePanels = [22.4, 28.2, 34.6, 58.6, 81, 110.2, 136.8, 173.4, 184, 221, 327.8];

//Countertop and Backslash pricing
const countertopPrices = {
  fenix: 55,
  glass: 520,
  granite: 181,
  quartz: 246,
  laminate: 41,
  porcelain: 255,
  stainless: 100,
  none: 0
};

const waterfallPrices = {
  fenix: 28,
  granite: 230,
  quartz: 210,
  laminate: 32,
  porcelain: 222,
  stainless: 183,
  none: 0
};
const backsplashPrices = {
  fenix: 58,
  glass: 321,
  granite: 217,
  quartz: 190,
  laminate: 28,
  porcelain: 209,
  stainless: 90,
  none: 0
};

const toekickPrice = 1.50;
const profilePrice = 1.26;
const lightingPrice = 3.667;
const transformerPrice = 140.00;
const STR_BaseRate = 3.24;
const STR_WallRate = 5.64;
const STR_ColumnRate = 8.33;
const dollarConversion = 1.15;
const customDutiesRate = 0.10; // number to be applied pre-discount. 
const bufferLOW = 1.15;
const bufferHIGH = 1.3;


// Helper to get pricing array
function getPricing(style) {
  return style === 'handles' ? pricingHandles : pricingProfiles;
}

// Helper to get value from dropdown
function getDropdownValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}


//automatically set backsplash material to be the same as the countertop material
document.getElementById('countertop-material').addEventListener('change', function () {
  const selectedMaterial = this.value;
  const backsplashDropdown = document.getElementById('backsplash-material');
  backsplashDropdown.value = selectedMaterial;
  const waterfallDropdown = document.getElementById('waterfall-material');
  waterfallDropdown.value = selectedMaterial;
});

//show/hide logic for island back panel material
document.getElementById('island-configuration').addEventListener('change', function () {
  const config = this.value;
  const backPanelField = document.getElementById('back-panel-material');
  backPanelField.style.display = config === '1-sided' ? 'block' : 'none';
});

// MAIN CALCULATOR FUNCTION
function calculateTotalPrice() {
  
  CalculatorUtils.clearGlobalWarning();
  CalculatorUtils.clearSectionErrors();
  let hasError = false;

  let total = 0;

  // Get style
  const baseStyle = getDropdownValue('base-style');
  const wallStyle = getDropdownValue('wall-style');
  const columnStyle = getDropdownValue('column-style');
  const stackStyle = getDropdownValue('stack-style');
  const islandStyle = getDropdownValue('island-style');
  const applianceStyle = getDropdownValue('appliance-style');

  // Get price of specific style
  const basePricing = getPricing(baseStyle);
  const islandPricing = islandStyle ? getPricing(islandStyle) : null;
  const wallPricing = getPricing(wallStyle);
  const columnPricing = getPricing(columnStyle);
  const stackPricing = getPricing(stackStyle);
  const dishwasherPricing = getPricing(applianceStyle);
  
  // Get Level
  const baseLevel = parseInt(getDropdownValue('base-finish'));
  const wallLevel = parseInt(getDropdownValue('wall-finish'));
  const columnLevel = parseInt(getDropdownValue('column-finish'));
  const stackLevel = parseInt(getDropdownValue('stack-finish'));
  const islandLevel = parseInt(getDropdownValue('island-finish'));
  const applianceLevel = parseInt(getDropdownValue('appliance-finish'));
  const shelfLevel = parseInt(getDropdownValue('shelf-finish'));
  const countertopMaterial = document.getElementById('countertop-material').value;
  const backsplashMaterial = document.getElementById('backsplash-material').value;
  const waterfallMaterial = getDropdownValue('waterfall-material');


  // Get User Input for Linear Inches
  const baseInches = parseFloat(getDropdownValue('base-inches')) || 0;
  const wallInches = parseFloat(getDropdownValue('wall-inches')) || 0;
  const columnInches = parseFloat(getDropdownValue('column-inches')) || 0;
  const stackInches = parseFloat(getDropdownValue('stack-inches')) || 0;
  const islandInches = parseFloat(document.getElementById('island-inches').value) || 0;
  const shelfInches = parseFloat(getDropdownValue('shelf-inches')) || 0;
  const lightingInches = parseFloat(getDropdownValue('lighting-inches')) || 0;
  const countertopSqIn = parseFloat(getDropdownValue('countertop-sqin')) || 0;
  const waterfallSqIn = parseFloat(getDropdownValue('waterfall-sqin')) || 0;
  const backsplashSqIn = parseFloat(getDropdownValue('backsplash-sqin')) || 0;
  const dishwasherCount = parseInt(getDropdownValue('dishwasher-panels')) || 0;

  
  // Base Units Calculations 
  const baseUncovered = parseFloat(getDropdownValue('base-uncovered')) || 0;
  const baseLeMans = getDropdownValue('base-le-mans') === 'yes';
  const baseCornerUnits = parseInt(document.getElementById('base-corner-units').value) || 0;
  const baseCornerUnitsPrice = !isNaN(baseCornerUnits) ? basePricing.baseCorner[baseLevel] * baseCornerUnits : 0; //corner unit pricing
  const baseNetInches = Math.max(0, baseInches - baseUncovered - (baseCornerUnits * 72.45)); //adjusted net inches exl. island base cabinets
  const basePrice = !isNaN(baseLevel) ? (basePricing.base[baseLevel] * baseNetInches) : 0; 
  
    //island logic
    const islandConfig = document.getElementById('island-configuration').value;
    const backPanelMaterial = document.getElementById('back-panel-material').value;
    let islandPrice = 0;
    if (islandInches > 0 && islandStyle && islandPricing) {
      const baseRate = islandPricing.islandBase[islandLevel] || 0;
      if (islandConfig === '2-sided') {
        islandPrice = baseRate * islandInches * 2;
      } else if (islandConfig === '1-sided') {
        const panelSqIn = islandInches * 30;
        let panelRate = 0;
        if (!isNaN(parseInt(backPanelMaterial))) {
          // Material is a price list level (0–10)
          panelRate = fridgePanels[islandLevel] || 0;
        } else {
          // Material is a specialty finish
          panelRate = countertopPrices[backPanelMaterial] || 0;
        }
        islandPrice = (baseRate * islandInches) + (panelSqIn * panelRate);
      }
    }
 
  const baseTotal = basePrice + baseCornerUnitsPrice + islandPrice; // incl. island base cabinets
  const leMansBaseTotal = baseLeMans && !isNaN(baseLevel) ? basePricing.leMansBase[baseLevel] * baseCornerUnits: 0;

  // Wall Units
  const wallUncovered = parseFloat(getDropdownValue('wall-uncovered')) || 0;
  const wallNetInches = Math.max(0, wallInches - wallUncovered);
  const wallTotal = !isNaN(wallLevel) ? wallPricing.wall[wallLevel] * wallNetInches : 0;

  // Columns
  const columnCornerUnits = parseInt(document.getElementById('column-corner-units').value) || 0;
  const columnCornerUnitsPrice = !isNaN(columnCornerUnits) ? columnPricing.columnCorner[columnLevel] * columnCornerUnits : 0; //corner unit pricing
  const columnNetInches = Math.max(0, columnInches - (columnCornerUnits * 20.67)); //adjusted net inches
  
  const columnTotal = !isNaN(columnLevel) ? columnPricing.columns[columnLevel] * columnNetInches + columnCornerUnitsPrice: 0; //total column pricing including corner units
  
  const columnLeMans = getDropdownValue('column-le-mans') === 'yes';
  const leMansColumnTotal = columnLeMans && !isNaN(columnLevel) ? columnPricing.leMansColumn[columnLevel] * columnCornerUnits: 0; //le mans corner accessory pricing

  // Stack Cabinets
  const stackTotal = !isNaN(stackLevel) ? stackPricing.stack[stackLevel] * stackInches : 0;
  
  // Countertop & Backsplash 
  const countertopTotal = countertopSqIn > 0 ? countertopSqIn * countertopPrices[countertopMaterial] : 0;
  
  //Waterfall
  let waterfallTotal = 0;
  if (countertopMaterial === 'glass' && waterfallMaterial === 'glass matte' && waterfallSqIn > 0) {
    CalculatorUtils.showSectionError('waterfall-material', 'Waterfall is not available in Glass Matte finish. Please adjust your selection.');
    hasError = true;
  } else if (waterfallSqIn > 0 && waterfallMaterial) {
    let waterfallRate = 0;
    if (waterfallMaterial === 'Same as Base') {
      waterfallRate = fridgePanels[baseLevel] || 0;
    } else {
      waterfallRate = waterfallPrices[waterfallMaterial] || 0;
    }
    waterfallTotal = waterfallSqIn * waterfallRate;
  }
  
  const backsplashTotal = backsplashSqIn > 0 ? backsplashSqIn * backsplashPrices[backsplashMaterial] : 0;
  const surfaceTotal = countertopTotal + waterfallTotal + backsplashTotal;
  
  const dishwasherTotal = !isNaN(dishwasherCount) ? dishwasherPricing.dishwasher[applianceLevel]*dishwasherCount : 0;

  const fridgeSqIn = parseFloat(getDropdownValue('fridge-panel')) || 0;
  const fridgeTotal = !isNaN(applianceLevel) ? fridgeSqIn * fridgePanels[applianceLevel] : 0;
  
  // Shelves
  const shelfTotal = !isNaN(shelfLevel) ? shelfInches * shelfPrices[shelfLevel] : 0;

  // Lighting & Transformers
  const lightingTotal = lightingInches * lightingPrice;
  
  const transformers = Math.ceil(lightingInches / 60);
  const transformerTotal = transformers * transformerPrice;
  document.getElementById('transformer-count').textContent = transformers;

  // Profiles & Toe Kicks
  let toekickIslandInches = 0;
  if (islandConfig === '2-sided') {
    toekickIslandInches = islandInches * 2;
  } else if (islandConfig === '1-sided') {
    toekickIslandInches = islandInches;
  }
  const toeKickInches = Math.ceil((baseInches + columnInches + toekickIslandInches) * 1.2);
  const toeKickTotal = toeKickInches * toekickPrice;
  document.getElementById('toe-kick-inches').textContent = toeKickInches; 
  
  let profileInches = 0;
  if (baseStyle === 'profiles') {
    profileInches += baseInches;
  }
  if (columnStyle === 'profiles') {
    profileInches += columnInches;
  }
  if (islandStyle === 'profiles') {
    profileInches += islandInches;
  }
  const profileTotalInches = Math.ceil(profileInches * 1.2);
  const profileTotal = profileTotalInches * profilePrice;
  document.getElementById('profile-inches').textContent = profileInches;

  // GROUPED TOTALS
  //Cabinet Total
  let cabinetTotal = 0;

  // Base Units
  if (baseInches > 0 && baseStyle) {
    cabinetTotal += basePrice + baseCornerUnitsPrice;
 //   console.log('basePrice: ', basePrice);
//    console.log('baseCornerUnitsPrice: ', baseCornerUnitsPrice);
  } else if (baseInches > 0 && !baseStyle) {
    CalculatorUtils.showSectionError('base-style', 'Please select "Handles or Profiles" for Base Units.');
    hasError = true;
  }
  
  if (islandInches > 0 && islandStyle) {
    cabinetTotal += islandPrice;
  } else if (islandInches > 0 && !islandStyle) {
    CalculatorUtils.showSectionError('island-style', 'Please select "Handles or Profiles" for Island Cabinets.');
    hasError = true;
  }

  // Wall Units
  if (wallInches > 0 && wallStyle) {
    cabinetTotal += wallTotal;
  } else if (wallInches > 0 && !wallStyle) {
    CalculatorUtils.showSectionError('wall-style', 'Please select "Handles or Profiles" for Wall Units.');
     hasError = true;
  }

  // Columns
  if (columnInches > 0 && columnStyle) {
    cabinetTotal += columnTotal;
  } else if (columnInches > 0 && !columnStyle) {
    CalculatorUtils.showSectionError('column-style', 'Please select "Handles or Profiles" for Columns.');
    hasError = true;
  }

  // Stack Cabinets
  if (stackInches > 0 && stackStyle) {
    cabinetTotal += stackTotal;
  } else if (stackInches > 0 && !stackStyle) {
    CalculatorUtils.showSectionError('stack-style', 'Please select "Handles or Profiles" for Stack Cabinets.');
    hasError = true;
  }
  
  
  //STR Add On Calculations
  const internalBoxFinish = getDropdownValue('internal-box-finish');
  let internalBoxTotal = 0;

  if (internalBoxFinish === 'No') {
    const baseSTR = baseNetInches * STR_BaseRate;
    const wallSTR = wallInches * STR_WallRate;
    const columnSTR = columnInches * STR_ColumnRate;
    internalBoxTotal = baseSTR + wallSTR + columnSTR;
    cabinetTotal += internalBoxTotal;
  }

  //Corner Accessory Total
  
    if (baseInches > 0 && baseStyle && baseLeMans && baseCornerUnits > 0) {
      cabinetTotal += leMansBaseTotal;
     // cornerAccessoriesTotal += leMansBaseTotal;
 //     console.log('LeMansBaseTotal: ', leMansBaseTotal);
    } else if (baseInches > 0 && baseLeMans && (!baseStyle || baseCornerUnits === 0)) {
      if (!baseStyle) {
        CalculatorUtils.showSectionError('base-style', 'Handles or Profiles required for Le Mans Base Corner.');
      }
      if (baseCornerUnits === 0) {
        CalculatorUtils.showSectionError('base-corner-units', 'Please enter the number of base corner units if Le Mans Corner is selected.');
      }
      hasError = true;
    }

    if (columnInches > 0 && columnStyle && columnLeMans && columnCornerUnits > 0) {
     cabinetTotal += leMansColumnTotal;
 //     console.log('LeMansColumnTotal: ', leMansColumnTotal);
    } else if (columnInches > 0 && columnLeMans && (!columnStyle || columnCornerUnits === 0)) {
      if(!columnStyle) {
        CalculatorUtils.showSectionError('column-style', 'Handles or Profiles required for Le Mans Column Corner.');
      }
      if(columnCornerUnits ===0) {
        CalculatorUtils.showSectionError('column-corner-units', 'Please enter the number of column corner units if Le Mans Corner is selected.');
      }
      hasError = true;
    }

  //Appliance Panel Total
    if (dishwasherCount > 0 && !isNaN(applianceLevel)) {
      cabinetTotal += dishwasherTotal;
  //    console.log('DishwasherTotal: ', dishwasherTotal);
    } else if (dishwasherCount > 0 && !applianceLevel) {
      CalculatorUtils.showSectionError('appliance-finish', 'Finish level required for Dishwasher Panels.');
       hasError = true;
    }

    if (fridgeSqIn > 0 && !isNaN(applianceLevel)) {
      cabinetTotal += fridgeTotal;
 //     console.log('fridgeTotal: ', fridgeTotal);
    } else if (fridgeSqIn > 0 && !applianceLevel) {
      CalculatorUtils.showSectionError('appliance-finish', 'Finish level required for Fridge Panel.');
       hasError = true;
    }

  const lightingCombinedTotal = lightingTotal + transformerTotal;
  const profilesToeKicksTotal = profileTotal + toeKickTotal;
  cabinetTotal += profilesToeKicksTotal;
  console.log('profileToeKicksTotal: ', profilesToeKicksTotal);


  if (hasError) {
  CalculatorUtils.showGlobalWarning('Missing information: Please correct the missing selections to calculate your estimate.');
  document.getElementById('kitchen-price-result').textContent = '$0.00';
  return;
}
  let totalEuroPricePreDuties = (cabinetTotal * bufferLOW) + internalBoxTotal + shelfTotal + lightingCombinedTotal + surfaceTotal; 
  const estimatedDuties = totalEuroPricePreDuties * customDutiesRate * dollarConversion;

  const cabinetTotalHIGH = cabinetTotal * bufferHIGH;
  let totalEuroPricePreDutiesHIGH = cabinetTotalHIGH + internalBoxTotal + shelfTotal + lightingCombinedTotal + surfaceTotal;
  const estimatedDutiesHIGH = totalEuroPricePreDutiesHIGH * customDutiesRate * dollarConversion;

  //CONVERT ALL TO DOLLARS
  const dollarCabinetTotal = cabinetTotal * bufferLOW * dollarConversion;
  const dollarCabinetTotalHIGH = cabinetTotalHIGH * dollarConversion;
  const dollarInternalBoxTotal = internalBoxTotal * dollarConversion;
  const dollarShelfTotal = shelfTotal * dollarConversion;
  const dollarLightingCombinedTotal = lightingCombinedTotal * dollarConversion;
  const dollarSurfaceTotal = surfaceTotal * dollarConversion; 
  
// MASTER TOTAL
  
  let totalDollarPricePreDuties = dollarCabinetTotal + dollarInternalBoxTotal + dollarShelfTotal + dollarLightingCombinedTotal + dollarSurfaceTotal; // LOW MASTER TOTAL IN DOLLARS
  let totalDollarPricePreDutiesHIGH = dollarCabinetTotalHIGH + dollarInternalBoxTotal + dollarShelfTotal + dollarLightingCombinedTotal + dollarSurfaceTotal; // HIGH MASTER TOTAL IN DOLLARS
  

  // Apply dealer type logic - considered Discount in Euros - if dollar conversion changes, will need to update it here!
  const dealerMultipliersNovacucina = {
    advanced: 0.94,
    preferred: 0.84,
    elite: 0.75,
    builder: 1.61,
    designer: 1.84,
    retail: 2, 
    none: 1 
  };
  
  function applyDealerAdjustmentKitchen(value, dealerType) {
    const multiplier = dealerMultipliersNovacucina[dealerType] ?? 1;
    return value * multiplier;
  }
  
  const dealerType = document.getElementById('dealer-type').value;

// Total price
  const adjustedTotalLOW = applyDealerAdjustmentKitchen(totalDollarPricePreDuties, dealerType);
  const adjustedTotalWithDutiesLOW = adjustedTotalLOW + estimatedDuties;
  
  const adjustedTotalHIGH = applyDealerAdjustmentKitchen(totalDollarPricePreDutiesHIGH, dealerType);
  const adjustedTotalWithDutiesHIGH = adjustedTotalHIGH + estimatedDutiesHIGH; 
  document.getElementById('kitchen-price-result').textContent = `$${formatShortCurrency(adjustedTotalWithDutiesLOW)} – $${formatShortCurrency(adjustedTotalWithDutiesHIGH)}`;

// Breakdown
const breakdownContainer = document.getElementById('price-breakdown');
breakdownContainer.innerHTML = ''; // displays breakdown

const groupedBreakdown = {
  'Cabinets': dollarCabinetTotal,
  'Countertop & Backsplash': dollarSurfaceTotal,
  'Shelves': dollarShelfTotal,
  'Lighting': dollarLightingCombinedTotal,
};
  
  Object.entries(groupedBreakdown).forEach(([label, value]) => {
    const adjustedValue = applyDealerAdjustmentKitchen(value, dealerType);
    const adjustedValueHIGH = adjustedValue * bufferHIGH;
    
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    
    if(label=== 'Cabinets'){
      row.innerHTML = `<span>${label}</span><span>$${formatShortCurrency(adjustedValue)} – $${formatShortCurrency(adjustedValueHIGH)}</span>`;
    } else {
       row.innerHTML = `<span>${label}</span><span>$${formatShortCurrency(adjustedValue)}</span>`;
    }
    breakdownContainer.appendChild(row);
  });
  
  //Update Custom Duties Line independent of discount lelvel
  const dutiesRow = document.createElement('div');
  dutiesRow.className = 'breakdown-row';
  dutiesRow.innerHTML = `<span>Estimated Custom Duties</span><span>$${formatShortCurrency(estimatedDuties)} –  $${formatShortCurrency(estimatedDutiesHIGH)}</span>`;
  breakdownContainer.appendChild(dutiesRow);
}

//CALCULATE AUTOMATICALLY
function debounce(fn, delay = 3) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

const debouncedCalculate = debounce(calculateTotalPrice);

document.body.addEventListener('input', function (event) {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
    debouncedCalculate();
  }
});

document.body.addEventListener('change', function (event) {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
    debouncedCalculate();
  }
});




//----------------------------------------------------FLOOR C0DE-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Update Finish Dropdown based on Patina Answer
document.getElementById('floor-wood-grade').addEventListener('change', function () {
  const selectedGrade = this.value.toLowerCase();
  const standardFinish = document.getElementById('standard-finish-wrapper');
  const patinaFinish = document.getElementById('patina-finish-wrapper');

  if (['prima', 'select', 'natura'].includes(selectedGrade)) {
    standardFinish.style.display = 'block';
    patinaFinish.style.display = 'none';
  } else if (selectedGrade === 'patina') {
    standardFinish.style.display = 'none';
    patinaFinish.style.display = 'block';
  } else {
    // Reset both if nothing valid is selected
    standardFinish.style.display = 'none';
    patinaFinish.style.display = 'none';
  }
});


//Floor Price List
const floorPricing = {
  minimal: {
    prima: { adriatico: 15.70, alpino: 14.20, ambra: 14.20, beige: 14.60, biancone: 14.90, biondo: 16.50, brunito: 15.70, cadmio: 14.60, canaletto: 23.00, canneto: 14.60, carboncino: 14.90, castello: 16.50, cenere: 14.80, cognac: 14.60, colle: 14.60, cortina: 15.70, crudo: 17.00, dolomia: 14.50, dorato: 16.50, ducale: 18.00, floren: 15.70, fosco: 14.80, fume: 14.60, fumo_di_londra: 14.60, ginepro: 15.70, glace: 14.60, gorizia: 14.80, grafite: 15.70, grigiolondra: 14.60, grigioperla: 14.60, ionio: 14.90, istria: 14.80, mosto: 17.00, muschio: 14.80, ombra_grigia: 14.90, palon: 16.50, reno: 15.70, sabula: 14.90, sand: 14.60, selva: 14.80, seta: 14.50, tabaco: 14.60, tannico: 14.90, terra_bruciata: 14.80, terra_di_siena: 14.80, therra: 25.00, tirreno: 15.70, tortora: 14.90, vittorio: 16.50
           }, 
    select: { adriatico: 15.30, alpino: 13.70, ambra: 13.70, beige: 14.20, biancone: 14.40, brunito: 15.30, cadmio: 14.20, canneto: 14.20, carboncino: 14.40, cenere: 14.30, cognac: 14.20, colle: 14.20, cortina: 15.30, dolomia: 14.10, floren: 15.30, fosco: 14.30, fume: 14.20, fumo_di_londra: 14.20, ginepro: 15.30, glace: 14.20, gorizia: 14.30, grafite: 15.30, grigiolondra: 14.20, grigioperla: 14.20, ionio: 14.40, istria: 14.30, muschio: 14.30, ombra_grigia: 14.40, reno: 15.30, sabula: 14.40, sand: 14.20, selva: 14.30, seta: 14.10, tabaco: 14.20, tannico: 14.40, terra_bruciata: 14.30, terra_di_siena: 14.30, therra: 25.00, tirreno: 15.30, tortora: 14.40
            },
    natura: { adriatico: 14.80, alpino: 13.20, ambra: 13.20, beige: 13.60, biancone: 13.90, biondo: 15.00, brunito: 14.80, cadmio: 13.60, canaletto: 20.90, canneto: 13.60, carboncino: 13.90, castello: 15.00, cenere: 13.80, cognac: 13.60, colle: 13.60, cortina: 14.80, crudo: 15.20, dolomia: 13.50, dorato: 15.00, ducale: 16.30, floren: 14.80, fosco: 13.80, fume: 13.60, fumo_di_londra: 13.60, ginepro: 14.80, glace: 13.60, gorizia: 13.80, grafite: 14.80, grigiolondra: 13.60, grigioperla: 13.60, ionio: 13.90, istria: 13.80, mosto: 15.20, muschio: 13.80, ombra_grigia: 13.90, palon: 15.00, reno: 14.80, sabula: 13.90, sand: 13.60, selva: 13.80, seta: 13.50, tabaco: 13.60, tannico: 13.90, terra_bruciata: 13.80, terra_di_siena: 13.80, therra: 25.00, tirreno: 14.80, tortora: 13.90, vittorio: 15.00
            }
  },
  
  slim: {
    prima: { adriatico: 16.70, alpino: 15.10, ambra: 15.10, beige: 15.50, biancone: 15.80, biondo: 17.20, brunito: 16.70, cadmio: 15.50, canaletto: 23.60, canneto: 15.50, carboncino: 15.80, castello: 17.20, cenere: 15.70, cognac: 15.50, colle: 15.50, cortina: 16.70, crudo: 17.40, dolomia: 15.40, dorato: 17.20, ducale: 18.50, floren: 16.70, fosco: 15.70, fume: 15.50, fumo_di_londra: 15.50, ginepro: 16.70, glace: 15.50, gorizia: 15.70, grafite: 16.70, grigiolondra: 15.50, grigioperla: 15.50, ionio: 15.80, istria: 15.70, mosto: 17.40, muschio: 15.70, ombra_grigia: 15.80, palon: 17.20, reno: 16.70, sabula: 15.80, sand: 15.50, selva: 15.70, seta: 15.40, tabaco: 15.50, tannico: 15.80, terra_bruciata: 15.70, terra_di_siena: 15.70, therra: 25.50, tirreno: 16.70, tortora: 15.80, vittorio: 17.20
           },
    select: { adriatico: 15.50, alpino: 13.90, ambra: 13.90, beige: 14.30, biancone: 14.60, brunito: 15.50, cadmio: 14.30, canneto: 14.30, carboncino: 14.60, cenere: 14.50, cognac: 14.30, colle: 14.30, cortina: 15.50, dolomia: 14.20, floren: 15.50, fosco: 14.50, fume: 14.30, fumo_di_londra: 14.30, ginepro: 15.50, glace: 14.30, gorizia: 14.50, grafite: 15.50, grigiolondra: 14.30, grigioperla: 14.30, ionio: 14.60, istria: 14.50, muschio: 14.50, ombra_grigia: 14.60, reno: 15.50, sabula: 14.60, sand: 14.30, selva: 14.50, seta: 14.20, tabaco: 14.30, tannico: 14.60, terra_bruciata: 14.50, terra_di_siena: 14.50, therra: 25.50, tirreno: 15.50, tortora: 14.60
            },
    natura: { adriatico: 15.00, alpino: 13.40, ambra: 13.40, beige: 13.80, biancone: 14.00, biondo: 15.70, brunito: 15.00, cadmio: 13.80, canaletto: 21.50, canneto: 13.80, carboncino: 14.00, castello: 15.70, cenere: 14.00, cognac: 13.80, colle: 13.80, cortina: 15.00, crudo: 15.90, dolomia: 13.70, dorato: 15.70, ducale: 16.7, floren: 15.00, fosco: 14.00, fume: 13.80, fumo_di_londra: 13.80, ginepro: 15.00, glace: 13.80, gorizia: 14.00, grafite: 15.00, grigiolondra: 13.80, grigioperla: 13.80, ionio: 14.00, istria: 14.00, mosto: 15.90, muschio: 14.00, ombra_grigia: 14.00, palon: 15.70, reno: 15.00, sabula: 14.00, sand: 13.80, selva: 14.00, seta: 13.70, tabaco: 13.80, tannico: 14.00, terra_bruciata: 14.00, terra_di_siena: 14.00, therra: 25.50, tirreno: 15.00, tortora: 14.00, vittorio: 15.70
            }
  },
 
  large: {
    prima: {adriatico: 17.70, alpino: 16.10, ambra: 16.10, beige: 16.50, biancone: 16.80, biondo: 18.20, brunito: 17.70, cadmio: 16.50, canaletto: 24.50, canneto: 16.50, carboncino: 16.80, castello: 18.20, cenere: 16.70, cognac: 16.50, colle: 16.50, cortina: 17.70, crudo: 18.40, dolomia: 16.40, dorato: 18.20, ducale: 19.50, floren: 17.70, fosco: 16.70, fume: 16.50, fumo_di_londra: 16.50, ginepro: 17.70, glace: 16.50, gorizia: 16.70, grafite: 17.70, grigiolondra: 16.50, grigioperla: 16.50, ionio: 16.80, istria: 16.70, mosto: 18.40, muschio: 16.70, ombra_grigia: 16.80, palon: 18.20, reno: 17.70, sabula: 16.80, sand: 16.50, selva: 16.70, seta: 16.40, tabaco: 16.50, tannico: 16.80, terra_bruciata: 16.70, terra_di_siena: 16.70, therra: 26.30, tirreno: 17.70, tortora: 16.80, vittorio: 18.20
    }, 
    select: {adriatico: 16.40, alpino: 14.90, ambra: 14.90, beige: 15.30, biancone: 15.60, brunito: 16.40, cadmio: 15.30, canneto: 15.30, carboncino: 15.60, cenere: 15.50, cognac: 15.30, colle: 15.30, cortina: 16.40, dolomia: 15.20, floren: 16.40, fosco: 15.50, fume: 15.30, fumo_di_londra: 15.30, ginepro: 16.40, glace: 15.30, gorizia: 15.50, grafite: 16.40, grigiolondra: 15.30, grigioperla: 15.30, ionio: 15.60, istria: 15.50, muschio: 15.50, ombra_grigia: 15.60, reno: 16.40, sabula: 15.60, sand: 15.30, selva: 15.50, seta: 15.20, tabaco: 15.30, tannico: 15.60, terra_bruciata: 15.50, terra_di_siena: 15.50, therra: 26.30, tirreno: 16.40, tortora: 15.60
    },
    natura: {adriatico: 15.90, alpino: 14.30, ambra: 14.30, beige: 14.80, biancone: 15.00, biondo: 16.50, brunito: 15.90, cadmio: 14.80, canaletto: 22.40, canneto: 14.80, carboncino: 15.00, castello: 16.50, cenere: 14.90, cognac: 14.80, colle: 14.80, cortina: 15.90, crudo: 16.70, dolomia: 14.70, dorato: 16.50, ducale: 17.80, floren: 15.90, fosco: 14.90, fume: 14.80, fumo_di_londra: 14.80, ginepro: 15.90, glace: 14.80, gorizia: 14.90, grafite: 15.90, grigiolondra: 14.80, grigioperla: 14.80, ionio: 15.00, istria: 14.90, mosto: 16.70, muschio: 14.90, ombra_grigia: 15.00, palon: 16.50, reno: 15.90, sabula: 15.00, sand: 14.80, selva: 14.90, seta: 14.70, tabaco: 14.80, tannico: 15.00, terra_bruciata: 14.90, terra_di_siena: 14.90, therra: 26.30, tirreno: 15.90, tortora: 15.00, vittorio: 16.50
            },
    patina: {cadoro: 20.40, caigo: 20.50, campielo: 20.10, campo: 20.70, canal: 20.70, corso: 20.50, fondaco: 20.70, loggia: 20.50, molino: 20.70, riva: 20.50
            }
  }, 
 
  extra_large: {
    prima: {adriatico: 19.10, alpino: 17.60, ambra: 17.60, beige: 18.00, biancone: 18.20, biondo: 18.70, brunito: 19.10, cadmio: 18.00, canaletto: 25.60, canneto: 18.00, carboncino: 18.20, castello: 18.70, cenere: 18.10, cognac: 18.00, colle: 18.00, cortina: 19.10, crudo: 19.00, dolomia: 17.90, dorato: 18.70, ducale: 20.00, floren: 19.10, fosco: 18.10, fume: 18.00, fumo_di_londra: 18.00, ginepro: 19.10, glace: 18.00, gorizia: 18.10, grafite: 19.10, grigiolondra: 18.00, grigioperla: 18.00, ionio: 18.20, istria: 18.10, mosto: 19.00, muschio: 18.10, ombra_grigia: 18.20, palon: 18.70, reno: 19.10, sabula: 18.20, sand: 18.00, selva: 18.10, seta: 17.90, tabaco: 18.00, tannico: 18.20, terra_bruciata: 18.10, terra_di_siena: 18.10, therra: 27.50, tirreno: 19.10, tortora: 18.20, vittorio: 18.70 
    }, 
    select: {adriatico: 17.20, alpino: 15.60, ambra: 15.60, beige: 16.10, biancone: 16.30, brunito: 17.20, cadmio: 16.10, canneto: 16.10, carboncino: 16.30, cenere: 16.20, cognac: 16.10, colle: 16.10, cortina: 17.20, dolomia: 16.00, floren: 17.20, fosco: 16.20, fume: 16.10, fumo_di_londra: 16.10, ginepro: 17.20, glace: 16.10, gorizia: 16.20, grafite: 17.20, grigiolondra: 16.10, grigioperla: 16.10, ionio: 16.30, istria: 16.20, muschio: 16.20, ombra_grigia: 16.30, reno: 17.20, sabula: 16.30, sand: 16.10, selva: 16.20, seta: 16.00, tabaco: 16.10, tannico: 16.30, terra_bruciata: 16.20, terra_di_siena: 16.20, therra: 27.50, tirreno: 17.20, tortora: 16.30
            },
    natura: {adriatico: 16.20, alpino: 14.70, ambra: 14.70, beige: 15.10, biancone: 15.30, biondo: 16.80, brunito: 16.20, cadmio: 15.10, canaletto: 23.50, canneto: 15.10, carboncino: 15.30, castello: 16.80, cenere: 15.20, cognac: 15.10, colle: 15.10, cortina: 16.20, crudo: 17.00, dolomia: 15.00, dorato: 16.80, ducale: 18.10, floren: 16.20, fosco: 15.20, fume: 15.10, fumo_di_londra: 15.10, ginepro: 16.20, glace: 15.10, gorizia: 15.20, grafite: 16.20, grigiolondra: 15.10, grigioperla: 15.10, ionio: 15.30, istria: 15.20, mosto: 17.00, muschio: 15.20, ombra_grigia: 15.30, palon: 16.80, reno: 16.20, sabula: 15.30, sand: 15.10, selva: 15.20, seta: 15.00, tabaco: 15.10, tannico: 15.30, terra_bruciata: 15.20, terra_di_siena: 15.20, therra: 27.50, tirreno: 16.20, tortora: 15.30, vittorio: 16.80
            }, 
    patina: {cadoro: 21.00, caigo: 21.10, campielo: 20.80, campo: 21.30, canal: 21.30, corso: 21.10, fondaco: 21.30, loggia: 21.10, molino: 21.30, riva: 21.10
            }
  }, 
  
  superior: {
    prima: {adriatico: 20.00, alpino: 18.50, ambra: 18.50, beige: 18.90, biancone: 19.20, biondo: 19.90, brunito: 20.00, cadmio: 18.90, canaletto: 26.30, canneto: 18.90, carboncino: 19.20, castello: 19.90, cenere: 19.10, cognac: 18.90, colle: 18.90, cortina: 20.00, crudo: 20.10, dolomia: 18.80, dorato: 19.90, ducale: 21.20, floren: 20.00, fosco: 19.10, fume: 18.90, fumo_di_londra: 18.90, ginepro: 20.00, glace: 18.90, gorizia: 19.10, grafite: 20.00, grigiolondra: 18.90, grigioperla: 18.90, ionio: 19.20, istria: 19.10, mosto: 20.10, muschio: 19.10, ombra_grigia: 19.20, palon: 19.90, reno: 20.00, sabula: 19.20, sand: 18.90, selva: 19.10, seta: 18.80, tabaco: 18.90, tannico: 19.20, terra_bruciata: 19.10, terra_di_siena: 19.10, tirreno: 20.00, tortora: 19.20, vittorio: 19.90    
           }, 
    select: {adriatico: 18.10, alpino: 16.60, ambra: 16.60, beige: 17.00, biancone: 17.20, brunito: 18.10, cadmio: 17.00, canneto: 17.00, carboncino: 17.20, cenere: 17.10, cognac: 17.00, colle: 17.00, cortina: 18.10, dolomia: 16.90, floren: 18.10, fosco: 17.10, fume: 17.00, fumo_di_londra: 17.00, ginepro: 18.10, glace: 17.00, gorizia: 17.10, grafite: 18.10, grigiolondra: 17.00, grigioperla: 17.00, ionio: 17.20, istria: 17.10, muschio: 17.10, ombra_grigia: 17.20, reno: 18.10, sabula: 17.20, sand: 17.00, selva: 17.10, seta: 16.90, tabaco: 17.00, tannico: 17.20, terra_bruciata: 17.10, terra_di_siena: 17.10, tirreno: 18.10, tortora: 17.20
            },
    natura: {adriatico: 17.20, alpino: 15.60, ambra: 15.60, beige: 16.00, biancone: 16.30, biondo: 17.60, brunito: 17.20, cadmio: 16.00, canaletto: 24.20, canneto: 16.00, carboncino: 16.30, castello: 17.60, cenere: 16.20, cognac: 16.00, colle: 16.00, cortina: 17.20, crudo: 17.80, dolomia: 15.90, dorato: 17.60, ducale: 18.90, floren: 17.20, fosco: 16.20, fume: 16.00, fumo_di_londra: 16.00, ginepro: 17.20, glace: 16.00, gorizia: 16.20, grafite: 17.20, grigiolondra: 16.00, grigioperla: 16.00, ionio: 16.30, istria: 16.20, mosto: 17.80, muschio: 16.20, ombra_grigia: 16.30, palon: 17.60, reno: 17.20, sabula: 16.30, sand: 16.00, selva: 16.20, seta: 15.90, tabaco: 16.00, tannico: 16.30, terra_bruciata: 16.20, terra_di_siena: 16.20, tirreno: 17.20, tortora: 16.30, vittorio: 17.60
            },
    patina: {cadoro: 21.70, caigo: 21.80, campielo: 21.40, campo: 22.00, canal: 22.00, corso: 21.80, fondaco: 22.00, loggia: 21.80, molino: 22.00, riva: 21.80
            }
  }, 
  
  space: {
    prima: {adriatico: 21.00, alpino: 19.40, ambra: 19.40, beige: 19.60, biancone: 20.00, biondo: 20.60, brunito: 21.00, cadmio: 19.60, canneto: 19.60, carboncino: 20.00, castello: 20.60, cenere: 19.90, cognac: 19.60, colle: 19.60, cortina: 21.00, crudo: 20.80, dolomia: 19.50, dorato: 20.60, ducale: 22.00, floren: 21.00, fosco: 19.90, fume: 19.60, fumo_di_londra: 19.60, ginepro: 21.00, glace: 19.60, gorizia: 19.90, grafite: 21.00, grigiolondra: 19.60, grigioperla: 19.60, ionio: 20.00, istria: 19.90, mosto: 20.80, muschio: 19.90, ombra_grigia: 20.00, palon: 20.60, reno: 21.00, sabula: 20.00, sand: 19.60, selva: 19.90, seta: 19.50, tabaco: 19.60, tannico: 20.00, terra_bruciata: 19.90, terra_di_siena: 19.90, tirreno: 21.00, tortora: 20.00, vittorio: 20.60
           }, 
    select: {adriatico: 19.00, alpino: 17.40, ambra: 17.40, beige: 17.80, biancone: 18.10, brunito: 19.00, cadmio: 17.80, canneto: 17.80, carboncino: 18.10, cenere: 18.00, cognac: 17.80, colle: 17.80, cortina: 19.00, dolomia: 17.70, floren: 19.00, fosco: 18.00, fume: 17.80, fumo_di_londra: 17.80, ginepro: 19.00, glace: 17.80, gorizia: 18.00, grafite: 19.00, grigiolondra: 17.80, grigioperla: 17.80, ionio: 18.10, istria: 18.00, muschio: 18.00, ombra_grigia: 18.10, reno: 19.00, sabula: 18.10, sand: 17.80, selva: 18.00, seta: 17.70, tabaco: 17.80, tannico: 18.10, terra_bruciata: 18.00, terra_di_siena: 18.00, tirreno: 19.00, tortora: 18.10
            },
    natura: {adriatico: 18.00, alpino: 16.40, ambra: 16.40, beige: 16.80, biancone: 17.10, biondo: 18.30, brunito: 18.00, cadmio: 16.80, canneto: 16.80, carboncino: 17.10, castello: 18.30, cenere: 17.00, cognac: 16.80, colle: 16.80, cortina: 18.00, crudo: 18.50, dolomia: 16.70, dorato: 18.30, ducale: 19.60, floren: 18.00, fosco: 17.00, fume: 16.80, fumo_di_londra: 16.80, ginepro: 18.00, glace: 16.80, gorizia: 17.00, grafite: 18.00, grigiolondra: 16.80, grigioperla: 16.80, ionio: 17.10, istria: 17.00, mosto: 18.50, muschio: 17.00, ombra_grigia: 17.10, palon: 18.30, reno: 18.00, sabula: 17.10, sand: 16.80, selva: 17.00, seta: 16.70, tabaco: 16.80, tannico: 17.10, terra_bruciata: 17.00, terra_di_siena: 17.00, tirreno: 18.00, tortora: 17.10, vittorio: 18.30
            }
  }
};

const customBrushPrice = 0.33;
const sawCutPrice = 0.76;
const crossedSawCutPrice = 1.00;
const agedEffectPrice = 1.63;
const handmadePlaningPrice = 1.85;

//FLOOR-SPECIFIC ERROR LOGIC
function showFloorError(message) {
  const warning = document.getElementById('floor-error-message');
  if (warning) {
    warning.textContent = message;
    warning.style.display = 'block';
  }
}

function clearFloorError() {
  const warning = document.getElementById('floor-error-message');
  if (warning) {
    warning.textContent = '';
    warning.style.display = 'none';
  }
}


let lastInvalidCombo = null;
let floorWarningTimer = null;

function calculateFloorPrice() {
  clearFloorError();

  const floorWoodGrade = document.getElementById('floor-wood-grade').value.toLowerCase();
  const floorWidth = document.getElementById('floor-board-width').value;
  const floorSqFt = parseFloat(document.getElementById('floor-sqft').value);

  // ✅ Determine finish based on wood grade
  const floorFinish = floorWoodGrade === 'patina'
    ? document.getElementById('patina-floor-finish').value
    : document.getElementById('standard-floor-finish').value;

  const requiredFields = [floorWoodGrade, floorFinish, floorWidth];
  const allSelected = requiredFields.every(val => val && val !== '');
  
  if (allSelected) {
    const hasPricing =
    floorPricing[floorWidth] &&
    floorPricing[floorWidth][floorWoodGrade] &&
    floorPricing[floorWidth][floorWoodGrade][floorFinish] !== undefined;
    
    if (!hasPricing) {
      resetFloorBreakdownValues();
      showFloorError("Pricing is not available for the selected combination. Please revise your input.");
      return;
    } else{ 
      clearFloorError();
    }
  } else {
    clearFloorError();
    resetFloorBreakdownValues();
    return;
  }
  
  const comboKey = `${floorWidth}|${floorWoodGrade}|${floorFinish}`;
  
  // ✅ Valid combo
  const unitPrice = floorPricing[floorWidth][floorWoodGrade][floorFinish];
  let floorOnlyPrice = unitPrice * (isNaN(floorSqFt) ? 0 : floorSqFt);
  
  // ✅ Check if custom brush is selected
  const includeCustomBrush = document.getElementById('floor-custom-brush').checked;
  const includeSawCut = document.getElementById('floor-saw-cut').checked;
  const includeCrossedSawCut = document.getElementById('floor-crossed-saw-cut').checked;
  const includeAgedEffect = document.getElementById('floor-aged-effect').checked;
  const includeHandmadePlaning = document.getElementById('floor-handmade-planing').checked;

  const extraFloorInput = document.getElementById('floor-extra-sqft').value;
  const extraFloorPercent = isNaN(parseFloat(extraFloorInput)) ? 0 : parseFloat(extraFloorInput) / 100;

  
  let floorCustomizationTotal = 0;
  if (includeCustomBrush) {
    floorCustomizationTotal = floorSqFt * customBrushPrice;
  }
  if (includeSawCut) {
    floorCustomizationTotal += floorSqFt * sawCutPrice;
  }
    if (includeCrossedSawCut) {
    floorCustomizationTotal += floorSqFt * crossedSawCutPrice;
  }
    if (includeAgedEffect) {
    floorCustomizationTotal += floorSqFt * agedEffectPrice;
  }
    if (includeHandmadePlaning) {
    floorCustomizationTotal += floorSqFt * handmadePlaningPrice;
  }
  //Add 15% buffer to sqft for cuts
  const additionalBuffer = (floorCustomizationTotal + floorOnlyPrice) * extraFloorPercent;
  const floorTotalWithBuffer = floorOnlyPrice + floorCustomizationTotal + additionalBuffer; //add 15% buffer of material
  //Add 10% custom duties
  const floorCustomDuties = floorTotalWithBuffer * 0.1;
  document.getElementById('floor-custom-duties-total').textContent = `$${floorCustomDuties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const dealerMultiplierLagunaSuperfici = {
    advanced: 0.7, 
    preferred: 0.7, 
    elite: 0.7, 
    builder: 0.85, 
    designer: 0.88, 
    retail: 1,
  }
  
  function applyDealerAdjustmentFloor(value, dealerType){
    const multiplier = dealerMultiplierLagunaSuperfici[dealerType] ?? 1;
    return value * multiplier;
  }
  const dealerType = document.getElementById('floor-dealer-type').value;
  
  const dealerFloorOnlyPrice = applyDealerAdjustmentFloor(floorOnlyPrice, dealerType);
  document.getElementById('floor-total').textContent = `$${dealerFloorOnlyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const dealerFloorCustomizationTotal = applyDealerAdjustmentFloor(floorCustomizationTotal, dealerType);
  document.getElementById('floor-custom-total').textContent = `$${dealerFloorCustomizationTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const dealerAdditionalBuffer = applyDealerAdjustmentFloor(additionalBuffer, dealerType);
  document.getElementById('floor-additional-buffer-total').textContent = `$${dealerAdditionalBuffer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
  const floorGrandTotal = dealerFloorOnlyPrice + dealerFloorCustomizationTotal + dealerAdditionalBuffer + floorCustomDuties;
  document.getElementById('floor-grand-total').textContent = `$${floorGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

}



// ✅ Bind all inputs and selects inside #floor-calculator
document.querySelectorAll('#floor-calculator select, #floor-calculator input').forEach(el => {
  el.addEventListener('change', calculateFloorPrice);
});

// ✅ Bind dealer-type separately (outside #floor-calculator)
document.getElementById('floor-dealer-type').addEventListener('change', calculateFloorPrice);

//resets all values to 0 - used after error is triggered
function resetFloorBreakdownValues() {
  const ids = [
    'floor-total',
    'floor-custom-total',
    'floor-additional-buffer-total',
    'floor-custom-duties-total',
    'floor-grand-total'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '$0.00';
  });
}


//----------------------------------------------------DISCOUNT CALCULATOR C0DE-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Euro <> Dollar conversion
const euroField = document.getElementById('euro-price');
const dollarField = document.getElementById('dollar-price');
const dollarConversionRate = 1.15;
let activeField = null;

// Track which field is being edited
euroField.addEventListener('focus', () => activeField = 'euro');
dollarField.addEventListener('focus', () => activeField = 'dollar');

// Euro → Dollar
euroField.addEventListener('input', function () {
  if (activeField !== 'euro') return;

  const euroValue = parseFloat(this.value);
  if (!isNaN(euroValue)) {
    dollarField.value = (euroValue * dollarConversionRate).toFixed(2);
  } else {
    dollarField.value = '';
  }
});

// Dollar → Euro
dollarField.addEventListener('input', function () {
  if (activeField !== 'dollar') return;

  const dollarValue = parseFloat(this.value);
  if (!isNaN(dollarValue)) {
    euroField.value = (dollarValue / dollarConversionRate).toFixed(2);
  } else {
    euroField.value = '';
  }
});

//Calculator Discount Logic
const discountMatrix = {
  advanced: {
    novacucina: 0.18,
    puntotre: 0.32,
    pianca: 0.27,
    barausse: 0.30,
    lecomfort: 0.27,
    lagunasuperfici: 0.30,
  },
  preferred: {
    novacucina: 0.27,
    puntotre: 0.35,
    pianca: 0.32,
    barausse: 0.35,
    lecomfort: 0.32,
    lagunasuperfici: 0.30,
  },
  elite: {
    novacucina: 0.35,
    puntotre: 0.37,
    pianca: 0.36,
    barausse: 0.37,
    lecomfort: 0.36,
    lagunasuperfici: 0.30,
  }
};

//Calculate Retail Price
const retailMultipliers = {
  novacucina: 2.00,
  puntotre: 1.60,
  pianca: 1.60,
  barausse: 1.00,
  lecomfort: 2.00,
  lagunasuperfici: 1.00,
};

//Calculate Designer Price
const designerMultipliers = {
  novacucina: 1.60,
  puntotre: 1.28,
  pianca: 1.28,
  barausse: 0.88,
  lecomfort: 1.40,
  lagunasuperfici: 0.88,
};

//Calculate Designer Price
const builderMultipliers = {
  novacucina: 1.40,
  puntotre: 1.12,
  pianca: 1.12,
  barausse: 0.85,
  lecomfort: 1.20,
  lagunasuperfici: 0.85,
};



function calculateDiscountedPrice() {
  const dealerLevel = document.getElementById('dealer-level').value;
  const brand = document.getElementById('brand').value;
  const euroInput = parseFloat(document.getElementById('euro-price').value);
  const dollarInput = parseFloat(document.getElementById('dollar-price').value);

  // Validate inputs
  if (!dealerLevel || !brand) return;

  const discountRate = discountMatrix[dealerLevel]?.[brand] ?? 0;
  const discountLabel = `${Math.round(discountRate * 100)}%`;

  // Determine base price
  let basePrice;
  basePrice = isNaN(euroInput) ? 0 : euroInput * 1.15;

  // Calculate discounted price
  const discountedPrice = basePrice * (1 - discountRate);

  // ✅ Calculate Estimated Duties
  const estimatedDuties = euroInput * customDutiesRate; 
  
  // ✅ Calculate Retail MSRP
  const retailMultiplier = retailMultipliers[brand] ?? 1;
  const retailMSRP = basePrice * retailMultiplier + estimatedDuties;
  
    // ✅ Calculate Designer MSRP
  const designerMultiplier = designerMultipliers[brand] ?? 1;
  const designerMSRP = basePrice * designerMultiplier + estimatedDuties;
  
      // ✅ Calculate Builder MSRP
  const builderMultiplier = builderMultipliers[brand] ?? 1;
  const builderMSRP = basePrice * builderMultiplier + estimatedDuties;
  

  

  // ✅ Update UI
  document.querySelector('.discount-level strong').textContent = `Discount: ${discountLabel}`;
  document.getElementById('discount-total').textContent = `$${discountedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('retail-MSRP').textContent = `$${retailMSRP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('designer-MSRP').textContent = `$${designerMSRP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('builder-MSRP').textContent = `$${builderMSRP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('catalog-custom-duties-total').textContent = `+$${estimatedDuties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

['dealer-level', 'brand', 'euro-price', 'dollar-price'].forEach(id => {
  document.getElementById(id).addEventListener('input', calculateDiscountedPrice);
  document.getElementById(id).addEventListener('change', calculateDiscountedPrice);
});
  


