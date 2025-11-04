# Supabase Edge Function 部署指南

## 前置要求

1. **安装 Supabase CLI**
   ```bash
   # Windows (使用 PowerShell)
   winget install Supabase.CLI
   
   # 或者使用 npm
   npm install -g supabase
   ```

2. **登录 Supabase**
   ```bash
   supabase login
   ```

3. **链接到你的项目**
   ```bash
   supabase link --project-ref ynhdmrhdlsgxnhijsgos
   ```

## 部署 Edge Function

### 方法 1：使用 Supabase CLI（推荐）

```bash
# 部署 Edge Function
supabase functions deploy make-server-66f4da3b

# 或者从项目根目录
supabase functions deploy make-server-66f4da3b --project-ref ynhdmrhdlsgxnhijsgos
```

### 方法 2：使用 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/ynhdmrhdlsgxnhijsgos)
2. 进入 **Edge Functions** 页面
3. 点击 **Create a new function**
4. 函数名称：`make-server-66f4da3b`
5. 复制 `supabase/functions/make-server-66f4da3b/` 目录下的所有文件内容
6. 粘贴到编辑器并部署

## 验证部署

部署成功后，可以通过以下方式验证：

```bash
# 测试健康检查端点
curl https://ynhdmrhdlsgxnhijsgos.supabase.co/functions/v1/make-server-66f4da3b/make-server-66f4da3b/health
```

应该返回：
```json
{"status":"ok"}
```

## 环境变量

Edge Function 会自动使用以下环境变量（由 Supabase 自动提供）：
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

这些变量在部署时会自动设置，无需手动配置。

## 故障排除

### 如果部署失败

1. **检查 Supabase CLI 是否已安装**
   ```bash
   supabase --version
   ```

2. **检查是否已登录**
   ```bash
   supabase projects list
   ```

3. **检查项目链接**
   ```bash
   supabase status
   ```

### 如果 API 返回 404

1. 确认函数名称正确：`make-server-66f4da3b`
2. 确认已成功部署（在 Dashboard 中查看）
3. 检查 URL 格式是否正确

## 部署后的操作

1. **测试 API 端点**
   - 访问前端应用
   - 尝试添加管理员邮箱
   - 检查是否成功

2. **检查日志**
   ```bash
   supabase functions logs make-server-66f4da3b
   ```

3. **更新函数**
   修改代码后，重新运行部署命令即可更新。

## 注意事项

- Edge Function 部署后，需要等待几分钟才能生效
- 如果修改了代码，需要重新部署才能生效
- 确保数据库表 `kv_store_66f4da3b` 已创建（如果不存在，需要在 Supabase Dashboard 中创建）

