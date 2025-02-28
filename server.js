const express = require('express');
const path = require('path');
const app = express();

// 设置静态文件目录
app.use(express.static(__dirname));

// 设置默认路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 获取端口号，优先使用环境变量中的端口
const PORT = process.env.PORT || 3000;

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});