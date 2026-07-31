# 张凯文 × 刘明玥婚礼 Web

移动优先的婚礼 H5，主要面向微信内浏览器，同时兼容 Safari、Chrome 和桌面浏览器。

## 技术结构

- Vue 3 + TypeScript + Vite
- Node.js + Fastify
- MySQL
- Nginx 静态托管与 API 反向代理
- 微信公众号 JS-SDK 分享增强

## 本地开发

要求 Node.js 20.19 或更高版本。

```bash
npm install
cp .env.example .env
npm run dev
```

另开一个终端启动 API：

```bash
npm run dev:server
```

前端开发服务器会将 `/api` 代理至 `http://127.0.0.1:8787`。

## 数据库

先在 MySQL 创建数据库和仅拥有该数据库权限的应用用户，再填写 `.env`。初始化表：

```bash
npm run db:migrate
```

迁移文件位于 `server/migrations/`。

## 环境变量

复制 `.env.example` 后填写服务器配置。真实 `.env` 已被 Git 忽略。

微信公众号 Secret 必须使用重置后的新值，并且只能配置在服务器。AppID 可以公开，但也统一从服务端环境变量读取。

## 验证与构建

```bash
npm run typecheck
npm test
npm run build
```

构建结果：

- 前端：`dist/`
- API：`server/dist/`

## 服务器部署

推荐目录：

```text
/www/wwwroot/wedding.nczkevin.com/dist/   前端构建产物
/www/server/wedding-api/                  API 代码与依赖
/data/wedding/uploads/                    宾客上传照片
/etc/wedding-api.env                      生产环境变量
```

`deploy/nginx.conf` 是宝塔 Nginx 配置参考。API 可以使用：

- `deploy/wedding-api.service`：systemd，Secret 通过 `/etc/wedding-api.env` 注入。
- `deploy/ecosystem.config.cjs`：PM2；需在宝塔 Node 项目中配置环境变量，或在 API 工作目录配置不入库的 `.env`。

部署前执行：

1. 将 `wedding.nczkevin.com` 解析至服务器公网 IP。
2. 在宝塔创建站点并申请 HTTPS 证书。
3. 将公众号域名验证文件放到前端 `dist/` 根目录。
4. 在公众号后台设置 JS 接口安全域名。
5. 如公众号接口要求 IP 白名单，添加服务器出口公网 IP。
6. 设置上传目录所有者为运行 API 的用户，并安排数据库与上传目录的每日异地备份。

## 回执导出

配置 `ADMIN_EXPORT_TOKEN` 后：

```bash
curl -H "Authorization: Bearer $ADMIN_EXPORT_TOKEN" \
  https://wedding.nczkevin.com/api/admin/rsvp.csv \
  -o wedding-rsvp.csv
```

不要把导出 Token 写入前端或仓库。
