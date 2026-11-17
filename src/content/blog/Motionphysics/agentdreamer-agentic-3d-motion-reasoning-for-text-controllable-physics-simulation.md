---
title: 关于motionphysics引用和被引的文章以及其他相关工作
description: 一些比较
pubDate: 2026-11-17T20:32:00+08:00
updatedDate: 2026-11-17T20:32:00+08:00
tags:
  - 3D
  - physics
cover: /uploads/ef909c9066033d0e526de12ba840cc0e.jpg
---

**AgentDreamer** Agentic 3D Motion Reasoning for Text-Controllable Physics Simulation

通过智能体生成的3D运动规划实现文本可控物理模拟的框架。

智能体将所需行为转化为参数化运动函数，轨迹为物理优化提供伪监督。引入Motion-IG,通过遮挡式文本恢复来衡量文本与运动之间的对齐程度。

总之，**智能体先生**成显式3D运动计划，再优化模拟去跟踪计划；Motionphysics则依靠材料参数推断和视频扩散运动先验；Physicsflow更偏向光流指导。

![](/uploads/20261117-162918.png)

***

**PhysMAS**的Related Work中提到了Motionphysics,介绍其实现了物理属性推断自动化。

同时提到的还有PhysDreamer、DreamPhysics、OmniPhysGS、PhysSplat 和 PhysGM

对于PhysMAS,主要解决的问题是把场景拆成有持久身份的物体和部件，为不同部件分配材料属性，再编译可执行的MPM模拟，支持异质多部件和多物体交互。

**PhysAgent**侧重于从图像取得物体材料先验，按文字指令自动设置环境力场，再通过模拟结果中的轨迹反馈迭代修正力场。它主要自动调外力/力场，motionphysics主要围绕材料参数和视频运动蒸馏。

他比较了 PhysSplat、DreamPhysics 和 OmniPhysGS

***

PhysDreamer：生成视频提供运动线索，MPM把材料参数转化为运动，再对照视频优化。出发点是视频先验推断材料。侧重于弹性材料估计。

DreamPhysics:同上，但是针对的是怎么从视频扩散模型里提取有用的物理运动先验。侧重于运动蒸馏。

OmniPhysGS：不只调一个参数，而是让局部Gaussian能选择不同本构行为，支持异质材料和材料间交互。侧重于一般材料本构表示。

PhysSplat:快速的自动化物理属性推断系统。用MLLM及学习到的几何分布估计取代昂贵的扩散优化。

PhysGM:一次前向预测场景表示和物理属性，后续再运行MPM。通过大规模训练和DPO，将逐场景优化成本转移到模型训练阶段。
