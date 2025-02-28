// 游戏配置
const config = {
    gridSize: 20,
    gameSpeed: 100,
    initialSnakeLength: 3,
    initialAISnakeLength: 3  // 添加AI蛇的初始长度
};

// 游戏状态
let snake = [];
let aiSnake = [];  // 添加AI蛇数组
let food = null;
let direction = 'right';
let nextDirection = 'right';
let aiDirection = 'left';  // 添加AI蛇的方向
let score = 0;
let aiScore = 0;  // 添加AI分数
let gameLoop = null;
let gameEndReason = ''; // 添加游戏结束原因

// 获取Canvas上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridWidth = canvas.width / config.gridSize;
const gridHeight = canvas.height / config.gridSize;

// 初始化游戏
function initGame() {
    // 初始化玩家蛇
    snake = [];
    for (let i = config.initialSnakeLength - 1; i >= 0; i--) {
        snake.push({x: i, y: 0});
    }
    
    // 初始化AI蛇
    aiSnake = [];
    for (let i = config.initialAISnakeLength - 1; i >= 0; i--) {
        aiSnake.push({x: gridWidth - 1 - i, y: gridHeight - 1});
    }
    
    // 生成第一个食物
    generateFood();
    
    // 重置分数
    score = 0;
    aiScore = 0;
    updateScore();
    
    // 重置方向
    direction = 'right';
    nextDirection = 'right';
    aiDirection = 'left';
    
    // 隐藏游戏结束界面
    document.getElementById('gameOver').style.display = 'none';
}

// 生成食物
function generateFood() {
    while (true) {
        food = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
        
        // 确保食物不会生成在蛇身上
        let foodOnSnake = false;
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                foodOnSnake = true;
                break;
            }
        }
        
        if (!foodOnSnake) break;
    }
}

// 更新分数显示
function updateScore() {
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('aiScoreValue').textContent = aiScore;
    document.getElementById('finalScore').textContent = `玩家: ${score} | AI: ${aiScore}`;
}

// 碰撞检测
function isCollision(head) {
    // 检查是否撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameEndReason = '玩家撞到了墙壁';
        return true;
    }
    
    // 检查是否撞到自己
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            gameEndReason = '玩家撞到了自己';
            return true;
        }
    }
    
    // 检查是否撞到AI蛇
    for (let part of aiSnake) {
        if (head.x === part.x && head.y === part.y) {
            gameEndReason = '玩家撞到了AI蛇';
            return true;
        }
    }
    
    return false;
}

// AI蛇的移动逻辑
function moveAI() {
    const head = {...aiSnake[0]};
    const dx = food.x - head.x;
    const dy = food.y - head.y;
    
    // 获取所有可能的移动方向
    const possibleDirections = [];
    
    // 检查每个方向是否可行
    if (aiDirection !== 'down') {
        const upHead = {...head, y: head.y - 1};
        if (!isAICollision(upHead)) possibleDirections.push('up');
    }
    if (aiDirection !== 'up') {
        const downHead = {...head, y: head.y + 1};
        if (!isAICollision(downHead)) possibleDirections.push('down');
    }
    if (aiDirection !== 'right') {
        const leftHead = {...head, x: head.x - 1};
        if (!isAICollision(leftHead)) possibleDirections.push('left');
    }
    if (aiDirection !== 'left') {
        const rightHead = {...head, x: head.x + 1};
        if (!isAICollision(rightHead)) possibleDirections.push('right');
    }
    
    // 如果没有可行的方向，游戏结束
    if (possibleDirections.length === 0) {
        gameOver();
        return;
    }
    
    // 选择最优的移动方向
    let bestDirection = aiDirection;
    let minDistance = Infinity;
    
    for (const dir of possibleDirections) {
        const newHead = {...head};
        switch(dir) {
            case 'up': newHead.y--; break;
            case 'down': newHead.y++; break;
            case 'left': newHead.x--; break;
            case 'right': newHead.x++; break;
        }
        
        // 计算到食物的距离
        const distance = Math.abs(food.x - newHead.x) + Math.abs(food.y - newHead.y);
        if (distance < minDistance) {
            minDistance = distance;
            bestDirection = dir;
        }
    }
    
    // 更新AI蛇的方向和位置
    aiDirection = bestDirection;
    const newHead = {...head};
    switch(aiDirection) {
        case 'up': newHead.y--; break;
        case 'down': newHead.y++; break;
        case 'left': newHead.x--; break;
        case 'right': newHead.x++; break;
    }
    
    // 检查新位置是否会导致碰撞
    if (isAICollision(newHead)) {
        gameOver();
        return;
    }
    
    // 移动AI蛇
    aiSnake.unshift(newHead);
    
    // 检查是否吃到食物
    if (newHead.x === food.x && newHead.y === food.y) {
        aiScore += 10;
        updateScore();
        generateFood();
    } else {
        aiSnake.pop();
    }
}

// AI蛇的碰撞检测
function isAICollision(head) {
    // 检查是否撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameEndReason = 'AI撞到了墙壁';
        return true;
    }
    
    // 检查是否撞到自己
    for (let part of aiSnake) {
        if (head.x === part.x && head.y === part.y) {
            gameEndReason = 'AI撞到了自己';
            return true;
        }
    }
    
    // 检查是否撞到玩家蛇
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            gameEndReason = 'AI撞到了玩家蛇';
            return true;
        }
    }
    
    return false;
}

// 修改游戏主循环
function gameStep() {
    // 更新蛇的方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = {...snake[0]};
    
    // 根据方向移动蛇头
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }
    
    // 检查碰撞
    if (isCollision(head)) {
        gameOver();
        return;
    }
    
    // 将新的头部添加到蛇身数组的开头
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 移动AI蛇
    moveAI();
    
    // 绘制游戏画面
    draw();
}

// 修改绘制函数
function draw() {
    // 清空画布
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制玩家蛇
    ctx.fillStyle = '#4CAF50';
    for (let part of snake) {
        ctx.fillRect(
            part.x * config.gridSize,
            part.y * config.gridSize,
            config.gridSize - 1,
            config.gridSize - 1
        );
    }
    
    // 绘制AI蛇
    ctx.fillStyle = '#FF4081';
    for (let part of aiSnake) {
        ctx.fillRect(
            part.x * config.gridSize,
            part.y * config.gridSize,
            config.gridSize - 1,
            config.gridSize - 1
        );
    }
    
    // 绘制食物
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(
        food.x * config.gridSize,
        food.y * config.gridSize,
        config.gridSize - 1,
        config.gridSize - 1
    );
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = `游戏结束原因：${gameEndReason}\n最终分数 - 玩家: ${score} | AI: ${aiScore}`;
}

// 开始游戏
function startGame() {
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    restartGame();
}

// 返回菜单
function backToMenu() {
    document.getElementById('menuContainer').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    if (gameLoop) clearInterval(gameLoop);
}

// 重新开始游戏
function restartGame() {
    initGame();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, config.gameSpeed);
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
});