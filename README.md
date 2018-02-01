# simple-http-proxy

## 简介

一个简单的 HTTP 代理。

使用 Net 模块构建，通过有限状态机解析 HTTP 协议，目前支持 keep-alive、 pipeline

## 用法

修改 HOST PORT 后运行 proxy.js

```bash
$ node proxy.js
```

设置系统代理指向修改的 HOST PORT

浏览网页查看效果。
