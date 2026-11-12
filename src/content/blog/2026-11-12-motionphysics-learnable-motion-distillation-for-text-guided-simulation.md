---
title: "MotionPhysics: Learnable Motion Distillation for Text-Guided Simulation"
description: |
  自然语言提示中推断出合理的物理参数，用于指定的3D场景，无需依赖真实轨迹或标注视频的指导。
pubDate: 2026-11-11T21:26:00+08:00
updatedDate: 2026-11-12T20:32:00+08:00
tags:
  - 3D
  - Physics
attachments: []
---
![截图](/uploads/screenshot-1794475129586-9e1fff7f-a408-4fc2-b427-9b03b10402a7.png)

## 期望解决的问题

比如希望一个橡胶材质的小鸟，掉到地上之后弹起来

但是这句话没有直接提供仿真器需要明确的材料类型，密度，杨氏模量等参数。

**目标：三维物体+文字描述——>一组能产生目标运动的材料参数**

得到材料参数交给物理仿真器产生三维运动。

没有真实运动视频作为监督，也不要求回复某个真实物体唯一正确的材料测量值。

## 当前的困难和需要的创新

多模态大模型：根据文字和外观粗略判断材料和参数

视频扩散模型：这种描述通常对应什么运动的先验

可微物理仿真+三维高斯渲染：参数变成运动视频，并把视频误差传回参数

**困难在于：视频模型学到的运动，外观和几何形状混在一起，**优化可能被颜色，纹理或形状差异带偏，无法稳定找到合理材料参数。

### 创新点一：用有范围约束的多模态大模型初始化材料

$$\theta_{\mathrm{ini}}={\text{材料类别 }c,\ \text{密度 }\rho,\ \text{材料系数 }\theta_c}$$

材料类别：弹性体；金属、橡皮泥；沙子；泡沫，流体

行为：变形后恢复；达到条件后永久变形；颗粒堆积、滑落；黏性、流动、压缩等

**把材料手册中的合理数值范围写进提示词模板，限制大模型的初始输出**

>

### 创新点二：Learnable Motion Distillation，LMD

#### 1. 当前参数先产生一段运动

![截图](/uploads/screenshot-1794489188296-24c91fb8-9dc5-4ca9-b60c-83dd0bbbeae7.png "按照当前猜测的材料参数，物体实际上会怎么运动，对应主循环 [ms_simulation_adapted.py (line 662)]")

#### 2. 用冻结的视频模型给出改进方向

![截图](/uploads/screenshot-1794489673239-05ae48bb-8181-4ead-9444-88a20668995f.png "根据视频模型学到的分布，在这段文字条件下，当前视频可以往哪个方向调整，[ms_guidance.py (line 116)]（/video_distillation_MotionPhysics/ms_guidance.py:116) 的编码、加噪声、Transformer 预测和干净潜变量计算")

#### 3. 经过一个可学习的小网络，再比较两者

![截图](/uploads/screenshot-1794490233202-99430ce2-7b38-4c62-9cd1-a4c46cad78b8.png)

#### 4. 计算LMD损失

当前实现使用 Charbonnier 形式：

其中 $\bar M$ 是 EMA 目标网络，$\beta=10^{-3}$。

$$L=\sum_i\left\[\sqrt{(M(z_0)_i-\bar M(\hat z_0)_i)^2+\beta^2}-\beta\right]$$

这里的关键设计是：

* 当前仿真分支保留梯度。
* 去噪目标分支停止梯度。
* 视频大模型被冻结。
* 小型特征网络和材料参数参与更新。

#### 5. 扰动外观和几何，让监督更关注运动

![截图](/uploads/screenshot-1794490737815-dbfa0b12-8575-475f-9904-86cf93f3a096.png)

#### 6. 整个方法怎么实际优化材料参数

完整梯度链是：

$$\frac{\partial L}{\partial\theta}=\frac{\partial L}{\partial I}\frac{\partial I}{\partial G}\frac{\partial G}{\partial\theta}$$

分别表示：

1. 视频应该怎样变，损失才会降低。
2. 三维高斯状态应该怎样变，才能使视频这样变化。
3. 材料参数应该怎样变，才能产生这样的三维运动。

代码中分两部分完成：

接着执行两类更新：

* 用 AdamW 更新小型 

  `SpatialHead`

  。
* 用单独的参数更新函数修改 E、nu 等物理系数。

物理参数更新还包括梯度归一化、对数空间更新和范围限制，对应 \[update_grad.py (line 26)]。

当前材料参数

\    ↓

物理仿真

\    ↓

扰动后的训练渲染

\    ↓

视频编码、加噪声、文本条件去噪

\    ↓

LMD 特征损失

\    ↓

更新运动提取器＋材料参数

\    ↓

重新从初始状态仿真

![截图](/uploads/screenshot-1794491732490-60700203-0c64-4cff-84dc-721cbc333902.png)
