// Глобальные переменные
let currentUser = null;
let userBalance = 0;
let userAssets = [];
let userTransactions = [];
let activeStakes = [];
let isAuthenticated = false;

// Данные активов с реальными ценами
const assets = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: 'fab fa-bitcoin', color: '#f7931a', price: 43250, change: 2.4, balance: 0 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'fab fa-ethereum', color: '#627eea', price: 2850, change: 1.8, balance: 0 },
    { id: 'bnb', name: 'BNB', symbol: 'BNB', icon: 'fas fa-coins', color: '#f3ba2f', price: 320, change: -0.5, balance: 0 },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA', icon: 'fas fa-coins', color: '#0033ad', price: 0.45, change: 3.2, balance: 0 },
    { id: 'solana', name: 'Solana', symbol: 'SOL', icon: 'fas fa-sun', color: '#00ff88', price: 100, change: 5.1, balance: 0 },
    { id: 'apple', name: 'Apple Inc.', symbol: 'AAPL', icon: 'fas fa-apple-alt', color: '#a2aaad', price: 180, change: 1.2, balance: 0 },
    { id: 'tesla', name: 'Tesla', symbol: 'TSLA', icon: 'fas fa-car', color: '#cc0000', price: 250, change: -2.1, balance: 0 },
    { id: 'google', name: 'Google', symbol: 'GOOGL', icon: 'fab fa-google', color: '#4285f4', price: 140, change: 0.8, balance: 0 },
    { id: 'microsoft', name: 'Microsoft', symbol: 'MSFT', icon: 'fab fa-microsoft', color: '#00a4ef', price: 380, change: 1.5, balance: 0 },
    { id: 'gold', name: 'Gold', symbol: 'XAU', icon: 'fas fa-coins', color: '#ffd700', price: 2000, change: 0.3, balance: 0 },
    { id: 'silver', name: 'Silver', symbol: 'XAG', icon: 'fas fa-coins', color: '#c0c0c0', price: 25, change: -0.2, balance: 0 },
    { id: 'copper', name: 'Copper', symbol: 'XCU', icon: 'fas fa-coins', color: '#b87333', price: 4.5, change: 1.1, balance: 0 }
];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    try {
        // Проверяем авторизацию
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            userBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
            userAssets = JSON.parse(localStorage.getItem('userAssets')) || [];
            userTransactions = JSON.parse(localStorage.getItem('userTransactions')) || [];
            activeStakes = JSON.parse(localStorage.getItem('activeStakes')) || [];
            isAuthenticated = true;
            showApp();
        } else {
            showAuthModal();
        }

        // Инициализация компонентов
        initializeAuth();
        initializeNavigation();
        initializeActions();
        initializePriceUpdates();
        initializeStakeTimers();
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        showAuthModal();
    }
}

// Система авторизации
function initializeAuth() {
    console.log('Инициализация авторизации');
    
    try {
        const authTabs = document.querySelectorAll('.auth-tab');
        const authForms = document.querySelectorAll('.auth-form');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        console.log('Найденные элементы:', {
            authTabs: authTabs.length,
            authForms: authForms.length,
            loginForm: !!loginForm,
            registerForm: !!registerForm
        });

        // Переключение между формами
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                authTabs.forEach(t => t.classList.remove('active'));
                authForms.forEach(f => f.classList.remove('active'));
                
                tab.classList.add('active');
                const targetForm = document.querySelector(`.auth-form[data-tab="${targetTab}"]`);
                if (targetForm) {
                    targetForm.classList.add('active');
                }
            });
        });

        // Обработка регистрации
        if (!registerForm) {
            console.error('Форма регистрации не найдена!');
            return;
        }
        
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Форма регистрации отправлена');
            
            const name = document.getElementById('registerName')?.value || '';
        const email = document.getElementById('registerEmail')?.value || '';
        const password = document.getElementById('registerPassword')?.value || '';
        const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value || '';

        console.log('Данные формы:', { name, email, password: password.length, passwordConfirm: passwordConfirm.length });

        if (!name || !email || !password || !passwordConfirm) {
            showToast('Ошибка', 'Заполните все поля', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            showToast('Ошибка', 'Пароли не совпадают', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Ошибка', 'Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        try {
            // Регистрация пользователя
            currentUser = { name, email, id: Date.now().toString() };
            userBalance = 0;
            userAssets = [];
            userTransactions = [];
            activeStakes = [];
            isAuthenticated = true;

            console.log('Пользователь создан:', currentUser);

            saveUserData();
            showApp();
            showToast('Успешно', 'Регистрация завершена!', 'success');
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            showToast('Ошибка', 'Произошла ошибка при регистрации', 'error');
        }
    });

    // Обработка входа
    if (!loginForm) {
        console.error('Форма входа не найдена!');
        return;
    }
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value || '';
        const password = document.getElementById('loginPassword')?.value || '';

        // Простая проверка (в реальном приложении была бы проверка с сервером)
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.email === email) {
                currentUser = user;
                userBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
                userAssets = JSON.parse(localStorage.getItem('userAssets')) || [];
                userTransactions = JSON.parse(localStorage.getItem('userTransactions')) || [];
                activeStakes = JSON.parse(localStorage.getItem('activeStakes')) || [];
                isAuthenticated = true;
                saveUserData();
                showApp();
                showToast('Успешно', 'Вход выполнен!', 'success');
            } else {
                showToast('Ошибка', 'Неверный email или пароль', 'error');
            }
        } else {
            showToast('Ошибка', 'Пользователь не найден', 'error');
        }
    });
    } catch (error) {
        console.error('Ошибка при инициализации авторизации:', error);
    }
}

function showAuthModal() {
    const authModal = document.getElementById('authModal');
    const appContainer = document.getElementById('appContainer');
    
    if (authModal) authModal.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
}

function showApp() {
    console.log('Показываем приложение');
    const authModal = document.getElementById('authModal');
    const appContainer = document.getElementById('appContainer');
    
    if (authModal) authModal.style.display = 'none';
    if (appContainer) appContainer.style.display = 'block';
    
    // Обновляем данные пользователя
    updateUserInfo();
    updateBalance();
    updateTopAssets();
    updateRecentTransactions();
    updateStats();
}

function saveUserData() {
    try {
        console.log('Сохраняем данные пользователя:', { currentUser, userBalance, userAssets, userTransactions, activeStakes });
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('userBalance', userBalance.toString());
        localStorage.setItem('userAssets', JSON.stringify(userAssets));
        localStorage.setItem('userTransactions', JSON.stringify(userTransactions));
        localStorage.setItem('activeStakes', JSON.stringify(activeStakes));
        console.log('Данные сохранены в localStorage');
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
    }
}

// Обновление информации пользователя
function updateUserInfo() {
    if (currentUser) {
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        }
    }
}

// Обновление баланса
function updateBalance() {
    const totalBalanceEl = document.getElementById('totalBalance');
    const balanceChangeEl = document.getElementById('balanceChange');
    
    if (!totalBalanceEl || !balanceChangeEl) return;
    
    // Рассчитываем общий баланс
    let totalValue = userBalance;
    userAssets.forEach(asset => {
        const assetData = assets.find(a => a.id === asset.id);
        if (assetData) {
            totalValue += asset.balance * assetData.price;
        }
    });

    totalBalanceEl.textContent = `$${formatCurrency(totalValue)}`;
    
    // Рассчитываем изменение (упрощенно)
    const change = totalValue - userBalance;
    const changePercent = userBalance > 0 ? (change / userBalance) * 100 : 0;
    
    if (change >= 0) {
        balanceChangeEl.innerHTML = `<i class="fas fa-arrow-up"></i> +$${formatCurrency(change)} (+${changePercent.toFixed(2)}%)`;
        balanceChangeEl.className = 'balance-change positive';
    } else {
        balanceChangeEl.innerHTML = `<i class="fas fa-arrow-down"></i> -$${formatCurrency(Math.abs(change))} (${changePercent.toFixed(2)}%)`;
        balanceChangeEl.className = 'balance-change negative';
    }
}

// Обновление топ активов
function updateTopAssets() {
    const topAssetsContainer = document.getElementById('topAssets');
    if (!topAssetsContainer) return;

    const userAssetsWithData = userAssets.map(userAsset => {
        const assetData = assets.find(a => a.id === userAsset.id);
        return {
            ...userAsset,
            ...assetData
        };
    }).filter(asset => asset.balance > 0);

    if (userAssetsWithData.length === 0) {
        topAssetsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-coins"></i>
                <p>У вас пока нет активов</p>
                <button class="text-btn" onclick="window.location.href='coins.html'">Купить активы</button>
            </div>
        `;
        return;
    }

    // Показываем топ 4 актива
    const topAssets = userAssetsWithData.slice(0, 4);
    topAssetsContainer.innerHTML = topAssets.map(asset => `
        <div class="asset-item" onclick="openAssetDetails('${asset.id}')">
            <div class="asset-info">
                <div class="asset-icon" style="background: ${asset.color}">
                    <i class="${asset.icon}"></i>
                </div>
                <div class="asset-details">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-balance">${asset.balance.toFixed(8)} ${asset.symbol}</div>
                </div>
            </div>
            <div class="asset-values">
                <div class="asset-price">$${formatCurrency(asset.balance * asset.price)}</div>
                <div class="asset-change ${asset.change >= 0 ? 'positive' : 'negative'}">
                    ${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(1)}%
                </div>
            </div>
        </div>
    `).join('');
}

// Обновление последних транзакций
function updateRecentTransactions() {
    const transactionsContainer = document.getElementById('recentTransactions');
    if (!transactionsContainer) return;

    if (userTransactions.length === 0) {
        transactionsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>История операций пуста</p>
            </div>
        `;
        return;
    }

    const recentTransactions = userTransactions.slice(0, 3);
    transactionsContainer.innerHTML = recentTransactions.map(transaction => `
        <div class="transaction-item" onclick="openTransactionDetails('${transaction.id}')">
            <div class="transaction-icon ${transaction.type}">
                <i class="fas ${getTransactionIcon(transaction.type)}"></i>
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${transaction.title}</div>
                <div class="transaction-time">${formatTime(transaction.timestamp)}</div>
            </div>
            <div class="transaction-amount">
                <div class="amount ${transaction.amount >= 0 ? 'positive' : 'negative'}">
                    ${transaction.amount >= 0 ? '+' : ''}${transaction.amount > 0 ? '$' : ''}${formatTransactionAmount(transaction)}
                </div>
                <div class="amount-usd">${transaction.usdAmount ? '$' + formatCurrency(transaction.usdAmount) : ''}</div>
            </div>
        </div>
    `).join('');
}

// Обновление статистики
function updateStats() {
    const monthlyChangeEl = document.getElementById('monthlyChange');
    const assetsCountEl = document.getElementById('assetsCount');
    const activeStakesEl = document.getElementById('activeStakes');

    if (monthlyChangeEl) {
        const monthlyChange = calculateMonthlyChange();
        monthlyChangeEl.textContent = `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(2)}%`;
        monthlyChangeEl.className = `stat-value ${monthlyChange >= 0 ? 'positive' : 'negative'}`;
    }

    if (assetsCountEl) {
        const assetsCount = userAssets.filter(asset => asset.balance > 0).length;
        assetsCountEl.textContent = assetsCount;
    }

    if (activeStakesEl) {
        const activeStakesCount = activeStakes.filter(stake => !stake.completed).length;
        activeStakesEl.textContent = activeStakesCount;
    }
}

// Навигация
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.dataset.page;
            navigateToPage(page);
        });
    });
}

function navigateToPage(page) {
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Добавляем активный класс к нажатой кнопке
    const activeButton = document.querySelector(`[data-page="${page}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Навигация
    if (page === 'home') {
            window.location.href = 'index.html';
    } else if (page === 'coins') {
        window.location.href = 'coins.html';
    } else if (page === 'portfolio') {
            window.location.href = 'portfolio.html';
    } else if (page === 'settings') {
            window.location.href = 'settings.html';
    }
}

// Действия
function initializeActions() {
    // Обработка текстовых кнопок
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('text-btn')) {
            const action = e.target.textContent;
            handleTextButtonAction(action);
        }
    });

    // Обработка действий с активами
    document.addEventListener('click', (e) => {
        if (e.target.closest('.asset-item')) {
            const assetItem = e.target.closest('.asset-item');
            const assetName = assetItem.querySelector('.asset-name')?.textContent;
            if (assetName) {
            openAssetDetails(assetName);
            }
        }
    });

    // Обработка действий с транзакциями
    document.addEventListener('click', (e) => {
        if (e.target.closest('.transaction-item')) {
            const transactionItem = e.target.closest('.transaction-item');
            const transactionTitle = transactionItem.querySelector('.transaction-title')?.textContent;
            if (transactionTitle) {
            openTransactionDetails(transactionTitle);
            }
        }
    });
}

function handleTextButtonAction(action) {
    switch (action) {
        case 'Все активы':
            window.location.href = 'coins.html';
            break;
        case 'Все операции':
            window.location.href = 'transactions.html';
            break;
        default:
            console.log('Действие:', action);
    }
}

// Модальные окна
function openDepositModal() {
    const modal = document.getElementById('depositModal');
    if (modal) modal.style.display = 'flex';
}

function openWithdrawModal() {
    const modal = document.getElementById('withdrawModal');
    const maxWithdrawEl = document.getElementById('maxWithdraw');
    if (modal) modal.style.display = 'flex';
    if (maxWithdrawEl) maxWithdrawEl.textContent = `$${formatCurrency(userBalance)}`;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Обработка форм
document.addEventListener('DOMContentLoaded', function() {
    // Форма пополнения
    const depositForm = document.getElementById('depositForm');
    if (depositForm) {
        depositForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('depositAmount')?.value || 0);
            
            if (amount > 0) {
                userBalance += amount;
                addTransaction('Пополнение', amount, 'deposit', amount);
                saveUserData();
                updateBalance();
                updateRecentTransactions();
                updateStats();
                closeModal('depositModal');
                showToast('Успешно', `Баланс пополнен на $${formatCurrency(amount)}`, 'success');
                const depositAmount = document.getElementById('depositAmount');
                if (depositAmount) depositAmount.value = '';
            }
        });
    }

    // Форма вывода
    const withdrawForm = document.getElementById('withdrawForm');
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('withdrawAmount')?.value || 0);
            
            if (amount > 0 && amount <= userBalance) {
                userBalance -= amount;
                addTransaction('Вывод средств', -amount, 'withdraw', amount);
                saveUserData();
                updateBalance();
                updateRecentTransactions();
                updateStats();
                closeModal('withdrawModal');
                showToast('Успешно', `Выведено $${formatCurrency(amount)}`, 'success');
                const withdrawAmount = document.getElementById('withdrawAmount');
                if (withdrawAmount) withdrawAmount.value = '';
            } else {
                showToast('Ошибка', 'Недостаточно средств', 'error');
            }
        });
    }
});

// Обновление цен в реальном времени
function initializePriceUpdates() {
    // Обновляем цены каждые 5 секунд
    setInterval(() => {
        try {
        assets.forEach(asset => {
                // Симулируем изменение цены
                const changePercent = (Math.random() - 0.5) * 2; // -1% до +1%
                asset.price *= (1 + changePercent / 100);
                asset.change = changePercent;
            });

            // Обновляем отображение
            updateBalance();
            updateTopAssets();
        } catch (error) {
            console.error('Ошибка при обновлении цен:', error);
        }
    }, 5000);
}

// Стейкинг система
function initializeStakeTimers() {
    // Проверяем активные ставки каждую секунду
    setInterval(() => {
        try {
            activeStakes.forEach((stake, index) => {
                if (!stake.completed && stake.endTime <= Date.now()) {
                    completeStake(index);
                }
            });
        } catch (error) {
            console.error('Ошибка при проверке ставок:', error);
        }
    }, 1000);
}

function placeStake(amount, direction, time) {
    if (amount > userBalance) {
        showToast('Ошибка', 'Недостаточно средств', 'error');
        return;
    }

    const stake = {
        id: Date.now().toString(),
        amount: amount,
        direction: direction,
        time: time,
        startTime: Date.now(),
        endTime: Date.now() + (time * 24 * 60 * 60 * 1000), // время в миллисекундах
        completed: false,
        asset: 'BTC', // упрощенно
        price: assets.find(a => a.id === 'bitcoin')?.price || 43250
    };

    userBalance -= amount;
    activeStakes.push(stake);
    addTransaction('Стейкинг', -amount, 'stake', amount);
    
    saveUserData();
    updateBalance();
    updateRecentTransactions();
    updateStats();
    
    showToast('Успешно', `Ставка размещена на $${formatCurrency(amount)}`, 'success');
    
    // Показываем таймер на странице деталей актива
    if (window.location.pathname.includes('asset-details.html')) {
        showStakeTimer(stake);
    }
}

function completeStake(stakeIndex) {
    const stake = activeStakes[stakeIndex];
    const currentPrice = assets.find(a => a.id === 'bitcoin')?.price || 43250;
    const priceChange = ((currentPrice - stake.price) / stake.price) * 100;
    
    let won = false;
    if (stake.direction === 'up' && priceChange > 0) {
        won = true;
    } else if (stake.direction === 'down' && priceChange < 0) {
        won = true;
    }
    
    const profit = won ? stake.amount * 1.85 : 0; // 85% прибыль при выигрыше
    stake.completed = true;
    stake.result = won ? 'win' : 'lose';
    stake.profit = profit;
    
    if (won) {
        userBalance += stake.amount + profit;
        addTransaction('Выигрыш стейкинга', profit, 'stake', profit);
            } else {
        addTransaction('Проигрыш стейкинга', 0, 'stake', 0);
    }
    
    saveUserData();
    updateBalance();
    updateRecentTransactions();
    updateStats();
    
    showStakeResult(stake);
}

function showStakeTimer(stake) {
    const stakingSection = document.querySelector('.staking-section');
    if (!stakingSection) return;
    
    const timerHtml = `
        <div class="staking-timer" id="stakeTimer-${stake.id}">
            <div class="timer-display" id="timerDisplay-${stake.id}">--:--:--</div>
            <div class="timer-label">Осталось времени</div>
        </div>
    `;
    
    // Вставляем таймер перед кнопкой
    const actionBtn = stakingSection.querySelector('.staking-action-btn');
    if (actionBtn) {
        actionBtn.insertAdjacentHTML('beforebegin', timerHtml);
    }
    
    // Запускаем таймер
    updateStakeTimer(stake.id);
}

function updateStakeTimer(stakeId) {
    const stake = activeStakes.find(s => s.id === stakeId);
    if (!stake || stake.completed) return;
    
    const timerDisplay = document.getElementById(`timerDisplay-${stakeId}`);
    if (!timerDisplay) return;
    
    const timeLeft = stake.endTime - Date.now();
    
    if (timeLeft <= 0) {
        timerDisplay.textContent = '00:00:00';
        return;
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    setTimeout(() => updateStakeTimer(stakeId), 1000);
}

function showStakeResult(stake) {
    const stakingSection = document.querySelector('.staking-section');
    if (!stakingSection) return;
    
    // Удаляем таймер
    const timer = document.getElementById(`stakeTimer-${stake.id}`);
    if (timer) timer.remove();
    
    const resultHtml = `
        <div class="staking-result" id="stakeResult-${stake.id}">
            <div class="result-icon ${stake.result}">
                <i class="fas fa-${stake.result === 'win' ? 'trophy' : 'times-circle'}"></i>
            </div>
            <div class="result-title">${stake.result === 'win' ? 'Победа!' : 'Проигрыш'}</div>
            <div class="result-amount ${stake.result}">
                ${stake.result === 'win' ? `+$${formatCurrency(stake.profit)}` : `-$${formatCurrency(stake.amount)}`}
            </div>
            <button class="staking-action-btn" onclick="removeStakeResult('${stake.id}')">
                Закрыть
            </button>
        </div>
    `;
    
    // Вставляем результат
    const actionBtn = stakingSection.querySelector('.staking-action-btn');
    if (actionBtn) {
        actionBtn.insertAdjacentHTML('beforebegin', resultHtml);
    }
}

function removeStakeResult(stakeId) {
    const result = document.getElementById(`stakeResult-${stakeId}`);
    if (result) {
        result.remove();
    }
}

// Утилиты
function addTransaction(title, amount, type, usdAmount) {
    const transaction = {
        id: Date.now().toString(),
        title: title,
        amount: amount,
        type: type,
        usdAmount: usdAmount,
        timestamp: Date.now()
    };
    
    userTransactions.unshift(transaction);
    
    // Ограничиваем количество транзакций
    if (userTransactions.length > 100) {
        userTransactions = userTransactions.slice(0, 100);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatTransactionAmount(transaction) {
    if (transaction.type === 'buy' || transaction.type === 'sell') {
        return transaction.amount.toFixed(8) + ' BTC';
    }
    return formatCurrency(Math.abs(transaction.amount));
}

function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
        return `${days} дн. назад`;
    } else if (hours > 0) {
        return `${hours} ч. назад`;
    } else if (minutes > 0) {
        return `${minutes} мин. назад`;
    } else {
        return 'Только что';
    }
}

function getTransactionIcon(type) {
    switch (type) {
        case 'buy': return 'fa-arrow-down';
        case 'sell': return 'fa-arrow-up';
        case 'deposit': return 'fa-plus';
        case 'withdraw': return 'fa-minus';
        case 'stake': return 'fa-dice';
        default: return 'fa-exchange-alt';
    }
}

function calculateMonthlyChange() {
    // Упрощенный расчет изменения за месяц
    const monthlyTransactions = userTransactions.filter(t => 
        Date.now() - t.timestamp < 30 * 24 * 60 * 60 * 1000
    );
    
    const totalChange = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
    return userBalance > 0 ? (totalChange / userBalance) * 100 : 0;
}

function openAssetDetails(assetName) {
    const asset = assets.find(a => a.name === assetName);
    if (asset) {
        window.location.href = `asset-details.html?asset=${asset.id}`;
    }
}

function openTransactionDetails(transactionTitle) {
    console.log('Открытие деталей транзакции:', transactionTitle);
    // Здесь можно добавить модальное окно с деталями транзакции
}

// Toast уведомления
function showToast(title, message, type = 'info') {
    try {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            console.error('Контейнер для toast не найден');
            return;
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 
                     type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Автоматически удаляем через 5 секунд
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    } catch (error) {
        console.error('Ошибка при показе toast:', error);
    }
}

// P2P функция
function openP2PModal() {
    showToast('Информация', 'P2P торговля будет доступна в ближайшее время', 'info');
}

// Обработка ошибок
window.addEventListener('error', function (e) {
    console.error('Ошибка в приложении:', e.error);
    showToast('Ошибка', 'Произошла ошибка в приложении', 'error');
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', function (e) {
    console.error('Необработанная ошибка промиса:', e.reason);
    showToast('Ошибка', 'Произошла ошибка в приложении', 'error');
});