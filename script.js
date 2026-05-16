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
  
  function getWarningEl() {
    const id = getActiveCalculatorId();
    return document.getElementById(id ? `${id}-warning` : 'calculator-warning');
  }
  function showGlobalWarning(message) {
    const warning = getWarningEl();
    if (warning) { warning.textContent = message; warning.style.display = 'block'; }
  }
  function clearGlobalWarning() {
    const warning = getWarningEl();
    if (warning) { warning.textContent = ''; warning.style.display = 'none'; }
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

function fmt(value) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

//----------------------------------------------------DISCOUNT CALCULATOR C0DE-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//Euro <> Dollar conversion
const euroField = document.getElementById('euro-price');
const dollarField = document.getElementById('dollar-price');
const dollarConversionRate = 1.17;
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
    novacucina: 0.20,
    puntotre: 0.32,
    pianca: 0.29,
    barausse: 0.30,
    lecomfort: 0.27,
    lagunasuperfici: 0.30,
  },
  preferred: {
    novacucina: 0.27,
    puntotre: 0.35,
    pianca: 0.34,
    barausse: 0.35,
    lecomfort: 0.32,
    lagunasuperfici: 0.30,
  },
  elite: {
    novacucina: 0.35,
    puntotre: 0.37,
    pianca: 0.38,
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
  const basePrice = isNaN(euroInput) ? 0 : euroInput * dollarConversionRate;

  // Calculate discounted price
  const discountedPrice = basePrice * (1 - discountRate);

  // ✅ Calculate Estimated Duties (brand-specific import duty multipliers)
  const dutyBrandMultipliers = {
    novacucina:      0.5 * 0.95,
    puntotre:        0.5 * 0.85,
    pianca:          0.5,
    lagunasuperfici: 0.5,
    barausse:        0.5 * 0.9,
    lecomfort:       0.5 * 0.9
  };
  const dutyMultiplier = dutyBrandMultipliers[brand] ?? 0.5;
  const estimatedDuties = euroInput * dutyMultiplier * customDutiesRate;
  
  // ✅ Calculate Retail MSRP
  const retailMultiplier = retailMultipliers[brand] ?? 1;
  const retailMSRP = basePrice * retailMultiplier;
  
    // ✅ Calculate Designer MSRP
  const designerMultiplier = designerMultipliers[brand] ?? 1;
  const designerMSRP = basePrice * designerMultiplier;
  
      // ✅ Calculate Builder MSRP
  const builderMultiplier = builderMultipliers[brand] ?? 1;
  const builderMSRP = basePrice * builderMultiplier;
  

  

  // ✅ Update UI
  document.querySelector('.discount-level strong').textContent = `Discount: ${discountLabel}`;
  document.getElementById('discount-total').textContent = `$${fmt(discountedPrice)}`;
  document.getElementById('retail-MSRP').textContent = `$${fmt(retailMSRP)}`;
  document.getElementById('designer-MSRP').textContent = `$${fmt(designerMSRP)}`;
  document.getElementById('builder-MSRP').textContent = `$${fmt(builderMSRP)}`;
  document.getElementById('catalog-custom-duties-total').textContent = `+$${fmt(estimatedDuties)}`;
}

['dealer-level', 'brand', 'euro-price', 'dollar-price'].forEach(id => {
  ['input', 'change'].forEach(evt =>
    document.getElementById(id).addEventListener(evt, calculateDiscountedPrice)
  );
});
  

//---------------------------------------------------------KITCHEN CODE-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Build repeated dropdown options programmatically
function buildPriceListSelect(id) {
  const sel = document.getElementById(id);
  if (!sel) return;
  for (let i = 0; i <= 10; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Price List ${i}`;
    sel.appendChild(opt);
  }
}
function buildStyleSelect(id) {
  const sel = document.getElementById(id);
  if (!sel) return;
  [['handles', 'Handles'], ['profiles', 'Profiles']].forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    sel.appendChild(opt);
  });
}

['overall-finish', 'base-finish', 'wall-finish', 'column-finish',
 'stack-finish', 'shelf-finish', 'appliance-finish', 'island-finish']
  .forEach(buildPriceListSelect);

['overall-style', 'base-style', 'wall-style', 'column-style',
 'stack-style', 'appliance-style', 'island-style']
  .forEach(buildStyleSelect);

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
const fridgePanels = [0.16, 0.2, 0.24, 0.41, 0.56, 0.77, 0.95, 1.2, 1.28, 1.53, 2.28];

//Countertop and Backslash pricing
const countertopPrices = {
  fenix: 0.38,
  glass: 3.61,
  granite: 1.26,
  quartz: 1.71,
  laminate: 0.28,
  porcelain: 1.77,
  stainless: 0.69,
  none: 0
};

const waterfallPrices = {
  fenix: 0.19,
  granite: 1.60,
  quartz: 1.46,
  laminate: 0.22,
  porcelain: 1.54,
  stainless: 1.27,
  none: 0
};
const backsplashPrices = {
  fenix: 0.40,
  glass: 2.23,
  granite: 1.51,
  quartz: 1.32,
  laminate: 0.19,
  porcelain: 1.45,
  stainless: 0.63,
  none: 0
};

const toekickPrice = 1.50;
const profilePrice = 1.26;
const lightingPrice = 3.667;
const transformerPrice = 140.00;
const STR_BaseRate = 3.24;
const STR_WallRate = 5.64;
const STR_ColumnRate = 8.33;

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

  // GROUPED TOTALS
  //Cabinet Total
  let cabinetTotal = 0;

  // Base Units
  if (baseInches > 0 && baseStyle) {
    cabinetTotal += basePrice + baseCornerUnitsPrice;
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
  } else if (dishwasherCount > 0 && !applianceLevel) {
    CalculatorUtils.showSectionError('appliance-finish', 'Finish level required for Dishwasher Panels.');
     hasError = true;
  }
  
  if (fridgeSqIn > 0 && !isNaN(applianceLevel)) {
    cabinetTotal += fridgeTotal;
  } else if (fridgeSqIn > 0 && !applianceLevel) {
    CalculatorUtils.showSectionError('appliance-finish', 'Finish level required for Fridge Panel.');
     hasError = true;
  }

  const lightingCombinedTotal = lightingTotal + transformerTotal;
  const profilesToeKicksTotal = profileTotal + toeKickTotal;
  cabinetTotal += profilesToeKicksTotal;

  if (hasError) {
    CalculatorUtils.showGlobalWarning('Missing information: Please correct the missing selections to calculate your estimate.');
    document.getElementById('kitchen-price-result').textContent = '$0.00';
    return;
  }
  
  //Adds low and high buffer to cabinet price
  const cabinetPointHIGH = cabinetTotal * bufferHIGH; 
  const cabinetPointLOW = cabinetTotal * bufferLOW; 
  
  //total point price pre-duties considering both low and high buffer
  const totalPointHIGH = cabinetPointHIGH + internalBoxTotal + shelfTotal + lightingCombinedTotal + surfaceTotal; 
  const totalPointLOW = cabinetPointLOW + internalBoxTotal + shelfTotal + lightingCombinedTotal + surfaceTotal; 
  
  //calculate custom duties for both low and high price range AND convert it to dollars.
  const dutiesPriceHIGH = totalPointHIGH * 0.5 * 0.95 * customDutiesRate * dollarConversionRate;
  const dutiesPriceLOW  = totalPointLOW  * 0.5 * 0.95 * customDutiesRate * dollarConversionRate;
  
  // Adjust Price based on SALE GROUP Level AND automatically converts to dollars. 
  const dealerMultipliersNovacucina = {
    advanced: 0.936,
    preferred: 0.8541,
    elite: 0.7605,
    builder: 1.638,
    designer: 1.872,
    retail: 2.34, 
    none: 1 
  };
  
  //DIFFERENT RESELL VALUE FOR COUNTERTOPS & LIGHTING
  const smallerMultipliersNovacucina = { //DIFFERENT RESELL VALUE FOR COUNTERTOPS & LIGHTING
    advanced: 0.936,
    preferred: 0.8541,
    elite: 0.7605,
    builder: 1.19,
    designer: 1.24,
    retail: 1.34, 
    none: 1 
  };
  
  function applyDealerAdjustmentKitchen(value, dealerType) {
    const multiplier = dealerMultipliersNovacucina[dealerType] ?? 1;
    return value * multiplier;
  }
  
  function applySMALLDealerAdjustmentKitchen(value, dealerType) {
    const countertopMultiplier = smallerMultipliersNovacucina[dealerType] ?? 1;
    return value * countertopMultiplier;
  }
  
  const dealerType = document.getElementById('dealer-type').value;

  // Adjust Prices based on SALE GROUP & CONVERTS TO DOLLARS
  const adjustedCabinetHIGH = applyDealerAdjustmentKitchen(cabinetPointHIGH, dealerType);
  const adjustedCabinetLOW = applyDealerAdjustmentKitchen(cabinetPointLOW, dealerType);  
  const adjustedInternalBoxTotal = applyDealerAdjustmentKitchen(internalBoxTotal, dealerType); //VERIFY THAT THIS GETS ADDED TO BASE CABINETS
  const adjustedShelfTotal = applyDealerAdjustmentKitchen(shelfTotal, dealerType);
  const adjustedLightingTotal = applySMALLDealerAdjustmentKitchen(lightingCombinedTotal, dealerType); //DIFFERENT RESELL VALUE FOR LIGHTING
  const adjustedSurfaceTotal = applySMALLDealerAdjustmentKitchen(surfaceTotal, dealerType); //DIFFERENT RESELL VALUE FOR COUNTERTOPS
  
  //calculate GRAND TOTAL with adjusted prices
  const grandTotalHIGH = adjustedCabinetHIGH + adjustedInternalBoxTotal + adjustedShelfTotal + adjustedLightingTotal + adjustedSurfaceTotal + dutiesPriceHIGH;
  const grandTotalLOW = adjustedCabinetLOW + adjustedInternalBoxTotal + adjustedShelfTotal + adjustedLightingTotal + adjustedSurfaceTotal + dutiesPriceLOW;
  
  const kitchenDealerGroup = document.getElementById("dealer-type")?.value || "none";
  const kitchenCurrencySymbol = kitchenDealerGroup === "none" ? "€" : "$";

  
  //Display Grand Total Range
  document.getElementById('kitchen-price-result').textContent = `${kitchenCurrencySymbol}${formatShortCurrency(grandTotalLOW)} – ${kitchenCurrencySymbol}${formatShortCurrency(grandTotalHIGH)}`;
  
  // Breakdown
  const breakdownContainer = document.getElementById('price-breakdown');
  breakdownContainer.innerHTML = ''; // displays breakdown
  
  const groupedBreakdown = {
    'Cabinets': [adjustedCabinetLOW, adjustedCabinetHIGH],
    'Countertop & Backsplash': adjustedSurfaceTotal,
    'Shelves': adjustedShelfTotal,
    'Lighting': adjustedLightingTotal,
  };
  
  Object.entries(groupedBreakdown).forEach(([label, values]) => {
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    
    if(label=== 'Cabinets'){
      row.innerHTML = `<span>${label}</span><span>${kitchenCurrencySymbol}${formatShortCurrency(values[0])} – ${kitchenCurrencySymbol}${formatShortCurrency(values[1])}</span>`;
    } else {
       row.innerHTML = `<span>${label}</span><span>${kitchenCurrencySymbol}${formatShortCurrency(values)}</span>`;
    }
    breakdownContainer.appendChild(row);
  });
  
  //Update Custom Duties Line independent of discount lelvel
  const dutiesRow = document.createElement('div');
  dutiesRow.className = 'breakdown-row';
  dutiesRow.innerHTML = `<span>Estimated Custom Duties</span><span>$${formatShortCurrency(dutiesPriceLOW)} –  $${formatShortCurrency(dutiesPriceHIGH)}</span>`;
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

['input', 'change'].forEach(evt =>
  document.body.addEventListener(evt, e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') debouncedCalculate();
  })
);



//----------------------------------------------------BATHROOM C0DE-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add New Cabinet Template
let cabinetCount = 1;

//RESET ACTIONS
function resetBathroomBreakdownValues() {
  const ids = [
    'bathroom-total',
    'bathroom-upgrade-total',
    'bathroom-custom-duties-total',
    'bathroom-grand-total'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '$0.00';
  });
}
function resetBathroomErrorMessage() {
  const errorBox = document.getElementById('bathroom-error-message');
  if (errorBox) {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
}
function resetBathroomCountertop() {
  // Reset all countertop dropdowns
  const countertopFields = [
    'bath-countertop-material',
    'bath-countertop-pricelevel',
    'bath-countertop-depth',
    'bath-countertop-length',
    'bath-countertop-thickness',
    'bath-sink-type'
  ];

  countertopFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // Reset sink number to default
  const sinkNum = document.getElementById("sink-number");
  if (sinkNum) sinkNum.value = "1";

  // Hide dynamic fields (price level + sink type)
  const priceLevelWrapper = document.getElementById("countertop-pricelevel-wrapper");
  const sinkTypeWrapper = document.getElementById("countertop-sinktype-wrapper");

  if (priceLevelWrapper) priceLevelWrapper.style.display = "none";
  if (sinkTypeWrapper) sinkTypeWrapper.style.display = "none";

  // Reset countertop totals in breakdown
  document.getElementById("bathroom-countertop-total").textContent = "$0.00";

  resetBathroomErrorMessage();

  // Recalculate full bathroom price
  calculateBathPrice();
}
function resetBathroomCabinets() {
  const container = document.getElementById("cabinet-container");
  container.innerHTML = "";

  cabinetCount = 0;
  addCabinet();

  // reset cabinet totals only
  document.getElementById("bathroom-total").textContent = "$0.00";
  document.getElementById("bathroom-accessories-total").textContent = "$0.00";
  document.getElementById("bathroom-custom-duties-total").textContent = "$0.00";
  
  calculateBathPrice();
}
function resetAllBathroomInputs() {
  ['bathroom-model', 'bathroom-finish'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  resetBathroomCabinets();
  resetBathroomCountertop();

  resetBathroomBreakdownValues();
  resetBathroomErrorMessage();
  
  //reset handle
  const handleSelect = document.getElementById("bath-handle-type");
  if (handleSelect) handleSelect.value = "";
  handleWrapper.style.display = "none";
  
  calculateBathPrice();
}

//CREATE NEW CABINET SECTION
function addCabinet() {
  cabinetCount++;

  const template = document.querySelector("#cabinet-template .cabinet-block");
  const clone = template.cloneNode(true);

  clone.querySelector(".cabinet-number").textContent = cabinetCount;

  clone.querySelector(".sink-unit").id = `sink${cabinetCount}-unit`;
  clone.querySelector(".bath-height").id = `bathroom${cabinetCount}-height`;
  clone.querySelector(".bath-length").id = `bathroom${cabinetCount}-length`;
  clone.querySelector(".bath-depth").id = `bathroom${cabinetCount}-depth`;

  clone.querySelectorAll("select").forEach(sel =>
    sel.addEventListener("change", calculateBathPrice)
  );

  document.getElementById("cabinet-container").appendChild(clone);
}

//dynamically creates a new cabinet section
document.addEventListener("DOMContentLoaded", () => {
  cabinetCount = 0;
  addCabinet(); //creates Cabinet 1
  /*document.getElementById("add-cabinet-btn").addEventListener("click", () => {
    cabinetCount++;

    const template = document.querySelector("#cabinet-template .cabinet-block");
    const clone = template.cloneNode(true);

    // Label the cabinet
    clone.querySelector(".cabinet-number").textContent = cabinetCount;

    // Assign unique IDs to each field
    clone.querySelector(".sink-unit").id = `sink${cabinetCount}-unit`;
    clone.querySelector(".bath-height").id = `bathroom${cabinetCount}-height`;
    clone.querySelector(".bath-length").id = `bathroom${cabinetCount}-length`;
    clone.querySelector(".bath-depth").id = `bathroom${cabinetCount}-depth`;

    // Add event listeners for recalculation
    clone.querySelectorAll("select").forEach(sel =>
      sel.addEventListener("change", calculateBathPrice)
    );

    document.getElementById("cabinet-container").appendChild(clone);*/

 //   calculateBathPrice(); //CHECK IF THIS SHOULD BE ADDED
  });

//When the user clicks add cabinet
document.getElementById("add-cabinet-btn").addEventListener("click", () => {
  addCabinet();
  calculateBathPrice();
});

//Update Price based on Dealer Level
document.getElementById("bathroom-dealer-type").addEventListener("change", calculateBathPrice);

const bathPricing = [
  {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 398,
      "mattcolor": 434,
      "silkcolor": 478
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 421,
      "mattcolor": 460,
      "silkcolor": 507
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 434,
      "mattcolor": 472,
      "silkcolor": 521
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 459,
      "mattcolor": 499,
      "silkcolor": 550
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 469,
      "mattcolor": 512,
      "silkcolor": 564
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 516,
      "mattcolor": 563,
      "silkcolor": 618
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 398,
      "mattcolor": 434,
      "silkcolor": 478
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 421,
      "mattcolor": 460,
      "silkcolor": 507
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 434,
      "mattcolor": 472,
      "silkcolor": 521
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 459,
      "mattcolor": 499,
      "silkcolor": 550
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 469,
      "mattcolor": 512,
      "silkcolor": 564
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 516,
      "mattcolor": 563,
      "silkcolor": 618
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 437,
      "mattcolor": 478,
      "silkcolor": 525
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 455,
      "mattcolor": 496,
      "silkcolor": 547
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 472,
      "mattcolor": 516,
      "silkcolor": 568
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 496,
      "mattcolor": 542,
      "silkcolor": 598
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 516,
      "mattcolor": 563,
      "silkcolor": 618
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 566,
      "mattcolor": 616,
      "silkcolor": 678
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 437,
      "mattcolor": 478,
      "silkcolor": 525
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 455,
      "mattcolor": 496,
      "silkcolor": 547
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 472,
      "mattcolor": 516,
      "silkcolor": 568
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 496,
      "mattcolor": 542,
      "silkcolor": 598
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 516,
      "mattcolor": 563,
      "silkcolor": 618
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 566,
      "mattcolor": 616,
      "silkcolor": 678
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 282,
      "mattcolor": 308,
      "silkcolor": 340
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 306,
      "mattcolor": 333,
      "silkcolor": 368
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 323,
      "mattcolor": 353,
      "silkcolor": 390
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 341,
      "mattcolor": 373,
      "silkcolor": 410
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 360,
      "mattcolor": 393,
      "silkcolor": 433
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 377,
      "mattcolor": 411,
      "silkcolor": 453
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 395,
      "mattcolor": 430,
      "silkcolor": 475
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 441,
      "mattcolor": 480,
      "silkcolor": 528
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 282,
      "mattcolor": 308,
      "silkcolor": 340
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 306,
      "mattcolor": 333,
      "silkcolor": 368
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 323,
      "mattcolor": 353,
      "silkcolor": 390
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 341,
      "mattcolor": 373,
      "silkcolor": 410
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 360,
      "mattcolor": 393,
      "silkcolor": 433
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 377,
      "mattcolor": 411,
      "silkcolor": 453
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 395,
      "mattcolor": 430,
      "silkcolor": 475
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 441,
      "mattcolor": 480,
      "silkcolor": 528
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 321,
      "mattcolor": 349,
      "silkcolor": 385
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 349,
      "mattcolor": 381,
      "silkcolor": 420
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 369,
      "mattcolor": 403,
      "silkcolor": 444
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 393,
      "mattcolor": 428,
      "silkcolor": 470
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 413,
      "mattcolor": 452,
      "silkcolor": 496
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 437,
      "mattcolor": 478,
      "silkcolor": 525
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 459,
      "mattcolor": 499,
      "silkcolor": 550
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 496,
      "mattcolor": 542,
      "silkcolor": 598
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 321,
      "mattcolor": 349,
      "silkcolor": 385
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 349,
      "mattcolor": 381,
      "silkcolor": 420
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 369,
      "mattcolor": 403,
      "silkcolor": 444
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 393,
      "mattcolor": 428,
      "silkcolor": 470
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 413,
      "mattcolor": 452,
      "silkcolor": 496
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 437,
      "mattcolor": 478,
      "silkcolor": 525
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 459,
      "mattcolor": 499,
      "silkcolor": 550
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 496,
      "mattcolor": 542,
      "silkcolor": 598
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 480,
      "mattcolor": 524,
      "silkcolor": 576
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 503,
      "mattcolor": 549,
      "silkcolor": 605
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 521,
      "mattcolor": 570,
      "silkcolor": 627
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 551,
      "mattcolor": 601,
      "silkcolor": 662
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 568,
      "mattcolor": 620,
      "silkcolor": 682
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 605,
      "mattcolor": 659,
      "silkcolor": 726
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 480,
      "mattcolor": 524,
      "silkcolor": 576
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 503,
      "mattcolor": 549,
      "silkcolor": 605
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 521,
      "mattcolor": 570,
      "silkcolor": 627
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 551,
      "mattcolor": 601,
      "silkcolor": 662
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 568,
      "mattcolor": 620,
      "silkcolor": 682
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 605,
      "mattcolor": 659,
      "silkcolor": 726
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 521,
      "mattcolor": 570,
      "silkcolor": 627
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 545,
      "mattcolor": 593,
      "silkcolor": 655
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 563,
      "mattcolor": 614,
      "silkcolor": 675
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 585,
      "mattcolor": 640,
      "silkcolor": 704
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 609,
      "mattcolor": 665,
      "silkcolor": 731
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 658,
      "mattcolor": 718,
      "silkcolor": 788
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 521,
      "mattcolor": 570,
      "silkcolor": 627
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 545,
      "mattcolor": 593,
      "silkcolor": 655
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 563,
      "mattcolor": 614,
      "silkcolor": 675
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 585,
      "mattcolor": 640,
      "silkcolor": 704
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 609,
      "mattcolor": 665,
      "silkcolor": 731
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 658,
      "mattcolor": 718,
      "silkcolor": 788
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 341,
      "mattcolor": 373,
      "silkcolor": 410
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 373,
      "mattcolor": 407,
      "silkcolor": 449
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 395,
      "mattcolor": 430,
      "silkcolor": 475
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 418,
      "mattcolor": 455,
      "silkcolor": 501
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 437,
      "mattcolor": 478,
      "silkcolor": 525
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 459,
      "mattcolor": 499,
      "silkcolor": 550
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 480,
      "mattcolor": 524,
      "silkcolor": 576
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 521,
      "mattcolor": 570,
      "silkcolor": 627
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 341,
      "mattcolor": 373,
      "silkcolor": 410
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 373,
      "mattcolor": 407,
      "silkcolor": 449
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 395,
      "mattcolor": 430,
      "silkcolor": 475
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 418,
      "mattcolor": 455,
      "silkcolor": 501
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 437,
      "mattcolor": 478,
      "silkcolor": 525
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 459,
      "mattcolor": 499,
      "silkcolor": 550
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 480,
      "mattcolor": 524,
      "silkcolor": 576
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 521,
      "mattcolor": 570,
      "silkcolor": 627
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 372,
      "mattcolor": 406,
      "silkcolor": 447
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 406,
      "mattcolor": 443,
      "silkcolor": 488
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 429,
      "mattcolor": 468,
      "silkcolor": 515
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 456,
      "mattcolor": 498,
      "silkcolor": 549
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 478,
      "mattcolor": 521,
      "silkcolor": 574
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 501,
      "mattcolor": 547,
      "silkcolor": 601
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 524,
      "mattcolor": 573,
      "silkcolor": 631
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 568,
      "mattcolor": 620,
      "silkcolor": 682
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 372,
      "mattcolor": 406,
      "silkcolor": 447
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 406,
      "mattcolor": 443,
      "silkcolor": 488
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 429,
      "mattcolor": 468,
      "silkcolor": 515
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 456,
      "mattcolor": 498,
      "silkcolor": 549
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 478,
      "mattcolor": 521,
      "silkcolor": 574
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 501,
      "mattcolor": 547,
      "silkcolor": 601
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 524,
      "mattcolor": 573,
      "silkcolor": 631
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 568,
      "mattcolor": 620,
      "silkcolor": 682
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 215,
      "mattcolor": 234,
      "silkcolor": 257
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 215,
      "mattcolor": 234,
      "silkcolor": 257
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 242,
      "mattcolor": 264,
      "silkcolor": 291
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 242,
      "mattcolor": 264,
      "silkcolor": 291
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 331,
      "mattcolor": 361,
      "silkcolor": 398
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 331,
      "mattcolor": 361,
      "silkcolor": 398
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 366,
      "mattcolor": 399,
      "silkcolor": 438
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 366,
      "mattcolor": 399,
      "silkcolor": 438
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 629,
      "mattcolor": 687,
      "silkcolor": 755
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 663,
      "mattcolor": 723,
      "silkcolor": 796
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 694,
      "mattcolor": 756,
      "silkcolor": 833
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 722,
      "mattcolor": 788,
      "silkcolor": 868
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 753,
      "mattcolor": 821,
      "silkcolor": 903
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 805,
      "mattcolor": 877,
      "silkcolor": 966
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 629,
      "mattcolor": 687,
      "silkcolor": 755
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 663,
      "mattcolor": 723,
      "silkcolor": 796
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 694,
      "mattcolor": 756,
      "silkcolor": 833
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 722,
      "mattcolor": 788,
      "silkcolor": 868
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 753,
      "mattcolor": 821,
      "silkcolor": 903
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 805,
      "mattcolor": 877,
      "silkcolor": 966
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 687,
      "mattcolor": 748,
      "silkcolor": 824
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 722,
      "mattcolor": 788,
      "silkcolor": 868
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 753,
      "mattcolor": 821,
      "silkcolor": 903
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 781,
      "mattcolor": 853,
      "silkcolor": 938
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 837,
      "mattcolor": 911,
      "silkcolor": 1004
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 917,
      "mattcolor": 1000,
      "silkcolor": 1101
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 687,
      "mattcolor": 748,
      "silkcolor": 824
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 722,
      "mattcolor": 788,
      "silkcolor": 868
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 753,
      "mattcolor": 821,
      "silkcolor": 903
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 781,
      "mattcolor": 853,
      "silkcolor": 938
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 837,
      "mattcolor": 911,
      "silkcolor": 1004
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 917,
      "mattcolor": 1000,
      "silkcolor": 1101
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 428,
      "mattcolor": 467,
      "silkcolor": 513
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 428,
      "mattcolor": 467,
      "silkcolor": 513
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 486,
      "mattcolor": 529,
      "silkcolor": 583
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 486,
      "mattcolor": 529,
      "silkcolor": 583
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 491,
      "mattcolor": 537,
      "silkcolor": 590
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 529,
      "mattcolor": 578,
      "silkcolor": 635
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 561,
      "mattcolor": 613,
      "silkcolor": 674
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 592,
      "mattcolor": 647,
      "silkcolor": 711
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 626,
      "mattcolor": 682,
      "silkcolor": 752
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 657,
      "mattcolor": 716,
      "silkcolor": 787
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 688,
      "mattcolor": 751,
      "silkcolor": 825
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 744,
      "mattcolor": 811,
      "silkcolor": 892
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 491,
      "mattcolor": 537,
      "silkcolor": 590
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 529,
      "mattcolor": 578,
      "silkcolor": 635
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 561,
      "mattcolor": 613,
      "silkcolor": 674
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 592,
      "mattcolor": 647,
      "silkcolor": 711
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 626,
      "mattcolor": 682,
      "silkcolor": 752
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 657,
      "mattcolor": 716,
      "silkcolor": 787
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 688,
      "mattcolor": 751,
      "silkcolor": 825
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 744,
      "mattcolor": 811,
      "silkcolor": 892
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 532,
      "mattcolor": 581,
      "silkcolor": 640
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 575,
      "mattcolor": 627,
      "silkcolor": 691
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 607,
      "mattcolor": 662,
      "silkcolor": 728
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 648,
      "mattcolor": 707,
      "silkcolor": 779
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 679,
      "mattcolor": 741,
      "silkcolor": 816
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 712,
      "mattcolor": 778,
      "silkcolor": 855
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 747,
      "mattcolor": 814,
      "silkcolor": 898
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 808,
      "mattcolor": 881,
      "silkcolor": 968
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 532,
      "mattcolor": 581,
      "silkcolor": 640
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 575,
      "mattcolor": 627,
      "silkcolor": 691
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 607,
      "mattcolor": 662,
      "silkcolor": 728
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 648,
      "mattcolor": 707,
      "silkcolor": 779
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 679,
      "mattcolor": 741,
      "silkcolor": 816
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 712,
      "mattcolor": 778,
      "silkcolor": 855
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 747,
      "mattcolor": 814,
      "silkcolor": 898
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 808,
      "mattcolor": 881,
      "silkcolor": 968
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 252,
      "mattcolor": 275,
      "silkcolor": 304
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 252,
      "mattcolor": 275,
      "silkcolor": 304
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 287,
      "mattcolor": 313,
      "silkcolor": 344
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 287,
      "mattcolor": 313,
      "silkcolor": 344
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 390,
      "mattcolor": 418,
      "silkcolor": 460
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 390,
      "mattcolor": 418,
      "silkcolor": 460
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 437,
      "mattcolor": 463,
      "silkcolor": 511
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 437,
      "mattcolor": 463,
      "silkcolor": 511
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 704,
      "mattcolor": 768,
      "silkcolor": 845
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 739,
      "mattcolor": 808,
      "silkcolor": 889
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 770,
      "mattcolor": 841,
      "silkcolor": 925
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 805,
      "mattcolor": 877,
      "silkcolor": 966
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 841,
      "mattcolor": 916,
      "silkcolor": 1008
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 900,
      "mattcolor": 981,
      "silkcolor": 1080
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 704,
      "mattcolor": 768,
      "silkcolor": 845
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 739,
      "mattcolor": 808,
      "silkcolor": 889
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 770,
      "mattcolor": 841,
      "silkcolor": 925
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 805,
      "mattcolor": 877,
      "silkcolor": 966
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 841,
      "mattcolor": 916,
      "silkcolor": 1008
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 900,
      "mattcolor": 981,
      "silkcolor": 1080
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 763,
      "mattcolor": 833,
      "silkcolor": 916
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 805,
      "mattcolor": 877,
      "silkcolor": 966
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 835,
      "mattcolor": 910,
      "silkcolor": 1003
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 876,
      "mattcolor": 957,
      "silkcolor": 1053
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 906,
      "mattcolor": 988,
      "silkcolor": 1087
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 976,
      "mattcolor": 1064,
      "silkcolor": 1172
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 763,
      "mattcolor": 833,
      "silkcolor": 916
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 805,
      "mattcolor": 877,
      "silkcolor": 966
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 835,
      "mattcolor": 910,
      "silkcolor": 1003
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 876,
      "mattcolor": 957,
      "silkcolor": 1053
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 906,
      "mattcolor": 988,
      "silkcolor": 1087
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "yes",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 976,
      "mattcolor": 1064,
      "silkcolor": 1172
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 550,
      "mattcolor": 600,
      "silkcolor": 661
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 599,
      "mattcolor": 653,
      "silkcolor": 720
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 633,
      "mattcolor": 691,
      "silkcolor": 761
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 669,
      "mattcolor": 729,
      "silkcolor": 803
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 704,
      "mattcolor": 768,
      "silkcolor": 845
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 738,
      "mattcolor": 806,
      "silkcolor": 887
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 773,
      "mattcolor": 843,
      "silkcolor": 928
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 35,
      bathroomDepth: "bdepth35cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 838,
      "mattcolor": 914,
      "silkcolor": 1005
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 550,
      "mattcolor": 600,
      "silkcolor": 661
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 599,
      "mattcolor": 653,
      "silkcolor": 720
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 633,
      "mattcolor": 691,
      "silkcolor": 761
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 669,
      "mattcolor": 729,
      "silkcolor": 803
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 704,
      "mattcolor": 768,
      "silkcolor": 845
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 738,
      "mattcolor": 806,
      "silkcolor": 887
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 773,
      "mattcolor": 843,
      "silkcolor": 928
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 39.5,
      bathroomDepth: "bdepth40cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 838,
      "mattcolor": 914,
      "silkcolor": 1005
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 592,
      "mattcolor": 647,
      "silkcolor": 711
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 645,
      "mattcolor": 704,
      "silkcolor": 777
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 681,
      "mattcolor": 744,
      "silkcolor": 817
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 719,
      "mattcolor": 783,
      "silkcolor": 860
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 754,
      "mattcolor": 822,
      "silkcolor": 906
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 792,
      "mattcolor": 865,
      "silkcolor": 951
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 834,
      "mattcolor": 909,
      "silkcolor": 1000
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 45.5,
      bathroomDepth: "bdepth46cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 903,
      "mattcolor": 987,
      "silkcolor": 1086
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 35,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 592,
      "mattcolor": 647,
      "silkcolor": 711
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 50,
      bathroomLength: "blength35cm",
      bathroomFinishes: {"polymeric": 645,
      "mattcolor": 704,
      "silkcolor": 777
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 60,
      bathroomLength: "blength60cm",
      bathroomFinishes: {"polymeric": 681,
      "mattcolor": 744,
      "silkcolor": 817
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 70,
      bathroomLength: "blength70cm",
      bathroomFinishes: {"polymeric": 719,
      "mattcolor": 783,
      "silkcolor": 860
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 80,
      bathroomLength: "blength80cm",
      bathroomFinishes: {"polymeric": 754,
      "mattcolor": 822,
      "silkcolor": 906
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 90,
      bathroomLength: "blength90cm",
      bathroomFinishes: {"polymeric": 792,
      "mattcolor": 865,
      "silkcolor": 951
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 100,
      bathroomLength: "blength100cm",
      bathroomFinishes: {"polymeric": 834,
      "mattcolor": 909,
      "silkcolor": 1000
    }},
    {
      bathroomModel: "vertigo",
      bathroomActualHeight: 60,
      bathroomHeight: "bheight60cm2dr",
      sinkUnit: "no",
      bathroomActualDepth: 51,
      bathroomDepth: "bdepth51cm",
      bathroomActualLength: 120,
      bathroomLength: "blength120cm",
      bathroomFinishes: {"polymeric": 903,
      "mattcolor": 987,
      "silkcolor": 1086
                        }  
    }
];
const bathGresPricing = [
  {
     bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 534,
      "bath_price_2": 586,
      "bath_price_3": 620
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 594,
      "bath_price_2": 655,
      "bath_price_3": 697
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 659,
      "bath_price_2": 724,
      "bath_price_3": 772
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 720,
      "bath_price_2": 793,
      "bath_price_3": 850
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 785,
      "bath_price_2": 862,
      "bath_price_3": 923
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 845,
      "bath_price_2": 931,
      "bath_price_3": 997
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 910,
      "bath_price_2": 1006,
      "bath_price_3": 1074
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 971,
      "bath_price_2": 1074,
      "bath_price_3": 1147
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 1036,
      "bath_price_2": 1144,
      "bath_price_3": 1221
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 1096,
      "bath_price_2": 1212,
      "bath_price_3": 1299
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 1156,
      "bath_price_2": 1283,
      "bath_price_3": 1373
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 1221,
      "bath_price_2": 1351,
      "bath_price_3": 1446
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 1283,
      "bath_price_2": 1421,
      "bath_price_3": 1525
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 1347,
      "bath_price_2": 1489,
      "bath_price_3": 1598
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 1407,
      "bath_price_2": 1562,
      "bath_price_3": 1675
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 1472,
      "bath_price_2": 1633,
      "bath_price_3": 1749
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 1533,
      "bath_price_2": 1701,
      "bath_price_3": 1823
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 1598,
      "bath_price_2": 1771,
      "bath_price_3": 1901
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 551,
      "bath_price_2": 605,
      "bath_price_3": 640
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 614,
      "bath_price_2": 675,
      "bath_price_3": 721
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 680,
      "bath_price_2": 747,
      "bath_price_3": 796
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 743,
      "bath_price_2": 819,
      "bath_price_3": 877
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 810,
      "bath_price_2": 891,
      "bath_price_3": 952
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 871,
      "bath_price_2": 962,
      "bath_price_3": 1029
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 940,
      "bath_price_2": 1037,
      "bath_price_3": 1110
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 1003,
      "bath_price_2": 1110,
      "bath_price_3": 1185
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 1069,
      "bath_price_2": 1180,
      "bath_price_3": 1260
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 1131,
      "bath_price_2": 1252,
      "bath_price_3": 1341
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 1194,
      "bath_price_2": 1323,
      "bath_price_3": 1418
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 1260,
      "bath_price_2": 1395,
      "bath_price_3": 1493
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 1323,
      "bath_price_2": 1467,
      "bath_price_3": 1574
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 1390,
      "bath_price_2": 1537,
      "bath_price_3": 1649
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 1452,
      "bath_price_2": 1614,
      "bath_price_3": 1730
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 1520,
      "bath_price_2": 1684,
      "bath_price_3": 1806
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 1583,
      "bath_price_2": 1757,
      "bath_price_3": 1881
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 1649,
      "bath_price_2": 1828,
      "bath_price_3": 1961
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 573,
      "bath_price_2": 629,
      "bath_price_3": 666
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 638,
      "bath_price_2": 704,
      "bath_price_3": 749
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 708,
      "bath_price_2": 778,
      "bath_price_3": 829
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 773,
      "bath_price_2": 852,
      "bath_price_3": 912
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 843,
      "bath_price_2": 926,
      "bath_price_3": 992
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 908,
      "bath_price_2": 1001,
      "bath_price_3": 1071
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 977,
      "bath_price_2": 1080,
      "bath_price_3": 1154
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 1042,
      "bath_price_2": 1154,
      "bath_price_3": 1234
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 1113,
      "bath_price_2": 1229,
      "bath_price_3": 1313
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 1178,
      "bath_price_2": 1304,
      "bath_price_3": 1396
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 1243,
      "bath_price_2": 1378,
      "bath_price_3": 1476
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 1313,
      "bath_price_2": 1452,
      "bath_price_3": 1554
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 1378,
      "bath_price_2": 1527,
      "bath_price_3": 1639
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 1447,
      "bath_price_2": 1601,
      "bath_price_3": 1717
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 1512,
      "bath_price_2": 1680,
      "bath_price_3": 1801
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 1583,
      "bath_price_2": 1755,
      "bath_price_3": 1880
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 1648,
      "bath_price_2": 1829,
      "bath_price_3": 1959
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 1717,
      "bath_price_2": 1903,
      "bath_price_3": 2043
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 1512,
      "bath_price_2": 1665,
      "bath_price_3": 1867
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 1578,
      "bath_price_2": 1734,
      "bath_price_3": 1940
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 1640,
      "bath_price_2": 1805,
      "bath_price_3": 2017
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 1704,
      "bath_price_2": 1874,
      "bath_price_3": 2091
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 1765,
      "bath_price_2": 1949,
      "bath_price_3": 2171
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 1830,
      "bath_price_2": 2017,
      "bath_price_3": 2244
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 1892,
      "bath_price_2": 2088,
      "bath_price_3": 2322
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 1953,
      "bath_price_2": 2157,
      "bath_price_3": 2397
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 2017,
      "bath_price_2": 2227,
      "bath_price_3": 2471
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 2079,
      "bath_price_2": 2296,
      "bath_price_3": 2548
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 2144,
      "bath_price_2": 2366,
      "bath_price_3": 2624
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 2205,
      "bath_price_2": 2436,
      "bath_price_3": 2698
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 2270,
      "bath_price_2": 2511,
      "bath_price_3": 2775
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 2332,
      "bath_price_2": 2579,
      "bath_price_3": 2848
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 2397,
      "bath_price_2": 2650,
      "bath_price_3": 2928
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 2457,
      "bath_price_2": 2718,
      "bath_price_3": 3002
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 2519,
      "bath_price_2": 2788,
      "bath_price_3": 3075
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 2584,
      "bath_price_2": 2858,
      "bath_price_3": 3155
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 1576,
      "bath_price_2": 1733,
      "bath_price_3": 1943
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 1643,
      "bath_price_2": 1807,
      "bath_price_3": 2019
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 1707,
      "bath_price_2": 1879,
      "bath_price_3": 2102
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 1774,
      "bath_price_2": 1951,
      "bath_price_3": 2178
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 1838,
      "bath_price_2": 2029,
      "bath_price_3": 2260
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 1905,
      "bath_price_2": 2102,
      "bath_price_3": 2337
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 1969,
      "bath_price_2": 2174,
      "bath_price_3": 2418
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 2033,
      "bath_price_2": 2246,
      "bath_price_3": 2495
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 2102,
      "bath_price_2": 2318,
      "bath_price_3": 2573
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 2165,
      "bath_price_2": 2392,
      "bath_price_3": 2654
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 2233,
      "bath_price_2": 2464,
      "bath_price_3": 2731
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 2296,
      "bath_price_2": 2537,
      "bath_price_3": 2809
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 2364,
      "bath_price_2": 2613,
      "bath_price_3": 2890
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 2428,
      "bath_price_2": 2686,
      "bath_price_3": 2968
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 2495,
      "bath_price_2": 2759,
      "bath_price_3": 3049
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 2559,
      "bath_price_2": 2831,
      "bath_price_3": 3126
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 2624,
      "bath_price_2": 2903,
      "bath_price_3": 3204
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 2691,
      "bath_price_2": 2977,
      "bath_price_3": 3285
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 576,
      "bath_price_2": 616,
      "bath_price_3": 712
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 647,
      "bath_price_2": 689,
      "bath_price_3": 802
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 715,
      "bath_price_2": 763,
      "bath_price_3": 889
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 785,
      "bath_price_2": 836,
      "bath_price_3": 974
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 853,
      "bath_price_2": 910,
      "bath_price_3": 1066
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 923,
      "bath_price_2": 983,
      "bath_price_3": 1152
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 992,
      "bath_price_2": 1057,
      "bath_price_3": 1239
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 1062,
      "bath_price_2": 1135,
      "bath_price_3": 1330
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 1130,
      "bath_price_2": 1208,
      "bath_price_3": 1416
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 1200,
      "bath_price_2": 1283,
      "bath_price_3": 1506
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 1268,
      "bath_price_2": 1356,
      "bath_price_3": 1593
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 1338,
      "bath_price_2": 1429,
      "bath_price_3": 1680
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 1407,
      "bath_price_2": 1502,
      "bath_price_3": 1771
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 1477,
      "bath_price_2": 1577,
      "bath_price_3": 1856
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 1546,
      "bath_price_2": 1650,
      "bath_price_3": 1944
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 1615,
      "bath_price_2": 1728,
      "bath_price_3": 2034
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 1680,
      "bath_price_2": 1801,
      "bath_price_3": 2121
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 1749,
      "bath_price_2": 1875,
      "bath_price_3": 2208
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 596,
      "bath_price_2": 635,
      "bath_price_3": 734
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 667,
      "bath_price_2": 712,
      "bath_price_3": 828
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 738,
      "bath_price_2": 787,
      "bath_price_3": 917
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 810,
      "bath_price_2": 863,
      "bath_price_3": 1006
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 882,
      "bath_price_2": 940,
      "bath_price_3": 1099
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 952,
      "bath_price_2": 1015,
      "bath_price_3": 1190
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 1024,
      "bath_price_2": 1090,
      "bath_price_3": 1278
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 1095,
      "bath_price_2": 1172,
      "bath_price_3": 1372
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 1168,
      "bath_price_2": 1248,
      "bath_price_3": 1462
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 1239,
      "bath_price_2": 1323,
      "bath_price_3": 1555
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 1310,
      "bath_price_2": 1399,
      "bath_price_3": 1646
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 1381,
      "bath_price_2": 1476,
      "bath_price_3": 1733
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 1452,
      "bath_price_2": 1551,
      "bath_price_3": 1828
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 1525,
      "bath_price_2": 1626,
      "bath_price_3": 1917
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 1595,
      "bath_price_2": 1704,
      "bath_price_3": 2007
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 1667,
      "bath_price_2": 1783,
      "bath_price_3": 2100
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 1733,
      "bath_price_2": 1859,
      "bath_price_3": 2189
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 1806,
      "bath_price_2": 1935,
      "bath_price_3": 2279
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 620,
      "bath_price_2": 662,
      "bath_price_3": 764
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 694,
      "bath_price_2": 740,
      "bath_price_3": 861
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 769,
      "bath_price_2": 820,
      "bath_price_3": 955
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 843,
      "bath_price_2": 899,
      "bath_price_3": 1047
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 917,
      "bath_price_2": 977,
      "bath_price_3": 1145
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 992,
      "bath_price_2": 1057,
      "bath_price_3": 1239
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 1066,
      "bath_price_2": 1136,
      "bath_price_3": 1331
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 1140,
      "bath_price_2": 1219,
      "bath_price_3": 1429
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 1215,
      "bath_price_2": 1299,
      "bath_price_3": 1522
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 1290,
      "bath_price_2": 1378,
      "bath_price_3": 1619
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 1364,
      "bath_price_2": 1457,
      "bath_price_3": 1713
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 1438,
      "bath_price_2": 1536,
      "bath_price_3": 1806
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 1512,
      "bath_price_2": 1615,
      "bath_price_3": 1903
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 1587,
      "bath_price_2": 1695,
      "bath_price_3": 1997
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 1661,
      "bath_price_2": 1773,
      "bath_price_3": 2089
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 1736,
      "bath_price_2": 1856,
      "bath_price_3": 2187
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 1806,
      "bath_price_2": 1936,
      "bath_price_3": 2280
    }},
    {
      bathCountertopMaterial: "ceramic_hole",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 1880,
      "bath_price_2": 2015,
      "bath_price_3": 2373
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 1600,
      "bath_price_2": 1738,
      "bath_price_3": 2007
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 1672,
      "bath_price_2": 1815,
      "bath_price_3": 2100
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 1742,
      "bath_price_2": 1891,
      "bath_price_3": 2189
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 1815,
      "bath_price_2": 1966,
      "bath_price_3": 2279
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 1886,
      "bath_price_2": 2042,
      "bath_price_3": 2373
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 1953,
      "bath_price_2": 2122,
      "bath_price_3": 2462
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 2024,
      "bath_price_2": 2198,
      "bath_price_3": 2551
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 2096,
      "bath_price_2": 2275,
      "bath_price_3": 2645
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 2168,
      "bath_price_2": 2350,
      "bath_price_3": 2735
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 2238,
      "bath_price_2": 2426,
      "bath_price_3": 2823
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 2310,
      "bath_price_2": 2503,
      "bath_price_3": 2918
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 2381,
      "bath_price_2": 2578,
      "bath_price_3": 3007
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 2454,
      "bath_price_2": 2653,
      "bath_price_3": 3100
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 2524,
      "bath_price_2": 2735,
      "bath_price_3": 3189
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 2596,
      "bath_price_2": 2811,
      "bath_price_3": 3279
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 2667,
      "bath_price_2": 2886,
      "bath_price_3": 3373
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 2739,
      "bath_price_2": 2961,
      "bath_price_3": 3462
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 2811,
      "bath_price_2": 2949,
      "bath_price_3": 3552
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPriceLevel: {"bath_price_1": 1666,
      "bath_price_2": 1811,
      "bath_price_3": 2089
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 1740,
      "bath_price_2": 1889,
      "bath_price_3": 2187
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 1815,
      "bath_price_2": 1968,
      "bath_price_3": 2280
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 1889,
      "bath_price_2": 2048,
      "bath_price_3": 2373
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 1964,
      "bath_price_2": 2127,
      "bath_price_3": 2471
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 2033,
      "bath_price_2": 2210,
      "bath_price_3": 2564
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 2108,
      "bath_price_2": 2290,
      "bath_price_3": 2657
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 2182,
      "bath_price_2": 2368,
      "bath_price_3": 2755
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 2257,
      "bath_price_2": 2448,
      "bath_price_3": 2847
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 2332,
      "bath_price_2": 2527,
      "bath_price_3": 2941
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 2406,
      "bath_price_2": 2605,
      "bath_price_3": 3039
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 2480,
      "bath_price_2": 2685,
      "bath_price_3": 3131
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 2554,
      "bath_price_2": 2764,
      "bath_price_3": 3229
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 2629,
      "bath_price_2": 2847,
      "bath_price_3": 3322
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 2703,
      "bath_price_2": 2927,
      "bath_price_3": 3415
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 2778,
      "bath_price_2": 3006,
      "bath_price_3": 3513
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 2853,
      "bath_price_2": 3085,
      "bath_price_3": 3605
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 2927,
      "bath_price_2": 3071,
      "bath_price_3": 3699
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 2212,
      "bath_price_2": 2312,
      "bath_price_3": 2676
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 2307,
      "bath_price_2": 2409,
      "bath_price_3": 2790
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 2401,
      "bath_price_2": 2505,
      "bath_price_3": 2904
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 2496,
      "bath_price_2": 2602,
      "bath_price_3": 3024
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 2585,
      "bath_price_2": 2705,
      "bath_price_3": 3137
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 2678,
      "bath_price_2": 2801,
      "bath_price_3": 3251
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 2773,
      "bath_price_2": 2898,
      "bath_price_3": 3371
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 2869,
      "bath_price_2": 2994,
      "bath_price_3": 3485
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 2962,
      "bath_price_2": 3092,
      "bath_price_3": 3598
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 3058,
      "bath_price_2": 3189,
      "bath_price_3": 3718
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 3151,
      "bath_price_2": 3285,
      "bath_price_3": 3832
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 3247,
      "bath_price_2": 3382,
      "bath_price_3": 3951
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 3341,
      "bath_price_2": 3485,
      "bath_price_3": 4065
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 3436,
      "bath_price_2": 3581,
      "bath_price_3": 4179
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 3530,
      "bath_price_2": 3678,
      "bath_price_3": 4298
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 3623,
      "bath_price_2": 3774,
      "bath_price_3": 4411
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 3719,
      "bath_price_2": 3758,
      "bath_price_3": 4525
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPriceLevel: {"bath_price_1": 2303,
      "bath_price_2": 2408,
      "bath_price_3": 2787
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPriceLevel: {"bath_price_1": 2401,
      "bath_price_2": 2508,
      "bath_price_3": 2905
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPriceLevel: {"bath_price_1": 2501,
      "bath_price_2": 2609,
      "bath_price_3": 3024
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPriceLevel: {"bath_price_1": 2599,
      "bath_price_2": 2710,
      "bath_price_3": 3149
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPriceLevel: {"bath_price_1": 2691,
      "bath_price_2": 2816,
      "bath_price_3": 3268
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPriceLevel: {"bath_price_1": 2790,
      "bath_price_2": 2918,
      "bath_price_3": 3386
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPriceLevel: {"bath_price_1": 2888,
      "bath_price_2": 3018,
      "bath_price_3": 3511
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPriceLevel: {"bath_price_1": 2986,
      "bath_price_2": 3120,
      "bath_price_3": 3629
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPriceLevel: {"bath_price_1": 3085,
      "bath_price_2": 3220,
      "bath_price_3": 3748
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPriceLevel: {"bath_price_1": 3183,
      "bath_price_2": 3320,
      "bath_price_3": 3872
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPriceLevel: {"bath_price_1": 3283,
      "bath_price_2": 3422,
      "bath_price_3": 3990
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPriceLevel: {"bath_price_1": 3381,
      "bath_price_2": 3522,
      "bath_price_3": 4115
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPriceLevel: {"bath_price_1": 3479,
      "bath_price_2": 3629,
      "bath_price_3": 4233
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPriceLevel: {"bath_price_1": 3578,
      "bath_price_2": 3729,
      "bath_price_3": 4352
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPriceLevel: {"bath_price_1": 3676,
      "bath_price_2": 3831,
      "bath_price_3": 4476
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPriceLevel: {"bath_price_1": 3775,
      "bath_price_2": 3931,
      "bath_price_3": 4595
    }},
    {
      bathCountertopMaterial: "ceramic_sink",
      bathCountertopActualDepth: "51.5",
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "20+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPriceLevel: {"bath_price_1": 3873,
      "bath_price_2": 3913,
      "bath_price_3": 4713
    }
    }
];
const bathOcritechPricing = [
  {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 317
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 357
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 398
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 439
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 480
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 520
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 560
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 601
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 642
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 683
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 724
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 764
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 805
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 846
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 886
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 927
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 967
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1008
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 327
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 368
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 410
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 452
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 494
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 536
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 577
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 620
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 662
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 704
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 746
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 787
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 829
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 871
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 914
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 956
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 997
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1039
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 327
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 368
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 410
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 452
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 494
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 536
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 577
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 620
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 662
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 704
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 746
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 787
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 829
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 871
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 914
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 956
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 997
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1039
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 517
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 556
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 597
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 638
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 679
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 720
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 760
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 801
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 842
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 883
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 923
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 963
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 1004
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 1045
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 1086
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 1127
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 1167
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1208
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 532
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 573
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 615
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 657
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 699
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 741
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 783
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 825
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 867
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 909
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 951
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 992
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 1034
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 1077
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 1119
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 1161
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 1202
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1244
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 532
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 573
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 615
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 657
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 699
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 741
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 783
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 825
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 867
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 909
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 951
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 992
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 1034
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 1077
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 1119
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 1161
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 1202
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "1cm",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1244
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 453
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 513
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 574
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 633
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 694
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 754
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 813
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 875
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 934
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 995
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 1055
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 1114
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 1176
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 1235
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 1294
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 1356
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 1415
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1476
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 467
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 528
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 591
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 653
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 714
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 777
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 838
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 901
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 963
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 1024
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 1087
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 1148
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 1211
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 1273
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 1334
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 1397
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 1459
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1521
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 467
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 528
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 591
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 653
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 714
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 777
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 838
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 901
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 963
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 1024
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 1087
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 1148
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 1211
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 1273
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 1334
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 1397
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 1459
    },
    {
      bathCountertopMaterial: "ocritech_hole",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1521
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 653
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 712
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 773
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 833
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 892
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 954
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 1013
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 1073
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 1134
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 1193
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 1254
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 1314
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 1374
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 1435
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 1494
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 1554
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 1615
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 40,
      bathCountertopDepth: "bcounterdepth40cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1675
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 672
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 734
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 796
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 858
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 919
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 982
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 1044
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 1106
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 1168
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 1229
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 1292
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 1354
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 1416
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 1478
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 1539
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 1602
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 1664
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 46,
      bathCountertopDepth: "bcounterdepth46cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1726
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 70,
      bathCountertopLength: "bcounterlength70cm",
      bathCountertopPrice: 672
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 80,
      bathCountertopLength: "bcounterlength80cm",
      bathCountertopPrice: 734
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 90,
      bathCountertopLength: "bcounterlength90cm",
      bathCountertopPrice: 796
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 100,
      bathCountertopLength: "bcounterlength100cm",
      bathCountertopPrice: 858
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 110,
      bathCountertopLength: "bcounterlength110cm",
      bathCountertopPrice: 919
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 120,
      bathCountertopLength: "bcounterlength120cm",
      bathCountertopPrice: 982
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 130,
      bathCountertopLength: "bcounterlength130cm",
      bathCountertopPrice: 1044
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 140,
      bathCountertopLength: "bcounterlength140cm",
      bathCountertopPrice: 1106
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 150,
      bathCountertopLength: "bcounterlength150cm",
      bathCountertopPrice: 1168
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 160,
      bathCountertopLength: "bcounterlength160cm",
      bathCountertopPrice: 1229
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 170,
      bathCountertopLength: "bcounterlength170cm",
      bathCountertopPrice: 1292
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 180,
      bathCountertopLength: "bcounterlength180cm",
      bathCountertopPrice: 1354
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 190,
      bathCountertopLength: "bcounterlength190cm",
      bathCountertopPrice: 1416
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 200,
      bathCountertopLength: "bcounterlength200cm",
      bathCountertopPrice: 1478
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 210,
      bathCountertopLength: "bcounterlength210cm",
      bathCountertopPrice: 1539
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 220,
      bathCountertopLength: "bcounterlength220cm",
      bathCountertopPrice: 1602
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 230,
      bathCountertopLength: "bcounterlength230cm",
      bathCountertopPrice: 1664
    },
    {
      bathCountertopMaterial: "ocritech_sink",
      bathCountertopActualDepth: 51.5,
      bathCountertopDepth: "bcounterdepth51cm",
      bathCountertopThickness: "4+",
      bathCountertopActualLength: 240,
      bathCountertopLength: "bcounterlength240cm",
      bathCountertopPrice: 1726
    }  
];

//Dynamic Price Level Question based on Material
const materialSelect = document.getElementById("bath-countertop-material");
const priceLevelWrapper = document.getElementById("countertop-pricelevel-wrapper");
const priceLevelSelect = document.getElementById("bath-countertop-pricelevel");
materialSelect.addEventListener("change", () => {
  const value = materialSelect.value;
  // Show price level ONLY for ceramic materials
  if (value === "ceramic_hole" || value === "ceramic_sink") {
    priceLevelWrapper.style.display = "block";
  } else { // Hide and reset if switching to Ocritech
    priceLevelWrapper.style.display = "none";
    priceLevelSelect.value = "";
  }

  // Recalculate totals
  calculateBathPrice();
});


//Dynamic Sink Upgrade Question based on Material
const sinkTypeWrapper = document.getElementById("countertop-sinktype-wrapper");
const sinkTypeSelect = document.getElementById("bath-sink-type");
materialSelect.addEventListener("change", () => {
  const value = materialSelect.value;

  // Show only for ocritech integrated sink
  if (value === "ocritech_sink") {
    sinkTypeWrapper.style.display = "block";
  } else {
    sinkTypeWrapper.style.display = "none";
    sinkTypeSelect.value = ""; // reset selection
  }

  calculateBathPrice();
});

//Dynamic Handle Question based on Model
const modelSelect = document.getElementById("bathroom-model");
const handleWrapper = document.getElementById("bathroom-handle-wrapper");
const handleSelect = document.getElementById("bath-handle-type");
function updateHandleVisibility() {
  const model = modelSelect.value;
  if (model === "vertigo") {
    handleWrapper.style.display = "block";
  } else {
    handleWrapper.style.display = "none";
    handleSelect.value = ""; // reset when hidden
  }
  calculateBathPrice();
}

modelSelect.addEventListener("change", updateHandleVisibility);

function calculateVanityPrice(cabIndex) {
  let bathroomModelEntry = document.getElementById('bathroom-model').value;
  const bathroomFinishEntry = document.getElementById('bathroom-finish').value;
  const sinkUnitEntry = document.getElementById(`sink${cabIndex}-unit`).value;
  const bathroomHeightEntry = document.getElementById(`bathroom${cabIndex}-height`).value;
  const bathroomLengthEntry = document.getElementById(`bathroom${cabIndex}-length`).value;
  const bathroomDepthEntry = document.getElementById(`bathroom${cabIndex}-depth`).value;
  
  //Normalize model for pricing lookup 
  let normalizedBathModel = bathroomModelEntry;
  if (bathroomModelEntry === "vertigoEVO" || bathroomModelEntry === "reverso") {
    normalizedBathModel = "vertigo";
  }

    // Check if all required fields are selected
  const bathAllSelected = [bathroomModelEntry, bathroomFinishEntry, sinkUnitEntry, bathroomHeightEntry, bathroomLengthEntry, bathroomDepthEntry].every(val => val && val !== "");
  
  if (!bathAllSelected) return { price: 0, complete: false, match: true };
  
  // Find matching row  
  const bathMatch = bathPricing.find(
    row =>
    row.bathroomModel === normalizedBathModel && 
    row.sinkUnit === sinkUnitEntry &&
    row.bathroomHeight === bathroomHeightEntry && 
    row.bathroomLength === bathroomLengthEntry && 
    row.bathroomDepth === bathroomDepthEntry
  );
  
  if(!bathMatch) {
    return {price: 0, complete: true, match: false};
  }
  
  let bathPrice = bathMatch.bathroomFinishes[bathroomFinishEntry];
  
  if (bathroomModelEntry === "vertigoEVO") {
    bathPrice = Math.round(bathPrice * 1.053);
  }
  
  // Add handle pricing (global selection applies to all cabinets)
  const handleType = document.getElementById("bath-handle-type")?.value;
  if (handleType) {
    const handlePricing = {
      push_bath_handle: 92,
      bath_handle: 43  
    };
    if (bathroomHeightEntry === "bheight24cm1dr" || bathroomHeightEntry === "bheight36cm1dr") { //1 handle required
      console.log("bathPrice pre handle: ", bathPrice);
      bathPrice += handlePricing[handleType] || 0;
      console.log("handle price: ", handlePricing[handleType]);
    } else if (bathroomHeightEntry === "bheight48cm2dr" || bathroomHeightEntry === "bheight60cm2dr") { //2 handles required
      console.log("bathPrice pre handle: ", bathPrice);
      bathPrice += handlePricing[handleType] * 2 || 0;
      console.log("handle price: ", handlePricing[handleType] * 2);
    }
  
}
  
  
  return {price: bathPrice, complete: true, match: true};
}

function calculateBathPrice() {
  const bathErrorBox = document.getElementById("bathroom-error-message");
  bathErrorBox.textContent = "";
  
  //calculates vanity price
  let vanityTotal = 0;
  let bathCountertopTotal = 0;
  let bathGrandTotal = 0;
  
  for (let i = 1; i <= cabinetCount; i++) {
    const result = calculateVanityPrice(i);
    //if vanity match not found
    if (result.complete && !result.match) {
      bathErrorBox.textContent =
        `The configuration of cabinet ${i} is not available. Please try another combination or contact Thelia Group.`;
      bathErrorBox.style.color = "red";
      document.getElementById("bathroom-total").textContent = "$0.00";
      document.getElementById("bathroom-grand-total").textContent = "$0.00";
      return;
    }
    vanityTotal += result.price;
  }
  
    
  //COUNTERTOP SECTION
  const counterMaterial = document.getElementById('bath-countertop-material')?.value;
  const counterThickness = document.getElementById('bath-countertop-thickness')?.value;
  const counterLength = document.getElementById('bath-countertop-length')?.value;
  const counterDepth = document.getElementById('bath-countertop-depth')?.value;
  const counterPriceLevel = document.getElementById("bath-countertop-pricelevel").value;
  
  const sinkNumber = document.getElementById("sink-number")?.value;
  
  const countertopFieldsSelected =
        counterMaterial &&
        counterThickness &&
        counterLength &&
        counterDepth &&
        (// Ceramic requires price level but not Ocritech
          (counterMaterial === "ceramic_hole" || counterMaterial === "ceramic_sink")
          ? counterPriceLevel
          : true // Ocritech does NOT require price level
        );

  if (countertopFieldsSelected) {
    let pricingArray;
    let priceExtractor;

    // Determine which pricing array to use
    if (counterMaterial === "ceramic_hole" || counterMaterial === "ceramic_sink") {
      pricingArray = bathGresPricing;
      // Ceramic uses price levels
      priceExtractor = (match) => match.bathCountertopPriceLevel[counterPriceLevel];
    } else if (counterMaterial === "ocritech_hole" || counterMaterial === "ocritech_sink") {
      pricingArray = bathOcritechPricing;
      // Ocritech uses a single price field
      priceExtractor = (match) => match.bathCountertopPrice;
    }

    const gresMatch = pricingArray.find(row =>
      row.bathCountertopMaterial === counterMaterial &&
      row.bathCountertopThickness == counterThickness &&
      row.bathCountertopDepth === counterDepth &&
      row.bathCountertopLength === counterLength
    );
    
    if (!gresMatch) {
    bathErrorBox.textContent =
      "This countertop selection is not available. Adjust your selection or contact Thelia Group for more options.";
    bathErrorBox.style.color = "red";
    // Reset countertop + grand total display
    document.getElementById("bathroom-countertop-total").textContent = "$0.00";
    document.getElementById("bathroom-grand-total").textContent = vanityTotal;
    return; // stop calculation cleanly
    }
    
    bathCountertopTotal += priceExtractor(gresMatch);

    //surcharge for 2 sinks
    if (sinkNumber === "2") {
      let surcharge = 0;
      if (counterMaterial === "ceramic_hole") {
        surcharge = 164;
      }
      if (counterMaterial === "ceramic_sink") {
        // Thickness-based surcharge
        if (counterThickness === "20+") {
          surcharge = 1802;
        } else {
          surcharge = 1268;
        }
      }
      if (counterMaterial === "ocritech_hole") {
        surcharge = 77;
      }
      if (counterMaterial === "ocritech_sink") {
        surcharge = 263;
      }

    bathCountertopTotal += surcharge;
  }
    
    // 🔹 BRACKET LOGIC (for thickness ≥ 4cm)
    if (counterThickness === "4+" || counterThickness === "20+") {
      // Determine number of brackets
      const numericLength = parseInt(counterLength.replace("bcounterlength", "").replace("cm", ""), 10);
      let bracketCount = numericLength <= 120 ? 2 : 3;
      // Determine price per bracket based on depth
      let bracketPrice = 0;
      if (counterDepth === "bcounterdepth40cm") {
        bracketPrice = 54;
      } else if (counterDepth === "bcounterdepth46cm" || counterDepth === "bcounterdepth51cm") {
        bracketPrice = 59;
      }
      const bracketTotal = bracketCount * bracketPrice;
      
      bathCountertopTotal += bracketTotal;
      console.log(`Bracket logic applied: ${bracketCount} brackets × ${bracketPrice} = ${bracketTotal}`);
    }
    
    // 🔹OCRITECH SINK TYPE UPGRADE SURCHARGE
    if (counterMaterial === "ocritech_sink") {
      const sinkType = document.getElementById("bath-sink-type")?.value;
      const sinkTypePricing = {
        sink_CUT: 392,
        sink_META_1: 491,
        sink_META_2: 625,
        sink_META_3: 662,
        sink_META_4: 680
      };

      if (sinkType && sinkTypePricing[sinkType]) {
        bathCountertopTotal += sinkTypePricing[sinkType];
        console.log("Ocritech sink upgrade surcharge:", sinkTypePricing[sinkType]);
      }
    }
    
  }
  
  
  //CATALOG GRAND TOTAL PRICE
  bathGrandTotal = vanityTotal + bathCountertopTotal; 
  
  // Get dealer group multiplier
  const bathDealerGroup = document.getElementById("bathroom-dealer-type")?.value || "none";
  // Choose currency symbol
  const currencySymbol = bathDealerGroup === "none" ? "€" : "$";
  
  
  //CUSTOM DUTIES CALCULATIONS
  const bathCustomDuties = bathGrandTotal * 0.5 * 0.85 * 0.1 * dollarConversionRate;
  document.getElementById("bathroom-custom-duties-total").textContent =
    `$${bathCustomDuties.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  
  //DEALER MULTIPLIER AND CONVERSION TO DOLLAR: 
    const puntotreDealerMultipliers = {
      retail: 1.872,
      advanced: 0.7956,
      preferred: 0.7605,
      elite: 0.7371,
      builder: 1.3104,
      designer: 1.4976,
      none: 1.0 //EQUIVALENT TO POINTS
    };

  const bathDealerMultiplier = puntotreDealerMultipliers[bathDealerGroup] || 1;
  
  // Apply multiplier to cabinet + countertop totals
  const dealerVanityTotal = vanityTotal * bathDealerMultiplier;
  const dealerCountertopTotal = bathCountertopTotal * bathDealerMultiplier;
  
  document.getElementById("bathroom-total").textContent =
    `${currencySymbol}${dealerVanityTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  document.getElementById("bathroom-countertop-total").textContent =
    `${currencySymbol}${dealerCountertopTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  const dealerBathGrandTotal = dealerVanityTotal + dealerCountertopTotal + bathCustomDuties;

  document.getElementById("bathroom-grand-total").textContent =
    `${currencySymbol}${dealerBathGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

document.querySelectorAll('#bathroom-model, #bathroom-finish, #sink-unit, #bath-height, #bath-length, #bath-depth, #bath-countertop, #bath-countertop-pricelevel, #bath-countertop-depth, #bath-countertop-length, #bath-countertop-thickness, #sink-number, #bath-sink-type, #bath-handle-type')
  .forEach(el => el.addEventListener('change', calculateBathPrice));



//----------------------------------------------------DOOR C0DE-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Example dataset extracted from Excel
const doorPricing = [
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1532,
      "tortora": 1958,
      "soft": 1984,
      "dark": 2199,
      "metal": 2390,
      "nodato": 2120,
      "vanilla": 2120,
      "olmo": 2120,
      "jazz": 2120,
      "blond": 2120,
      "carruba": 2120,
      "sesamo": 2120,
      "coloroc": 2397,
      "masai": 2397,
      "sigaro": 2397,
      "cenere": 2397,
      "tabacco": 2442,
      "canaletto": 2238
    }
  },
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1864,
      "tortora": 2228,
      "soft": 2259,
      "dark": 2480,
      "metal": 2753,
      "nodato": 2426,
      "vanilla": 2426,
      "olmo": 2426,
      "jazz": 2426,
      "blond": 2426,
      "carruba": 2426,
      "sesamo": 2426,
      "coloroc": 2758,
      "masai": 2758,
      "sigaro": 2758,
      "cenere": 2758,
      "tabacco": 2825,
      "canaletto": 2571
    }
  },
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2275,
      "tortora": 2710,
      "soft": 2748,
      "dark": 3057,
      "metal": 3341,
      "nodato": 3034,
      "vanilla": 3034,
      "olmo": 3034,
      "jazz": 3034,
      "blond": 3034,
      "carruba": 3034,
      "sesamo": 3034,
      "coloroc": 3392,
      "masai": 3392,
      "sigaro": 3392,
      "cenere": 3392,
      "tabacco": 3475,
      "canaletto": 3166
    }
  },
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2363,
      "tortora": 2831,
      "soft": 2872,
      "dark": 3210,
      "metal": 3555,
      "nodato": 3172,
      "vanilla": 3172,
      "olmo": 3172,
      "jazz": 3172,
      "blond": 3172,
      "carruba": 3172,
      "sesamo": 3172,
      "coloroc": 3570,
      "masai": 3570,
      "sigaro": 3570,
      "cenere": 3570,
      "tabacco": 3622,
      "canaletto": 3307
    }
  },
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1730,
      "tortora": 2109,
      "soft": 2112,
      "dark": 2326,
      "metal": 2550,
      "nodato": 2170,
      "vanilla": 2170,
      "olmo": 2170,
      "jazz": 2170,
      "blond": 2170,
      "carruba": 2170,
      "sesamo": 2170,
      "coloroc": 2530,
      "masai": 2530,
      "sigaro": 2530,
      "cenere": 2530,
      "tabacco": 2541,
      "canaletto": 2325
    }
  },
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1976,
      "tortora": 2411,
      "soft": 2446,
      "dark": 2666,
      "metal": 2943,
      "nodato": 2510,
      "vanilla": 2510,
      "olmo": 2510,
      "jazz": 2510,
      "blond": 2510,
      "carruba": 2510,
      "sesamo": 2510,
      "coloroc": 2905,
      "masai": 2905,
      "sigaro": 2905,
      "cenere": 2905,
      "tabacco": 2930,
      "canaletto": 2664
    }
  },
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2447,
      "tortora": 3123,
      "soft": 3171,
      "dark": 3337,
      "metal": 3790,
      "nodato": 3159,
      "vanilla": 3159,
      "olmo": 3159,
      "jazz": 3159,
      "blond": 3159,
      "carruba": 3159,
      "sesamo": 3159,
      "coloroc": 3521,
      "masai": 3521,
      "sigaro": 3521,
      "cenere": 3521,
      "tabacco": 3607,
      "canaletto": 3343
    }
  },
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2613,
      "tortora": 3273,
      "soft": 3324,
      "dark": 3512,
      "metal": 3980,
      "nodato": 3380,
      "vanilla": 3380,
      "olmo": 3380,
      "jazz": 3380,
      "blond": 3380,
      "carruba": 3380,
      "sesamo": 3380,
      "coloroc": 3789,
      "masai": 3789,
      "sigaro": 3789,
      "cenere": 3789,
      "tabacco": 3843,
      "canaletto": 3630
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1550,
      "soft": 1849,
      "dark": 2005,
      "metal": 2217
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1826,
      "soft": 2189,
      "dark": 2417,
      "metal": 2683
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2362,
      "soft": 2804,
      "dark": 3083,
      "metal": 3407
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2530,
      "soft": 3004,
      "dark": 3311,
      "metal": 3646
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1644,
      "soft": 2004,
      "dark": 2159,
      "metal": 2501
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1937,
      "soft": 2372,
      "dark": 2558,
      "metal": 2974
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2601,
      "soft": 3128,
      "dark": 3354,
      "metal": 3805
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2781,
      "soft": 3357,
      "dark": 3602,
      "metal": 4074
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1693,
      "soft": 1982,
      "dark": 2145,
      "metal": 2397
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1994,
      "soft": 2346,
      "dark": 2585,
      "metal": 2851
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2565,
      "soft": 3006,
      "dark": 3232,
      "metal": 3550
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2811,
      "soft": 3293,
      "dark": 3546,
      "metal": 3880
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1783,
      "soft": 2132,
      "dark": 2295,
      "metal": 2551
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2103,
      "soft": 2527,
      "dark": 2769,
      "metal": 3034
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2756,
      "soft": 3273,
      "dark": 3556,
      "metal": 3874
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2960,
      "soft": 3522,
      "dark": 3833,
      "metal": 4162
    }
  },
  {
    model: "DOGE PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1990,
      "soft": 2275,
      "metal": 2575
    }
  },
  {
    model: "DOGE PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2352,
      "soft": 2697,
      "metal": 3067
    }
  },
  {
    model: "DOGE PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2949,
      "soft": 3361,
      "metal": 3805
    }
  },
  {
    model: "DOGE PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 2213,
      "soft": 2414,
      "metal": 2831
    }
  },
  {
    model: "DOGE PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2477,
      "soft": 2710,
      "metal": 3192
    }
  },
  {
    model: "DOGE PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3100,
      "soft": 3377,
      "metal": 3954
    }
  },
  {
    model: "DOGE PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1990,
      "soft": 2275,
      "metal": 2575
    }
  },
  {
    model: "DOGE PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2352,
      "soft": 2697,
      "metal": 3067
    }
  },
  {
    model: "DOGE PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2949,
      "soft": 3361,
      "metal": 3805
    }
  },
  {
    model: "DOGE VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2308,
      "soft": 2480,
      "metal": 2779
    }
  },
  {
    model: "DOGE VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2592,
      "soft": 2938,
      "metal": 3307
    }
  },
  {
    model: "DOGE VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3235,
      "soft": 3647,
      "metal": 4091
    }
  },
  {
    model: "DOGE VPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2308,
      "soft": 2480,
      "metal": 2779
    }
  },
  {
    model: "DOGE VPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2592,
      "soft": 2938,
      "metal": 3307
    }
  },
  {
    model: "DOGE VPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3235,
      "soft": 3647,
      "metal": 4091
    }
  },
  {
    model: "DOGE VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2308,
      "soft": 2480,
      "metal": 2779
    }
  },
  {
    model: "DOGE VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2592,
      "soft": 2938,
      "metal": 3307
    }
  },
  {
    model: "DOGE VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3235,
      "soft": 3647,
      "metal": 4091
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1693,
      "soft": 1982,
      "dark": 2145,
      "metal": 2397
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1994,
      "soft": 2346,
      "dark": 2585,
      "metal": 2851
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2565,
      "soft": 3006,
      "dark": 3232,
      "metal": 3550
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2811,
      "soft": 3293,
      "dark": 3546,
      "metal": 3880
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1783,
      "soft": 2132,
      "dark": 2295,
      "metal": 2551
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2103,
      "soft": 2527,
      "dark": 2769,
      "metal": 3034
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2756,
      "soft": 3273,
      "dark": 3556,
      "metal": 3874
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2960,
      "soft": 3522,
      "dark": 3833,
      "metal": 4162
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 2053,
      "soft": 2429
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2433,
      "soft": 2891
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3067,
      "soft": 3614
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 3292,
      "soft": 3876
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 2127,
      "soft": 2522
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2518,
      "soft": 2997
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3265,
      "soft": 3832
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 3505,
      "soft": 4114
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 2053,
      "soft": 2429
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2433,
      "soft": 2891
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3067,
      "soft": 3614
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 3292,
      "soft": 3876
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 2127,
      "soft": 2522
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2518,
      "soft": 2997
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3265,
      "soft": 3832
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 3505,
      "soft": 4114
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 2053,
      "soft": 2429
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2433,
      "soft": 2891
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3067,
      "soft": 3614
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 3292,
      "soft": 3876
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 2127,
      "soft": 2522
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2518,
      "soft": 2997
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3265,
      "soft": 3832
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 3505,
      "soft": 4114
    }
  },
  {
    model: "GIOTTO 02 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1492,
      "soft": 1805
    }
  },
  {
    model: "GIOTTO 02 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1759,
      "soft": 2136
    }
  },
  {
    model: "GIOTTO 02 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2324,
      "soft": 2788
    }
  },
  {
    model: "GIOTTO 02 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1446,
      "soft": 1759
    }
  },
  {
    model: "GIOTTO 02 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1705,
      "soft": 2082
    }
  },
  {
    model: "GIOTTO 02 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2257,
      "soft": 2722
    }
  },
  {
    model: "GIOTTO 02 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1720,
      "soft": 2049
    }
  },
  {
    model: "GIOTTO 02 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2026,
      "soft": 2424
    }
  },
  {
    model: "GIOTTO 02 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2523,
      "soft": 2988
    }
  },
  {
    model: "GIOTTO 02 VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1720,
      "soft": 2049
    }
  },
  {
    model: "GIOTTO 02 VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2026,
      "soft": 2424
    }
  },
  {
    model: "GIOTTO 02 VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2523,
      "soft": 2988
    }
  },
  {
    model: "GIOTTO 11G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1564,
      "soft": 1850
    }
  },
  {
    model: "2Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1978,
      "vanilla": 1978,
      "olmo": 1978,
      "jazz": 1978,
      "blond": 1978,
      "carruba": 1978,
      "sesamo": 1978,
      "coloroc": 2190,
      "masai": 2190,
      "sigaro": 2190,
      "cenere": 2190,
      "tabacco": 2062,
      "canaletto": 2035,
      "moka": 1685,
      "brina": 1685,
      "ghiaccio": 1685,
      "otter": 1685,
      "walnut": 1685,
      "sabbia": 1685
    }
  },
  {
    model: "2Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 2256,
      "vanilla": 2256,
      "olmo": 2256,
      "jazz": 2256,
      "blond": 2256,
      "carruba": 2256,
      "sesamo": 2256,
      "coloroc": 2546,
      "masai": 2546,
      "sigaro": 2546,
      "cenere": 2546,
      "tabacco": 2356,
      "canaletto": 2325,
      "moka": 1883,
      "brina": 1883,
      "ghiaccio": 1883,
      "otter": 1883,
      "walnut": 1883,
      "sabbia": 1883
    }
  },
  {
    model: "2Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 2207,
      "vanilla": 2207,
      "olmo": 2207,
      "jazz": 2207,
      "blond": 2207,
      "carruba": 2207,
      "sesamo": 2207,
      "coloroc": 2467,
      "masai": 2467,
      "sigaro": 2467,
      "cenere": 2467,
      "tabacco": 2276,
      "canaletto": 2245,
      "moka": 1803,
      "brina": 1803,
      "ghiaccio": 1803,
      "otter": 1803,
      "walnut": 1803,
      "sabbia": 1803
    }
  },
  {
    model: "2Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2991,
      "vanilla": 2991,
      "olmo": 2991,
      "jazz": 2991,
      "blond": 2991,
      "carruba": 2991,
      "sesamo": 2991,
      "coloroc": 3397,
      "masai": 3397,
      "sigaro": 3397,
      "cenere": 3397,
      "tabacco": 3134,
      "canaletto": 3089,
      "moka": 2618,
      "brina": 2618,
      "ghiaccio": 2618,
      "otter": 2618,
      "walnut": 2618,
      "sabbia": 2618
    }
  },
  {
    model: "2Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 2991,
      "vanilla": 2991,
      "olmo": 2991,
      "jazz": 2991,
      "blond": 2991,
      "carruba": 2991,
      "sesamo": 2991,
      "coloroc": 3397,
      "masai": 3397,
      "sigaro": 3397,
      "cenere": 3397,
      "tabacco": 3134,
      "canaletto": 3089,
      "moka": 2618,
      "brina": 2618,
      "ghiaccio": 2618,
      "otter": 2618,
      "walnut": 2618,
      "sabbia": 2618
    }
  },
  {
    model: "AURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1631,
      "soft": 1771,
      "dark": 1881,
      "metal": 1968
    }
  },
  {
    model: "AURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1903,
      "soft": 2181,
      "dark": 2319,
      "metal": 2385
    }
  },
  {
    model: "AURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1823,
      "soft": 2102,
      "dark": 2239,
      "metal": 2305
    }
  },
  {
    model: "AURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2696,
      "soft": 3080,
      "dark": 3269,
      "metal": 3360
    }
  },
  {
    model: "AURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "blanc": 3804,
      "soft": 4220,
      "dark": 4425,
      "metal": 4524
    }
  },
  {
    model: "AURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "blanc": 5202,
      "soft": 5691,
      "dark": 5933,
      "metal": 6049
    }
  },
  {
    model: "AURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2696,
      "soft": 3080,
      "dark": 3269,
      "metal": 3360
    }
  },
  {
    model: "COLONIALE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1687,
      "soft": 1910,
      "dark": 2021,
      "metal": 2073
    }
  },
  {
    model: "COLONIALE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1975,
      "soft": 2238,
      "dark": 2408,
      "metal": 2471
    }
  },
  {
    model: "COLONIALE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1895,
      "soft": 2158,
      "dark": 2328,
      "metal": 2392
    }
  },
  {
    model: "COLONIALE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2733,
      "soft": 3091,
      "dark": 3446,
      "metal": 3535
    }
  },
  {
    model: "COLONIALE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "blanc": 3988,
      "soft": 4397,
      "dark": 4598,
      "metal": 4695
    }
  },
  {
    model: "COLONIALE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "blanc": 5509,
      "soft": 5997,
      "dark": 6238,
      "metal": 6354
    }
  },
  {
    model: "COLONIALE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2733,
      "soft": 3091,
      "dark": 3446,
      "metal": 3535
    }
  },
  {
    model: "EAN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1687,
      "soft": 1910,
      "dark": 2021,
      "metal": 2073
    }
  },
  {
    model: "EAN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1975,
      "soft": 2238,
      "dark": 2408,
      "metal": 2471
    }
  },
  {
    model: "EAN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1895,
      "soft": 2158,
      "dark": 2328,
      "metal": 2392
    }
  },
  {
    model: "EAN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2733,
      "soft": 3091,
      "dark": 3446,
      "metal": 3535
    }
  },
  {
    model: "EAN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "blanc": 3988,
      "soft": 4397,
      "dark": 4598,
      "metal": 4695
    }
  },
  {
    model: "EAN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "blanc": 5509,
      "soft": 5997,
      "dark": 6238,
      "metal": 6354
    }
  },
  {
    model: "EAN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2733,
      "soft": 3091,
      "dark": 3446,
      "metal": 3535
    }
  },
  {
    model: "I1",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1658,
      "vanilla": 1658,
      "olmo": 1658,
      "jazz": 1658,
      "blond": 1658,
      "carruba": 1658,
      "sesamo": 1658,
      "coloroc": 1870,
      "masai": 1870,
      "sigaro": 1870,
      "cenere": 1870,
      "tabacco": 1742,
      "canaletto": 1715,
      "moka": 1365,
      "brina": 1365,
      "ghiaccio": 1365,
      "otter": 1365,
      "walnut": 1365,
      "sabbia": 1365
    }
  },
  {
    model: "I1",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 1936,
      "vanilla": 1936,
      "olmo": 1936,
      "jazz": 1936,
      "blond": 1936,
      "carruba": 1936,
      "sesamo": 1936,
      "coloroc": 2226,
      "masai": 2226,
      "sigaro": 2226,
      "cenere": 2226,
      "tabacco": 2036,
      "canaletto": 2005,
      "moka": 1563,
      "brina": 1563,
      "ghiaccio": 1563,
      "otter": 1563,
      "walnut": 1563,
      "sabbia": 1563
    }
  },
  {
    model: "I1",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 1887,
      "vanilla": 1887,
      "olmo": 1887,
      "jazz": 1887,
      "blond": 1887,
      "carruba": 1887,
      "sesamo": 1887,
      "coloroc": 2147,
      "masai": 2147,
      "sigaro": 2147,
      "cenere": 2147,
      "tabacco": 1956,
      "canaletto": 1925,
      "moka": 1483,
      "brina": 1483,
      "ghiaccio": 1483,
      "otter": 1483,
      "walnut": 1483,
      "sabbia": 1483
    }
  },
  {
    model: "I1",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2671,
      "vanilla": 2671,
      "olmo": 2671,
      "jazz": 2671,
      "blond": 2671,
      "carruba": 2671,
      "sesamo": 2671,
      "coloroc": 3077,
      "masai": 3077,
      "sigaro": 3077,
      "cenere": 3077,
      "tabacco": 2814,
      "canaletto": 2769,
      "moka": 2298,
      "brina": 2298,
      "ghiaccio": 2298,
      "otter": 2298,
      "walnut": 2298,
      "sabbia": 2298
    }
  },
  {
    model: "I1",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 2671,
      "vanilla": 2671,
      "olmo": 2671,
      "jazz": 2671,
      "blond": 2671,
      "carruba": 2671,
      "sesamo": 2671,
      "coloroc": 3077,
      "masai": 3077,
      "sigaro": 3077,
      "cenere": 3077,
      "tabacco": 2814,
      "canaletto": 2769,
      "moka": 2298,
      "brina": 2298,
      "ghiaccio": 2298,
      "otter": 2298,
      "walnut": 2298,
      "sabbia": 2298
    }
  },
  {
    model: "I2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1790,
      "vanilla": 1790,
      "olmo": 1790,
      "jazz": 1790,
      "blond": 1790,
      "carruba": 1790,
      "sesamo": 1790,
      "coloroc": 2002,
      "masai": 2002,
      "sigaro": 2002,
      "cenere": 2002,
      "tabacco": 1874,
      "canaletto": 1847,
      "moka": 1497,
      "brina": 1497,
      "ghiaccio": 1497,
      "otter": 1497,
      "walnut": 1497,
      "sabbia": 1497
    }
  },
  {
    model: "I2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 2068,
      "vanilla": 2068,
      "olmo": 2068,
      "jazz": 2068,
      "blond": 2068,
      "carruba": 2068,
      "sesamo": 2068,
      "coloroc": 2358,
      "masai": 2358,
      "sigaro": 2358,
      "cenere": 2358,
      "tabacco": 2168,
      "canaletto": 2137,
      "moka": 1695,
      "brina": 1695,
      "ghiaccio": 1695,
      "otter": 1695,
      "walnut": 1695,
      "sabbia": 1695
    }
  },
  {
    model: "I2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 2019,
      "vanilla": 2019,
      "olmo": 2019,
      "jazz": 2019,
      "blond": 2019,
      "carruba": 2019,
      "sesamo": 2019,
      "coloroc": 2279,
      "masai": 2279,
      "sigaro": 2279,
      "cenere": 2279,
      "tabacco": 2088,
      "canaletto": 2057,
      "moka": 1615,
      "brina": 1615,
      "ghiaccio": 1615,
      "otter": 1615,
      "walnut": 1615,
      "sabbia": 1615
    }
  },
  {
    model: "I2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2803,
      "vanilla": 2803,
      "olmo": 2803,
      "jazz": 2803,
      "blond": 2803,
      "carruba": 2803,
      "sesamo": 2803,
      "coloroc": 3209,
      "masai": 3209,
      "sigaro": 3209,
      "cenere": 3209,
      "tabacco": 2946,
      "canaletto": 2901,
      "moka": 2430,
      "brina": 2430,
      "ghiaccio": 2430,
      "otter": 2430,
      "walnut": 2430,
      "sabbia": 2430
    }
  },
  {
    model: "I2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 2803,
      "vanilla": 2803,
      "olmo": 2803,
      "jazz": 2803,
      "blond": 2803,
      "carruba": 2803,
      "sesamo": 2803,
      "coloroc": 3209,
      "masai": 3209,
      "sigaro": 3209,
      "cenere": 3209,
      "tabacco": 2946,
      "canaletto": 2901,
      "moka": 2430,
      "brina": 2430,
      "ghiaccio": 2430,
      "otter": 2430,
      "walnut": 2430,
      "sabbia": 2430
    }
  },
  {
    model: "KIN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1548,
      "vanilla": 1548,
      "olmo": 1548,
      "jazz": 1548,
      "blond": 1548,
      "carruba": 1548,
      "sesamo": 1548,
      "coloroc": 1760,
      "masai": 1760,
      "sigaro": 1760,
      "cenere": 1760,
      "tabacco": 1632,
      "canaletto": 1605,
      "moka": 1255,
      "brina": 1255,
      "ghiaccio": 1255,
      "otter": 1255,
      "walnut": 1255,
      "sabbia": 1255
    }
  },
  {
    model: "KIN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 1826,
      "vanilla": 1826,
      "olmo": 1826,
      "jazz": 1826,
      "blond": 1826,
      "carruba": 1826,
      "sesamo": 1826,
      "coloroc": 2116,
      "masai": 2116,
      "sigaro": 2116,
      "cenere": 2116,
      "tabacco": 1926,
      "canaletto": 1895,
      "moka": 1453,
      "brina": 1453,
      "ghiaccio": 1453,
      "otter": 1453,
      "walnut": 1453,
      "sabbia": 1453
    }
  },
  {
    model: "KIN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 1777,
      "vanilla": 1777,
      "olmo": 1777,
      "jazz": 1777,
      "blond": 1777,
      "carruba": 1777,
      "sesamo": 1777,
      "coloroc": 2037,
      "masai": 2037,
      "sigaro": 2037,
      "cenere": 2037,
      "tabacco": 1846,
      "canaletto": 1815,
      "moka": 1373,
      "brina": 1373,
      "ghiaccio": 1373,
      "otter": 1373,
      "walnut": 1373,
      "sabbia": 1373
    }
  },
  {
    model: "KIN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2561,
      "vanilla": 2561,
      "olmo": 2561,
      "jazz": 2561,
      "blond": 2561,
      "carruba": 2561,
      "sesamo": 2561,
      "coloroc": 2967,
      "masai": 2967,
      "sigaro": 2967,
      "cenere": 2967,
      "tabacco": 2704,
      "canaletto": 2659,
      "moka": 2188,
      "brina": 2188,
      "ghiaccio": 2188,
      "otter": 2188,
      "walnut": 2188,
      "sabbia": 2188
    }
  },
  {
    model: "KIN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "nodato": 3637,
      "vanilla": 3637,
      "olmo": 3637,
      "jazz": 3637,
      "blond": 3637,
      "carruba": 3637,
      "sesamo": 3637,
      "coloroc": 4169,
      "masai": 4169,
      "sigaro": 4169,
      "cenere": 4169,
      "tabacco": 3737,
      "canaletto": 3690,
      "moka": 3206,
      "brina": 3206,
      "ghiaccio": 3206,
      "otter": 3206,
      "walnut": 3206,
      "sabbia": 3206
    }
  },
  {
    model: "KIN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "nodato": 5073,
      "vanilla": 5073,
      "olmo": 5073,
      "jazz": 5073,
      "blond": 5073,
      "carruba": 5073,
      "sesamo": 5073,
      "coloroc": 5634,
      "masai": 5634,
      "sigaro": 5634,
      "cenere": 5634,
      "tabacco": 5292,
      "canaletto": 5235
    }
  },
  {
    model: "KIN",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 2561,
      "vanilla": 2561,
      "olmo": 2561,
      "jazz": 2561,
      "blond": 2561,
      "carruba": 2561,
      "sesamo": 2561,
      "coloroc": 2967,
      "masai": 2967,
      "sigaro": 2967,
      "cenere": 2967,
      "tabacco": 2704,
      "canaletto": 2659,
      "moka": 2188,
      "brina": 2188,
      "ghiaccio": 2188,
      "otter": 2188,
      "walnut": 2188,
      "sabbia": 2188
    }
  },
  {
    model: "KV",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1644,
      "vanilla": 1644,
      "olmo": 1644,
      "jazz": 1644,
      "blond": 1644,
      "carruba": 1644,
      "sesamo": 1644,
      "coloroc": 1856,
      "masai": 1856,
      "sigaro": 1856,
      "cenere": 1856,
      "tabacco": 1728,
      "canaletto": 1701,
      "moka": 1351,
      "brina": 1351,
      "ghiaccio": 1351,
      "otter": 1351,
      "walnut": 1351,
      "sabbia": 1351
    }
  },
  {
    model: "KV",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 1922,
      "vanilla": 1922,
      "olmo": 1922,
      "jazz": 1922,
      "blond": 1922,
      "carruba": 1922,
      "sesamo": 1922,
      "coloroc": 2212,
      "masai": 2212,
      "sigaro": 2212,
      "cenere": 2212,
      "tabacco": 2022,
      "canaletto": 1991,
      "moka": 1549,
      "brina": 1549,
      "ghiaccio": 1549,
      "otter": 1549,
      "walnut": 1549,
      "sabbia": 1549
    }
  },
  {
    model: "KV",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 1873,
      "vanilla": 1873,
      "olmo": 1873,
      "jazz": 1873,
      "blond": 1873,
      "carruba": 1873,
      "sesamo": 1873,
      "coloroc": 2133,
      "masai": 2133,
      "sigaro": 2133,
      "cenere": 2133,
      "tabacco": 1942,
      "canaletto": 1911,
      "moka": 1469,
      "brina": 1469,
      "ghiaccio": 1469,
      "otter": 1469,
      "walnut": 1469,
      "sabbia": 1469
    }
  },
  {
    model: "KV",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2657,
      "vanilla": 2657,
      "olmo": 2657,
      "jazz": 2657,
      "blond": 2657,
      "carruba": 2657,
      "sesamo": 2657,
      "coloroc": 3063,
      "masai": 3063,
      "sigaro": 3063,
      "cenere": 3063,
      "tabacco": 2800,
      "canaletto": 2755,
      "moka": 2284,
      "brina": 2284,
      "ghiaccio": 2284,
      "otter": 2284,
      "walnut": 2284,
      "sabbia": 2284
    }
  },
  {
    model: "KV",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "nodato": 3733,
      "vanilla": 3733,
      "olmo": 3733,
      "jazz": 3733,
      "blond": 3733,
      "carruba": 3733,
      "sesamo": 3733,
      "coloroc": 4265,
      "masai": 4265,
      "sigaro": 4265,
      "cenere": 4265,
      "tabacco": 3833,
      "canaletto": 3786,
      "moka": 3302,
      "brina": 3302,
      "ghiaccio": 3302,
      "otter": 3302,
      "walnut": 3302,
      "sabbia": 3302
    }
  },
  {
    model: "KV",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "nodato": 5169,
      "vanilla": 5169,
      "olmo": 5169,
      "jazz": 5169,
      "blond": 5169,
      "carruba": 5169,
      "sesamo": 5169,
      "coloroc": 5730,
      "masai": 5730,
      "sigaro": 5730,
      "cenere": 5730,
      "tabacco": 5388,
      "canaletto": 5331
    }
  },
  {
    model: "KV",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 2657,
      "vanilla": 2657,
      "olmo": 2657,
      "jazz": 2657,
      "blond": 2657,
      "carruba": 2657,
      "sesamo": 2657,
      "coloroc": 3063,
      "masai": 3063,
      "sigaro": 3063,
      "cenere": 3063,
      "tabacco": 2800,
      "canaletto": 2755,
      "moka": 2284,
      "brina": 2284,
      "ghiaccio": 2284,
      "otter": 2284,
      "walnut": 2284,
      "sabbia": 2284
    }
  },
  {
    model: "LUCIO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1687,
      "soft": 1910,
      "dark": 2021,
      "metal": 2073
    }
  },
  {
    model: "LUCIO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1975,
      "soft": 2238,
      "dark": 2408,
      "metal": 2471
    }
  },
  {
    model: "LUCIO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1895,
      "soft": 2158,
      "dark": 2328,
      "metal": 2392
    }
  },
  {
    model: "LUCIO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2733,
      "soft": 3091,
      "dark": 3446,
      "metal": 3535
    }
  },
  {
    model: "LUCIO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "blanc": 3988,
      "soft": 4397,
      "dark": 4598,
      "metal": 4695
    }
  },
  {
    model: "LUCIO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "blanc": 5509,
      "soft": 5997,
      "dark": 6238,
      "metal": 6354
    }
  },
  {
    model: "LUCIO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2733,
      "soft": 3091,
      "dark": 3446,
      "metal": 3535
    }
  },
  {
    model: "MILLED",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "jazz": 2342,
      "canaletto": 2342
    }
  },
  {
    model: "MILLED",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "jazz": 2765,
      "canaletto": 2765
    }
  },
  {
    model: "MILLED",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "jazz": 3748,
      "canaletto": 3748
    }
  },
  {
    model: "MILLED",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "jazz": 3748,
      "canaletto": 3748
    }
  },
  {
    model: "ON",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "you": 1081,
      "blanc": 1142,
      "tortora": 1382,
      "soft": 1410,
      "dark": 1549,
      "metal": 1604,
      "glossy": 3077,
      "nodato": 1485,
      "vanilla": 1485,
      "olmo": 1485,
      "jazz": 1485,
      "blond": 1485,
      "carruba": 1485,
      "sesamo": 1485,
      "coloroc": 1697,
      "masai": 1697,
      "sigaro": 1697,
      "cenere": 1697,
      "tabacco": 1569,
      "canaletto": 1542,
      "moka": 1192,
      "brina": 1192,
      "ghiaccio": 1192,
      "otter": 1192,
      "walnut": 1192,
      "sabbia": 1192
    }
  },
  {
    model: "ON",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "you": 1307,
      "blanc": 1355,
      "tortora": 1619,
      "soft": 1702,
      "dark": 1873,
      "metal": 1906,
      "glossy": 3609,
      "nodato": 1763,
      "vanilla": 1763,
      "olmo": 1763,
      "jazz": 1763,
      "blond": 1763,
      "carruba": 1763,
      "sesamo": 1763,
      "coloroc": 2053,
      "masai": 2053,
      "sigaro": 2053,
      "cenere": 2053,
      "tabacco": 1863,
      "canaletto": 1832,
      "moka": 1390,
      "brina": 1390,
      "ghiaccio": 1390,
      "otter": 1390,
      "walnut": 1390,
      "sabbia": 1390
    }
  },
  {
    model: "ON",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "you": 1227,
      "blanc": 1275,
      "tortora": 1539,
      "soft": 1623,
      "dark": 1793,
      "metal": 1826,
      "glossy": 3529,
      "nodato": 1714,
      "vanilla": 1714,
      "olmo": 1714,
      "jazz": 1714,
      "blond": 1714,
      "carruba": 1714,
      "sesamo": 1714,
      "coloroc": 1974,
      "masai": 1974,
      "sigaro": 1974,
      "cenere": 1974,
      "tabacco": 1783,
      "canaletto": 1752,
      "moka": 1310,
      "brina": 1310,
      "ghiaccio": 1310,
      "otter": 1310,
      "walnut": 1310,
      "sabbia": 1310
    }
  },
  {
    model: "ON",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "you": 1886,
      "blanc": 1894,
      "tortora": 2333,
      "soft": 2375,
      "dark": 2653,
      "metal": 2650,
      "glossy": 5052,
      "nodato": 2498,
      "vanilla": 2498,
      "olmo": 2498,
      "jazz": 2498,
      "blond": 2498,
      "carruba": 2498,
      "sesamo": 2498,
      "coloroc": 2904,
      "masai": 2904,
      "sigaro": 2904,
      "cenere": 2904,
      "tabacco": 2641,
      "canaletto": 2596,
      "moka": 2125,
      "brina": 2125,
      "ghiaccio": 2125,
      "otter": 2125,
      "walnut": 2125,
      "sabbia": 2125
    }
  },
  {
    model: "ON",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "you": 2254,
      "blanc": 2976,
      "tortora": 3377,
      "soft": 3439,
      "dark": 3689,
      "metal": 3736,
      "glossy": 6237,
      "nodato": 3574,
      "vanilla": 3574,
      "olmo": 3574,
      "jazz": 3574,
      "blond": 3574,
      "carruba": 3574,
      "sesamo": 3574,
      "coloroc": 4106,
      "masai": 4106,
      "sigaro": 4106,
      "cenere": 4106,
      "tabacco": 3674,
      "canaletto": 3627,
      "moka": 3143,
      "brina": 3143,
      "ghiaccio": 3143,
      "otter": 3143,
      "walnut": 3143,
      "sabbia": 3143
    }
  },
  {
    model: "ON",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "you": 3365,
      "blanc": 428,
      "tortora": 4760,
      "soft": 4849,
      "dark": 5247,
      "metal": 5206,
      "nodato": 5010,
      "vanilla": 5010,
      "olmo": 5010,
      "jazz": 5010,
      "blond": 5010,
      "carruba": 5010,
      "sesamo": 5010,
      "coloroc": 5571,
      "masai": 5571,
      "sigaro": 5571,
      "cenere": 5571,
      "tabacco": 5229,
      "canaletto": 5172
    }
  },
  {
    model: "ON",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "you": 1886,
      "blanc": 1894,
      "tortora": 2333,
      "soft": 2375,
      "dark": 2653,
      "metal": 2650,
      "glossy": 5052,
      "nodato": 2498,
      "vanilla": 2498,
      "olmo": 2498,
      "jazz": 2498,
      "blond": 2498,
      "carruba": 2498,
      "sesamo": 2498,
      "coloroc": 2904,
      "masai": 2904,
      "sigaro": 2904,
      "cenere": 2904,
      "tabacco": 2641,
      "canaletto": 2596,
      "moka": 2125,
      "brina": 2125,
      "ghiaccio": 2125,
      "otter": 2125,
      "walnut": 2125,
      "sabbia": 2125
    }
  },
  {
    model: "PURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1631,
      "soft": 1771,
      "dark": 1881,
      "metal": 1968
    }
  },
  {
    model: "PURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1903,
      "soft": 2181,
      "dark": 2319,
      "metal": 2385
    }
  },
  {
    model: "PURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1823,
      "soft": 2102,
      "dark": 2239,
      "metal": 2305
    }
  },
  {
    model: "PURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2696,
      "soft": 3080,
      "dark": 3269,
      "metal": 3360
    }
  },
  {
    model: "PURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "blanc": 3804,
      "soft": 4220,
      "dark": 4425,
      "metal": 4524
    }
  },
  {
    model: "PURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "blanc": 5202,
      "soft": 5691,
      "dark": 5933,
      "metal": 6049
    }
  },
  {
    model: "PURA",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2696,
      "soft": 3080,
      "dark": 3269,
      "metal": 3360
    }
  },
  {
    model: "Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1884,
      "vanilla": 1884,
      "olmo": 1884,
      "jazz": 1884,
      "blond": 1884,
      "carruba": 1884,
      "sesamo": 1884,
      "coloroc": 2096,
      "masai": 2096,
      "sigaro": 2096,
      "cenere": 2096,
      "tabacco": 1968,
      "canaletto": 1941,
      "moka": 1591,
      "brina": 1591,
      "ghiaccio": 1591,
      "otter": 1591,
      "walnut": 1591,
      "sabbia": 1591
    }
  },
  {
    model: "Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 2162,
      "vanilla": 2162,
      "olmo": 2162,
      "jazz": 2162,
      "blond": 2162,
      "carruba": 2162,
      "sesamo": 2162,
      "coloroc": 2452,
      "masai": 2452,
      "sigaro": 2452,
      "cenere": 2452,
      "tabacco": 2262,
      "canaletto": 2231,
      "moka": 1789,
      "brina": 1789,
      "ghiaccio": 1789,
      "otter": 1789,
      "walnut": 1789,
      "sabbia": 1789
    }
  },
  {
    model: "Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 2113,
      "vanilla": 2113,
      "olmo": 2113,
      "jazz": 2113,
      "blond": 2113,
      "carruba": 2113,
      "sesamo": 2113,
      "coloroc": 2373,
      "masai": 2373,
      "sigaro": 2373,
      "cenere": 2373,
      "tabacco": 2182,
      "canaletto": 2151,
      "moka": 1709,
      "brina": 1709,
      "ghiaccio": 1709,
      "otter": 1709,
      "walnut": 1709,
      "sabbia": 1709
    }
  },
  {
    model: "Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2897,
      "vanilla": 2897,
      "olmo": 2897,
      "jazz": 2897,
      "blond": 2897,
      "carruba": 2897,
      "sesamo": 2897,
      "coloroc": 3303,
      "masai": 3303,
      "sigaro": 3303,
      "cenere": 3303,
      "tabacco": 3040,
      "canaletto": 2995,
      "moka": 2524,
      "brina": 2524,
      "ghiaccio": 2524,
      "otter": 2524,
      "walnut": 2524,
      "sabbia": 2524
    }
  },
  {
    model: "Q2",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 2897,
      "vanilla": 2897,
      "olmo": 2897,
      "jazz": 2897,
      "blond": 2897,
      "carruba": 2897,
      "sesamo": 2897,
      "coloroc": 3303,
      "masai": 3303,
      "sigaro": 3303,
      "cenere": 3303,
      "tabacco": 3040,
      "canaletto": 2995,
      "moka": 2524,
      "brina": 2524,
      "ghiaccio": 2524,
      "otter": 2524,
      "walnut": 2524,
      "sabbia": 2524
    }
  },
  {
    model: "Q3",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 2084,
      "vanilla": 2084,
      "olmo": 2084,
      "jazz": 2084,
      "blond": 2084,
      "carruba": 2084,
      "sesamo": 2084,
      "coloroc": 2296,
      "masai": 2296,
      "sigaro": 2296,
      "cenere": 2296,
      "tabacco": 2168,
      "canaletto": 2141,
      "moka": 1791,
      "brina": 1791,
      "ghiaccio": 1791,
      "otter": 1791,
      "walnut": 1791,
      "sabbia": 1791
    }
  },
  {
    model: "Q3",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 2362,
      "vanilla": 2362,
      "olmo": 2362,
      "jazz": 2362,
      "blond": 2362,
      "carruba": 2362,
      "sesamo": 2362,
      "coloroc": 2652,
      "masai": 2652,
      "sigaro": 2652,
      "cenere": 2652,
      "tabacco": 2462,
      "canaletto": 2431,
      "moka": 1989,
      "brina": 1989,
      "ghiaccio": 1989,
      "otter": 1989,
      "walnut": 1989,
      "sabbia": 1989
    }
  },
  {
    model: "Q3",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 2313,
      "vanilla": 2313,
      "olmo": 2313,
      "jazz": 2313,
      "blond": 2313,
      "carruba": 2313,
      "sesamo": 2313,
      "coloroc": 2573,
      "masai": 2573,
      "sigaro": 2573,
      "cenere": 2573,
      "tabacco": 2382,
      "canaletto": 2351,
      "moka": 1909,
      "brina": 1909,
      "ghiaccio": 1909,
      "otter": 1909,
      "walnut": 1909,
      "sabbia": 1909
    }
  },
  {
    model: "Q3",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 3097,
      "vanilla": 3097,
      "olmo": 3097,
      "jazz": 3097,
      "blond": 3097,
      "carruba": 3097,
      "sesamo": 3097,
      "coloroc": 3503,
      "masai": 3503,
      "sigaro": 3503,
      "cenere": 3503,
      "tabacco": 3240,
      "canaletto": 3195,
      "moka": 2724,
      "brina": 2724,
      "ghiaccio": 2724,
      "otter": 2724,
      "walnut": 2724,
      "sabbia": 2724
    }
  },
  {
    model: "Q3",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 3097,
      "vanilla": 3097,
      "olmo": 3097,
      "jazz": 3097,
      "blond": 3097,
      "carruba": 3097,
      "sesamo": 3097,
      "coloroc": 3503,
      "masai": 3503,
      "sigaro": 3503,
      "cenere": 3503,
      "tabacco": 3240,
      "canaletto": 3195,
      "moka": 2724,
      "brina": 2724,
      "ghiaccio": 2724,
      "otter": 2724,
      "walnut": 2724,
      "sabbia": 2724
    }
  },
  {
    model: "QUADRO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1631,
      "soft": 1771,
      "dark": 1881,
      "metal": 1968
    }
  },
  {
    model: "GIOTTO 11G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1944,
      "soft": 2190
    }
  },
  {
    model: "GIOTTO 11G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2427,
      "soft": 2854
    }
  },
  {
    model: "GIOTTO 12G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1564,
      "soft": 1850
    }
  },
  {
    model: "GIOTTO 12G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1944,
      "soft": 2190
    }
  },
  {
    model: "GIOTTO 12G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2427,
      "soft": 2854
    }
  },
  {
    model: "GIOTTO 13G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1564,
      "soft": 1850
    }
  },
  {
    model: "GIOTTO 13G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1944,
      "soft": 2190
    }
  },
  {
    model: "GIOTTO 13G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2427,
      "soft": 2854
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1212,
      "tortora": 1638,
      "soft": 1664,
      "dark": 1879,
      "metal": 2070,
      "nodato": 1800,
      "vanilla": 1800,
      "olmo": 1800,
      "jazz": 1800,
      "blond": 1800,
      "carruba": 1800,
      "sesamo": 1800,
      "coloroc": 2077,
      "masai": 2077,
      "sigaro": 2077,
      "cenere": 2077,
      "tabacco": 2122,
      "canaletto": 1918
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1544,
      "tortora": 1908,
      "soft": 1939,
      "dark": 2160,
      "metal": 2433,
      "nodato": 2106,
      "vanilla": 2106,
      "olmo": 2106,
      "jazz": 2106,
      "blond": 2106,
      "carruba": 2106,
      "sesamo": 2106,
      "coloroc": 2438,
      "masai": 2438,
      "sigaro": 2438,
      "cenere": 2438,
      "tabacco": 2505,
      "canaletto": 2251
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 1955,
      "tortora": 2390,
      "soft": 2428,
      "dark": 2737,
      "metal": 3021,
      "nodato": 2714,
      "vanilla": 2714,
      "olmo": 2714,
      "jazz": 2714,
      "blond": 2714,
      "carruba": 2714,
      "sesamo": 2714,
      "coloroc": 3072,
      "masai": 3072,
      "sigaro": 3072,
      "cenere": 3072,
      "tabacco": 3155,
      "canaletto": 2846
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2043,
      "tortora": 2511,
      "soft": 2552,
      "dark": 2890,
      "metal": 3235,
      "nodato": 2852,
      "vanilla": 2852,
      "olmo": 2852,
      "jazz": 2852,
      "blond": 2852,
      "carruba": 2852,
      "sesamo": 2852,
      "coloroc": 3250,
      "masai": 3250,
      "sigaro": 3250,
      "cenere": 3250,
      "tabacco": 3302,
      "canaletto": 2987
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1410,
      "tortora": 1789,
      "soft": 1792,
      "dark": 2006,
      "metal": 2230,
      "nodato": 1850,
      "vanilla": 1850,
      "olmo": 1850,
      "jazz": 1850,
      "blond": 1850,
      "carruba": 1850,
      "sesamo": 1850,
      "coloroc": 2210,
      "masai": 2210,
      "sigaro": 2210,
      "cenere": 2210,
      "tabacco": 2221,
      "canaletto": 2005
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1656,
      "tortora": 2091,
      "soft": 2126,
      "dark": 2346,
      "metal": 2623,
      "nodato": 2190,
      "vanilla": 2190,
      "olmo": 2190,
      "jazz": 2190,
      "blond": 2190,
      "carruba": 2190,
      "sesamo": 2190,
      "coloroc": 2585,
      "masai": 2585,
      "sigaro": 2585,
      "cenere": 2585,
      "tabacco": 2610,
      "canaletto": 2344
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2127,
      "tortora": 2803,
      "soft": 2851,
      "dark": 3017,
      "metal": 3470,
      "nodato": 2839,
      "vanilla": 2839,
      "olmo": 2839,
      "jazz": 2839,
      "blond": 2839,
      "carruba": 2839,
      "sesamo": 2839,
      "coloroc": 3201,
      "masai": 3201,
      "sigaro": 3201,
      "cenere": 3201,
      "tabacco": 3287,
      "canaletto": 3023
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2293,
      "tortora": 2953,
      "soft": 3004,
      "dark": 3192,
      "metal": 3660,
      "nodato": 3060,
      "vanilla": 3060,
      "olmo": 3060,
      "jazz": 3060,
      "blond": 3060,
      "carruba": 3060,
      "sesamo": 3060,
      "coloroc": 3469,
      "masai": 3469,
      "sigaro": 3469,
      "cenere": 3469,
      "tabacco": 3523,
      "canaletto": 3310
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1344,
      "tortora": 1770,
      "soft": 1796,
      "dark": 2011,
      "metal": 2202,
      "nodato": 1932,
      "vanilla": 1932,
      "olmo": 1932,
      "jazz": 1932,
      "blond": 1932,
      "carruba": 1932,
      "sesamo": 1932,
      "coloroc": 2209,
      "masai": 2209,
      "sigaro": 2209,
      "cenere": 2209,
      "tabacco": 2254,
      "canaletto": 2050
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1676,
      "tortora": 2040,
      "soft": 2071,
      "dark": 2292,
      "metal": 2565,
      "nodato": 2238,
      "vanilla": 2238,
      "olmo": 2238,
      "jazz": 2238,
      "blond": 2238,
      "carruba": 2238,
      "sesamo": 2238,
      "coloroc": 2570,
      "masai": 2570,
      "sigaro": 2570,
      "cenere": 2570,
      "tabacco": 2637,
      "canaletto": 2383
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2087,
      "tortora": 2522,
      "soft": 2560,
      "dark": 2869,
      "metal": 3153,
      "nodato": 2846,
      "vanilla": 2846,
      "olmo": 2846,
      "jazz": 2846,
      "blond": 2846,
      "carruba": 2846,
      "sesamo": 2846,
      "coloroc": 3204,
      "masai": 3204,
      "sigaro": 3204,
      "cenere": 3204,
      "tabacco": 3287,
      "canaletto": 2978
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2175,
      "tortora": 2643,
      "soft": 2684,
      "dark": 3022,
      "metal": 3367,
      "nodato": 2984,
      "vanilla": 2984,
      "olmo": 2984,
      "jazz": 2984,
      "blond": 2984,
      "carruba": 2984,
      "sesamo": 2984,
      "coloroc": 3382,
      "masai": 3382,
      "sigaro": 3382,
      "cenere": 3382,
      "tabacco": 3434,
      "canaletto": 3119
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1542,
      "tortora": 1921,
      "soft": 1924,
      "dark": 2138,
      "metal": 2362,
      "nodato": 1982,
      "vanilla": 1982,
      "olmo": 1982,
      "jazz": 1982,
      "blond": 1982,
      "carruba": 1982,
      "sesamo": 1982,
      "coloroc": 2342,
      "masai": 2342,
      "sigaro": 2342,
      "cenere": 2342,
      "tabacco": 2353,
      "canaletto": 2137
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1788,
      "tortora": 2223,
      "soft": 2258,
      "dark": 2478,
      "metal": 2755,
      "nodato": 2322,
      "vanilla": 2322,
      "olmo": 2322,
      "jazz": 2322,
      "blond": 2322,
      "carruba": 2322,
      "sesamo": 2322,
      "coloroc": 2717,
      "masai": 2717,
      "sigaro": 2717,
      "cenere": 2717,
      "tabacco": 2742,
      "canaletto": 2476
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2259,
      "tortora": 2935,
      "soft": 2983,
      "dark": 3149,
      "metal": 3602,
      "nodato": 2971,
      "vanilla": 2971,
      "olmo": 2971,
      "jazz": 2971,
      "blond": 2971,
      "carruba": 2971,
      "sesamo": 2971,
      "coloroc": 3333,
      "masai": 3333,
      "sigaro": 3333,
      "cenere": 3333,
      "tabacco": 3419,
      "canaletto": 3155
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2425,
      "tortora": 3085,
      "soft": 3136,
      "dark": 3324,
      "metal": 3792,
      "nodato": 3192,
      "vanilla": 3192,
      "olmo": 3192,
      "jazz": 3192,
      "blond": 3192,
      "carruba": 3192,
      "sesamo": 3192,
      "coloroc": 3601,
      "masai": 3601,
      "sigaro": 3601,
      "cenere": 3601,
      "tabacco": 3655,
      "canaletto": 3442
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1690,
      "vanilla": 1690,
      "olmo": 1690,
      "jazz": 1690,
      "blond": 1690,
      "carruba": 1690,
      "sesamo": 1690,
      "coloroc": 1967,
      "masai": 1967,
      "sigaro": 1967,
      "cenere": 1967,
      "tabacco": 2012,
      "canaletto": 1808
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 1996,
      "vanilla": 1996,
      "olmo": 1996,
      "jazz": 1996,
      "blond": 1996,
      "carruba": 1996,
      "sesamo": 1996,
      "coloroc": 2328,
      "masai": 2328,
      "sigaro": 2328,
      "cenere": 2328,
      "tabacco": 2395,
      "canaletto": 2141
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2604,
      "vanilla": 2604,
      "olmo": 2604,
      "jazz": 2604,
      "blond": 2604,
      "carruba": 2604,
      "sesamo": 2604,
      "coloroc": 2962,
      "masai": 2962,
      "sigaro": 2962,
      "cenere": 2962,
      "tabacco": 3045,
      "canaletto": 2736
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 2742,
      "vanilla": 2742,
      "olmo": 2742,
      "jazz": 2742,
      "blond": 2742,
      "carruba": 2742,
      "sesamo": 2742,
      "coloroc": 3140,
      "masai": 3140,
      "sigaro": 3140,
      "cenere": 3140,
      "tabacco": 3192,
      "canaletto": 2877
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1740,
      "vanilla": 1740,
      "olmo": 1740,
      "jazz": 1740,
      "blond": 1740,
      "carruba": 1740,
      "sesamo": 1740,
      "coloroc": 2100,
      "masai": 2100,
      "sigaro": 2100,
      "cenere": 2100,
      "tabacco": 2111,
      "canaletto": 1895
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 2080,
      "vanilla": 2080,
      "olmo": 2080,
      "jazz": 2080,
      "blond": 2080,
      "carruba": 2080,
      "sesamo": 2080,
      "coloroc": 2475,
      "masai": 2475,
      "sigaro": 2475,
      "cenere": 2475,
      "tabacco": 2500,
      "canaletto": 2234
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2729,
      "vanilla": 2729,
      "olmo": 2729,
      "jazz": 2729,
      "blond": 2729,
      "carruba": 2729,
      "sesamo": 2729,
      "coloroc": 3091,
      "masai": 3091,
      "sigaro": 3091,
      "cenere": 3091,
      "tabacco": 3177,
      "canaletto": 2913
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 2950,
      "vanilla": 2950,
      "olmo": 2950,
      "jazz": 2950,
      "blond": 2950,
      "carruba": 2950,
      "sesamo": 2950,
      "coloroc": 3359,
      "masai": 3359,
      "sigaro": 3359,
      "cenere": 3359,
      "tabacco": 3413,
      "canaletto": 3200
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1786,
      "vanilla": 1786,
      "olmo": 1786,
      "jazz": 1786,
      "blond": 1786,
      "carruba": 1786,
      "sesamo": 1786,
      "coloroc": 2063,
      "masai": 2063,
      "sigaro": 2063,
      "cenere": 2063,
      "tabacco": 2108,
      "canaletto": 1904
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 2092,
      "vanilla": 2092,
      "olmo": 2092,
      "jazz": 2092,
      "blond": 2092,
      "carruba": 2092,
      "sesamo": 2092,
      "coloroc": 2424,
      "masai": 2424,
      "sigaro": 2424,
      "cenere": 2424,
      "tabacco": 2491,
      "canaletto": 2237
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2700,
      "vanilla": 2700,
      "olmo": 2700,
      "jazz": 2700,
      "blond": 2700,
      "carruba": 2700,
      "sesamo": 2700,
      "coloroc": 3058,
      "masai": 3058,
      "sigaro": 3058,
      "cenere": 3058,
      "tabacco": 3141,
      "canaletto": 2832
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 2838,
      "vanilla": 2838,
      "olmo": 2838,
      "jazz": 2838,
      "blond": 2838,
      "carruba": 2838,
      "sesamo": 2838,
      "coloroc": 3236,
      "masai": 3236,
      "sigaro": 3236,
      "cenere": 3236,
      "tabacco": 3288,
      "canaletto": 2973
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "nodato": 1836,
      "vanilla": 1836,
      "olmo": 1836,
      "jazz": 1836,
      "blond": 1836,
      "carruba": 1836,
      "sesamo": 1836,
      "coloroc": 2196,
      "masai": 2196,
      "sigaro": 2196,
      "cenere": 2196,
      "tabacco": 2207,
      "canaletto": 1991
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "nodato": 2176,
      "vanilla": 2176,
      "olmo": 2176,
      "jazz": 2176,
      "blond": 2176,
      "carruba": 2176,
      "sesamo": 2176,
      "coloroc": 2571,
      "masai": 2571,
      "sigaro": 2571,
      "cenere": 2571,
      "tabacco": 2596,
      "canaletto": 2330
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "nodato": 2825,
      "vanilla": 2825,
      "olmo": 2825,
      "jazz": 2825,
      "blond": 2825,
      "carruba": 2825,
      "sesamo": 2825,
      "coloroc": 3187,
      "masai": 3187,
      "sigaro": 3187,
      "cenere": 3187,
      "tabacco": 3273,
      "canaletto": 3009
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "nodato": 3046,
      "vanilla": 3046,
      "olmo": 3046,
      "jazz": 3046,
      "blond": 3046,
      "carruba": 3046,
      "sesamo": 3046,
      "coloroc": 3455,
      "masai": 3455,
      "sigaro": 3455,
      "cenere": 3455,
      "tabacco": 3509,
      "canaletto": 3296
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1693,
      "soft": 1982,
      "dark": 2145,
      "metal": 2397
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1994,
      "soft": 2346,
      "dark": 2585,
      "metal": 2851
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2565,
      "soft": 3006,
      "dark": 3232,
      "metal": 3550
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2811,
      "soft": 3293,
      "dark": 3546,
      "metal": 3880
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1783,
      "soft": 2132,
      "dark": 2295,
      "metal": 2551
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2103,
      "soft": 2527,
      "dark": 2769,
      "metal": 3034
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2756,
      "soft": 3273,
      "dark": 3556,
      "metal": 3874
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2960,
      "soft": 3522,
      "dark": 3833,
      "metal": 4162
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1039,
      "tortora": 1465,
      "soft": 1491,
      "dark": 1706,
      "metal": 1897,
      "nodato": 1627,
      "vanilla": 1627,
      "olmo": 1627,
      "jazz": 1627,
      "blond": 1627,
      "carruba": 1627,
      "sesamo": 1627,
      "coloroc": 1904,
      "masai": 1904,
      "sigaro": 1904,
      "cenere": 1904,
      "tabacco": 1949,
      "canaletto": 1745,
      "moka": 935,
      "brina": 935,
      "ghiaccio": 935,
      "otter": 935,
      "walnut": 935,
      "sabbia": 935
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1371,
      "tortora": 1735,
      "soft": 1766,
      "dark": 1987,
      "metal": 2260,
      "nodato": 1933,
      "vanilla": 1933,
      "olmo": 1933,
      "jazz": 1933,
      "blond": 1933,
      "carruba": 1933,
      "sesamo": 1933,
      "coloroc": 2265,
      "masai": 2265,
      "sigaro": 2265,
      "cenere": 2265,
      "tabacco": 2332,
      "canaletto": 2078,
      "moka": 1148,
      "brina": 1148,
      "ghiaccio": 1148,
      "otter": 1148,
      "walnut": 1148,
      "sabbia": 1148
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 1782,
      "tortora": 2217,
      "soft": 2255,
      "dark": 2564,
      "metal": 2848,
      "nodato": 2541,
      "vanilla": 2541,
      "olmo": 2541,
      "jazz": 2541,
      "blond": 2541,
      "carruba": 2541,
      "sesamo": 2541,
      "coloroc": 2899,
      "masai": 2899,
      "sigaro": 2899,
      "cenere": 2899,
      "tabacco": 2982,
      "canaletto": 2673
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 1870,
      "tortora": 2338,
      "soft": 2379,
      "dark": 2717,
      "metal": 3062,
      "nodato": 2679,
      "vanilla": 2679,
      "olmo": 2679,
      "jazz": 2679,
      "blond": 2679,
      "carruba": 2679,
      "sesamo": 2679,
      "coloroc": 3077,
      "masai": 3077,
      "sigaro": 3077,
      "cenere": 3077,
      "tabacco": 3129,
      "canaletto": 2814
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1237,
      "tortora": 1616,
      "soft": 1619,
      "dark": 1833,
      "metal": 2057,
      "nodato": 1677,
      "vanilla": 1677,
      "olmo": 1677,
      "jazz": 1677,
      "blond": 1677,
      "carruba": 1677,
      "sesamo": 1677,
      "coloroc": 2037,
      "masai": 2037,
      "sigaro": 2037,
      "cenere": 2037,
      "tabacco": 2048,
      "canaletto": 1832
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1483,
      "tortora": 1918,
      "soft": 1953,
      "dark": 2173,
      "metal": 2450,
      "nodato": 2017,
      "vanilla": 2017,
      "olmo": 2017,
      "jazz": 2017,
      "blond": 2017,
      "carruba": 2017,
      "sesamo": 2017,
      "coloroc": 2412,
      "masai": 2412,
      "sigaro": 2412,
      "cenere": 2412,
      "tabacco": 2437,
      "canaletto": 2171
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 1954,
      "tortora": 2630,
      "soft": 2678,
      "dark": 2844,
      "metal": 3297,
      "nodato": 2666,
      "vanilla": 2666,
      "olmo": 2666,
      "jazz": 2666,
      "blond": 2666,
      "carruba": 2666,
      "sesamo": 2666,
      "coloroc": 3028,
      "masai": 3028,
      "sigaro": 3028,
      "cenere": 3028,
      "tabacco": 3114,
      "canaletto": 2850
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2120,
      "tortora": 2780,
      "soft": 2831,
      "dark": 3019,
      "metal": 3487,
      "nodato": 2887,
      "vanilla": 2887,
      "olmo": 2887,
      "jazz": 2887,
      "blond": 2887,
      "carruba": 2887,
      "sesamo": 2887,
      "coloroc": 3296,
      "masai": 3296,
      "sigaro": 3296,
      "cenere": 3296,
      "tabacco": 3350,
      "canaletto": 3137
    }
  },
  {
    model: "ONGA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1641,
      "soft": 1957,
      "dark": 2122,
      "metal": 2345
    }
  },
  {
    model: "ONGA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1864,
      "soft": 2274,
      "dark": 2468,
      "metal": 2738
    }
  },
  {
    model: "ONGA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2457,
      "soft": 2914,
      "dark": 3149,
      "metal": 3479
    }
  },
  {
    model: "ONGA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2632,
      "soft": 3124,
      "dark": 3381,
      "metal": 3723
    }
  },
  {
    model: "OPEN 01 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1738,
      "soft": 2093
    }
  },
  {
    model: "OPEN 01 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2011,
      "soft": 2433
    }
  },
  {
    model: "OPEN 01 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2548,
      "soft": 3049
    }
  },
  {
    model: "OPEN 01 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1631,
      "soft": 1985
    }
  },
  {
    model: "OPEN 01 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1887,
      "soft": 2307
    }
  },
  {
    model: "OPEN 01 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2400,
      "soft": 2902
    }
  },
  {
    model: "OPEN 01 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1985,
      "soft": 2213
    }
  },
  {
    model: "OPEN 01 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2298,
      "soft": 2571
    }
  },
  {
    model: "OPEN 01 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2887,
      "soft": 3215
    }
  },
  {
    model: "OPEN 01 VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1881,
      "soft": 2109
    }
  },
  {
    model: "OPEN 01 VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2217,
      "soft": 2495
    }
  },
  {
    model: "OPEN 01 VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2794,
      "soft": 3128
    }
  },
  {
    model: "OPEN 08 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1574,
      "soft": 1914
    }
  },
  {
    model: "OPEN 08 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1853,
      "soft": 2262
    }
  },
  {
    model: "OPEN 08 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2320,
      "soft": 2800
    }
  },
  {
    model: "OPEN 08 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1491,
      "soft": 1830
    }
  },
  {
    model: "OPEN 08 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1754,
      "soft": 2164
    }
  },
  {
    model: "OPEN 08 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2205,
      "soft": 2685
    }
  },
  {
    model: "OPEN 08 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1754,
      "soft": 2095
    }
  },
  {
    model: "OPEN 08 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2065,
      "soft": 2475
    }
  },
  {
    model: "OPEN 08 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2568,
      "soft": 3048
    }
  },
  {
    model: "OPEN 15 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1539,
      "soft": 1763
    }
  },
  {
    model: "OPEN 15 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1814,
      "soft": 2088
    }
  },
  {
    model: "OPEN 15 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2313,
      "soft": 2641
    }
  },
  {
    model: "OPEN 15 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1539,
      "soft": 1763
    }
  },
  {
    model: "OPEN 15 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1814,
      "soft": 2088
    }
  },
  {
    model: "OPEN 15 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2313,
      "soft": 2641
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1624,
      "soft": 1786,
      "dark": 1896
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1965,
      "soft": 2164,
      "dark": 2299
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 1886,
      "soft": 2084,
      "dark": 2219
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2668,
      "soft": 2942,
      "dark": 3129
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1783,
      "soft": 2132,
      "dark": 2295,
      "metal": 2551
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2103,
      "soft": 2527,
      "dark": 2769,
      "metal": 3034
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2756,
      "soft": 3273,
      "dark": 3556,
      "metal": 3874
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2960,
      "soft": 3522,
      "dark": 3833,
      "metal": 4162
    }
  },
  {
    model: "PALLADIO 121 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1484,
      "soft": 1793
    }
  },
  {
    model: "PALLADIO 121 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1747,
      "soft": 2119
    }
  },
  {
    model: "PALLADIO 121 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2237,
      "soft": 2680
    }
  },
  {
    model: "PALLADIO 122 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1484,
      "soft": 1793
    }
  },
  {
    model: "PALLADIO 122 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1747,
      "soft": 2119
    }
  },
  {
    model: "PALLADIO 122 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2237,
      "soft": 2680
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1550,
      "soft": 1849,
      "dark": 2005,
      "metal": 2217
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1826,
      "soft": 2189,
      "dark": 2417,
      "metal": 2683
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2362,
      "soft": 2804,
      "dark": 3083,
      "metal": 3407
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2530,
      "soft": 3004,
      "dark": 3311,
      "metal": 3646
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1644,
      "soft": 2004,
      "dark": 2159,
      "metal": 2501
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1937,
      "soft": 2372,
      "dark": 2558,
      "metal": 2974
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2601,
      "soft": 3128,
      "dark": 3354,
      "metal": 3805
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2781,
      "soft": 3357,
      "dark": 3602,
      "metal": 4074
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1438,
      "tortora": 1864,
      "soft": 1890,
      "dark": 2105,
      "metal": 2296,
      "nodato": 2026,
      "vanilla": 2026,
      "olmo": 2026,
      "jazz": 2026,
      "blond": 2026,
      "carruba": 2026,
      "sesamo": 2026,
      "coloroc": 2303,
      "masai": 2303,
      "sigaro": 2303,
      "cenere": 2303,
      "tabacco": 2348,
      "canaletto": 2144
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1770,
      "tortora": 2134,
      "soft": 2165,
      "dark": 2386,
      "metal": 2659,
      "nodato": 2332,
      "vanilla": 2332,
      "olmo": 2332,
      "jazz": 2332,
      "blond": 2332,
      "carruba": 2332,
      "sesamo": 2332,
      "coloroc": 2664,
      "masai": 2664,
      "sigaro": 2664,
      "cenere": 2664,
      "tabacco": 2731,
      "canaletto": 2477
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2181,
      "tortora": 2616,
      "soft": 2654,
      "dark": 2963,
      "metal": 3247,
      "nodato": 2940,
      "vanilla": 2940,
      "olmo": 2940,
      "jazz": 2940,
      "blond": 2940,
      "carruba": 2940,
      "sesamo": 2940,
      "coloroc": 3298,
      "masai": 3298,
      "sigaro": 3298,
      "cenere": 3298,
      "tabacco": 3381,
      "canaletto": 3072
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2269,
      "tortora": 2737,
      "soft": 2778,
      "dark": 3116,
      "metal": 3461,
      "nodato": 3078,
      "vanilla": 3078,
      "olmo": 3078,
      "jazz": 3078,
      "blond": 3078,
      "carruba": 3078,
      "sesamo": 3078,
      "coloroc": 3476,
      "masai": 3476,
      "sigaro": 3476,
      "cenere": 3476,
      "tabacco": 3528,
      "canaletto": 3213
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1636,
      "tortora": 2015,
      "soft": 2018,
      "dark": 2232,
      "metal": 2456,
      "nodato": 2076,
      "vanilla": 2076,
      "olmo": 2076,
      "jazz": 2076,
      "blond": 2076,
      "carruba": 2076,
      "sesamo": 2076,
      "coloroc": 2436,
      "masai": 2436,
      "sigaro": 2436,
      "cenere": 2436,
      "tabacco": 2447,
      "canaletto": 2231
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1882,
      "tortora": 2317,
      "soft": 2352,
      "dark": 2572,
      "metal": 2849,
      "nodato": 2416,
      "vanilla": 2416,
      "olmo": 2416,
      "jazz": 2416,
      "blond": 2416,
      "carruba": 2416,
      "sesamo": 2416,
      "coloroc": 2811,
      "masai": 2811,
      "sigaro": 2811,
      "cenere": 2811,
      "tabacco": 2836,
      "canaletto": 2570
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2353,
      "tortora": 3029,
      "soft": 3077,
      "dark": 3243,
      "metal": 3696,
      "nodato": 3065,
      "vanilla": 3065,
      "olmo": 3065,
      "jazz": 3065,
      "blond": 3065,
      "carruba": 3065,
      "sesamo": 3065,
      "coloroc": 3427,
      "masai": 3427,
      "sigaro": 3427,
      "cenere": 3427,
      "tabacco": 3513,
      "canaletto": 3249
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2519,
      "tortora": 3179,
      "soft": 3230,
      "dark": 3418,
      "metal": 3886,
      "nodato": 3286,
      "vanilla": 3286,
      "olmo": 3286,
      "jazz": 3286,
      "blond": 3286,
      "carruba": 3286,
      "sesamo": 3286,
      "coloroc": 3695,
      "masai": 3695,
      "sigaro": 3695,
      "cenere": 3695,
      "tabacco": 3749,
      "canaletto": 3536
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1638,
      "tortora": 2064,
      "soft": 2090,
      "dark": 2305,
      "metal": 2496,
      "nodato": 2226,
      "vanilla": 2226,
      "olmo": 2226,
      "jazz": 2226,
      "blond": 2226,
      "carruba": 2226,
      "sesamo": 2226,
      "coloroc": 2503,
      "masai": 2503,
      "sigaro": 2503,
      "cenere": 2503,
      "tabacco": 2548,
      "canaletto": 2344
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1970,
      "tortora": 2334,
      "soft": 2365,
      "dark": 2586,
      "metal": 2859,
      "nodato": 2532,
      "vanilla": 2532,
      "olmo": 2532,
      "jazz": 2532,
      "blond": 2532,
      "carruba": 2532,
      "sesamo": 2532,
      "coloroc": 2864,
      "masai": 2864,
      "sigaro": 2864,
      "cenere": 2864,
      "tabacco": 2931,
      "canaletto": 2677
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2381,
      "tortora": 2816,
      "soft": 2854,
      "dark": 3163,
      "metal": 3447,
      "nodato": 3140,
      "vanilla": 3140,
      "olmo": 3140,
      "jazz": 3140,
      "blond": 3140,
      "carruba": 3140,
      "sesamo": 3140,
      "coloroc": 3498,
      "masai": 3498,
      "sigaro": 3498,
      "cenere": 3498,
      "tabacco": 3581,
      "canaletto": 3272
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2469,
      "tortora": 2937,
      "soft": 2978,
      "dark": 3316,
      "metal": 3661,
      "nodato": 3278,
      "vanilla": 3278,
      "olmo": 3278,
      "jazz": 3278,
      "blond": 3278,
      "carruba": 3278,
      "sesamo": 3278,
      "coloroc": 3676,
      "masai": 3676,
      "sigaro": 3676,
      "cenere": 3676,
      "tabacco": 3728,
      "canaletto": 3413
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1836,
      "tortora": 2215,
      "soft": 2218,
      "dark": 2432,
      "metal": 2656,
      "nodato": 2276,
      "vanilla": 2276,
      "olmo": 2276,
      "jazz": 2276,
      "blond": 2276,
      "carruba": 2276,
      "sesamo": 2276,
      "coloroc": 2636,
      "masai": 2636,
      "sigaro": 2636,
      "cenere": 2636,
      "tabacco": 2647,
      "canaletto": 2431
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2082,
      "tortora": 2517,
      "soft": 2552,
      "dark": 2772,
      "metal": 3049,
      "nodato": 2616,
      "vanilla": 2616,
      "olmo": 2616,
      "jazz": 2616,
      "blond": 2616,
      "carruba": 2616,
      "sesamo": 2616,
      "coloroc": 3011,
      "masai": 3011,
      "sigaro": 3011,
      "cenere": 3011,
      "tabacco": 3036,
      "canaletto": 2770
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2553,
      "tortora": 3229,
      "soft": 3277,
      "dark": 3443,
      "metal": 3896,
      "nodato": 3265,
      "vanilla": 3265,
      "olmo": 3265,
      "jazz": 3265,
      "blond": 3265,
      "carruba": 3265,
      "sesamo": 3265,
      "coloroc": 3627,
      "masai": 3627,
      "sigaro": 3627,
      "cenere": 3627,
      "tabacco": 3713,
      "canaletto": 3449
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2719,
      "tortora": 3379,
      "soft": 3430,
      "dark": 3618,
      "metal": 4086,
      "nodato": 3486,
      "vanilla": 3486,
      "olmo": 3486,
      "jazz": 3486,
      "blond": 3486,
      "carruba": 3486,
      "sesamo": 3486,
      "coloroc": 3895,
      "masai": 3895,
      "sigaro": 3895,
      "cenere": 3895,
      "tabacco": 3949,
      "canaletto": 3736
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1550,
      "tortora": 1666,
      "soft": 1849,
      "dark": 2005,
      "metal": 2217
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1826,
      "tortora": 2021,
      "soft": 2189,
      "dark": 2417,
      "metal": 2683
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2362,
      "soft": 2804,
      "dark": 3083,
      "metal": 3407
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2530,
      "soft": 3004,
      "dark": 3311,
      "metal": 3646
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1644,
      "soft": 2004,
      "dark": 2159,
      "metal": 2501
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1937,
      "soft": 2372,
      "dark": 2558,
      "metal": 2974
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2601,
      "soft": 3128,
      "dark": 3354,
      "metal": 3805
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2781,
      "soft": 3357,
      "dark": 3602,
      "metal": 4074
    }
  },
  {
    model: "RIALTO PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1894,
      "soft": 2179,
      "metal": 2479
    }
  },
  {
    model: "RIALTO PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2238,
      "soft": 2583,
      "metal": 2953
    }
  },
  {
    model: "RIALTO PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2865,
      "soft": 3285,
      "metal": 3736
    }
  },
  {
    model: "RIALTO PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 2152,
      "soft": 2488,
      "metal": 2585
    }
  },
  {
    model: "RIALTO PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2363,
      "soft": 2740,
      "metal": 3080
    }
  },
  {
    model: "RIALTO PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 3017,
      "soft": 3475,
      "metal": 3959
    }
  },
  {
    model: "RIALTO PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1894,
      "soft": 2179,
      "metal": 2479
    }
  },
  {
    model: "RIALTO PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2238,
      "soft": 2583,
      "metal": 2953
    }
  },
  {
    model: "RIALTO PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2865,
      "soft": 3285,
      "metal": 3736
    }
  },
  {
    model: "RLL",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1906,
      "soft": 2180
    }
  },
  {
    model: "RLL",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2295,
      "soft": 2628
    }
  },
  {
    model: "RVU (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1698,
      "soft": 2043,
      "dark": 2191,
      "nodato": 2281,
      "vanilla": 2281,
      "olmo": 2281,
      "jazz": 2281,
      "blond": 2281,
      "carruba": 2281,
      "sesamo": 2281,
      "coloroc": 2503,
      "masai": 2503,
      "sigaro": 2503,
      "cenere": 2503,
      "tabacco": 2577,
      "canaletto": 2424,
      "moka": 1486,
      "brina": 1486,
      "ghiaccio": 1486,
      "otter": 1486,
      "walnut": 1486,
      "sabbia": 1486
    }
  },
  {
    model: "RVU (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2036,
      "soft": 2417,
      "dark": 2529,
      "nodato": 2905,
      "vanilla": 2905,
      "olmo": 2905,
      "jazz": 2905,
      "blond": 2905,
      "carruba": 2905,
      "sesamo": 2905,
      "coloroc": 3170,
      "masai": 3170,
      "sigaro": 3170,
      "cenere": 3170,
      "tabacco": 3438,
      "canaletto": 3080,
      "moka": 1834,
      "brina": 1834,
      "ghiaccio": 1834,
      "otter": 1834,
      "walnut": 1834,
      "sabbia": 1834
    }
  },
  {
    model: "RVU (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2579,
      "soft": 3035,
      "dark": 3246,
      "nodato": 3379,
      "vanilla": 3379,
      "olmo": 3379,
      "jazz": 3379,
      "blond": 3379,
      "carruba": 3379,
      "sesamo": 3379,
      "coloroc": 3696,
      "masai": 3696,
      "sigaro": 3696,
      "cenere": 3696,
      "tabacco": 4018,
      "canaletto": 3589
    }
  },
  {
    model: "RVU (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2772,
      "soft": 3263,
      "dark": 3493,
      "nodato": 3634,
      "vanilla": 3634,
      "olmo": 3634,
      "jazz": 3634,
      "blond": 3634,
      "carruba": 3634,
      "sesamo": 3634,
      "coloroc": 3980,
      "masai": 3980,
      "sigaro": 3980,
      "cenere": 3980,
      "tabacco": 4302,
      "canaletto": 3853
    }
  },
  {
    model: "RVU G (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1989,
      "soft": 2308,
      "nodato": 2564,
      "vanilla": 2564,
      "olmo": 2564,
      "jazz": 2564,
      "blond": 2564,
      "carruba": 2564,
      "sesamo": 2564,
      "coloroc": 2785,
      "masai": 2785,
      "sigaro": 2785,
      "cenere": 2785
    }
  },
  {
    model: "RVU G (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 2343,
      "soft": 2731,
      "nodato": 3237,
      "vanilla": 3237,
      "olmo": 3237,
      "jazz": 3237,
      "blond": 3237,
      "carruba": 3237,
      "sesamo": 3237,
      "coloroc": 3502,
      "masai": 3502,
      "sigaro": 3502,
      "cenere": 3502
    }
  },
  {
    model: "RVU G (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2946,
      "soft": 3407,
      "nodato": 3775,
      "vanilla": 3775,
      "olmo": 3775,
      "jazz": 3775,
      "blond": 3775,
      "carruba": 3775,
      "sesamo": 3775,
      "coloroc": 4091,
      "masai": 4091,
      "sigaro": 4091,
      "cenere": 4091
    }
  },
  {
    model: "RVU G (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 3190,
      "soft": 3687,
      "nodato": 4085,
      "vanilla": 4085,
      "olmo": 4085,
      "jazz": 4085,
      "blond": 4085,
      "carruba": 4085,
      "sesamo": 4085,
      "coloroc": 4431,
      "masai": 4431,
      "sigaro": 4431,
      "cenere": 4431
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1550,
      "tortora": 1666,
      "soft": 1849,
      "dark": 2005,
      "metal": 2217
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1826,
      "tortora": 2021,
      "soft": 2189,
      "dark": 2417,
      "metal": 2683
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2362,
      "soft": 2804,
      "dark": 3083,
      "metal": 3407
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2530,
      "soft": 3004,
      "dark": 3311,
      "metal": 3646
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1644,
      "soft": 2004,
      "dark": 2159,
      "metal": 2501
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1937,
      "soft": 2372,
      "dark": 2558,
      "metal": 2974
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2601,
      "soft": 3128,
      "dark": 3354,
      "metal": 3805
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2781,
      "soft": 3357,
      "dark": 3602,
      "metal": 4074
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1550,
      "soft": 1849,
      "dark": 2005,
      "metal": 2217
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1826,
      "soft": 2189,
      "dark": 2417,
      "metal": 2683
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2362,
      "soft": 2804,
      "dark": 3083,
      "metal": 3407
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2530,
      "soft": 3004,
      "dark": 3311,
      "metal": 3646
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1644,
      "soft": 2004,
      "dark": 2159,
      "metal": 2501
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1937,
      "soft": 2372,
      "dark": 2558,
      "metal": 2974
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2601,
      "soft": 3128,
      "dark": 3354,
      "metal": 3805
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2781,
      "soft": 3357,
      "dark": 3602,
      "metal": 4074
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "moka": 1092,
      "brina": 1092,
      "ghiaccio": 1092,
      "otter": 1092,
      "walnut": 1092,
      "sabbia": 1092
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "moka": 1285,
      "brina": 1285,
      "ghiaccio": 1285,
      "otter": 1285,
      "walnut": 1285,
      "sabbia": 1285
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "moka": 1586,
      "brina": 1586,
      "ghiaccio": 1586,
      "otter": 1586,
      "walnut": 1586,
      "sabbia": 1586
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "moka": 1678,
      "brina": 1678,
      "ghiaccio": 1678,
      "otter": 1678,
      "walnut": 1678,
      "sabbia": 1678
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "moka": 1643,
      "brina": 1643,
      "ghiaccio": 1643,
      "otter": 1643,
      "walnut": 1643,
      "sabbia": 1643
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "moka": 1971,
      "brina": 1971,
      "ghiaccio": 1971,
      "otter": 1971,
      "walnut": 1971,
      "sabbia": 1971
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "moka": 2272,
      "brina": 2272,
      "ghiaccio": 2272,
      "otter": 2272,
      "walnut": 2272,
      "sabbia": 2272
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "moka": 2364,
      "brina": 2364,
      "ghiaccio": 2364,
      "otter": 2364,
      "walnut": 2364,
      "sabbia": 2364
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "moka": 1266,
      "brina": 1266,
      "ghiaccio": 1266,
      "otter": 1266,
      "walnut": 1266,
      "sabbia": 1266
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "moka": 1497,
      "brina": 1497,
      "ghiaccio": 1497,
      "otter": 1497,
      "walnut": 1497,
      "sabbia": 1497
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "moka": 1841,
      "brina": 1841,
      "ghiaccio": 1841,
      "otter": 1841,
      "walnut": 1841,
      "sabbia": 1841
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "moka": 1965,
      "brina": 1965,
      "ghiaccio": 1965,
      "otter": 1965,
      "walnut": 1965,
      "sabbia": 1965
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "moka": 1817,
      "brina": 1817,
      "ghiaccio": 1817,
      "otter": 1817,
      "walnut": 1817,
      "sabbia": 1817
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "moka": 2183,
      "brina": 2183,
      "ghiaccio": 2183,
      "otter": 2183,
      "walnut": 2183,
      "sabbia": 2183
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "moka": 2527,
      "brina": 2527,
      "ghiaccio": 2527,
      "otter": 2527,
      "walnut": 2527,
      "sabbia": 2527
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "moka": 2651,
      "brina": 2651,
      "ghiaccio": 2651,
      "otter": 2651,
      "walnut": 2651,
      "sabbia": 2651
    }
  },
  {
    model: "QUADRO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1903,
      "soft": 2181,
      "dark": 2319,
      "metal": 2385
    }
  },
  {
    model: "QUADRO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1823,
      "soft": 2102,
      "dark": 2239,
      "metal": 2305
    }
  },
  {
    model: "QUADRO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2696,
      "soft": 3080,
      "dark": 3269,
      "metal": 3360
    }
  },
  {
    model: "QUADRO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "blanc": 3804,
      "soft": 4220,
      "dark": 4425,
      "metal": 4524
    }
  },
  {
    model: "QUADRO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "blanc": 5202,
      "soft": 5691,
      "dark": 5933,
      "metal": 6049
    }
  },
  {
    model: "QUADRO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2696,
      "soft": 3080,
      "dark": 3269,
      "metal": 3360
    }
  },
  {
    model: "TRATTO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "blanc": 1631,
      "soft": 1771,
      "dark": 1881,
      "metal": 1968
    }
  },
  {
    model: "TRATTO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1903,
      "soft": 2181,
      "dark": 2319,
      "metal": 2385
    }
  },
  {
    model: "TRATTO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "blanc": 1823,
      "soft": 2102,
      "dark": 2239,
      "metal": 2305
    }
  },
  {
    model: "TRATTO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "blanc": 2696,
      "soft": 3080,
      "dark": 3269,
      "metal": 3360
    }
  },
  {
    model: "TRATTO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3010-to-3400-height",
    finishes: {
      "blanc": 3804,
      "soft": 4220,
      "dark": 4425,
      "metal": 4524
    }
  },
  {
    model: "TRATTO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3410-to-4000-height",
    finishes: {
      "blanc": 5202,
      "soft": 5691,
      "dark": 5933,
      "metal": 6049
    }
  },
  {
    model: "TRATTO",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "blanc": 2696,
      "soft": 3080,
      "dark": 3269,
      "metal": 3360
    }
  },
  {
    model: "WAVE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2100-height",
    finishes: {
      "jazz": 2342,
      "canaletto": 2342
    }
  },
  {
    model: "WAVE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2400-height",
    finishes: {
      "jazz": 2765,
      "canaletto": 2765
    }
  },
  {
    model: "WAVE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "2700-height",
    finishes: {
      "jazz": 3748,
      "canaletto": 3748
    }
  },
  {
    model: "WAVE",
    frame: "secret-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "3000-height",
    finishes: {
      "jazz": 3748,
      "canaletto": 3748
    }
  },
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1976,
      "tortora": 2340,
      "soft": 2371,
      "dark": 2592,
      "metal": 2865,
      "nodato": 2538,
      "vanilla": 2538,
      "olmo": 2538,
      "jazz": 2538,
      "blond": 2538,
      "carruba": 2538,
      "sesamo": 2538,
      "coloroc": 2870,
      "masai": 2870,
      "sigaro": 2870,
      "cenere": 2870,
      "tabacco": 2937,
      "canaletto": 2683
    }
  },
  {
    model: "2Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2088,
      "tortora": 2523,
      "soft": 2558,
      "dark": 2778,
      "metal": 3055,
      "nodato": 2622,
      "vanilla": 2622,
      "olmo": 2622,
      "jazz": 2622,
      "blond": 2622,
      "carruba": 2622,
      "sesamo": 2622,
      "coloroc": 3017,
      "masai": 3017,
      "sigaro": 3017,
      "cenere": 3017,
      "tabacco": 3042,
      "canaletto": 2776
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1938,
      "soft": 2301,
      "dark": 2529,
      "metal": 2795
    }
  },
  {
    model: "AURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2049,
      "soft": 2484,
      "dark": 2670,
      "metal": 3086
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2106,
      "soft": 2458,
      "dark": 2697,
      "metal": 2963
    }
  },
  {
    model: "COLONIALE",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2215,
      "soft": 2639,
      "dark": 2881,
      "metal": 3146
    }
  },
  {
    model: "DOGE PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2464,
      "soft": 2809,
      "metal": 3179
    }
  },
  {
    model: "DOGE PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2589,
      "soft": 2822,
      "metal": 3304
    }
  },
  {
    model: "DOGE PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2464,
      "soft": 2809,
      "metal": 3179
    }
  },
  {
    model: "DOGE VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2420,
      "soft": 2592,
      "metal": 2891
    }
  },
  {
    model: "DOGE VPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2420,
      "soft": 2592,
      "metal": 2891
    }
  },
  {
    model: "DOGE VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2420,
      "soft": 2592,
      "metal": 2891
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2106,
      "soft": 2458,
      "dark": 2697,
      "metal": 2963
    }
  },
  {
    model: "EAN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2215,
      "soft": 2639,
      "dark": 2881,
      "metal": 3146
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2545,
      "soft": 3003
    }
  },
  {
    model: "ESPRIT PP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2630,
      "soft": 3109
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2545,
      "soft": 3003
    }
  },
  {
    model: "ESPRIT PPP",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2630,
      "soft": 3109
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2545,
      "soft": 3003
    }
  },
  {
    model: "ESPRIT PU",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2630,
      "soft": 3109
    }
  },
  {
    model: "GIOTTO 02 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1871,
      "soft": 2248
    }
  },
  {
    model: "GIOTTO 02 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1817,
      "soft": 2194
    }
  },
  {
    model: "GIOTTO 02 VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2138,
      "soft": 2536
    }
  },
  {
    model: "GIOTTO 11G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2056,
      "soft": 2302
    }
  },
  {
    model: "GIOTTO 12G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2056,
      "soft": 2302
    }
  },
  {
    model: "GIOTTO 13G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2056,
      "soft": 2302
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1656,
      "tortora": 2020,
      "soft": 2051,
      "dark": 2272,
      "metal": 2545,
      "nodato": 2218,
      "vanilla": 2218,
      "olmo": 2218,
      "jazz": 2218,
      "blond": 2218,
      "carruba": 2218,
      "sesamo": 2218,
      "coloroc": 2550,
      "masai": 2550,
      "sigaro": 2550,
      "cenere": 2550,
      "tabacco": 2617,
      "canaletto": 2363
    }
  },
  {
    model: "I1",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1768,
      "tortora": 2203,
      "soft": 2238,
      "dark": 2458,
      "metal": 2735,
      "nodato": 2302,
      "vanilla": 2302,
      "olmo": 2302,
      "jazz": 2302,
      "blond": 2302,
      "carruba": 2302,
      "sesamo": 2302,
      "coloroc": 2697,
      "masai": 2697,
      "sigaro": 2697,
      "cenere": 2697,
      "tabacco": 2722,
      "canaletto": 2456
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1788,
      "tortora": 2152,
      "soft": 2183,
      "dark": 2404,
      "metal": 2677,
      "nodato": 2350,
      "vanilla": 2350,
      "olmo": 2350,
      "jazz": 2350,
      "blond": 2350,
      "carruba": 2350,
      "sesamo": 2350,
      "coloroc": 2682,
      "masai": 2682,
      "sigaro": 2682,
      "cenere": 2682,
      "tabacco": 2749,
      "canaletto": 2495
    }
  },
  {
    model: "I2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1900,
      "tortora": 2335,
      "soft": 2370,
      "dark": 2590,
      "metal": 2867,
      "nodato": 2434,
      "vanilla": 2434,
      "olmo": 2434,
      "jazz": 2434,
      "blond": 2434,
      "carruba": 2434,
      "sesamo": 2434,
      "coloroc": 2829,
      "masai": 2829,
      "sigaro": 2829,
      "cenere": 2829,
      "tabacco": 2854,
      "canaletto": 2588
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 2108,
      "vanilla": 2108,
      "olmo": 2108,
      "jazz": 2108,
      "blond": 2108,
      "carruba": 2108,
      "sesamo": 2108,
      "coloroc": 2440,
      "masai": 2440,
      "sigaro": 2440,
      "cenere": 2440,
      "tabacco": 2507,
      "canaletto": 2253
    }
  },
  {
    model: "KIN",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 2192,
      "vanilla": 2192,
      "olmo": 2192,
      "jazz": 2192,
      "blond": 2192,
      "carruba": 2192,
      "sesamo": 2192,
      "coloroc": 2587,
      "masai": 2587,
      "sigaro": 2587,
      "cenere": 2587,
      "tabacco": 2612,
      "canaletto": 2346
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 2204,
      "vanilla": 2204,
      "olmo": 2204,
      "jazz": 2204,
      "blond": 2204,
      "carruba": 2204,
      "sesamo": 2204,
      "coloroc": 2536,
      "masai": 2536,
      "sigaro": 2536,
      "cenere": 2536,
      "tabacco": 2603,
      "canaletto": 2349
    }
  },
  {
    model: "KV",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "nodato": 2288,
      "vanilla": 2288,
      "olmo": 2288,
      "jazz": 2288,
      "blond": 2288,
      "carruba": 2288,
      "sesamo": 2288,
      "coloroc": 2683,
      "masai": 2683,
      "sigaro": 2683,
      "cenere": 2683,
      "tabacco": 2708,
      "canaletto": 2442
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2106,
      "soft": 2458,
      "dark": 2697,
      "metal": 2963
    }
  },
  {
    model: "LUCIO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2215,
      "soft": 2639,
      "dark": 2881,
      "metal": 3146
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1483,
      "tortora": 1847,
      "soft": 1878,
      "dark": 2099,
      "metal": 2372,
      "nodato": 2045,
      "vanilla": 2045,
      "olmo": 2045,
      "jazz": 2045,
      "blond": 2045,
      "carruba": 2045,
      "sesamo": 2045,
      "coloroc": 2377,
      "masai": 2377,
      "sigaro": 2377,
      "cenere": 2377,
      "tabacco": 2444,
      "canaletto": 2190,
      "moka": 1260,
      "brina": 1260,
      "ghiaccio": 1260,
      "otter": 1260,
      "walnut": 1260,
      "sabbia": 1260
    }
  },
  {
    model: "ON",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1595,
      "tortora": 2030,
      "soft": 2065,
      "dark": 2285,
      "metal": 2562,
      "nodato": 2129,
      "vanilla": 2129,
      "olmo": 2129,
      "jazz": 2129,
      "blond": 2129,
      "carruba": 2129,
      "sesamo": 2129,
      "coloroc": 2524,
      "masai": 2524,
      "sigaro": 2524,
      "cenere": 2524,
      "tabacco": 2549,
      "canaletto": 2283
    }
  },
  {
    model: "ONGA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1976,
      "soft": 2386,
      "dark": 2580,
      "metal": 2850
    }
  },
  {
    model: "OPEN 01 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2123,
      "soft": 2545
    }
  },
  {
    model: "OPEN 01 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1999,
      "soft": 2419
    }
  },
  {
    model: "OPEN 01 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2410,
      "soft": 2683
    }
  },
  {
    model: "OPEN 01 VU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2329,
      "soft": 2607
    }
  },
  {
    model: "OPEN 08 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1965,
      "soft": 2374
    }
  },
  {
    model: "OPEN 08 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1866,
      "soft": 2276
    }
  },
  {
    model: "OPEN 08 VP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2177,
      "soft": 2587
    }
  },
  {
    model: "OPEN 15 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1926,
      "soft": 2200
    }
  },
  {
    model: "OPEN 15 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1926,
      "soft": 2200
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2077,
      "soft": 2276,
      "dark": 2411
    }
  },
  {
    model: "OPEN G",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2215,
      "soft": 2639,
      "dark": 2881,
      "metal": 3146
    }
  },
  {
    model: "PALLADIO 121 PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1859,
      "soft": 2231
    }
  },
  {
    model: "PALLADIO 122 PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1859,
      "soft": 2231
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1938,
      "soft": 2301,
      "dark": 2529,
      "metal": 2795
    }
  },
  {
    model: "PURA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2049,
      "soft": 2484,
      "dark": 2670,
      "metal": 3086
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1882,
      "tortora": 2246,
      "soft": 2277,
      "dark": 2498,
      "metal": 2771,
      "nodato": 2444,
      "vanilla": 2444,
      "olmo": 2444,
      "jazz": 2444,
      "blond": 2444,
      "carruba": 2444,
      "sesamo": 2444,
      "coloroc": 2776,
      "masai": 2776,
      "sigaro": 2776,
      "cenere": 2776,
      "tabacco": 2843,
      "canaletto": 2589
    }
  },
  {
    model: "Q2",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1994,
      "tortora": 2429,
      "soft": 2464,
      "dark": 2684,
      "metal": 2961,
      "nodato": 2528,
      "vanilla": 2528,
      "olmo": 2528,
      "jazz": 2528,
      "blond": 2528,
      "carruba": 2528,
      "sesamo": 2528,
      "coloroc": 2923,
      "masai": 2923,
      "sigaro": 2923,
      "cenere": 2923,
      "tabacco": 2948,
      "canaletto": 2682
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2082,
      "tortora": 2446,
      "soft": 2477,
      "dark": 2698,
      "metal": 2971,
      "nodato": 2644,
      "vanilla": 2644,
      "olmo": 2644,
      "jazz": 2644,
      "blond": 2644,
      "carruba": 2644,
      "sesamo": 2644,
      "coloroc": 2976,
      "masai": 2976,
      "sigaro": 2976,
      "cenere": 2976,
      "tabacco": 3043,
      "canaletto": 2789
    }
  },
  {
    model: "Q3",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2194,
      "tortora": 2629,
      "soft": 2664,
      "dark": 2884,
      "metal": 3161,
      "nodato": 2728,
      "vanilla": 2728,
      "olmo": 2728,
      "jazz": 2728,
      "blond": 2728,
      "carruba": 2728,
      "sesamo": 2728,
      "coloroc": 3123,
      "masai": 3123,
      "sigaro": 3123,
      "cenere": 3123,
      "tabacco": 3148,
      "canaletto": 2882
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1938,
      "tortora": 2133,
      "soft": 2301,
      "dark": 2529,
      "metal": 2795
    }
  },
  {
    model: "QUADRO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2049,
      "soft": 2484,
      "dark": 2670,
      "metal": 3086
    }
  },
  {
    model: "RIALTO PP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2350,
      "soft": 2695,
      "metal": 3065
    }
  },
  {
    model: "RIALTO PPP",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2475,
      "soft": 2852,
      "metal": 3192
    }
  },
  {
    model: "RIALTO PU",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2350,
      "soft": 2695,
      "metal": 3065
    }
  },
  {
    model: "RLL",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2407,
      "soft": 2740
    }
  },
  {
    model: "RVU (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2148,
      "soft": 2529,
      "dark": 2641,
      "nodato": 3017,
      "vanilla": 3017,
      "olmo": 3017,
      "jazz": 3017,
      "blond": 3017,
      "carruba": 3017,
      "sesamo": 3017,
      "coloroc": 3282,
      "masai": 3282,
      "sigaro": 3282,
      "cenere": 3282,
      "tabacco": 3550,
      "canaletto": 3192,
      "moka": 1946,
      "brina": 1946,
      "ghiaccio": 1946,
      "otter": 1946,
      "walnut": 1946,
      "sabbia": 1946
    }
  },
  {
    model: "RVU G (TR)",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2455,
      "soft": 2843,
      "nodato": 3349,
      "vanilla": 3349,
      "olmo": 3349,
      "jazz": 3349,
      "blond": 3349,
      "carruba": 3349,
      "sesamo": 3349,
      "coloroc": 3614,
      "masai": 3614,
      "sigaro": 3614,
      "cenere": 3614
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1938,
      "tortora": 2133,
      "soft": 2301,
      "dark": 2529,
      "metal": 2795
    }
  },
  {
    model: "TRATTO",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2049,
      "soft": 2484,
      "dark": 2670,
      "metal": 3086
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 1938,
      "soft": 2301,
      "dark": 2529,
      "metal": 2795
    }
  },
  {
    model: "VENEZIA",
    frame: "wooden-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "blanc": 2049,
      "soft": 2484,
      "dark": 2670,
      "metal": 3086
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "moka": 1417,
      "brina": 1417,
      "ghiaccio": 1417,
      "otter": 1417,
      "walnut": 1417,
      "sabbia": 1417
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "45mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "moka": 2083,
      "brina": 2083,
      "ghiaccio": 2083,
      "otter": 2083,
      "walnut": 2083,
      "sabbia": 2083
    }
  },
  {
    model: "ON",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "moka": 1609,
      "brina": 1609,
      "ghiaccio": 1609,
      "otter": 1609,
      "walnut": 1609,
      "sabbia": 1609
    }
  },
  {
    model: "RVU (TR)",
    frame: "ng-frame",
    thickness: "60mm",
    width: "less-than-900mm",
    height: "between-2100-2400-height",
    finishes: {
      "moka": 2295,
      "brina": 2295,
      "ghiaccio": 2295,
      "otter": 2295,
      "walnut": 2295,
      "sabbia": 2295
    }
  }
];

const secretTwinSurcharge = {
  "2100-height": 148,
  "between-2100-2400-height": 148,
  "2400-height": 148,
  "2700-height": 184,
  "3000-height": 184,
  "3010-to-3400-height": 215,
  "3410-to-4000-height": 276
};

const doorFillingSurcharge = {
  "45mm": {
    "2100-height": 104,
    "between-2100-2400-height": 123,
    "2400-height": 123,
    "2700-height": 171,
    "3000-height": 171
  },
  "60mm": {
    "2100-height": 237,
    "between-2100-2400-height": 237,
    "2400-height": 237,
    "2700-height": 375,
    "3000-height": 375,
    "3010-to-3400-height": 375,
    "3410-to-4000-height": 375
  }
};

const hingeSurcharge = {
  "chrome-hinge": 0,
  "white-hinge": 67,
  "black-hinge": 58,
  "bronze-hinge": 100,
  "gold-hinge": 184
};

const doorHandlePrice = [
  {
    dhandle: "italia-door-handle",
    dhandlefinish: "polishedchrome-door-handle",
    lock: { "standard": 142, "privacy": 211 }
  },
  {
    dhandle: "italia-door-handle",
    dhandlefinish: "satinchrome-door-handle",
    lock: { "standard": 121, "privacy": 174 }
  },
  {
    dhandle: "italia-door-handle",
    dhandlefinish: "black-door-handle",
    lock: { "standard": 128, "privacy": 188 }
  },
  {
    dhandle: "robocinque-door-handle",
    dhandlefinish: "polishedchrome-door-handle",
    lock: { "standard": 144, "privacy": 230 }
  },
  {
    dhandle: "robocinque-door-handle",
    dhandlefinish: "satinchrome-door-handle",
    lock: { "standard": 167, "privacy": 264 }
  },
  {
    dhandle: "robocinque-door-handle",
    dhandlefinish: "black-door-handle",
    lock: { "standard": 137, "privacy": 218 }
  },
  {
    dhandle: "lama-door-handle",
    dhandlefinish: "polishedchrome-door-handle",
    lock: { "standard": 318, "privacy": 429 }
  },
  {
    dhandle: "lama-door-handle",
    dhandlefinish: "satinchrome-door-handle",
    lock: { "standard": 357, "privacy": 483 }
  },
  {
    dhandle: "lama-door-handle",
    dhandlefinish: "black-door-handle",
    lock: { "standard": 285, "privacy": 387 }
  },
  {
    dhandle: "lotus-door-handle",
    dhandlefinish: "polishedchrome-door-handle",
    lock: { "standard": 353, "privacy": 461 }
  },
  {
    dhandle: "lotus-door-handle",
    dhandlefinish: "satinchrome-door-handle",
    lock: { "standard": 392, "privacy": 517 }
  },
  {
    dhandle: "lotus-door-handle",
    dhandlefinish: "black-door-handle",
    lock: { "standard": 320, "privacy": 422 }
  }
]

const lockTypePrice = [
    {
      doorLock: "passage-lock",
      doorHandleFinish: {"polishedchrome-door-handle": 0,
      "satinchrome-door-handle": 0,
      "black-door-handle": 0
    }},
    {
      doorLock: "skeleton-key",
      doorHandleFinish: {"polishedchrome-door-handle": 0,
      "satinchrome-door-handle": 0,
      "black-door-handle": 0
    }},
    {
      doorLock: "privacy-lock",
      doorHandleFinish: {"polishedchrome-door-handle": 0,
      "satinchrome-door-handle": 0,
      "black-door-handle": 0
    }},
    {
      doorLock: "yalelock",
      doorHandleFinish: {"polishedchrome-door-handle": 163,
      "satinchrome-door-handle": 163,
      "black-door-handle": 243
                        }
    }
]
      
      
// Utility: reset totals and breakdown
function resetDoorBreakdownValues() {
  const ids = [
    'door-total',
    'door-upgrade-total',
    'door-handle-total',
    'door-custom-duties-total',
    'door-grand-total'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '$0.00';
  });
}

function resetErrorMessage() {
  const errorBox = document.getElementById('door-error-message');
  if (errorBox) {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
}

// 🔹 Reset ALL inputs (except Sale Group)
function resetAllDoorInputs(calculatorId, totalId) {
  // Clear all door-related fields
  const fields = [
    'door-frame',
    'door-model',
    'door-finish',
    'door-height',
    'door-width',
    'door-thickness', 
    'door-hinge',
    'door-handle',
    'door-handle-finish',
    'door-lock'
  ];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // Reset toggle
  const fillingToggle = document.getElementById('filling');
  if (fillingToggle) fillingToggle.checked = false;

  // Reset totals and error
  resetDoorBreakdownValues();
  resetErrorMessage();
}

// 🔹 Reset Finish Levels only
function resetDoorFinishLevels(calculatorId, totalId) {
  const fields = ['door-frame', 'door-model', 'door-finish'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  resetDoorBreakdownValues();
  resetErrorMessage();
}

// 🔹 Reset Door Sizes only
function resetDoorSizes(calculatorId, totalId) {
  const fields = ['door-height', 'door-width', 'door-thickness'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // Reset toggle
  const fillingToggle = document.getElementById('filling');
  if (fillingToggle) fillingToggle.checked = false;

  resetDoorBreakdownValues();
  resetErrorMessage();
}

document.getElementById('door-width').addEventListener('change', function() {
  const doorWidth = this.value;
  const errorBox = document.getElementById('door-error-message');

  if (doorWidth === "more-than-900mm") {
    errorBox.textContent = 
      "Custom door widths over 3 feet are not supported by this tool. Please contact Thelia Group for assistance.";
    errorBox.style.display = "block";
    errorBox.style.color = "red";
    // Optionally reset totals if you want to clear the calculator
    resetDoorBreakdownValues();
  } else {
    // Clear error if user selects less-than-900mm
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
});

// ================================================================
// Custom image-select dropdowns — door model & finish
// ================================================================

const leafModelBasePath = 'assets/';
const finishBasePath    = 'assets/';

const leafModelImages = {
  "ON":              "ON.png",
  "KIN":             "KIN.png",
  "KV":              "KV.png",
  "I1":              "I1.png",
  "I2":              "I2.png",
  "Q2":              "Q2.png",
  "Q3":              "Q3.png",
  "2Q2":             "2Q2.png",
  "PURA":            "PURA.png",
  "AURA":            "AURA.png",
  "QUADRO":          "QUADRO 1.png",
  "TRATTO":          "TRATTO4.png",
  "LUCIO":           "LUCIO10.png",
  "COLONIALE":       "COLONIALE21G.png",
  "EAN":             "EAN.png",
  "ONGA":            "ONGA.png",
  "DOGE PU":         "DOGE PU.png",
  "DOGE PP":         "DOGE PP.png",
  "DOGE PPP":        "DOGE PPP.png",
  "DOGE VU":         "DOGE VU.png",
  "DOGE VP":         "DOGE VP.png",
  "DOGE VPP":        "DOGE VPP.png",
  "RIALTO PU":       "RIALTO PU.png",
  "RIALTO PP":       "RIALTO PP.png",
  "RIALTO PPP":      "RIALTO PPP.png",
  "VENEZIA":         "VENEZIA 0G.png",
  "OPEN G":          "OPEN 21G.png",
  "ESPRIT PU":       "ESPRIT PU.png",
  "ESPRIT PP":       "ESPRIT PP.png",
  "ESPRIT PPP":      "ESPRIT PPP.png",
  "PALLADIO 121 PU": "PALLADIO 121 PU.png",
  "PALLADIO 122 PP": "PALLADIO 122 PP.png",
  "GIOTTO 02 PU":    "GIOTTO 02 PU.png",
  "GIOTTO 02 PP":    "GIOTTO 02 PP.png",
  "GIOTTO 02 VU":    "GIOTTO 02 VU.png",
  "GIOTTO 02 VP":    "GIOTTO 02 VP.png",
  "GIOTTO 11G":      "GIOTTO 11G.png",
  "GIOTTO 12G":      "GIOTTO 12G.png",
  "GIOTTO 13G":      "GIOTTO 13G.png",
  "RVU (TR)":        "RVU.png",
  "RVU G (TR)":      "RVU G (TR).png",
  "RLL":             "RLL.png",
  "OPEN 01 PU":      "OPEN 01 PU.png",
  "OPEN 01 PP":      "OPEN 01 PP.png",
  "OPEN 01 VU":      "OPEN 01 VU.png",
  "OPEN 01 VP":      "OPEN 01 VP.png",
  "OPEN 08 PU":      "OPEN 08 PU.png",
  "OPEN 08 PP":      "OPEN 08 PP.png",
  "OPEN 08 VP":      "OPEN 08 VP.png",
  "OPEN 15 PU":      "OPEN 15 PU.png",
  "OPEN 15 PP":      "OPEN 15 PP.png"
};

const finishImages = {
  "blanc":     "Blanc.png",
  "soft":     "Lacquer - Soft.png",
  "dark":     "Lacquer - Dark.png",
  "metal":     "Lacquer - Metal.png",
  "tortora":   "Lacquer - Tortora.png",
  "pearl":     "pearl.png",
  "glossy":    "Glossy.png",
  "nodato":    "nodato.png",
  "olmo":      "olmo.png",
  "sesamo":    "sesamo.png",
  "jazz":      "jazz.png",
  "blond":     "Blond.png",
  "carruba":   "carruba.png",
  "coloroc":   "coloroc.png",
  "masai":     "masai.png",
  "sigaro":    "sigaro.png",
  "cenere":    "cenere.png",
  "tabacco":   "tabacco.png",
  "vanilla":   "Vanilla.png",
  "canaletto": "canaletto.png",
  "moka":      "moka.png",
  "brina":     "brina.png",
  "ghiaccio":  "ghiaccio.png",
  "otter":     "otter.png",
  "walnut":    "walnut.png",
  "sabbia":    "sabbia.png",
  "you":       "you.png"
};

function buildCustomSelect(selectEl, imageMap, basePath) {
  if (selectEl.parentNode.classList.contains('custom-select-wrapper')) return;

  var placeholderOpt = Array.from(selectEl.options).find(function(o) { return !o.value; });
  var placeholderText = placeholderOpt ? placeholderOpt.text : 'Select...';

  var wrapper = document.createElement('div');
  wrapper.className = 'custom-select-wrapper';
  selectEl.parentNode.insertBefore(wrapper, selectEl);
  wrapper.appendChild(selectEl);
  selectEl.style.display = 'none';

  var trigger = document.createElement('div');
  trigger.className = 'custom-select-trigger';
  trigger.innerHTML = '<span class="custom-select-placeholder">' + placeholderText + '</span>'
                    + '<span class="custom-select-arrow">&#9660;</span>';
  wrapper.appendChild(trigger);

  var panel = document.createElement('div');
  panel.className = 'custom-select-options';
  wrapper.appendChild(panel);

  Array.from(selectEl.options).forEach(function(opt) {
    if (!opt.value) return;

    var div = document.createElement('div');
    div.className = 'custom-option';
    div.dataset.value = opt.value;
    if (opt.disabled) div.classList.add('disabled');

    var imgFile = imageMap[opt.value];
    if (imgFile) {
      var img = document.createElement('img');
      img.src = basePath + imgFile;
      img.alt = opt.text;
      img.loading = 'lazy';
      div.appendChild(img);
    } else {
      var ph = document.createElement('div');
      ph.className = 'custom-option-no-img';
      div.appendChild(ph);
    }

    var span = document.createElement('span');
    span.textContent = opt.text;
    div.appendChild(span);

    div.addEventListener('click', function(e) {
      if (div.classList.contains('disabled')) return;
      e.stopPropagation();
      selectEl.value = opt.value;
      panel.querySelectorAll('.custom-option').forEach(function(o) { o.classList.remove('selected'); });
      div.classList.add('selected');
      wrapper.classList.remove('open');
      updateCustomTrigger(wrapper, selectEl, imageMap, basePath);
      selectEl.dispatchEvent(new Event('change'));
    });

    panel.appendChild(div);
  });

  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = wrapper.classList.contains('open');
    closeAllCustomSelects();
    if (!isOpen) {
      wrapper.classList.add('open');
      var sel = panel.querySelector('.custom-option.selected');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
  });
}

function updateCustomTrigger(wrapper, selectEl, imageMap, basePath) {
  var trigger = wrapper.querySelector('.custom-select-trigger');
  var selectedOpt = (selectEl.selectedIndex >= 0) ? selectEl.options[selectEl.selectedIndex] : null;
  var placeholderOpt = Array.from(selectEl.options).find(function(o) { return !o.value; });
  var placeholderText = placeholderOpt ? placeholderOpt.text : 'Select...';

  if (!selectedOpt || !selectedOpt.value) {
    trigger.innerHTML = '<span class="custom-select-placeholder">' + placeholderText + '</span>'
                      + '<span class="custom-select-arrow">&#9660;</span>';
    return;
  }
  var imgFile = imageMap[selectedOpt.value];
  var imgHtml = imgFile
    ? '<img src="' + basePath + imgFile + '" alt="' + selectedOpt.text + '" class="trigger-img" loading="lazy">'
    : '<div class="custom-option-no-img trigger-no-img"></div>';
  trigger.innerHTML = imgHtml + '<span>' + selectedOpt.text + '</span>'
                    + '<span class="custom-select-arrow">&#9660;</span>';
}

function refreshCustomSelect(selectId) {
  var selectEl = document.getElementById(selectId);
  if (!selectEl) return;
  var wrapper = selectEl.closest('.custom-select-wrapper');
  if (!wrapper) return;
  var imageMap = (selectId === 'door-model') ? leafModelImages : finishImages;
  var basePath  = (selectId === 'door-model') ? leafModelBasePath : finishBasePath;
  var panel = wrapper.querySelector('.custom-select-options');
  if (!panel) return;

  // Sync disabled state from hidden <select> to visual options
  Array.from(panel.querySelectorAll('.custom-option')).forEach(function(div) {
    var matchOpt = Array.from(selectEl.options).find(function(o) { return o.value === div.dataset.value; });
    if (!matchOpt) return;
    if (matchOpt.disabled) { div.classList.add('disabled'); }
    else                   { div.classList.remove('disabled'); }
  });

  updateCustomTrigger(wrapper, selectEl, imageMap, basePath);
}

function closeAllCustomSelects() {
  document.querySelectorAll('.custom-select-wrapper.open').forEach(function(w) {
    w.classList.remove('open');
  });
}

function initCustomSelects() {
  var modelSel  = document.getElementById('door-model');
  var finishSel = document.getElementById('door-finish');
  if (modelSel)  buildCustomSelect(modelSel,  leafModelImages, leafModelBasePath);
  if (finishSel) buildCustomSelect(finishSel, finishImages,    finishBasePath);
}

// Close dropdowns when user clicks anywhere else
document.addEventListener('click', closeAllCustomSelects);

// Initialise after DOM is parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomSelects);
} else {
  initCustomSelects();
}

// ---------------------------------------------------------------
// Door dropdown filtering helpers
// ---------------------------------------------------------------

function updateDoorThicknessOptions() {
  const frame = document.getElementById('door-frame').value;
  const thicknessSelect = document.getElementById('door-thickness');
  const opt45 = Array.from(thicknessSelect.options).find(o => o.value === '45mm');
  if (!opt45) return;
  if (frame === "secret-frame" || frame === "secret-twin-frame") {
    opt45.disabled = true;
    opt45.style.color = '#bbb';
    if (thicknessSelect.value === '45mm') thicknessSelect.value = '';
  } else {
    opt45.disabled = false;
    opt45.style.color = '';
  }
}

function filterDoorModels() {
  const frame = document.getElementById('door-frame').value;
  if (!frame) return;
  const lookupFrame = frame === "secret-twin-frame" ? "secret-frame" : frame;
  const availableModels = new Set(
    doorPricing.filter(r => r.frame === lookupFrame).map(r => r.model)
  );
  if (frame === "ng-frame") {
    doorPricing.filter(r => r.frame === "wooden-frame").forEach(r => availableModels.add(r.model));
  }
  const modelSelect = document.getElementById('door-model');
  Array.from(modelSelect.options).forEach(opt => {
    if (!opt.value) return;
    if (availableModels.has(opt.value)) {
      opt.disabled = false;
      opt.style.color = '';
    } else {
      opt.disabled = true;
      opt.style.color = '#bbb';
    }
  });
  if (modelSelect.value && !availableModels.has(modelSelect.value)) modelSelect.value = '';
  refreshCustomSelect('door-model');
}

function filterDoorFinishes() {
  const frame = document.getElementById('door-frame').value;
  const model = document.getElementById('door-model').value;
  if (!frame || !model) return;
  const lookupFrame = frame === "secret-twin-frame" ? "secret-frame" : frame;

  let rows;
  if (frame === "ng-frame") {
    // Always combine NG-frame rows (laminates with specific prices) +
    // wooden-frame rows (lacquer/veneer at wooden-frame prices)
    const ngRows     = doorPricing.filter(r => r.model === model && r.frame === "ng-frame");
    const woodenRows = doorPricing.filter(r => r.model === model && r.frame === "wooden-frame");
    rows = [...ngRows, ...woodenRows];
  } else {
    rows = doorPricing.filter(r => r.model === model && r.frame === lookupFrame);
  }

  const availableFinishes = new Set();
  rows.forEach(r => Object.keys(r.finishes).forEach(f => availableFinishes.add(f)));
  if (frame === "ng-frame") {
    availableFinishes.delete("you");
    availableFinishes.delete("glossy");
    availableFinishes.delete("canaletto");
  }
  const finishSelect = document.getElementById('door-finish');
  Array.from(finishSelect.options).forEach(opt => {
    if (!opt.value) return;
    if (availableFinishes.has(opt.value)) {
      opt.disabled = false;
      opt.style.color = '';
    } else {
      opt.disabled = true;
      opt.style.color = '#bbb';
    }
  });
  if (finishSelect.value && !availableFinishes.has(finishSelect.value)) finishSelect.value = '';
  refreshCustomSelect('door-finish');
}

document.getElementById('door-frame').addEventListener('change', function() {
  updateDoorThicknessOptions();
  filterDoorModels();
  filterDoorFinishes();
});
document.getElementById('door-model').addEventListener('change', function() {
  filterDoorFinishes();
});

// ---------------------------------------------------------------

function calculateDoorPrice() {
  const frame = document.getElementById('door-frame').value;
  const thickness = document.getElementById('door-thickness').value;
  const height = document.getElementById('door-height').value;
  const width = document.getElementById('door-width').value;
  const finish = document.getElementById('door-finish').value; 
  const dealerType = document.getElementById('door-dealer-type').value;
  const model = document.getElementById('door-model').value;
  const fillingChecked = document.getElementById('filling').checked;
  const hinge = document.getElementById('door-hinge').value;
  const selectedHandle = document.getElementById('door-handle').value;
  const selectedFinish = document.getElementById('door-handle-finish').value;
  const selectedLockType = document.getElementById('door-lock').value;

 
  // Check if all required fields are selected
  const allSelected = [frame, thickness, height, finish, model].every(val => val && val !== "");

  const errorBox = document.getElementById('door-error-message');

  // NG frame: block glossy, "you", and canaletto finishes
  if (frame === "ng-frame" && (finish === "you" || finish === "glossy" || finish === "canaletto")) {
    if (allSelected) {
      errorBox.textContent = "This finish is not available for the NG frame.";
      errorBox.style.display = "block";
      errorBox.style.color = "red";
      resetDoorBreakdownValues();
    }
    return;
  }

  const effectiveFrame = frame === "secret-twin-frame" ? "secret-frame" : frame;

  // Find matching row — for ng-frame, try ng-frame entries first, then fall back to wooden-frame
  let match = doorPricing.find(
    row =>
      row.model === model &&
      row.frame === effectiveFrame &&
      row.thickness === thickness &&
      row.width === width &&
      row.height === height
  );

  // NG frame fallback: if no ng-frame entry exists, OR the entry doesn't have this finish
  // (laminates use NG-specific prices; lacquers/veneers fall back to wooden-frame prices)
  if (frame === "ng-frame" && (!match || !match.finishes[finish])) {
    const woodenMatch = doorPricing.find(
      row =>
        row.model === model &&
        row.frame === "wooden-frame" &&
        row.thickness === thickness &&
        row.width === width &&
        row.height === height
    );
    if (woodenMatch) match = woodenMatch;
  }

  if (!match) {
    if (allSelected) {
      errorBox.textContent =
        "This configuration is not available. Please contact Thelia Group for assistance.";
      errorBox.style.display = "block";
      resetDoorBreakdownValues();
    } else {
      errorBox.textContent = "";
    }
    return;
  }

  let basePrice = match.finishes[finish];  

  if (!basePrice) {
    const errorBox = document.getElementById('door-error-message');
    if (allSelected) {
      errorBox.textContent =
      "This finish is not available for the selected configuration.";
      errorBox.style.display = "block";
      errorBox.style.color = "red";
      resetDoorBreakdownValues();
    } else {
      // ✅ Only clear if there is no width error active
      const doorWidth = document.getElementById('door-width').value;
      if (doorWidth !== "more-than-900mm") {
        resetErrorMessage()
      }
    }
    return;
  } else {
    resetErrorMessage()
  }
    
  //Handle Pricing - standard vs. privacy
  let handlePrice = 0;
  
  if(selectedLockType) {
    const handleMatch = doorHandlePrice.find(
    item =>
    item.dhandle === selectedHandle &&
    item.dhandlefinish === selectedFinish 
    );
    if (handleMatch) {
      const usePrivacyPrice = selectedLockType === "privacy-lock" || selectedLockType === "yalelock";
      handlePrice = usePrivacyPrice
        ? handleMatch.lock.privacy
      : handleMatch.lock.standard;
    }
  }
  
  //lock-type add on price
  let lockAddonPrice = 0;
  const lockMatch = lockTypePrice.find(
    item => item.doorLock === selectedLockType
  );
  if (lockMatch) {
    lockAddonPrice = lockMatch.doorHandleFinish[selectedFinish] ?? 0;
  }
  
   
  // Apply dealer discount - THIS IS DISCOUNT ON THE EURO - WILL NEED TO BE CHANGED IF CONVERSION IS CHANGED.
  const barausseDealerMultipliers = {
    retail: 1.17,
    advanced: 0.819,
    preferred: 0.7605,
    elite: 0.7371,
    builder: 0.9945,
    designer: 1.0296,
    none: 1.00 //EQUIVALENT TO DOLLAR CONVERSION
  };
 
  // 🔹 Secret-twin frame surcharge
  if (frame === "secret-twin-frame") {
    basePrice += secretTwinSurcharge[height] ?? 0;
  }
  
  let doorGrandTotal = basePrice;
  
  // 🔹 Solid filling surcharge if toggle is on
  let fillingSurcharge = 0;
  if (fillingChecked) {
    fillingSurcharge = doorFillingSurcharge[thickness]?.[height] ?? 0;
  }
  
  //Add Hinge Upgrade Cost
  let hingeUpgrade = 0; 
  hingeUpgrade = hingeSurcharge[hinge]; 
  
  //Calculate Total Upgrade Cost
  const upgradeTotal = fillingSurcharge + hingeUpgrade + lockAddonPrice;
  doorGrandTotal += upgradeTotal;
  doorGrandTotal += handlePrice; // include handle so Total = Door + Upgrades + Handle + Duties

  //Consider dealer discount
  let doorCustomDuties = doorGrandTotal * 0.5 * 0.9 * 0.75 * 0.15 * dollarConversionRate; // duties on full invoice
  let discountedDoorGrandTotal = (doorGrandTotal * (barausseDealerMultipliers[dealerType] ?? 1)) + doorCustomDuties;
  let discountedBasePrice = basePrice * (barausseDealerMultipliers[dealerType] ?? 1);
  let discountedUpgradeSurcharge = upgradeTotal * (barausseDealerMultipliers[dealerType] ?? 1);
  let discountedHandlePrice = handlePrice * (barausseDealerMultipliers[dealerType] ?? 1);

  const doorDealerGroup = document.getElementById("door-dealer-type")?.value || "none";
  const doorCurrencySymbol = doorDealerGroup === "none" ? "€" : "$";
  
  // Update UI
   document.getElementById('door-grand-total').textContent =
    `${doorCurrencySymbol}${discountedDoorGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-total').textContent =
    `${doorCurrencySymbol}${discountedBasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-upgrade-total').textContent =
    `${doorCurrencySymbol}${discountedUpgradeSurcharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  // Sub-breakdown items (apply same dealer multiplier)
  const fmt = v => `${doorCurrencySymbol}${(v * (barausseDealerMultipliers[dealerType] ?? 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-hinge-sub').textContent    = fmt(hingeUpgrade);
  document.getElementById('door-filling-sub').textContent  = fmt(fillingSurcharge);
  document.getElementById('door-lock-sub').textContent     = fmt(lockAddonPrice);
  document.getElementById('door-handle-total').textContent =
    `${doorCurrencySymbol}${discountedHandlePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-custom-duties-total').textContent =
    `$${doorCustomDuties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

}


document.querySelectorAll('#door-frame, #door-thickness, #door-height, #door-finish, #door-dealer-type, #door-model, #filling, #door-hinge, #door-handle, #door-handle-finish, #privacy-lock, #door-lock')
  .forEach(el => el.addEventListener('change', calculateDoorPrice));

function toggleUpgradeBreakdown() {
  var panel = document.getElementById('door-upgrade-breakdown');
  var arrow = document.getElementById('upgrade-arrow');
  if (!panel) return;
  var isOpen = panel.style.display === 'block';
  panel.style.display = isOpen ? 'none' : 'block';
  if (arrow) arrow.innerHTML = isOpen ? '&#9656;' : '&#9662;';
}





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
  const floorCustomDuties = floorTotalWithBuffer * 0.5 * 0.1;
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
