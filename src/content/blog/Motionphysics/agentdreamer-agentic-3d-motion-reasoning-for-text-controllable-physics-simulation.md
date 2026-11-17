---
title: AgentDreamer Agentic 3D Motion Reasoning for Text-Controllable Physics Simulation
description: 一个基于代理引导的优化框架，通过显式的3D运动规划，将文本指令与模拟运动相匹配。
pubDate: 2026-11-17T16:09:00+08:00
updatedDate: 2026-11-17T16:09:00+08:00
tags:
  - 3D
  - physics
cover: /uploads/ef909c9066033d0e526de12ba840cc0e.jpg
---

通过智能体生成的3D运动规划实现文本可控物理模拟的框架。

智能体将所需行为转化为参数化运动函数，轨迹为物理优化提供伪监督。引入Motion-IG,通过遮挡式文本恢复来衡量文本与运动之间的对齐程度。

总之，**智能体先生**成显式3D运动计划，再优化模拟去跟踪计划；Motionphysics则依靠材料参数推断和视频扩散运动先验；Physicsflow更偏向光流指导。

![](/uploads/20261117-162918.png)
