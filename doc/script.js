// State Management
        let currentStep = 1;
        let inputSize = 4;
        let inputData = '';
        let encodedData = [];
        let receivedData = [];
        let errorPosition = 0;
        let logCount = 0;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            updateProgress();
        });

        // Input Size Selection
        function selectInputSize(size) {
            inputSize = size;
            document.querySelectorAll('.size-btn').forEach((btn, index) => {
                if ((size === 4 && index === 0) || (size === 8 && index === 1)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            document.getElementById('binaryInput').maxLength = size;
            document.getElementById('binaryInput').placeholder = `Enter ${size} binary digits (0 or 1)`;
            validateInput(document.getElementById('binaryInput'));
        }

        // Validate Binary Input
        function validateInput(input) {
            input.value = input.value.replace(/[^01]/g, '');
            inputData = input.value;
            document.getElementById('inputCount').textContent = inputData.length;
            
            const display = document.getElementById('currentInputDisplay');
            const bitDisplay = document.getElementById('bitDisplay');
            const nextBtn = document.getElementById('nextEncodeBtn');
            
            if (inputData.length > 0) {
                display.style.display = 'block';
                bitDisplay.innerHTML = '';
                for (let bit of inputData) {
                    bitDisplay.innerHTML += `<div class="bit-box">${bit}</div>`;
                }
            } else {
                display.style.display = 'none';
            }
            
            nextBtn.disabled = inputData.length !== inputSize;
        }

        // Generate Random Input
        function generateRandom() {
            let random = '';
            for (let i = 0; i < inputSize; i++) {
                random += Math.random() > 0.5 ? '1' : '0';
            }
            document.getElementById('binaryInput').value = random;
            validateInput(document.getElementById('binaryInput'));
            addLog('input', `Generated random ${inputSize}-bit data`);
        }

        // Go to Step
        function goToStep(step) {
            if (step === 2 && inputData.length === inputSize) {
                encodeData();
            } else if (step === 3) {
                prepareTransmission();
            } else if (step === 4) {
                prepareErrorInjection();
            } else if (step === 5) {
                decodeData();
            }
            
            // Update UI
            document.querySelectorAll('.step-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`step${step}`).classList.add('active');
            
            // Update progress steps
            document.querySelectorAll('.step').forEach((s, index) => {
                const stepNum = index + 1;
                s.classList.remove('active', 'completed');
                if (stepNum < step) {
                    s.classList.add('completed');
                } else if (stepNum === step) {
                    s.classList.add('active');
                }
            });
            
            currentStep = step;
            updateProgress();
        }

        // Update Progress Bar
        function updateProgress() {
            const progress = ((currentStep - 1) / 4) * 100;
            document.getElementById('progressFill').style.width = `${progress}%`;
        }

        // Encode Data (Hamming 7,4)
        function encodeData() {
            // For Hamming(7,4): positions 1,2,4 are parity bits
            // positions 3,5,6,7 are data bits
            const d = inputData.split('').map(Number);
            
            // Calculate parity bits
            // P1 covers positions 1,3,5,7 (bits: P1, D1, D2, D4)
            const p1 = d[0] ^ d[1] ^ d[3];
            // P2 covers positions 2,3,6,7 (bits: P2, D1, D3, D4)
            const p2 = d[0] ^ d[2] ^ d[3];
            // P4 covers positions 4,5,6,7 (bits: P4, D2, D3, D4)
            const p4 = d[1] ^ d[2] ^ d[3];
            
            // Build encoded data: [P1, P2, D1, P4, D2, D3, D4]
            encodedData = [p1, p2, d[0], p4, d[1], d[2], d[3]];
            
            // Update UI
            const originalDisplay = document.getElementById('originalDataDisplay');
            originalDisplay.innerHTML = '';
            d.forEach(bit => {
                originalDisplay.innerHTML += `<div class="bit-box">${bit}</div>`;
            });
            
            // Update calculation boxes
            document.getElementById('p1Result').textContent = p1;
            document.getElementById('p1Formula').textContent = `XOR: ${d[0]} ⊕ ${d[1]} ⊕ ${d[3]} = ${p1}`;
            
            document.getElementById('p2Result').textContent = p2;
            document.getElementById('p2Formula').textContent = `XOR: ${d[0]} ⊕ ${d[2]} ⊕ ${d[3]} = ${p2}`;
            
            document.getElementById('p4Result').textContent = p4;
            document.getElementById('p4Formula').textContent = `XOR: ${d[1]} ⊕ ${d[2]} ⊕ ${d[3]} = ${p4}`;
            
            // Update encoded bits display
            const encodedBitsDiv = document.getElementById('encodedBits');
            encodedBitsDiv.innerHTML = '';
            const parityPositions = [1, 2, 4];
            encodedData.forEach((bit, index) => {
                const position = index + 1;
                const isParity = parityPositions.includes(position);
                encodedBitsDiv.innerHTML += `
                    <div class="encoded-bit">
                        <div class="bit-position">${position}</div>
                        <div class="encoded-bit-value ${isParity ? 'parity-bit' : 'data-bit'}">${bit}</div>
                    </div>
                `;
            });
            
            addLog('input', `Entered ${inputSize}-bit binary data: ${inputData}`);
            addLog('encode', `Calculated 3 parity bits at positions: 1, 2, 4`);
            addLog('encode', `Generated 7-bit Hamming code: ${encodedData.join('')}`);
        }

        // Prepare Transmission
        function prepareTransmission() {
            receivedData = [...encodedData];
            const transitBitsDiv = document.getElementById('transitBits');
            transitBitsDiv.innerHTML = '';
            encodedData.forEach((bit, index) => {
                transitBitsDiv.innerHTML += `
                    <div class="data-bit-item">
                        <div class="bit-position-badge">${index + 1}</div>
                        <div class="bit-value-box">${bit}</div>
                    </div>
                `;
            });
            addLog('transmit', 'Starting data transmission...');
            setTimeout(() => {
                addLog('transmit', 'Transmission complete');
            }, 500);
        }

        // Prepare Error Injection
        function prepareErrorInjection() {
            const receivedBitsDiv = document.getElementById('receivedBits');
            const manualFlipDiv = document.getElementById('manualFlipBits');
            receivedBitsDiv.innerHTML = '';
            manualFlipDiv.innerHTML = '';
            
            receivedData.forEach((bit, index) => {
                receivedBitsDiv.innerHTML += `
                    <div class="data-bit-item">
                        <div class="bit-position-badge">${index + 1}</div>
                        <div class="bit-value-box">${bit}</div>
                    </div>
                `;
                
                manualFlipDiv.innerHTML += `
                    <button class="flip-bit-btn" onclick="flipBit(${index}, this)" data-index="${index}">${bit}</button>
                `;
            });
            
            
            
        }

        // Select Error Method
      function selectErrorMethod(method) {
    document.querySelectorAll('.error-method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (method === 'random') {
        document.querySelector('.error-method-btn.random').classList.add('active');

        // Introduce random error
        errorPosition = Math.floor(Math.random() * 7);
        receivedData[errorPosition] = receivedData[errorPosition] === 0 ? 1 : 0;

        updateManualFlipButtons();

        // ✅ ADD HERE
        updateReceivedBitsUI();

        addLog('transmit', `Data successfully transmitted through channel`);
        addLog('error', `Random error introduced at position ${errorPosition + 1}`);

    } else {
        document.querySelector('.error-method-btn.clean').classList.add('active');

        errorPosition = 0;
        receivedData = [...encodedData];

        updateManualFlipButtons();

       
        updateReceivedBitsUI();

        addLog('transmit', `Clean transmission - no errors`);
    }
}
        // Flip Bit Manually
        function flipBit(index, btn) {
            
            receivedData[index] = receivedData[index] === 0 ? 1 : 0;
            btn.textContent = receivedData[index];
            btn.classList.toggle('flipped');
            errorPosition = index + 1;
            
            // Deselect method buttons
            document.querySelectorAll('.error-method-btn').forEach(b => b.classList.remove('active'));
            
            addLog('error', `Manual bit flip at position ${index + 1}`);
            updateReceivedBitsUI();
        }

        function updateReceivedBitsUI() {
    const receivedBitsDiv = document.getElementById('receivedBits');
    receivedBitsDiv.innerHTML = '';

    receivedData.forEach((bit, index) => {
        receivedBitsDiv.innerHTML += `
            <div class="data-bit-item">
                <div class="bit-position-badge">${index + 1}</div>
                <div class="bit-value-box">${bit}</div>
            </div>
        `;
    });
    }
        // Update Manual Flip Buttons
        function updateManualFlipButtons() {
            document.querySelectorAll('.flip-bit-btn').forEach(btn => {
                const index = parseInt(btn.dataset.index);
                btn.textContent = receivedData[index];
                btn.classList.remove('flipped');
            });
        }

        // Decode Data
   function decodeData() {

    const beforeCorrection = [...receivedData];

    // ✅ ALWAYS define this (fixes your crash)
    let correctedCode = [...receivedData];

    // Calculate syndrome
    const s1 = receivedData[0] ^ receivedData[2] ^ receivedData[4] ^ receivedData[6];
    const s2 = receivedData[1] ^ receivedData[2] ^ receivedData[5] ^ receivedData[6];
    const s4 = receivedData[3] ^ receivedData[4] ^ receivedData[5] ^ receivedData[6];

    const syndrome = s4 * 4 + s2 * 2 + s1;

    // Update UI (checks)
    document.getElementById('checkP1').textContent = s1;
    document.getElementById('checkP1Formula').textContent =
        `XOR: ${receivedData[0]} ⊕ ${receivedData[2]} ⊕ ${receivedData[4]} ⊕ ${receivedData[6]} = ${s1}`;

    document.getElementById('checkP2').textContent = s2;
    document.getElementById('checkP2Formula').textContent =
        `XOR: ${receivedData[1]} ⊕ ${receivedData[2]} ⊕ ${receivedData[5]} ⊕ ${receivedData[6]} = ${s2}`;

    document.getElementById('checkP4').textContent = s4;
    document.getElementById('checkP4Formula').textContent =
        `XOR: ${receivedData[3]} ⊕ ${receivedData[4]} ⊕ ${receivedData[5]} ⊕ ${receivedData[6]} = ${s4}`;

    document.getElementById('syndromeValue').textContent = syndrome;

    const syndromeMsg = document.getElementById('syndromeMessage');
    const decodeDesc = document.getElementById('decodeDescription');

    if (syndrome === 0) {
        syndromeMsg.textContent = 'No error detected';
        decodeDesc.textContent = 'Data received without errors. Original data extracted successfully.';
    } else {
        syndromeMsg.textContent = `Error detected at position ${syndrome}`;
        decodeDesc.textContent = `Single-bit error corrected at position ${syndrome}. Original data recovered.`;

        addLog('decode', `Before correction: ${beforeCorrection.join('')}`);

        // ✅ Correct on COPY (not original)
        correctedCode[syndrome - 1] =
            correctedCode[syndrome - 1] === 0 ? 1 : 0;

        addLog('decode', `After correction: ${correctedCode.join('')}`);

        addLog('error', `Error detected at position ${syndrome}`);
        addLog('decode', `Error corrected at position ${syndrome}`);
    }

    // Show corrected codeword (7 bits)
const correctedCodewordDiv = document.getElementById('correctedCodewordDisplay');
correctedCodewordDiv.innerHTML = '';

correctedCode.forEach((bit, index) => {
    correctedCodewordDiv.innerHTML += `
        <div class="data-bit-item">
            <div class="bit-position-badge">${index + 1}</div>
            <div class="bit-value-box">${bit}</div>
        </div>
    `;
});

    // Extract original data from corrected code
    const correctedData = [
        correctedCode[2],
        correctedCode[4],
        correctedCode[5],
        correctedCode[6]
    ];

    // Show received (with error)
    const decodeReceivedDiv = document.getElementById('decodeReceivedBits');
    decodeReceivedDiv.innerHTML = '';
    receivedData.forEach((bit, index) => {
        decodeReceivedDiv.innerHTML += `
            <div class="data-bit-item">
                <div class="bit-position-badge">${index + 1}</div>
                <div class="bit-value-box">${bit}</div>
            </div>
        `;
    });

    // Show corrected data
    const correctedDiv = document.getElementById('correctedDataDisplay');
    correctedDiv.innerHTML = '';
    correctedData.forEach(bit => {
        correctedDiv.innerHTML += `<div class="bit-box">${bit}</div>`;
    });

    addLog('decode', `Extracted original data: ${correctedData.join('')}`);
}

        // Add Log Entry
        function addLog(type, message) {
            const logList = document.getElementById('logList');
            const time = new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            });
            
            // Remove empty state if present
            const emptyState = logList.querySelector('.log-empty');
            if (emptyState) {
                emptyState.remove();
            }
            
            const logItem = document.createElement('div');
            logItem.className = `log-item ${type}`;
            logItem.innerHTML = `
                <div class="log-item-header">
                    <span class="log-tag ${type}">${type}</span>
                    <span class="log-time">${time}</span>
                </div>
                <div class="log-message">${message}</div>
            `;
            
            logList.appendChild(logItem);
            logCount++;
            document.getElementById('logCount').textContent = `${logCount} event(s) logged`;
            
            // Scroll to bottom
            logList.scrollTop = logList.scrollHeight;
        }

        // Reset Simulation
        function resetSimulation() {
            currentStep = 1;
            inputData = '';
            encodedData = [];
            receivedData = [];
            errorPosition = 0;
            logCount = 0;
            
            document.getElementById('binaryInput').value = '';
            document.getElementById('inputCount').textContent = '0';
            document.getElementById('currentInputDisplay').style.display = 'none';
            document.getElementById('nextEncodeBtn').disabled = true;
            document.getElementById('logList').innerHTML = `
                <div class="log-empty">
                    <div class="log-empty-icon">📋</div>
                    <div>No logs yet</div>
                    <div style="font-size: 12px; margin-top: 5px;">Events will appear here as you progress</div>
                </div>
            `;
            document.getElementById('logCount').textContent = '0 event(s) logged';
            
            goToStep(1);
        }