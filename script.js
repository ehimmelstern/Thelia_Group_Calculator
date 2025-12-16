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
    advanced: 0.94,
    preferred: 0.84,
    elite: 0.75,
    builder: 1.61,
    designer: 1.84,
    retail: 2.3, 
    none: 1 
  };
  
  const smallerMultipliersNovacucina = { //DIFFERENT RESELL VALUE FOR COUNTERTOPS & LIGHTING
    advanced: 0.94,
    preferred: 0.84,
    elite: 0.75,
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
  
  //Display Grand Total Range
  document.getElementById('kitchen-price-result').textContent = `$${formatShortCurrency(grandTotalLOW)} – $${formatShortCurrency(grandTotalHIGH)}`;
  
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
      row.innerHTML = `<span>${label}</span><span>$${formatShortCurrency(values[0])} – $${formatShortCurrency(values[1])}</span>`;
    } else {
       row.innerHTML = `<span>${label}</span><span>$${formatShortCurrency(values)}</span>`;
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
      height: "2110-2390-height",
      finishes: {"blanc": 1226,
      "soft": 1438,
      "dark": 1623,
      "metal": 1762,
      "pearl": 1812,
      "shiny": 2430,
      "glossy": 3470,
      "nodato": 1504,
      "olmo": 1504,
      "sesamo": 1504,
      "jazz": 1504,
      "blond": 1504,
      "carruba": 1504,
      "naturoc": 1504,
      "coloroc": 1898,
      "masai": 1898,
      "sigaro": 1898,
      "cenere": 1898,
      "tabacco": 1737,
      "noce": 1604,
      "moka": 1260,
      "brina": 1260,
      "ghiaccio": 1260,
      "otter": 1260,
      "walnut": 1260,
      "sabbia": 1260,
      "quercia": 1495,
      "you": 1181,
      "stone": 1495,
      "concrete": 2070,
      "clay": 2070,
      "carrara": 2185
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
      model: "ON",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1226,
      "soft": 1438,
      "dark": 1623,
      "metal": 1762,
      "pearl": 1812,
      "shiny": 2430,
      "glossy": 3470,
      "nodato": 1567,
      "olmo": 1567,
      "sesamo": 1567,
      "jazz": 1567,
      "blond": 1567,
      "carruba": 1567,
      "naturoc": 1567,
      "coloroc": 1961,
      "masai": 1961,
      "sigaro": 1961,
      "cenere": 1961,
      "tabacco": 1800,
      "noce": 1667,
      "moka": 1260,
      "brina": 1260,
      "ghiaccio": 1260,
      "otter": 1260,
      "walnut": 1260,
      "sabbia": 1260,
      "quercia": 1495,
      "you": 1181,
      "stone": 1495,
      "concrete": 2070,
      "clay": 2070,
      "carrara": 2185
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
      model: "KIN",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1226,
      "soft": 1438,
      "dark": 1623,
      "metal": 1762,
      "pearl": 1812,
      "shiny": 2430,
      "glossy": 3470,
      "nodato": 1659,
      "olmo": 1659,
      "sesamo": 1659,
      "jazz": 1659,
      "blond": 1659,
      "carruba": 1659,
      "naturoc": 1659,
      "coloroc": 2053,
      "masai": 2053,
      "sigaro": 2053,
      "cenere": 2053,
      "tabacco": 1892,
      "noce": 1759,
      "moka": 1260,
      "brina": 1260,
      "ghiaccio": 1260,
      "otter": 1260,
      "walnut": 1260,
      "sabbia": 1260,
      "quercia": 1495,
      "you": 1181,
      "stone": 1495,
      "concrete": 2070,
      "clay": 2070,
      "carrara": 2185
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
      model: "KV",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1396,
      "soft": 1608,
      "dark": 1793,
      "metal": 1932,
      "pearl": 1982,
      "shiny": 2600,
      "glossy": 3640,
      "nodato": 1674,
      "olmo": 1674,
      "sesamo": 1674,
      "jazz": 1674,
      "blond": 1674,
      "carruba": 1674,
      "naturoc": 1674,
      "coloroc": 2068,
      "masai": 2068,
      "sigaro": 2068,
      "cenere": 2068,
      "tabacco": 1907,
      "noce": 1774,
      "moka": 1430,
      "brina": 1430,
      "ghiaccio": 1430,
      "otter": 1430,
      "walnut": 1430,
      "sabbia": 1430,
      "quercia": 1665,
      "you": 1351,
      "stone": 1665,
      "concrete": 2240,
      "clay": 2240,
      "carrara": 2355
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
      model: "I1",
      frame: "secret-frame",
      thickness: "45mm",
      width: "less-than-900mm",
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1526,
      "soft": 1738,
      "dark": 1923,
      "metal": 2062,
      "pearl": 2112,
      "shiny": 2730,
      "glossy": 3770,
      "nodato": 1804,
      "olmo": 1804,
      "sesamo": 1804,
      "jazz": 1804,
      "blond": 1804,
      "carruba": 1804,
      "naturoc": 1804,
      "coloroc": 2198,
      "masai": 2198,
      "sigaro": 2198,
      "cenere": 2198,
      "tabacco": 2037,
      "noce": 1904,
      "moka": 1560,
      "brina": 1560,
      "ghiaccio": 1560,
      "otter": 1560,
      "walnut": 1560,
      "sabbia": 1560,
      "quercia": 1795,
      "you": 1481,
      "stone": 1795,
      "concrete": 2370,
      "clay": 2370,
      "carrara": 2485
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1620,
      "soft": 1832,
      "dark": 2017,
      "metal": 2156,
      "pearl": 2206,
      "shiny": 2824,
      "glossy": 3864,
      "nodato": 1898,
      "olmo": 1898,
      "sesamo": 1898,
      "jazz": 1898,
      "blond": 1898,
      "carruba": 1898,
      "naturoc": 1898,
      "coloroc": 2292,
      "masai": 2292,
      "sigaro": 2292,
      "cenere": 2292,
      "tabacco": 2131,
      "noce": 1998,
      "moka": 1654,
      "brina": 1654,
      "ghiaccio": 1654,
      "otter": 1654,
      "walnut": 1654,
      "sabbia": 1654,
      "quercia": 1889,
      "you": 1575,
      "stone": 1889,
      "concrete": 2464,
      "clay": 2464,
      "carrara": 2579
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1816,
      "soft": 2028,
      "dark": 2213,
      "metal": 2352,
      "pearl": 2402,
      "shiny": 3020,
      "glossy": 4060,
      "nodato": 2094,
      "olmo": 2094,
      "sesamo": 2094,
      "jazz": 2094,
      "blond": 2094,
      "carruba": 2094,
      "naturoc": 2094,
      "coloroc": 2488,
      "masai": 2488,
      "sigaro": 2488,
      "cenere": 2488,
      "tabacco": 2327,
      "noce": 2194,
      "moka": 1850,
      "brina": 1850,
      "ghiaccio": 1850,
      "otter": 1850,
      "walnut": 1850,
      "sabbia": 1850,
      "quercia": 2085,
      "you": 1771,
      "stone": 2085,
      "concrete": 2660,
      "clay": 2660,
      "carrara": 2775
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1712,
      "soft": 1924,
      "dark": 2109,
      "metal": 2248,
      "pearl": 2298,
      "shiny": 2916,
      "glossy": 3956,
      "nodato": 1990,
      "olmo": 1990,
      "sesamo": 1990,
      "jazz": 1990,
      "blond": 1990,
      "carruba": 1990,
      "naturoc": 1990,
      "coloroc": 2384,
      "masai": 2384,
      "sigaro": 2384,
      "cenere": 2384,
      "tabacco": 2223,
      "noce": 2090,
      "moka": 1746,
      "brina": 1746,
      "ghiaccio": 1746,
      "otter": 1746,
      "walnut": 1746,
      "sabbia": 1746,
      "quercia": 1981,
      "you": 1667,
      "stone": 1981,
      "concrete": 2556,
      "clay": 2556,
      "carrara": 2671
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1742,
      "soft": 1971,
      "dark": 2107,
      "metal": 2172
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1742,
      "soft": 1971,
      "dark": 2107,
      "metal": 2172
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1742,
      "soft": 1971,
      "dark": 2107,
      "metal": 2172
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1742,
      "soft": 1971,
      "dark": 2107,
      "metal": 2172
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1895,
      "soft": 2090,
      "dark": 2224,
      "metal": 2327
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1895,
      "soft": 2090,
      "dark": 2224,
      "metal": 2327
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2129,
      "soft": 2413,
      "dark": 2554,
      "metal": 2621
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2129,
      "soft": 2413,
      "dark": 2554,
      "metal": 2621,
      "naturoc": 2766
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2129,
      "soft": 2413,
      "dark": 2554,
      "metal": 2621,
      "naturoc": 2766
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2398,
      "soft": 2398,
      "naturoc": 3038
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2398,
      "soft": 2398,
      "naturoc": 3038
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
      height: "2410-3000-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1298,
      "soft": 1638,
      "dark": 1773,
      "metal": 1883,
      "pearl": 1963,
      "shiny": 2734,
      "glossy": 3622,
      "nodato": 1679,
      "olmo": 1679,
      "sesamo": 1679,
      "jazz": 1679,
      "blond": 1679,
      "carruba": 1679,
      "naturoc": 1679,
      "coloroc": 2023,
      "masai": 2023,
      "sigaro": 2023,
      "cenere": 2023,
      "tabacco": 1894,
      "noce": 1838,
      "moka": 1335,
      "brina": 1335,
      "ghiaccio": 1335,
      "otter": 1335,
      "walnut": 1335,
      "sabbia": 1335,
      "quercia": 1648,
      "you": 1251,
      "stone": 1648,
      "concrete": 2275,
      "clay": 2275,
      "carrara": 2401
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
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
      height: "2110-2390-height",
      finishes: {"blanc": 1298,
      "soft": 1638,
      "dark": 1773,
      "metal": 1883,
      "pearl": 1963,
      "shiny": 2734,
      "glossy": 3622,
      "nodato": 1742,
      "olmo": 1742,
      "sesamo": 1742,
      "jazz": 1742,
      "blond": 1742,
      "carruba": 1742,
      "naturoc": 1742,
      "coloroc": 2086,
      "masai": 2086,
      "sigaro": 2086,
      "cenere": 2086,
      "tabacco": 1957,
      "noce": 1901,
      "moka": 1335,
      "brina": 1335,
      "ghiaccio": 1335,
      "otter": 1335,
      "walnut": 1335,
      "sabbia": 1335,
      "quercia": 1648,
      "you": 1251,
      "stone": 1648,
      "concrete": 2275,
      "clay": 2275,
      "carrara": 2401
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
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
      height: "2110-2390-height",
      finishes: {"blanc": 1298,
      "soft": 1638,
      "dark": 1773,
      "metal": 1883,
      "pearl": 1963,
      "shiny": 2734,
      "glossy": 3622,
      "nodato": 1834,
      "olmo": 1834,
      "sesamo": 1834,
      "jazz": 1834,
      "blond": 1834,
      "carruba": 1834,
      "naturoc": 1834,
      "coloroc": 2178,
      "masai": 2178,
      "sigaro": 2178,
      "cenere": 2178,
      "tabacco": 2049,
      "noce": 1993,
      "moka": 1335,
      "brina": 1335,
      "ghiaccio": 1335,
      "otter": 1335,
      "walnut": 1335,
      "sabbia": 1335,
      "quercia": 1648,
      "you": 1251,
      "stone": 1648,
      "concrete": 2275,
      "clay": 2275,
      "carrara": 2401
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
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
      height: "2110-2390-height",
      finishes: {"blanc": 1468,
      "soft": 1808,
      "dark": 1943,
      "metal": 2053,
      "pearl": 2133,
      "shiny": 2904,
      "glossy": 3792,
      "nodato": 1849,
      "olmo": 1849,
      "sesamo": 1849,
      "jazz": 1849,
      "blond": 1849,
      "carruba": 1849,
      "naturoc": 1849,
      "coloroc": 2193,
      "masai": 2193,
      "sigaro": 2193,
      "cenere": 2193,
      "tabacco": 2064,
      "noce": 2008,
      "moka": 1505,
      "brina": 1505,
      "ghiaccio": 1505,
      "otter": 1505,
      "walnut": 1505,
      "sabbia": 1505,
      "quercia": 1818,
      "you": 1421,
      "stone": 1818,
      "concrete": 2445,
      "clay": 2445,
      "carrara": 2571
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
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
      height: "2110-2390-height",
      finishes: {"blanc": 1598,
      "soft": 1938,
      "dark": 2073,
      "metal": 2183,
      "pearl": 2263,
      "shiny": 3034,
      "glossy": 3922,
      "nodato": 1979,
      "olmo": 1979,
      "sesamo": 1979,
      "jazz": 1979,
      "blond": 1979,
      "carruba": 1979,
      "naturoc": 1979,
      "coloroc": 2323,
      "masai": 2323,
      "sigaro": 2323,
      "cenere": 2323,
      "tabacco": 2194,
      "noce": 2138,
      "moka": 1635,
      "brina": 1635,
      "ghiaccio": 1635,
      "otter": 1635,
      "walnut": 1635,
      "sabbia": 1635,
      "quercia": 1948,
      "you": 1551,
      "stone": 1948,
      "concrete": 2575,
      "clay": 2575,
      "carrara": 2701
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
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
      height: "2110-2390-height",
      finishes: {"blanc": 1692,
      "soft": 2032,
      "dark": 2167,
      "metal": 2277,
      "pearl": 2357,
      "shiny": 3128,
      "glossy": 4016,
      "nodato": 2073,
      "olmo": 2073,
      "sesamo": 2073,
      "jazz": 2073,
      "blond": 2073,
      "carruba": 2073,
      "naturoc": 2073,
      "coloroc": 2417,
      "masai": 2417,
      "sigaro": 2417,
      "cenere": 2417,
      "tabacco": 2288,
      "noce": 2232,
      "moka": 1729,
      "brina": 1729,
      "ghiaccio": 1729,
      "otter": 1729,
      "walnut": 1729,
      "sabbia": 1729,
      "quercia": 2042,
      "you": 1645,
      "stone": 2042,
      "concrete": 2669,
      "clay": 2669,
      "carrara": 2795
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
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
      height: "2110-2390-height",
      finishes: {"blanc": 1888,
      "soft": 2228,
      "dark": 2363,
      "metal": 2473,
      "pearl": 2553,
      "shiny": 3324,
      "glossy": 4212,
      "nodato": 2269,
      "olmo": 2269,
      "sesamo": 2269,
      "jazz": 2269,
      "blond": 2269,
      "carruba": 2269,
      "naturoc": 2269,
      "coloroc": 2613,
      "masai": 2613,
      "sigaro": 2613,
      "cenere": 2613,
      "tabacco": 2484,
      "noce": 2428,
      "moka": 1925,
      "brina": 1925,
      "ghiaccio": 1925,
      "otter": 1925,
      "walnut": 1925,
      "sabbia": 1925,
      "quercia": 2238,
      "you": 1841,
      "stone": 2238,
      "concrete": 2865,
      "clay": 2865,
      "carrara": 2991
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
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
      height: "2110-2390-height",
      finishes: {"blanc": 1784,
      "soft": 2124,
      "dark": 2259,
      "metal": 2369,
      "pearl": 2449,
      "shiny": 3220,
      "glossy": 4108,
      "nodato": 2165,
      "olmo": 2165,
      "sesamo": 2165,
      "jazz": 2165,
      "blond": 2165,
      "carruba": 2165,
      "naturoc": 2165,
      "coloroc": 2509,
      "masai": 2509,
      "sigaro": 2509,
      "cenere": 2509,
      "tabacco": 2380,
      "noce": 2324,
      "moka": 1821,
      "brina": 1821,
      "ghiaccio": 1821,
      "otter": 1821,
      "walnut": 1821,
      "sabbia": 1821,
      "quercia": 2134,
      "you": 1737,
      "stone": 2134,
      "concrete": 2761,
      "clay": 2761,
      "carrara": 2887
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
      finishes: {"blanc": 2914,
      "soft": 3370,
      "dark": 3568,
      "metal": 3663,
      "pearl": 3847,
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
      height: "2110-2390-height",
      finishes: {"blanc": 1930,
      "soft": 2123,
      "dark": 2258,
      "metal": 2323
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1930,
      "soft": 2123,
      "dark": 2258,
      "metal": 2323
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1930,
      "soft": 2123,
      "dark": 2258,
      "metal": 2323
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1930,
      "soft": 2123,
      "dark": 2258,
      "metal": 2323
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1975,
      "soft": 2164,
      "dark": 2332,
      "metal": 2394
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 1975,
      "soft": 2164,
      "dark": 2332,
      "metal": 2394
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2515,
      "soft": 2814,
      "dark": 2885,
      "metal": 3032
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2515,
      "soft": 2814,
      "dark": 2885,
      "metal": 3032,
      "naturoc": 3126
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2515,
      "soft": 2814,
      "dark": 2885,
      "metal": 3032,
      "naturoc": 3126
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
      height: "2410-3000-height",
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
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2481,
      "soft": 2481,
      "naturoc": 3188
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
      height: "2410-3000-height",
      finishes: {"blanc": 3312,
      "soft": 3312,
      "naturoc": 4286
    }},
    {
      model: "GRAFFIATA",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3010-3400-height",
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
      height: "2110-2390-height",
      finishes: {"blanc": 2481,
      "soft": 2481,
      "naturoc": 3188
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
      height: "2410-3000-height",
      finishes: {"blanc": 3312,
      "soft": 3312,
      "naturoc": 4286
    }},
    {
      model: "NODO",
      frame: "secret-frame",
      thickness: "60mm",
      width: "less-than-900mm",
      height: "3010-3400-height",
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
    }}
  ];

const secretTwinSurcharge = {
  "2100-height": 146,
  "2110-2390-height": 153,
  "2400-height": 153,
  "2410-3000-height": 191,
  "3010-3400-height": 222,
  "3410-4000-height": 285
};

const secretFillingSurcharge = {
  "45mm": {
    "2100-height": 96,
    "2110-2390-height": 113,
    "2400-height": 113,
    "2410-3000-height": 157
  },
  "60mm": {
    "2100-height": 233,
    "2110-2390-height": 233,
    "2400-height": 233,
    "2410-3000-height": 369
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

// Utility: reset totals and breakdown
function resetDoorBreakdownValues() {
  const ids = [
    'door-total',
    'door-custom-total',
    'door-additional-buffer-total',
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
  const finish = document.getElementById('door-finish').value; // you’ll need a finish dropdown
  const dealerType = document.getElementById('door-dealer-type').value;
  const model = document.getElementById('door-model').value;
  const fillingChecked = document.getElementById('filling').checked;
  const hinge = document.getElementById('door-hinge').value;
   
 
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
  
  // Apply dealer discount - THIS IS DISCOUNT ON THE EURO - WILL NEED TO BE CHANGED IF CONVERSION IS CHANGED.
  const barausseDealerMultipliers = {
    retail: 1.15,
    advanced: 0.8,
    preferred: 0.75,
    elite: 0.72,
    builder: 0.98,
    designer: 1.01,
    none: 1
  };
 
  // 🔹 Secret-twin frame surcharge
  if (frame === "secret-twin-frame") {
    basePrice += secretTwinSurcharge[height] ?? 0;
  }
  
  let doorGrandTotal = basePrice;
  
  // 🔹 Solid filling surcharge if toggle is on
  let fillingSurcharge = 0;
  if ((frame === "secret-frame" || frame === "secret-twin-frame") && fillingChecked) {
    fillingSurcharge = secretFillingSurcharge[thickness]?.[height] ?? 0;
    doorGrandTotal += fillingSurcharge;
  }
  
  //Add Hinge Upgrade Cost
  let hingeUpgrade = 0; 
  hingeUpgrade = hingeSurcharge[hinge]; 
  
  //Calculate Total Upgrade Cost
  const upgradeTotal = fillingSurcharge + hingeUpgrade;
  doorGrandTotal += upgradeTotal;
  

  //Consider dealer discount
  let doorCustomDuties = doorGrandTotal * 0.75 * 0.15; // 15% ON 75% OF THE INVOICE
  let discountedDoorGrandTotal = (doorGrandTotal * (barausseDealerMultipliers[dealerType] ?? 1)) + doorCustomDuties;
  let discountedBasePrice = basePrice * (barausseDealerMultipliers[dealerType] ?? 1);
  let discountedUpgradeSurcharge = upgradeTotal * (barausseDealerMultipliers[dealerType] ?? 1);

  // Update UI
   document.getElementById('door-grand-total').textContent =
    `$${discountedDoorGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-total').textContent =
    `$${discountedBasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-upgrade-total').textContent =
    `$${discountedUpgradeSurcharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById('door-custom-duties-total').textContent =
    `$${doorCustomDuties.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

}


document.querySelectorAll('#door-frame, #door-thickness, #door-height, #door-finish, #door-dealer-type, #door-model, #filling, #door-hinge')
  .forEach(el => el.addEventListener('change', calculateDoorPrice));
