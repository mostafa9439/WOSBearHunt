// Hero skill stat tables (Levels 0 through 5 mapping)
const rampLethTable = [0, 4.6, 9.2, 13.8, 18.4, 23.0];     // Hector S1
const blitzLethTable = [0, 5.0, 10.0, 15.0, 20.0, 25.0];   // Hector S2
const badLuckAttTable = [0, 5.0, 10.0, 15.0, 20.0, 25.0];  // Mia S1
const luckyLethTable = [0, 5.0, 10.0, 15.0, 20.0, 25.0];   // Mia S2
const eagleLethTable = [0, 5.0, 10.0, 15.0, 20.0, 25.0];   // Gwen S1
const airDomAttTable = [0, 4.0, 8.0, 12.0, 16.0, 20.0];    // Gwen S2 (Att)
const airDomLethTable = [0, 0.6, 1.2, 1.8, 2.4, 3.0];     // Gwen S2 (Leth)
const blastLethTable = [0, 2.0, 4.0, 6.0, 8.0, 10.0];      // Gwen S3

// widget progression curve
const miaWidgetAttTable = [0, 0, 5.0, 5.0, 7.5, 7.5, 10.0, 10.0, 12.5, 12.5, 15.0];
const gwenWidgetLethTable = [0, 0, 5.0, 5.0, 7.5, 7.5, 10.0, 10.0, 12.5, 12.5, 15.0];

function calculateStats() {
    // Get selected heroes from dropdown selections
    const selectedInfHero = document.getElementById('infHeroSelect').value;
    const selectedLanHero = document.getElementById('lanHeroSelect').value;
    const selectedMmHero = document.getElementById('mmHeroSelect').value;

    // Raw input numerical verification with safety bounds
    const inf1 = Math.min(5, Math.max(1, parseInt(document.getElementById('heroInf1').value) || 5));
    const inf2 = Math.min(5, Math.max(1, parseInt(document.getElementById('heroInf2').value) || 5));
    const wInf = parseInt(document.getElementById('infWidget').value) || 0;

    const lan1 = Math.min(5, Math.max(1, parseInt(document.getElementById('heroLan1').value) || 5));
    const lan2 = Math.min(5, Math.max(1, parseInt(document.getElementById('heroLan2').value) || 5));
    const wLan = parseInt(document.getElementById('lanWidget').value) || 0;

    const mm1 = Math.min(5, Math.max(1, parseInt(document.getElementById('heroMM1').value) || 5));
    const mm2 = Math.min(5, Math.max(1, parseInt(document.getElementById('heroMM2').value) || 5));
    const mm3 = Math.min(5, Math.max(1, parseInt(document.getElementById('heroMM3').value) || 5));
    const wMM = parseInt(document.getElementById('MMWidget').value) || 0;

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
    const rawInfAtt = parseFloat(document.getElementById('baseInfAtt').value) || 0;
    const rawInfLeth = parseFloat(document.getElementById('baseInfLeth').value) || 0;
    const rawLanAtt = parseFloat(document.getElementById('baseLanAtt').value) || 0;
    const rawLanLeth = parseFloat(document.getElementById('baseLanLeth').value) || 0;
    const rawMmAtt = parseFloat(document.getElementById('baseMmAtt').value) || 0;
    const rawMmLeth = parseFloat(document.getElementById('baseMmLeth').value) || 0;

    // Accumulate global modifiers
    let mAtt = pAtt + cAtt;
    let mLeth = pLeth + cLeth;
    

    // Inject active hero profile modifications
    if (selectedLanHero === 'mia') {
        const lanWidget = Math.min(10, Math.max(0, wLan)); 
        mAtt += miaWidgetAttTable[lanWidget];
        console.log("mia widget increase:", miaWidgetAttTable[lanWidget]);
        console.log("mAtt: ", mAtt);
    }
    if (selectedMmHero === 'gwen') {
        const mmWidget = Math.min(10, Math.max(0,wMM));
        mLeth += gwenWidgetLethTable[mmWidget];
    }

    // mAtt = mAtt/100;
    // mLeth = mLeth/100;

    let totalGlobalAtt = tAtt + mAtt + tAtt*mAtt/100;
    let totalGlobalLeth = tLeth + mLeth + tLeth*mLeth/100;

    // if (selectedLanHero === 'mia') {
    //     totalGlobalAtt += badLuckAttTable[lan1];
    //     totalGlobalLeth += luckyLethTable[lan2];

    // }
    // if (selectedInfHero === 'hector') {
    //     totalGlobalLeth += blitzLethTable[inf2];
    // }
    // if (selectedMmHero === 'gwen') {
    //     totalGlobalAtt += airDomAttTable[mm2];
    //     totalGlobalLeth += airDomLethTable[mm2] + blastLethTable[mm3];
    // }



    // Combine global account variables with class specific modifiers
    let finalInfAttPct = (tAtt + bInfAtt) + mAtt*(1 + (tAtt + bInfAtt)/100);
    let finalInfLethPct = (tLeth + bInfLeth) + mLeth*(1 + (tLeth + bInfLeth)/100);
    let finalLanAttPct = (tAtt + bLanAtt) + mAtt*(1 + (tAtt + bLanAtt)/100);
    let finalLanLethPct = (tLeth + bLanLeth) + mLeth*(1 + (tLeth + bLanLeth)/100);
    let finalMmAttPct = (tAtt + bMmAtt) + mAtt*(1 + (tAtt + bMmAtt)/100);
    let finalMmLethPct = (tLeth + bMmLeth) + mLeth*(1 + (tLeth + bMmLeth)/100);

    // Target tactical assignments
    // if (selectedInfHero === 'hector') {
    //     finalInfLethPct += rampLethTable[inf1];
    //     finalMmLethPct += (rampLethTable[inf1] * 2);
    // }
    // if (selectedMmHero === 'gwen') {
    //     finalInfLethPct += eagleLethTable[mm1];
    // }

    // Convert raw percentage multipliers to final raw math scales
    const trueInfAtt = rawInfAtt * (1 + finalInfAttPct / 100);
    const trueInfLeth = rawInfLeth * (1 + finalInfLethPct / 100);
    const trueLanAtt = rawLanAtt * (1 + finalLanAttPct / 100);
    const trueLanLeth = rawLanLeth * (1 + finalLanLethPct / 100);
    const trueMmAtt = rawMmAtt * (1 + finalMmAttPct / 100);
    const trueMmLeth = rawMmLeth * (1 + finalMmLethPct / 100);

    // Compute total unit potency indicators
    // const powerInf = trueInfAtt * trueInfLeth;
    // const powerLan = trueLanAtt * trueLanLeth;
    // const powerMm = trueMmAtt * trueMmLeth;

    const A = trueInfAtt*trueInfLeth*rawInfAtt*rawInfLeth/10000; 
    const B = trueLanAtt*trueLanLeth*rawLanAtt*rawLanLeth/10000; 
    const C = trueMmAtt*trueMmLeth*rawMmAtt*rawMmLeth/10000; 

    const opInf = (SMax*A^2)/(A^2 + B^2 +C^2);
    const opLan = (SMax*B^2)/(A^2 + B^2 +C^2);
    const opMm  = (SMax*C^2)/(A^2 + B^2 +C^2);

    const perInf = opInf/SMax*100;
    const perLan = opLan/SMax*100;
    const perMm = opMm/SMax*100;


    // Display percentage calculations inside UI layout text items
    document.getElementById('resInfMod').innerHTML = `Att: ${finalInfAttPct.toFixed(1)}% | Leth: ${finalInfLethPct.toFixed(1)}%`;
    document.getElementById('resLanMod').innerHTML = `Att: ${finalLanAttPct.toFixed(1)}% | Leth: ${finalLanLethPct.toFixed(1)}%`;
    document.getElementById('resMmMod').innerHTML  = `Att: ${finalMmAttPct.toFixed(1)}% | Leth: ${finalMmLethPct.toFixed(1)}%`;

   
    // Push raw numeric scores
    // document.getElementById('resInfTrue').innerHTML = `Att: ${trueInfAtt.toFixed(1)} | Leth: ${trueInfLeth.toFixed(1)}`;
    // document.getElementById('resLanTrue').innerHTML = `Att: ${trueLanAtt.toFixed(1)} | Leth: ${trueLanLeth.toFixed(1)}`;
    // document.getElementById('resMmTrue').innerHTML  = `Att: ${trueMmAtt.toFixed(1)} | Leth: ${trueMmLeth.toFixed(1)}`;

    document.getElementById('opInf').innerHTML = `${Math.round(opInf).toLocaleString()} (${perInf.toFixed(1)}%)`;
    document.getElementById('opLan').innerHTML = `${Math.round(opLan).toLocaleString()} (${perLan.toFixed(1)}%)`;
    document.getElementById('opMm').innerHTML =  `${Math.round(opMm).toLocaleString()} (${perMm.toFixed(1)}%)`;

    // Make results panel visible
    document.getElementById('resultsSection').classList.remove('hidden');
}