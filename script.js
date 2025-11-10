//----------------------------------------------------TOGGLE BETWEEN PAGES--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

'use strict';

function showCalculator(type) {
  const sections = document.querySelectorAll('.calculator-section');
  sections.forEach(section => section.classList.remove('active'));

  const target = document.getElementById(`${type}-calculator`);
  if (target) {
    target.classList.add('active');
  }

  // Optional: update nav button styling
  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-button[onclick*="${type}"]`);
  if (activeBtn) activeBtn.classList.add('active');
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
  function resetAllInputs() {
   const inputs = document.querySelectorAll('.calculator-form input, .calculator-form select');
    inputs.forEach(input => {
      input.value = '';
    });

    // Reset total price
    document.getElementById('price-result').textContent = '$0.00';

    // Reset breakdowns
    const breakdownRows = document.querySelectorAll('#price-breakdown .breakdown-row span:last-child');
    breakdownRows.forEach(span => {
      span.textContent = '$0.00';
    });

    // Clear warnings and errors
    clearGlobalWarning();
    clearSectionErrors();
  }

//Reset Finish Levels
function resetFinishLevels() {
  const finishFields = [
    'overall-finish',
    'base-finish',
    'wall-finish',
    'column-finish',
    'stack-finish',
    'appliance-finish',
    'shelf-finish',
    'island-finish'
  ];
  finishFields.forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = '';
  });
  
  // Reset total price
    document.getElementById('price-result').textContent = '$0.00';
  
  // Reset breakdowns
  const breakdownRows = document.querySelectorAll('#price-breakdown .breakdown-row span:last-child');
  breakdownRows.forEach(span => {
    span.textContent = '$0.00';
  });
  
  // Clear warnings and errors
  clearGlobalWarning();
  clearSectionErrors();
}

//Reset Linear Inches
function resetLinearInches() {
  const linearFields = [
    'base-inches',
    'base-uncovered',
    'wall-inches',
    'wall-uncovered',
    'column-inches',
    'stack-inches',
    'profile-inches',
    'toe-kick-inches',
    'shelf-inches',
    'fridge-panel',
    'dishwasher-panels',
    'lighting-inches',
    'transformers',
    'island-inches'
  ];
  
  linearFields.forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = '';
  });
  
    // Reset total price
    document.getElementById('price-result').textContent = '$0.00';
  
  // Reset breakdowns
  const breakdownRows = document.querySelectorAll('#price-breakdown .breakdown-row span:last-child');
  breakdownRows.forEach(span => {
    span.textContent = '$0.00';
  });
  
  // Clear warnings and errors
  clearGlobalWarning();
  clearSectionErrors();
}


//CALCULATOR LOGIC
// Pricing data for Handles
const pricingHandles = {
  base: [12.903, 13.493, 14.205, 15.611, 18.985, 21.396, 22.763, 27.775, 29.168, 33.236, 43.882],
  baseCorner: [295.500, 313.000, 337.000, 387.500, 500.000, 610.000, 790.000, 900.500, 973.000, 1099.000, 1486.500],
  islandBase: [12.903, 13.493, 14.205, 15.611, 18.985, 21.396, 22.763, 27.775, 29.168, 33.236, 43.882],
  columns: [27.393, 28.878, 30.895, 35.693, 40.009, 50.259, 57.356, 65.031, 70.594, 79.594, 107.236],
  columnCorner: [666.500, 734.500, 828.500, 1088.000, 1449.500, 1738.500, 2071.500, 2406.000, 2599.000, 2936.000, 3970.500],
  stack: [7.753, 8.188, 8.656, 9.705, 12.688, 14.404, 17.533, 19.392, 20.961, 23.680, 31.957],
  wall: [10.378, 11.055, 11.894, 14.030, 17.796, 21.054, 24.650, 28.464, 30.770, 34.762, 46.954],
  leMansBase: [926.000, 925.500, 925.500, 926.000, 926.500, 907.000, 906.500, 906.500, 979.000, 1106.000, 1495.500],
  leMansColumn: [1770.500, 1769.000, 1769.500, 1770.500, 1768.000, 1770.000, 1768.500, 1767.500, 1909.000, 2156.500, 2916.000], 
  };

// Pricing data for Profiles
const pricingProfiles = {
  base: [13.200, 13.793, 14.488, 15.855, 19.206, 21.569, 25.119, 27.957, 29.344, 33.094, 44.044],
  baseCorner: [309.500, 326.000, 350.000, 401.500, 514.000, 624.000, 803.500, 914.500, 988.000, 1116.000, 1509.500],
  islandBase: [13.200, 13.793, 14.488, 15.855, 19.206, 21.569, 25.119, 27.957, 29.344, 33.094, 44.044],
  columns: [27.609, 29.095, 31.111, 35.099, 44.362, 49.690, 57.572, 65.187, 70.883, 79.770, 107.534],
  columnCorner: [671.500, 739.500, 833.500, 1093.000, 1454.500, 1743.500, 2076.000, 2411.000, 2604.500, 2942.000, 3978.500],
  stack: [8.003, 8.438, 8.906, 9.955, 12.938, 14.654, 17.783, 19.642, 21.211, 23.930, 32.207],
  wall: [11.200, 11.805, 12.748, 14.869, 18.683, 21.909, 25.513, 29.351, 31.714, 35.834, 48.494],
  leMansBase: [925.500, 926.500, 926.500, 925.500, 927.000, 906.500, 906.500, 906.500, 979.000, 1106.000, 1495.500],
  leMansColumn: [1770.500, 1769.000, 1769.500, 1770.500, 1768.000, 1770.000, 1769.000, 1768.000, 1909.000, 2157.000, 2917.500],
  };

// Shared pricing
const shelfPrices = [10.000, 10.000, 10.000, 12.500, 12.500, 15.000, 15.000, 15.000, 17.500, 17.500, 17.500];
const dishwasherPanels = [4.766, 5.418, 6.048, 8.878, 11.418, 15.748, 18.917, 22.376, 24.191, 27.335, 36.939];
const fridgePanels = [0.156, 0.196, 0.240, 0.407, 0.563, 0.765, 0.950, 1.204, 1.278, 1.535, 2.276];

//Countertop and Backsplash pricing
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
  granite: 1.6,
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



// Helper to get pricing array
function getPricing(style) {
  return style === 'handles' ? pricingHandles : pricingProfiles;
}

// Helper to get value from dropdown
function getDropdownValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

// Error functions
function clearSectionErrors() {
  document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
  document.querySelectorAll('.section-error').forEach(el => el.remove());
}

function showSectionError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  field.classList.add('error-field');

  let errorMsg = document.createElement('div');
  errorMsg.className = 'section-error';
  errorMsg.textContent = message;

  if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('section-error')) {
    field.parentNode.insertBefore(errorMsg, field.nextSibling);
  }
}

function showGlobalWarning(message) {
  const warning = document.getElementById('calculator-warning');
  if (warning) {
    warning.textContent = message;
    warning.style.display = 'block';
  }
}

function clearGlobalWarning() {
  const warning = document.getElementById('calculator-warning');
  if (warning) {
    warning.textContent = '';
    warning.style.display = 'none';
  }
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
  
  clearGlobalWarning();
  clearSectionErrors();
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


  
  // Base Units Calculations 
  const baseUncovered = parseFloat(getDropdownValue('base-uncovered')) || 0;
  const baseLeMans = getDropdownValue('base-le-mans') === 'yes';
  const baseCornerUnits = parseInt(document.getElementById('base-corner-units').value) || 0;
  const baseCornerUnitsPrice = !isNaN(baseCornerUnits) ? basePricing.baseCorner[baseLevel] * baseCornerUnits : 0; //corner unit pricing
  const baseNetInches = Math.max(0, baseInches - baseUncovered - (baseCornerUnits * 20.67)); //adjusted net inches exl. island base cabinets
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
    showSectionError('waterfall-material', 'Waterfall is not available in Glass Matte finish. Please adjust your selection.');
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

  
  // Appliance Panels  
  const dishwasherCount = parseInt(getDropdownValue('dishwasher-panels')) || 0;
  const dishwasherTotal = !isNaN(applianceLevel) ? dishwasherCount * dishwasherPanels[applianceLevel] * 20.67: 0;

  const fridgeSqIn = parseFloat(getDropdownValue('fridge-panel')) || 0;
  const fridgeTotal = !isNaN(applianceLevel) ? fridgeSqIn * fridgePanels[applianceLevel] : 0;
  
console.log('Appliance Level:', applianceLevel);
console.log('Dishwasher Rate:', dishwasherPanels[applianceLevel]);
console.log('Fridge Rate:', fridgePanels[applianceLevel]);
  
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
  } else if (baseInches > 0 && !baseStyle) {
    showSectionError('base-style', 'Please select "Handles or Profiles" for Base Units.');
    hasError = true;
  }
  
  if (islandInches > 0 && islandStyle) {
    cabinetTotal += islandPrice;
  } else if (islandInches > 0 && !islandStyle) {
    showSectionError('island-style', 'Please select "Handles or Profiles" for Island Cabinets.');
    hasError = true;
  }

  // Wall Units
  if (wallInches > 0 && wallStyle) {
    cabinetTotal += wallTotal;
  } else if (wallInches > 0 && !wallStyle) {
    showSectionError('wall-style', 'Please select "Handles or Profiles" for Wall Units.');
     hasError = true;
  }

  // Columns
  if (columnInches > 0 && columnStyle) {
    cabinetTotal += columnTotal;
  } else if (columnInches > 0 && !columnStyle) {
    showSectionError('column-style', 'Please select "Handles or Profiles" for Columns.');
    hasError = true;
  }

  // Stack Cabinets
  if (stackInches > 0 && stackStyle) {
    cabinetTotal += stackTotal;
  } else if (stackInches > 0 && !stackStyle) {
    showSectionError('stack-style', 'Please select "Handles or Profiles" for Stack Cabinets.');
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
    let cornerAccessoriesTotal = 0;
  
    if (baseInches > 0 && baseStyle && baseLeMans && baseCornerUnits > 0) {
      cornerAccessoriesTotal += leMansBaseTotal;
    } else if (baseInches > 0 && baseLeMans && (!baseStyle || baseCornerUnits === 0)) {
      if (!baseStyle) {
        showSectionError('base-style', 'Handles or Profiles required for Le Mans Base Corner.');
      }
      if (baseCornerUnits === 0) {
        showSectionError('base-corner-units', 'Please enter the number of base corner units if Le Mans Corner is selected.');
      }
      hasError = true;
    }

    if (columnInches > 0 && columnStyle && columnLeMans && columnCornerUnits > 0) {
      cornerAccessoriesTotal += leMansColumnTotal;
    } else if (columnInches > 0 && columnLeMans && (!columnStyle || columnCornerUnits === 0)) {
      if(!columnStyle) {
              showSectionError('column-style', 'Handles or Profiles required for Le Mans Column Corner.');
      }
      if(columnCornerUnits ===0) {
        showSectionError('column-corner-units', 'Please enter the number of column corner units if Le Mans Corner is selected.');
      }
      hasError = true;
    }

  //Appliance Panel Total
    let appliancePanelsTotal = 0;

    if (dishwasherCount > 0 && !isNaN(applianceLevel)) {
      appliancePanelsTotal += dishwasherTotal;
    } else if (dishwasherCount > 0 && !applianceLevel) {
      showSectionError('appliance-finish', 'Finish level required for Dishwasher Panels.');
       hasError = true;
    }

    if (fridgeSqIn > 0 && !isNaN(applianceLevel)) {
      appliancePanelsTotal += fridgeTotal;
    } else if (fridgeSqIn > 0 && !applianceLevel) {
      showSectionError('appliance-finish', 'Finish level required for Fridge Panel.');
       hasError = true;
    }

  const lightingCombinedTotal = lightingTotal + transformerTotal;
  const profilesToeKicksTotal = profileTotal + toeKickTotal;

  if (hasError) {
  showGlobalWarning('Missing information: Please correct the missing selections to calculate your estimate.');
  document.getElementById('price-result').textContent = '$0.00';
  return;
}
  let totalPricePreDuties = cabinetTotal + internalBoxTotal + cornerAccessoriesTotal + appliancePanelsTotal + shelfTotal + lightingCombinedTotal + profilesToeKicksTotal + surfaceTotal; // MASTER TOTAL
  
  const estimatedDuties = totalPricePreDuties * customDutiesRate;

  // Apply dealer type logic - considered Discount in Euros - if dollar conversion changes, will need to update it here!
  const dealerMultipliers = {
    advanced: 0.94,
    preferred: 0.84,
    elite: 0.75,
    builder: 1.61,
    designer: 1.84,
    retail: 2, //WILL NEED TO BE UPDATED TO 2.3
    none: 1 //converts euros to dollars.
  };
  
  function applyDealerAdjustment(value, dealerType) {
    const multiplier = dealerMultipliers[dealerType] ?? 1;
    return value * multiplier;
  }
  
  const dealerType = document.getElementById('dealer-type').value;
 // let adjustedTotal = catalogTotalPrice;

// Total price
const adjustedTotal = applyDealerAdjustment(totalPricePreDuties, dealerType);
const adjustedTotalWithDuties = adjustedTotal + estimatedDuties;
document.getElementById('price-result').textContent = `$${adjustedTotalWithDuties.toFixed(2)}`; //displays total

// Breakdown
const breakdownContainer = document.getElementById('price-breakdown');
breakdownContainer.innerHTML = ''; // displays breakdown

const groupedBreakdown = {
  'Cabinets': cabinetTotal,
  'Corner Accessories': cornerAccessoriesTotal,
  'Appliance Panels': appliancePanelsTotal,
  'Countertop & Backsplash': surfaceTotal,
  'Shelves': shelfTotal,
  'Lighting': lightingCombinedTotal,
  'Profiles + Toe Kicks': profilesToeKicksTotal,
};

  Object.entries(groupedBreakdown).forEach(([label, value]) => {
    const adjustedValue = applyDealerAdjustment(value, dealerType);
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    row.innerHTML = `<span>${label}</span><span>$${adjustedValue.toFixed(2)}</span>`;
    breakdownContainer.appendChild(row);
  });

  //Update Custom Duties Line independent of discount lelvel
  const dutiesRow = document.createElement('div');
  dutiesRow.className = 'breakdown-row';
  dutiesRow.innerHTML = `<span>Estimated Custom Duties</span><span>$${estimatedDuties.toFixed(2)}</span>`;
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


//----------------------------------------------------CLOSET C0DE-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function calculateCloset() {
  const hanging = parseFloat(document.getElementById('hanging-length').value) || 0;
  const shelves = parseInt(document.getElementById('shelf-count').value) || 0;
  const drawers = parseInt(document.getElementById('drawer-count').value) || 0;
  const accessories = parseInt(document.getElementById('accessory-count').value) || 0;

  // Example pricing logic
  const total = (hanging * 2.5) + (shelves * 50) + (drawers * 75) + (accessories * 40);

  document.getElementById('closet-result').textContent = `Estimated price: $${total.toFixed(2)}`;
}