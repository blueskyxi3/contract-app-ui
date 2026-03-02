# Contract Assistant

这是一个基于React的Contract Assistant，提供合同管理、上传和审核功能。

## 功能特性

- **合同列表界面**：
  - 提供状态、编号和类型的过滤条件
  - 表格显示合同列表，包含编号、类型、状态、处理日期、审核人和操作列
  - 鼠标悬停在状态上可查看处理日志
  - 提供下载、删除和审核操作按钮

- **合同上传界面**：
  - 文件上传区域（必填）
  - 合同模板选择下拉框
  - 提交和取消按钮

- **审核界面**：
  - 显示合同基本信息和详情
  - 提供审核意见输入区域
  - 通过/拒绝审核按钮

## 技术栈

- React 18
- Material-UI (MUI) - 用于实现Google Material风格设计
- React Router - 用于路由管理
- Axios - 用于API调用（已配置但未实现）

## 安装与运行

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm start
   ```

3. 在浏览器中打开 http://localhost:3000 查看应用

## 项目结构

```
contract-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ContractManagement.js  # 合同管理界面
│   │   ├── ContractUpload.js      # 合同上传界面
│   │   └── ContractReview.js      # 合同审核界面
│   ├── App.js                     # 主应用组件
│   └── index.js                   # 应用入口
├── package.json
└── README.md
```

## 注意事项

- 本应用使用模拟数据，实际使用时需要连接真实的后端API
- API调用部分已预留接口，但未实现具体功能
- 状态使用英文表示：INITIALIZED（初始化）、PROCESSING（处理中）、COMPLETED（已完成）、ERROR（错误）
