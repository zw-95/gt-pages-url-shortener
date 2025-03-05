![GitHub License](https://img.shields.io/github/license/nelsontky/gh-pages-url-shortener?label=License&color=blue)
![GitHub Repo stars](https://img.shields.io/github/stars/nelsontky/gh-pages-url-shortener?style=flat&logo=github&label=Stars&color=green)
![Static Badge](https://img.shields.io/badge/Original%20Author-nelsontky-orange?logo=github&link=https%3A%2F%2Fgithub.com%2Fnelsontky%2Fgh-pages-url-shortener)

# 🔗 Gitee Pages URL Shortener

Gitee 短连接，使用gitee issues存储短连接内容，通过对应issues编码重定向到目标链接

修改内容
1. 通过issues标题内容区分目标类型
- url跳转，如果标题为“url”，则取issue内容作为url；或标题符合url的正则。跳转到对应链接
- 非以上情况，在页面展示issue内容，包括，标题、时间、issue发起人名称、正文。支持markdown格式
- 否则展示404页面
2. 优化页面样式