# 一步一步创建 HTTPS 服务示例项目

博客原文链接在这里:

- [一步一步创建 HTTPS 服务: 第一部分](http://zili.farbox.com/post/guide/steps-to-create-a-web-service-with-https-1)
- [一步一步创建 HTTPS 服务: 第二部分](http://zili.farbox.com/post/guide/steps-to-create-a-web-service-with-https-2)

## 启动服务端

```bash
npm run server
```

## 运行客户端

使用默认客户端:

```bash
npm run client
```

或使用自定义客户端:

```bash
npm run client 客户端名
```

对应 `ssl/client/` 目录下对应需存在文件:

- `客户端名.key`
- `客户端名.crt`

## 生成客户端证书 CLI **(需要先完成 CA 证书的创建)**

```bash
npm run cert
```
