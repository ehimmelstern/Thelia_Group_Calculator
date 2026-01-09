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
  let basePrice;
  basePrice = isNaN(euroInput) ? 0 : euroInput * dollarConversionRate;

  // Calculate discounted price
  const discountedPrice = basePrice * (1 - discountRate);

  // ✅ Calculate Estimated Duties
  const estimatedDuties = euroInput * customDutiesRate; 
  
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
  const dutiesPriceHIGH = totalPointHIGH * customDutiesRate * dollarConversionRate ; 
  const dutiesPriceLOW = totalPointLOW * customDutiesRate * dollarConversionRate; 
  
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
  const floorCustomDuties = floorTotalWithBuffer * 0.07;
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





//----------------------------------------------------DOOR C0DE-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Example dataset extracted from Excel
const doorPricing = [
  {
   model: "ON",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1011,
      "soft": 1227,
      "dark": 1337,
      "metal": 1444,
      "pearl": 1546,
      "shiny": 2223,
      "glossy": 2953,
      "nodato": 1283,
      "olmo": 1283,
      "sesamo": 1283,
      "jazz": 1283,
      "blond": 1283,
      "carruba": 1283,
      "naturoc": 1283,
      "coloroc": 1560,
      "masai": 1560,
      "sigaro": 1560,
      "cenere": 1560,
      "tabacco": 1425,
      "noce": 1377,
      "moka": 1019,
      "brina": 1019,
      "ghiaccio": 1019,
      "otter": 1019,
      "walnut": 1019,
      "sabbia": 1019,
      "quercia": 1256,
      "you": 989,
      "stone": 1256,
      "concrete": 1734,
      "clay": 1734,
      "carrara": 1833
    }},
    {
      model: "ON",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1143,
      "soft": 1355,
      "dark": 1540,
      "metal": 1680,
      "pearl": 1730,
      "shiny": 2348,
      "glossy": 3387,
      "nodato": 1421,
      "olmo": 1421,
      "sesamo": 1421,
      "jazz": 1421,
      "blond": 1421,
      "carruba": 1421,
      "naturoc": 1421,
      "coloroc": 1816,
      "masai": 1816,
      "sigaro": 1816,
      "cenere": 1816,
      "tabacco": 1658,
      "noce": 1549,
      "moka": 1181,
      "brina": 1181,
      "ghiaccio": 1181,
      "otter": 1181,
      "walnut": 1181,
      "sabbia": 1181,
      "quercia": 1413,
      "you": 1098,
      "stone": 1413,
      "concrete": 1987,
      "clay": 1987,
      "carrara": 2102
    }},
    {
      model: "KIN",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1011,
      "soft": 1227,
      "dark": 1337,
      "metal": 1444,
      "pearl": 1546,
      "shiny": 2223,
      "glossy": 2953,
      "nodato": 1346,
      "olmo": 1346,
      "sesamo": 1346,
      "jazz": 1346,
      "blond": 1346,
      "carruba": 1346,
      "naturoc": 1346,
      "coloroc": 1623,
      "masai": 1623,
      "sigaro": 1623,
      "cenere": 1623,
      "tabacco": 1488,
      "noce": 1440,
      "moka": 1019,
      "brina": 1019,
      "ghiaccio": 1019,
      "otter": 1019,
      "walnut": 1019,
      "sabbia": 1019,
      "quercia": 1256,
      "you": 989,
      "stone": 1256,
      "concrete": 1734,
      "clay": 1734,
      "carrara": 1833
    }},
    {
      model: "KIN",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1143,
      "soft": 1355,
      "dark": 1540,
      "metal": 1680,
      "pearl": 1730,
      "shiny": 2348,
      "glossy": 3387,
      "nodato": 1484,
      "olmo": 1484,
      "sesamo": 1484,
      "jazz": 1484,
      "blond": 1484,
      "carruba": 1484,
      "naturoc": 1484,
      "coloroc": 1879,
      "masai": 1879,
      "sigaro": 1879,
      "cenere": 1879,
      "tabacco": 1721,
      "noce": 1612,
      "moka": 1181,
      "brina": 1181,
      "ghiaccio": 1181,
      "otter": 1181,
      "walnut": 1181,
      "sabbia": 1181,
      "quercia": 1413,
      "you": 1098,
      "stone": 1413,
      "concrete": 1987,
      "clay": 1987,
      "carrara": 2102
    }},
    {
      model: "KV",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1011,
      "soft": 1227,
      "dark": 1337,
      "metal": 1444,
      "pearl": 1546,
      "shiny": 2223,
      "glossy": 2953,
      "nodato": 1438,
      "olmo": 1438,
      "sesamo": 1438,
      "jazz": 1438,
      "blond": 1438,
      "carruba": 1438,
      "naturoc": 1438,
      "coloroc": 1715,
      "masai": 1715,
      "sigaro": 1715,
      "cenere": 1715,
      "tabacco": 1580,
      "noce": 1532,
      "moka": 1019,
      "brina": 1019,
      "ghiaccio": 1019,
      "otter": 1019,
      "walnut": 1019,
      "sabbia": 1019,
      "quercia": 1256,
      "you": 989,
      "stone": 1256,
      "concrete": 1734,
      "clay": 1734,
      "carrara": 1833
    }},
    {
      model: "KV",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1143,
      "soft": 1355,
      "dark": 1540,
      "metal": 1680,
      "pearl": 1730,
      "shiny": 2348,
      "glossy": 3387,
      "nodato": 1576,
      "olmo": 1576,
      "sesamo": 1576,
      "jazz": 1576,
      "blond": 1576,
      "carruba": 1576,
      "naturoc": 1576,
      "coloroc": 1971,
      "masai": 1971,
      "sigaro": 1971,
      "cenere": 1971,
      "tabacco": 1813,
      "noce": 1704,
      "moka": 1181,
      "brina": 1181,
      "ghiaccio": 1181,
      "otter": 1181,
      "walnut": 1181,
      "sabbia": 1181,
      "quercia": 1413,
      "you": 1098,
      "stone": 1413,
      "concrete": 1987,
      "clay": 1987,
      "carrara": 2102
    }},
    {
      model: "I1",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1181,
      "soft": 1397,
      "dark": 1507,
      "metal": 1614,
      "pearl": 1716,
      "shiny": 2393,
      "glossy": 3123,
      "nodato": 1453,
      "olmo": 1453,
      "sesamo": 1453,
      "jazz": 1453,
      "blond": 1453,
      "carruba": 1453,
      "naturoc": 1453,
      "coloroc": 1730,
      "masai": 1730,
      "sigaro": 1730,
      "cenere": 1730,
      "tabacco": 1595,
      "noce": 1547,
      "moka": 1189,
      "brina": 1189,
      "ghiaccio": 1189,
      "otter": 1189,
      "walnut": 1189,
      "sabbia": 1189,
      "quercia": 1426,
      "you": 1159,
      "stone": 1426,
      "concrete": 1904,
      "clay": 1904,
      "carrara": 2003
    }},
    {
      model: "I1",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1313,
      "soft": 1525,
      "dark": 1710,
      "metal": 1850,
      "pearl": 1900,
      "shiny": 2518,
      "glossy": 3557,
      "nodato": 1591,
      "olmo": 1591,
      "sesamo": 1591,
      "jazz": 1591,
      "blond": 1591,
      "carruba": 1591,
      "naturoc": 1591,
      "coloroc": 1986,
      "masai": 1986,
      "sigaro": 1986,
      "cenere": 1986,
      "tabacco": 1828,
      "noce": 1719,
      "moka": 1351,
      "brina": 1351,
      "ghiaccio": 1351,
      "otter": 1351,
      "walnut": 1351,
      "sabbia": 1351,
      "quercia": 1583,
      "you": 1268,
      "stone": 1583,
      "concrete": 2157,
      "clay": 2157,
      "carrara": 2272
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1311,
      "soft": 1527,
      "dark": 1637,
      "metal": 1744,
      "pearl": 1846,
      "shiny": 2523,
      "glossy": 3253,
      "nodato": 1583,
      "olmo": 1583,
      "sesamo": 1583,
      "jazz": 1583,
      "blond": 1583,
      "carruba": 1583,
      "naturoc": 1583,
      "coloroc": 1860,
      "masai": 1860,
      "sigaro": 1860,
      "cenere": 1860,
      "tabacco": 1725,
      "noce": 1677,
      "moka": 1319,
      "brina": 1319,
      "ghiaccio": 1319,
      "otter": 1319,
      "walnut": 1319,
      "sabbia": 1319,
      "quercia": 1556,
      "you": 1289,
      "stone": 1556,
      "concrete": 2034,
      "clay": 2034,
      "carrara": 2133
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1443,
      "soft": 1655,
      "dark": 1840,
      "metal": 1980,
      "pearl": 2030,
      "shiny": 2648,
      "glossy": 3687,
      "nodato": 1721,
      "olmo": 1721,
      "sesamo": 1721,
      "jazz": 1721,
      "blond": 1721,
      "carruba": 1721,
      "naturoc": 1721,
      "coloroc": 2116,
      "masai": 2116,
      "sigaro": 2116,
      "cenere": 2116,
      "tabacco": 1958,
      "noce": 1849,
      "moka": 1481,
      "brina": 1481,
      "ghiaccio": 1481,
      "otter": 1481,
      "walnut": 1481,
      "sabbia": 1481,
      "quercia": 1713,
      "you": 1398,
      "stone": 1713,
      "concrete": 2287,
      "clay": 2287,
      "carrara": 2402
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1946,
      "soft": 2241,
      "dark": 2500,
      "metal": 2619,
      "pearl": 2761,
      "shiny": 3610,
      "glossy": 4965,
      "nodato": 2330,
      "olmo": 2330,
      "sesamo": 2330,
      "jazz": 2330,
      "blond": 2330,
      "carruba": 2330,
      "naturoc": 2330,
      "coloroc": 2852,
      "masai": 2852,
      "sigaro": 2852,
      "cenere": 2852,
      "tabacco": 2630,
      "noce": 2472,
      "moka": 2047,
      "brina": 2047,
      "ghiaccio": 2047,
      "otter": 2047,
      "walnut": 2047,
      "sabbia": 2047,
      "quercia": 2395,
      "you": 1855,
      "stone": 2395,
      "concrete": 3066,
      "clay": 3066,
      "carrara": 3283
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1405,
      "soft": 1621,
      "dark": 1731,
      "metal": 1838,
      "pearl": 1940,
      "shiny": 2617,
      "glossy": 3347,
      "nodato": 1677,
      "olmo": 1677,
      "sesamo": 1677,
      "jazz": 1677,
      "blond": 1677,
      "carruba": 1677,
      "naturoc": 1677,
      "coloroc": 1954,
      "masai": 1954,
      "sigaro": 1954,
      "cenere": 1954,
      "tabacco": 1819,
      "noce": 1771,
      "moka": 1413,
      "brina": 1413,
      "ghiaccio": 1413,
      "otter": 1413,
      "walnut": 1413,
      "sabbia": 1413,
      "quercia": 1650,
      "you": 1383,
      "stone": 1650,
      "concrete": 2128,
      "clay": 2128,
      "carrara": 2227
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1537,
      "soft": 1749,
      "dark": 1934,
      "metal": 2074,
      "pearl": 2124,
      "shiny": 2742,
      "glossy": 3781,
      "nodato": 1815,
      "olmo": 1815,
      "sesamo": 1815,
      "jazz": 1815,
      "blond": 1815,
      "carruba": 1815,
      "naturoc": 1815,
      "coloroc": 2210,
      "masai": 2210,
      "sigaro": 2210,
      "cenere": 2210,
      "tabacco": 2052,
      "noce": 1943,
      "moka": 1575,
      "brina": 1575,
      "ghiaccio": 1575,
      "otter": 1575,
      "walnut": 1575,
      "sabbia": 1575,
      "quercia": 1807,
      "you": 1492,
      "stone": 1807,
      "concrete": 2381,
      "clay": 2381,
      "carrara": 2496
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2040,
      "soft": 2335,
      "dark": 2594,
      "metal": 2713,
      "pearl": 2855,
      "shiny": 3704,
      "glossy": 5059,
      "nodato": 2424,
      "olmo": 2424,
      "sesamo": 2424,
      "jazz": 2424,
      "blond": 2424,
      "carruba": 2424,
      "naturoc": 2424,
      "coloroc": 2946,
      "masai": 2946,
      "sigaro": 2946,
      "cenere": 2946,
      "tabacco": 2724,
      "noce": 2566,
      "moka": 2141,
      "brina": 2141,
      "ghiaccio": 2141,
      "otter": 2141,
      "walnut": 2141,
      "sabbia": 2141,
      "quercia": 2489,
      "you": 1949,
      "stone": 2489,
      "concrete": 3160,
      "clay": 3160,
      "carrara": 3377
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1601,
      "soft": 1817,
      "dark": 1927,
      "metal": 2034,
      "pearl": 2136,
      "shiny": 2813,
      "glossy": 3543,
      "nodato": 1873,
      "olmo": 1873,
      "sesamo": 1873,
      "jazz": 1873,
      "blond": 1873,
      "carruba": 1873,
      "naturoc": 1873,
      "coloroc": 2150,
      "masai": 2150,
      "sigaro": 2150,
      "cenere": 2150,
      "tabacco": 2015,
      "noce": 1967,
      "moka": 1609,
      "brina": 1609,
      "ghiaccio": 1609,
      "otter": 1609,
      "walnut": 1609,
      "sabbia": 1609,
      "quercia": 1846,
      "you": 1579,
      "stone": 1846,
      "concrete": 2324,
      "clay": 2324,
      "carrara": 2423
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1733,
      "soft": 1945,
      "dark": 2130,
      "metal": 2270,
      "pearl": 2320,
      "shiny": 2938,
      "glossy": 3977,
      "nodato": 2011,
      "olmo": 2011,
      "sesamo": 2011,
      "jazz": 2011,
      "blond": 2011,
      "carruba": 2011,
      "naturoc": 2011,
      "coloroc": 2406,
      "masai": 2406,
      "sigaro": 2406,
      "cenere": 2406,
      "tabacco": 2248,
      "noce": 2139,
      "moka": 1771,
      "brina": 1771,
      "ghiaccio": 1771,
      "otter": 1771,
      "walnut": 1771,
      "sabbia": 1771,
      "quercia": 2003,
      "you": 1688,
      "stone": 2003,
      "concrete": 2577,
      "clay": 2577,
      "carrara": 2692
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2236,
      "soft": 2531,
      "dark": 2790,
      "metal": 2909,
      "pearl": 3051,
      "shiny": 3900,
      "glossy": 5255,
      "nodato": 2620,
      "olmo": 2620,
      "sesamo": 2620,
      "jazz": 2620,
      "blond": 2620,
      "carruba": 2620,
      "naturoc": 2620,
      "coloroc": 3142,
      "masai": 3142,
      "sigaro": 3142,
      "cenere": 3142,
      "tabacco": 2920,
      "noce": 2762,
      "moka": 2337,
      "brina": 2337,
      "ghiaccio": 2337,
      "otter": 2337,
      "walnut": 2337,
      "sabbia": 2337,
      "quercia": 2685,
      "you": 2145,
      "stone": 2685,
      "concrete": 3356,
      "clay": 3356,
      "carrara": 3573
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1497,
      "soft": 1713,
      "dark": 1823,
      "metal": 1930,
      "pearl": 2032,
      "shiny": 2709,
      "glossy": 3439,
      "nodato": 1769,
      "olmo": 1769,
      "sesamo": 1769,
      "jazz": 1769,
      "blond": 1769,
      "carruba": 1769,
      "naturoc": 1769,
      "coloroc": 2046,
      "masai": 2046,
      "sigaro": 2046,
      "cenere": 2046,
      "tabacco": 1911,
      "noce": 1863,
      "moka": 1505,
      "brina": 1505,
      "ghiaccio": 1505,
      "otter": 1505,
      "walnut": 1505,
      "sabbia": 1505,
      "quercia": 1742,
      "you": 1475,
      "stone": 1742,
      "concrete": 2220,
      "clay": 2220,
      "carrara": 2319
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1629,
      "soft": 1841,
      "dark": 2026,
      "metal": 2166,
      "pearl": 2216,
      "shiny": 2834,
      "glossy": 3873,
      "nodato": 1907,
      "olmo": 1907,
      "sesamo": 1907,
      "jazz": 1907,
      "blond": 1907,
      "carruba": 1907,
      "naturoc": 1907,
      "coloroc": 2302,
      "masai": 2302,
      "sigaro": 2302,
      "cenere": 2302,
      "tabacco": 2144,
      "noce": 2035,
      "moka": 1667,
      "brina": 1667,
      "ghiaccio": 1667,
      "otter": 1667,
      "walnut": 1667,
      "sabbia": 1667,
      "quercia": 1899,
      "you": 1584,
      "stone": 1899,
      "concrete": 2473,
      "clay": 2473,
      "carrara": 2588
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2132,
      "soft": 2427,
      "dark": 2686,
      "metal": 2805,
      "pearl": 2947,
      "shiny": 3796,
      "glossy": 5151,
      "nodato": 2516,
      "olmo": 2516,
      "sesamo": 2516,
      "jazz": 2516,
      "blond": 2516,
      "carruba": 2516,
      "naturoc": 2516,
      "coloroc": 3038,
      "masai": 3038,
      "sigaro": 3038,
      "cenere": 3038,
      "tabacco": 2816,
      "noce": 2658,
      "moka": 2233,
      "brina": 2233,
      "ghiaccio": 2233,
      "otter": 2233,
      "walnut": 2233,
      "sabbia": 2233,
      "quercia": 2581,
      "you": 2041,
      "stone": 2581,
      "concrete": 3252,
      "clay": 3252,
      "carrara": 3469
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1434,
      "soft": 1623,
      "dark": 1733,
      "metal": 1787
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1659,
      "soft": 1889,
      "dark": 2025,
      "metal": 2089
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2406,
      "soft": 2682,
      "dark": 2868,
      "metal": 2957
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1434,
      "soft": 1623,
      "dark": 1733,
      "metal": 1787
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1659,
      "soft": 1889,
      "dark": 2025,
      "metal": 2089
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2406,
      "soft": 2682,
      "dark": 2868,
      "metal": 2957
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1434,
      "soft": 1623,
      "dark": 1733,
      "metal": 1787
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1659,
      "soft": 1889,
      "dark": 2025,
      "metal": 2089
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2406,
      "soft": 2682,
      "dark": 2868,
      "metal": 2957
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1434,
      "soft": 1623,
      "dark": 1733,
      "metal": 1787
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1659,
      "soft": 1889,
      "dark": 2025,
      "metal": 2089
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2406,
      "soft": 2682,
      "dark": 2868,
      "metal": 2957
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1560,
      "soft": 1720,
      "dark": 1829,
      "metal": 1914
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1812,
      "soft": 2008,
      "dark": 2141,
      "metal": 2245
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2572,
      "soft": 2843,
      "dark": 3027,
      "metal": 3114
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1560,
      "soft": 1720,
      "dark": 1829,
      "metal": 1914
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1812,
      "soft": 2008,
      "dark": 2141,
      "metal": 2245
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2572,
      "soft": 2843,
      "dark": 3027,
      "metal": 3114
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1816,
      "soft": 1985,
      "dark": 2100,
      "metal": 2155
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2047,
      "soft": 2331,
      "dark": 2472,
      "metal": 2538
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3011,
      "soft": 3296,
      "dark": 3491,
      "metal": 3584
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1816,
      "soft": 1985,
      "dark": 2100,
      "metal": 2155,
      "naturoc": 2298
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2047,
      "soft": 2331,
      "dark": 2472,
      "metal": 2538,
      "naturoc": 2688
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3011,
      "soft": 3296,
      "dark": 3491,
      "metal": 3584,
      "naturoc": 3711
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1816,
      "soft": 1985,
      "dark": 2100,
      "metal": 2155,
      "naturoc": 2298
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2047,
      "soft": 2331,
      "dark": 2472,
      "metal": 2538,
      "naturoc": 2688
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3011,
      "soft": 3296,
      "dark": 3491,
      "metal": 3584,
      "naturoc": 3711
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1935,
      "soft": 1935,
      "naturoc": 2457
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2315,
      "soft": 2315,
      "naturoc": 2955
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3153,
      "soft": 3153,
      "naturoc": 4082
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1935,
      "soft": 1935,
      "naturoc": 2457
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2315,
      "soft": 2315,
      "naturoc": 2955
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3153,
      "soft": 3153,
      "naturoc": 4082
    }},
    {
      model: "ON",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1088,
      "soft": 1335,
      "dark": 1462,
      "metal": 1546,
      "pearl": 1646,
      "shiny": 2247,
      "glossy": 3081,
      "nodato": 1408,
      "olmo": 1408,
      "sesamo": 1408,
      "jazz": 1408,
      "blond": 1408,
      "carruba": 1408,
      "naturoc": 1408,
      "coloroc": 1666,
      "masai": 1666,
      "sigaro": 1666,
      "cenere": 1666,
      "tabacco": 1558,
      "noce": 1510,
      "moka": 1138,
      "brina": 1138,
      "ghiaccio": 1138,
      "otter": 1138,
      "walnut": 1138,
      "sabbia": 1138,
      "quercia": 1383,
      "you": 1031,
      "stone": 1383,
      "concrete": 1906,
      "clay": 1906,
      "carrara": 2013
    }},
    {
      model: "ON",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1216,
      "soft": 1556,
      "dark": 1691,
      "metal": 1800,
      "pearl": 1880,
      "shiny": 2651,
      "glossy": 3539,
      "nodato": 1625,
      "olmo": 1625,
      "sesamo": 1625,
      "jazz": 1625,
      "blond": 1625,
      "carruba": 1625,
      "naturoc": 1625,
      "coloroc": 1943,
      "masai": 1943,
      "sigaro": 1943,
      "cenere": 1943,
      "tabacco": 1816,
      "noce": 1761,
      "moka": 1252,
      "brina": 1252,
      "ghiaccio": 1252,
      "otter": 1252,
      "walnut": 1252,
      "sabbia": 1252,
      "quercia": 1566,
      "you": 1168,
      "stone": 1566,
      "concrete": 2192,
      "clay": 2192,
      "carrara": 2319
    }},
    {
      model: "ON",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1817,
      "soft": 2288,
      "dark": 2518,
      "metal": 2560,
      "pearl": 2728,
      "shiny": 3840,
      "glossy": 5070,
      "nodato": 2382,
      "olmo": 2382,
      "sesamo": 2382,
      "jazz": 2382,
      "blond": 2382,
      "carruba": 2382,
      "naturoc": 2382,
      "coloroc": 2813,
      "masai": 2813,
      "sigaro": 2813,
      "cenere": 2813,
      "tabacco": 2576,
      "noce": 2580,
      "moka": 2043,
      "brina": 2043,
      "ghiaccio": 2043,
      "otter": 2043,
      "walnut": 2043,
      "sabbia": 2043,
      "quercia": 2300,
      "you": 1748,
      "stone": 2300,
      "concrete": 3152,
      "clay": 3152,
      "carrara": 3398
    }},
    {
      model: "ON",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
      "shiny": "",
      "glossy": 6281,
      "nodato": 3471,
      "olmo": 3471,
      "sesamo": 3471,
      "jazz": 3471,
      "blond": 3471,
      "carruba": 3471,
      "naturoc": 3471,
      "coloroc": 3997,
      "masai": 3997,
      "sigaro": 3997,
      "cenere": 3997,
      "tabacco": 3630,
      "noce": 3584,
      "moka": 3081,
      "brina": 3081,
      "ghiaccio": 3081,
      "otter": 3081,
      "walnut": 3081,
      "sabbia": 3081,
      "quercia": 2591,
      "you": 2164,
      "stone": 2591
    }},
    {
      model: "ON",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 4223,
      "soft": 4785,
      "dark": 5119,
      "metal": 5136,
      "pearl": "",
      "shiny": "",
      "glossy": "",
      "nodato": 4906,
      "olmo": 4906,
      "sesamo": 4906,
      "jazz": 4906,
      "blond": 4906,
      "carruba": 4906,
      "naturoc": 4906,
      "coloroc": 5463,
      "masai": 5463,
      "sigaro": 5463,
      "cenere": 5463,
      "tabacco": 5098,
      "noce": 5139,
      "quercia": 3850,
      "you": 3277,
      "stone": 3850
    }},
    {
      model: "KIN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1088,
      "soft": 1335,
      "dark": 1462,
      "metal": 1546,
      "pearl": 1646,
      "shiny": 2247,
      "glossy": 3081,
      "nodato": 1471,
      "olmo": 1471,
      "sesamo": 1471,
      "jazz": 1471,
      "blond": 1471,
      "carruba": 1471,
      "naturoc": 1471,
      "coloroc": 1729,
      "masai": 1729,
      "sigaro": 1729,
      "cenere": 1729,
      "tabacco": 1621,
      "noce": 1573,
      "moka": 1138,
      "brina": 1138,
      "ghiaccio": 1138,
      "otter": 1138,
      "walnut": 1138,
      "sabbia": 1138,
      "quercia": 1383,
      "you": 1031,
      "stone": 1383,
      "concrete": 1906,
      "clay": 1906,
      "carrara": 2013
    }},
    {
      model: "KIN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1216,
      "soft": 1556,
      "dark": 1691,
      "metal": 1800,
      "pearl": 1880,
      "shiny": 2651,
      "glossy": 3539,
      "nodato": 1688,
      "olmo": 1688,
      "sesamo": 1688,
      "jazz": 1688,
      "blond": 1688,
      "carruba": 1688,
      "naturoc": 1688,
      "coloroc": 2006,
      "masai": 2006,
      "sigaro": 2006,
      "cenere": 2006,
      "tabacco": 1879,
      "noce": 1824,
      "moka": 1252,
      "brina": 1252,
      "ghiaccio": 1252,
      "otter": 1252,
      "walnut": 1252,
      "sabbia": 1252,
      "quercia": 1566,
      "you": 1168,
      "stone": 1566,
      "concrete": 2192,
      "clay": 2192,
      "carrara": 2319
    }},
    {
      model: "KIN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1817,
      "soft": 2288,
      "dark": 2518,
      "metal": 2560,
      "pearl": 2728,
      "shiny": 3840,
      "glossy": 5070,
      "nodato": 2445,
      "olmo": 2445,
      "sesamo": 2445,
      "jazz": 2445,
      "blond": 2445,
      "carruba": 2445,
      "naturoc": 2445,
      "coloroc": 2876,
      "masai": 2876,
      "sigaro": 2876,
      "cenere": 2876,
      "tabacco": 2639,
      "noce": 2643,
      "moka": 2043,
      "brina": 2043,
      "ghiaccio": 2043,
      "otter": 2043,
      "walnut": 2043,
      "sabbia": 2043,
      "quercia": 2300,
      "you": 1748,
      "stone": 2300,
      "concrete": 3152,
      "clay": 3152,
      "carrara": 3398
    }},
    {
      model: "KIN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
      "shiny": "",
      "glossy": 6281,
      "quercia": 2591,
      "you": 2164,
      "stone": 2591
    }},
    {
      model: "KIN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 4223,
      "soft": 4785,
      "dark": 5119,
      "metal": 5136,
      "pearl": "",
      "shiny": "",
      "glossy": "",
      "quercia": 3850,
      "you": 3277,
      "stone": 3850
    }},
    {
      model: "KV",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1088,
      "soft": 1335,
      "dark": 1462,
      "metal": 1546,
      "pearl": 1646,
      "shiny": 2247,
      "glossy": 3081,
      "nodato": 1563,
      "olmo": 1563,
      "sesamo": 1563,
      "jazz": 1563,
      "blond": 1563,
      "carruba": 1563,
      "naturoc": 1563,
      "coloroc": 1821,
      "masai": 1821,
      "sigaro": 1821,
      "cenere": 1821,
      "tabacco": 1713,
      "noce": 1665,
      "moka": 1138,
      "brina": 1138,
      "ghiaccio": 1138,
      "otter": 1138,
      "walnut": 1138,
      "sabbia": 1138,
      "quercia": 1383,
      "you": 1031,
      "stone": 1383,
      "concrete": 1906,
      "clay": 1906,
      "carrara": 2013
    }},
    {
      model: "KV",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1216,
      "soft": 1556,
      "dark": 1691,
      "metal": 1800,
      "pearl": 1880,
      "shiny": 2651,
      "glossy": 3539,
      "nodato": 1780,
      "olmo": 1780,
      "sesamo": 1780,
      "jazz": 1780,
      "blond": 1780,
      "carruba": 1780,
      "naturoc": 1780,
      "coloroc": 2098,
      "masai": 2098,
      "sigaro": 2098,
      "cenere": 2098,
      "tabacco": 1971,
      "noce": 1916,
      "moka": 1252,
      "brina": 1252,
      "ghiaccio": 1252,
      "otter": 1252,
      "walnut": 1252,
      "sabbia": 1252,
      "quercia": 1566,
      "you": 1168,
      "stone": 1566,
      "concrete": 2192,
      "clay": 2192,
      "carrara": 2319
    }},
    {
      model: "KV",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1817,
      "soft": 2288,
      "dark": 2518,
      "metal": 2560,
      "pearl": 2728,
      "shiny": 3840,
      "glossy": 5070,
      "nodato": 2537,
      "olmo": 2537,
      "sesamo": 2537,
      "jazz": 2537,
      "blond": 2537,
      "carruba": 2537,
      "naturoc": 2537,
      "coloroc": 2968,
      "masai": 2968,
      "sigaro": 2968,
      "cenere": 2968,
      "tabacco": 2731,
      "noce": 2735,
      "moka": 2043,
      "brina": 2043,
      "ghiaccio": 2043,
      "otter": 2043,
      "walnut": 2043,
      "sabbia": 2043,
      "quercia": 2300,
      "you": 1748,
      "stone": 2300,
      "concrete": 3152,
      "clay": 3152,
      "carrara": 3398
    }},
    {
      model: "KV",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
      "shiny": "",
      "glossy": 6281,
      "quercia": 2591,
      "you": 2164,
      "stone": 2591
    }},
    {
      model: "KV",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 4223,
      "soft": 4785,
      "dark": 5119,
      "metal": 5136,
      "pearl": "",
      "shiny": "",
      "glossy": "",
      "quercia": 3850,
      "you": 3277,
      "stone": 3850
    }},
    {
      model: "I1",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1258,
      "soft": 1505,
      "dark": 1632,
      "metal": 1716,
      "pearl": 1816,
      "shiny": 2417,
      "glossy": 3251,
      "nodato": 1578,
      "olmo": 1578,
      "sesamo": 1578,
      "jazz": 1578,
      "blond": 1578,
      "carruba": 1578,
      "naturoc": 1578,
      "coloroc": 1836,
      "masai": 1836,
      "sigaro": 1836,
      "cenere": 1836,
      "tabacco": 1728,
      "noce": 1680,
      "moka": 1308,
      "brina": 1308,
      "ghiaccio": 1308,
      "otter": 1308,
      "walnut": 1308,
      "sabbia": 1308,
      "quercia": 1553,
      "you": 1201,
      "stone": 1553,
      "concrete": 2076,
      "clay": 2076,
      "carrara": 2183
    }},
    {
      model: "I1",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1386,
      "soft": 1726,
      "dark": 1861,
      "metal": 1970,
      "pearl": 2050,
      "shiny": 2821,
      "glossy": 3709,
      "nodato": 1795,
      "olmo": 1795,
      "sesamo": 1795,
      "jazz": 1795,
      "blond": 1795,
      "carruba": 1795,
      "naturoc": 1795,
      "coloroc": 2113,
      "masai": 2113,
      "sigaro": 2113,
      "cenere": 2113,
      "tabacco": 1986,
      "noce": 1931,
      "moka": 1422,
      "brina": 1422,
      "ghiaccio": 1422,
      "otter": 1422,
      "walnut": 1422,
      "sabbia": 1422,
      "quercia": 1736,
      "you": 1338,
      "stone": 1736,
      "concrete": 2362,
      "clay": 2362,
      "carrara": 2489
    }},
    {
      model: "I1",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1987,
      "soft": 2458,
      "dark": 2688,
      "metal": 2730,
      "pearl": 2898,
      "shiny": 4010,
      "glossy": 5240,
      "nodato": 2552,
      "olmo": 2552,
      "sesamo": 2552,
      "jazz": 2552,
      "blond": 2552,
      "carruba": 2552,
      "naturoc": 2552,
      "coloroc": 2983,
      "masai": 2983,
      "sigaro": 2983,
      "cenere": 2983,
      "tabacco": 2746,
      "noce": 2750,
      "moka": 2213,
      "brina": 2213,
      "ghiaccio": 2213,
      "otter": 2213,
      "walnut": 2213,
      "sabbia": 2213,
      "quercia": 2470,
      "you": 1918,
      "stone": 2470,
      "concrete": 3322,
      "clay": 3322,
      "carrara": 3568
    }},
    {
      model: "I1",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
      "shiny": "",
      "glossy": 6281,
      "quercia": 2591,
      "you": 2164,
      "stone": 2591
    }},
    {
      model: "I1",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 4223,
      "soft": 4785,
      "dark": 5119,
      "metal": 5136,
      "pearl": "",
      "shiny": "",
      "glossy": "",
      "quercia": 3850,
      "you": 3277,
      "stone": 3850
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1388,
      "soft": 1635,
      "dark": 1762,
      "metal": 1846,
      "pearl": 1946,
      "shiny": 2547,
      "glossy": 3381,
      "nodato": 1708,
      "olmo": 1708,
      "sesamo": 1708,
      "jazz": 1708,
      "blond": 1708,
      "carruba": 1708,
      "naturoc": 1708,
      "coloroc": 1966,
      "masai": 1966,
      "sigaro": 1966,
      "cenere": 1966,
      "tabacco": 1858,
      "noce": 1810,
      "moka": 1438,
      "brina": 1438,
      "ghiaccio": 1438,
      "otter": 1438,
      "walnut": 1438,
      "sabbia": 1438,
      "quercia": 1683,
      "you": 1331,
      "stone": 1683,
      "concrete": 2206,
      "clay": 2206,
      "carrara": 2313
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1516,
      "soft": 1856,
      "dark": 1991,
      "metal": 2100,
      "pearl": 2180,
      "shiny": 2951,
      "glossy": 3839,
      "nodato": 1925,
      "olmo": 1925,
      "sesamo": 1925,
      "jazz": 1925,
      "blond": 1925,
      "carruba": 1925,
      "naturoc": 1925,
      "coloroc": 2243,
      "masai": 2243,
      "sigaro": 2243,
      "cenere": 2243,
      "tabacco": 2116,
      "noce": 2061,
      "moka": 1552,
      "brina": 1552,
      "ghiaccio": 1552,
      "otter": 1552,
      "walnut": 1552,
      "sabbia": 1552,
      "quercia": 1866,
      "you": 1468,
      "stone": 1866,
      "concrete": 2492,
      "clay": 2492,
      "carrara": 2619
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2117,
      "soft": 2588,
      "dark": 2818,
      "metal": 2860,
      "pearl": 3028,
      "shiny": 4140,
      "glossy": 5370,
      "nodato": 2682,
      "olmo": 2682,
      "sesamo": 2682,
      "jazz": 2682,
      "blond": 2682,
      "carruba": 2682,
      "naturoc": 2682,
      "coloroc": 3113,
      "masai": 3113,
      "sigaro": 3113,
      "cenere": 3113,
      "tabacco": 2876,
      "noce": 2880,
      "moka": 2343,
      "brina": 2343,
      "ghiaccio": 2343,
      "otter": 2343,
      "walnut": 2343,
      "sabbia": 2343,
      "quercia": 2600,
      "you": 2048,
      "stone": 2600,
      "concrete": 3452,
      "clay": 3452,
      "carrara": 3698
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
      "shiny": "",
      "glossy": 6281,
      "quercia": 2591,
      "you": 2164,
      "stone": 2591
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 4223,
      "soft": 4785,
      "dark": 5119,
      "metal": 5136,
      "pearl": "",
      "shiny": "",
      "glossy": "",
      "quercia": 3850,
      "you": 3277,
      "stone": 3850
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1482,
      "soft": 1729,
      "dark": 1856,
      "metal": 1940,
      "pearl": 2040,
      "shiny": 2641,
      "glossy": 3475,
      "nodato": 1802,
      "olmo": 1802,
      "sesamo": 1802,
      "jazz": 1802,
      "blond": 1802,
      "carruba": 1802,
      "naturoc": 1802,
      "coloroc": 2060,
      "masai": 2060,
      "sigaro": 2060,
      "cenere": 2060,
      "tabacco": 1952,
      "noce": 1904,
      "moka": 1532,
      "brina": 1532,
      "ghiaccio": 1532,
      "otter": 1532,
      "walnut": 1532,
      "sabbia": 1532,
      "quercia": 1777,
      "you": 1425,
      "stone": 1777,
      "concrete": 2300,
      "clay": 2300,
      "carrara": 2407
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1610,
      "soft": 1950,
      "dark": 2085,
      "metal": 2194,
      "pearl": 2274,
      "shiny": 3045,
      "glossy": 3933,
      "nodato": 2019,
      "olmo": 2019,
      "sesamo": 2019,
      "jazz": 2019,
      "blond": 2019,
      "carruba": 2019,
      "naturoc": 2019,
      "coloroc": 2337,
      "masai": 2337,
      "sigaro": 2337,
      "cenere": 2337,
      "tabacco": 2210,
      "noce": 2155,
      "moka": 1646,
      "brina": 1646,
      "ghiaccio": 1646,
      "otter": 1646,
      "walnut": 1646,
      "sabbia": 1646,
      "quercia": 1960,
      "you": 1562,
      "stone": 1960,
      "concrete": 2586,
      "clay": 2586,
      "carrara": 2713
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2211,
      "soft": 2682,
      "dark": 2912,
      "metal": 2954,
      "pearl": 3122,
      "shiny": 4234,
      "glossy": 5464,
      "nodato": 2776,
      "olmo": 2776,
      "sesamo": 2776,
      "jazz": 2776,
      "blond": 2776,
      "carruba": 2776,
      "naturoc": 2776,
      "coloroc": 3207,
      "masai": 3207,
      "sigaro": 3207,
      "cenere": 3207,
      "tabacco": 2970,
      "noce": 2974,
      "moka": 2437,
      "brina": 2437,
      "ghiaccio": 2437,
      "otter": 2437,
      "walnut": 2437,
      "sabbia": 2437,
      "quercia": 2694,
      "you": 2142,
      "stone": 2694,
      "concrete": 3546,
      "clay": 3546,
      "carrara": 3792
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
      "shiny": "",
      "glossy": 6281,
      "quercia": 2591,
      "you": 2164,
      "stone": 2591
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 4223,
      "soft": 4785,
      "dark": 5119,
      "metal": 5136,
      "pearl": "",
      "shiny": "",
      "glossy": "",
      "quercia": 3850,
      "you": 3277,
      "stone": 3850
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1678,
      "soft": 1925,
      "dark": 2052,
      "metal": 2136,
      "pearl": 2236,
      "shiny": 2837,
      "glossy": 3671,
      "nodato": 1998,
      "olmo": 1998,
      "sesamo": 1998,
      "jazz": 1998,
      "blond": 1998,
      "carruba": 1998,
      "naturoc": 1998,
      "coloroc": 2256,
      "masai": 2256,
      "sigaro": 2256,
      "cenere": 2256,
      "tabacco": 2148,
      "noce": 2100,
      "moka": 1728,
      "brina": 1728,
      "ghiaccio": 1728,
      "otter": 1728,
      "walnut": 1728,
      "sabbia": 1728,
      "quercia": 1973,
      "you": 1621,
      "stone": 1973,
      "concrete": 2496,
      "clay": 2496,
      "carrara": 2603
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1806,
      "soft": 2146,
      "dark": 2281,
      "metal": 2390,
      "pearl": 2470,
      "shiny": 3241,
      "glossy": 4129,
      "nodato": 2215,
      "olmo": 2215,
      "sesamo": 2215,
      "jazz": 2215,
      "blond": 2215,
      "carruba": 2215,
      "naturoc": 2215,
      "coloroc": 2533,
      "masai": 2533,
      "sigaro": 2533,
      "cenere": 2533,
      "tabacco": 2406,
      "noce": 2351,
      "moka": 1842,
      "brina": 1842,
      "ghiaccio": 1842,
      "otter": 1842,
      "walnut": 1842,
      "sabbia": 1842,
      "quercia": 2156,
      "you": 1758,
      "stone": 2156,
      "concrete": 2782,
      "clay": 2782,
      "carrara": 2909
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2407,
      "soft": 2878,
      "dark": 3108,
      "metal": 3150,
      "pearl": 3318,
      "shiny": 4430,
      "glossy": 5660,
      "nodato": 2972,
      "olmo": 2972,
      "sesamo": 2972,
      "jazz": 2972,
      "blond": 2972,
      "carruba": 2972,
      "naturoc": 2972,
      "coloroc": 3403,
      "masai": 3403,
      "sigaro": 3403,
      "cenere": 3403,
      "tabacco": 3166,
      "noce": 3170,
      "moka": 2633,
      "brina": 2633,
      "ghiaccio": 2633,
      "otter": 2633,
      "walnut": 2633,
      "sabbia": 2633,
      "quercia": 2890,
      "you": 2338,
      "stone": 2890,
      "concrete": 3742,
      "clay": 3742,
      "carrara": 3988
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
      "shiny": "",
      "glossy": 6281,
      "quercia": 2591,
      "you": 2164,
      "stone": 2591
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 4223,
      "soft": 4785,
      "dark": 5119,
      "metal": 5136,
      "pearl": "",
      "shiny": "",
      "glossy": "",
      "quercia": 3850,
      "you": 3277,
      "stone": 3850
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1574,
      "soft": 1821,
      "dark": 1948,
      "metal": 2032,
      "pearl": 2132,
      "shiny": 2733,
      "glossy": 3567,
      "nodato": 1894,
      "olmo": 1894,
      "sesamo": 1894,
      "jazz": 1894,
      "blond": 1894,
      "carruba": 1894,
      "naturoc": 1894,
      "coloroc": 2152,
      "masai": 2152,
      "sigaro": 2152,
      "cenere": 2152,
      "tabacco": 2044,
      "noce": 1996,
      "moka": 1624,
      "brina": 1624,
      "ghiaccio": 1624,
      "otter": 1624,
      "walnut": 1624,
      "sabbia": 1624,
      "quercia": 1869,
      "you": 1517,
      "stone": 1869,
      "concrete": 2392,
      "clay": 2392,
      "carrara": 2499
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1702,
      "soft": 2042,
      "dark": 2177,
      "metal": 2286,
      "pearl": 2366,
      "shiny": 3137,
      "glossy": 4025,
      "nodato": 2111,
      "olmo": 2111,
      "sesamo": 2111,
      "jazz": 2111,
      "blond": 2111,
      "carruba": 2111,
      "naturoc": 2111,
      "coloroc": 2429,
      "masai": 2429,
      "sigaro": 2429,
      "cenere": 2429,
      "tabacco": 2302,
      "noce": 2247,
      "moka": 1738,
      "brina": 1738,
      "ghiaccio": 1738,
      "otter": 1738,
      "walnut": 1738,
      "sabbia": 1738,
      "quercia": 2052,
      "you": 1654,
      "stone": 2052,
      "concrete": 2678,
      "clay": 2678,
      "carrara": 2805
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2303,
      "soft": 2774,
      "dark": 3004,
      "metal": 3046,
      "pearl": 3214,
      "shiny": 4326,
      "glossy": 5556,
      "nodato": 2868,
      "olmo": 2868,
      "sesamo": 2868,
      "jazz": 2868,
      "blond": 2868,
      "carruba": 2868,
      "naturoc": 2868,
      "coloroc": 3299,
      "masai": 3299,
      "sigaro": 3299,
      "cenere": 3299,
      "tabacco": 3062,
      "noce": 3066,
      "moka": 2529,
      "brina": 2529,
      "ghiaccio": 2529,
      "otter": 2529,
      "walnut": 2529,
      "sabbia": 2529,
      "quercia": 2786,
      "you": 2234,
      "stone": 2786,
      "concrete": 3638,
      "clay": 3638,
      "carrara": 3884
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
      "shiny": "",
      "glossy": 6281,
      "quercia": 2591,
      "you": 2164,
      "stone": 2591
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 4223,
      "soft": 4785,
      "dark": 5119,
      "metal": 5136,
      "pearl": "",
      "shiny": "",
      "glossy": "",
      "quercia": 3850,
      "you": 3277,
      "stone": 3850
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1581,
      "soft": 1717,
      "dark": 1826,
      "metal": 1911
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1843,
      "soft": 2040,
      "dark": 2175,
      "metal": 2241
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2621,
      "soft": 3000,
      "dark": 3186,
      "metal": 3276
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 3747,
      "soft": 4157,
      "dark": 4360,
      "metal": 4457
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 5155,
      "soft": 5637,
      "dark": 5875,
      "metal": 5989
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1581,
      "soft": 1717,
      "dark": 1826,
      "metal": 1911
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1843,
      "soft": 2040,
      "dark": 2175,
      "metal": 2241
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2621,
      "soft": 3000,
      "dark": 3186,
      "metal": 3276
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 3747,
      "soft": 4157,
      "dark": 4360,
      "metal": 4457
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 5155,
      "soft": 5637,
      "dark": 5875,
      "metal": 5989
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1581,
      "soft": 1717,
      "dark": 1826,
      "metal": 1911
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1843,
      "soft": 2040,
      "dark": 2175,
      "metal": 2241
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2621,
      "soft": 3000,
      "dark": 3186,
      "metal": 3276
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 3747,
      "soft": 4157,
      "dark": 4360,
      "metal": 4457
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 5155,
      "soft": 5637,
      "dark": 5875,
      "metal": 5989
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1581,
      "soft": 1717,
      "dark": 1826,
      "metal": 1911
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1843,
      "soft": 2040,
      "dark": 2175,
      "metal": 2241
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2621,
      "soft": 3000,
      "dark": 3186,
      "metal": 3276
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 3747,
      "soft": 4157,
      "dark": 4360,
      "metal": 4457
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 5155,
      "soft": 5637,
      "dark": 5875,
      "metal": 5989
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1621,
      "soft": 1843,
      "dark": 1951,
      "metal": 2003
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1892,
      "soft": 2082,
      "dark": 2249,
      "metal": 2311
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2639,
      "soft": 2993,
      "dark": 3339,
      "metal": 3428
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 3906,
      "soft": 4308,
      "dark": 4507,
      "metal": 4602
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 5427,
      "soft": 5910,
      "dark": 6148,
      "metal": 6262
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1621,
      "soft": 1843,
      "dark": 1951,
      "metal": 2003
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1892,
      "soft": 2082,
      "dark": 2249,
      "metal": 2311
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2639,
      "soft": 2993,
      "dark": 3339,
      "metal": 3428
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 3906,
      "soft": 4308,
      "dark": 4507,
      "metal": 4602
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 5427,
      "soft": 5910,
      "dark": 6148,
      "metal": 6262
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2082,
      "soft": 2287,
      "dark": 2395,
      "metal": 2475
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2433,
      "soft": 2732,
      "dark": 2802,
      "metal": 2949
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3358,
      "soft": 3747,
      "dark": 3867,
      "metal": 3998
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 4126,
      "soft": 4776,
      "dark": 4894,
      "metal": 5071
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 5572,
      "soft": 6265,
      "dark": 6503,
      "metal": 6617
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2082,
      "soft": 2287,
      "dark": 2395,
      "metal": 2475,
      "naturoc": 2538
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2433,
      "soft": 2732,
      "dark": 2802,
      "metal": 2949,
      "naturoc": 3046
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3358,
      "soft": 3747,
      "dark": 3867,
      "metal": 3998,
      "naturoc": 3973
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 4126,
      "soft": 4776,
      "dark": 4894,
      "metal": 5071
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 5572,
      "soft": 6265,
      "dark": 6503,
      "metal": 6617
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2082,
      "soft": 2287,
      "dark": 2395,
      "metal": 2475,
      "naturoc": 2538
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2433,
      "soft": 2732,
      "dark": 2802,
      "metal": 2949,
      "naturoc": 3046
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3358,
      "soft": 3747,
      "dark": 3867,
      "metal": 3998,
      "naturoc": 3973
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 4126,
      "soft": 4776,
      "dark": 4894,
      "metal": 5071
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 5572,
      "soft": 6265,
      "dark": 6503,
      "metal": 6617
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2054,
      "soft": 2054,
      "naturoc": 2651
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2399,
      "soft": 2399,
      "naturoc": 3106
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3312,
      "soft": 3312,
      "naturoc": 4286
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 4457,
      "soft": 4457
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 6089,
      "soft": 6089
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2054,
      "soft": 2054,
      "naturoc": 2651
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2399,
      "soft": 2399,
      "naturoc": 3106
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3312,
      "soft": 3312,
      "naturoc": 4286
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3400-height",
      finishes: {"blanc": 4457,
      "soft": 4457
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3410-4000-height",
      finishes: {"blanc": 6089,
      "soft": 6089
    }},
    {
      model: "ON",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1646,
      "soft": 1941,
      "dark": 2200,
      "metal": 2319,
      "pearl": 2461,
      "shiny": 3310,
      "glossy": 4665,
      "nodato": 2030,
      "olmo": 2030,
      "sesamo": 2030,
      "jazz": 2030,
      "blond": 2030,
      "carruba": 2030,
      "naturoc": 2030,
      "coloroc": 2552,
      "masai": 2552,
      "sigaro": 2552,
      "cenere": 2552,
      "tabacco": 2330,
      "noce": 2172,
      "moka": 1747,
      "brina": 1747,
      "ghiaccio": 1747,
      "otter": 1747,
      "walnut": 1747,
      "sabbia": 1747,
      "quercia": 2095,
      "you": 1555,
      "stone": 2095,
      "concrete": 2766,
      "clay": 2766,
      "carrara": 2983
    }},
    {
      model: "KIN",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1646,
      "soft": 1941,
      "dark": 2200,
      "metal": 2319,
      "pearl": 2461,
      "shiny": 3310,
      "glossy": 4665,
      "nodato": 2093,
      "olmo": 2093,
      "sesamo": 2093,
      "jazz": 2093,
      "blond": 2093,
      "carruba": 2093,
      "naturoc": 2093,
      "coloroc": 2615,
      "masai": 2615,
      "sigaro": 2615,
      "cenere": 2615,
      "tabacco": 2393,
      "noce": 2235,
      "moka": 1747,
      "brina": 1747,
      "ghiaccio": 1747,
      "otter": 1747,
      "walnut": 1747,
      "sabbia": 1747,
      "quercia": 2095,
      "you": 1555,
      "stone": 2095,
      "concrete": 2766,
      "clay": 2766,
      "carrara": 2983
    }},
    {
      model: "KV",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1646,
      "soft": 1941,
      "dark": 2200,
      "metal": 2319,
      "pearl": 2461,
      "shiny": 3310,
      "glossy": 4665,
      "nodato": 2185,
      "olmo": 2185,
      "sesamo": 2185,
      "jazz": 2185,
      "blond": 2185,
      "carruba": 2185,
      "naturoc": 2185,
      "coloroc": 2707,
      "masai": 2707,
      "sigaro": 2707,
      "cenere": 2707,
      "tabacco": 2485,
      "noce": 2327,
      "moka": 1747,
      "brina": 1747,
      "ghiaccio": 1747,
      "otter": 1747,
      "walnut": 1747,
      "sabbia": 1747,
      "quercia": 2095,
      "you": 1555,
      "stone": 2095,
      "concrete": 2766,
      "clay": 2766,
      "carrara": 2983
    }},
    {
      model: "I1",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1816,
      "soft": 2111,
      "dark": 2370,
      "metal": 2489,
      "pearl": 2631,
      "shiny": 3480,
      "glossy": 4835,
      "nodato": 2200,
      "olmo": 2200,
      "sesamo": 2200,
      "jazz": 2200,
      "blond": 2200,
      "carruba": 2200,
      "naturoc": 2200,
      "coloroc": 2722,
      "masai": 2722,
      "sigaro": 2722,
      "cenere": 2722,
      "tabacco": 2500,
      "noce": 2342,
      "moka": 1917,
      "brina": 1917,
      "ghiaccio": 1917,
      "otter": 1917,
      "walnut": 1917,
      "sabbia": 1917,
      "quercia": 2265,
      "you": 1725,
      "stone": 2265,
      "concrete": 2936,
      "clay": 2936,
      "carrara": 3153
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1946,
      "soft": 2241,
      "dark": 2500,
      "metal": 2619,
      "pearl": 2761,
      "shiny": 3610,
      "glossy": 4965,
      "nodato": 2330,
      "olmo": 2330,
      "sesamo": 2330,
      "jazz": 2330,
      "blond": 2330,
      "carruba": 2330,
      "naturoc": 2330,
      "coloroc": 2852,
      "masai": 2852,
      "sigaro": 2852,
      "cenere": 2852,
      "tabacco": 2630,
      "noce": 2472,
      "moka": 2047,
      "brina": 2047,
      "ghiaccio": 2047,
      "otter": 2047,
      "walnut": 2047,
      "sabbia": 2047,
      "quercia": 2395,
      "you": 1855,
      "stone": 2395,
      "concrete": 3066,
      "clay": 3066,
      "carrara": 3283
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2040,
      "soft": 2335,
      "dark": 2594,
      "metal": 2713,
      "pearl": 2855,
      "shiny": 3704,
      "glossy": 5059,
      "nodato": 2424,
      "olmo": 2424,
      "sesamo": 2424,
      "jazz": 2424,
      "blond": 2424,
      "carruba": 2424,
      "naturoc": 2424,
      "coloroc": 2946,
      "masai": 2946,
      "sigaro": 2946,
      "cenere": 2946,
      "tabacco": 2724,
      "noce": 2566,
      "moka": 2141,
      "brina": 2141,
      "ghiaccio": 2141,
      "otter": 2141,
      "walnut": 2141,
      "sabbia": 2141,
      "quercia": 2489,
      "you": 1949,
      "stone": 2489,
      "concrete": 3160,
      "clay": 3160,
      "carrara": 3377
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2236,
      "soft": 2531,
      "dark": 2790,
      "metal": 2909,
      "pearl": 3051,
      "shiny": 3900,
      "glossy": 5255,
      "nodato": 2620,
      "olmo": 2620,
      "sesamo": 2620,
      "jazz": 2620,
      "blond": 2620,
      "carruba": 2620,
      "naturoc": 2620,
      "coloroc": 3142,
      "masai": 3142,
      "sigaro": 3142,
      "cenere": 3142,
      "tabacco": 2920,
      "noce": 2762,
      "moka": 2337,
      "brina": 2337,
      "ghiaccio": 2337,
      "otter": 2337,
      "walnut": 2337,
      "sabbia": 2337,
      "quercia": 2685,
      "you": 2145,
      "stone": 2685,
      "concrete": 3356,
      "clay": 3356,
      "carrara": 3573
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2132,
      "soft": 2427,
      "dark": 2686,
      "metal": 2805,
      "pearl": 2947,
      "shiny": 3796,
      "glossy": 5151,
      "nodato": 2516,
      "olmo": 2516,
      "sesamo": 2516,
      "jazz": 2516,
      "blond": 2516,
      "carruba": 2516,
      "naturoc": 2516,
      "coloroc": 3038,
      "masai": 3038,
      "sigaro": 3038,
      "cenere": 3038,
      "tabacco": 2816,
      "noce": 2658,
      "moka": 2233,
      "brina": 2233,
      "ghiaccio": 2233,
      "otter": 2233,
      "walnut": 2233,
      "sabbia": 2233,
      "quercia": 2581,
      "you": 2041,
      "stone": 2581,
      "concrete": 3252,
      "clay": 3252,
      "carrara": 3469
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2406,
      "soft": 2682,
      "dark": 2868,
      "metal": 2957
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2406,
      "soft": 2682,
      "dark": 2868,
      "metal": 2957
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2406,
      "soft": 2682,
      "dark": 2868,
      "metal": 2957
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2406,
      "soft": 2682,
      "dark": 2868,
      "metal": 2957
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2572,
      "soft": 2843,
      "dark": 3027,
      "metal": 3114
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2572,
      "soft": 2843,
      "dark": 3027,
      "metal": 3114
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3011,
      "soft": 3296,
      "dark": 3491,
      "metal": 3584
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3011,
      "soft": 3296,
      "dark": 3491,
      "metal": 3584,
      "naturoc": 3711
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3011,
      "soft": 3296,
      "dark": 3491,
      "metal": 3584,
      "naturoc": 3711
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3153,
      "soft": 3153,
      "naturoc": 4082
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3153,
      "soft": 3153,
      "naturoc": 4082
    }},
    {
      model: "ON",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1817,
      "soft": 2288,
      "dark": 2518,
      "metal": 2560,
      "pearl": 2728,
      "shiny": 3840,
      "glossy": 5070,
      "nodato": 2382,
      "olmo": 2382,
      "sesamo": 2382,
      "jazz": 2382,
      "blond": 2382,
      "carruba": 2382,
      "naturoc": 2382,
      "coloroc": 2813,
      "masai": 2813,
      "sigaro": 2813,
      "cenere": 2813,
      "tabacco": 2576,
      "noce": 2580,
      "moka": 2043,
      "brina": 2043,
      "ghiaccio": 2043,
      "otter": 2043,
      "walnut": 2043,
      "sabbia": 2043,
      "quercia": 2300,
      "you": 1748,
      "stone": 2300,
      "concrete": 3152,
      "clay": 3152,
      "carrara": 3398
    }},
    {
      model: "KIN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1817,
      "soft": 2288,
      "dark": 2518,
      "metal": 2560,
      "pearl": 2728,
      "shiny": 3840,
      "glossy": 5070,
      "nodato": 2445,
      "olmo": 2445,
      "sesamo": 2445,
      "jazz": 2445,
      "blond": 2445,
      "carruba": 2445,
      "naturoc": 2445,
      "coloroc": 2876,
      "masai": 2876,
      "sigaro": 2876,
      "cenere": 2876,
      "tabacco": 2639,
      "noce": 2643,
      "moka": 2043,
      "brina": 2043,
      "ghiaccio": 2043,
      "otter": 2043,
      "walnut": 2043,
      "sabbia": 2043,
      "quercia": 2300,
      "you": 1748,
      "stone": 2300,
      "concrete": 3152,
      "clay": 3152,
      "carrara": 3398
    }},
    {
      model: "KV",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1817,
      "soft": 2288,
      "dark": 2518,
      "metal": 2560,
      "pearl": 2728,
      "shiny": 3840,
      "glossy": 5070,
      "nodato": 2537,
      "olmo": 2537,
      "sesamo": 2537,
      "jazz": 2537,
      "blond": 2537,
      "carruba": 2537,
      "naturoc": 2537,
      "coloroc": 2968,
      "masai": 2968,
      "sigaro": 2968,
      "cenere": 2968,
      "tabacco": 2731,
      "noce": 2735,
      "moka": 2043,
      "brina": 2043,
      "ghiaccio": 2043,
      "otter": 2043,
      "walnut": 2043,
      "sabbia": 2043,
      "quercia": 2300,
      "you": 1748,
      "stone": 2300,
      "concrete": 3152,
      "clay": 3152,
      "carrara": 3398
    }},
    {
      model: "I1",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1987,
      "soft": 2458,
      "dark": 2688,
      "metal": 2730,
      "pearl": 2898,
      "shiny": 4010,
      "glossy": 5240,
      "nodato": 2552,
      "olmo": 2552,
      "sesamo": 2552,
      "jazz": 2552,
      "blond": 2552,
      "carruba": 2552,
      "naturoc": 2552,
      "coloroc": 2983,
      "masai": 2983,
      "sigaro": 2983,
      "cenere": 2983,
      "tabacco": 2746,
      "noce": 2750,
      "moka": 2213,
      "brina": 2213,
      "ghiaccio": 2213,
      "otter": 2213,
      "walnut": 2213,
      "sabbia": 2213,
      "quercia": 2470,
      "you": 1918,
      "stone": 2470,
      "concrete": 3322,
      "clay": 3322,
      "carrara": 3568
    }},
    {
      model: "I2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2117,
      "soft": 2588,
      "dark": 2818,
      "metal": 2860,
      "pearl": 3028,
      "shiny": 4140,
      "glossy": 5370,
      "nodato": 2682,
      "olmo": 2682,
      "sesamo": 2682,
      "jazz": 2682,
      "blond": 2682,
      "carruba": 2682,
      "naturoc": 2682,
      "coloroc": 3113,
      "masai": 3113,
      "sigaro": 3113,
      "cenere": 3113,
      "tabacco": 2876,
      "noce": 2880,
      "moka": 2343,
      "brina": 2343,
      "ghiaccio": 2343,
      "otter": 2343,
      "walnut": 2343,
      "sabbia": 2343,
      "quercia": 2600,
      "you": 2048,
      "stone": 2600,
      "concrete": 3452,
      "clay": 3452,
      "carrara": 3698
    }},
    {
      model: "Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2211,
      "soft": 2682,
      "dark": 2912,
      "metal": 2954,
      "pearl": 3122,
      "shiny": 4234,
      "glossy": 5464,
      "nodato": 2776,
      "olmo": 2776,
      "sesamo": 2776,
      "jazz": 2776,
      "blond": 2776,
      "carruba": 2776,
      "naturoc": 2776,
      "coloroc": 3207,
      "masai": 3207,
      "sigaro": 3207,
      "cenere": 3207,
      "tabacco": 2970,
      "noce": 2974,
      "moka": 2437,
      "brina": 2437,
      "ghiaccio": 2437,
      "otter": 2437,
      "walnut": 2437,
      "sabbia": 2437,
      "quercia": 2694,
      "you": 2142,
      "stone": 2694,
      "concrete": 3546,
      "clay": 3546,
      "carrara": 3792
    }},
    {
      model: "Q3",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2407,
      "soft": 2878,
      "dark": 3108,
      "metal": 3150,
      "pearl": 3318,
      "shiny": 4430,
      "glossy": 5660,
      "nodato": 2972,
      "olmo": 2972,
      "sesamo": 2972,
      "jazz": 2972,
      "blond": 2972,
      "carruba": 2972,
      "naturoc": 2972,
      "coloroc": 3403,
      "masai": 3403,
      "sigaro": 3403,
      "cenere": 3403,
      "tabacco": 3166,
      "noce": 3170,
      "moka": 2633,
      "brina": 2633,
      "ghiaccio": 2633,
      "otter": 2633,
      "walnut": 2633,
      "sabbia": 2633,
      "quercia": 2890,
      "you": 2338,
      "stone": 2890,
      "concrete": 3742,
      "clay": 3742,
      "carrara": 3988
    }},
    {
      model: "2Q2",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2303,
      "soft": 2774,
      "dark": 3004,
      "metal": 3046,
      "pearl": 3214,
      "shiny": 4326,
      "glossy": 5556,
      "nodato": 2868,
      "olmo": 2868,
      "sesamo": 2868,
      "jazz": 2868,
      "blond": 2868,
      "carruba": 2868,
      "naturoc": 2868,
      "coloroc": 3299,
      "masai": 3299,
      "sigaro": 3299,
      "cenere": 3299,
      "tabacco": 3062,
      "noce": 3066,
      "moka": 2529,
      "brina": 2529,
      "ghiaccio": 2529,
      "otter": 2529,
      "walnut": 2529,
      "sabbia": 2529,
      "quercia": 2786,
      "you": 2234,
      "stone": 2786,
      "concrete": 3638,
      "clay": 3638,
      "carrara": 3884
    }},
    {
      model: "PURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2621,
      "soft": 3000,
      "dark": 3186,
      "metal": 3276
    }},
    {
      model: "AURA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2621,
      "soft": 3000,
      "dark": 3186,
      "metal": 3276
    }},
    {
      model: "QUADRO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2621,
      "soft": 3000,
      "dark": 3186,
      "metal": 3276
    }},
    {
      model: "TRATTO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2621,
      "soft": 3000,
      "dark": 3186,
      "metal": 3276
    }},
    {
      model: "LUCIO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2639,
      "soft": 2993,
      "dark": 3339,
      "metal": 3428
    }},
    {
      model: "COLONIALE",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2639,
      "soft": 2993,
      "dark": 3339,
      "metal": 3428
    }},
    {
      model: "OTTAGONO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3358,
      "soft": 3747,
      "dark": 3867,
      "metal": 3998
    }},
    {
      model: "BIT",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3358,
      "soft": 3747,
      "dark": 3867,
      "metal": 3998,
      "naturoc": 3973
    }},
    {
      model: "EAN",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3358,
      "soft": 3747,
      "dark": 3867,
      "metal": 3998,
      "naturoc": 3973
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3312,
      "soft": 3312,
      "naturoc": 4286
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3312,
      "soft": 3312,
      "naturoc": 4286
    }},
    {
      model: "2Q2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1492,
      "soft": 1930,
      "dark": 2114,
      "metal": 2324,
      "nodato": 2097,
      "naturoc": 2097,
      "coloroc": 2336,
      "masai": 2336,
      "sigaro": 2336,
      "cenere": 2336,
      "tabacco": 2393,
      "noce": 2226
    }},
    {
      model: "2Q2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1810,
      "soft": 2194,
      "dark": 2380,
      "metal": 2673,
      "nodato": 2400,
      "naturoc": 2400,
      "coloroc": 2684,
      "masai": 2684,
      "sigaro": 2684,
      "cenere": 2684,
      "tabacco": 2765,
      "noce": 2557
    }},
    {
      model: "2Q2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2214,
      "soft": 2675,
      "dark": 2938,
      "metal": 3249,
      "nodato": 3005,
      "naturoc": 3005,
      "coloroc": 3306,
      "masai": 3306,
      "sigaro": 3306,
      "cenere": 3306,
      "tabacco": 3405,
      "noce": 3152
    }},
    {
      model: "2Q2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2299,
      "soft": 2794,
      "dark": 3082,
      "metal": 3457,
      "nodato": 3137,
      "naturoc": 3137,
      "coloroc": 3477,
      "masai": 3477,
      "sigaro": 3477,
      "cenere": 3477,
      "tabacco": 3553,
      "noce": 3295
    }},
    {
      model: "2Q2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1688,
      "soft": 2060,
      "dark": 2242,
      "metal": 2485,
      "nodato": 2172,
      "naturoc": 2172,
      "coloroc": 2492,
      "masai": 2492,
      "sigaro": 2492,
      "cenere": 2492,
      "tabacco": 2497,
      "noce": 2339
    }},
    {
      model: "2Q2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1919,
      "soft": 2382,
      "dark": 2567,
      "metal": 2864,
      "nodato": 2518,
      "naturoc": 2518,
      "coloroc": 2860,
      "masai": 2860,
      "sigaro": 2860,
      "cenere": 2860,
      "tabacco": 2847,
      "noce": 2683
    }},
    {
      model: "2Q2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2287,
      "soft": 2898,
      "dark": 3116,
      "metal": 3583,
      "nodato": 3061,
      "naturoc": 3061,
      "coloroc": 3366,
      "masai": 3366,
      "sigaro": 3366,
      "cenere": 3366,
      "tabacco": 3467,
      "noce": 3259
    }},
    {
      model: "2Q2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2446,
      "soft": 3040,
      "dark": 3280,
      "metal": 3769,
      "nodato": 3271,
      "naturoc": 3271,
      "coloroc": 3621,
      "masai": 3621,
      "sigaro": 3621,
      "cenere": 3621,
      "tabacco": 3699,
      "noce": 3543
    }},
    {
      model: "AURA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1516,
      "soft": 1809,
      "dark": 1960,
      "metal": 2164
    }},
    {
      model: "AURA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1783,
      "soft": 2138,
      "dark": 2320,
      "metal": 2571
    }},
    {
      model: "AURA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2314,
      "soft": 2744,
      "dark": 2964,
      "metal": 3270
    }},
    {
      model: "AURA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2479,
      "soft": 2942,
      "dark": 3185,
      "metal": 3500
    }},
    {
      model: "AURA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1612,
      "soft": 1964,
      "dark": 2116,
      "metal": 2446
    }},
    {
      model: "AURA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1897,
      "soft": 2322,
      "dark": 2504,
      "metal": 2905
    }},
    {
      model: "AURA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2447,
      "soft": 2962,
      "dark": 3183,
      "metal": 3616
    }},
    {
      model: "AURA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2625,
      "soft": 3188,
      "dark": 3428,
      "metal": 3879
    }},
    {
      model: "BIT",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1868,
      "soft": 2170,
      "dark": 2327,
      "metal": 2538,
      "naturoc": 2576
    }},
    {
      model: "BIT",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2198,
      "soft": 2565,
      "dark": 2753,
      "metal": 3013,
      "naturoc": 3053
    }},
    {
      model: "BIT",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2772,
      "soft": 3209,
      "dark": 3434,
      "metal": 3679,
      "naturoc": 3860
    }},
    {
      model: "BIT",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2947,
      "soft": 3408,
      "dark": 3651,
      "metal": 3968,
      "naturoc": 4178
    }},
    {
      model: "BIT",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2079,
      "soft": 2361,
      "dark": 2509,
      "metal": 2509,
      "naturoc": 2642
    }},
    {
      model: "BIT",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2453,
      "soft": 2847,
      "dark": 2944,
      "metal": 2944,
      "naturoc": 3123
    }},
    {
      model: "BIT",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2908,
      "soft": 3432,
      "dark": 3657,
      "metal": 3657,
      "naturoc": 3734
    }},
    {
      model: "BIT",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3147,
      "soft": 3720,
      "dark": 3964,
      "metal": 3964,
      "naturoc": 4066
    }},
    {
      model: "COLONIALE",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1645,
      "soft": 1930,
      "dark": 2085,
      "metal": 2328
    }},
    {
      model: "COLONIALE",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1935,
      "soft": 2281,
      "dark": 2511,
      "metal": 2766
    }},
    {
      model: "COLONIALE",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2495,
      "soft": 2925,
      "dark": 3146,
      "metal": 3451
    }},
    {
      model: "COLONIALE",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2734,
      "soft": 3204,
      "dark": 3452,
      "metal": 3772
    }},
    {
      model: "COLONIALE",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1736,
      "soft": 2082,
      "dark": 2237,
      "metal": 2484
    }},
    {
      model: "COLONIALE",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2044,
      "soft": 2463,
      "dark": 2695,
      "metal": 2950
    }},
    {
      model: "COLONIALE",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2583,
      "soft": 3090,
      "dark": 3364,
      "metal": 3670
    }},
    {
      model: "COLONIALE",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2783,
      "soft": 3333,
      "dark": 3634,
      "metal": 3951
    }},
    {
      model: "DOGEPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2040,
      "soft": 2299,
      "metal": 2541
    }},
    {
      model: "DOGEPPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2155,
      "soft": 2364,
      "metal": 2784
    }},
    {
      model: "DOGEPU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2040,
      "soft": 2299,
      "metal": 2541
    }},
    {
      model: "DOGEPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2285,
      "soft": 2638,
      "metal": 3015
    }},
    {
      model: "DOGEPPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2409,
      "soft": 2650,
      "metal": 3138
    }},
    {
      model: "DOGEPU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2285,
      "soft": 2638,
      "metal": 3015
    }},
    {
      model: "DOGEPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2871,
      "soft": 3294,
      "metal": 3745
    }},
    {
      model: "DOGEPPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3019,
      "soft": 3309,
      "metal": 3893
    }},
    {
      model: "DOGEPU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2871,
      "soft": 3294,
      "metal": 3745
    }},
    {
      model: "DOGEVP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2388,
      "soft": 2500,
      "metal": 2733
    }},
    {
      model: "DOGEVP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2577,
      "soft": 2875,
      "metal": 3251
    }},
    {
      model: "DOGEVP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3153,
      "soft": 3574,
      "metal": 4026
    }},
    {
      model: "DOGEVPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2388,
      "soft": 2500,
      "metal": 2733
    }},
    {
      model: "DOGEVPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2577,
      "soft": 2875,
      "metal": 3251
    }},
    {
      model: "DOGEVPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3153,
      "soft": 3574,
      "metal": 4026
    }},
    {
      model: "DOGEVU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2388,
      "soft": 2500,
      "metal": 2733
    }},
    {
      model: "DOGEVU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2577,
      "soft": 2875,
      "metal": 3251
    }},
    {
      model: "DOGEVU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3153,
      "soft": 3574,
      "metal": 4026
    }},
    {
      model: "EAN",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1868,
      "soft": 2170,
      "dark": 2327,
      "metal": 2538,
      "naturoc": 2576
    }},
    {
      model: "EAN",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2198,
      "soft": 2565,
      "dark": 2753,
      "metal": 3013,
      "naturoc": 3053
    }},
    {
      model: "EAN",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2772,
      "soft": 3209,
      "dark": 3434,
      "metal": 3679,
      "naturoc": 3860
    }},
    {
      model: "EAN",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2947,
      "soft": 3408,
      "dark": 3651,
      "metal": 3968,
      "naturoc": 4178
    }},
    {
      model: "EAN",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2079,
      "soft": 2361,
      "dark": 2509,
      "metal": 2509,
      "naturoc": 2642
    }},
    {
      model: "EAN",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2453,
      "soft": 2847,
      "dark": 2944,
      "metal": 2944,
      "naturoc": 3123
    }},
    {
      model: "EAN",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2908,
      "soft": 3432,
      "dark": 3657,
      "metal": 3657,
      "naturoc": 3734
    }},
    {
      model: "EAN",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3147,
      "soft": 3720,
      "dark": 3964,
      "metal": 3964,
      "naturoc": 4066
    }},
    {
      model: "ESPRIT",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2047,
      "soft": 2421
    }},
    {
      model: "ESPRIT",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2423,
      "soft": 2880
    }},
    {
      model: "ESPRIT",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3064,
      "soft": 3598
    }},
    {
      model: "ESPRIT",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3287,
      "soft": 3855
    }},
    {
      model: "ESPRIT",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2119,
      "soft": 2507
    }},
    {
      model: "ESPRIT",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2512,
      "soft": 2979
    }},
    {
      model: "ESPRIT",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3138,
      "soft": 3706
    }},
    {
      model: "ESPRIT",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3374,
      "soft": 3983
    }},
    {
      model: "GIOTTO2PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1483,
      "soft": 1779
    }},
    {
      model: "GIOTTO2PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1416,
      "soft": 1733
    }},
    {
      model: "GIOTTO2VP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1683,
      "soft": 2019
    }},
    {
      model: "GIOTTO2VU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1677,
      "soft": 2013
    }},
    {
      model: "GIOTTO2PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1729,
      "soft": 2104
    }},
    {
      model: "GIOTTO2PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1673,
      "soft": 2050
    }},
    {
      model: "GIOTTO2VP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1982,
      "soft": 2388
    }},
    {
      model: "GIOTTO2VU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1974,
      "soft": 2379
    }},
    {
      model: "GIOTTO2PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2276,
      "soft": 2751
    }},
    {
      model: "GIOTTO2PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2211,
      "soft": 2685
    }},
    {
      model: "GIOTTO2VP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2473,
      "soft": 2948
    }},
    {
      model: "GIOTTO2VU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2473,
      "soft": 2948
    }},
    {
      model: "GIOTTOG",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1532,
      "soft": 1823
    }},
    {
      model: "GIOTTOG",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1901,
      "soft": 2156
    }},
    {
      model: "GIOTTOG",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2378,
      "soft": 2815
    }},
    {
      model: "GRAFFIATA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2087,
      "soft": 2087,
      "naturoc": 2769
    }},
    {
      model: "GRAFFIATA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2467,
      "soft": 2467,
      "naturoc": 3281
    }},
    {
      model: "GRAFFIATA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3038,
      "soft": 3038,
      "naturoc": 4134
    }},
    {
      model: "GRAFFIATA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3277,
      "soft": 3277,
      "naturoc": 4493
    }},
    {
      model: "GRAFFIATA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2288,
      "soft": 2288,
      "naturoc": 2837
    }},
    {
      model: "GRAFFIATA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2706,
      "soft": 2706,
      "naturoc": 3353
    }},
    {
      model: "GRAFFIATA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3315,
      "soft": 3315,
      "naturoc": 4070
    }},
    {
      model: "GRAFFIATA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3588,
      "soft": 3588,
      "naturoc": 4447
    }},
    {
      model: "I1",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1176,
      "soft": 1614,
      "dark": 1798,
      "metal": 2008,
      "nodato": 1781,
      "naturoc": 1781,
      "coloroc": 2020,
      "masai": 2020,
      "sigaro": 2020,
      "cenere": 2020,
      "tabacco": 2077,
      "noce": 1910
    }},
    {
      model: "I1",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1494,
      "soft": 1878,
      "dark": 2064,
      "metal": 2357,
      "nodato": 2084,
      "naturoc": 2084,
      "coloroc": 2368,
      "masai": 2368,
      "sigaro": 2368,
      "cenere": 2368,
      "tabacco": 2449,
      "noce": 2241
    }},
    {
      model: "I1",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1898,
      "soft": 2359,
      "dark": 2622,
      "metal": 2933,
      "nodato": 2689,
      "naturoc": 2689,
      "coloroc": 2990,
      "masai": 2990,
      "sigaro": 2990,
      "cenere": 2990,
      "tabacco": 3089,
      "noce": 2836
    }},
    {
      model: "I1",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1983,
      "soft": 2478,
      "dark": 2766,
      "metal": 3141,
      "nodato": 2821,
      "naturoc": 2821,
      "coloroc": 3161,
      "masai": 3161,
      "sigaro": 3161,
      "cenere": 3161,
      "tabacco": 3237,
      "noce": 2979
    }},
    {
      model: "I1",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1372,
      "soft": 1744,
      "dark": 1926,
      "metal": 2169,
      "nodato": 1856,
      "naturoc": 1856,
      "coloroc": 2176,
      "masai": 2176,
      "sigaro": 2176,
      "cenere": 2176,
      "tabacco": 2181,
      "noce": 2023
    }},
    {
      model: "I1",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1603,
      "soft": 2066,
      "dark": 2251,
      "metal": 2548,
      "nodato": 2202,
      "naturoc": 2202,
      "coloroc": 2544,
      "masai": 2544,
      "sigaro": 2544,
      "cenere": 2544,
      "tabacco": 2531,
      "noce": 2367
    }},
    {
      model: "I1",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1971,
      "soft": 2582,
      "dark": 2800,
      "metal": 3267,
      "nodato": 2745,
      "naturoc": 2745,
      "coloroc": 3050,
      "masai": 3050,
      "sigaro": 3050,
      "cenere": 3050,
      "tabacco": 3151,
      "noce": 2943
    }},
    {
      model: "I1",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2130,
      "soft": 2724,
      "dark": 2964,
      "metal": 3453,
      "nodato": 2955,
      "naturoc": 2955,
      "coloroc": 3305,
      "masai": 3305,
      "sigaro": 3305,
      "cenere": 3305,
      "tabacco": 3383,
      "noce": 3227
    }},
    {
      model: "I2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1306,
      "soft": 1744,
      "dark": 1928,
      "metal": 2138,
      "nodato": 1911,
      "naturoc": 1911,
      "coloroc": 2150,
      "masai": 2150,
      "sigaro": 2150,
      "cenere": 2150,
      "tabacco": 2207,
      "noce": 2040
    }},
    {
      model: "I2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1624,
      "soft": 2008,
      "dark": 2194,
      "metal": 2487,
      "nodato": 2214,
      "naturoc": 2214,
      "coloroc": 2498,
      "masai": 2498,
      "sigaro": 2498,
      "cenere": 2498,
      "tabacco": 2579,
      "noce": 2371
    }},
    {
      model: "I2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2028,
      "soft": 2489,
      "dark": 2752,
      "metal": 3063,
      "nodato": 2819,
      "naturoc": 2819,
      "coloroc": 3120,
      "masai": 3120,
      "sigaro": 3120,
      "cenere": 3120,
      "tabacco": 3219,
      "noce": 2966
    }},
    {
      model: "I2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2113,
      "soft": 2608,
      "dark": 2896,
      "metal": 3271,
      "nodato": 2951,
      "naturoc": 2951,
      "coloroc": 3291,
      "masai": 3291,
      "sigaro": 3291,
      "cenere": 3291,
      "tabacco": 3367,
      "noce": 3109
    }},
    {
      model: "I2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1502,
      "soft": 1874,
      "dark": 2056,
      "metal": 2299,
      "nodato": 1986,
      "naturoc": 1986,
      "coloroc": 2306,
      "masai": 2306,
      "sigaro": 2306,
      "cenere": 2306,
      "tabacco": 2311,
      "noce": 2153
    }},
    {
      model: "I2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1733,
      "soft": 2196,
      "dark": 2381,
      "metal": 2678,
      "nodato": 2332,
      "naturoc": 2332,
      "coloroc": 2674,
      "masai": 2674,
      "sigaro": 2674,
      "cenere": 2674,
      "tabacco": 2661,
      "noce": 2497
    }},
    {
      model: "I2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2101,
      "soft": 2712,
      "dark": 2930,
      "metal": 3397,
      "nodato": 2875,
      "naturoc": 2875,
      "coloroc": 3180,
      "masai": 3180,
      "sigaro": 3180,
      "cenere": 3180,
      "tabacco": 3281,
      "noce": 3073
    }},
    {
      model: "I2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2260,
      "soft": 2854,
      "dark": 3094,
      "metal": 3583,
      "nodato": 3085,
      "naturoc": 3085,
      "coloroc": 3435,
      "masai": 3435,
      "sigaro": 3435,
      "cenere": 3435,
      "tabacco": 3513,
      "noce": 3357
    }},
    {
      model: "KIN",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"nodato": 1674,
      "naturoc": 1674,
      "coloroc": 1913,
      "masai": 1913,
      "sigaro": 1913,
      "cenere": 1913,
      "tabacco": 1970,
      "noce": 1803
    }},
    {
      model: "KIN",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"nodato": 1977,
      "naturoc": 1977,
      "coloroc": 2261,
      "masai": 2261,
      "sigaro": 2261,
      "cenere": 2261,
      "tabacco": 2342,
      "noce": 2134
    }},
    {
      model: "KIN",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"nodato": 2582,
      "naturoc": 2582,
      "coloroc": 2883,
      "masai": 2883,
      "sigaro": 2883,
      "cenere": 2883,
      "tabacco": 2982,
      "noce": 2729
    }},
    {
      model: "KIN",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"nodato": 2714,
      "naturoc": 2714,
      "coloroc": 3054,
      "masai": 3054,
      "sigaro": 3054,
      "cenere": 3054,
      "tabacco": 3130,
      "noce": 2872
    }},
    {
      model: "KIN",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"nodato": 1749,
      "naturoc": 1749,
      "coloroc": 2069,
      "masai": 2069,
      "sigaro": 2069,
      "cenere": 2069,
      "tabacco": 2074,
      "noce": 1916
    }},
    {
      model: "KIN",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"nodato": 2095,
      "naturoc": 2095,
      "coloroc": 2437,
      "masai": 2437,
      "sigaro": 2437,
      "cenere": 2437,
      "tabacco": 2424,
      "noce": 2260
    }},
    {
      model: "KIN",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"nodato": 2638,
      "naturoc": 2638,
      "coloroc": 2943,
      "masai": 2943,
      "sigaro": 2943,
      "cenere": 2943,
      "tabacco": 3044,
      "noce": 2836
    }},
    {
      model: "KIN",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"nodato": 2848,
      "naturoc": 2848,
      "coloroc": 3198,
      "masai": 3198,
      "sigaro": 3198,
      "cenere": 3198,
      "tabacco": 3276,
      "noce": 3120
    }},
    {
      model: "KV",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"nodato": 1766,
      "naturoc": 1766,
      "coloroc": 2005,
      "masai": 2005,
      "sigaro": 2005,
      "cenere": 2005,
      "tabacco": 2062,
      "noce": 1895
    }},
    {
      model: "KV",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"nodato": 2069,
      "naturoc": 2069,
      "coloroc": 2353,
      "masai": 2353,
      "sigaro": 2353,
      "cenere": 2353,
      "tabacco": 2434,
      "noce": 2226
    }},
    {
      model: "KV",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"nodato": 2674,
      "naturoc": 2674,
      "coloroc": 2975,
      "masai": 2975,
      "sigaro": 2975,
      "cenere": 2975,
      "tabacco": 3074,
      "noce": 2821
    }},
    {
      model: "KV",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"nodato": 2806,
      "naturoc": 2806,
      "coloroc": 3146,
      "masai": 3146,
      "sigaro": 3146,
      "cenere": 3146,
      "tabacco": 3222,
      "noce": 2964
    }},
    {
      model: "KV",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"nodato": 1841,
      "naturoc": 1841,
      "coloroc": 2161,
      "masai": 2161,
      "sigaro": 2161,
      "cenere": 2161,
      "tabacco": 2166,
      "noce": 2008
    }},
    {
      model: "KV",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"nodato": 2187,
      "naturoc": 2187,
      "coloroc": 2529,
      "masai": 2529,
      "sigaro": 2529,
      "cenere": 2529,
      "tabacco": 2516,
      "noce": 2352
    }},
    {
      model: "KV",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"nodato": 2730,
      "naturoc": 2730,
      "coloroc": 3035,
      "masai": 3035,
      "sigaro": 3035,
      "cenere": 3035,
      "tabacco": 3136,
      "noce": 2928
    }},
    {
      model: "KV",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"nodato": 2940,
      "naturoc": 2940,
      "coloroc": 3290,
      "masai": 3290,
      "sigaro": 3290,
      "cenere": 3290,
      "tabacco": 3368,
      "noce": 3212
    }},
    {
      model: "LUCIO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1645,
      "soft": 1930,
      "dark": 2085,
      "metal": 2328
    }},
    {
      model: "LUCIO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1935,
      "soft": 2281,
      "dark": 2511,
      "metal": 2766
    }},
    {
      model: "LUCIO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2495,
      "soft": 2925,
      "dark": 3146,
      "metal": 3451
    }},
    {
      model: "LUCIO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2734,
      "soft": 3204,
      "dark": 3452,
      "metal": 3772
    }},
    {
      model: "LUCIO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1736,
      "soft": 2082,
      "dark": 2237,
      "metal": 2484
    }},
    {
      model: "LUCIO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2044,
      "soft": 2463,
      "dark": 2695,
      "metal": 2950
    }},
    {
      model: "LUCIO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2583,
      "soft": 3090,
      "dark": 3364,
      "metal": 3670
    }},
    {
      model: "LUCIO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2783,
      "soft": 3333,
      "dark": 3634,
      "metal": 3951
    }},
    {
      model: "NODO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2087,
      "soft": 2087,
      "naturoc": 2769
    }},
    {
      model: "NODO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2467,
      "soft": 2467,
      "naturoc": 3281
    }},
    {
      model: "NODO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3038,
      "soft": 3038,
      "naturoc": 4134
    }},
    {
      model: "NODO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3277,
      "soft": 3277,
      "naturoc": 4493
    }},
    {
      model: "NODO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2288,
      "soft": 2288,
      "naturoc": 2837
    }},
    {
      model: "NODO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2706,
      "soft": 2706,
      "naturoc": 3353
    }},
    {
      model: "NODO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 3315,
      "soft": 3315,
      "naturoc": 4070
    }},
    {
      model: "NODO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3588,
      "soft": 3588,
      "naturoc": 4447
    }},
    {
      model: "ON",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1006,
      "soft": 1444,
      "dark": 1628,
      "metal": 1838,
      "nodato": 1611,
      "naturoc": 1611,
      "coloroc": 1850,
      "masai": 1850,
      "sigaro": 1850,
      "cenere": 1850,
      "tabacco": 1907,
      "noce": 1740
    }},
    {
      model: "ON",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1324,
      "soft": 1708,
      "dark": 1894,
      "metal": 2187,
      "nodato": 1914,
      "naturoc": 1914,
      "coloroc": 2198,
      "masai": 2198,
      "sigaro": 2198,
      "cenere": 2198,
      "tabacco": 2279,
      "noce": 2071
    }},
    {
      model: "ON",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1728,
      "soft": 2189,
      "dark": 2452,
      "metal": 2763,
      "nodato": 2519,
      "naturoc": 2519,
      "coloroc": 2820,
      "masai": 2820,
      "sigaro": 2820,
      "cenere": 2820,
      "tabacco": 2919,
      "noce": 2666
    }},
    {
      model: "ON",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1813,
      "soft": 2308,
      "dark": 2596,
      "metal": 2971,
      "nodato": 2651,
      "naturoc": 2651,
      "coloroc": 2991,
      "masai": 2991,
      "sigaro": 2991,
      "cenere": 2991,
      "tabacco": 3067,
      "noce": 2809
    }},
    {
      model: "ON",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1202,
      "soft": 1574,
      "dark": 1756,
      "metal": 1999,
      "nodato": 1686,
      "naturoc": 1686,
      "coloroc": 2006,
      "masai": 2006,
      "sigaro": 2006,
      "cenere": 2006,
      "tabacco": 2011,
      "noce": 1853
    }},
    {
      model: "ON",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1433,
      "soft": 1896,
      "dark": 2081,
      "metal": 2378,
      "nodato": 2032,
      "naturoc": 2032,
      "coloroc": 2374,
      "masai": 2374,
      "sigaro": 2374,
      "cenere": 2374,
      "tabacco": 2361,
      "noce": 2197
    }},
    {
      model: "ON",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1801,
      "soft": 2412,
      "dark": 2630,
      "metal": 3097,
      "nodato": 2575,
      "naturoc": 2575,
      "coloroc": 2880,
      "masai": 2880,
      "sigaro": 2880,
      "cenere": 2880,
      "tabacco": 2981,
      "noce": 2773
    }},
    {
      model: "ON",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 1960,
      "soft": 2554,
      "dark": 2794,
      "metal": 3283,
      "nodato": 2785,
      "naturoc": 2785,
      "coloroc": 3135,
      "masai": 3135,
      "sigaro": 3135,
      "cenere": 3135,
      "tabacco": 3213,
      "noce": 3057
    }},
    {
      model: "ON",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 940,
      "soft": 1236,
      "moka": 907,
      "brina": 907,
      "ghiaccio": 907,
      "otter": 907,
      "walnut": 907
    }},
    {
      model: "ON",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1153,
      "soft": 1511,
      "moka": 1114,
      "brina": 1114,
      "ghiaccio": 1114,
      "otter": 1114,
      "walnut": 1114
    }},
    {
      model: "ONGA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1595,
      "soft": 1903,
      "dark": 2064,
      "metal": 2277,
      "nodato": 2068,
      "naturoc": 2068,
      "coloroc": 2281,
      "masai": 2281,
      "sigaro": 2281,
      "cenere": 2281,
      "tabacco": 2404,
      "noce": 2201
    }},
    {
      model: "ONGA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1810,
      "soft": 2209,
      "dark": 2398,
      "metal": 2657,
      "nodato": 2411,
      "naturoc": 2411,
      "coloroc": 2707,
      "masai": 2707,
      "sigaro": 2707,
      "cenere": 2707,
      "tabacco": 2866,
      "noce": 2570
    }},
    {
      model: "ONGA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2391,
      "soft": 2837,
      "dark": 3066,
      "metal": 3383,
      "nodato": 3083,
      "naturoc": 3083,
      "coloroc": 3384,
      "masai": 3384,
      "sigaro": 3384,
      "cenere": 3384,
      "tabacco": 3576,
      "noce": 3277
    }},
    {
      model: "ONGA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2563,
      "soft": 3041,
      "dark": 3293,
      "metal": 3621,
      "nodato": 3291,
      "naturoc": 3291,
      "coloroc": 3628,
      "masai": 3628,
      "sigaro": 3628,
      "cenere": 3628,
      "tabacco": 3806,
      "noce": 3497
    }},
    {
      model: "OPEN1PP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1702,
      "soft": 2048
    }},
    {
      model: "OPEN1PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1702,
      "soft": 2048
    }},
    {
      model: "OPEN1PU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1596,
      "soft": 1942
    }},
    {
      model: "OPEN1PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1596,
      "soft": 1942
    }},
    {
      model: "OPEN1VP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1945,
      "soft": 2166
    }},
    {
      model: "OPEN1VP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1945,
      "soft": 2166
    }},
    {
      model: "OPEN1VU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1846,
      "soft": 2133
    }},
    {
      model: "OPEN1VU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1846,
      "soft": 2133
    }},
    {
      model: "OPEN1PP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1966,
      "soft": 2377
    }},
    {
      model: "OPEN1PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1966,
      "soft": 2377
    }},
    {
      model: "OPEN1PU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1844,
      "soft": 2254
    }},
    {
      model: "OPEN1PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1844,
      "soft": 2254
    }},
    {
      model: "OPEN1VP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2248,
      "soft": 2514
    }},
    {
      model: "OPEN1VP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2248,
      "soft": 2514
    }},
    {
      model: "OPEN1VU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2129,
      "soft": 2461
    }},
    {
      model: "OPEN1VU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2129,
      "soft": 2461
    }},
    {
      model: "OPEN1PP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2496,
      "soft": 2985
    }},
    {
      model: "OPEN1PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2496,
      "soft": 2985
    }},
    {
      model: "OPEN1PU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2350,
      "soft": 2840
    }},
    {
      model: "OPEN1PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2350,
      "soft": 2840
    }},
    {
      model: "OPEN1VP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2831,
      "soft": 3148
    }},
    {
      model: "OPEN1VP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2831,
      "soft": 3148
    }},
    {
      model: "OPEN1VU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2690,
      "soft": 3007
    }},
    {
      model: "OPEN1VU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2690,
      "soft": 3007
    }},
    {
      model: "OPEN8PP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1543,
      "soft": 1889
    }},
    {
      model: "OPEN8PP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1812,
      "soft": 2231
    }},
    {
      model: "OPEN8PP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2306,
      "soft": 2764
    }},
    {
      model: "OPEN8PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1543,
      "soft": 1889
    }},
    {
      model: "OPEN8PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1812,
      "soft": 2231
    }},
    {
      model: "OPEN8PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2306,
      "soft": 2764
    }},
    {
      model: "OPEN8PU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1460,
      "soft": 1806
    }},
    {
      model: "OPEN8PU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1715,
      "soft": 2134
    }},
    {
      model: "OPEN8PU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2191,
      "soft": 2651
    }},
    {
      model: "OPEN8PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1460,
      "soft": 1806
    }},
    {
      model: "OPEN8PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1715,
      "soft": 2134
    }},
    {
      model: "OPEN8PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2191,
      "soft": 2651
    }},
    {
      model: "OPEN8VP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1795,
      "soft": 2066
    }},
    {
      model: "OPEN8VP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2121,
      "soft": 2440
    }},
    {
      model: "OPEN8VP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2555,
      "soft": 3009
    }},
    {
      model: "OPEN8VP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1795,
      "soft": 2066
    }},
    {
      model: "OPEN8VP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2121,
      "soft": 2440
    }},
    {
      model: "OPEN8VP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2555,
      "soft": 3009
    }},
    {
      model: "OPEN15PP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1506,
      "soft": 1723
    }},
    {
      model: "OPEN15PP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1771,
      "soft": 2037
    }},
    {
      model: "OPEN15PP",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2265,
      "soft": 2582
    }},
    {
      model: "OPEN15PU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1506,
      "soft": 1723
    }},
    {
      model: "OPEN15PU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1771,
      "soft": 2037
    }},
    {
      model: "OPEN15PU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2265,
      "soft": 2582
    }},
    {
      model: "OPENG",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1560,
      "soft": 1720,
      "dark": 1829
    }},
    {
      model: "OPENG",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1560,
      "soft": 1720
    }},
    {
      model: "OPENG",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1736,
      "soft": 2082,
      "dark": 2237,
      "metal": 2484
    }},
    {
      model: "OPENG",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1895,
      "soft": 2090,
      "dark": 2224
    }},
    {
      model: "OPENG",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1895,
      "soft": 2090
    }},
    {
      model: "OPENG",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2044,
      "soft": 2463,
      "dark": 2695,
      "metal": 2950
    }},
    {
      model: "OPENG",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1812,
      "soft": 2008,
      "dark": 2141
    }},
    {
      model: "OPENG",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 1812,
      "soft": 2008
    }},
    {
      model: "OPENG",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2583,
      "soft": 3090,
      "dark": 3364,
      "metal": 3670
    }},
    {
      model: "OPENG",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2572,
      "soft": 2843,
      "dark": 3027
    }},
    {
      model: "OPENG",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2783,
      "soft": 3333,
      "dark": 3634,
      "metal": 3951
    }},
    {
      model: "OTTAGONO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1868,
      "soft": 2170,
      "dark": 2327,
      "metal": 2538,
      "naturoc": 2576
    }},
    {
      model: "OTTAGONO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2198,
      "soft": 2565,
      "dark": 2753,
      "metal": 3013,
      "naturoc": 3053
    }},
    {
      model: "OTTAGONO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2772,
      "soft": 3209,
      "dark": 3434,
      "metal": 3679,
      "naturoc": 3860
    }},
    {
      model: "OTTAGONO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2947,
      "soft": 3408,
      "dark": 3651,
      "metal": 3968,
      "naturoc": 4178
    }},
    {
      model: "OTTAGONO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2079,
      "soft": 2361,
      "dark": 2509,
      "metal": 2509
    }},
    {
      model: "OTTAGONO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2453,
      "soft": 2847,
      "dark": 2944,
      "metal": 2944
    }},
    {
      model: "OTTAGONO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2908,
      "soft": 3432,
      "dark": 3657,
      "metal": 3657
    }},
    {
      model: "OTTAGONO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3147,
      "soft": 3720,
      "dark": 3964,
      "metal": 3964
    }},
    {
      model: "PALLADIO",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1517,
      "soft": 1751
    }},
    {
      model: "PALLADIO",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1696,
      "soft": 2068
    }},
    {
      model: "PALLADIO",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2178,
      "soft": 2623
    }},
    {
      model: "PURA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1516,
      "soft": 1809,
      "dark": 1960,
      "metal": 2164
    }},
    {
      model: "PURA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1783,
      "soft": 2138,
      "dark": 2320,
      "metal": 2571
    }},
    {
      model: "PURA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2314,
      "soft": 2744,
      "dark": 2964,
      "metal": 3270
    }},
    {
      model: "PURA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2479,
      "soft": 2942,
      "dark": 3185,
      "metal": 3500
    }},
    {
      model: "PURA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1612,
      "soft": 1964,
      "dark": 2116,
      "metal": 2446
    }},
    {
      model: "PURA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1897,
      "soft": 2322,
      "dark": 2504,
      "metal": 2905
    }},
    {
      model: "PURA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2447,
      "soft": 2962,
      "dark": 3183,
      "metal": 3616
    }},
    {
      model: "PURA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2625,
      "soft": 3188,
      "dark": 3428,
      "metal": 3879
    }},
    {
      model: "Q2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1400,
      "soft": 1838,
      "dark": 2022,
      "metal": 2232,
      "nodato": 2005,
      "naturoc": 2005,
      "coloroc": 2244,
      "masai": 2244,
      "sigaro": 2244,
      "cenere": 2244,
      "tabacco": 2301,
      "noce": 2134
    }},
    {
      model: "Q2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1718,
      "soft": 2102,
      "dark": 2288,
      "metal": 2581,
      "nodato": 2308,
      "naturoc": 2308,
      "coloroc": 2592,
      "masai": 2592,
      "sigaro": 2592,
      "cenere": 2592,
      "tabacco": 2673,
      "noce": 2465
    }},
    {
      model: "Q2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2122,
      "soft": 2583,
      "dark": 2846,
      "metal": 3157,
      "nodato": 2913,
      "naturoc": 2913,
      "coloroc": 3214,
      "masai": 3214,
      "sigaro": 3214,
      "cenere": 3214,
      "tabacco": 3313,
      "noce": 3060
    }},
    {
      model: "Q2",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2207,
      "soft": 2702,
      "dark": 2990,
      "metal": 3365,
      "nodato": 3045,
      "naturoc": 3045,
      "coloroc": 3385,
      "masai": 3385,
      "sigaro": 3385,
      "cenere": 3385,
      "tabacco": 3461,
      "noce": 3203
    }},
    {
      model: "Q2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1596,
      "soft": 1968,
      "dark": 2150,
      "metal": 2393,
      "nodato": 2080,
      "naturoc": 2080,
      "coloroc": 2400,
      "masai": 2400,
      "sigaro": 2400,
      "cenere": 2400,
      "tabacco": 2405,
      "noce": 2247
    }},
    {
      model: "Q2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1827,
      "soft": 2290,
      "dark": 2475,
      "metal": 2772,
      "nodato": 2426,
      "naturoc": 2426,
      "coloroc": 2768,
      "masai": 2768,
      "sigaro": 2768,
      "cenere": 2768,
      "tabacco": 2755,
      "noce": 2591
    }},
    {
      model: "Q2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2195,
      "soft": 2806,
      "dark": 3024,
      "metal": 3491,
      "nodato": 2969,
      "naturoc": 2969,
      "coloroc": 3274,
      "masai": 3274,
      "sigaro": 3274,
      "cenere": 3274,
      "tabacco": 3375,
      "noce": 3167
    }},
    {
      model: "Q2",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2354,
      "soft": 2948,
      "dark": 3188,
      "metal": 3677,
      "nodato": 3179,
      "naturoc": 3179,
      "coloroc": 3529,
      "masai": 3529,
      "sigaro": 3529,
      "cenere": 3529,
      "tabacco": 3607,
      "noce": 3451
    }},
    {
      model: "Q3",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1596,
      "soft": 2034,
      "dark": 2218,
      "metal": 2428,
      "nodato": 2201,
      "naturoc": 2201,
      "coloroc": 2440,
      "masai": 2440,
      "sigaro": 2440,
      "cenere": 2440,
      "tabacco": 2497,
      "noce": 2330
    }},
    {
      model: "Q3",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1914,
      "soft": 2298,
      "dark": 2484,
      "metal": 2777,
      "nodato": 2504,
      "naturoc": 2504,
      "coloroc": 2788,
      "masai": 2788,
      "sigaro": 2788,
      "cenere": 2788,
      "tabacco": 2869,
      "noce": 2661
    }},
    {
      model: "Q3",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2318,
      "soft": 2779,
      "dark": 3042,
      "metal": 3353,
      "nodato": 3109,
      "naturoc": 3109,
      "coloroc": 3410,
      "masai": 3410,
      "sigaro": 3410,
      "cenere": 3410,
      "tabacco": 3509,
      "noce": 3256
    }},
    {
      model: "Q3",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2403,
      "soft": 2898,
      "dark": 3186,
      "metal": 3561,
      "nodato": 3241,
      "naturoc": 3241,
      "coloroc": 3581,
      "masai": 3581,
      "sigaro": 3581,
      "cenere": 3581,
      "tabacco": 3657,
      "noce": 3399
    }},
    {
      model: "Q3",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1792,
      "soft": 2164,
      "dark": 2346,
      "metal": 2589,
      "nodato": 2276,
      "naturoc": 2276,
      "coloroc": 2596,
      "masai": 2596,
      "sigaro": 2596,
      "cenere": 2596,
      "tabacco": 2601,
      "noce": 2443
    }},
    {
      model: "Q3",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2023,
      "soft": 2486,
      "dark": 2671,
      "metal": 2968,
      "nodato": 2622,
      "naturoc": 2622,
      "coloroc": 2964,
      "masai": 2964,
      "sigaro": 2964,
      "cenere": 2964,
      "tabacco": 2951,
      "noce": 2787
    }},
    {
      model: "Q3",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2391,
      "soft": 3002,
      "dark": 3220,
      "metal": 3687,
      "nodato": 3165,
      "naturoc": 3165,
      "coloroc": 3470,
      "masai": 3470,
      "sigaro": 3470,
      "cenere": 3470,
      "tabacco": 3571,
      "noce": 3363
    }},
    {
      model: "Q3",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2550,
      "soft": 3144,
      "dark": 3384,
      "metal": 3873,
      "nodato": 3375,
      "naturoc": 3375,
      "coloroc": 3725,
      "masai": 3725,
      "sigaro": 3725,
      "cenere": 3725,
      "tabacco": 3803,
      "noce": 3647
    }},
    {
      model: "QUADRO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1516,
      "soft": 1809,
      "dark": 1960,
      "metal": 2164
    }},
    {
      model: "QUADRO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1783,
      "soft": 2138,
      "dark": 2320,
      "metal": 2571
    }},
    {
      model: "QUADRO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2314,
      "soft": 2744,
      "dark": 2964,
      "metal": 3270
    }},
    {
      model: "QUADRO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2479,
      "soft": 2942,
      "dark": 3185,
      "metal": 3500
    }},
    {
      model: "QUADRO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1612,
      "soft": 1964,
      "dark": 2116,
      "metal": 2446
    }},
    {
      model: "QUADRO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1897,
      "soft": 2322,
      "dark": 2504,
      "metal": 2905
    }},
    {
      model: "QUADRO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2447,
      "soft": 2962,
      "dark": 3183,
      "metal": 3616
    }},
    {
      model: "QUADRO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2625,
      "soft": 3188,
      "dark": 3428,
      "metal": 3879
    }},
    {
      model: "QUADRO",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1403,
      "soft": 1625
    }},
    {
      model: "QUADRO",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1652,
      "soft": 1971
    }},
    {
      model: "RIALTO PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1841,
      "soft": 2134,
      "metal": 2438
    }},
    {
      model: "RIALTO PPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 2094,
      "soft": 2436,
      "metal": 2543
    }},
    {
      model: "RIALTO PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1841,
      "soft": 2134,
      "metal": 2438
    }},
    {
      model: "RIALTO PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2173,
      "soft": 2526,
      "metal": 2903
    }},
    {
      model: "RIALTO PPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2297,
      "soft": 2682,
      "metal": 3027
    }},
    {
      model: "RIALTO PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2173,
      "soft": 2526,
      "metal": 2903
    }},
    {
      model: "RIALTO PP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2787,
      "soft": 3217,
      "metal": 3677
    }},
    {
      model: "RIALTO PPP",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2938,
      "soft": 3406,
      "metal": 3896
    }},
    {
      model: "RIALTO PU",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2787,
      "soft": 3217,
      "metal": 3677
    }},
    {
      model: "RLL",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1838,
      "soft": 2100
    }},
    {
      model: "RLL",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2214,
      "soft": 2531
    }},
    {
      model: "RVU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1662,
      "soft": 1998,
      "dark": 2143,
      "nodato": 2276,
      "naturoc": 2276,
      "coloroc": 2456,
      "masai": 2456,
      "sigaro": 2456,
      "cenere": 2456,
      "tabacco": 2511,
      "noce": 2396
    }},
    {
      model: "RVU",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1449,
      "soft": 1713,
      "moka": 1416,
      "brina": 1416,
      "ghiaccio": 1416,
      "otter": 1416,
      "walnut": 1416
    }},
    {
      model: "RVUG",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1948,
      "soft": 2334,
      "nodato": 2553,
      "naturoc": 2553,
      "coloroc": 2733,
      "masai": 2733,
      "sigaro": 2733,
      "cenere": 2733
    }},
    {
      model: "RVU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1991,
      "soft": 2428,
      "dark": 2616,
      "nodato": 2900,
      "naturoc": 2900,
      "coloroc": 3114,
      "masai": 3114,
      "sigaro": 3114,
      "cenere": 3114,
      "tabacco": 3355,
      "noce": 3047
    }},
    {
      model: "RVU",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1756,
      "soft": 2073,
      "moka": 1715,
      "brina": 1715,
      "ghiaccio": 1715,
      "otter": 1715,
      "walnut": 1715
    }},
    {
      model: "RVUG",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 2293,
      "soft": 2736,
      "nodato": 3227,
      "naturoc": 3227,
      "coloroc": 3442,
      "masai": 3442,
      "sigaro": 3442,
      "cenere": 3442
    }},
    {
      model: "RVU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2528,
      "soft": 2971,
      "dark": 3177,
      "nodato": 3374,
      "naturoc": 3374,
      "coloroc": 3629,
      "masai": 3629,
      "sigaro": 3629,
      "cenere": 3629,
      "tabacco": 3917,
      "noce": 3550
    }},
    {
      model: "RVUG",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2887,
      "soft": 3336,
      "nodato": 3763,
      "naturoc": 3763,
      "coloroc": 4018,
      "masai": 4018,
      "sigaro": 4018,
      "cenere": 4018
    }},
    {
      model: "RVU",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2717,
      "soft": 3194,
      "dark": 3420,
      "nodato": 3623,
      "naturoc": 3623,
      "coloroc": 3909,
      "masai": 3909,
      "sigaro": 3909,
      "cenere": 3909,
      "tabacco": 4198,
      "noce": 3809
    }},
    {
      model: "RVUG",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 3129,
      "soft": 3612,
      "nodato": 4068,
      "naturoc": 4068,
      "coloroc": 4352,
      "masai": 4352,
      "sigaro": 4352,
      "cenere": 4352
    }},
    {
      model: "TRATTO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1516,
      "soft": 1809,
      "dark": 1960,
      "metal": 2164
    }},
    {
      model: "TRATTO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1783,
      "soft": 2138,
      "dark": 2320,
      "metal": 2571
    }},
    {
      model: "TRATTO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2314,
      "soft": 2744,
      "dark": 2964,
      "metal": 3270
    }},
    {
      model: "TRATTO",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2479,
      "soft": 2942,
      "dark": 3185,
      "metal": 3500
    }},
    {
      model: "TRATTO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1612,
      "soft": 1964,
      "dark": 2116,
      "metal": 2446
    }},
    {
      model: "TRATTO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1897,
      "soft": 2322,
      "dark": 2504,
      "metal": 2905
    }},
    {
      model: "TRATTO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2447,
      "soft": 2962,
      "dark": 3183,
      "metal": 3616
    }},
    {
      model: "TRATTO",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2625,
      "soft": 3188,
      "dark": 3428,
      "metal": 3879
    }},
    {
      model: "TRATTO",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1403,
      "soft": 1625
    }},
    {
      model: "TRATTO",
      frame: "fn-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1652,
      "soft": 1971
    }},
    {
      model: "VENEZIA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1498,
      "soft": 1790,
      "dark": 2085
    }},
    {
      model: "VENEZIA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1791,
      "soft": 2152,
      "dark": 2511
    }},
    {
      model: "VENEZIA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2286,
      "soft": 2715,
      "dark": 3146
    }},
    {
      model: "VENEZIA",
      frame: "tnp-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2451,
      "soft": 2913,
      "dark": 3452
    }},
    {
      model: "VENEZIA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1608,
      "soft": 1960,
      "dark": 2237,
      "metal": 2484
    }},
    {
      model: "VENEZIA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1962,
      "soft": 2401,
      "dark": 2695,
      "metal": 2950
    }},
    {
      model: "VENEZIA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2451,
      "soft": 2966,
      "dark": 3364,
      "metal": 3670
    }},
    {
      model: "VENEZIA",
      frame: "tnp-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3000-height",
      finishes: {"blanc": 2628,
      "soft": 3188,
      "dark": 3634,
      "metal": 3951
    }},
    {
      model: "VENEZIA",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2100-height",
      finishes: {"blanc": 1498,
      "soft": 1790
    }},
    {
      model: "VENEZIA",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2400-height",
      finishes: {"blanc": 1791,
      "soft": 2152
    }},
    {
      model: "VENEZIA",
      frame: "era-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2700-height",
      finishes: {"blanc": 2286,
      "soft": 2715
    }}
  ];

const secretTwinSurcharge = {
  "2100-height": 146,
  "2400-height": 153,
  "2700-height": 191,
  "3000-height": 191,
  "3400-height": 222,
  "3410-4000-height": 285
};

const doorFillingSurcharge = {
  "45mm": {
    "2100-height": 96,
    "2400-height": 113,
    "2700-height": 157,
    "3000-height": 157
  },
  "60mm": {
    "2100-height": 233,
    "2400-height": 233,
    "2700-height": 369,
    "3000-height": 369
  }
};

const hingeSurcharge = {
  "chrome-hinge": 0,
  "white-hinge": 70,
  "black-hinge": 53, 
  "bronze-hinge": 97,
  "gold-hinge": 175,
  "brass-hinge": 11
};

const doorHandlePrice = [
  {
    dhandle: "italia-door-handle",
    dhandlefinish: "polishedchrome-door-handle",
    lock: {"standard": 139,
      "privacy": 206
          }},
  {
    dhandle: "italia-door-handle",
    dhandlefinish: "satinchrome-door-handle",
    lock: {"standard": 118,
    "privacy": 170
  }},
    {
      dhandle: "italia-door-handle",
      dhandlefinish: "black-door-handle",
      lock: {"standard": 125,
      "privacy": 185
    }},
    {
      dhandle: "robocinque-door-handle",
      dhandlefinish: "polishedchrome-door-handle",
      lock: {"standard": 144,
      "privacy": 228
    }},
    {
      dhandle: "robocinque-door-handle",
      dhandlefinish: "satinchrome-door-handle",
      lock: {"standard": 166,
      "privacy": 264
    }},
    {
      dhandle: "robocinque-door-handle",
      dhandlefinish: "black-door-handle",
      lock: {"standard": 137,
      "privacy": 216
    }},
    {
      dhandle: "lama-door-handle",
      dhandlefinish: "polishedchrome-door-handle",
      lock: {"standard": 317,
      "privacy": 427
    }},
    {
      dhandle: "lama-door-handle",
      dhandlefinish: "satinchrome-door-handle",
      lock: {"standard": 355,
      "privacy": 480
    }},
    {
      dhandle: "lama-door-handle",
      dhandlefinish: "black-door-handle",
      lock: {"standard": 286,
      "privacy": 384
    }},
    {
      dhandle: "lotus-door-handle",
      dhandlefinish: "polishedchrome-door-handle",
      lock: {"standard": 353,
      "privacy": 461
    }},
    {
      dhandle: "lotus-door-handle",
      dhandlefinish: "satinchrome-door-handle",
      lock: {"standard": 391,
      "privacy": 514
    }},
    {
      dhandle: "lotus-door-handle",
      dhandlefinish: "black-door-handle",
      lock: {"standard": 319,
        "privacy": 420
            }
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
      doorHandleFinish: {"polishedchrome-door-handle": 12,
      "satinchrome-door-handle": 12,
      "black-door-handle": 12
    }},
    {
      doorLock: "privacy-lock",
      doorHandleFinish: {"polishedchrome-door-handle": 13,
      "satinchrome-door-handle": 13,
      "black-door-handle": 13
    }},
    {
      doorLock: "yalelock",
      doorHandleFinish: {"polishedchrome-door-handle": 151,
      "satinchrome-door-handle": 151,
      "black-door-handle": 225
                        }
    }
]
      
      
// Utility: reset totals and breakdown
function resetDoorBreakdownValues() {
  const ids = [
    'door-total',
    'door-upgrade-total',
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
  
  const effectiveFrame = frame === "secret-twin-frame" ? "secret-frame" : frame;

  // Find matching row  
  const match = doorPricing.find(
    row =>
      row.model === model && // or whichever model dropdown you add
      row.frame === effectiveFrame &&
      row.thickness === thickness &&
      row.width === width &&
      row.height === height       
  );
  if (!match) {
    if (allSelected) {
      document.getElementById('door-error-message').textContent =
        "This configuration is not available. Please contact Thelia Group for assistance.";
      resetDoorBreakdownValues();
    } else {
      document.getElementById('door-error-message').textContent = "";
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
      const usePrivacyPrice = selectedLockType === "privacy-lock";
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
  const upgradeTotal = fillingSurcharge + hingeUpgrade + handlePrice + lockAddonPrice;
  doorGrandTotal += upgradeTotal;
  

  //Consider dealer discount
  let doorCustomDuties = doorGrandTotal * 0.75 * 0.15 * dollarConversionRate; // 15% ON 75% OF THE INVOICE CONVERTED TO DOLLARS
  let discountedDoorGrandTotal = (doorGrandTotal * (barausseDealerMultipliers[dealerType] ?? 1)) + doorCustomDuties;
  let discountedBasePrice = basePrice * (barausseDealerMultipliers[dealerType] ?? 1);
  let discountedUpgradeSurcharge = upgradeTotal * (barausseDealerMultipliers[dealerType] ?? 1);

  const doorDealerGroup = document.getElementById("door-dealer-type")?.value || "none";
  const doorCurrencySymbol = doorDealerGroup === "none" ? "€" : "$";
  
  // Update UI
   document.getElementById('door-grand-total').textContent =
    `${doorCurrencySymbol}${discountedDoorGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-total').textContent =
    `${doorCurrencySymbol}${discountedBasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-upgrade-total').textContent =
    `${doorCurrencySymbol}${discountedUpgradeSurcharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-custom-duties-total').textContent =
    `$${doorCustomDuties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

}


document.querySelectorAll('#door-frame, #door-thickness, #door-height, #door-finish, #door-dealer-type, #door-model, #filling, #door-hinge, #door-handle, #door-handle-finish, #privacy-lock, #door-lock')
  .forEach(el => el.addEventListener('change', calculateDoorPrice));


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
  clone.querySelector(".bath-side").id = `bathroom${cabinetCount}-side`;

  clone.querySelectorAll("select").forEach(sel =>
    sel.addEventListener("change", calculateBathPrice)
  );
  
  // Dynamic logic: disable 45-degree side when finish = Polymeric
  const finishSelect = document.getElementById("bathroom-finish");
  const sideSelect = clone.querySelector(".bath-side");
  
  function updateSideOptions() {
    const isPolymeric = finishSelect.value === "polymeric";
    const option45 = sideSelect.querySelector('option[value="45degreeSide"]');
    if (isPolymeric) {
      option45.disabled = true;
      // If user already selected it, reset the dropdown
      if (sideSelect.value === "45degreeSide") {
        sideSelect.value = "";
        calculateBathPrice();
      }
    } else {
      option45.disabled = false;
    }

  }
  // Run once on cabinet creation
  updateSideOptions();
  
  // Update dynamically when finish changes
  finishSelect.addEventListener("change", updateSideOptions);
  // Also recalc when side panel changes
  sideSelect.addEventListener("change", calculateBathPrice);


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
const sidePricing = [
  {
   bathSide: "cannettedSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 63,
      "mattcolor": 117,
      "silkcolor": 129
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 77,
      "mattcolor": 128,
      "silkcolor": 141
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 92,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 104,
      "mattcolor": 177,
      "silkcolor": 195
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 63,
      "mattcolor": 117,
      "silkcolor": 129
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 77,
      "mattcolor": 128,
      "silkcolor": 141
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 92,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 104,
      "mattcolor": 177,
      "silkcolor": 195
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 77,
      "mattcolor": 126,
      "silkcolor": 138
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 97,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 117,
      "mattcolor": 189,
      "silkcolor": 207
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 137,
      "mattcolor": 228,
      "silkcolor": 252
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 77,
      "mattcolor": 126,
      "silkcolor": 138
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 97,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 117,
      "mattcolor": 189,
      "silkcolor": 207
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 137,
      "mattcolor": 228,
      "silkcolor": 252
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 54,
      "mattcolor": 83,
      "silkcolor": 92
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 89,
      "mattcolor": 118,
      "silkcolor": 132
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 54,
      "mattcolor": 83,
      "silkcolor": 92
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 89,
      "mattcolor": 118,
      "silkcolor": 132
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 92,
      "silkcolor": 101
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 118,
      "mattcolor": 161,
      "silkcolor": 177
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 92,
      "silkcolor": 101
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 118,
      "mattcolor": 161,
      "silkcolor": 177
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 54,
      "mattcolor": 83,
      "silkcolor": 92
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 89,
      "mattcolor": 118,
      "silkcolor": 132
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 54,
      "mattcolor": 83,
      "silkcolor": 92
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 89,
      "mattcolor": 118,
      "silkcolor": 132
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 92,
      "silkcolor": 101
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 118,
      "mattcolor": 161,
      "silkcolor": 177
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 24,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 92,
      "silkcolor": 101
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 60,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": 118,
      "mattcolor": 161,
      "silkcolor": 177
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 37.4,
      sideDepth: "bdepth35cm",
      sideActualHeight: 28,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 137,
      "silkcolor": 170
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 37.4,
      sideDepth: "bdepth35cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 166,
      "silkcolor": 214
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 37.4,
      sideDepth: "bdepth35cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 194,
      "silkcolor": 257
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 37.4,
      sideDepth: "bdepth35cm",
      sideActualHeight: 64,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 223,
      "silkcolor": 300
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 41.9,
      sideDepth: "bdepth40cm",
      sideActualHeight: 28,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 156,
      "silkcolor": 193
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 41.9,
      sideDepth: "bdepth40cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 192,
      "silkcolor": 244
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 41.9,
      sideDepth: "bdepth40cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 228,
      "silkcolor": 296
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 41.9,
      sideDepth: "bdepth40cm",
      sideActualHeight: 64,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 264,
      "silkcolor": 348
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 47.9,
      sideDepth: "bdepth46cm",
      sideActualHeight: 28,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 156,
      "silkcolor": 193
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 47.9,
      sideDepth: "bdepth46cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 192,
      "silkcolor": 244
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 47.9,
      sideDepth: "bdepth46cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 228,
      "silkcolor": 296
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 47.9,
      sideDepth: "bdepth46cm",
      sideActualHeight: 64,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 264,
      "silkcolor": 348
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 53.4,
      sideDepth: "bdepth51cm",
      sideActualHeight: 28,
      bathroomHeight: "bheight24cm1dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 156,
      "silkcolor": 193
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 53.4,
      sideDepth: "bdepth51cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm1dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 192,
      "silkcolor": 244
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 53.4,
      sideDepth: "bdepth51cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 228,
      "silkcolor": 296
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 53.4,
      sideDepth: "bdepth51cm",
      sideActualHeight: 64,
      bathroomHeight: "bheight48cm2dr",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 264,
      "silkcolor": 348
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 77,
      "mattcolor": 128,
      "silkcolor": 141
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 77,
      "mattcolor": 128,
      "silkcolor": 141
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 97,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 97,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 37.4,
      sideDepth: "bdepth35cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 166,
      "silkcolor": 214
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 41.9,
      sideDepth: "bdepth40cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 192,
      "silkcolor": 244
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 47.9,
      sideDepth: "bdepth46cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 192,
      "silkcolor": 244
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 53.4,
      sideDepth: "bdepth51cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm1do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 192,
      "silkcolor": 244
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 77,
      "mattcolor": 128,
      "silkcolor": 141
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 77,
      "mattcolor": 128,
      "silkcolor": 141
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 97,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 97,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 67,
      "mattcolor": 88,
      "silkcolor": 99
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 36,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": 81,
      "mattcolor": 109,
      "silkcolor": 119
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 37.4,
      sideDepth: "bdepth35cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 166,
      "silkcolor": 214
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 41.9,
      sideDepth: "bdepth40cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 192,
      "silkcolor": 244
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 47.9,
      sideDepth: "bdepth46cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 192,
      "silkcolor": 244
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 53.4,
      sideDepth: "bdepth51cm",
      sideActualHeight: 40,
      bathroomHeight: "bheight36cm2do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 192,
      "silkcolor": 244
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 92,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 92,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 117,
      "mattcolor": 189,
      "silkcolor": 207
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 117,
      "mattcolor": 189,
      "silkcolor": 207
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 37.4,
      sideDepth: "bdepth35cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 194,
      "silkcolor": 257
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 41.9,
      sideDepth: "bdepth40cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 228,
      "silkcolor": 296
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 47.9,
      sideDepth: "bdepth46cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 228,
      "silkcolor": 296
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 53.4,
      sideDepth: "bdepth51cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm1do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 228,
      "silkcolor": 296
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 92,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 92,
      "mattcolor": 149,
      "silkcolor": 165
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 117,
      "mattcolor": 189,
      "silkcolor": 207
    }},
    {
      bathSide: "cannettedSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 117,
      "mattcolor": 189,
      "silkcolor": 207
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "roundSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 35.2,
      sideDepth: "bdepth35cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 39.7,
      sideDepth: "bdepth40cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 78,
      "mattcolor": 101,
      "silkcolor": 111
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 45.7,
      sideDepth: "bdepth46cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "straightSide",
      bathroomActualDepth: 51.2,
      sideDepth: "bdepth51cm",
      sideActualHeight: 48,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": 101,
      "mattcolor": 135,
      "silkcolor": 149
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 37.4,
      sideDepth: "bdepth35cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 194,
      "silkcolor": 257
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 41.9,
      sideDepth: "bdepth40cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 228,
      "silkcolor": 296
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 47.9,
      sideDepth: "bdepth46cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 228,
      "silkcolor": 296
    }},
    {
      bathSide: "45degreeSide",
      bathroomActualDepth: 53.4,
      sideDepth: "bdepth51cm",
      sideActualHeight: 52,
      bathroomHeight: "bheight48cm2do",
      bathroomFinishes: {"polymeric": "—",
      "mattcolor": 228,
      "silkcolor": 296
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
  const bathroomSideEntry = document.getElementById(`bathroom${cabIndex}-side`).value;
  
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
  
  //Add Side Panel to Price
  if (bathroomSideEntry && bathroomSideEntry !== "") {
    const sideMatch = sidePricing.find(row =>
      row.bathSide === bathroomSideEntry &&
      row.bathroomHeight === bathroomHeightEntry &&
      row.sideDepth === bathroomDepthEntry
    );
    if (sideMatch) {
      bathPrice += sideMatch.bathroomFinishes[bathroomFinishEntry];
    }
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
  const bathCustomDuties = bathGrandTotal * 0.1 * dollarConversionRate; 
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

document.querySelectorAll('#bathroom-model, #bathroom-finish, #sink-unit, #bath-height, #bath-length, #bath-depth, #bath-side, #bath-countertop, #bath-countertop-pricelevel, #bath-countertop-depth, #bath-countertop-length, #bath-countertop-thickness, #sink-number, #bath-sink-type, #bath-handle-type')
  .forEach(el => el.addEventListener('change', calculateBathPrice));

