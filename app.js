// Global variables to hold active calculations and loaded JSON profiles
let gameData = {};
let activeSkillInputs = {
    infantry: [],
    lancer: [],
    marksman: []
};
// Holds the parsed JSON object once fetched from the file system
let troopDataJson = null; 

function populateTroopDropdowns() {
    const types = ['infantry', 'lancer', 'marksman'];

    types.forEach(type => {
        const tierSelect = document.getElementById(`lvl-${type}`);
        const fcSelect = document.getElementById(`fc-${type}`);

        if (!tierSelect || !fcSelect) return;

        // Clear any existing placeholders
        tierSelect.innerHTML = "";
        fcSelect.innerHTML = "";

        // 1. Auto-generate Troop Tiers (T1 to T11)
        for (let i = 1; i <= 11; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = `T${i}`;
            // Default select Tier 10
            if (i === 10) option.selected = true; 
            tierSelect.appendChild(option);
        }

        // 2. Auto-generate Fire Crystal Levels (FC0 to FC10)
        for (let j = 0; j <= 10; j++) {
            const option = document.createElement("option");
            option.value = j;
            option.textContent = `FC ${j}`;
            // Default select FC 0
            if (j === 6) option.selected = true;
            fcSelect.appendChild(option);
        }
        
        // 3. Add auto-reset rule logic directly to selection tracking
        tierSelect.addEventListener("change", () => {
            if (parseInt(tierSelect.value) < 10) {
                fcSelect.value = "0";
            }
        });
    });
}

// Fire injection on load initialization window
document.addEventListener("DOMContentLoaded", populateTroopDropdowns);


// Global tracking object to store the extracted unbuffed stats
let baseTroopStats = {
    infantry: { attack: 0, defense: 0, lethality: 0, health: 0 },
    lancer:   { attack: 0, defense: 0, lethality: 0, health: 0 },
    marksman: { attack: 0, defense: 0, lethality: 0, health: 0 }
};

function lookupTroopBaseStats(troopJson) {
    // Ensure the JSON data exists before running
    if (!troopJson) return;

    const types = ['infantry', 'lancer', 'marksman'];
    
    types.forEach(type => {
        // 1. Get the current selections from the dropdowns
        const tier = document.getElementById(`lvl-${type}`).value; 
        let fcKey = "FC" + document.getElementById(`fc-${type}`).value; 
        
        // 2. Fallback Rule: T1 through T9 do not exist in FC1-FC10 objects.
        // If a lower tier is picked, force the lookup to check FC0 instead.
        if (parseInt(tier) < 10) {
            fcKey = "FC0";
        }
        
        // 3. Drill down into the JSON structure: troopJson[type][FC_Key][Tier_Number]
        const finalProfile = troopJson[type] && troopJson[type][fcKey] ? troopJson[type][fcKey][tier] : null;
        
        // 4. Save the stats into the global tracker object
        if (finalProfile) {
            baseTroopStats[type].attack    = finalProfile.attack || 0;
            baseTroopStats[type].defense   = finalProfile.defense || 0;
            baseTroopStats[type].lethality = finalProfile.lethality || 0;
            baseTroopStats[type].health    = finalProfile.health || 0;
        }
    });
}

function loadTroopDatabase() {
    fetch('troops.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // 1. Save data to the global tracker
            troopDataJson = data; 
            
            // 2. Build out dropdown options dynamically
            populateTroopDropdowns(); 
            
            // 3. Initialize current unbuffed base selections 
            lookupTroopBaseStats(troopDataJson);
            
            console.log("Troops database loaded successfully.");
        })
        .catch(error => {
            console.error("Failed to parse troops.json profile source:", error);
        });
}

// Fire the network fetch operation automatically when your app starts up
document.addEventListener("DOMContentLoaded", loadTroopDatabase);




// ==========================================================================
// 1. INITIALIZATION & DYNAMIC SCREEN BUILDERS
// ==========================================================================

// Automatically triggers the data pipeline when your webpage loads
window.addEventListener('DOMContentLoaded', () => {
    fetch('heroes.json')
        .then(response => response.json())
        .then(data => {
            gameData = data;
            populateDropdowns();
            
            document.getElementById('infHeroSelect').addEventListener('change', () => renderHeroSkills('infantry', 'infHeroSelect', 'infSkillsContainer', 'infWidgetContainer', 'infWidget'));
            document.getElementById('lanHeroSelect').addEventListener('change', () => renderHeroSkills('lancer', 'lanHeroSelect', 'lanSkillsContainer', 'lanWidgetContainer', 'lanWidget'));
            document.getElementById('mmHeroSelect').addEventListener('change', () => renderHeroSkills('marksman', 'mmHeroSelect', 'mmSkillsContainer', 'mmWidgetContainer', 'MMWidget'));
            
            // Initial render
            renderHeroSkills('infantry', 'infHeroSelect', 'infSkillsContainer', 'infWidgetContainer', 'infWidget');
            renderHeroSkills('lancer', 'lanHeroSelect', 'lanSkillsContainer', 'lanWidgetContainer', 'lanWidget');
            renderHeroSkills('marksman', 'mmHeroSelect', 'mmSkillsContainer', 'mmWidgetContainer', 'MMWidget');
        })
        .catch(error => console.error("Error connecting to data schema structure:", error));
});

// Scans JSON keys and generates dynamic HTML choices inside dropdown layers
function populateDropdowns() {
    const categories = ['infantry', 'lancer', 'marksman'];
    const selectors = ['infHeroSelect', 'lanHeroSelect', 'mmHeroSelect'];
    
    categories.forEach((category, index) => {
        const dropdown = document.getElementById(selectors[index]);
        if (!dropdown) return;
        dropdown.innerHTML = ''; // Wipe out baseline structural defaults
        
        Object.keys(gameData[category]).forEach(key => {
            let elementOption = document.createElement('option');
            elementOption.value = key;
            elementOption.innerText = gameData[category][key].name;
            dropdown.appendChild(elementOption);
        });
    });
}

// Scans only the relevant Bear Hunt skills for the chosen hero and draws inputs on the fly
function renderHeroSkills(category, selectId, containerId, widgetContainerId, widgetInputId) {
    const selectedHeroKey = document.getElementById(selectId).value;
    const container = document.getElementById(containerId);
    const widgetContainer = document.getElementById(widgetContainerId);
    
    // Clear out baseline input markup
    container.innerHTML = '';
    widgetContainer.innerHTML = '';
    activeSkillInputs[category] = []; 

    const heroData = gameData[category][selectedHeroKey];
    if (!heroData) return;

    // 1. Render Skills
    if (heroData.skills) {
        heroData.skills.forEach((skill, index) => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'form-group';

            const label = document.createElement('label');
            label.innerHTML = `${skill.name} <span class="helper-text">Lvl 1-5</span>`;
            
            const input = document.createElement('input');
            input.type = 'number';
            const uniqueId = `input-${category}-${index}`;
            input.id = uniqueId;
            input.value = 5; 
            input.min = 1;
            input.max = 5;

            skillDiv.appendChild(label);
            skillDiv.appendChild(input);
            container.appendChild(skillDiv);

            activeSkillInputs[category].push(uniqueId);
        });
    }

    // 2. Render Widget (if applicable)
    if (heroData.widget_type && heroData.widget_type !== "none") {
        widgetContainer.innerHTML = `
            <div class="form-group" style="border-top: 1px dashed #374151; padding-top: 10px;">
                <label>Exclusive Widget <span class="helper-text">Lvl 0-10</span></label>
                <input type="number" id="${widgetInputId}" value="0" min="0" max="10">
            </div>
        `;
    } else {
        // Render a hidden input so the math engine calculateStats() doesn't break looking for the ID
        widgetContainer.innerHTML = `<input type="hidden" id="${widgetInputId}" value="0">`;
    }
}
// ==========================================================================
// 2. CORE STANDALONE LOGIC HELPERS
// ==========================================================================

// Universally calculates widget modifiers based on structural JSON metrics
function getWidgetBonus(heroData, inputLevel) {
    if (!heroData || heroData.widget_type === "none") {
        return { type: "none", scope: "none", value: 0 };
    }
    
    const safeIndex = Math.min(10, Math.max(0, inputLevel));
    const bonusValue = heroData.widget_table[safeIndex] || 0;
    
    return {
        type: heroData.widget_type,     // e.g., "attack", "lethality"
        scope: heroData.widget_scope,   // e.g., "global", "infantry", "lancer"
        value: bonusValue
    };
}

// ==========================================================================
// 3. MAIN MATH CALCULATION ENGINE
// ==========================================================================

function calculateStats() {
    // Get selected heroes from dropdown selections
    const selectedInfHero = document.getElementById('infHeroSelect').value;
    const selectedLanHero = document.getElementById('lanHeroSelect').value;
    const selectedMmHero = document.getElementById('mmHeroSelect').value;

    // Raw input numerical verification with safety bounds
    const wInf = parseInt(document.getElementById('infWidget').value) || 0;
    const wLan = parseInt(document.getElementById('lanWidget').value) || 0;
    const wMM  = parseInt(document.getElementById('MMWidget').value) || 0;

    // Environmental and capacity variables
    const pAtt = parseFloat(document.getElementById('petAtt').value) || 0;
    const pLeth = parseFloat(document.getElementById('petLeth').value) || 0;
    const cAtt = parseFloat(document.getElementById('cityAtt').value) || 0;
    const cLeth = parseFloat(document.getElementById('cityLeth').value) || 0;
    const SMax = parseInt(document.getElementById('SMax').value) || 0;

    // Account base values
    const tAtt = parseFloat(document.getElementById('bonusTroopAtt').value) || 0;
    const tLeth = parseFloat(document.getElementById('bonusTroopLeth').value) || 0;
    const bInfAtt = parseFloat(document.getElementById('bonusInfAtt').value) || 0;
    const bInfLeth = parseFloat(document.getElementById('bonusInfLeth').value) || 0;
    const bLanAtt = parseFloat(document.getElementById('bonusLanAtt').value) || 0;
    const bLanLeth = parseFloat(document.getElementById('bonusLanLeth').value) || 0;
    const bMmAtt = parseFloat(document.getElementById('bonusMmAtt').value) || 0;
    const bMmLeth = parseFloat(document.getElementById('bonusMmLeth').value) || 0;

    // Base unit raw profiles
    // const rawInfAtt = parseFloat(document.getElementById('baseInfAtt').value) || 0;
    // const rawInfLeth = parseFloat(document.getElementById('baseInfLeth').value) || 0;
    // const rawLanAtt = parseFloat(document.getElementById('baseLanAtt').value) || 0;
    // const rawLanLeth = parseFloat(document.getElementById('baseLanLeth').value) || 0;
    // const rawMmAtt = parseFloat(document.getElementById('baseMmAtt').value) || 0;
    // const rawMmLeth = parseFloat(document.getElementById('baseMmLeth').value) || 0;
    // 1. Run the database lookup to update baseTroopStats with current UI selections

    // PASSING THE REAL OBJECT INSTEAD OF A FILE STRING STRIP
    lookupTroopBaseStats(troopDataJson); 

    // 2. Extract values for each track to use in your formulas
    const infBase = baseTroopStats.infantry;
    const lanBase = baseTroopStats.lancer;
    const mmBase  = baseTroopStats.marksman;

    // Initialize clean stat tracking split by source type
    let stats = {
        // Hero Skill stats broken down by specific troop target
        skills: {
            global:   { attack: 0, lethality: 0 },
            infantry: { attack: 0, lethality: 0 },
            lancer:   { attack: 0, lethality: 0 },
            marksman: { attack: 0, lethality: 0 }
        },
        // Flattened Widget tracking for custom isolated math
        widgets: { 
            attack: 0, 
            lethality: 0 
        }
    };

    // Scan dynamic skills and assign to stats.skills object
    function scanHeroSkills(heroData, activeIdsArray) {
        if (!heroData || !heroData.skills || !activeIdsArray) return;
        
        heroData.skills.forEach((skill, index) => {
            if (!skill || !skill.effects) return;
            const htmlElement = document.getElementById(activeIdsArray[index]);
            if (!htmlElement) return;

            const lvl = Math.min(5, Math.max(1, parseInt(htmlElement.value) || 5));
            
            skill.effects.forEach(effect => {
                const bonusValue = effect.table[lvl] || 0;
                if (stats.skills[effect.scope] && stats.skills[effect.scope][effect.stat] !== undefined) {
                    stats.skills[effect.scope][effect.stat] += bonusValue;
                }
            });
        });
    }

    // Run skill scans across active deployments
    scanHeroSkills(gameData.infantry[selectedInfHero], activeSkillInputs.infantry);
    scanHeroSkills(gameData.lancer[selectedLanHero],   activeSkillInputs.lancer);
    scanHeroSkills(gameData.marksman[selectedMmHero],  activeSkillInputs.marksman);

    // Compute widget outputs using JSON structure
    const widgetResults = [
        getWidgetBonus(gameData.infantry[selectedInfHero], wInf),
        getWidgetBonus(gameData.lancer[selectedLanHero], wLan),
        getWidgetBonus(gameData.marksman[selectedMmHero], wMM)
    ];

    // Dynamically inject Widget stats directly into the flat tracker
    widgetResults.forEach(res => {
        if (res && res.type !== "none" && stats.widgets[res.type] !== undefined) {
            stats.widgets[res.type] += res.value;
        }
    });

    // Separate mathematical execution
    let mAtt  = pAtt  + cAtt  + stats.widgets.attack;
    let mLeth = pLeth + cLeth + stats.widgets.lethality;

    console.log("stats.widget.attack, lethality: ", stats.widgets.attack,", ", stats.widgets.lethality);

    // Combine global account variables with class specific modifiers (Stats object includes Specific Skills + Specific Widgets)
    let finalInfAttPct = (tAtt + bInfAtt) + mAtt*(1 + (tAtt + bInfAtt)/100);
    let finalInfLethPct = (tLeth + bInfLeth) + mLeth*(1 + (tLeth + bInfLeth)/100);
    
    let finalLanAttPct = (tAtt + bLanAtt) + mAtt*(1 + (tAtt + bLanAtt)/100);
    let finalLanLethPct = (tLeth + bLanLeth) + mLeth*(1 + (tLeth + bLanLeth)/100);
    
    let finalMmAttPct = (tAtt + bMmAtt) + mAtt*(1 + (tAtt + bMmAtt)/100);
    let finalMmLethPct = (tLeth + bMmLeth) + mLeth*(1 + (tLeth + bMmLeth)/100);

    // Convert raw percentage multipliers to final raw math scales
    const trueInfAtt = baseTroopStats.infantry.attack * (1 + finalInfAttPct / 100);
    const trueInfLeth = baseTroopStats.infantry.lethality * (1 + finalInfLethPct / 100);
    const trueLanAtt = baseTroopStats.lancer.attack * (1 + finalLanAttPct / 100);
    const trueLanLeth = baseTroopStats.lancer.lethality * (1 + finalLanLethPct / 100);
    const trueMmAtt = baseTroopStats.marksman.attack * (1 + finalMmAttPct / 100);
    const trueMmLeth = baseTroopStats.marksman.lethality * (1 + finalMmLethPct / 100);

    const A = trueInfAtt * trueInfLeth * baseTroopStats.infantry.attack * baseTroopStats.infantry.lethality; 
    const B = trueLanAtt * trueLanLeth * baseTroopStats.lancer.attack * baseTroopStats.lancer.lethality; 
    const C = trueMmAtt * trueMmLeth * baseTroopStats.marksman.attack * baseTroopStats.marksman.lethality; 

    // Prevent divide-by-zero if stats are completely empty
    const denominator = (A**2 + B**2 + C**2) || 1; 

    const resOpInf = SMax * (A**2) / denominator;
    const resOpLan = SMax * (B**2) / denominator;
    const resOpMm  = SMax * (C**2) / denominator;

    // Safety check for SMax to prevent NaN percentages
    const perInf = SMax > 0 ? (resOpInf / SMax * 100) : 0;
    const perLan = SMax > 0 ? (resOpLan / SMax * 100) : 0;
    const perMm  = SMax > 0 ? (resOpMm / SMax * 100) : 0;

    // Display percentage calculations inside UI layout text items
    document.getElementById('resInfMod').innerHTML = `Att: ${finalInfAttPct.toFixed(1)}% | Leth: ${finalInfLethPct.toFixed(1)}%`;
    document.getElementById('resLanMod').innerHTML = `Att: ${finalLanAttPct.toFixed(1)}% | Leth: ${finalLanLethPct.toFixed(1)}%`;
    document.getElementById('resMmMod').innerHTML  = `Att: ${finalMmAttPct.toFixed(1)}% | Leth: ${finalMmLethPct.toFixed(1)}%`;

    document.getElementById('opInf').innerHTML = `${Math.round(resOpInf).toLocaleString()} (${perInf.toFixed(1)}%)`;
    document.getElementById('opLan').innerHTML = `${Math.round(resOpLan).toLocaleString()} (${perLan.toFixed(1)}%)`;
    document.getElementById('opMm').innerHTML =  `${Math.round(resOpMm).toLocaleString()} (${perMm.toFixed(1)}%)`;

    // Make results panel visible
    document.getElementById('resultsSection').classList.remove('hidden');
}