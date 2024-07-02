let notificationShown = false;

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    async function fetchDataAndPopulate() {
        try {
            let savedModes = localStorage.getItem('selectedModes');
            if (savedModes === 'undefined' || savedModes === null) {
                savedModes = '[true, false, false, false, false, false]';
            }
            const selectedModes = JSON.parse(savedModes);
            const selectedRegion = localStorage.getItem('selectedRegion') || 'Europe';

            const selectedRegionElement = document.getElementById(selectedRegion);
            if (selectedRegionElement) {
                selectedRegionElement.checked = true;
            }

            document.getElementById('teamMode').checked = selectedModes[0];
            document.getElementById('survivalMode').checked = selectedModes[1];
            document.getElementById('deathmatchMode').checked = selectedModes[2];
            document.getElementById('moddingMode').checked = selectedModes[3];
            document.getElementById('invasionMode').checked = selectedModes[4];
            document.getElementById('customMode').checked = selectedModes[5];

            const response = await fetch('https://starblast.dankdmitron.dev/api/simstatus.json');
            const data = await response.json();

            let mergedData = [...data];

            let systemsHTMLArray = [];
            let americaCount = 0;
            let europeCount = 0;
            let asiaCount = 0;

            const seenSystems = new Map();

            mergedData.forEach(location => {
                if (location && location.location) {
                    const { location: region, address, systems } = location;

                    switch (region.toLowerCase()) {
                        case 'america':
                            americaCount += location.current_players;
                            break;
                        case 'europe':
                            europeCount += location.current_players;
                            break;
                        case 'asia':
                            asiaCount += location.current_players;
                            break;
                        default:
                            break;
                    }

                    if (region === selectedRegion) {
                        systems.forEach(system => {
                            if (system.unlisted === true) {
                                system.mode = `Custom - ${system.mode.charAt(0).toUpperCase() + system.mode.slice(1)}`;
                                console.log(system);
                            }

                            const systemKey = `${address}-${system.id}`;

                            if (seenSystems.has(systemKey)) {
                                if (system.time > seenSystems.get(systemKey).time) {
                                    seenSystems.set(systemKey, {...system, address, isDuplicate: true });
                                }
                            } else {
                                seenSystems.set(systemKey, {...system, address, isDuplicate: false });
                            }
                        });
                    }
                } else {
                    console.warn('Location object or its "location" property is undefined or null:', location);
                }
            });

            seenSystems.forEach((system) => {
                let displayMode = system.mode || system.actualMode || 'unknown';
                const modeName = displayMode.charAt(0).toUpperCase() + displayMode.slice(1);

                if (system.mode.startsWith('Custom - ')) {
                    displayMode = "custom";
                }
                const modeIcon = getModeIcon(displayMode);

                if (!system.isDuplicate && isSelectedMode(displayMode) && !(system.survival === true)) {
                    systemsHTMLArray.push(`
                    <div class="card system-card mb-3" onclick="fetchSystemDetails(${system.id}, '${system.name}', '${displayMode}', ${Math.round(system.time / 60)}, ${system.criminal_activity}, ${system.players}, '${selectedRegion}', '${system.address}')">
                        <div class="card-body">
                            <h3 class="nunito-sans-bold mb-0">${system.name} <span class="float-end">${Math.round(system.time / 60)} min</span></h3>
                            <span>${modeIcon} <i>${modeName}</i> <b class="float-end">${system.players} players</b></span>
                        </div>
                    </div>
                `);
                }
            });

            systemsHTMLArray.sort((a, b) => {
                const timeA = parseInt(a.match(/<span class="float-end">(\d+) min<\/span>/)[1]);
                const timeB = parseInt(b.match(/<span class="float-end">(\d+) min<\/span>/)[1]);
                return timeA - timeB;
            });

            const systemsHTML = systemsHTMLArray.join('');

            document.getElementById('countAmerica').innerHTML = `<i class="bi bi-person-fill"></i> ${americaCount}`;
            document.getElementById('countEurope').innerHTML = `<i class="bi bi-person-fill"></i> ${europeCount}`;
            document.getElementById('countAsia').innerHTML = `<i class="bi bi-person-fill"></i> ${asiaCount}`;

            const totalPlayers = americaCount + europeCount + asiaCount;
            document.getElementById('countTotal').innerHTML = `<i class="bi bi-person-fill"></i> ${totalPlayers}`;

            document.getElementById('systemsList').innerHTML = systemsHTML;

            saveSelectedModes(selectedModes);

        } catch (error) {
            console.error('Error fetching or parsing simstatus.json:', error);
        }
    }

    function getModeIcon(mode) {
        // Check if mode starts with "custom" (case insensitive)
        if (mode.trim().toLowerCase().startsWith("custom")) {
            return '<i class="bi bi-wrench"></i>';
        }

        // Default mode icons for other cases
        const modeIcons = {
            team: '<i class="bi bi-people-fill"></i>',
            survival: '<i class="bi bi-bullseye"></i>',
            deathmatch: '<i class="bi bi-trophy-fill"></i>',
            modding: '<i class="bi bi-code-slash"></i>',
            invasion: '<i class="bi bi-border"></i>'
        };

        // Return the corresponding icon or an empty string if mode is not found
        return modeIcons[mode.trim().toLowerCase()] || '';
    }

    function isSelectedMode(mode) {
        let savedModes = localStorage.getItem('selectedModes');
        if (savedModes === 'undefined' || savedModes === null) {
            savedModes = '[true, false, false, false, false, false]';
        }
        const selectedModes = JSON.parse(savedModes);

        switch (mode) {
            case 'team':
                return selectedModes[0];
            case 'survival':
                return selectedModes[1];
            case 'deathmatch':
                return selectedModes[2];
            case 'modding':
                return selectedModes[3];
            case 'invasion':
                return selectedModes[4];
            case 'custom':
                return selectedModes[5];
            default:
                return false;
        }
    }

    function saveSelectedModes() {
        const selectedModes = [
            document.getElementById('teamMode').checked,
            document.getElementById('survivalMode').checked,
            document.getElementById('deathmatchMode').checked,
            document.getElementById('moddingMode').checked,
            document.getElementById('invasionMode').checked,
            document.getElementById('customMode').checked
        ];

        localStorage.setItem('selectedModes', JSON.stringify(selectedModes));
    }

    const modeCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    modeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            saveSelectedModes();
            fetchDataAndPopulate();
        });
    });

    const regionRadios = document.querySelectorAll('input[name="region"]');
    regionRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            localStorage.setItem('selectedRegion', document.querySelector('input[name="region"]:checked').id);
            fetchDataAndPopulate();
        });
    });

    fetchDataAndPopulate();
    handleNewServerAlert();

    setInterval(() => {
        fetchDataAndPopulate();
        handleNewServerAlert();
    }, 5000);
});

async function fetchSystemDetails(id, name, mode, time, criminal, playerCount, region, address) {
    try {
        if (!address) {
            throw new Error(`Address is not valid for system ID ${id}`);
        }

        const response = await fetch(`https://starblast.dankdmitron.dev/api/status/${id}@${address}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch system details for ID ${id}. Status: ${response.status}`);
        }
        const systemDetails = await response.json();

        if (!systemDetails || !systemDetails.name) {
            throw new Error(`System with ID ${id}@${address} not found in pixelmelt API`);
        }

        let ecpCount = 0;
        let playerNames = [];

        if (systemDetails.players) {
            for (let playerId of Object.keys(systemDetails.players)) {
                let player = systemDetails.players[playerId];
                playerNames.push(player.player_name);
                if (player.custom) {
                    ecpCount++;
                }
            }
        }

        updateSystemReport(name, mode, id, region, time, criminal, playerCount, ecpCount, playerNames, address);

    } catch (error) {
        console.error(`Error fetching or parsing details for system ID ${id}:`, error);
        updateSystemReport(name, mode, id, region, time, criminal, playerCount, 'Unknown', [], address);
    }
}

function updateSystemReport(systemName, mode, id, region, time, criminal, playerCount, ecpCount, playerNames, address) {
    document.getElementById('systemReportSystemName').textContent = systemName;
    document.getElementById('systemReportMode').textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
    document.getElementById('systemReportRegion').textContent = region;
    document.getElementById('systemReportTime').textContent = `${time} min`;
    document.getElementById('systemReportID').textContent = id;
    document.getElementById('systemReportCriminality').textContent = `${criminal} crimes`;
    document.getElementById('systemReportPlayerCount').textContent = `${playerCount}`;
    document.getElementById('systemReportLink').href = `https://starblast.io/#${id}@${address}`;
    if (ecpCount === 'Unknown') {
        document.getElementById('systemReportECPPlayerCount').textContent = '-';
    } else {
        document.getElementById('systemReportECPPlayerCount').textContent = ecpCount;
    }

    let playerListElement = document.getElementById('systemReportPlayerList');

    if (playerNames && playerNames.length > 0) {
        let playerListHTML = playerNames.join(', ');
        playerListElement.textContent = playerListHTML;
    } else {
        playerListElement.textContent = 'No players found.';
    }

    document.getElementById('systemReport').style.display = 'block';
}

window.fetchSystemDetails = fetchSystemDetails;