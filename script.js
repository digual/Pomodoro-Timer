document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------
    // Default Data and Arrays for Dynamic Options
    // ----------------------------
    const defaultSettings = {
        timerDurations: {
            Pomodoro: 25 * 60,
            'Short Break': 5 * 60,
            'Long Break': 15 * 60,
        },
        background: 'red',
        audio: 'sounds/Odie_times_up.mp3'
    };

    // Dynamic options arrays
    const backgroundOptions = [
        { label: 'Default Red', value: 'red' },
        { label: 'Weird Image', value: 'images/Weird.jpg' }
        // Add more backgrounds here as needed
    ];
    const audioOptions = [
        { label: 'Odie', value: 'sounds/Odie_times_up.mp3' }
        // Add more audio files here as needed
    ];

    // ----------------------------
    // Persistence Helpers
    // ----------------------------
    function loadData(key, defaultValue) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    function saveData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Load persistent data or set defaults
    let users = loadData('users', ['Default User']);
    let tasks = loadData('tasks', []); // Array of tasks: { name }
    let sessionStats = loadData('sessionStats', []); // Array of sessions
    let settings = loadData('settings', defaultSettings);
    let currentUser = loadData('currentUser', 'Default User');

    // ----------------------------
    // Timer Variables and Initialization
    // ----------------------------
    let currentMode = 'Pomodoro';
    let timerDurations = settings.timerDurations;
    let timerRemaining = timerDurations[currentMode];
    let timerInterval = null;
    let isTimerRunning = false;

    // ----------------------------
    // DOM Elements
    // ----------------------------
    const startButton = document.getElementById('start-button');
    const timerDisplay = document.getElementById('timer');
    const tabButtons = document.querySelectorAll('.tab-button');
    const alarmAudio = document.getElementById('alarm-audio');

    // Set alarm audio source from settings
    alarmAudio.src = settings.audio;

    // User Modal Elements
    const userBtn = document.getElementById('user-btn');
    const userModal = document.getElementById('user-modal');
    const closeUserBtn = document.getElementById('close-user');
    const addUserBtn = document.getElementById('add-user-btn');
    const userSelect = document.getElementById('user-select');
    const newUserInput = document.getElementById('new-user-input');

    // Stats Panel Elements
    const statsBtn = document.getElementById('stats-btn');
    const statsPanel = document.getElementById('stats-panel');
    const closeStatsBtn = document.getElementById('close-stats');

    // Settings Modal Elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    const pomodoroInput = document.getElementById('pomodoro-time');
    const shortBreakInput = document.getElementById('short-break-time');
    const longBreakInput = document.getElementById('long-break-time');
    const backgroundSelect = document.getElementById('background-select');
    const audioSelect = document.getElementById('audio-select');

    // Task Elements
    const addTaskBtn = document.getElementById('add-task-button');
    const addTaskForm = document.getElementById('add-task-form');
    const cancelTaskBtn = document.getElementById('cancel-button');
    const saveTaskBtn = document.getElementById('save-button');
    const newTaskInput = document.getElementById('new-task-input');
    const tasksList = document.getElementById('tasks-list');

    // ----------------------------
    // Utility Functions
    // ----------------------------
    function updateTimerDisplay() {
        const minutes = Math.floor(timerRemaining / 60);
        const seconds = timerRemaining % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            timerRemaining--;
            updateTimerDisplay();
            if (timerRemaining <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                timerComplete();
            }
        }, 1000);
    }

    function resetTimer() {
        timerRemaining = timerDurations[currentMode];
        updateTimerDisplay();
    }

    function timerComplete() {
        // Play the selected alarm sound immediately
        alarmAudio.play();
        // Record session stats
        const session = {
            user: currentUser,
            mode: currentMode,
            duration: timerDurations[currentMode],
            task: getCurrentTask(),
            timestamp: new Date().toLocaleString()
        };
        sessionStats.push(session);
        saveData('sessionStats', sessionStats);
        // If the stats panel is open, refresh its content
        if (statsPanel.classList.contains('active')) {
            renderStats();
        }
        resetTimer();
    }

    // For simplicity, return the first task if any or "No Task"
    function getCurrentTask() {
        return tasks.length > 0 ? tasks[0].name : "No Task";
    }

    // ----------------------------
    // Render and Populate Functions
    // ----------------------------
    function renderUsers() {
        userSelect.innerHTML = '';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            if (user === currentUser) {
                option.selected = true;
            }
            userSelect.appendChild(option);
        });
        saveData('users', users);
        saveData('currentUser', currentUser);
    }

    function renderStats() {
        const statsContent = document.getElementById('stats-content');
        statsContent.innerHTML = '';
        const userStats = sessionStats.filter(s => s.user === currentUser);
        if (userStats.length === 0) {
            statsContent.textContent = "No stats available yet.";
            return;
        }
        // Create and populate a table with stats
        const table = document.createElement('table');
        table.style.width = "100%";
        const headerRow = document.createElement('tr');
        ['Mode', 'Duration (min)', 'Task', 'Timestamp'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        userStats.forEach(s => {
            const row = document.createElement('tr');
            ['mode', 'duration', 'task', 'timestamp'].forEach(key => {
                const td = document.createElement('td');
                td.textContent = key === 'duration' ? (s.duration / 60).toFixed(0) : s[key];
                row.appendChild(td);
            });
            table.appendChild(row);
        });
        statsContent.appendChild(table);
    }

    function populateDynamicSelects() {
        // Populate Background Options
        backgroundSelect.innerHTML = '';
        backgroundOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            if (settings.background === option.value) {
                opt.selected = true;
            }
            backgroundSelect.appendChild(opt);
        });
        // Populate Audio Options
        audioSelect.innerHTML = '';
        audioOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            if (settings.audio === option.value) {
                opt.selected = true;
            }
            audioSelect.appendChild(opt);
        });
    }

    // ----------------------------
    // Event Listeners
    // ----------------------------
    // Tab Buttons (Timer Modes)
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMode = this.getAttribute('data-type');
            resetTimer();
        });
    });

    startButton.addEventListener('click', startTimer);

    // User Modal Events
    userBtn.addEventListener('click', () => {
        userModal.style.display = 'flex';
        renderUsers();
    });
    closeUserBtn.addEventListener('click', () => {
        userModal.style.display = 'none';
    });
    addUserBtn.addEventListener('click', () => {
        const newUser = newUserInput.value.trim();
        if (newUser && !users.includes(newUser)) {
            users.push(newUser);
            currentUser = newUser;
            renderUsers();
            newUserInput.value = '';
            userModal.style.display = 'none';
        }
    });
    userSelect.addEventListener('change', function () {
        currentUser = this.value;
        saveData('currentUser', currentUser);
    });

    // Stats Panel Events
    statsBtn.addEventListener('click', () => {
        statsPanel.classList.add('active');
        renderStats();
    });
    closeStatsBtn.addEventListener('click', () => {
        statsPanel.classList.remove('active');
    });

    // Settings Modal Events
    settingsBtn.addEventListener('click', () => {
        // Populate the dynamic selects each time settings open
        populateDynamicSelects();
        // Initialize timer duration inputs from current settings
        pomodoroInput.value = timerDurations.Pomodoro / 60;
        shortBreakInput.value = timerDurations['Short Break'] / 60;
        longBreakInput.value = timerDurations['Long Break'] / 60;
        settingsModal.style.display = 'flex';
    });
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    cancelSettingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    saveSettingsBtn.addEventListener('click', () => {
        // Update timer durations based on input
        const pomVal = parseInt(pomodoroInput.value);
        const shortVal = parseInt(shortBreakInput.value);
        const longVal = parseInt(longBreakInput.value);
        if (!isNaN(pomVal) && pomVal > 0) timerDurations.Pomodoro = pomVal * 60;
        if (!isNaN(shortVal) && shortVal > 0) timerDurations['Short Break'] = shortVal * 60;
        if (!isNaN(longVal) && longVal > 0) timerDurations['Long Break'] = longVal * 60;

        // Save chosen background and update document.body accordingly
        const chosenBg = backgroundSelect.value;
        settings.background = chosenBg;
        if (chosenBg === 'red') {
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '#db524d';
        } else {
            document.body.style.backgroundImage = `url('${chosenBg}')`;
            document.body.style.backgroundColor = 'transparent';
        }

        // Save chosen audio and update alarm audio element
        const chosenAudio = audioSelect.value;
        settings.audio = chosenAudio;
        alarmAudio.src = chosenAudio;

        // Save settings persistently
        settings.timerDurations = timerDurations;
        saveData('settings', settings);
        settingsModal.style.display = 'none';
        resetTimer();
    });

    // Task Form Events
    addTaskBtn.addEventListener('click', () => {
        addTaskForm.style.display = 'block';
    });
    cancelTaskBtn.addEventListener('click', () => {
        addTaskForm.style.display = 'none';
    });
    saveTaskBtn.addEventListener('click', () => {
        const taskName = newTaskInput.value.trim();
        if (taskName) {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.textContent = taskName;
            tasksList.appendChild(taskItem);
            tasks.push({ name: taskName });
            saveData('tasks', tasks);
            newTaskInput.value = '';
            addTaskForm.style.display = 'none';
        }
    });

    // Initial Setup
    renderUsers();
    updateTimerDisplay();
    // Apply saved background setting on load
    if (settings.background === 'red') {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = '#db524d';
    } else {
        document.body.style.backgroundImage = `url('${settings.background}')`;
        document.body.style.backgroundColor = 'transparent';
    }
});
