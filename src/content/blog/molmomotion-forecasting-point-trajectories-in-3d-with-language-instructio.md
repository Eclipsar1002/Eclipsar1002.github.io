---
title: MolmoMotion Forecasting Point Trajectories in 3D with Language Instructio
description: 给定短的视觉历史，一组3D查询点以及预期目标的语言描述，该模型预测每个点未来的3D轨迹。
pubDate: 2026-11-18T21:45:00+08:00
updatedDate: 2026-11-18T21:45:00+08:00
tags:
  - 3D
  - physics
cover: https://pbs.twimg.com/media/HI-xay9akAAW4OV?format=jpg&name=4096x4096
---

- MolmoMotion-1M是一个大型语料库，描述动作，基于对象的3D点轨迹数据集，由1.16M个无约束视频标注
- PointMotionBch是一个人类验证的基准，涵盖111个对象类别和61种运动类型
- MolmoMotion是一个通用运动预测模型，支持自回归坐标预测和基于流匹配的轨迹生成。

***

MolmoMotion能用不同的语言指令预测不同的运动模式，实验结果表明，学习到的3D运动先验知识很好移植到了后续应用中。

自回归和流匹配
