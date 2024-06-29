let notificationShown = false;

document.addEventListener('DOMContentLoaded', () => {
    async function fetchDataAndPopulate() {
        try {
            const response = await fetch('https://starblast.dankdmitron.dev/api/simstatus.json');
            const data = await response.json();

            const savedModes = JSON.parse(localStorage.getItem('selectedModes')) || [true, false, false, false, false, false];

            const selectedRegion = localStorage.getItem('selectedRegion') || 'Europe';
            const selectedRegionElement = document.getElementById(selectedRegion);
            if (selectedRegionElement) {
                selectedRegionElement.checked = true;
            }

            document.getElementById('teamMode').checked = savedModes[0];
            document.getElementById('survivalMode').checked = savedModes[1];
            document.getElementById('deathmatchMode').checked = savedModes[2];
            document.getElementById('moddingMode').checked = savedModes[3];
            document.getElementById('invasionMode').checked = savedModes[4];
            document.getElementById('customMode').checked = savedModes[5];

            let systemsHTML = '';
            let systemsHTMLArray = [];

            const modeIcons = {
                team: '<i class="bi bi-people-fill"></i>',
                survival: '<i class="bi bi-bullseye"></i>',
                deathmatch: '<i class="bi bi-trophy-fill"></i>',
                modding: '<i class="bi bi-code-slash"></i>',
                invasion: '<i class="bi bi-border"></i>',
                custom: '<i class="bi bi-wrench"></i>'
            };

            let americaCount = 0;
            let europeCount = 0;
            let asiaCount = 0;

            data.forEach(location => {
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
                        if (isSelectedMode(system.mode) && !(system.mode === 'survival' && system.time > 1800)) {
                            systemsHTMLArray.push(`
                                <div class="card system-card mb-3" onclick="fetchSystemDetails(${system.id}, '${system.name}', '${system.mode}', ${Math.round(system.time / 60)}, ${system.criminal_activity}, ${system.players}, '${region}', '${address}')">
                                    <div class="card-body">
                                        <h3 class="nunito-sans-bold mb-0">${system.name} <span class="float-end">${Math.round(system.time / 60)} min</span></h3>
                                        <span>${modeIcons[system.mode]} <i>${system.mode.charAt(0).toUpperCase() + system.mode.slice(1)}</i> <b class="float-end">${system.players} players</b></span>
                                    </div>
                                </div>
                            `);
                        }
                    });
                }
            });

            systemsHTMLArray.sort((a, b) => {
                const timeA = parseInt(a.match(/<span class="float-end">(\d+) min<\/span>/)[1]);
                const timeB = parseInt(b.match(/<span class="float-end">(\d+) min<\/span>/)[1]);
                return timeA - timeB;
            });

            systemsHTML = systemsHTMLArray.join('');

            document.getElementById('countAmerica').innerHTML = `<i class="bi bi-person-fill"></i> ${americaCount}`;
            document.getElementById('countEurope').innerHTML = `<i class="bi bi-person-fill"></i> ${europeCount}`;
            document.getElementById('countAsia').innerHTML = `<i class="bi bi-person-fill"></i> ${asiaCount}`;

            const totalPlayers = americaCount + europeCount + asiaCount;
            document.getElementById('countTotal').innerHTML = `<i class="bi bi-person-fill"></i> ${totalPlayers}`;

            document.getElementById('systemsList').innerHTML = systemsHTML;

            saveSelectedModes(savedModes);

        } catch (error) {
            console.error('Error fetching or parsing simstatus.json:', error);
        }
    }

    function saveSelectedModes(savedModes) {
        const modes = [
            document.getElementById('teamMode').checked,
            document.getElementById('survivalMode').checked,
            document.getElementById('deathmatchMode').checked,
            document.getElementById('moddingMode').checked,
            document.getElementById('invasionMode').checked,
            document.getElementById('customMode').checked
        ];

        localStorage.setItem('selectedModes', JSON.stringify(modes));
    }

    function isSelectedMode(mode) {
        const teamMode = document.getElementById('teamMode').checked;
        const survivalMode = document.getElementById('survivalMode').checked;
        const deathmatchMode = document.getElementById('deathmatchMode').checked;
        const moddingMode = document.getElementById('moddingMode').checked;
        const invasionMode = document.getElementById('invasionMode').checked;
        const customMode = document.getElementById('customMode').checked;

        switch (mode) {
            case 'team':
                return teamMode;
            case 'survival':
                return survivalMode;
            case 'deathmatch':
                return deathmatchMode;
            case 'modding':
                return moddingMode;
            case 'invasion':
                return invasionMode;
            case 'custom':
                return customMode;
            default:
                return false;
        }
    }

    fetchDataAndPopulate();
    handleNewServerAlert();

    setInterval(() => {
        fetchDataAndPopulate();
        handleNewServerAlert();
    }, 3000);

    const regionRadios = document.querySelectorAll('input[name="region"]');
    regionRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            localStorage.setItem('selectedRegion', document.querySelector('input[name="region"]:checked').id);
            fetchDataAndPopulate();
        });
    });

    const modeCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    modeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            saveSelectedModes();
            fetchDataAndPopulate();
        });
    });


    let darkTheme = function() {
        return "";
    }

    let electricTheme = function() {
        return "@import url('./themes/electric.css');";
    }

    let caramelBlueTheme = function() {
        return "@import url('./themes/blue.css');";
    }

    let caramelPinkPurpleTheme = function() {
        return "@import url('./themes/pink-purple.css');";
    }

    let caramelPurpleTheme = function() {
        return "@import url('./themes/purple.css');";
    }

    let caramelCaramelTheme = function() {
        return "@import url('./themes/caramel.css');";
    }

    let pixNeonTheme = function() {
        return "@import url('./themes/neon.css');";
    }

    let bhpsngumStarblastTheme = function() {
        return "@import url('./themes/starblast.css');";
    }

    let apathyAsuTheme = function() {
        return "@import url('./themes/asu.css');"
    }

    let beansssEvoTheme = function() {
        return "@import url('./themes/evo.css');"
    }

    let dank1337Theme = function() {
        return "@import url('./themes/1337.css');"
    }

    let mardonMeteorTheme = function() {
        return "@import url('./themes/meteor.css');"
    }

    let HalcyonSunnyTheme = function() {
        return "@import url('./themes/sunny.css');"
    }

    let HalcyonInfraredTheme = function() {
        return "@import url('./themes/infrared.css');"
    }

    let HalcyonUltravioletTheme = function() {
        return "@import url('./themes/ultraviolet.css');"
    }

    let ApathyEpilogueTheme = function() {
        return "@import url('./themes/epilogue.css');"
    }

    let customTheme = function() {
        return window.localStorage.getItem("customTheme");
    }

    let themes = {
        "Electric": electricTheme,
        "Dark": darkTheme,
        "1337": dank1337Theme,
        "Blue by Caramel#8789": caramelBlueTheme,
        "Pink-Purple by Caramel#8789": caramelPinkPurpleTheme,
        "Purple by Caramel#8789": caramelPurpleTheme,
        "Caramel by Caramel#8789": caramelCaramelTheme,
        "Neon by Pix#7008": pixNeonTheme,
        "Starblast by Bhpsngum#2623": bhpsngumStarblastTheme,
        "Asu by apathy#3993": apathyAsuTheme,
        "Lotus by Evo": beansssEvoTheme,
        "Meteor by TheMardon#7986": mardonMeteorTheme,
        "Sunny by Halcyon#2789": HalcyonSunnyTheme,
        "Infrared by Halcyon#2789": HalcyonInfraredTheme,
        "Ultraviolet by Halcyon#2789": HalcyonUltravioletTheme,
        "Epilogue by apathy#3993": ApathyEpilogueTheme,
        "Custom": customTheme
    }

    function applyThemeCSS(css) {
        const styleElement = document.getElementById("customThemeStyle");
        if (styleElement) {
            styleElement.textContent = css;
        } else {
            const newStyleElement = document.createElement('style');
            newStyleElement.id = "customThemeStyle";
            newStyleElement.textContent = css;
            document.head.appendChild(newStyleElement);
        }
    }

    let selectedTheme = window.localStorage.getItem("selectedTheme");
    if (!selectedTheme || selectedTheme === "") {
        selectedTheme = "Electric";
    }

    window.localStorage.setItem("selectedTheme", selectedTheme);
    applyThemeCSS(themes[selectedTheme]());

    document.getElementById("themeSelect").value = selectedTheme;

    let textarea = document.getElementById("themeEditor");
    let editor = CodeMirror.fromTextArea(textarea, {
        mode: "css"
    });

    let savedCSS = window.localStorage.getItem("customTheme");
    if (!savedCSS || savedCSS === "") {
        savedCSS = "// Enter CSS code here to be applied on every page load."
    }

    editor.setValue(savedCSS);
    if (selectedTheme === "Custom") {
        applyThemeCSS(savedCSS);
    }

    let modal = document.getElementById("customThemeModal");
    modal.addEventListener("shown.bs.modal", () => {
        editor.refresh();
        editor.focus();
        editor.setCursor(editor.lineCount(), 0);
    })

    editor.on("change", () => {
        savedCSS = editor.getValue();
        window.localStorage.setItem("customTheme", savedCSS);
        if (selectedTheme === "Custom") {
            applyThemeCSS(savedCSS);
        }
    });

    function initializeThemeSelection() {
        let selectedTheme = window.localStorage.getItem("selectedTheme") || "Electric";
        document.getElementById("themeSelect").value = selectedTheme;
        applyThemeCSS(themes[selectedTheme]());
    }

    document.getElementById("themeSelect").addEventListener("change", (event) => {
        const selectedTheme = event.target.value;
        window.localStorage.setItem("selectedTheme", selectedTheme);
        applyThemeCSS(themes[selectedTheme]());
    });

    document.getElementById("customThemeShow").addEventListener("click", () => {
        document.getElementById("customThemeModal").style.display = "block";
    });

    editor.setOption("theme", "darcula");
    initializeThemeSelection()

    document.getElementById("themeModalCloseButton").addEventListener("click", () => {
        document.getElementById("customThemeModal").style.display = "none";
    });

    const clipboard = new ClipboardJS('#systemCopyLink', {
        text: function(trigger) {
            return document.getElementById('systemReportLink').href;
        }
    });

    clipboard.on('success', function(e) {
        const btn = e.trigger;
        btn.setAttribute('data-bs-original-title', 'Copied!');
        const tooltip = new bootstrap.Tooltip(btn);

        setTimeout(() => tooltip.hide(), 2000);

        e.clearSelection();
    });

    clipboard.on('error', function(e) {
        console.error('Error copying link:', e.action);
    });

    document.getElementById("navbar-button").addEventListener("click", () => {
        const content = document.getElementById('navbarSupportedContent');

        if (content.classList.contains('show')) {
            content.style.height = `${content.scrollHeight}px`;
            content.classList.remove('show');
            content.classList.add('collapsing');

            setTimeout(() => {
                content.style.height = '0';
            }, 10);

            setTimeout(() => {
                content.classList.remove('collapsing');
                content.style.display = 'none';
            }, 350);
        } else {
            content.style.display = 'block';
            content.classList.add('collapsing');

            setTimeout(() => {
                content.style.height = `${content.scrollHeight}px`;
            }, 10);

            setTimeout(() => {
                content.classList.remove('collapsing');
                content.classList.add('show');
                content.style.height = 'auto';
            }, 350);
        }
    });

    function handleNewServerAlert() {
        const systemsListElement = document.getElementById('systemsList');
        const systemCards = systemsListElement.querySelectorAll('.system-card');

        let foundNewServer = false;
        systemCards.forEach(card => {
            const timeText = card.querySelector('.float-end').textContent.trim();
            const time = parseInt(timeText.split(' ')[0]);

            if (time >= 0 && time <= 3) {
                foundNewServer = true;
            }
        });

        const newServerAlertCheckbox = document.getElementById('newServerAlert');

        if (Notification.permission === 'denied') {
            console.log('Notifications are blocked. Please enable them in your browser settings to receive alerts.');
            return;
        }

        if (foundNewServer && newServerAlertCheckbox.checked && !notificationShown) {
            if (Notification.permission !== 'granted') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        createNotification();
                        notificationShown = true;
                        newServerAlertCheckbox.checked = false;
                    }
                });
            } else {
                createNotification();
                notificationShown = true;
                newServerAlertCheckbox.checked = false;
            }
        } else if (!foundNewServer || !newServerAlertCheckbox.checked) {
            notificationShown = false;
        }
    }

    function createNotification() {
        const notification = new Notification("New server detected!", {
            icon: "https://starblast.io/static/img/icon64.png"
        });
    }

    document.getElementById('newServerAlert').addEventListener('change', handleNewServerAlert);
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